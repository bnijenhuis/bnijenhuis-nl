const version = '-v1';
const coreCacheName = 'core' + version;
const apiCacheName = 'api' + version;
const coreAssets = [
    '/css/style.css',
    '/fonts/Asap-Italic-VariableFont_wght.woff2',
    '/fonts/Asap-VariableFont_wght.woff2',
    '/img/bnijenhuis.svg',
    '/favicon.ico',
    '/',
    '/offline/',
    '/offline.json'
];

addEventListener('install', function (event) {
	event.waitUntil(
        caches.open(coreCacheName).then(function (cache) { 
            cache.addAll(coreAssets);
        })
    );
});

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

addEventListener('fetch', function (event) {
    if (event.request.url.includes('/css/style.css')) {

        // if style is requested, ignore url params to match it with cache
        event.respondWith(
            caches.match(event.request, {ignoreSearch:true}).then(function (cacheResponse) { 
                if (cacheResponse) {
                    return cacheResponse;
                }
                return fetch(event.request);
            })
        )

    } else if (event.request.url.includes('https://webmention.io/api/')) {

        // we want to limit the requestst to webmention.io
        event.respondWith(
            caches.match(event.request).then(function (cacheResponse) { 
                if (cacheResponse && isCacheResponseStillValid(cacheResponse)) {
                    return cacheResponse;
                }

                return fetch(event.request).then(function (response) {

                    // cache a copy for offline access
                    var responseCopy = response.clone();
                    event.waitUntil(caches.open(apiCacheName).then(function (cache) {
                        var headers = new Headers(responseCopy.headers);
                        headers.append('sw-fetched-on', new Date().getTime());
                        return responseCopy.blob().then(function (body) {
                            return cache.put(event.request, new Response(body, {
                                status: responseCopy.status,
                                statusText: responseCopy.statusText,
                                headers: headers
                            }));
                        });
                    }));
                    return response;

                }).catch(function (error) {
                    return caches.match(event.request).then(function (cacheResponse) {
                        return cacheResponse || caches.match('/offline.json');
                    });
                });
            })
        )

    } else {

        // serve files from cache of they're available
        event.respondWith(
            caches.match(event.request).then(function (cacheResponse) { 
                if (cacheResponse) {
                    return cacheResponse;
                }
                return fetch(event.request);
            }).catch(function (error) {
                if (event.request.url.endsWith('/')) {
                    return caches.match('/offline/');
                }
            })
        )

    }
});

/**
 * check of cacheResponse is still valid
 * if file isn't cached longer than 24 hours, it's still valid
 * @param {Object} cacheResponse the cacheResponse object
 * @return {Boolean} if true, cacheResponse is valid
 */
 var isCacheResponseStillValid = function (cacheResponse) {
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
