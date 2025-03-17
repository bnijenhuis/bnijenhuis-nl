const webmentionsContainer = document.querySelector('.webmentions');

let targetItems = "target[]=" + webmentionsContainer.getAttribute('data-posturl');
if (webmentionsContainer.hasAttribute('data-posturlalias')) targetItems = "target[]=" + webmentionsContainer.getAttribute('data-posturlalias');

fetch("https://webmention.io/api/count?" + targetItems)
    .then(response => response.json())
    .then(responseJson => {

        webmentionsContainer.querySelector("h2").innerHTML += " (" + responseJson.count + ")";
        fetch("https://webmention.io/api/mentions.jf2?" + targetItems + "&sort-by=published&sort-dir=up&per-page=" + responseJson.count)
            .then(response => response.json())
            .then(responseJson =>
                addWebmentions(responseJson)
            );
    });

// sites which are know to spam webmentions
// https://github.com/sw-yx/domainblocklist
let blocklist = [
    'http://gadgetsearcher.com',
    'https://pixallus.com',
    'http://programming.yourworldin90seconds.com',
    'https://programming.nichedomain.news',
    'https://marketingsolution.com.au',
    'https://programming.aplus-review.com',
    'https://digitalapexgroup.com',
    'https://technologynews.biz',
    'https://worldtech.news',
    'https://programming.webcloning.com',
    'https://www.sacramentowebdesigngroup.com',
    'https://htmltreehouse.com',
    'https://1dmx.org',
    'https://websitedesign-usa.com',
    'https://techupd.com',
    'https://fancyhints.com',
    'https://techalertnews.com',
    'https://buzzedly.com',
    'https://dztechno.com',
    'https://graphicdon.com',
    'https://www.newsgosspis.com',
    'http://www.digitasbuzz.in',
    'https://gotutoral.com',
    'https://wpguynews.com',
    'https://www.klobal.net',
    'http://www.webmastersgallery.com',
    'https://pikopong.com',
    'https://keren.link',
    'https://ntdln.com',
    'https://jczh.xyz',
    'https://pazukong.wordpress.com',
    'https://fullstackfeed.com',
    'https://thebrandingstore.net',
    'https://development-tools.net',
    'https://itdirectory.my',
    'https://www.sacramentowebdesigngroup.com',
    'https://engrmks.com.ng',
    'https://www.xspdf.com',
    'http://isokunoffice.club',
    'http://dinezh.com',
    'http://www.makemoneyupdaters.com',
    'http://clicknow.in',
    'http://nexstair.com',
    'http://kovtonyuk.inf.ua',
    'http://postheaven.net',
    'http://www.legendstrivia.co.uk',
    'http://squareblogs.net',
    'http://www.fourthcity.net',
    'http://www.engrmks.com.ng',
    'http://711web.com',
    'http://techupd.com',
    'http://www.67nj.org',
    'http://tipsxd.com',
    'http://www.new.pixel-forge.ca',
    'http://pixallus.com',
    'http://wpnewshub.com',
    'http://tecriter.wordpressarena.com',
    'http://reddits.contractwebsites.com',
    'http://wawas-kingdom.com',
    'http://dztechno.com',
    'http://wpguynews.com',
    'http://www.digitasbuzz.in',
    'http://watchfvsslive.co',
    'http://gotutoral.com',
    'http://techfans.co.uk',
    'http://pikopong.com',
    'http://marketingsolution.com.au'
];

function addWebmentions(responseJson) {
    let webmentionLikesSharesArray = [];
    let webmentionReplies = [];
    let hasLikes = false;
    let hasShares = false;

    responseJson.children.forEach((entry) => {

        if (!blocklist.includes(new URL(entry["wm-source"]).origin)) {

            if ((entry["wm-property"] == "like-of") || (entry["wm-property"] == "repost-of")) {

                if (entry["wm-property"] == "like-of") hasLikes = true;
                if (entry["wm-property"] == "repost-of") hasShares = true;

                let webmention = "<li class=\"webmention webmention--like-share\">";
                webmention += "<a class=\"webmention--link\" href=\"" + entry.url + "\" title=\"" + ((entry["wm-property"] == "repost-of") ? "Shared" : "Liked") + " by " + entry.author.name + "\">";
                if (entry.author.photo != "") webmention += "<img loading=\"lazy\" src=\"" + entry.author.photo + "\" alt=\"" + entry.author.name + "\" />";
                webmention += "<span class=\"sr-only\">" + entry.author.name + "</span>";
                webmention += "</a>";
                webmention += "</li>";

                webmentionLikesSharesArray.push(webmention);

            } else if ((entry["wm-property"] == "in-reply-to") || (entry["wm-property"] == "mention-of")) {

                console.log(entry);

                if (entry.content && (entry.author.name != "")) {

                    const publishedDate = new Date(Date.parse(entry.published));

                    let webmentionReply = "<li class=\"webmention webmention--mention\">";
                    webmentionReply += "<a class=\"webmention webmention--link\" href=\"" + entry.author.url + "\" title=\"" + ((entry["wm-property"] == "mention-of") ? "Mention" : "Reply") + " by " + entry.author.name + "\">";
                    if (entry.author.photo != "") webmentionReply += "<img loading=\"lazy\" src=\"" + entry.author.photo + "\" width=\"48\" height=\"48\" alt=\"" + entry.author.name + "\" />";
                    webmentionReply += "<span class=\"sr-only\">" + entry.author.name + "</span>";
                    webmentionReply += "</a>";
                    webmentionReply += "<div class=\"webmention--content\">";
                    webmentionReply += (entry.content.html) ? entry.content.html : entry.content.text;
                    webmentionReply += "<div class=\"webmention--metadata\">";
                    webmentionReply += publishedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toLowerCase();
                    webmentionReply += " — ";
                    webmentionReply += "<a href=\"" + entry.url + "\">View original mention</a>";
                    webmentionReply += "</div>";
                    webmentionReply += "</div>";
                    webmentionReply += "</li>";

                    webmentionReplies.push(webmentionReply);

                }

            }

        }

    });

    if (webmentionLikesSharesArray.length > 0) {

        let webmentionHtml = "<section class=\"webmentions--likes-shares\">";

        if (hasLikes && hasShares) {
            webmentionHtml += "<h3>— Likes and shares (" + webmentionLikesSharesArray.length + ")</h3>";
        } else if (hasLikes) {
            webmentionHtml += "<h3>— Likes (" + webmentionLikesSharesArray.length + ")</h3>";
        } else if (hasShares) {
            webmentionHtml += "<h3>— Shares (" + webmentionLikesSharesArray.length + ")</h3>";
        }

        webmentionHtml += "<ul>";
        webmentionHtml += webmentionLikesSharesArray.join("");
        webmentionHtml += "</ul>";
        webmentionHtml += "</section>";

        webmentionsContainer.insertAdjacentHTML("beforeend", webmentionHtml);

    }

    if (webmentionReplies.length > 0) {

        let webmentionRepliesHtml = "<section class=\"webmentions--replies\">";
        webmentionRepliesHtml += "<h3>— Mentions (" + webmentionReplies.length + ")</h3>";
        webmentionRepliesHtml += "<ul>";
        webmentionRepliesHtml += webmentionReplies.join("");
        webmentionRepliesHtml += "</ul>";
        webmentionRepliesHtml += "</section>";

        webmentionsContainer.insertAdjacentHTML("beforeend", webmentionRepliesHtml);

    }

}