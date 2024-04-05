const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      if (users.find((user) => user.username === username)) {
        return res.status(409).json({ message: "Username already exists" });
      }
      users.push({ username, password });
      return res.status(201).json({ message: "User registered successfully" });
});

const getBooklist = () => {
    return new Promise((resolve, reject) => {
        resolve(books);
    });
};

const booklistISBN = (isbn) => {
    return new Promise((resolve, reject) => {
        let newisbn = parseInt(isbn);
        if (books[newisbn]) {
            resolve(books[newisbn]);
        } else {
            reject({ status: 404, message: "ISBN: "+ newisbn + " is not found" });
        }
    });
};

// Get the book list available in the shop
public_users.get('/',async function (req, res) {
    try {
        const bookList = await getBooklist(); 
        res.send(JSON.stringify(bookList,null,4));
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error getting list" });
      }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  booklistISBN(isbn).then(
    result => res.send(result),
    error => res.status(error.status).json({message: error.message})
  )
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const author = req.params.author;
  getBooklist()
    .then((bookList) => Object.values(bookList))
    .then((books) => books.filter((book) => book.author === author))
    .then((filteredBooks) => res.send(filteredBooks));
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const title = req.params.title;
    getBooklist()
    .then((bookList) => Object.values(bookList))
    .then((books) => books.filter((book) => book.title === title))
    .then((filteredBooks) => res.send(filteredBooks));
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  res.send(books[isbn].reviews)
});

module.exports.general = public_users;
