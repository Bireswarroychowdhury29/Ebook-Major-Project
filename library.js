// Book data model example
/*
{
  _id: "ObjectId",
  title: "The Case of the Missing Smile",
  author: "Jane Smith",
  genre: "children",
  coverImage: "images/book-covers/missing-smile.jpg", 
  pageCount: 12,
  rating: 4.5,
  filepath: "books/case-of-the-missing-smile/"
}
*/

// DOM Elements
const booksGrid = document.getElementById('booksGrid');
const loader = document.getElementById('loader');
const errorMessage = document.getElementById('errorMessage');
const emptyState = document.getElementById('emptyState');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const filterBtns = document.querySelectorAll('.filter-btn');

// Variables for state management
let allBooks = [];
let currentFilter = 'all';
let searchTerm = '';

// Fetch books from MongoDB API
async function fetchBooks() {
  showLoader();
  hideError();
  hideEmptyState();

  try {
    // This will need to be replaced with your actual API endpoint that connects to MongoDB
    const response = await fetch('/api/books');
    
    if (!response.ok) {
      throw new Error('Failed to fetch books');
    }

    allBooks = await response.json();
    filterAndDisplayBooks();
    
  } catch (error) {
    console.error('Error fetching books:', error);
    showError();
  } finally {
    hideLoader();
  }
}

// Display books in the grid
function displayBooks(books) {
  booksGrid.innerHTML = '';

  if (books.length === 0) {
    showEmptyState();
    return;
  }

  books.forEach(book => {
    const bookCard = document.createElement('div');
    bookCard.className = 'book-card';
    bookCard.dataset.id = book._id;
    
    // When a book card is clicked, open the book viewer with this book
    bookCard.addEventListener('click', () => openBookViewer(book));

    bookCard.innerHTML = `
      <div class="book-cover">
        <img src="${book.coverImage || 'images/default-cover.jpg'}" alt="${book.title}">
      </div>
      <div class="book-info">
        <div class="book-title">${book.title}</div>
        <div class="book-author">by ${book.author}</div>
        <div class="book-meta">
          <span class="book-genre">${book.genre}</span>
          <span class="book-rating">
            <i class="fas fa-star"></i> ${book.rating || 'N/A'}
          </span>
        </div>
      </div>
    `;

    booksGrid.appendChild(bookCard);
  });
}

// Filter and display books based on current filter and search term
function filterAndDisplayBooks() {
  let filteredBooks = [...allBooks];

  // Apply category filter
  if (currentFilter !== 'all') {
    filteredBooks = filteredBooks.filter(book => book.genre.toLowerCase() === currentFilter);
  }

  // Apply search filter if there's a search term
  if (searchTerm.trim() !== '') {
    const term = searchTerm.toLowerCase().trim();
    filteredBooks = filteredBooks.filter(book => 
      book.title.toLowerCase().includes(term) || 
      book.author.toLowerCase().includes(term) || 
      book.genre.toLowerCase().includes(term)
    );
  }

  displayBooks(filteredBooks);
}

// Open the book viewer for the selected book
function openBookViewer(book) {
  // Navigate to the existing index.html with the book ID as a parameter
  window.location.href = `index.html?bookId=${book._id}`;
}

// UI Helper Functions
function showLoader() {
  loader.style.display = 'block';
}

function hideLoader() {
  loader.style.display = 'none';
}

function showError() {
  errorMessage.style.display = 'block';
}

function hideError() {
  errorMessage.style.display = 'none';
}

function showEmptyState() {
  emptyState.style.display = 'block';
}

function hideEmptyState() {
  emptyState.style.display = 'none';
}

// Event Listeners
searchBtn.addEventListener('click', () => {
  searchTerm = searchInput.value;
  filterAndDisplayBooks();
});

searchInput.addEventListener('keyup', (e) => {
  if (e.key === 'Enter') {
    searchTerm = searchInput.value;
    filterAndDisplayBooks();
  }
});

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    // Update active button UI
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    // Update filter and refresh display
    currentFilter = btn.dataset.filter;
    filterAndDisplayBooks();
  });
});

// For development/demo purposes only - remove in production
// This creates mock data when the actual API is not available
function loadMockData() {
  allBooks = [
    {
      _id: '1',
      title: 'The Case of the Missing Smile',
      author: 'Jane Smith',
      genre: 'children',
      coverImage: 'images/img-1.jpg',
      pageCount: 12,
      rating: 4.5,
      filepath: 'books/case-of-the-missing-smile/'
    },
    {
      _id: '2',
      title: 'Mystery at Midnight',
      author: 'John Doe',
      genre: 'mystery',
      coverImage: 'images/img-3.jpg',
      pageCount: 24,
      rating: 4.2,
      filepath: 'books/mystery-at-midnight/'
    },
    {
      _id: '3',
      title: 'The Adventure Begins',
      author: 'Sarah Johnson',
      genre: 'fiction',
      coverImage: 'images/img-5.jpg',
      pageCount: 32,
      rating: 4.7,
      filepath: 'books/adventure-begins/'
    },
    {
      _id: '4',
      title: 'Space Explorers',
      author: 'Michael Brown',
      genre: 'science',
      coverImage: 'images/img-2.jpg',
      pageCount: 18,
      rating: 4.0,
      filepath: 'books/space-explorers/'
    },
    {
      _id: '5',
      title: 'The Hidden Truth',
      author: 'Emily Clark',
      genre: 'non-fiction',
      coverImage: 'images/img-4.jpg',
      pageCount: 42,
      rating: 4.8,
      filepath: 'books/hidden-truth/'
    },
    {
      _id: '6',
      title: 'Detective Peterson Returns',
      author: 'Jane Smith',
      genre: 'mystery',
      coverImage: 'images/img-2.jpg',
      pageCount: 28,
      rating: 4.4,
      filepath: 'books/detective-peterson/'
    }
  ];
  filterAndDisplayBooks();
  hideLoader();
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
  // Comment out the appropriate line based on whether you're using the API or mock data
  // fetchBooks(); // Use this when your API is ready
  loadMockData(); // Use this for development/demo
});