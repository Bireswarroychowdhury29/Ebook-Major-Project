$(document).ready(function () {
    const flipbook = $(".flipbook");
    flipbook.turn();
  
    $('.flipbook').css({
      'margin-left': 'auto',
      'margin-right': 'auto'
    });
    
    const totalPages = flipbook.turn("pages");
    $("#pageTotal").text(` / ${totalPages}`);
    
    // Initial adjustment for first page
    updatePageIndex(1);
    adjustFlipbookPosition(1);
  
    flipbook.bind("turning", function (event, page) {
      updatePageIndex(page);
      adjustFlipbookPosition(page);
    });
  
    $("#pageInput").keypress(function (event) {
      if (event.key === "Enter") {
        goToPage();
      }
    });
  
    // Load and display bookmarks
    $("#bookmarksMenu").click(function(e) {
      e.preventDefault();
      displayBookmarks();
    });
    
    // Initialize bookmark button state
    updateSidebarBookmarkState(1);
    updatePageTurnButtonPositions();
  
    setTimeout(updatePageTurnButtonPositions, 100);
  
    $(window).on('resize', function() {
      updatePageTurnButtonPositions();
    });
    
    // Initialize static controls
    initializeStaticControls();
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
    const totalPages = $(".flipbook").turn("pages");
    
    // Apply position adjustment to container instead of flipbook
    const container = $(".flipbook-container");
    
    // Add transition for smooth movement
    container.css({
      'transition': 'transform 0.3s ease-in-out'
    });
    
    // Check if we're on first page (cover) or last page
    if (page === 1 || page === totalPages) {
      // Shift container to center the single page
      const translateX = page === 1 ? -24 : 21;
      updateContainerPosition(translateX);
    } else {
      // Reset to center for two-page spreads
      updateContainerPosition(0);
    }
    
    // Update page turn buttons after position change
    updatePageTurnButtonPositions();
  }
  
  // New function to update container position and zoom together
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
      navToggle.innerHTML = '<i class="fas fa-times" style="font-size: 20px; color: white;"></i>';
    } else {
      navToggle.innerHTML = '<i class="fas fa-bars" style="font-size: 20px; color: white;"></i>';
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
    const pageNumber = parseInt($("#pageInput").val());
    const totalPages = $(".flipbook").turn("pages");
  
    if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= totalPages) {
      $(".flipbook").turn("page", pageNumber);
    } else {
      alert(`Enter a valid page number (1 - ${totalPages})`);
    }
  }
  
  let zoomLevel = 1;
  
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
    // Get current page for position adjustment
    const currentPage = parseInt($("#pageInput").val());
    const totalPages = $(".flipbook").turn("pages");
    
    let translateX = 0;
    if (currentPage === 1) {
      translateX = -25;
    } else if (currentPage === totalPages) {
      translateX = 25;
    }
    
    // Apply zoom to container instead of flipbook
    updateContainerPosition(translateX);
    
    // Update buttons position after zoom
    updatePageTurnButtonPositions();
    
    // Controls are now handled by the static wrapper
    // No need to modify them here
  }
  
  function updateBookmarkButton(currentPage) {
    const totalPages = $(".flipbook").turn("pages");
    const isCoverPage = (currentPage === 1 || currentPage === 2 || currentPage === totalPages || currentPage === totalPages - 1);
    
    $("#bookmarkBtn").prop("disabled", isCoverPage);
  }
  
  function toggleBookmark() {
    const currentPage = parseInt($("#pageInput").val());
    const totalPages = $(".flipbook").turn("pages");
    const isCoverPage = (currentPage === 1 || currentPage === 2 || currentPage === totalPages || currentPage === totalPages - 1);
    
    if (isCoverPage) {
      alert("Cannot bookmark cover pages");
      return;
    }
  
    if (!isNaN(currentPage)) {
      if (localStorage.getItem(`bookmark-page-${currentPage}`)) {
        localStorage.removeItem(`bookmark-page-${currentPage}`);
        
        // Show a nicer notification
        showNotification(`Bookmark removed from page ${currentPage}`);
      } else {
        localStorage.setItem(`bookmark-page-${currentPage}`, "bookmarked");
        
        // Show a nicer notification
        showNotification(`Page ${currentPage} bookmarked!`);
      }
    }
  }
  
  // Function to display bookmarks in a modal
  function displayBookmarks() {
    const bookmarkModalBody = document.getElementById("bookmarkModalBody");
    bookmarkModalBody.innerHTML = "";
    
    let hasBookmarks = false;
    let bookmarkHTML = '<ul class="bookmark-list">';
    
    // Check for bookmarks in localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith("bookmark-page-")) {
        hasBookmarks = true;
        const pageNum = key.replace("bookmark-page-", "");
        bookmarkHTML += `
          <li class="bookmark-item" id="bookmark-item-${pageNum}">
            <div class="bookmark-item-info">
              <i class="fas fa-bookmark bookmark-icon"></i>
              <span class="bookmark-page-number">Page ${pageNum}</span>
            </div>
            <div class="bookmark-actions">
              <button class="bookmark-goto" onclick="goToPageNumber(${pageNum})">Go to page</button>
              <button class="bookmark-remove" onclick="removeBookmark(${pageNum})">Remove</button>
            </div>
          </li>
        `;
      }
    }
    
    bookmarkHTML += '</ul>';
    
    if (!hasBookmarks) {
      bookmarkModalBody.innerHTML = '<div class="no-bookmarks-message">You have no bookmarks yet. Add bookmarks by clicking the star icon in the bottom controls or "Bookmark Current" in the sidebar.</div>';
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
  function removeBookmark(pageNum) {
    localStorage.removeItem(`bookmark-page-${pageNum}`);
    
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
        document.getElementById("bookmarkModalBody").innerHTML = '<div class="no-bookmarks-message">You have no bookmarks yet. Add bookmarks by clicking the star icon in the bottom controls or "Bookmark Current" in the sidebar.</div>';
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
  }