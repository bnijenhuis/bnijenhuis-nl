---
pageTitle: 'Adding a favicon in Eleventy'
date: 2021-03-25
aliasUrl: '/notes/2021-03-25-adding-a-favicon-in-eleventy/'
tags:
 - notes
---
I recently stumbled upon an article posted on CSS-Tricks about [How to Favicon in 2021](https://css-tricks.com/how-to-favicon-in-2021/). Usually I would just use whatever [a Favicon Generator](https://realfavicongenerator.net/) would output for me, but it always felt like it returned...well..._a lot_! 

That's great though, because you can serve a favicon on every browser and in every occasion. But, as [the article](https://evilmartians.com/chronicles/how-to-favicon-in-2021-six-files-that-fit-most-needs) the CSS-Tricks article refers to states, not all of them are really needed anymore. For more information on what files are needed and how to create them just read the other two articles. There's no need to explain them here as well.

After creating the correct files, I needed to add them to my Eleventy project. I wanted to have them placed in my root directory when generated, but I want them in a seperate folder in my project. That's where [Passthrough File Copy](https://www.11ty.dev/docs/copy/) comes into play. You can define files and/or folders to passthrough to your generated content.

I've added the following to my [`.eleventy.js` file](https://github.com/bnijenhuis/bnijenhuis-nl/blob/main/.eleventy.js):

``` js
// Copy `img/favicon/` to `_site/`
eleventyConfig.addPassthroughCopy({ "img/favicon": "/" });
```

All it does is get the files from the `img/favicon` folder of my project (where I placed the created favicon files) and pass them through to the root of the generated content. 

This is a basic implementation of this functionality. If you want to learn more implementations and variations of Passthrough File Copy you can read the docs as linked earlier.