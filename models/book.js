const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const Schema = mongoose.Schema;

var filePluginLib = require('mongoose-file');
var filePlugin = filePluginLib.filePlugin;
var make_upload_to_model = filePluginLib.make_upload_to_model;

var path = require("path");
var uploads_base = path.join(__dirname, "../uploads");
var uploads = path.join(uploads_base, "u");

const BookSchema = new Schema({
  //_id: ObjectId,
  title: String,
  author: String,
  genre: String,
  description: String,
  user: String,

});
BookSchema.plugin(filePlugin, {
  name: "file",
  upload_to: make_upload_to_model(uploads, "photos"),
  relative_to: uploads_base
});

const Book = mongoose.model('Book', BookSchema);
// Export the model
module.exports = Book;
