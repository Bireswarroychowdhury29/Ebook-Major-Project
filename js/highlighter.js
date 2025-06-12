// Highlighter functionality for PageFlow
let isHighlighterActive = false;
let selectedColor = "#FFFF00"; // Default yellow
let startX, startY, endX, endY;
let highlighting = false;
let currentHighlightBox = null;
let currentHighlightPage = null; // Track which page is being highlighted
let highlights = {}; // Store highlights by page number
let activeHighlight = null; // Track currently selected highlight for deletion

// Colors for the highlighter
const highlightColors = [
  { color: "#FFFF00", name: "Yellow" }, // Yellow (default)
  { color: "#90EE90", name: "Green" }, // Light green
  { color: "#ADD8E6", name: "Blue" }, // Light blue
  { color: "#FFA07A", name: "Orange" }, // Light salmon
  { color: "#FFB6C1", name: "Pink" }, // Light pink
];

// Create color picker modal
function createColorPicker() {
  const colorPicker = document.createElement("div");
  colorPicker.className = "color-picker-modal";
  colorPicker.id = "colorPickerModal";

  highlightColors.forEach((colorObj) => {
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
      document.querySelectorAll(".color-option").forEach((option) => {
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

    // Cleanup any active highlight menu
    removeDeleteMenu();
  }
}

// Setup highlight event listeners
function setupHighlightListeners() {
  const pageWrappers = document.querySelectorAll(".page-wrapper");

  pageWrappers.forEach((wrapper) => {
    wrapper.addEventListener("mousedown", startHighlight);
    wrapper.addEventListener("mousemove", moveHighlight);
  });

  document.addEventListener("mouseup", endHighlight);
}

// Remove highlight event listeners
function removeHighlightListeners() {
  const pageWrappers = document.querySelectorAll(".page-wrapper");

  pageWrappers.forEach((wrapper) => {
    wrapper.removeEventListener("mousedown", startHighlight);
    wrapper.removeEventListener("mousemove", moveHighlight);
  });

  document.removeEventListener("mouseup", endHighlight);
}

// Create delete menu for highlights
function createDeleteMenu(highlight) {
  // Remove any existing delete menu
  removeDeleteMenu();

  const deleteMenu = document.createElement("div");
  deleteMenu.className = "highlight-delete-menu";
  deleteMenu.id = "highlightDeleteMenu";

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "highlight-delete-btn";
  deleteBtn.innerHTML =
    '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>';
  deleteBtn.title = "Delete highlight";

  // Add specific handler for the delete button
  deleteBtn.addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();
    if (highlight) {
      deleteHighlight(highlight);
    }
    return false;
  });

  deleteMenu.appendChild(deleteBtn);

  // Position menu in the top-right corner of the highlight
  const highlightRect = highlight.getBoundingClientRect();

  // Get position relative to the page, not the viewport
  deleteMenu.style.position = "absolute";
  deleteMenu.style.left = `${
    parseInt(highlight.style.left) + parseInt(highlight.style.width) - 20
  }px`;
  deleteMenu.style.top = `${parseInt(highlight.style.top) - 10}px`;

  // Important: Make sure we're appending to the right parent
  if (highlight.parentNode) {
    highlight.parentNode.appendChild(deleteMenu);
  }

  // Make the menu clickable
  deleteMenu.style.pointerEvents = "auto";
  deleteBtn.style.pointerEvents = "auto";
}

// Remove delete menu
function removeDeleteMenu() {
  const existingMenu = document.getElementById("highlightDeleteMenu");
  if (existingMenu && existingMenu.parentNode) {
    existingMenu.parentNode.removeChild(existingMenu);
  }

  // Clear active highlight reference
  if (activeHighlight) {
    activeHighlight.classList.remove("highlight-active");
    activeHighlight = null;
  }
}

// Delete highlight
function deleteHighlight(highlightElement) {
  if (!highlightElement) return;

  const pageElement = highlightElement.closest(".page");
  if (!pageElement) return;

  const pageWrapper = pageElement.closest(".page-wrapper");
  if (!pageWrapper) return;

  const pageNumber = parseInt(pageWrapper.getAttribute("page"));

  // Find the highlight in the stored highlights
  if (highlights[pageNumber]) {
    // Get position and dimensions of the highlight
    const highlightLeft = highlightElement.style.left;
    const highlightTop = highlightElement.style.top;
    const highlightWidth = highlightElement.style.width;
    const highlightHeight = highlightElement.style.height;

    // Filter out the highlight that matches these dimensions
    highlights[pageNumber] = highlights[pageNumber].filter(
      (h) =>
        h.left !== highlightLeft ||
        h.top !== highlightTop ||
        h.width !== highlightWidth ||
        h.height !== highlightHeight
    );

    // Save the updated highlights
    saveHighlights();
  }

  // Remove the highlight element from the DOM
  if (highlightElement && highlightElement.parentNode) {
    highlightElement.parentNode.removeChild(highlightElement);
  }

  // Remove the delete menu
  removeDeleteMenu();
}

// Start highlighting
function startHighlight(e) {
  // Check if we're interacting with a delete menu
  if (
    e.target.closest(".highlight-delete-menu") ||
    e.target.classList.contains("highlight-delete-btn") ||
    e.target.closest(".highlight-delete-btn")
  ) {
    return; // Don't do anything when clicking on delete menu
  }

  // Check if the highlighter is active
  if (!isHighlighterActive) return;

  // Check if we're on a valid page for highlighting
  const pageWrapper = e.currentTarget;
  const pageNumber = parseInt(pageWrapper.getAttribute("page"));

  // Skip if this is the cover page (page 1)
  if (pageNumber === 1 || pageNumber === $(".flipbook").turn("pages")) {
    return;
  }

  // Check if the click was on a highlight element (for deletion)
  if (e.target.classList.contains("highlight-box")) {
    e.preventDefault();
    e.stopPropagation();

    // Set as active highlight
    if (activeHighlight) {
      activeHighlight.classList.remove("highlight-active");
    }
    activeHighlight = e.target;
    activeHighlight.classList.add("highlight-active");

    // Show delete menu
    createDeleteMenu(e.target);
    return;
  }

  // Remove delete menu when clicking elsewhere
  removeDeleteMenu();

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
  currentHighlightBox.style.width = "0px";
  currentHighlightBox.style.height = "0px";
  currentHighlightBox.style.pointerEvents = "auto"; // Ensure it's clickable

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
function endHighlight(e) {
  if (!highlighting || !isHighlighterActive) return;

  highlighting = false;

  // Save highlight
  if (
    currentHighlightBox &&
    parseInt(currentHighlightBox.style.width) > 5 &&
    parseInt(currentHighlightBox.style.height) > 5
  ) {
    // Initialize page highlights array if it doesn't exist
    if (!highlights[currentHighlightPage]) {
      highlights[currentHighlightPage] = [];
    }

    // Store highlight data
    const highlightData = {
      color: selectedColor,
      left: currentHighlightBox.style.left,
      top: currentHighlightBox.style.top,
      width: currentHighlightBox.style.width,
      height: currentHighlightBox.style.height,
    };

    // Add highlight to storage
    highlights[currentHighlightPage].push(highlightData);

    // Make highlight clickable - crucial to add this event here
    currentHighlightBox.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();

      // Set as active highlight
      if (activeHighlight) {
        activeHighlight.classList.remove("highlight-active");
      }
      activeHighlight = this;
      activeHighlight.classList.add("highlight-active");

      // Show delete menu
      createDeleteMenu(this);

      return false;
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
    } else {
      highlights = {}; // Make sure highlights is initialized as empty object
    }
  }
}

// Get book ID from URL or page
function getBookId() {
  // This should be adapted to your application's way of identifying books
  const urlParams = new URLSearchParams(window.location.search);
  return (
    urlParams.get("book") ||
    document.getElementById("bookTitle")?.dataset?.bookId ||
    "default-book"
  );
}

// Clear existing highlights from a page
function clearHighlightsFromPage(pageNumber) {
  const pageElement = document.querySelector(
    `.page-wrapper[page="${pageNumber}"] .page`
  );
  
  if (!pageElement) return;
  
  // Remove all existing highlight elements from the page
  const existingHighlights = pageElement.querySelectorAll('.highlight-box');
  existingHighlights.forEach(highlight => {
    highlight.remove();
  });
}

// Apply highlights to current page
function applyHighlightsToPage(pageNumber) {
  if (!highlights[pageNumber]) return;

  // IMPORTANT: Clear existing highlights first to prevent opacity stacking
  clearHighlightsFromPage(pageNumber);

  const pageElement = document.querySelector(
    `.page-wrapper[page="${pageNumber}"] .page`
  );

  if (!pageElement) return;

  highlights[pageNumber].forEach((highlight) => {
    const highlightDiv = document.createElement("div");
    highlightDiv.className = "highlight-box";
    highlightDiv.style.backgroundColor = highlight.color;
    highlightDiv.style.position = "absolute";
    highlightDiv.style.left = highlight.left;
    highlightDiv.style.top = highlight.top;
    highlightDiv.style.width = highlight.width;
    highlightDiv.style.height = highlight.height;
    highlightDiv.style.pointerEvents = "auto"; // Ensure it's clickable

    // Add click event to the highlight box - crucial for loaded highlights
    highlightDiv.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();

      // Set as active highlight
      if (activeHighlight) {
        activeHighlight.classList.remove("highlight-active");
      }
      activeHighlight = this;
      activeHighlight.classList.add("highlight-active");

      // Show delete menu
      createDeleteMenu(this);

      return false;
    });

    pageElement.appendChild(highlightDiv);
  });
}

