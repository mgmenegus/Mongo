var express = require("express");
var mongojs = require("mongojs");
var cheerio = require("cheerio");
var request = require("request");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");

var db = require("./models/article");
var PORT = process.env.PORT || 3000;

var app = express();
var databaseURL = "funhausdb";
var collections = ["scrapedData"];

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static("public"));

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/funhausdb";
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);

var dbConnection = mongoose.connection;
dbConnection.on("error", console.error.bind(console, "connection error:"));
dbConnection.once("open", function() {
    console.log("db open");
    request("https://www.reddit.com/r/funhaus", function(error, response, html) {

        var $ = cheerio.load(html);
        $("p.title").each(function(i, element) {
            var results = {};
            var title = $(element).text();
            var link = $(element).children("a").attr("href");

            if (link.includes("/r/")) {
                link = "https://www.reddit.com" + link;
            }

            results.title = title;
            results.link = link;

            db.create(results)
                .then(function(dbArticle) {
                    console.log(dbArticle);
                })
                .catch(function(err) {
                    console.log(err);
                    return res.json(err);
                });
        });
    });
});

app.get("/articles", function(req, res) {
    db.find({}, function(err, article) {
        res.json(article);
    });
});

app.post("/notes/:id", function(req, res) {
    db.Note.create(req.body)
        .then(function(dbNote) {
            return db.findOneAndUpdate({
                _id: req.params.id
            }, {
                note: dbNote._id
            }, {
                new: true
            });
        })
        .then(function(dbArticle) {
            res.json(dbArticle);
        });
});

app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
});