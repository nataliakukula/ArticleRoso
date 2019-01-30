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
// Render the home playlists page and send the database documents to the screen
app.get("/", function (req, res) {

    db.Playlist.find({})
        .limit(36)
        .then(dbPlaylist => res.render("index", { playlist: dbPlaylist }))
        .catch(error => res.json(error));
});

// Render the saved playlists page and send the database documents to the screen
app.get("/saved", function (req, res) {

    db.Playlist.find({})
        .limit(36)
        .then(dbPlaylist => res.render("saved", { playlist: dbPlaylist }))
        .catch(error => res.json(error));
});

// Scrape the SoundCloud website
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
            .then(dbPlaylists =>
                console.log("Scrape Complete"),
                res.redirect("/")
            )
            .catch(error => res.json(error));

    }

    scrape();

});

//Grab a specific Playlist by id and move it to saved playlists
app.put("/playlist/:id", function (req, res) {

    console.log(req.params.id);

    db.Playlist.findByIdAndUpdate(
        { _id: req.params.id },
        { $set: { saved: true } }
    )
        .then(function (dbPlaylist) {
            res.json(dbPlaylist);
        })
        .catch(function (err) {
            res.json(err);
        });
});

//Grab a specific Playlist by id, populate it with it's note
app.get("/note/:id", function (req, res) {

    db.Playlist.findOne(
        { _id: req.params.id })
        .populate("note")
        .then(function (dbPlaylist) {
            res.json(dbPlaylist);
        })
        .catch(function (err) {
            res.json(err);
        });
});

// Saving/Updating a Playlist's associated Note
app.post("/note/:id", function (req, res) {

    console.log(req.body);

    db.Note.create(req.body)
        .then(function (dbNote) {

            console.log(dbNote);

            return db.Playlist.findOneAndUpdate(
                { _id: req.params.id },
                { $push: { note: dbNote._id } },
                { new: true });
        })
        .then(function (dbNote) {

            res.json(dbNote);
        })
        .catch(function (err) {

            res.json(err);
        });
});

// Clear all collections
app.get("/clearall", function (req, res) {

    db.Playlist.remove({}, function (error, response) {

        if (error) throw error;

        db.Note.remove({}, function (error, response) {
            if (error) {
                console.log(error);
                res.send(error);
            }
            else {
                console.log(response);
                res.redirect("/");
            }
        });
    });
});

// Clear the saved playlists
app.get("/clearsaved", function (req, res) {

    db.Playlist.remove({ saved: true }, function (error, response) {

        if (error) {
            console.log(error);
            res.send(error);
        }
        else {
            console.log(response);
            res.redirect("/saved");
        }
    });
});

// Delete One from the DB
app.get("/clear/:id", function (req, res) {
    // remove object instance of ObjectID
    db.Playlist.remove(
        {
            _id: req.params.id
        },
        function (error, response) {
            if (error) {
                console.log(error);
                res.send(error);
            }
            else {
                console.log(response);
                res.redirect("/saved");
            }
        }
    );
});

// Select just one note by an id
app.get("/find/:id", function (req, res) {

    db.Note.findOne(
        {
            _id: req.params.id
        },
        function (error, found) {
            if (error) {
                console.log(error);
                res.send(error);
            }
            else {
                // console.log(found);
                res.json(found);
            }
        }
    );
});

// Update just one note by an id
app.put("/update/:id", function (req, res) {

    console.log(req.body);

    db.Note.update(
        {
            _id: req.params.id
        },
        {
            $set: {
                title: req.body.title,
                message: req.body.message,
                modified: Date.now()
            }
        },
        function (error, edited) {
            if (error) {
                console.log(error);
                res.send(error);
            }
            else {

                console.log(edited);
                res.send(edited);
            }
        }
    );
});

// Delete one note:
app.get("/delete/:id", function (req, res) {

    // console.log(req.params.id);
    // TODO How to delete reference in Playlist by using populate?

    db.Note.remove(
        {
            _id: req.params.id
        },
        function (error, response) {
            if (error) {
                console.log(error);
                res.send(error);
            }
            else {
                res.json(response);
            }
        }
    );
});

// Start the server
app.listen(PORT, function () {
    console.log("App running on port " + PORT + "! ==> http://localhost:" + PORT);
});