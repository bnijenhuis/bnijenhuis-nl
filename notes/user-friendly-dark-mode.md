---
pageTitle: 'User friendly dark mode'
date: 2024-10-14
tags:
 - notes
---
This website is implemented with a very minimal style, with black text on a white background. High contrast, easy to read, no distractions. But opening the website when you're in a darker environment is like accidentally turning on a flashlight right in your face. Let's do something about this.

## Preferred color scheme

I'm sure you've heard of dark mode before, and a lot of websites have implemented functionality to switch between dark mode and light mode. But before we dive into that functionality, let's handle the system settings first. A user can set their preference for a dark or light mode in their operating system. This affects, among many other things, how the browser UI is shown. We can tap into this preference in CSS via the [preferred color scheme](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme) media query. To do this we need to define some default colors as [CSS variables](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties) and override these colors with the media query. Most of the time developers use the light mode of the website as the default style and overwrite these values for users that prefer a dark color scheme. So for this website the implementation would be something like the following:

``` css
:root {
    --text-color: black;
    --bg-color: white;
}

@media (prefers-color-scheme: dark) {
    :root {
        --text-color: white;
        --bg-color: black;
    }
}

html {
    color: var(--text-color);
    background-color: var(--bg-color);
    color-scheme: light dark;
}

```

I've added the [color-scheme property](https://developer.mozilla.org/en-US/docs/Web/CSS/color-scheme) to the html selector as well, which indicates that the website supports both light and dark mode. This will change the default colors of interaction UI, form controls and some other things. So if there's no style provided for those specific elements, the color-scheme property will handle these nicely for light and dark mode.

## Let the user choose

Even though we're respecting the system settings now, there's no way for the user to set the preference for this website alone. The user might have their system set to dark mode, but might prefer your website in light mode. Or the other way around. 

To provide this service to the user, we need to cater for 3 states:

- System preference;
- Dark mode;
- Light mode.

### Determine the markup

The best implementation would be a tri-state button, but unfortunately there's no such thing. Using radio buttons would be a nice solution, but as Hidde de Vries mentioned in his [dark mode article](https://hidde.blog/dark-light/) that isn't really intuitive for keyboard users (and I agree). So what then?

There are a lot of different implementations, and all of them have their own pros and cons, but I'm going for a button implementation. I don't want 1 toggle button, because I want the 3 options mentioned above and not just a toggle between dark and light mode. Thse buttons need to be grouped together, so to do this we need to add a `fieldset` around them with a `legend` to label the group. Combined with the [`aria-pressed` attribute](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-pressed) to indicate which button is selected, we get something like this:

``` html
<div class="themes" hidden>
    <fieldset>
        <legend>Themes</legend>
        <button aria-pressed="false" data-theme="system">System preference</button>
        <button aria-pressed="false" data-theme="light">Light mode</button>
        <button aria-pressed="false" data-theme="dark">Dark mode</button>
    </fieldset>
</div>
```

Now because this functionality will only work with JavaScript, we have to show this only when JavaScript is enabled. That's why I've added a `div` with the `hidden` attribute so it's hidden by default, and using JavaScript we're going to remove that `hidden` attribute. Another way would be to add all the HTML via JavaScript, but I find this way a bit more maintainable and readable.

### Adding the functionality

There will be a few steps that need to be done to complete the functionality:

- Show markup of the functionality;
- Handle selected theme.

#### Show markup of the functionality

As I've mentioned before, I've hidden the markup by default, so we need to show this first by removing the `hidden` attribute:

``` javascript
document.querySelector('.themes').removeAttribute('hidden');
```

#### Handle selected theme

Now that the markup is visible we can handle the buttons. We're going to save the selected theme in `localStorage`, make sure the clicked button is selected while the other buttons are not and add a class to the `<html>` for the selected theme while removing any other themes from the `<html>` classes. The code for all of this will be something like this (with comments to explain):

``` javascript
// get the selected theme from localStorage and fallback to system
let theme = (localStorage.getItem('theme')) ? localStorage.getItem('theme'): 'system';

// set selected button
document.querySelector('.themes button[data-theme="' + theme + '"]').setAttribute('aria-pressed', 'true');

// get theme buttons
let themeButtons = document.querySelectorAll('.themes button');

// handle click on button
themeButtons.forEach((themeButton) => {
    themeButton.addEventListener('click', (event) => {

        // get selected theme
        let selectedTheme = themeButton.getAttribute('data-theme');

        // save selected theme to localStorage
        localStorage.setItem('theme', selectedTheme);
        
        // add pressed state to button
        themeButton.setAttribute('aria-pressed', 'true');

        // add class to html so we can handle theme in css
        document.querySelector('html').classList.add('theme-' + selectedTheme);

        // make sure other buttons and themes aren't selected
        themeButtons.forEach((otherThemeButton) => {

            // button does not match selected button
            if (themeButton != otherThemeButton) {
            
                // remove pressed state of button
                otherThemeButton.setAttribute('aria-pressed', 'false');

                // remove possible themes from html
                document.querySelector('html').classList.remove('theme-' + otherThemeButton.getAttribute('data-theme'));
                
            }

        });
    });
});
```

What's left is to handle the selected theme on pageload. We've already checked `localStorage` for the saved theme in the code we just wrote, and we already add the theme class to the `<html>` when we click one of the buttons, but we're not setting the right theme on pageload yet. So we need these two lines of code we wrote earlier:

``` javascript 
let theme = (localStorage.getItem('theme')) ? localStorage.getItem('theme'): 'system';
document.querySelector('html').classList.add('theme-' + theme);
```

Make sure to place these two lines in a `<script>` block in the `<head>`, right before loading the stylesheet to prevent flickering. Because if you do it later on, the style is loaded first, you then change the theme, which might cause a change from light to dark mode (or the other way around).

