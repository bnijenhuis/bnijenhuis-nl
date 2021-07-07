const version = '-v2';
const coreCacheName = 'core' + version;
const apiCacheName = 'api' + version;
const coreAssets = [
    '/',
    '/css/style.css',
    '/fonts/Asap-Italic-VariableFont_wght.woff2',
    '/fonts/Asap-VariableFont_wght.woff2',
    '/img/bnijenhuis.svg',
    '/favicon.ico',
    '/offline/',
    '/offline.json'
];
const localDomains = [
    'http://bnijenhuis-nl.test',
    'https://bnijenhuis.nl'
]

// install service worker and cache core assets
addEventListener('install', function (event) {
	event.waitUntil(
        caches.open(coreCacheName).then(function (cache) { 
            cache.addAll(coreAssets);
        })
    );
});

// make sure to remove old caches
addEventListener('activate', function (event) {
    event.waitUntil(
        caches.keys().then(function (keys) { 
            return Promise.all(keys
                .filter(key => key !== coreCacheName && key !== apiCacheName)
                .map(key => caches.delete(key))
            )
        })
    )
});

// fetch assets and serve from cache and update cache
addEventListener('fetch', function (event) {

    if (event.request.url.includes('/css/style.css')) {

        // (directly) respond with cached asset (if available)
        event.respondWith(serveFromCache(event, true, false));

        // update cache
        event.waitUntil(updateCache(event.request, coreCacheName));

    } else if (event.request.url.includes('https://webmention.io/api/')) {

        // we want to limit the requests to webmention.io
        // (directly) respond with cached asset (if available)
        event.respondWith(serveFromCache(event, false, true));

    } else {

        // (directly) respond with cached asset (if available)
        event.respondWith(serveFromCache(event, false, false));

        // update cache (only if in core assets)
        var requestUrl = event.request.url;
        for (const localDomain of localDomains) {
            requestUrl = requestUrl.replace(localDomain, '');
        }

        if (coreAssets.includes(requestUrl)) {
            event.waitUntil(updateCache(event.request, coreCacheName));
        }

    }
});

/**
 * serve request from cache
 * if file isn't cached longer than 24 hours, it's still valid
 * @param {Event} event the request event
 * @param {Boolean} ignoreSearch if true, ignore search parameters in request
 * @param {Boolean} checkExpiryHeader if true, check for custom expiry header
 * @return {Object} response object from cache or from fetch
 */
function serveFromCache(event, ignoreSearch, checkExpiryHeader) {

    // set the right match options
    var matchOptions = {};
    if (ignoreSearch) matchOptions = {ignoreSearch:true};

    return caches.match(event.request, matchOptions).then(function (cacheResponse) { 

        // if found return cache
        if (cacheResponse) {
            if (checkExpiryHeader) {
                if (isCacheResponseStillValid(cacheResponse)) {
                    return cacheResponse;
                }
            } else {
                return cacheResponse;
            }
        }
        
        // fetch it again, because cache was not found or was expired
        return fetch(event.request).then(function (response) {

            if (event.request.url.includes('/css/style.css')) {
                updateCache(event.request, coreCacheName);
            } else if (event.request.url.includes('https://webmention.io/api/')) {
                updateCache(event.request, apiCacheName);
            }

            return response;

        // if offline and not found in cache, return offline data
        }).catch(function (error) {

            if (event.request.url.endsWith('/')) {
                return caches.match('/offline/');
            } else if (event.request.url.includes('https://webmention.io/api/')) {
                return caches.match('/offline.json');
            }

        });
    })
}

/**
 * update cache
 * @param {Object} request the event request
 * @param {String} cacheName the cache to update
 * @return {Object} response object
 */
function updateCache(request, cacheName) {
    return caches.open(cacheName).then(function (cache) {
        return fetch(request).then(function (response) {
            
            var responseCopy = response.clone();
            var headers = new Headers(responseCopy.headers);
            headers.append('sw-fetched-on', new Date().getTime());

            var requestKey = request;

            // make sure the request with query params of style.css are not saved as a different asset
            if (request.url.includes('/css/style.css')) {
                requestKey = '/css/style.css';
            }

            return responseCopy.blob().then(function (body) {
                return cache.put(requestKey, new Response(body, {
                    status: responseCopy.status,
                    statusText: responseCopy.statusText,
                    headers: headers
                }));
            });

        });
    });
}

/**
 * check of cacheResponse is still valid
 * if file isn't cached longer than 24 hours, it's still valid
 * @param {Object} cacheResponse the cacheResponse object
 * @return {Boolean} if true, cacheResponse is valid
 */
 function isCacheResponseStillValid(cacheResponse) {
	if (!cacheResponse) {
        return false;
    }
	
    var fetched = cacheResponse.headers.get('sw-fetched-on');
	
    // ms * seconds * minutes * hours
    if (fetched && (parseFloat(fetched) + (1000 * 60 * 60 * 24)) > new Date().getTime()) {
        return true;
    }

	return false;
};
