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
    navToggle.innerHTML =
      '<img src="images/cross.png" alt="Close" style="width: 30px; height: 30px;">';
  } else {
    navToggle.innerHTML =
      '<img src="images/burger.png" alt="Menu" style="width: 30px; height: 30px;">';
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
  const isCoverPage =
    currentPage === 1 ||
    currentPage === 2 ||
    currentPage === totalPages ||
    currentPage === totalPages - 1;

  // Update sidebar bookmark link state
  const sidebarBookmarkLink = document.getElementById("sidebarBookmarkLink");
  if (isCoverPage) {
    sidebarBookmarkLink.classList.add("disabled");
    sidebarBookmarkLink.onclick = function (e) {
      e.preventDefault();
      alert("Cannot bookmark cover pages");
      return false;
    };
  } else {
    sidebarBookmarkLink.classList.remove("disabled");
    sidebarBookmarkLink.onclick = function () {
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

// Function to adjust the flipbook position based on current page
function adjustFlipbookPosition(page) {
  if (!bookLoaded) return;

  const totalPages = $(".flipbook").turn("pages");

  // Apply position adjustment to container
  const container = $(".flipbook-container");

  // Add transition for smooth movement
  container.css({
    transition: "transform 0.5s ease-in-out",
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
    transform: `translateX(${translateXPercent}%) scale(${zoomLevel})`,
  });
}

// Function to update page turn button positions
function updatePageTurnButtonPositions() {
  const flipbookContainer = document.querySelector(".flipbook-container");
  const flipbook = document.querySelector(".flipbook");
  const leftBtn = document.getElementById("leftTurnBtn");
  const rightBtn = document.getElementById("rightTurnBtn");

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
      leftBtn.style.transition = "left 0.3s ease-in-out";
    }

    // Set right button position
    if (rightBtn) {
      rightBtn.style.right = `${20 * zoomLevel}px`;
      // Add smooth transition
      rightBtn.style.transition = "right 0.3s ease-in-out";
    }
  }
}
