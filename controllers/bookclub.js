const Book = require('../models/book');
const Trade = require('../models/trade');
const fs  = require('fs');
const path = require("path");

/*
title: String,
author: String,
genre: String,
description: String,
*/
exports.addBook = function(req, res, next) {
  console.log("Request received", req.headers["content-type"]);
  let formData = req.body;
  let formPic = req.file;
  //console.log('form data', formData);
  //console.log('form file', formPic);
  //console.log(req.body);
  const book = new Book ({
    title: req.body.title,
    author: req.body.author,
    desc: req.body.desc,
    genre: req.body.desc,
    user: req.body.user,
    file: req.file,
  });
  book.save(function(err){
  if (err){
      console.log(err);
      return res.status(500).send(err);
    }
  console.log("Save success!");
  });
  return res.sendStatus(200);
}
exports.initTrade = function(req, res, next) {
  if(!req.body.requestId || !req.body.offerId || !req.body.requestUser || !req.body.offerUser){
    return res.status(402).send("Insufficient parameters");
  }
  const trade = new Trade ({
    offerId: req.body.offerId,
    offerUser: req.body.offerUser,
    requestId: req.body.requestId,
    requestUser: req.body.requestUser
  });
  trade.save(function(err){
    if (err){
      console.log(err);
      return res.status(500).send(err);
    }
    console.log("New trade save success!");
    return res.sendStatus(200);
  });
}
exports.finalizeBookTrade = function(req, res, next) {
  if(!req.body.traderequest){
    console.log("Bad trade request: ", req.body);
    return res.status(402).send("Insufficient parameters");
  }
  const request = req.body.traderequest;
  //const requestId = request._id;
  const offerId = request.offerId;
  const offerUser = request.offerUser;
  const requestId = request.requestId;
  const requestUser = request.requestUser;
  //first step, switch first book with update username
  Book.update({_id: offerId}, {user: requestUser}, function(err, numAffected){
    if(err) return res.status(500).send(err);

    console.log("TRADE STEP 1: Complete.  Docs changed: ", numAffected);
  });
  Book.update({_id: requestId}, {user: offerUser}, function(err, numAffected){
    if(err) return res.status(500).send(err);

    console.log("TRADE STEP 2: Complete.  Docs changed: ", numAffected);
  });
  //remove all trade requests for books offered and requested
  // to do -- add feature that notifies users when their request was declined
  Trade.remove({requestId: requestId}, function(err){
    if (err) return res.status(500).send(err);

    console.log("TRADE STEP 3: Complete. Trade requests removed");
  })
  Trade.remove({offerId: offerId}, function(err){
    if (err) return res.status(500).send(err);

    console.log("TRADE STEP 4: Complete. Trade offers removed");

    return res.status(200).send("all is good!");
  })
}
exports.getAllBooks = function(req, res, next) {
  Book.find({}, function (err, bookList){
    if (err) {
      console.log(err);
      return res.status(500).send(err);
    }
    //console.log("Returning all books: ", bookList);

    return res.status(200).send(bookList);
  });
}
exports.getPicture = function(req, res, next) {
  var file = req.headers.path;
  var url_root = path.join(__dirname, "../");
  res.status(200).sendFile(`${url_root}/${file}`);
}

exports.deleteBook = function(req, res, next) {
  if (!req.body.bookId){
    console.log("No book id.", req.body.bookId);
    return res.status(402).send("No book id");
  }
  console.log("1. Book id to remove: ", req.body.bookId);
  Book.remove({_id: req.body.bookId}, function(err){
    if (err) return res.status(500);
    console.log("2. Successfully deleted book.");
    Book.find({}, function(err, bookList){
      console.log("3. Sending all remaining books now");
      return res.status(200).send(bookList);
    })
  });
}
exports.getAllBooksByUser = function(req, res, next) {
  if (!req.headers.user){
    return res.status(402).send("Bad parameters");
  }
  Book.find({user: req.headers.user}, function(err, bookList){
    return res.status(200).send(bookList);
  });
}
exports.getOffersByUser = function(req, res, next){
  if(!req.headers.offeruser){
    console.log("Bad request: ", req.headers)
    return res.status(402).send("Bad parameters");
  }
  Trade.find({offerUser: req.headers.offeruser}, function(err, pendingOffers){
    return res.status(200).send(pendingOffers);
  });
}
exports.getRequestsByUser = function(req, res, next){
  if(!req.headers.requestuser){
    return res.status(402).send("Bad parameters");
  }
  Trade.find({requestUser: req.headers.requestuser}, function(err, pendingRequests){
    return res.status(200).send(pendingRequests);
  });
}
