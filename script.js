// Initialize global variables
let pdfDoc = null;
let bookTitle = "Book Viewer";
let bookLoaded = false;
let zoomLevel = 1;
let currentBookPath = "";
let bookData = [];

// Function to load book data
function loadBookData() {
  return new Promise((resolve) => {
    // Hardcoded data from bookdata.txt
    bookData = [
      {
        "title": "The Lion Who Saw Himself In The Water",
        "author": "Idries Shah",
        "category": "children",
        "rating": 4.5,
        "cover": "covers/C1.png",
        "bookFile": "books/c1.pdf"
      },
      {
        "title": "The Silly Chicken",
        "author": "Idries Shah",
        "category": "children",
        "rating": 4.1,
        "cover": "covers/C2.png",
        "bookFile": "books/c2.pdf"
      },
      {
        "title": "How It All Began",
        "author": "Herobrine",
        "category": "fiction",
        "rating": 4.7,
        "cover": "covers/F1.png",
        "bookFile": "books/f1.pdf"
      },
      {
        "title": "Portrait Of A King",
        "author": "L.A. Buck",
        "category": "fiction",
        "rating": 4.3,
        "cover": "covers/F2.png",
        "bookFile": "books/f2.pdf"
      },
      {
        "title": "The Absent Author",
        "author": "Ron Roy",
        "category": "mystery",
        "rating": 3.8,
        "cover": "covers/M1.png",
        "bookFile": "books/m1.pdf"
      },
      {
        "title": "The White Wolf",
        "author": "Ron Roy",
        "category": "mystery",
        "rating": 4,
        "cover": "covers/M2.png",
        "bookFile": "books/m2.pdf"
      },
      {
        "title": "Cesar Chavez - Autobiography",
        "author": "Anne Schraff",
        "category": "non-fiction",
        "rating": 4.9,
        "cover": "covers/NF1.png",
        "bookFile": "books/nf1.pdf"
      },
      {
        "title": "Kalinski Art",
        "author": "John Paul Kirkham",
        "category": "non-fiction",
        "rating": 4,
        "cover": "covers/NF2.png",
        "bookFile": "books/nf2.pdf"
      },
      {
        "title": "A Cavity Is A Hole In Your Tooth",
        "author": "Jim Henson",
        "category": "science",
        "rating": 3.5,
        "cover": "covers/S1.png",
        "bookFile": "books/s1.pdf"
      },
      {
        "title": "The Skeleton Inside You",
        "author": "Philip Balestrino",
        "category": "science",
        "rating": 4.4,
        "cover": "covers/S2.png",
        "bookFile": "books/s2.pdf"
      }
    ];
    resolve(bookData);
  });
}

$(document).ready(function () {
  // Show loading overlay
  $("#loadingOverlay").show();
  
  // Get book path from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  currentBookPath = urlParams.get('bookPath');
  
  if (currentBookPath) {
    // If PDF file is specified, load it
    loadPDFBook(currentBookPath);
  } else {
    // Fallback to the static demo book
    loadStaticDemoBook();
  }
  
  // Initialize static controls
  initializeStaticControls();
  
  // Load and display bookmarks
  $("#bookmarksMenu").click(function(e) {
    e.preventDefault();
    displayBookmarks();
  });
  
  // Handle page input enter key
  $("#pageInput").keypress(function (event) {
    if (event.key === "Enter") {
      goToPage();
    }
  });
  
  // Handle window resize
  $(window).on('resize', function() {
    updatePageTurnButtonPositions();
    // Also ensure proper centering on resize
    $(".flipbook").css({
      'margin-left': 'auto',
      'margin-right': 'auto'
    });
  });
  
  // Make sure buttons position updates after a short delay
  setTimeout(updatePageTurnButtonPositions, 100);
});

