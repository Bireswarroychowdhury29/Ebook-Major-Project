// Initialize global variables
let pdfDoc = null;
let bookTitle = "Book Viewer";
let bookLoaded = false;
let zoomLevel = 1;
let currentBookPath = "";
let bookData = [];

$(document).ready(function () {
  // Show loading overlay
  $("#loadingOverlay").show();

  // Get book path from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  currentBookPath = urlParams.get("bookPath");

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
  $("#bookmarksMenu").click(function (e) {
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
  $(window).on("resize", function () {
    updatePageTurnButtonPositions();
    // Also ensure proper centering on resize
    $(".flipbook").css({
      "margin-left": "auto",
      "margin-right": "auto",
    });
  });

  // Make sure buttons position updates after a short delay
  setTimeout(updatePageTurnButtonPositions, 100);
});

// Function to create static controls that won't be affected by zoom
function initializeStaticControls() {
  // Get the controls container
  const controlsContainer = $("#controlsContainer");

  // Remove the controls container from its current position in the DOM
  controlsContainer.detach();

  // Create a new wrapper for controls that will stay fixed
  const staticWrapper = $('<div id="staticControlsWrapper"></div>');
  staticWrapper.css({
    position: "fixed",
    bottom: "10px",
    left: "50%",
    transform: "translateX(calc(-50% - 25px))", // Added negative offset to shift left
    "z-index": "9999",
    display: "flex",
    "flex-direction": "column",
    "align-items": "center",
    "pointer-events": "auto",
  });

  // Append the controls to this wrapper
  staticWrapper.append(controlsContainer);

  // Make sure the controls themselves have proper centering styles
  controlsContainer.css({
    transform: "none",
    position: "relative",
    left: "0",
    bottom: "0",
    margin: "0",
    width: "fit-content",
  });

  // Add the wrapper to the body
  $("body").append(staticWrapper);
}

// Function to show a notification
function showNotification(message) {
  // Check if there's an existing notification
  let notification = document.querySelector(".notification");

  if (notification) {
    // If there's an existing notification, remove it
    notification.remove();
  }

  // Create a new notification
  notification = document.createElement("div");
  notification.className = "notification";
  notification.textContent = message;

  document.body.appendChild(notification);

  // Fade in
  setTimeout(() => {
    notification.style.opacity = "1";
  }, 10);

  // Fade out after 3 seconds
  setTimeout(() => {
    notification.style.opacity = "0";
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}

// Close the modal when clicking outside of it
window.onclick = function (event) {
  const modal = document.getElementById("bookmarkModal");
  if (event.target === modal) {
    closeBookmarkModal();
  }
};
