---
pageTitle: 'Add verified links to your Mastodon profile'
date: 2022-11-21
tags:
 - notes
---
Recently I, among a whole lot of others, revived <a href="https://mastodon.social/@bnijenhuis">my Mastodon account</a> now that a spoiled brat took over Twitter and is currently burning it to the ground. Along with the revival I started searching for the people I'd like to follow and I saw several accounts that had verified links on their profile. Now with Twitter it would be a real hassle to get a verified account (and it got even weirder with paid blue ticks, official ticks, etc.). On Mastodon you don't have verified accounts, but as it turned out you can add verified links to your profile. 

On Mastodon you get 4 fields to add meta data to your profile. You can use it for whatever you'd like, but most people use at least one to add their website. Mastodon even added a block on how you can verify yourself as the owner of the link. All you have to do is add a reference to your Mastodon profile including a `rel="me"` attribute. This can be a link (like I've used on my website), but it can also be a `meta` tag in the `head` of the website, as long it includes the `rel="me"` attribute.

But there is a little catch, and (luckily for me) <a href="https://mastodon.social/@paulvanbuuren/109358870755309347">Paul had the answer</a><sup>[1]</sup>. Do not, I repeat, do not add a trailing slash to your website. For whatever reason it won't verify the link if you add the website to your profile with a trailing slash.

That's it. I couldn't figure this out myself, and I couldn't find any documentation about it. But apparently it works.

---

<sup>[1]</sup> Dutch toot where Paul suggests to remove the trailing slash.