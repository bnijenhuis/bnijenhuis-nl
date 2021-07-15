---
pageTitle: 'Creating a feed in Eleventy'
date: 2021-04-07
tags:
 - notes
---
With the rise of all the different social media platforms several years ago, <abbr title="Really Simple Syndication">RSS</abbr> was deemed unnecesary. Even Google [discontinued Google Reader](https://googleblog.blogspot.com/2013/03/a-second-spring-of-cleaning.html) in 2013. But with the weird algorithms used in social media, lots of people (well, lots of developers at least) still rely on feeds to have a chronological feed of articles they're interested in.

Eleventy provides a [RSS plugin](https://www.11ty.dev/docs/plugins/rss/) to generate a feed for your Eleventy project. What the RSS plugin _actually_ does is create an Atom feed instead of a RSS feed, but they are basically the same. A quick search led me to [an article by Daniel Miessler](https://danielmiessler.com/blog/atom-rss-why-we-should-just-call-them-feeds-instead-of-rss-feeds/) about the differences between RSS and Atom and why Atom is actually the preferred method. He makes some solid points, and because it agreed with the simplest way for me to add a feed to my website, I chose to listen to him :).

For a minute I considered to create a feed myself without using a plugin, but when I looked at the code of the plugin it was pretty clean already. It already handles things like making sure that urls are absolute and getting the last updated date. It made no sense to do this myself so I followed the steps described on the RSS plugin page to implement a feed on my website. 

One thing I did change though, is the order in which the entries are listed in the feed. In the example given on the plugin page the entries will be sorted from old to new, but I think it makes more sense to have the newest entry first. To do this, I only needed to add `|reverse` to the `for` declaration like this: 
```
{{ "{%- for note in collections.notes|reverse %}" | escape }}
```
So now you're able to [subscribe to my notes](/feed.xml) using your favorite feed reader!