// Function to load and setup a PDF book
function loadPDFBook(pdfPath) {
  // Initialize PDF.js
  const pdfjsLib = window.pdfjsLib;
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
  
  // Load book data first, then process the PDF
  loadBookData().then(() => {
    // Find book in data that matches the current path
    const pathParts = pdfPath.split('/');
    const pdfFileName = pathParts[pathParts.length - 1];
    const bookInfo = bookData.find(book => {
      const bookFileParts = book.bookFile.split('/');
      const bookFileName = bookFileParts[bookFileParts.length - 1];
      return bookFileName.toLowerCase() === pdfFileName.toLowerCase();
    });
    
    // Set book title from data if found
    if (bookInfo) {
      bookTitle = bookInfo.title;
    } else {
      // Fallback to formatting the filename as before
      let fileName = pdfFileName;
      fileName = fileName.replace('.pdf', '');
      fileName = fileName.replace(/[_-]/g, ' ');
      fileName = fileName.replace(/([a-z])([A-Z])/g, '$1 $2');
      fileName = fileName.replace(/\.[^/.]+$/, "");
      bookTitle = fileName.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }
    
    // Load the PDF document
    const loadingTask = pdfjsLib.getDocument(pdfPath);
    loadingTask.promise.then(function(pdf) {
      pdfDoc = pdf;
      const totalPages = pdf.numPages;
      
      // Update page title and sidebar header with the proper book title
      document.title = bookTitle;
      $("#bookTitle").text(bookTitle);
      
      // Reset the flipbook
      const flipbook = $("#flipbook");
      flipbook.html('');
      
      // Create an array of promises to render all pages
      const renderPromises = [];
      for (let i = 1; i <= totalPages; i++) {
        renderPromises.push(renderPage(pdf, i, flipbook));
      }
      
      // When all pages are rendered, initialize turn.js
      Promise.all(renderPromises).then(() => {
        // Initialize the flipbook
        flipbook.turn({
          width: 1000,
          height: 650,
          elevation: 50,
          gradients: true,
          autoCenter: true
        });
        
        // Update UI
        const actualTotalPages = flipbook.turn("pages");
        $("#pageTotal").text(` / ${actualTotalPages}`);
        updatePageIndex(1);
        
        // Always keep the book centered
        flipbook.css({
          'margin-left': 'auto',
          'margin-right': 'auto'
        });
        
        // Initial adjustment for first page
        updatePageIndex(1);
        adjustFlipbookPosition(1);
        updateSidebarBookmarkState(1);
        
        // Bind turning event
        flipbook.bind("turning", function (event, page) {
          updatePageIndex(page);
          adjustFlipbookPosition(page);
          // Ensure book stays centered on page turn
          flipbook.css({
            'margin-left': 'auto',
            'margin-right': 'auto'
          });
          updatePageTurnButtonPositions();
        });
        
        // Hide loading overlay
        $("#loadingOverlay").fadeOut();
        bookLoaded = true;
        updatePageTurnButtonPositions();
      });
    }).catch(function(error) {
      console.error("Error loading PDF:", error);
      alert("Failed to load PDF book: " + error.message);
      // Hide loading overlay
      $("#loadingOverlay").fadeOut();
      // Redirect to library
      window.location.href = "index.html";
    });
  });
}

// Function to render a PDF page and add it to the flipbook
function renderPage(pdf, pageNum, flipbook) {
  return new Promise((resolve) => {
    pdf.getPage(pageNum).then(function(page) {
      const viewport = page.getViewport({ scale: 1.5 });
      
      // Create a canvas for the page
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      // Render the PDF page to the canvas
      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };
      
      page.render(renderContext).promise.then(() => {
        // Create a div container for the page
        const pageDiv = document.createElement('div');
        pageDiv.className = 'pdf-page';
        pageDiv.style.position = 'relative';
        
        // Add the canvas to the page div
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        pageDiv.appendChild(canvas);
        
        // Extract text content for accessibility
        page.getTextContent().then(function(textContent) {
          if (textContent.items.length > 0) {
            const textDiv = document.createElement('div');
            textDiv.className = 'page-text';
            textDiv.style.display = 'none'; // Hidden, but available for accessibility
            
            let text = '';
            textContent.items.forEach(item => {
              text += item.str + ' ';
            });
            
            textDiv.textContent = text;
            pageDiv.appendChild(textDiv);
          }
          
          // Add the page to the flipbook
          flipbook.append(pageDiv);
          resolve();
        });
      });
    }).catch(function(error) {
      console.error("Error rendering page " + pageNum + ":", error);
      // Add an error page instead
      const errorDiv = document.createElement('div');
      errorDiv.className = 'pdf-page error-page';
      errorDiv.innerHTML = `<div class="error-message">Error loading page ${pageNum}</div>`;
      flipbook.append(errorDiv);
      resolve();
    });
  });
}

