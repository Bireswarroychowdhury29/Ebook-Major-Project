const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../')));

// Connect to MongoDB - removed deprecated options
mongoose.connect('mongodb://localhost:27017/PageFlow')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

// Define Book Schema
const bookSchema = new mongoose.Schema({
  title: String,
  author: String,
  category: String,
  rating: Number,
  cover: String,
  bookFile: String
});

// Create Book model (connecting to the 'books' collection in 'ebookViewerDB')
const Book = mongoose.model('Book', bookSchema, 'books');

// API Routes
app.get('/api/books', async (req, res) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/books/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.json(book);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ New Route to Serve PDFs
app.get('/api/books/file/:filename', async (req, res) => {
  try {
    const book = await Book.findOne({ bookFile: `books/${req.params.filename}` });

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const filePath = path.resolve(__dirname, '..', book.bookFile); // Securely resolve path
    res.sendFile(filePath);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


