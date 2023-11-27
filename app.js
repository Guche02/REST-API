const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const _ = require("lodash")

const app = express();

app.set("view engine", "ejs");

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.use(express.static("public"));

mongoose.connect("mongodb://127.0.0.1:27017/wikiDB").then(function () {
  console.log("Successfully connected to the database");
});

const articleSchema = {
  title: String,
  content: String,
};

const Article = mongoose.model("Article", articleSchema);


// Chainable route handlers for the same route.
app.route("/articles")
.get((req, res) => {
    Article.find().then(function (error, result) {
        if (!error) {
            res.send(result);
        } else {
            res.send(error);
        }
    });
})
.post((req, res) => {
    const article = new Article({
        title: req.body.title,
        content: req.body.content,
    });
    
    article.save().then(function (error) {
        if (!error) {
        res.redirect("/articles");
    } else {
        res.send(error);
    }
    // I used postman to make a post,delete request without creating a frontend.
});
})
.delete((req, res) => {
    Article.deleteMany().then(function (error) {
        if (!error) {
            res.send("Deleted all the articles");
        } else {
            res.send(error);
        }
    });
})

app.route("/articles/:articletitle")
.get((req,res) => {
    const requestedTitle = req.params.articletitle

    Article.findOne({title: requestedTitle}).then(function(error,result){
        if (!error) {
            res.send(result)
        } else {
            res.send(error)
        }
    })
}).put((req,res) => {
    Article.updateOne(
     { title: req.params.articletitle},      //put request is meant to replace the entire document.
     { title: req.body.title, content: req.body.content},
     {overwrite: true}  //by default mongoDB prevents the document from being overwritten.
    ).then(function(error){
        if(!error){
            res.send("Successfully updated the article.")
        } else {
            res.send(error)
        }
    })
}).patch((req,res) => {
    Article.updateOne(
     { title: req.params.articletitle},      
     { $set: req.body}, //It allows us to update ony the necessary fields of the document.
    //overwrite is not necessary because the entire document is not updated.
    ).then(function(error){
        if(!error){
            res.send("Successfully updated the article.")
        } else {
            res.send(error)
        }
    })
}).delete((req,res) => {
    Article.deleteOne({ title: req.params.articletitle}).then(function(error)
    {
        if(error){
            res.send(error)
        }
    })
})


app.listen(3000, function () {
  console.log("Server started on port 3000");
});

