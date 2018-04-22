var cheerio = require("cheerio");
var request = require("request");

request("https://www.reddit.com/r/funhaus", function(error, response, html) {

    var $ = cheerio.load(html);
    var results = [];
    $("p.title").each(function(i, element) {
        var title = $(element).text();
        //var summary = $(element).children("p");
        var link = $(element).children("a").attr("href");

        if (link.includes("/r/")) {
            link = "https://www.reddit.com" + link;
        };
        results.push({
            title: title,
            //summary: summary,
            link: link
        });
    });

    console.log(results);
});