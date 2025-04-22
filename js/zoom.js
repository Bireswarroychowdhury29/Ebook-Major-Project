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
  // Reset any pan offset when zoom is reset
  resetPanOffset();
  // Important: Call updateZoom after resetting pan offset
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
  
  // Enable or disable panning based on zoom level
  if (zoomLevel > 1) {
    enablePanning();
  } else {
    disablePanning();
  }
}

// Pan functionality variables
let isPanning = false;
let startX, startY;
let panOffsetX = 0, panOffsetY = 0;
let lastPanOffsetX = 0, lastPanOffsetY = 0;

function enablePanning() {
  const flipbook = $('.flipbook-container');
  
  // Only attach events if not already attached
  if (!flipbook.data('pan-enabled')) {
    flipbook.on('mousedown touchstart', startPan);
    $(document).on('mousemove touchmove', pan);
    $(document).on('mouseup touchend', endPan);
    flipbook.data('pan-enabled', true);
    
    // Set cursor to grab to indicate content can be dragged
    flipbook.css('cursor', 'grab');
  }
}

function disablePanning() {
  const flipbook = $('.flipbook-container');
  
  flipbook.off('mousedown touchstart', startPan);
  $(document).off('mousemove touchmove', pan);
  $(document).off('mouseup touchend', endPan);
  flipbook.data('pan-enabled', false);
  
  // Reset cursor to default
  flipbook.css('cursor', 'default');
}

function resetPanOffset() {
  panOffsetX = 0;
  panOffsetY = 0;
  lastPanOffsetX = 0;
  lastPanOffsetY = 0;
  
  // Reset the transform property
  const flipbook = $('.flipbook-container');
  
  // Remove any translate transformations but keep other styles
  // Let the original positioning system handle centering
  flipbook.css({
    'transform': `scale(${zoomLevel})`,
    'left': '',
    'top': ''
  });
}

function startPan(e) {
  // Only pan when zoomed in
  if (zoomLevel <= 1) return;
  
  e.preventDefault();
  isPanning = true;
  
  // Get initial touch/mouse position
  if (e.type === 'touchstart') {
    startX = e.originalEvent.touches[0].pageX;
    startY = e.originalEvent.touches[0].pageY;
  } else {
    startX = e.pageX;
    startY = e.pageY;
  }
  
  // Store last offset
  lastPanOffsetX = panOffsetX;
  lastPanOffsetY = panOffsetY;
  
  // Change cursor to grabbing while actively dragging
  $('.flipbook-container').css('cursor', 'grabbing');
}

function pan(e) {
  if (!isPanning) return;
  
  let currentX, currentY;
  
  // Get current touch/mouse position
  if (e.type === 'touchmove') {
    currentX = e.originalEvent.touches[0].pageX;
    currentY = e.originalEvent.touches[0].pageY;
  } else {
    currentX = e.pageX;
    currentY = e.pageY;
  }
  
  // Calculate new offset
  const deltaX = currentX - startX;
  const deltaY = currentY - startY;
  
  panOffsetX = lastPanOffsetX + deltaX;
  panOffsetY = lastPanOffsetY + deltaY;
  
  // Apply the transform
  applyPanTransform();
}

function endPan() {
  if (!isPanning) return;
  
  isPanning = false;
  
  // Change cursor back to grab to indicate content can be dragged again
  $('.flipbook-container').css('cursor', 'grab');
}

function applyPanTransform() {
  // Get the flipbook element
  const flipbook = $('.flipbook-container');
  
  // Calculate limits to prevent excessive panning
  const maxPanX = (zoomLevel - 1) * flipbook.width();
  const maxPanY = (zoomLevel - 1) * flipbook.height();
  
  // Constrain pan within boundaries
  panOffsetX = Math.max(-maxPanX, Math.min(maxPanX, panOffsetX));
  panOffsetY = Math.max(-maxPanY, Math.min(maxPanY, panOffsetY));
  
  // Apply transform
  // Use a combined transform for both scale and translation
  flipbook.css('transform', `scale(${zoomLevel}) translate(${panOffsetX/zoomLevel}px, ${panOffsetY/zoomLevel}px)`);
}

// This function fully resets the book position and zoom
function fullResetBookPosition() {
  zoomLevel = 1;
  resetPanOffset();
  
  // Get the current page
  const currentPage = parseInt($("#pageInput").val());
  
  // Use existing function to properly center the book
  adjustFlipbookPosition(currentPage);
  
  // Update button positions
  updatePageTurnButtonPositions();
}