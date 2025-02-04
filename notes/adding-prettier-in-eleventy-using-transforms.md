---
pageTitle: 'Adding Prettier in Eleventy using Transforms'
date: 2025-02-02
tags:
 - notes
---

Recently I decided to look into some functionality in Eleventy I hadn't used before: [Transforms](https://www.11ty.dev/docs/transforms/). According to their website:

<q cite="https://www.11ty.dev/docs/transforms/">Transforms can modify a template’s output. For example, use a transform to format/prettify an HTML file with proper whitespace.</q>

So let's try and use this functionality to have nicely formatted HTML by using [Prettier](https://prettier.io/). Prettier is a code formatter that can be used for a variety of languages and is customizable to your own preferences.

## Added Prettier to the Eleventy config

Before using Prettier in Eleventy it needs to be installed. It's pretty (no pun intended) self-explanatory when visiting their docs: <https://prettier.io/docs/install/>. After installing you'll be able to use it in your Eleventy project. Go to your Eleventy config file and add the require statement for Prettier:

``` js
const prettier = require("prettier"); 
```

Next up, add the transform to the `module.exports` as follows:

``` js
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
```

This code will add the `prettier` transform, which handles all the content. It checks if the output path ends with `.html`, because we only want to format the HTML pages. If it's a HTML page, format the content of the page with whatever [Prettier settings](https://prettier.io/docs/options) you prefer and return the pretty content. For all other content, don't do anything and return it as-is.

The settings I use are:

- [bracketSameLine: true](https://prettier.io/docs/options#bracket-line): 
_Put the > of a multi-line HTML (HTML, JSX, Vue, Angular) element at the end of the last line instead of being alone on the next line (does not apply to self closing elements)._ 
I find it much easier to read when the closing > is on the same line;
- [printWidth: 512](https://prettier.io/docs/options#print-width): 
_Specify the line length that the printer will wrap on._ 
Although they recommend a much lower value than I use, I have some inline SVG's that are much larger. Breaking them up makes it harder to read the code, so I've chosen to use a large value;
- [parser: "html"](https://prettier.io/docs/options#parser): 
_Specify which parser to use._ 
Prettier has a lot of parsers, but because I'm currently only using it to make the HTML pretty I use the "html" parser;
- [tabWidth: 2](https://prettier.io/docs/options#tab-width): 
_Specify the number of spaces per indentation-level._ 
Again, this is just a setting I prefer. I switched between 2 and 4, but I find there's too much white space when using a tab width of 4 spaces. I realise it's set to the default now and I could leave it out, but I might just switch it again later on, so I just leave it in for now.

That's all there is to it. Running your Eleventy build will now have ✨pretty✨ HTML pages!