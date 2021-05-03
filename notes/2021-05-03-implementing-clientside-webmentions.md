---
pageTitle: 'Implementing clientside webmentions'
date: 2021-05-03
---
I came across webmentions a while ago and I wanted to try it out. If you don't know what a webmention is, [Wikipedia](https://en.wikipedia.org/wiki/Webmention) describes it as follows:

> Webmention enables authors to keep track of who is linking to, referring to, or commenting on their articles. By incorporating such comments from other sites, sites themselves provide federated commenting functionality.

For a static website as the one you're on right now, webmentions enable me to load likes, reposts and replies I get on for example Twitter in the page itself. Now there are several articles about implementing webmentions, but I hit a few bumps in the road while implementing it. I'll try to explain everything step by step in this note so you can avoid those bumps. I used the articles [Using Webmentions in Eleventy](https://mxb.dev/blog/using-webmentions-on-static-sites/) by Max Böck and [Clientside Webmentions](https://www.swyx.io/clientside-webmentions/) by Shawn "swyx" Wang as references.

## Enable webmentions for your website

If you want to include webmentions on your website you'll need a service that collects all the webmentions for you. [Webmention.io](https://webmention.io/) is a service that does that for you for free. To register your website with Webmention.io, your homepage and social media profiles need to link to each other for verification. To do this you need to follow these steps:

1. Add [rel-me](https://indieweb.org/rel-me) links to your homepage for the various ways to reach you. You used to be able to verify via Twitter and Instagram, but for now only GitHub seems to be supported. Make sure the link to your GitHub profile has the `rel`-attribute set to the value `me`, e.g. `<a href="https://github.com/bnijenhuis" rel="me">GitHub</a>`;
2. Every social media profile you linked to must have a link back to your website in your profile. This is used for the verification process;
3. Finally, include `<link rel="authorization_endpoint" href="https://indieauth.com/auth">` on your homepage.

If you have followed these steps you can sign in your website at [Webmention.io](https://webmention.io/). After signing in you will see the supported providers (the social media links you provided with the rel-me attribute) with buttons to verify them. Click on the button of the provider to finalize the verification process. The last thing you have to do to make sure your website can accept webmentions is to add the webmention and pingback metatags to your website. You can find them on the [settings page](https://webmention.io/settings) of Webmention.io after you signed in. These are the tags I use on my website, yours will be similar:

```
<link rel="webmention" href="https://webmention.io/bnijenhuis.nl/webmention" />
<link rel="pingback" href="https://webmention.io/bnijenhuis.nl/xmlrpc" />
```

## Link your social media

Now your website has been registered to collect webmentions, but what you really want is to have them automatically collected from your social media. [Brid.gy](https://webmention.io/) is a service that does that for you, also for free. If you want Bridgy to check your Twitter account for webmentions, you just need to click the Twitter button and authorize Bridgy. It will directly start to analyze your tweets, but you can submit specific tweets as well.

## Load the webmentions on your website

You've now enabled your website for webmentions and linked your social media so the webmentions are automatically collected. Now all you need to do is show them on your website. Webmention.io has an API you can use for this. For my website I'm using two API endpoints, the `count` endpoint and the `mentions` endpoint. 

The `count` endpoint gives a summary of the number of all the webmentions as a total and split up by type of webmentions. This endpoint requires a `target` parameter, which is the full url of the page you want the webmentions of. For instance:

```
<script>
    const postUrl = "http://bnijenhuis.nl/notes/2021-04-30-implementing-clientside-webmentions/";

    fetch("https://webmention.io/api/count?target=" + postUrl)
    .then(response => response.json())
    .then(responseJson => 
        console.log(responseJson) // do whatever you like with it
    );
</script>
```

This will return something like this:

```
{
    "count":17,
    "type":{
        "like":14,
        "mention":1,
        "reply":1,
        "repost":1
    }
}
```

The `mentions` endpoint gives you all the details of the webmentions. This endpoint requires the same `target` parameter as the previous endpoint and can be extended with some parameters for sorting the webmentions. For instance:

```
<script>
    const postUrl = "http://bnijenhuis.nl/notes/2021-04-30-implementing-clientside-webmentions/";

    fetch("https://webmention.io/api/mentions.jf2?target=" + postUrl + "&sort-by=published&sort-dir=up")
    .then(response => response.json())
    .then(responseJson => 
        console.log(responseJson) // do whatever you like with it
    );
</script>
```

This will return something like this (this is an excerpt from some webmentions on my previous post):

```
{
    "type": "feed",
    "name": "Webmentions",
    "children": [{
        "type": "entry",
        "author": {
            "type": "card",
            "name": "Behdad Esfahbod",
            "photo": "https://webmention.io/avatar/pbs.twimg.com/65203a0b3d791846c880319f60dcdb423fc4246ea31f51b82c4ddc6c7819329f.jpg",
            "url": "https://twitter.com/behdadesfahbod"
        },
        "url": "https://twitter.com/bnijenhuis/status/1382593304701833216#favorited-by-15402347",
        "published": null,
        "wm-received": "2021-04-26T21:06:28Z",
        "wm-id": 1133909,
        "wm-source": "https://brid.gy/like/twitter/bnijenhuis/1382593304701833216/15402347",
        "wm-target": "https://bnijenhuis.nl/notes/2021-04-13-how-to-add-self-hosted-variable-fonts-to-your-website/",
        "like-of": "https://bnijenhuis.nl/notes/2021-04-13-how-to-add-self-hosted-variable-fonts-to-your-website/",
        "wm-property": "like-of",
        "wm-private": false
    }, {
        "type": "entry",
        "author": {
            "type": "card",
            "name": "Bram.us",
            "photo": "https://webmention.io/avatar/pbs.twimg.com/2d58128eca8ca19f950d63446a08ff738b7629792495ae912ca559c3b5aa9503.jpg",
            "url": "https://twitter.com/bramusblog"
        },
        "url": "https://twitter.com/bramusblog/status/1386782975006740480",
        "published": "2021-04-26T20:43:21+00:00",
        "wm-received": "2021-04-26T21:08:16Z",
        "wm-id": 1133911,
        "wm-source": "https://brid.gy/comment/twitter/bnijenhuis/1386782265552801801/1386782975006740480",
        "wm-target": "https://bnijenhuis.nl/notes/2021-04-13-how-to-add-self-hosted-variable-fonts-to-your-website/",
        "content": {
            "html": "Cool! 👌\n<a class=\"u-mention\" href=\"https://bnijenhuis.nl/\"></a>\n<a class=\"u-mention\" href=\"https://twitter.com/bnijenhuis\"></a>",
            "text": "Cool! 👌"
        },
        "in-reply-to": "https://bnijenhuis.nl/notes/2021-04-13-how-to-add-self-hosted-variable-fonts-to-your-website/",
        "wm-property": "in-reply-to",
        "wm-private": false
    }]
}
```

And that's it. For a specific (Eleventy) implementation you can find my implementation on [GitHub](https://github.com/bnijenhuis/bnijenhuis-nl/blob/main/_includes/webmentions.liquid). If you have any questions or remarks, please hit me up on [Twitter](https://twitter.com/bnijenhuis/).