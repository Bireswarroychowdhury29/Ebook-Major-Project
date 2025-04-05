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
