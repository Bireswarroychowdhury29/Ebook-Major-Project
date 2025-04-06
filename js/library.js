// DOM Elements
const booksGrid = document.getElementById('booksGrid');
const loader = document.getElementById('loader');
const errorMessage = document.getElementById('errorMessage');
const emptyState = document.getElementById('emptyState');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const filterBtns = document.querySelectorAll('.filter-btn');
const hamburgerMenu = document.querySelector('.hamburger-menu');
const mobileMenu = document.getElementById('mobileMenu');
const mobileSearchInput = document.getElementById('mobileSearchInput');
const mobileSearchBtn = document.getElementById('mobileSearchBtn');

// Variables for state management
let allBooks = [];
let currentFilter = 'all';
let searchTerm = '';

// Static book data - no MongoDB needed
function loadStaticBooks() {
  showLoader();
  hideError();
  hideEmptyState();

  // Static books array using data from bookdata.txt
  allBooks = [
    {
      _id: '67ea5197300f52b5ea0e5a06',
      title: 'The Lion Who Saw Himself In The Water',
      author: 'Idries Shah',
      genre: 'children',
      coverImage: 'covers/C1.png',
      rating: 4.5,
      filepath: 'books/c1.pdf'
    },
    {
      _id: '67ea51ad300f52b5ea0e5a09',
      title: 'The Silly Chicken',
      author: 'Idries Shah',
      genre: 'children',
      rating: 4.1,
      coverImage: 'covers/C2.png',
      filepath: 'books/c2.pdf'
    },
    {
      _id: '67ea51d6300f52b5ea0e5a0c',
      title: 'How It All Began',
      author: 'Herobrine',
      genre: 'fiction',
      rating: 4.7,
      coverImage: 'covers/F1.png',
      filepath: 'books/f1.pdf'
    },
    {
      _id: '67ea51ec300f52b5ea0e5a11',
      title: 'Portrait Of A King',
      author: 'L.A. Buck',
      genre: 'fiction',
      rating: 4.3,
      coverImage: 'covers/F2.png',
      filepath: 'books/f2.pdf'
    },
    {
      _id: '67ea51fc300f52b5ea0e5a14',
      title: 'The Absent Author',
      author: 'Ron Roy',
      genre: 'mystery',
      rating: 3.8,
      coverImage: 'covers/M1.png',
      filepath: 'books/m1.pdf'
    },
    {
      _id: '67ea5208300f52b5ea0e5a17',
      title: 'The White Wolf',
      author: 'Ron Roy',
      genre: 'mystery',
      rating: 4.0,
      coverImage: 'covers/M2.png',
      filepath: 'books/m2.pdf'
    },
    {
      _id: '67ea521d300f52b5ea0e5a1a',
      title: 'Cesar Chavez - Autobiography',
      author: 'Anne Schraff',
      genre: 'non-fiction',
      rating: 4.9,
      coverImage: 'covers/NF1.png',
      filepath: 'books/nf1.pdf'
    },
    {
      _id: '67ea5229300f52b5ea0e5a1d',
      title: 'Kalinski Art',
      author: 'John Paul Kirkham',
      genre: 'non-fiction',
      rating: 4.0,
      coverImage: 'covers/NF2.png',
      filepath: 'books/nf2.pdf'
    },
    {
      _id: '67ea5233300f52b5ea0e5a20',
      title: 'A Cavity Is A Hole In Your Tooth',
      author: 'Jim Henson',
      genre: 'science',
      rating: 3.5,
      coverImage: 'covers/S1.png',
      filepath: 'books/s1.pdf'
    },
    {
      _id: '67ea5247300f52b5ea0e5a23',
      title: 'The Skeleton Inside You',
      author: 'Philip Balestrino',
      genre: 'science',
      rating: 4.4,
      coverImage: 'covers/S2.png',
      filepath: 'books/s2.pdf'
    }
  ];

  // Display the books after a short delay to simulate loading
  setTimeout(() => {
    filterAndDisplayBooks();
    hideLoader();
  }, 500);
}

// Display books in the grid with animations
function displayBooks(books) {
  booksGrid.innerHTML = '';

  if (books.length === 0) {
    showEmptyState();
    return;
  }

  books.forEach((book, index) => {
    const bookCard = document.createElement('div');
    bookCard.className = 'book-card';
    bookCard.dataset.id = book._id;
    
    // When a book card is clicked, open the book viewer with this book
    bookCard.addEventListener('click', () => openBookViewer(book));

    bookCard.innerHTML = `
      <div class="book-cover">
        <img src="${book.coverImage || 'covers/default-cover.jpg'}" alt="${book.title}">
      </div>
      <div class="book-info">
        <h3 class="book-title">${book.title}</h3>
        <p class="book-author">by ${book.author}</p>
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

  // Add transition effect when filtering
  const existingBooks = document.querySelectorAll('.book-card');
  existingBooks.forEach((book) => {
    book.style.transition = 'all 0.3s ease';
    book.style.opacity = '0';
    book.style.transform = 'translateY(20px)';
  });

  // Short delay before showing new results
  setTimeout(() => {
    displayBooks(filteredBooks);
  }, 300);
}

// Open the book viewer for the selected book
function openBookViewer(book) {
  window.location.href = `book-viewer.html?bookPath=${encodeURIComponent(book.filepath)}`;
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

// Mobile search functionality
mobileSearchBtn.addEventListener('click', () => {
  searchTerm = mobileSearchInput.value;
  filterAndDisplayBooks();
});

mobileSearchInput.addEventListener('keyup', (e) => {
  if (e.key === 'Enter') {
    searchTerm = mobileSearchInput.value;
    filterAndDisplayBooks();
  }
});

// Category filter buttons
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

// Mobile menu toggle
hamburgerMenu.addEventListener('click', () => {
  hamburgerMenu.classList.toggle('active');
  mobileMenu.classList.toggle('active');
});

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
  loadStaticBooks(); // Load static book data instead of fetching from MongoDB
});