---
pageTitle: 'Implementing Service Workers with limited cache'
date: 2021-07-07
aliasUrl: '/notes/2021-07-07-implementing-service-workers-with-limited-cache/'
tags:
 - notes
---
When I wrote the post about [Implementing clientside webmentions](https://bnijenhuis.nl/notes/2021-05-03-implementing-clientside-webmentions/) a while ago it was mentioned by [Nicolas Hoizey](https://twitter.com/nhoizey/status/1389630177462915081?s=20) that this implementation would result in many requests to [webmention.io](https://webmention.io/). And although that's the result of having a static website with dynamic webmentions, I still wanted to try and optimize this. I was already planning on implementing service workers and this was the perfect use case.

## What are service workers?

I kinda knew what service workers were, but not in detail. But of course there's a lot of information available about this. I watched the [YouTube series by The Net Ninja](https://www.youtube.com/watch?v=hxiggHZOGlQ&list=PL4cUxeGkcC9gTxqJBcDmoi5Q2pzDusSL7&index=6), read [The Offline Cookbook](https://web.dev/offline-cookbook/), [one](https://developers.google.com/web/fundamentals/primers/service-workers/lifecycle) or [two](https://developers.google.com/web/ilt/pwa/lab-caching-files-with-service-worker) articles on Google's developers blog and [documentation on MDN](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers). 

These sources will give you enough information to understand the fundamentals of service workers and what possibilities you're given as a developer.

## What do I want to achieve?

As mentioned earlier the use case was to optimize the webmentions. But I had some other goals as well. The complete list was:

- Serve core assets from service worker for speed purposes;
- Make sure the cached core assets are up to date;
- Cache webmention requests;
- Create an offline fallback when there's no connection.

## Let's do it

The first step is to set up the basics. These are extensively covered in all the documentation, so I won't go too deep into it.

### Setting the variables

``` javascript
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
```

First I've defined some variables that are going to be used in the service worker. A `version` that is used in combination with the two cache names: `coreCacheName` (used for the core assets) and `apiCacheName` (used for the webmention requests). By using a version in the cache names you can remove old cache when you make changes to your service workers, so you can make sure the user has the right cache.

I've also defined a `coreAssets` array with, you guessed it, a list of all the core assets I wanted to cache. It also includes `/offline/` and `/offline.json` which I'm going to explain later in this article.

Lastly I've defined an array of `localDomains` which I'm going to use later for checking what requests to cache.

### Install the service worker

``` javascript
// install service worker and cache core assets
addEventListener('install', function (event) {
	event.waitUntil(
        caches.open(coreCacheName).then(function (cache) { 
            cache.addAll(coreAssets);
        })
    );
});
```

When installing the service worker I immediately make sure that the core assets are cached. Make sure that when using `cache.addAll()` all the assets are available. If one is missing, the service worker will fail to install.

### Activating the service worker

``` javascript
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
```

The `activate` event listener will fire after the installation of the service worker. This also means it's called when the service worker is updated. And the service worker will update itself when something has been changed in it's file.

I want to make sure that old caches are removed when I update the version in the service worker. So in the `activate` event I loop through the available caches and if the cache name does not match with one of the two cache names I've already defined, I will delete this cache.

### Handling the requests

So this is where all the good stuff happens. Every request that is made on the website will go through the `fetch` event. There are some handy tricks I'm using to meet the goals I've set earlier. Let's get into the code.

``` javascript

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
```
To make sure the code is still readable and to not repeat any code, I've moved some functionality to two other functions, `serveFromCache()` and `updateCache()`. I'll go into this later, but let's look at what's happening in this event listener.

First I'm checking which requests are made, because I want to handle some of them differently. If the request is for the CSS file I'll try and serve it from the cache and after the file is served I make sure the cache is updated.

If the request is for the webmentions I'll try and serve it from the cache, but I won't update the cache because I only want to update the cache once a day. More on this later on.

For all the other requests I'll try and serve it from cache, and if it's a core asset I make sure the cache is updated. The request url however contains the domain, so I strip my test domain and my live domain (set in the `localDomains` variable) from the request url to check if it's in my core asset array.

### The `serveFromCache()` function 

``` javascript
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
```

What happens in the `serveFromCache()` function is:

- Matches the request with the cache;
- If the `ignoreSearch` parameter is `true`, it will set these parameters before matching;
- If the `checkExpiryListener` parameter is `true`, and a cached file is found, the custom expiry header is checked;
- If no cached file is found or the cached file has expired, fetch it and save it to the right cache;
- If no cached file is found and the file can't be fetched, return the `offline` page that was cache when installing the service worker. If the request was for webmention.io, return the `offline.json` file.

### The `updateCache()` function 

``` javascript
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
```

What happens in the `updateCache()` function is:

- Open the right cache;
- Fetch the file;
- Add the timestamp as a custom header of the file;
- Cache the file (make sure to cache the CSS file without the query parameters).

### The `isCacheResponseStillValid()` function

``` javascript
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
```

What happens in the `isCacheResponseStillValid()` function is:

- Check if a cache response was found;
- Get the custom header with the timestamp;
- Check if the timestamp is older than a day. If it's not, the cache is valid. If it is, the cache should be updated.

## Some handy tricks

There are some handy tricks I've used in the service worker to reach the goals I've set. 

### Handy trick #1: Ignore query parameters in request

If you've read my note [Cache busting in Eleventy](https://bnijenhuis.nl/notes/2021-04-23-cache-busting-in-eleventy/) you might remember that I'm using a query parameter added to my CSS file, like `/css/style.css?v=1623355015`, to make sure the browser cache won't serve an older version of the stylesheet. This however was causing a problem in combination with the service worker. If you look at the list of core assets I defined earlier, you can see that it contains `/css/style.css`. By default this means the service worker won't recognize the `/css/style.css?v=1623355015` request as cached, because strictly speaking it's another request.

While matching the request to the cached assets it's possible to add extra parameters to ignore these query parameters. So to make sure that the request for `/css/style.css?v=1623355015` will return the cached asset `/css/style.css`, I'm using these parameters as such: `caches.match(event.request, {ignoreSearch:true}})`.

### Handy trick #2: Serve first, update second

To speed up the website I wanted to serve assets from the cache (if available). But I also wanted to make sure the cached assets are up to date. This was relatively easy to implement by using the code on [serviceworke.rs](https://serviceworke.rs/strategy-cache-and-update_service-worker_doc.html). It uses `respondWith()` to immediately serve the request from cache, followed by `waitUntil()` to update the cache in the background. I only want to update the core assets though, so I've added a check for this.

### Handy trick #3: Control the cache expiry

If a service worker caches a file, it's cached. There's no expiry header for these files. But in order to reach my goal of optimizing the requests to webmention.io I wanted to cache these requests for a limited period of time. My plan was to cache the webmention.io request for a day, so if a single user visits an article it will only make this request once a day. 

I found [this Go Make Things article](https://gomakethings.com/how-to-set-an-expiration-date-for-items-in-a-service-worker-cache/) which does exactly that. In short it intercepts the request and adds a header with a timestamp to it before caching it. When fetching a request from the cache it checks this header to see if it's still valid or not.

### Bonus trick: Using service workers on your development environment

For service workers to work an HTTPS connection is required. There is an exception for `http://localhost[:port]` and `http://127.x.y.z[:port]` however, but if you're using custom domains for your development environments (like I am) you can't use service workers. 

Luckily you can change some settings in Chrome and Firefox to enable service workers on HTTP connections. [Stack Overflow](https://stackoverflow.com/questions/34160509/options-for-testing-service-workers-via-http) to the rescue!

## Loading the service worker

It took a bit of diving into the documentation, searching for references and (of course) some trial and error, but eventually I reached all of my goals. Only thing left is to make sure the website loads the service worker. This is pretty straight forward:

``` html
<script>
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js');
    }
</script>
```

The `if` statement is to check if the browser is supporting service workers.

And that's it. The service worker is finished. The website will cache all the core assets when installing the service worker, it will serve from cache if possible, it will update the cache in background and it has a limited cache for certain requests. You can find the complete code on [GitHub](https://github.com/bnijenhuis/bnijenhuis-nl/blob/212750238b0f6dd10e9e61296c00f58c9593046e/sw.js). If you have any questions or remarks, please hit me up on [Twitter](https://twitter.com/bnijenhuis).