// Fallback function to load the static demo book
function loadStaticDemoBook() {
  bookTitle = "The Case of the Missing Smile";
  document.title = bookTitle;
  $("#bookTitle").text(bookTitle);
  
  const flipbook = $(".flipbook");
  flipbook.turn({
    width: 1000,
    height: 650,
    elevation: 50,
    gradients: true,
    autoCenter: true
  });
  
  // Always keep the flipbook centered
  $('.flipbook').css({
    'margin-left': 'auto',
    'margin-right': 'auto'
  });
  
  const totalPages = flipbook.turn("pages");
  $("#pageTotal").text(` / ${totalPages}`);
  
  // Initial setup
  updatePageIndex(1);
  adjustFlipbookPosition(1);
  updateSidebarBookmarkState(1);
  
  // Bind turning event for demo book
  flipbook.bind("turning", function (event, page) {
    updatePageIndex(page);
    adjustFlipbookPosition(page);
  });
  
  // Hide loading overlay
  $("#loadingOverlay").fadeOut();
  bookLoaded = true;
  updatePageTurnButtonPositions();
}

// Function to create static controls that won't be affected by zoom
function initializeStaticControls() {
  // Get the controls container
  const controlsContainer = $("#controlsContainer");
  
  // Remove the controls container from its current position in the DOM
  controlsContainer.detach();
  
  // Create a new wrapper for controls that will stay fixed
  const staticWrapper = $('<div id="staticControlsWrapper"></div>');
  staticWrapper.css({
    'position': 'fixed',
    'bottom': '10px',
    'left': '50%',
    'transform': 'translateX(calc(-50% - 25px))', // Added negative offset to shift left
    'z-index': '9999',
    'display': 'flex',
    'flex-direction': 'column',
    'align-items': 'center',
    'pointer-events': 'auto'
  });
  
  // Append the controls to this wrapper
  staticWrapper.append(controlsContainer);
  
  // Make sure the controls themselves have proper centering styles
  controlsContainer.css({
    'transform': 'none',
    'position': 'relative',
    'left': '0',
    'bottom': '0',
    'margin': '0',
    'width': 'fit-content'
  });
  
  // Add the wrapper to the body
  $('body').append(staticWrapper);
}

// Function to adjust the flipbook position based on current page
function adjustFlipbookPosition(page) {
  if (!bookLoaded) return;
  
  const totalPages = $(".flipbook").turn("pages");
  
  // Apply position adjustment to container
  const container = $(".flipbook-container");
  
  // Add transition for smooth movement
  container.css({
    'transition': 'transform 0.5s ease-in-out' 
  });
  
  // Default position is slightly to the right
  let translateX = 25; // Default right shift
  
  if (page === totalPages) {
    // Only shift left on the last page
    translateX = 25;
  }
  
  // Apply the position
  updateContainerPosition(translateX);
  
  // Update page turn buttons after position change
  updatePageTurnButtonPositions();
}

// Function to update container position and zoom together
function updateContainerPosition(translateXPercent) {
  const container = $(".flipbook-container");
  container.css({
    'transform': `translateX(${translateXPercent}%) scale(${zoomLevel})`
  });
}

// Function to update page turn button positions
function updatePageTurnButtonPositions() {
  const flipbookContainer = document.querySelector('.flipbook-container');
  const flipbook = document.querySelector('.flipbook');
  const leftBtn = document.getElementById('leftTurnBtn');
  const rightBtn = document.getElementById('rightTurnBtn');
  
  if (flipbookContainer && flipbook) {
    const containerRect = flipbookContainer.getBoundingClientRect();
    
    // Set left button position
    if (leftBtn) {
      if (document.getElementById("sidebar").classList.contains("open")) {
        leftBtn.style.left = `${270 * zoomLevel}px`;
      } else {
        leftBtn.style.left = `${20 * zoomLevel}px`;
      }
      // Add smooth transition
      leftBtn.style.transition = 'left 0.3s ease-in-out';
    }
    
    // Set right button position
    if (rightBtn) {
      rightBtn.style.right = `${20 * zoomLevel}px`;
      // Add smooth transition
      rightBtn.style.transition = 'right 0.3s ease-in-out';
    }
  }
}

