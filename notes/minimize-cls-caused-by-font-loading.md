---
pageTitle: 'Minimize CLS caused by font loading'
date: 2024-09-05
tags:
 - notes
---
As you might have noticed, the style of this website is pretty minimal. And because it's so minimal there's not much that could hurt the lighthouse score...or so you'd think. Turns out that the one thing I did do already hurts the score: loading a web font. 

Every once in a while I check the scores of my website to see if things are still working correctly, and I noticed that on mobile the performance score dropped to 97. Although still good, it should be 100 for such a simple layout. The cause of it was the [Cumulative Layout Shift](https://web.dev/articles/cls) (or CLS). The difference between the webfont (Asap) and the fallback font (Arial) caused the layout to shift a bit while loading. In particular the character widths that are different enough to cause the line breaks to be at different places in the paragraphs.

So it's clear what the problem is, but how can we solve it? Well, by creating a new fallback font that has matching character widths. The key however is to use a web-safe font. A web-safe font is a font that's already assumed to be on the majority of users' devices, so there's no need to download the font. The fallback font is nothing more than a tweaked web-safe font. There are several tools available to do this, like [Fallback Font Generator](https://screenspan.net/fallback), but i prefer to use [Automatic font matching](https://deploy-preview-15--upbeat-shirley-608546.netlify.app/perfect-ish-font-fallback/). You just choose your font (make sure to have it installed on your system) and it will automatically generate a fallback font that matches your font as best as possible. 

What's left to do is to add the fallback font to your stylesheet by copying the code given to you, in this case:

``` css
@font-face {
    font-family: 'Asap-fallback';
    size-adjust: 98.3%;
    ascent-override: 91%;
    src: local('Arial');
}
```

and add it as a fallback:

``` css
font-family: Asap, 'Asap-fallback', Arial, sans-serif;
```

To top it all off I added my webfont as a preload as well by adding it to the `<head>` like this:

``` html
<link rel="preload" href="/fonts/Asap-VariableFont_wght.woff2" as="font" type="font/woff2" crossorigin>
```

For more information about this I suggest you read [this short article](https://web.dev/articles/codelab-preload-web-fonts) that goes into the different attributes that are used.

By making these two changes I've improved the performance score in lighthouse back to a nice 100...until they decide to change the metrics again.