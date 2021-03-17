---
pageTitle: 'Collection archive in Eleventy'
date: 2021-03-17
---
When creating collections, like I am with these notes, it's expected to have an index file of all the posts. All my notes are under the `/notes/` url path, but by default the `/notes/` url path itself isn't available. And creating a file in the `notes` folder in the Eleventy project won't fix this, because this will create a new note by itself. 

Luckily it's pretty easy to create such an index file using the `permalink` option in the frontmatter. This option enables you to control the location of the created file. In my case I wanted to create an index file for all my notes, so I created the file [`notes-archive.njk`](https://github.com/bnijenhuis/bnijenhuis-nl/blob/main/notes-archive.njk) in the root directory of my project with the following frontmatter:

```
---
layout: layout.liquid
permalink: /notes/
---
```

As you can see the `permalink` option has the `/notes/` value, which means the file will be created at that url path, instead of the default `/notes-archive/` url path. That's all there is to it to create a basic collection archive or tag page. More information can be found in the [Eleventy documentation](https://www.11ty.dev/docs/quicktips/tag-pages/).