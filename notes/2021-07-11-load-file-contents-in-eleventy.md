---
pageTitle: 'Load file contents in Eleventy'
date: 2021-07-11
---
At the moment the only image on my website is my logo on the homepage. But since it's an SVG, I decided to load it directly in the HTML. I could just copy the contents of the SVG file and paste it where I wanted it. But if I decide to have the image at several different places, and I make some adjustment to it, I also would have to change it at several different places. 

I don't want to do that, with the risk of forgetting one. So what I want to do is to keep the SVG file, and load the contents of it dynamically. This turned out to be easier than I thought.

``` javascript
const fs = require("fs");

eleventyConfig.addFilter('printFileContents', function(filePath) {
    const relativeFilePath = `.` + filePath;
    const fileContents = fs.readFileSync(relativeFilePath, (err, data) => {
        if (err) throw err;
        return data;
    });
    
    return fileContents.toString('utf8');
});
```

I've created a filter that takes the file path, finds the file, opens it and returns the contents. It requires the [`file system` module](https://nodejs.org/api/fs.html), but I already had this loaded for [automatically generate open graph images](https://bnijenhuis.nl/notes/2021-05-10-automatically-generate-open-graph-images-in-eleventy/) anyway.

To use this filter, just add it like you would use other filters:

{%raw%}```
{{ '/img/bnijenhuis.svg' | printFileContents }}
```{%endraw%}

The result, in this case, is the full SVG code loaded in the HTML.