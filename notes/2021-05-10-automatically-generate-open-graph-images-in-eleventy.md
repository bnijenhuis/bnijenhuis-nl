---
pageTitle: 'Automatically generate open graph images in Eleventy'
date: 2021-05-10
---
When sharing links on social media, it's nice to have an image instead of just the link. To achieve this you can implement the `og:` meta tags. You can check out the [Open Graph protocol](https://ogp.me/) for more information about all the available tags. To define this image you can use  the `og:image` meta tag. This can be a static image of the logo of your website for example, but for articles it's nicer to have the image contain the title and the date of the article.

Ofcourse you can create these manually, but that's a lot of work. It would be way easier to have them generated automatically whenever you add an article. So let's do this.

## Getting started

While researching implementations of other people I came across the article [11ty: Generate Twitter cards automatically](https://fettblog.eu/11ty-automatic-twitter-cards/) by Stefan Baumgartner which comes awfully close to what I'm trying to achieve. The only thing I want to do differently is that I want to solely rely on Eleventy for this, no other tools. So where he uses Gulp to ultimately generate the `.jpeg` files, I want to use Eleventy for this as well.

What I want to achieve is:

1. Create a SVG for every post;
2. Convert the SVG to a JPEG;
3. Add `meta` tags to website.

## Create a SVG for every post

The advantage of SVG is that you can create an image by code. This makes it perfect to automatically create a base file for the Open Graph image. I have to create this for every single post. To do this we can use the `collections` functionality in Eleventy combined with the `pagination` parameter. Every post is stored in a `collection` in Eleventy and by setting the `pagination` parameter to `1` it will generate a new page for every post.

I created a new file to create the SVG's with the following front matter:
{% raw %}```
---
pagination:
  data: collections.notes
  size: 1
  alias: preview
permalink: "/img/social-preview-images/{{ preview.data.date | postDate }}-{{ preview.data.pageTitle | slug }}-preview.svg"
eleventyExcludeFromCollections: true
---
```{% endraw %}

The `alias` parameter sets the variable name which contains all the information of the post. The `permalink` parameter sets the location to which the posts are saved (the `postDate` filter is a filter that formats the date in a `yyyy-mm-dd` format). And lastly the `eleventyExcludeFromCollections` set to `true` makes sure to not include these files in other collections.

Here's the full file I use to create the SVG's. I'll highlight some items after the code.
{% raw %}```
---
pagination:
  data: collections.notes
  size: 1
  alias: preview
permalink: "/img/social-preview-images/{{ preview.data.date | postDate }}-{{ preview.data.pageTitle | slug }}-preview.svg"
eleventyExcludeFromCollections: true
---
<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg width="1200" height="628" viewBox="0 0 1200 628" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">

    {% set titleInLines = preview.data.pageTitle | splitlines %}
    {% set numberOfLines = titleInLines.length %}
    {% if numberOfLines == 1 %}
        {% set verticalStartingPoint = 340 %}
    {% elseif numberOfLines == 2 %}
        {% set verticalStartingPoint = 290 %}
    {% elseif numberOfLines == 3 %}
        {% set verticalStartingPoint = 250 %}
    {% elseif numberOfLines == 4 %}
        {% set verticalStartingPoint = 210 %}
    {% endif %}

    <rect width="100%" height="100%" fill="white" />

    <text text-anchor="start" font-family="'Giant Head OT', Helvetica, sans-serif" font-size="200">
        <tspan x="80" y="350">bn</tspan>
    </text>

    <line x1="300" y1="80" x2="300" y2="548" stroke="black" />

    <text font-family="Asap, Helvetica, sans-serif" font-size="30">
        <tspan x="350" y="{{verticalStartingPoint - 90}}">{{ preview.date | readablePostDate }}</tspan>
    </text>
    
    <text id="text" font-family="Asap, Helvetica, sans-serif" font-size="80" font-weight="bold">
    {% for line in titleInLines %}
        <tspan x="350" y="{{verticalStartingPoint + loop.index0 * 80}}">{{line}}</tspan>
    {% endfor %}
    </text>

</svg>
```{% endraw %}

### The splitlines filter

Because SVG doesn't support multiline texts we need to do this ourselves. This is a filter I copied from the article I mentioned before. It splits up the given text by words (the page title in this case) and creates an array of lines depending of the maximum size of characters per line (19 in my case).
```
module.exports = function(eleventyConfig) {
    
    eleventyConfig.addFilter('splitlines', function(input) {
        const parts = input.split(' ');
        const lines = parts.reduce(function(prev, current) {

        if (!prev.length) {
            return [current];
        }
        
        let lastOne = prev[prev.length - 1];

        if (lastOne.length + current.length > 19) {
            return [...prev, current];
        }

        prev[prev.length - 1] = lastOne + ' ' + current;

        return prev;
        }, []);

        return lines;
    });

};
```

### Setting the right vertical position per line

I want the text to be centered vertically so I needed to calculate the vertical starting point. Because a title that uses 4 lines has a different starting point than a title that uses just 1 line. This comes down to a bit of trial and error. Just change it and see if it's what you want. 

While looping through the lines I add to the defined starting point to make sure the following line isn't printed directly over the previous line, but it renders below the previous line.

## Convert the SVG to a JPEG

So now that I have the SVG's generated for each post, I need to convert these to JPEG's (because Open Graph doesn't support SVG's in their `image` tag). This is where the Eleventy [Image plugin](https://www.11ty.dev/docs/plugins/image/) comes in to play. This plugin can - among other things - convert images, for instance SVG images to JPEG images.

To convert the SVG's to JPEG's I've added the following code to my `.eleventy.js` file:
```
const fs = require("fs");
const Image = require("@11ty/eleventy-img");

module.exports = function(eleventyConfig) {
    
    eleventyConfig.on('afterBuild', () => {
        const socialPreviewImagesDir = "_site/img/social-preview-images/";
        fs.readdir(socialPreviewImagesDir, function (err, files) {
            if (files.length > 0) {
                files.forEach(function (filename) {
                    if (filename.endsWith(".svg")) {

                        let imageUrl = socialPreviewImagesDir + filename;
                        Image(imageUrl, {
                            formats: ["jpeg"],
                            outputDir: "./" + socialPreviewImagesDir,
                            filenameFormat: function (id, src, width, format, options) {

                                let outputFilename = filename.substring(0, (filename.length-4));
                            
                                return `${outputFilename}.${format}`;

                            }
                        });

                    }
                })
            }
        })
    });

};
```

I'm making use of the [`afterBuild` event](https://www.11ty.dev/docs/events/#afterbuild) of Eleventy. This allows me to parse the generated SVG's and convert them to JPEG's. What happens in the code above is:

- It defines the directory where the SVG images are stored;
- It reads this directory and loop through the files in it using the [`file system` module](https://nodejs.org/api/fs.html);
- It only parses files with an `.svg` extension, because I'm saving the JPEG files in the same folder;
- It uses the Eleventy [Image plugin](https://www.11ty.dev/docs/plugins/image/) to convert the .svg to a .jpg file.

### Using webfonts

You can use webfonts in the SVG's. At first I defined the webfonts in the `<style>` tag in the SVG. This works fine in the SVG, but when I converted it to a JPEG file, it didn't use the defined font. The Image plugin doesn't parse the fonts in the SVG and therefor uses a system font instead. The easiest solution to this is to install the fonts on your system. Now the fonts are parsed correctly when generating the JPEG file.

## Add generated image to `<meta>` tags

Now that I have the generated image, I need to add this to the `<meta>` tags of the page. For now I've only generated these images for my notes, which are the only pages with tags. I've created a default fallback for other pages. This results in the following code:
{%raw%}```
<meta property="og:title" content="{% if page.url == "/" %}Bernard Nijenhuis • Front-end Developer{% else %}{{ pageTitle }}{% endif %}" />
<meta property="og:url" content="{{ page.url }}" />
{% if tags %}
<meta property="og:image" content="https://bnijenhuis.nl/img/social-preview-images/{{ page.date | postDate }}-{{ pageTitle | slug }}-preview.jpeg" />
<meta property="og:image:secure_url" content="https://bnijenhuis.nl/img/social-preview-images/{{ page.date | postDate }}-{{ pageTitle | slug }}-preview.jpeg" />
{% else %}
<meta property="og:image" content="https://bnijenhuis.nl/img/default-preview.jpeg" />
<meta property="og:image:secure_url" content="https://bnijenhuis.nl/img/default-preview.jpeg" />
{% endif %}
```{%endraw%}

I'm setting the `og:title` to the page title, except for the homepage, because I want that to be different. The `og:url` is set to the current url. The `og:image` is set to the generated JPEG file if the page has tags, otherwise it will be the default image I created. Make sure to make this url absolute, or else it won't be parsed correctly.

### Twitter specific `meta` tags

To optimize this for Twitter there are a couple of exta `meta` tags needed. The images that are generated are 1200 pixels wide and 628 pixel high (this is a 16:9 ratio). This is the recommended size for an "Image from a Tweet with shared link" according to [Sprout Social](https://sproutsocial.com/insights/social-media-image-sizes-guide/). 

The specific `meta` tags for Twitter are:
{% raw %}```
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:site" content="@bnijenhuis" />
<meta name="twitter:creator" content="@bnijenhuis" />
```{% endraw %}

The value 'summary_large_image' makes sure the image is displayed above the Twitter card, instead of as a small thumbnail on the left of the card.

## Conclusion

I've now taken all the steps to automatically generate the Open Graph images in Eleventy, without using any external tools. You can find my specific implementation on [GitHub](https://github.com/bnijenhuis/bnijenhuis-nl). If you have any questions or remarks, please hit me up on [Twitter](https://twitter.com/bnijenhuis).