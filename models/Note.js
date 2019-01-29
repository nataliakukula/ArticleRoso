const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const NoteSchema = new Schema({

  title: String,

  message: String,

  created: {
    type: Date,
    default: Date.now
  },

  modifided: {
    type: Date
  }

});

const Note = mongoose.model("Note", NoteSchema);

module.exports = Note;