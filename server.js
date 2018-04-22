var express = require("express");
var mongojs = require("mongojs");
var cheerio = require("cheerio");
var request = require("request");

var app = express();
var databaseURL = "funhausdb";
var collections = ["scrapedData"];

var db = mongojs(databaseURL, collections);
db.on("error", function(error){
    console.log("DB Error Occurred: ", error);
});

app.get("/", function(req, res){
    console.log("Hello World!");
});

app.get("all", function(req, res){
    db.scrapedData.find({}, function(error, found){
        if (error){
            console.log(error);
        } else {
            res.json(found);
        }
    });
});

app.get("/scrape", function(req, res){


request("https://www.reddit.com/r/funhaus", function(error, response, html) {

    var $ = cheerio.load(html);
    //var results = [];
    $("p.title").each(function(i, element) {
        var title = $(element).text();
        //var summary = $(element).children("p");
        var link = $(element).children("a").attr("href");

        if (link.includes("/r/")) {
            link = "https://www.reddit.com" + link;
        }

        if (title && link) {
            db.scrapedData.insert({
                title: title,
                //summary: summary,
                link: link
        },
            function(err, inserted){
                if (err) {
                    console.log(err);
                } else {
                    console.log(inserted);
                }
            });
        }
        });
    });
res.send("Completed Scrape");
});