function toggleSidebar() {
  // Toggle sidebar class
  document.getElementById("sidebar").classList.toggle("open");
  
  // Toggle content shift
  document.getElementById("content").classList.toggle("shifted");
  
  // Toggle left turn button position
  document.getElementById("leftTurnBtn").classList.toggle("shifted");
  
  // Update page turn button positions
  updatePageTurnButtonPositions();
  
  // Change the icon based on sidebar state
  const navToggle = document.getElementById("navToggle");
  if (document.getElementById("sidebar").classList.contains("open")) {
    navToggle.innerHTML = '<img src="images/cross.png" alt="Close" style="width: 30px; height: 30px;">';
  } else {
    navToggle.innerHTML = '<img src="images/burger.png" alt="Menu" style="width: 20px; height: 20px;">';
  }
}

function goToPageNumber(page) {
  $(".flipbook").turn("page", page);
  if (document.getElementById("sidebar").classList.contains("open")) {
    toggleSidebar();
  }
  if (document.getElementById("bookmarkModal").style.display === "flex") {
    closeBookmarkModal();
  }
}

function updatePageIndex(currentPage) {
  $("#pageInput").val(currentPage);
  updateBookmarkButton(currentPage);
  updateSidebarBookmarkState(currentPage);
}

function updateSidebarBookmarkState(currentPage) {
  if (!bookLoaded) return;
  
  const totalPages = $(".flipbook").turn("pages");
  const isCoverPage = (currentPage === 1 || currentPage === 2 || currentPage === totalPages || currentPage === totalPages - 1);
  
  // Update sidebar bookmark link state
  const sidebarBookmarkLink = document.getElementById("sidebarBookmarkLink");
  if (isCoverPage) {
    sidebarBookmarkLink.classList.add("disabled");
    sidebarBookmarkLink.onclick = function(e) { 
      e.preventDefault(); 
      alert("Cannot bookmark cover pages"); 
      return false; 
    };
  } else {
    sidebarBookmarkLink.classList.remove("disabled");
    sidebarBookmarkLink.onclick = function() { 
      toggleBookmark(); 
      return false; 
    };
  }
}

function goToPage() {
  if (!bookLoaded) return;
  
  const pageNumber = parseInt($("#pageInput").val());
  const totalPages = $(".flipbook").turn("pages");

  if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= totalPages) {
    $(".flipbook").turn("page", pageNumber);
  } else {
    alert(`Enter a valid page number (1 - ${totalPages})`);
  }
}

function zoomIn() { 
  if (zoomLevel < 2) { 
    zoomLevel += 0.2; 
    updateZoom(); 
  } 
}

function zoomOut() { 
  if (zoomLevel > 0.6) { 
    zoomLevel -= 0.2; 
    updateZoom(); 
  } 
}

function resetZoom() { 
  zoomLevel = 1; 
  updateZoom(); 
}

function updateZoom() {
  if (!bookLoaded) return;
  
  // Get the current page to maintain proper positioning
  const currentPage = parseInt($("#pageInput").val());
  
  // Apply both zoom and position adjustment
  adjustFlipbookPosition(currentPage);
  
  // Update buttons position after zoom
  updatePageTurnButtonPositions();
}

function updateBookmarkButton(currentPage) {
  if (!bookLoaded) return;
  
  const totalPages = $(".flipbook").turn("pages");
  const isCoverPage = (currentPage === 1 || currentPage === 2 || currentPage === totalPages || currentPage === totalPages - 1);
  
  $("#bookmarkBtn").prop("disabled", isCoverPage);
}

function toggleBookmark() {
  if (!bookLoaded) return;
  
  const currentPage = parseInt($("#pageInput").val());
  const totalPages = $(".flipbook").turn("pages");
  const isCoverPage = (currentPage === 1 || currentPage === 2 || currentPage === totalPages || currentPage === totalPages - 1);
  
  if (isCoverPage) {
    alert("Cannot bookmark cover pages");
    return;
  }

  if (!isNaN(currentPage)) {
    // Use book path to create unique bookmark keys per book
    const bookKey = currentBookPath ? currentBookPath.replace(/[^a-zA-Z0-9]/g, "-") : "default-book";
    const bookmarkKey = `bookmark-${bookKey}-page-${currentPage}`;
    
    if (localStorage.getItem(bookmarkKey)) {
      localStorage.removeItem(bookmarkKey);
      
      // Show a nicer notification
      showNotification(`Bookmark removed from page ${currentPage}`);
    } else {
      localStorage.setItem(bookmarkKey, "bookmarked");
      
      // Show a nicer notification
      showNotification(`Page ${currentPage} bookmarked!`);
    }
  }
}

