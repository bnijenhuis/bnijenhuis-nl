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
    let webmentionLikesArray = [];
    let webmentionRepostsArray = [];
    let webmentionReplies = "";

    responseJson.children.forEach((entry) => {

        if (!blocklist.includes(new URL(entry["wm-source"]).origin)) {

            if (entry["wm-property"] == "like-of") {

                webmentionLikesArray.push("<a href=\"" + entry.url + "\" title=\"Like of " + entry.author.name + "\">" + entry.author.name + "</a>");

            } else if (entry["wm-property"] == "repost-of") {

                webmentionRepostsArray.push("<a href=\"" + entry.url + "\" title=\"Repost of " + entry.author.name + "\">" + entry.author.name + "</a>");

            } else if (entry["wm-property"] == "in-reply-to") {

                webmentionReplies += "<p>" + entry.author.name + " <a href=\"" + entry.url + "\" title=\"Reply of " + entry.author.name + "\">replied</a>: ";
                webmentionReplies += "\"" + entry.content.text + "\"</p>";

            } else if (entry["wm-property"] == "mention-of") {

                if (entry.content) {
                    webmentionReplies += "<p>" + entry.author.name + " <a href=\"" + entry.url + "\" title=\"Mention of " + entry.author.name + "\">mentioned</a> this note: ";
                    webmentionReplies += "\"" + entry.content.text + "\"</p>";
                }

            }

        }

    });

    if (webmentionLikesArray.length > 0) {

        if (webmentionLikesArray.length > 1) {
            const webmentionLikes = "<p>" + webmentionLikesArray.slice(0, -1).join(", ") + " and " + webmentionLikesArray.slice(-1) + " liked this note.</p>";
            document.querySelector(".webmentions").insertAdjacentHTML("beforeend", webmentionLikes);
        } else {
            const webmentionLikes = "<p>" + webmentionLikesArray.slice(-1) + " liked this note.</p>";
            document.querySelector(".webmentions").insertAdjacentHTML("beforeend", webmentionLikes);
        }

    }

    if (webmentionRepostsArray.length > 0) {

        if (webmentionRepostsArray.length > 1) {
            const webmentionReposts = "<p>" + webmentionRepostsArray.slice(0, -1).join(", ") + " and " + webmentionRepostsArray.slice(-1) + " reposted this note.</p>";
            document.querySelector(".webmentions").insertAdjacentHTML("beforeend", webmentionReposts);
        } else {
            const webmentionReposts = "<p>" + webmentionRepostsArray.slice(-1) + " reposted this note.</p>";
            document.querySelector(".webmentions").insertAdjacentHTML("beforeend", webmentionReposts);
        }

    }

    if (webmentionReplies != "") {

        webmentionsContainer.insertAdjacentHTML("beforeend", webmentionReplies);

    }

}