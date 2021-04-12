const { DateTime } = require("luxon");
const pluginRss = require("@11ty/eleventy-plugin-rss");

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

    eleventyConfig.addWatchTarget("css/sass/");

    eleventyConfig.addPassthroughCopy({ "css/style*" : "/css/" });

    eleventyConfig.addPassthroughCopy({ "fonts/" : "/fonts/" });

    // Copy `img/favicon/` to `_site/`
    eleventyConfig.addPassthroughCopy({ "img/favicon" : "/" });
};