// Function to display bookmarks in a modal
function displayBookmarks() {
  if (!bookLoaded) return;
  
  const bookmarkModalBody = document.getElementById("bookmarkModalBody");
  bookmarkModalBody.innerHTML = "";
  
  // Use book path to find bookmarks for this specific book
  const bookKey = currentBookPath ? currentBookPath.replace(/[^a-zA-Z0-9]/g, "-") : "default-book";
  const bookmarkPrefix = `bookmark-${bookKey}-page-`;
  
  let hasBookmarks = false;
  let bookmarkHTML = '<ul class="bookmark-list">';
  
  // Check for bookmarks in localStorage
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith(bookmarkPrefix)) {
      hasBookmarks = true;
      const pageNum = key.replace(bookmarkPrefix, "");
      bookmarkHTML += `
        <li class="bookmark-item" id="bookmark-item-${pageNum}">
          <div class="bookmark-item-info">
            <i class="fas fa-bookmark bookmark-icon"></i>
            <span class="bookmark-page-number">Page ${pageNum}</span>
          </div>
          <div class="bookmark-actions">
            <button class="bookmark-goto" onclick="goToPageNumber(${pageNum})">Go to page</button>
            <button class="bookmark-remove" onclick="removeBookmark('${bookKey}', ${pageNum})">Remove</button>
          </div>
        </li>
      `;
    }
  }
  
  bookmarkHTML += '</ul>';
  
  if (!hasBookmarks) {
    bookmarkModalBody.innerHTML = '<div class="no-bookmarks-message">You have no bookmarks yet for this book. Add bookmarks by clicking the star icon in the bottom controls or "Bookmark Current" in the sidebar.</div>';
  } else {
    bookmarkModalBody.innerHTML = bookmarkHTML;
  }
  
  // Show the modal
  document.getElementById("bookmarkModal").style.display = "flex";
}

// Function to close the bookmark modal
function closeBookmarkModal() {
  document.getElementById("bookmarkModal").style.display = "none";
}

// Function to remove a bookmark from the modal
function removeBookmark(bookKey, pageNum) {
  const bookmarkKey = `bookmark-${bookKey}-page-${pageNum}`;
  localStorage.removeItem(bookmarkKey);
  
  // Remove the bookmark item from the list with animation
  const bookmarkItem = document.getElementById(`bookmark-item-${pageNum}`);
  bookmarkItem.style.transition = "all 0.3s ease";
  bookmarkItem.style.opacity = "0";
  bookmarkItem.style.transform = "translateX(100px)";
  
  setTimeout(() => {
    bookmarkItem.remove();
    
    // Check if there are any bookmarks left
    const bookmarkList = document.querySelector(".bookmark-list");
    if (bookmarkList && bookmarkList.children.length === 0) {
      document.getElementById("bookmarkModalBody").innerHTML = '<div class="no-bookmarks-message">You have no bookmarks yet for this book. Add bookmarks by clicking the star icon in the bottom controls or "Bookmark Current" in the sidebar.</div>';
    }
  }, 300);
  
  // Show notification
  showNotification(`Bookmark removed from page ${pageNum}`);
}

// Function to show a notification
function showNotification(message) {
  // Check if there's an existing notification
  let notification = document.querySelector('.notification');
  
  if (notification) {
    // If there's an existing notification, remove it
    notification.remove();
  }
  
  // Create a new notification
  notification = document.createElement('div');
  notification.className = 'notification';
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  // Fade in
  setTimeout(() => {
    notification.style.opacity = '1';
  }, 10);
  
  // Fade out after 3 seconds
  setTimeout(() => {
    notification.style.opacity = '0';
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}

// Close the modal when clicking outside of it
window.onclick = function(event) {
  const modal = document.getElementById("bookmarkModal");
  if (event.target === modal) {
    closeBookmarkModal();
  }
};