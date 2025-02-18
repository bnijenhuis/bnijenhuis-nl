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