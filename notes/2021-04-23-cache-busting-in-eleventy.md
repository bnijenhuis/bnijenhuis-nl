---
pageTitle: 'Cache busting in Eleventy'
date: 2021-04-23
---
Because I'm still following my [Unhurried Development](/notes/2021-03-01-unhurried-development/) principle I'm taking small steps and making small changes. That's how I came across an issue with cached assets. A cached CSS file in my case, to be specific. And although it's easy to force reload on desktop browsers, this is a lot harder on mobile devices. Besides, visitors don't know they are using a CSS file that is served from cache, so they only see the changes when the cache expires.

To make sure the file isn't served from the cache, the url of the file needs to change. But I don't want to change the file url manually every time I've changed the file. But you know what automatically changes when changing a file? That's right! The datetime modified of the file itself!

This probably has been done before in Eleventy, so while searching for a solution I came across [a cache busting article for Eleventy](https://rob.cogit8.org/posts/2020-10-28-simple-11ty-cache-busting/) by Rob Hudson. He basically had the same idea as I had and created a filter for Eleventy. But instead of getting the datetime modified of the file, he used the current datetime. This was a good starting point for me, as I'm kinda new to creating filters in Eleventy. So now I had the following filter:

```
eleventyConfig.addFilter("bust", (url) => {
    const [urlPart, paramPart] = url.split("?");
    const params = new URLSearchParams(paramPart || "");
    params.set("v", DateTime.local().toFormat("X"));
    return `${urlPart}?${params}`;
});
```

I could have a unique url for my CSS file by using this filter like so:

```
{% raw %}{{ '/css/style.css' | url | bust }}{% endraw %}
```

which would render into something like this:

```
<link rel="stylesheet" href="/css/style.css?v=1604094309" />
```

The next step was to find a way to get the datetime modified of the file. That's where the [file system module](https://nodejs.org/api/fs.html) comes into play. By using this module I can interact with the file system. To get the datetime modified of a file I needed the `fs.statSync` function which accepts a `path` parameter of the file that you want the statistics of. The `path` to use should be relative though and the `path` given is absolute, so I needed to fix this as well. Furthermore I placed it in a `try catch` block, just in case something goes wrong and it ruins the whole build. 

With all these modifications I ended up with the following filter:

```
const fs = require("fs");

module.exports = function(eleventyConfig) {
    eleventyConfig.addFilter("bust", (url) => {
        const [urlPart, paramPart] = url.split("?");
        const params = new URLSearchParams(paramPart || "");
        const relativeUrl = (urlPart.charAt(0) == "/") ? urlPart.substring(1): urlPart;

        try {

            const fileStats = fs.statSync(relativeUrl);
            const dateTimeModified = new DateTime(fileStats.mtime).toFormat("X");

            params.set("v", dateTimeModified);

        } catch (error) { }
            
        return `${urlPart}?${params}`;
    });
}
```

When using this filter it will:

1. Split up the url on the `?` character, just in case some url parameters were already given;
2. Create a variable with the given url parameters;
3. Make sure the url is relative;
4. Find the file and get the timestamp of the datetime modified;
5. Added the timestamp to the url parameters;
6. Add the new url parameters to the file url.

Now my CSS file url will only update if the CSS file itself has been changed!