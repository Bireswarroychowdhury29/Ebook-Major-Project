// Highlighter functionality for PageFlow
let isHighlighterActive = false;
let selectedColor = "#FFFF00"; // Default yellow
let startX, startY, endX, endY;
let highlighting = false;
let currentHighlightBox = null;
let currentHighlightPage = null; // Track which page is being highlighted
let highlights = {};  // Store highlights by page number

// Colors for the highlighter
const highlightColors = [
  { color: "#FFFF00", name: "Yellow" },  // Yellow (default)
  { color: "#90EE90", name: "Green" },   // Light green
  { color: "#ADD8E6", name: "Blue" },    // Light blue
  { color: "#FFA07A", name: "Orange" },  // Light salmon
  { color: "#FFB6C1", name: "Pink" }     // Light pink
];

// Create color picker modal
function createColorPicker() {
  const colorPicker = document.createElement("div");
  colorPicker.className = "color-picker-modal";
  colorPicker.id = "colorPickerModal";
  
  highlightColors.forEach(colorObj => {
    const colorOption = document.createElement("div");
    colorOption.className = "color-option";
    colorOption.style.backgroundColor = colorObj.color;
    colorOption.setAttribute("data-color", colorObj.color);
    colorOption.title = colorObj.name;
    
    // Mark default color as selected
    if (colorObj.color === selectedColor) {
      colorOption.classList.add("selected");
    }
    
    colorOption.addEventListener("click", () => {
      // Remove selected class from all options
      document.querySelectorAll(".color-option").forEach(option => {
        option.classList.remove("selected");
      });
      
      // Add selected class to clicked option
      colorOption.classList.add("selected");
      selectedColor = colorObj.color;
      
      // Hide color picker after selection
      document.getElementById("colorPickerModal").style.display = "none";
    });
    
    colorPicker.appendChild(colorOption);
  });
  
  document.body.appendChild(colorPicker);
}

// Toggle highlighter mode
function toggleHighlighter() {
  isHighlighterActive = !isHighlighterActive;
  
  // Toggle active class on highlighter control
  const highlighterControl = document.querySelector(".highlighter-control");
  if (isHighlighterActive) {
    highlighterControl.classList.add("active");
    document.querySelector(".flipbook").classList.add("highlight-active");
    
    // Show color picker next to highlighter button
    const highlighterBtn = document.getElementById("highlight-btn");
    const colorPicker = document.getElementById("colorPickerModal");
    
    const btnRect = highlighterBtn.getBoundingClientRect();
    colorPicker.style.display = "flex";
    colorPicker.style.left = `${btnRect.left}px`;
    colorPicker.style.top = `${btnRect.top - colorPicker.offsetHeight - 10}px`;
    
    // Add event listeners for highlighting
    setupHighlightListeners();
  } else {
    highlighterControl.classList.remove("active");
    document.querySelector(".flipbook").classList.remove("highlight-active");
    document.getElementById("colorPickerModal").style.display = "none";
    
    // Remove event listeners for highlighting
    removeHighlightListeners();
  }
}

// Setup highlight event listeners
function setupHighlightListeners() {
  const pageWrappers = document.querySelectorAll(".page-wrapper");
  
  pageWrappers.forEach(wrapper => {
    wrapper.addEventListener("mousedown", startHighlight);
    wrapper.addEventListener("mousemove", moveHighlight);
  });
  
  document.addEventListener("mouseup", endHighlight);
}

// Remove highlight event listeners
function removeHighlightListeners() {
  const pageWrappers = document.querySelectorAll(".page-wrapper");
  
  pageWrappers.forEach(wrapper => {
    wrapper.removeEventListener("mousedown", startHighlight);
    wrapper.removeEventListener("mousemove", moveHighlight);
  });
  
  document.removeEventListener("mouseup", endHighlight);
}

// Start highlighting
function startHighlight(e) {
  if (!isHighlighterActive) return;
  
  // Check if we're on a valid page for highlighting
  const pageWrapper = e.currentTarget;
  const pageNumber = parseInt(pageWrapper.getAttribute("page"));
  
  // Skip if this is the cover page (page 1)
  if (pageNumber === 1 || pageNumber === $('.flipbook').turn('pages')) {
    return;
  }
  
  highlighting = true;
  currentHighlightPage = pageNumber;
  
  // Get position relative to the current page
  const pageElement = pageWrapper.querySelector(".page");
  const pageRect = pageElement.getBoundingClientRect();
  
  startX = e.clientX - pageRect.left;
  startY = e.clientY - pageRect.top;
  
  // Create a new highlight box
  currentHighlightBox = document.createElement("div");
  currentHighlightBox.className = "highlight-box";
  currentHighlightBox.style.backgroundColor = selectedColor;
  currentHighlightBox.style.position = "absolute";
  currentHighlightBox.style.left = `${startX}px`;
  currentHighlightBox.style.top = `${startY}px`;
  
  // Add to the current page
  pageElement.appendChild(currentHighlightBox);
}