## Don't forget the favicon

If the user has their operating system preferences set to dark mode, the browser UI will be dark. If your favicon happens to be dark as well, it could be that it's not recognizable anymore (which is the whole point of the favicon). There is a solution for that (well, for most browsers, that is): [SVG favicons](https://caniuse.com/link-icon-svg). Because SVG favicons can contain CSS and, more importantly, media queries, which allows us to do something similar to what we did earlier to handle the operating system preference in our website. Together with the code of the SVG, we get something like this:

``` xml
<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
	<style>
		path { fill: #000000; }
    	@media (prefers-color-scheme: dark) {
			path { fill: #ffffff; }
    	}
	</style>
	<path d="M5.714 44.034c-.99-.849-.99-3.82.283-8.772 1.274-4.951 2.547-8.347 4.103-9.903.99-.99 3.537-1.556 7.782-1.556 7.498 0 12.591.848 15.42 2.405.991.707 1.557 3.537 1.557 8.347 0 1.415 0 3.254-.141 5.66-.142 2.404-.142 4.244-.142 5.517 0 1.273.142 2.122.283 2.405.283.283.99.142 2.264-.424 1.132-.566 2.83-1.274 4.952-1.981 2.122-.707 4.385-.99 6.65-.707 4.95.565 8.77 3.395 11.459 8.488 2.547 5.094 3.82 11.743 3.82 19.808 0 2.688-.141 4.81-.283 6.225-.707 6.932-2.688 12.591-5.942 16.977-3.396 4.386-7.64 6.791-12.875 7.499l-3.254.141c-2.264 0-4.386-.283-6.508-.707-2.122-.566-3.82-1.132-5.376-1.84-1.698-.707-2.405-.99-2.547-.99-.99-.424-1.98-.707-2.97-.566-.991.142-1.84.708-2.548 1.981-.424.99-2.546 1.132-6.083.283-3.679-.707-5.8-1.556-6.225-2.688-.142-.283-.283-1.556-.283-3.962 0-3.112.141-8.488.566-16.27.283-7.781.566-14.572.707-20.656.142-5.942.142-9.196 0-9.904-.141-.565-.283-1.131-.707-1.697l-1.132-1.132c-.283-.283-.85-.708-1.556-1.132-.708-.424-1.132-.707-1.274-.849zm27.589 37.21c2.405.424 4.244.14 6.225-.85 1.415-.99 2.83-2.263 3.678-4.102 1.415-3.679.566-6.367-2.83-7.923-.848-.425-1.838-.566-2.829-.142-1.415.425-2.263 2.688-3.254 6.65-1.415 3.961-1.415 6.083-.99 6.366z" />
	<path d="M61.174 84.356c.708-.707 1.698-1.273 3.254-1.698 1.415-.424 2.264-1.132 2.406-1.839.141-.849.424-1.84.707-3.113.141-1.131.283-1.98.424-2.688.142-.566.283-1.273.425-2.122.141-.707.141-1.415.283-1.84v-1.414c-.142-.424-.142-.849-.283-1.132-.142-.283-.283-.566-.566-.707-.566-.425-1.415-.85-2.405-1.274-.99-.424-1.84-.848-2.264-1.273-.424-.283-.849-.849-1.273-1.698-.425-.707-.566-1.697-.566-2.97 0-2.83.566-6.084 1.556-9.621.99-3.537 2.264-5.801 3.679-6.791 1.131-.708 3.961-1.132 8.63-1.132 7.781 0 12.309.707 13.299 1.98.566.85.707 3.113.424 6.65-.141 1.556.142 2.405.708 2.264.566-.142 1.273-.708 2.264-1.98.99-1.274 2.263-2.548 4.102-3.962 1.84-1.415 3.82-2.406 6.226-2.971 1.697-.425 2.97-.566 3.82-.566 3.537 0 6.79 1.273 9.479 3.82 2.688 2.546 4.244 6.083 4.669 10.47a32.94 32.94 0 01-.566 9.761c-.708 3.537-1.415 6.225-1.981 8.348-.566 2.122-.566 3.678-.142 4.527.283.424 1.132 1.132 2.406 1.98 1.273.85 2.263 1.698 2.688 2.689.707 1.273.424 3.82-.566 7.64-1.132 3.961-2.405 6.65-3.679 7.923-1.273 1.273-4.951 1.98-11.035 1.98-8.206 0-10.611-.849-11.177-2.546-.424-1.415-.566-5.235-.566-11.319 0-2.405 0-5.8.142-10.045v-7.781c0-.99-2.264-1.274-2.83-.85-.707.425-1.273 1.699-1.556 3.538-.142 2.122-.283 4.81-.142 8.064.142 3.254 0 6.933-.141 10.611-.142 3.82-.566 6.367-1.274 7.357-1.131 2.122-5.942 3.113-14.29 3.113-5.517 0-9.054-.566-10.327-1.84-1.273-1.131-2.547-4.102-3.82-8.913-1.132-4.669-1.132-7.64-.142-8.63z" />
</svg>
```

This will set the `fill` of the `path` to black, but if the user prefers a dark color scheme (and thus has a dark browser UI) it changes the `fill` of the `path` to white.

## Finetuning contrast colors

Lastly I've changed the color codes for black and white on this website to be a little easier on the eyes. I'm not a designer (no shit), but [this comment on StackExchange](https://graphicdesign.stackexchange.com/a/25360) sums it up pretty well with multiple references (if you're interested). In short it states that although high contrast is good, too high of a contrast could be straining on the eyes. So for dark mode I've changed the black to `#1f2020` and the white to `#e2e2e2` and for light mode I've changed the black to `#1f2020` and the white to `#f8f7f3`, which makes a bit easier on the eyes.
