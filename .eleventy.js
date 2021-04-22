const { DateTime } = require("luxon");
const pluginRss = require("@11ty/eleventy-plugin-rss");
const fs = require("fs");

module.exports = function(eleventyConfig) {
    
    eleventyConfig.addPlugin(pluginRss, {
        posthtmlRenderOptions: {
          closingSingleTag: "default" // opt-out of <img/>-style XHTML single tags
        }
    });

    eleventyConfig.addFilter("readablePostDate", (dateObj) => {
        return DateTime.fromJSDate(dateObj, {
            zone: "Europe/Amsterdam",
        }).setLocale('en').toLocaleString(DateTime.DATE_FULL);
    });

    eleventyConfig.addFilter("postDate", (dateObj) => {
        return DateTime.fromJSDate(dateObj, {
            zone: "Europe/Amsterdam",
        }).setLocale('en').toISODate();
    });

    eleventyConfig.addFilter("bust", (url) => {
        const [urlPart, paramPart] = url.split("?");
        const params = new URLSearchParams(paramPart || "");
        const relativeUrl = (url.charAt(0) == "/") ? url.substring(1): url;

        try {

            const fileStats = fs.statSync(relativeUrl);
            const dateTimeModified = new DateTime(fileStats.mtime).toFormat("X");
    
            params.set("v", dateTimeModified);

        } catch (error) { }
            
        return `${urlPart}?${params}`;
    });

    eleventyConfig.addWatchTarget("css/sass/");

    eleventyConfig.addPassthroughCopy({ "css/" : "/css/" });

    eleventyConfig.addPassthroughCopy({ "img/*.*" : "/img/" });

    eleventyConfig.addPassthroughCopy({ "fonts/" : "/fonts/" });

    // Copy `img/favicon/` to `_site/`
    eleventyConfig.addPassthroughCopy({ "img/favicon" : "/" });
};