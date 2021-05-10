---
pageTitle: 'Collection archive in Eleventy'
date: 2021-03-17
---
When creating collections, like I am with these notes, it's expected to have an index file of all the posts. All my notes are under the `/notes/` url path, but by default the `/notes/` url path itself isn't available. ~~And creating a file in the `notes` folder in the Eleventy project won't fix this, because this will create a new note by itself.~~ [Nicolas Hoizey pointed out on Twitter](https://twitter.com/nhoizey/status/1372321929873518592) that it <em>is</em> possible, more on that at the end of this note.

Luckily it's pretty easy to create such an index file using the `permalink` option in the frontmatter. This option enables you to control the location of the created file. In my case I wanted to create an index file for all my notes, so I created the file [`notes-archive.njk`](https://github.com/bnijenhuis/bnijenhuis-nl/blob/main/notes-archive.njk) in the root directory of my project with the following frontmatter:

``` html
---
layout: layout.liquid
permalink: /notes/
---
```

As you can see the `permalink` option has the `/notes/` value, which means the file will be created at that url path, instead of the default `/notes-archive/` url path. That's all there is to it to create a basic collection archive or tag page. More information can be found in the [Eleventy documentation](https://www.11ty.dev/docs/quicktips/tag-pages/).

## Update March 18, 2021

As I mentioned earlier, it has been brought to my attention that it is possible to create an index file in the `/notes/` folder. To make this work you have to use the `eleventyExcludeFromCollections` option in the frontmatter and set this to `true`, like this:

``` html
---
layout: layout.liquid
eleventyExcludeFromCollections: true
---
```

The option is pretty self explanatory. If you add this to the frontmatter and set it to `true`, it won't be added to the collection. I think this is a better solution, because the structuring of the files in your project is much more logical. So both methods work, but I would suggest using this last method.
