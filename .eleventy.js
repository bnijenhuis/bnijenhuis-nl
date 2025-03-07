const { DateTime } = require("luxon");
const pluginRss = require("@11ty/eleventy-plugin-rss");
const fs = require("fs");
const Image = require("@11ty/eleventy-img");
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const prettier = require("prettier");

module.exports = function (eleventyConfig) {

    eleventyConfig.addPlugin(pluginRss, {
        posthtmlRenderOptions: {
            closingSingleTag: "default" // opt-out of <img/>-style XHTML single tags
        }
    });

    eleventyConfig.addPlugin(syntaxHighlight, {
        init: function ({ Prism }) {
            Prism.languages.terminal = Prism.languages.extend('markup', {});
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
        const relativeUrl = (urlPart.charAt(0) == "/") ? urlPart.substring(1) : urlPart;

        try {

            const fileStats = fs.statSync(relativeUrl);
            const dateTimeModified = new DateTime(fileStats.mtime).toFormat("X");

            params.set("v", dateTimeModified);

        } catch (error) { }

        return `${urlPart}?${params}`;
    });

    eleventyConfig.addFilter('splitlines', function (input) {
        const parts = input.split(' ');
        const lines = parts.reduce(function (prev, current) {

            if (!prev.length) {
                return [current];
            }

            let lastOne = prev[prev.length - 1];

            if (lastOne.length + current.length > 19) {
                return [...prev, current];
            }

            prev[prev.length - 1] = lastOne + ' ' + current;

            return prev;
        }, []);

        return lines;
    });

    eleventyConfig.addFilter('printFileContents', function (filePath) {
        const relativeFilePath = `.` + filePath;
        const fileContents = fs.readFileSync(relativeFilePath, (err, data) => {
            if (err) throw err;
            return data;
        });

        return fileContents.toString('utf8');
    });

    eleventyConfig.addWatchTarget("css/sass/");

    eleventyConfig.addPassthroughCopy({ "css/": "/css/" });

    eleventyConfig.addPassthroughCopy({ "img/*.*": "/img/" });

    eleventyConfig.addPassthroughCopy({ "js/": "/js/" });

    eleventyConfig.addPassthroughCopy({ "fonts/": "/fonts/" });

    // Copy `img/favicon/` to `_site/`
    eleventyConfig.addPassthroughCopy({ "img/favicon": "/" });

    eleventyConfig.addPassthroughCopy({ "sw.js": "/sw.js" });

    eleventyConfig.addPassthroughCopy({ "offline.json": "/offline.json" });

    eleventyConfig.addTransform("prettier", function (content) {
        if ((this.page.outputPath || "").endsWith(".html")) {

            let prettified = prettier.format(content, {
                bracketSameLine: true,
                printWidth: 512,
                parser: "html",
                tabWidth: 2
            });
            return prettified;
        }

        // If not an HTML output, return content as-is
        return content;
    });

    eleventyConfig.on('afterBuild', () => {
        const socialPreviewImagesDir = "_site/img/social-preview-images/";
        fs.readdir(socialPreviewImagesDir, function (err, files) {
            if (files.length > 0) {
                files.forEach(function (filename) {
                    if (filename.endsWith(".svg")) {

                        let imageUrl = socialPreviewImagesDir + filename;
                        Image(imageUrl, {
                            formats: ["jpeg"],
                            outputDir: "./" + socialPreviewImagesDir,
                            filenameFormat: function (id, src, width, format, options) {

                                let outputFilename = filename.substring(0, (filename.length - 4));

                                return `${outputFilename}.${format}`;

                            }
                        });

                    }
                })
            }
        })
    });

};