// Update highlighter button state based on current page
function updateHighlighterState() {
  const currentPage = $(".flipbook").turn("page");
  const totalPages = $(".flipbook").turn("pages");
  const highlighterBtn = document.getElementById("highlight-btn");

  if (!highlighterBtn) return;

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

// Add CSS styles for the highlight interactions
function addHighlightStyles() {
  // Check if styles already exist
  if (document.getElementById("highlight-styles")) return;

  const styleSheet = document.createElement("style");
  styleSheet.id = "highlight-styles";
  styleSheet.type = "text/css";
  styleSheet.innerHTML = `
    .highlight-box {
      position: absolute;
      opacity: 0.5;
      cursor: pointer;
      transition: opacity 0.2s ease;
      z-index: 10;
      pointer-events: auto;
    }
    .highlight-box:hover {
      opacity: 0.7;
    }
    .highlight-box.highlight-active {
      opacity: 0.7;
      box-shadow: 0 0 0 2px rgba(0,0,0,0.2);
    }
    .highlight-delete-menu {
      position: absolute;
      z-index: 100;
      pointer-events: auto;
    }
    .highlight-delete-btn {
      background-color: white;
      border: 1px solid #ccc;
      border-radius: 50%;
      width: 24px;
      height: 24px;
      padding: 2px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
      pointer-events: auto;
    }
    .highlight-delete-btn:hover {
      background-color: #f5f5f5;
    }
    .highlight-delete-btn svg {
      pointer-events: none;
    }
    .no-highlights-message {
      text-align: center;
      padding: 20px;
      color: #666;
      font-style: italic;
    }
  `;
  document.head.appendChild(styleSheet);
}

// Initialize highlighter
function initHighlighter() {
  // Create color picker
  createColorPicker();

  // Add highlight styles
  addHighlightStyles();

  // Load saved highlights
  loadHighlights();

  // Set up page turn event to apply highlights and update button state
  $(".flipbook").bind("turned", function (event, page, view) {
    updateHighlighterState();

    // Remove any active delete menu when turning pages
    removeDeleteMenu();

    // Apply highlights to visible pages
    if (view && view.length) {
      view.forEach((pageNum) => {
        if (pageNum > 0 && pageNum !== 1) {
          applyHighlightsToPage(pageNum);
        }
      });
    }
  });

  // Handle clicks outside of highlights to dismiss delete menu
  document.addEventListener("click", function (e) {
    // Don't dismiss if clicking on highlight or delete menu
    if (
      e.target.classList.contains("highlight-box") ||
      e.target.closest(".highlight-delete-menu") ||
      e.target.classList.contains("highlight-delete-btn")
    ) {
      return;
    }

    removeDeleteMenu();
  });

  // Initialize highlighter state
  updateHighlighterState();

  // Apply initial highlights to current visible pages
  const currentView = $(".flipbook").turn("view");
  if (currentView && currentView.length) {
    currentView.forEach((pageNum) => {
      if (pageNum > 0 && pageNum !== 1) {
        applyHighlightsToPage(pageNum);
      }
    });
  }
}

// Function to go to a specific page and close the highlight modal
function goToPageNumber(pageNum) {
  // Go to the specified page
  $(".flipbook").turn("page", pageNum);

  // Close the highlight modal
  closeHighlightModal();
}

// Function to display all highlights in a modal
function displayHighlights() {
  if (!bookLoaded) return;

  const highlightModalBody = document.getElementById("highlightModalBody");
  highlightModalBody.innerHTML = "";

  // Get the book ID
  const bookId = getBookId();

  // Load highlights for this book
  loadHighlights();

  let hasHighlights = false;

  // Check if there are any highlights in the book
  const pageNumbers = Object.keys(highlights);
  let totalHighlightsCount = 0;

  pageNumbers.forEach((pageNum) => {
    if (highlights[pageNum] && highlights[pageNum].length > 0) {
      totalHighlightsCount += highlights[pageNum].length;
    }
  });

  // If no highlights found, show message
  if (totalHighlightsCount === 0) {
    highlightModalBody.innerHTML =
      '<div class="no-highlights-message">' +
      "<p>No highlighted content found in this document.</p>" +
      "<p>Use the highlighter tool from the controls panel to mark important sections.</p>" +
      "</div>";
  } else {
    // Sort page numbers numerically
    const sortedPageNumbers = pageNumbers.sort(
      (a, b) => parseInt(a) - parseInt(b)
    );

    let highlightHTML = '<ul class="highlight-list">';

    sortedPageNumbers.forEach((pageNum) => {
      const pageHighlights = highlights[pageNum];
      if (pageHighlights && pageHighlights.length > 0) {
        hasHighlights = true;

        // For each page with highlights, create an entry
        // Use the first highlight's color as the indicator
        const firstHighlightColor = pageHighlights[0].color;

        highlightHTML += `
          <li class="highlight-item" id="highlight-item-${pageNum}">
            <div class="highlight-item-info">
              <span class="highlight-color-indicator" style="background-color: ${firstHighlightColor};"></span>
              <span class="highlight-page-number">Page ${pageNum}</span>
              <span class="highlight-count">(${
                pageHighlights.length
              } highlight${pageHighlights.length > 1 ? "s" : ""})</span>
            </div>
            <div class="highlight-actions">
              <button class="highlight-goto" onclick="goToPageNumber(${pageNum})">Go to page</button>
            </div>
          </li>
        `;
      }
    });

    highlightHTML += "</ul>";
    highlightModalBody.innerHTML = highlightHTML;
  }

  // Show the modal
  document.getElementById("highlightModal").style.display = "flex";
}

// Function to close the highlight modal
function closeHighlightModal() {
  document.getElementById("highlightModal").style.display = "none";
}

// Initialize when document is ready
if (
  document.readyState === "complete" ||
  document.readyState === "interactive"
) {
  setTimeout(initHighlighter, 1);
} else {
  document.addEventListener("DOMContentLoaded", initHighlighter);
}