// Move highlighting
function moveHighlight(e) {
  if (!highlighting || !isHighlighterActive || !currentHighlightBox) return;
  
  // Only continue if we're on the same page where highlighting started
  const pageWrapper = e.currentTarget;
  const pageNumber = parseInt(pageWrapper.getAttribute("page"));
  
  if (pageNumber !== currentHighlightPage) return;
  
  // Get position relative to the current page
  const pageElement = pageWrapper.querySelector(".page");
  const pageRect = pageElement.getBoundingClientRect();
  
  endX = e.clientX - pageRect.left;
  endY = e.clientY - pageRect.top;
  
  // Calculate dimensions
  const width = Math.abs(endX - startX);
  const height = Math.abs(endY - startY);
  
  // Set position
  const left = Math.min(startX, endX);
  const top = Math.min(startY, endY);
  
  currentHighlightBox.style.width = `${width}px`;
  currentHighlightBox.style.height = `${height}px`;
  currentHighlightBox.style.left = `${left}px`;
  currentHighlightBox.style.top = `${top}px`;
}

// End highlighting
function endHighlight() {
  if (!highlighting || !isHighlighterActive) return;
  
  highlighting = false;
  
  // Save highlight
  if (currentHighlightBox && 
      parseInt(currentHighlightBox.style.width) > 5 && 
      parseInt(currentHighlightBox.style.height) > 5) {
    
    // Initialize page highlights array if it doesn't exist
    if (!highlights[currentHighlightPage]) {
      highlights[currentHighlightPage] = [];
    }
    
    // Add highlight to page
    highlights[currentHighlightPage].push({
      color: selectedColor,
      left: currentHighlightBox.style.left,
      top: currentHighlightBox.style.top,
      width: currentHighlightBox.style.width,
      height: currentHighlightBox.style.height
    });
    
    // Save highlights to localStorage
    saveHighlights();
  } else if (currentHighlightBox && currentHighlightBox.parentNode) {
    // Remove tiny highlights
    currentHighlightBox.parentNode.removeChild(currentHighlightBox);
  }
  
  currentHighlightBox = null;
  currentHighlightPage = null;
}

// Save highlights to localStorage
function saveHighlights() {
  // Get current book ID or filename
  const bookId = getBookId();
  if (bookId) {
    localStorage.setItem(`highlights_${bookId}`, JSON.stringify(highlights));
  }
}

// Load highlights from localStorage
function loadHighlights() {
  const bookId = getBookId();
  if (bookId) {
    const savedHighlights = localStorage.getItem(`highlights_${bookId}`);
    if (savedHighlights) {
      highlights = JSON.parse(savedHighlights);
    }
  }
}

// Get book ID from URL or page
function getBookId() {
  // This should be adapted to your application's way of identifying books
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('book') || document.getElementById('bookTitle').dataset.bookId;
}

// Apply highlights to current page
function applyHighlightsToPage(pageNumber) {
  if (!highlights[pageNumber]) return;
  
  const pageElement = document.querySelector(`.page-wrapper[page="${pageNumber}"] .page`);
  
  if (!pageElement) return;
  
  highlights[pageNumber].forEach(highlight => {
    const highlightDiv = document.createElement("div");
    highlightDiv.className = "highlight-box";
    highlightDiv.style.backgroundColor = highlight.color;
    highlightDiv.style.left = highlight.left;
    highlightDiv.style.top = highlight.top;
    highlightDiv.style.width = highlight.width;
    highlightDiv.style.height = highlight.height;
    
    pageElement.appendChild(highlightDiv);
  });
}

// Update highlighter button state based on current page
function updateHighlighterState() {
  const currentPage = $('.flipbook').turn('page');
  const totalPages = $('.flipbook').turn('pages');
  const highlighterBtn = document.getElementById("highlight-btn");
  
  // Disable on first page (cover)
  if (currentPage === 1) {
    highlighterBtn.disabled = true;
    highlighterBtn.title = "Highlighting disabled on cover pages";
    
    // If highlighter is active, deactivate it
    if (isHighlighterActive) {
      toggleHighlighter();
    }
  } else {
    highlighterBtn.disabled = false;
    highlighterBtn.title = "Highlight Text";
  }
}

// Initialize highlighter
function initHighlighter() {
  // Create color picker
  createColorPicker();
  
  // Load saved highlights
  loadHighlights();
  
  // Set up page turn event to apply highlights and update button state
  $('.flipbook').bind('turned', function(event, page, view) {
    updateHighlighterState();
    
    // Apply highlights to visible pages
    if (view && view.length) {
      view.forEach(pageNum => {
        if (pageNum > 0 && pageNum !== 1) {
          applyHighlightsToPage(pageNum);
        }
      });
    }
  });
  
  // Initialize highlighter state
  updateHighlighterState();
}

// Initialize when document is ready
document.addEventListener("DOMContentLoaded", initHighlighter);