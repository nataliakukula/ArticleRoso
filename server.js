//Require Express server framework
const express = require("express");
//Middleware - HTTP Request Logger
const logger = require("morgan");
//MongoDB object modelling tool
const mongoose = require("mongoose");
//Handlebars templates
const exphbs = require("express-handlebars");

//SCRAPING TOOLS:
//Promise-based http library -> if static html scraping
// const axios = require("axios"); 
//Headless high level API control -> necessary for dynamic html scraping
const puppeteer = require('puppeteer');
//Sever-side jQuery implementation
const cheerio = require("cheerio");

// Require all database models
const db = require("./models");

//Heroku & localhost ports:
const PORT = process.env.PORT || 3000;

// Initialize Express
const app = express();

// CONFIGURE MIDDLEWARE:
// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));
// Handlebars
app.engine("handlebars", exphbs({
    defaultLayout: "main",
    layoutsDir: __dirname + "/views/layouts/",
    partialsDir: __dirname + "/views/partials/"
}));
app.set("view engine", "handlebars");

//mongoose.Promise = global.Promise; is this necessary?

// Connect to the Mongo DB
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://user:password1@ds161144.mlab.com:61144/heroku_lnrdjn18";
mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true
    // useMongoClient: true
});

// ROUTES:
// Render the profile page:
app.get("/", function (req, res) {

    db.Playlist.find({})
        .then(dbPlaylists => res.render("index", { playlists: dbPlaylists }))
        .catch(error => res.json(error));
});

app.get("/saved", function (req, res) {

    res.render("saved", {});

    // db.Gift.findAll().then(function (giftObject) {

    //     console.log(giftObject);

    //     res.render("index", { gift: giftObject });

    // });
});

// A GET route for scraping the SoundCloud website
app.get("/scrape", function (req, res) {

    let result = [];

    async function scrape() {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto('https://soundcloud.com/discover/');

        let content = await page.content();
        let $ = cheerio.load(content);

        $('a.playableTile__mainHeading.audibleTile__mainHeading.playableTile__heading.playableTile__audibleHeading.audibleTile__audibleHeading').each(function (i, element) {
            let title = $(this).text();
            let playlistLink = $(this).attr("href");
            let imageLink = $(this).parent().parent().prev().children("a.playableTile__artworkLink.audibleTile__artworkLink").find("span").css("background-image");

            let playlist = {
                title: title.replace(/\n/g, '').trim(),
                playlistLink: "https://soundcloud.com" + playlistLink,
                imageLink: imageLink.replace(/^url\(['"]?/, '').replace(/['"]?\)$/, '')
            };

            // console.log(playlist);
            result.push(playlist);

        });

        // console.log(result);
        browser.close();

        db.Playlist.create(result)
            .then(dbPlaylists => res.send("Scrape Complete"))
            .catch(error => res.json(error));

    }

    scrape();

});

// // Route for getting all Articles from the db
// app.get("/articles", function (req, res) {
//     // Grab every document in the Articles collection
//     db.Article.find({})
//         .then(function (dbArticle) {
//             // If we were able to successfully find Articles, send them back to the client
//             res.json(dbArticle);
//         })
//         .catch(function (err) {
//             // If an error occurred, send it to the client
//             res.json(err);
//         });
// });

// // Route for grabbing a specific Article by id, populate it with it's note
// app.get("/articles/:id", function (req, res) {
//     // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
//     db.Article.findOne({ _id: req.params.id })
//         // ..and populate all of the notes associated with it
//         .populate("note")
//         .then(function (dbArticle) {
//             // If we were able to successfully find an Article with the given id, send it back to the client
//             res.json(dbArticle);
//         })
//         .catch(function (err) {
//             // If an error occurred, send it to the client
//             res.json(err);
//         });
// });

// // Route for saving/updating an Article's associated Note
// app.post("/articles/:id", function (req, res) {
//     // Create a new note and pass the req.body to the entry
//     db.Note.create(req.body)
//         .then(function (dbNote) {
//             // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
//             // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
//             // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
//             return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
//         })
//         .then(function (dbArticle) {
//             // If we were able to successfully update an Article, send it back to the client
//             res.json(dbArticle);
//         })
//         .catch(function (err) {
//             // If an error occurred, send it to the client
//             res.json(err);
//         });
// });

// Start the server
app.listen(PORT, function () {
    console.log("App running on port " + PORT + "! ==> http://localhost:" + PORT);
});