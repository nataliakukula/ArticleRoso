const mongoose = require("mongoose");

// Reference to the Schema constructor
const Schema = mongoose.Schema;

const PlaylistSchema = new Schema({

  title: {
    type: String,
    required: true
  },

  playlistLink: {
    type: String,
    required: true
  },

  imageLink: {
    type: String,
    required: true
  },

  saved: {
    type: Boolean,
    default: false
  },

  //Populate Playlist with an associated Note
  note: {
    type: Schema.Types.ObjectId,
    ref: "Note"
  }
});

//Create a model for the MongoDB collections
const Playlist = mongoose.model("Playlist", PlaylistSchema);

module.exports = Playlist;
