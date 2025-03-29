// server.js - Express server to connect to MongoDB and serve book data
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB connection string - use environment variables in production
const uri = "mongodb+srv://bireswarroychowdhury29:admin1@bookstore.q0lbxhy.mongodb.net/";
const client = new MongoClient(uri);
const dbName = "bookstore";
const collectionName = "books";

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Connect to MongoDB
async function connectToDatabase() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

// API endpoint to get all books
app.get('/api/books', async (req, res) => {
  try {
    const database = client.db(dbName);
    const collection = database.collection(collectionName);
    
    const books = await collection.find({}).toArray();
    res.json(books);
  } catch (error) {
    console.error("Error fetching books:", error);
    res.status(500).json({ error: "Failed to fetch books" });
  }
});

// API endpoint to get a specific book by ID
app.get('/api/books/:id', async (req, res) => {
  try {
    const database = client.db(dbName);
    const collection = database.collection(collectionName);
    
    const book = await collection.findOne({ _id: new ObjectId(req.params.id) });
    
    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }
    
    res.json(book);
  } catch (error) {
    console.error("Error fetching book:", error);
    res.status(500).json({ error: "Failed to fetch book" });
  }
});

// Connect to database and start server
connectToDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(console.error);

// Close MongoDB connection when the server is stopped
process.on('SIGINT', async () => {
  await client.close();
  console.log('MongoDB connection closed');
  process.exit(0);
});