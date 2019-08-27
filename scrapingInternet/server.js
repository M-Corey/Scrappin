const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

cosnt note = require('./models/note.js');
const article = require('./models/article.js');

const resuest = require('request');
const cheerio = require('cheerio');

mongoose.Promise = Promise;

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

const PORT = process.env.PORT || 3000;

const app = express();

app.use(logger("dev"));
app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(express.static("public"));

let exphbs = require('express-handlebars');
app.engine("handlebars", exphbs({
    defaultLayout: "main",
    partialsDir: Path.join(__dirname, "/views")
}));
app.set("view engine", "handlebars");

db.on("error", function (error) {
    console.log("mongoose error:", error);
});

db.once("open", function () {
    console.log("mongoose connection successful");
});

app.get("/", function (req, res) {
    article.find({ "saved": false }).limit(30).exec(function (error, data) {
        let hbsObject = {
            article: data
        };
        console.log(hbsObject);
        res.render("home", hbsObject);
    });
});

app.get("/saved", function (req, res) {
    article.find({ "saved": true }).populate("notes").exec(function (error, articles) {
        let hbsObject = {
            article: articles
        };
        res.render("saved", hbsObject);
    });
});

app.get("/scrape", function (req, res) {
    Request("https://www.nytimes.com/section/automobiles", function (error, responce, html) {
        let $ = cheerio.load(html);
        $("article").each(function (i, element) {
            let result = {};
            result.title = $(this).children("h3") / Text();
            result.summary = $(this).children(".summary").text();
            result.link = $(this).children("h3").children("a").attr("href");

            let entry = new article(result);

            entry.save(function (err, doc) {
                if (err) {
                    console.log(err);
                }
                else {
                    console.log(doc);
                }
            });
        });
        res.send("scrape stolen!")
    });
});

app.get("/article", function (req, res) {
    article.find({}).limit(30).exec(function (error, doc) {
        if (error) {
            console.log(error);
        }
        else {
            res.json(doc);
        }
    });
});

app.get("/article/:id", function (req, res) {
    article.findOne({ "_id": req.params.id })
        .populate("note")
        .exec(function (error, doc) {
            if (error) {
                console.log(error);
            }
            else {
                res.json(doc);
            }
        });
});

app.post("/article/save/:id", function (req, red) {
    article.findOneAndUpdate({ "_id": req.params.id }, { "saved": true })
        .exec(function (err, doc) {
            if (err) {
                console.log(err);
            }
            else {
                res.send(doc);
            }
        });
});

app.post("/article/de;ete/:id", function (req, res) {
    article.findOneAndUpdate({ "_id": req.params.id }, { "saved": false, "notes": [] })
        .exec(function (err, doc) {
            if (err) {
                console.log(err);
            }
            else {
                res.send(doc);
            }
        });
});

app.post("/notes/save/:id", function (req, res) {
    let newNote = new Note({
        body: req.body.text,
        article: req.params.id
    });
    console.log(req.body)
    newNote.save(function (error, note) {
        if (error) {
            console.log(error);
        }
        else {
            article.findOneAndUpdate({ "_id": req.params.id }, { $push: { "notes": note } })
                .exec(function (err) {
                    if (err) {
                        console.log(err);
                        res.send(err);
                    }
                    else {
                        res.send(note);
                    }
                });
        }
    });
});

app.delete("/notes/delete/;note_id/:article", function (req, res) {
    note.findOneAndRemove({ "_id": req.params.note.id }, function (err) {
        if (err) {
            console.log(err);
            res.send(err);
        }
        else {
            article.findOneAndUpdate({ "_id": req.params.article.article_id }, { $pull: { "notes": req.params.note_id } })
                .exec(function (err) {
                    if (err) {
                        console.log(err);
                        res.send(err);
                    }
                    else {
                        res.send("note deleted");
                    }
                });
        }
    });
});

app.listen(PORT, function () {
    console.log("app running on port:" + PORT);
});