---
pageTitle: 'Dates in Eleventy'
date: 2021-03-09
tags:
 - notes
---
When writing notes it's important to add a date to them. Even if it's just for your own use, it can be really helpful for future you to directly see how recent and relevant the note is. Because in the ever changing world of front-end development just a year can make a real difference. 

Seeing how many starter blogs are available for Eleventy, I thought the date support would be baked in. And to be fair, it _kinda_ is, but when you want to control the format you need to do a little extra. And when I say a little, it really is a little. A great website for Eleventy related resources is [11ty.rocks](https://11ty.rocks/), and they have [an article about dates](https://11ty.rocks/eleventyjs/dates/) as well.

I wanted to use a different formatting than described in that article, but a quick search for Luxon date formatting led to the documentation. So I created the [.eleventy.js file](https://www.11ty.dev/docs/config/) and created the following filters:

``` js
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
```

The readablePostDate filter creates a date like `March 9, 2021`, and the postDate filter creates a date like `2021-03-09`, which is used in the [`time` element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/time) on the homepage and the note itself.