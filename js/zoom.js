// Zoom and Pan functionality
let panOffsetX = 0;
let panOffsetY = 0;
let isPanning = false;
let panStartX = 0;
let panStartY = 0;
let panStartOffsetX = 0;
let panStartOffsetY = 0;

function zoomIn() {
  if (zoomLevel < 2) {
    zoomLevel += 0.2;
    updateZoom();
  }
}

function zoomOut() {
  if (zoomLevel > 0.6) {
    zoomLevel -= 0.2;
    // When zooming out, check if we need to reset pan offsets
    if (zoomLevel <= 1) {
      panOffsetX = 0;
      panOffsetY = 0;
    }
    updateZoom();
  }
}

function resetZoom() {
  zoomLevel = 1;
  panOffsetX = 0;
  panOffsetY = 0;
  updateZoom();
}

function updateZoom() {
  if (!bookLoaded) return;

  // Get the current page to maintain proper positioning
  const currentPage = parseInt($("#pageInput").val());

  // Apply both zoom and position adjustment (keep original function)
  adjustFlipbookPosition(currentPage);
  
  // Apply pan transform separately to avoid interfering with centering
  applyPanTransform();

  // Update buttons position after zoom
  updatePageTurnButtonPositions();
  
  // Setup or remove pan functionality based on zoom level
  setupPanFunctionality();
}

function setupPanFunctionality() {
  const flipbook = $(".flipbook");
  
  // Remove existing pan event listeners first to avoid duplicates
  removePanEventListeners();
  
  // Only enable panning when zoomed in beyond normal size
  if (zoomLevel > 1) {
    // Add pan event listeners
    flipbook.on('mousedown.pan', startPan);
    $(document).on('mousemove.pan', doPan);
    $(document).on('mouseup.pan', endPan);
    
    // Add cursor styles for panning
    flipbook.addClass('pan-enabled');
  } else {
    // Remove pan capability when at normal zoom
    flipbook.removeClass('pan-enabled pan-active');
  }
}

function removePanEventListeners() {
  const flipbook = $(".flipbook");
  flipbook.off('mousedown.pan');
  $(document).off('mousemove.pan mouseup.pan');
}

function startPan(e) {
  // Don't start panning if we're not zoomed in enough
  if (zoomLevel <= 1) return;
  
  // Don't start panning if clicking on controls, highlights, or other interactive elements
  if ($(e.target).closest('.controls, .highlight-box, .highlight-delete-menu, .page-turn-btn, .sidebar').length > 0) {
    return;
  }
  
  // Don't interfere with highlighter functionality
  if (isHighlighterActive) return;
  
  isPanning = true;
  panStartX = e.clientX;
  panStartY = e.clientY;
  panStartOffsetX = panOffsetX;
  panStartOffsetY = panOffsetY;
  
  // Change cursor to grabbing/closed hand
  $(".flipbook").addClass('pan-active');
  
  // Prevent text selection and other default behaviors
  e.preventDefault();
}

function doPan(e) {
  if (!isPanning || zoomLevel <= 1) return;
  
  const deltaX = e.clientX - panStartX;
  const deltaY = e.clientY - panStartY;
  
  // Calculate new pan offsets
  const newPanOffsetX = panStartOffsetX + deltaX;
  const newPanOffsetY = panStartOffsetY + deltaY;
  
  // Get flipbook container dimensions for boundary checking
  const flipbookContainer = $(".flipbook-container");
  const containerWidth = flipbookContainer.width();
  const containerHeight = flipbookContainer.height();
  
  // Get flipbook dimensions when zoomed
  const flipbookWidth = 1000 * zoomLevel; // Original width * zoom
  const flipbookHeight = 650 * zoomLevel; // Original height * zoom
  
  // Calculate maximum pan boundaries
  const maxPanX = Math.max(0, (flipbookWidth - containerWidth) / 2);
  const maxPanY = Math.max(0, (flipbookHeight - containerHeight) / 2);
  
  // Constrain pan offsets to boundaries
  panOffsetX = Math.max(-maxPanX, Math.min(maxPanX, newPanOffsetX));
  panOffsetY = Math.max(-maxPanY, Math.min(maxPanY, newPanOffsetY));
  
  // Apply the pan transformation separately
  applyPanTransform();
  
  e.preventDefault();
}

function endPan(e) {
  if (!isPanning) return;
  
  isPanning = false;
  
  // Change cursor back to grab/open hand
  $(".flipbook").removeClass('pan-active');
  
  e.preventDefault();
}

// Apply pan transform separately from the main positioning
function applyPanTransform() {
  if (!bookLoaded) return;
  
  const flipbook = $(".flipbook");
  
  // Get existing transform (from original adjustFlipbookPosition)
  const existingTransform = flipbook.css("transform") || "";
  
  // Add pan translation if zoomed in
  if (zoomLevel > 1 && (panOffsetX !== 0 || panOffsetY !== 0)) {
    // Extract scale from existing transform or use current zoom level
    const scaleMatch = existingTransform.match(/scale\(([^)]+)\)/);
    const currentScale = scaleMatch ? scaleMatch[1] : zoomLevel;
    
    // Apply both scale and translate
    const newTransform = `scale(${currentScale}) translate(${panOffsetX}px, ${panOffsetY}px)`;
    flipbook.css({
      "transform": newTransform,
      "transform-origin": "center center"
    });
  } else if (zoomLevel <= 1) {
    // Reset to original transform when not zoomed in
    flipbook.css({
      "transform": `scale(${zoomLevel})`,
      "transform-origin": "center center"
    });
  }
}

// Add CSS styles for pan functionality
function addPanStyles() {
  // Check if pan styles already exist
  if (document.getElementById("pan-styles")) return;

  const styleSheet = document.createElement("style");
  styleSheet.id = "pan-styles";
  styleSheet.type = "text/css";
  styleSheet.innerHTML = `
    .flipbook.pan-enabled {
      cursor: grab;
      cursor: -webkit-grab;
    }
    
    .flipbook.pan-enabled.pan-active {
      cursor: grabbing !important;
      cursor: -webkit-grabbing !important;
    }
    
    .flipbook.pan-enabled * {
      pointer-events: none;
    }
    
    .flipbook.pan-enabled .highlight-box,
    .flipbook.pan-enabled .highlight-delete-menu,
    .flipbook.pan-enabled .highlight-delete-btn {
      pointer-events: auto;
    }
    
    /* Ensure controls remain interactive */
    .controls,
    .page-turn-btn,
    .sidebar,
    .modal {
      pointer-events: auto !important;
    }
    
    .controls *,
    .page-turn-btn *,
    .sidebar *,
    .modal * {
      pointer-events: auto !important;
    }
  `;
  document.head.appendChild(styleSheet);
}

// Initialize pan functionality
function initPanFunctionality() {
  // Add pan styles
  addPanStyles();
  
  // Setup initial pan state
  setupPanFunctionality();
  
  // Reset pan offsets when page changes
  $(".flipbook").bind("turned", function(event, page, view) {
    // Apply pan transform after page turn to maintain position
    if (zoomLevel > 1) {
      // Small delay to ensure page turn animation completes
      setTimeout(() => {
        applyPanTransform();
      }, 100);
    }
  });
}

// Make sure to initialize when document is ready
if (document.readyState === "complete" || document.readyState === "interactive") {
  setTimeout(initPanFunctionality, 1);
} else {
  document.addEventListener("DOMContentLoaded", initPanFunctionality);
}