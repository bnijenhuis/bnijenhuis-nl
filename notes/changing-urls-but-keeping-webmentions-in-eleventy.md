---
pageTitle: 'Changing urls but keeping webmentions in Eleventy'
date: 2022-11-03
tags:
 - notes
---
I started out creating these notes with the date in the url, because I thought it was an easy way to keep some overview of my notes. But it turned out to be rather annoying when I was creating new posts. I rarely start and finish a post on the same day, which meant I would have to change the filename multiple times. It also meant that every url was 10 characters longer than it needed to be. So I've decided to change it, because the date will always be in the post itself anyway. Also, [Hidde did it](https://hidde.blog/new-uris/), so it must be the right thing to do ;).

The thing is, I've setup webmentions to add some interaction to my notes (as you can read in my note [Implementing clientside webmentions](/notes/implementing-clientside-webmentions/)). And some of my notes got some decent traction, so I'd like to keep the webmentions I've had thus far, but changing the urls would mean I would lose them. The solution to this was even simpler than I thought when I was looking at the [webmentions API](https://github.com/aaronpk/webmention.io#find-links-to-multiple-pages). Turns out you can request the webmentions for multiple targets at once. 

For example, to get the webmentions of my first note I'm calling this url:

``` html
https://webmention.io/api/mentions.jf2?target=https://bnijenhuis.nl/notes/2021-03-01-unhurried-development/
```

The new url (without the date) would be `https://bnijenhuis.nl/notes/unhurried-development/`, so we need to add this url as a `target` while getting the webmentions (and turn the `target` parameter into an array), which would result in:

``` html
https://webmention.io/api/mentions.jf2?target[]=https://bnijenhuis.nl/notes/2021-03-01-unhurried-development/&target[]=https://bnijenhuis.nl/notes/unhurried-development/
```

## But how do we get the old url?

This too was pretty simple to do in Eleventy. You can define your own frontmatter variables, which means I could define the old url here (I named it `aliasUrl`). For example, the frontmatter of my first note would become:

``` markup
---
pageTitle: 'Unhurried Development'
date: 2021-03-01
aliasUrl: '/notes/2021-03-01-unhurried-development/'
tags:
 - notes
---
```

The webmentions functionality can access this variable and therefor we can add it as a `target`. And that's all there is to it. Add a variable to the frontmatter and use this while getting the webmentions.