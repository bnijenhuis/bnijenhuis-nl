---
pageTitle: 'How to add self-hosted variable fonts to your website'
date: 2021-04-13
aliasUrl: '/notes/2021-04-13-how-to-add-self-hosted-variable-fonts-to-your-website/'
tags:
 - notes
---
To give my website a bit more personality I wanted to use a webfont instead of a system font. And because variable fonts are gaining traction I thought I would give it a shot. 

If you're not familiar with variable fonts, I would suggest you read the [Introduction to variable fonts on the web](https://web.dev/variable-fonts/). In short, variable fonts can be described by the following quote from the mentioned article:

> Many font families offer a much wider range of styles, from Thin to Black weights, narrow and wide widths, a variety of stylistic details, and even size-specific designs (optimized for large or small text sizes.) Since you'd have to load a new font file for every style (or combinations of styles), many web developers choose not to use these capabilities, reducing the reading experience of their users.

> ...

> Variable fonts address these challenges, by packing styles into a single file.

There are quite a lot of variable fonts available on [Google Fonts](https://fonts.google.com/?vfonly=true), so there's a lot to choose from these days. When you've made your choice you can download the font family from Google Fonts. By doing this you get the <abbr title="True Type Font">TTF</abbr> file(s) of the variable font. Normally I would run them through [Font Squirrel](https://www.fontsquirrel.com/), [Transfonter](https://transfonter.org/) or some other online tool to create a WOFF2 file that I can use as a webfont. But these tools aren't capable of handling variable fonts.

## So what now?

I decided to drop a message to [Roel Nieskens](https://twitter.com/PixelAmbacht). He's the creator of [Wakamai Fondue](https://wakamaifondue.com/), is a co-author of the aforementioned article, does a lot of stuff that is font related, and he's Dutch...so yeah. He suggested I use a [woff2 tool by Google](https://github.com/google/woff2) to convert the TTF file to WOFF2. I also found [an article by Henry Desroches](https://henry.codes/writing/how-to-convert-variable-ttf-font-files-to-woff2/) describing step by step how to use that same tool. This worked just as described so I really recommend this tool (and article for that matter).

## Filesize

You'd think the filesize of a variable font would be considerably larger because it contains all the styles in one file. And if I compare the size of the variable font file to the size of one of the static font files, there certainly is a difference. For instance, I'm using the [Asap](https://fonts.google.com/specimen/Asap) font family and the filesize of the variable font is 243kb while the filesize of the regular static font file is 148kb. But so is the medium file, the semi bold file, the bold file, etcetera. So all in all the variable font is already relatively small.

When I converted the variable font to a WOFF2 file, the filesize went down to only 56kb. That's pretty small considering it contains all the weights of the font.

## How to implement it

Now that we have the converted variable font, we only need to add it to the stylesheet. It's mostly the same as you would implement a static font. Here is the font-face declaration I use:
``` css
@font-face {
    font-family: Asap;
    src: url('/fonts/Asap-VariableFont_wght.woff2') format('woff2 supports variations'),
         url('/fonts/Asap-VariableFont_wght.woff2') format('woff2-variations');
    font-weight: 400 700;
    font-display: swap;
    font-style: normal;
}
```
If you look at the `src` property you can see I use two types of `format` declarations. The first one is the format that will be the default in the future for all browsers and the second one is the soon to be deprecated format.

You might notice the `font-weight` property is defined by two values. This means that this particular font supports weights between 400 and 700. Some variable fonts also have a `font-stretch` property and you can add this as well. To find out what values you should use with your variable fonts you can upload the font to [Wakamai Fondue](https://wakamaifondue.com/) to get all the specifications of your font.

## Fallbacks

Variable fonts are [pretty well supported](https://caniuse.com/variable-fonts). The nice thing about variable fonts is that it will always provide one style as a built in fallback so it works on non variable fonts supporting systems as a static font. Mostly it will be the regular style, but it can differ per font.

If the regular style is the built in fallback and the browser needs to render a bold text, it might create a faux bold (this depends on the browser). It's not always what you want, but for a fallback it might be enough. If you don't want the browser to create the faux bold you will need to include the static bold font file. Also, when the built in fallback isn't the style you want (because for some obscure reason the fallback style is italic or something), you have to load the static font separately as well. 

For the `Asap` font the built in fallback style is the regular style. So for non supporting browsers declaring only the variable font will result in text rendered in the regular style. If you want the other styles rendered as they're supposed to you'll need the define all the styles first. Then follow up with a `@supports` declaration for the variable font, like below, to load the variable font for supporting browsers:
``` css
@font-face {
    font-family: Asap;
    src: url('/fonts/Asap-Regular.woff2') format('woff2');
    font-weight: normal;
    font-display: swap;
    font-style: normal;
}

@font-face {
    font-family: Asap;
    src: url('/fonts/Asap-Bold.woff2') format('woff2');
    font-weight: bold;
    font-display: swap;
    font-style: normal;
}

@supports (font-variation-settings: normal) {
    @font-face {
        font-family: Asap;
        src: url('/fonts/Asap-VariableFont_wght.woff2') format('woff2 supports variations'),
            url('/fonts/Asap-VariableFont_wght.woff2') format('woff2-variations');
        font-weight: 400 700;
        font-display: swap;
        font-style: normal;
    }
}
```

So that's it. That's all there is to it to implement self-hosted variable fonts to your website.