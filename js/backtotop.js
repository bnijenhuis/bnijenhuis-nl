const header = document.querySelector('header');
const backtotop = document.querySelector('.back-to-top');

const intersectionCallback = (changes) => {
    changes.forEach(change => {
        if (change.intersectionRatio === 0) {
            // header is outside viewport
            backtotop.classList.add('enabled');
        } else {
            // header is inside viewport
            backtotop.classList.remove('enabled');
        }
    });
};

const options = {
    threshold: 0,
};

const observer = new IntersectionObserver(intersectionCallback, options);

observer.observe(header);