function updateBookmarkButton(currentPage) {
  if (!bookLoaded) return;

  const totalPages = $(".flipbook").turn("pages");
  const isCoverPage = currentPage === 1 || currentPage === totalPages;

  $("#bookmarkBtn").prop("disabled", isCoverPage);
  
  // Update button appearance based on existing bookmark
  if (!isCoverPage) {
    const bookKey = currentBookPath
      ? currentBookPath.replace(/[^a-zA-Z0-9]/g, "-")
      : "default-book";
    
    // Calculate the spread key for this page (avoiding cover and last page)
    const { leftPage, rightPage } = calculateSpreadPages(currentPage, totalPages);
    const spreadKey = `bookmark-${bookKey}-spread-${leftPage}-${rightPage}`;
    
    // Check if bookmark exists for this spread
    const hasBookmark = localStorage.getItem(spreadKey);
    
    // Update button visual state
    if (hasBookmark) {
      $("#bookmarkBtn").addClass("bookmarked");
    } else {
      $("#bookmarkBtn").removeClass("bookmarked");
    }
  }
}

// Helper function to calculate spread pages correctly
function calculateSpreadPages(currentPage, totalPages) {
  // Handle edge cases for cover and last page
  if (currentPage === 1 || currentPage === totalPages) {
    return { leftPage: currentPage, rightPage: currentPage }; // This shouldn't be used for bookmarking
  }
  
  // For normal pages, calculate the spread
  // Page 2 is alone (right side, no left pair)
  if (currentPage === 2) {
    return { leftPage: 2, rightPage: 3 };
  }
  
  // Last content page might be alone
  if (currentPage === totalPages - 1) {
    return { leftPage: currentPage - 1, rightPage: currentPage };
  }
  
  // Normal spread calculation
  if (currentPage % 2 === 0) {
    // Even page (left side)
    return { leftPage: currentPage, rightPage: currentPage + 1 };
  } else {
    // Odd page (right side)
    return { leftPage: currentPage - 1, rightPage: currentPage };
  }
}

function toggleBookmark() {
  if (!bookLoaded) return;

  const currentPage = parseInt($("#pageInput").val());
  const totalPages = $(".flipbook").turn("pages");
  const isCoverPage = currentPage === 1 || currentPage === totalPages;

  if (isCoverPage) {
    alert("Cannot bookmark cover pages");
    return;
  }

  if (!isNaN(currentPage)) {
    // Use book path to create unique bookmark keys per book
    const bookKey = currentBookPath
      ? currentBookPath.replace(/[^a-zA-Z0-9]/g, "-")
      : "default-book";

    // Calculate left and right pages for the spread (with proper edge case handling)
    const { leftPage, rightPage } = calculateSpreadPages(currentPage, totalPages);
    
    // Create spread-based bookmark key
    const spreadKey = `bookmark-${bookKey}-spread-${leftPage}-${rightPage}`;

    if (localStorage.getItem(spreadKey)) {
      localStorage.removeItem(spreadKey);
      
      // Update button state
      $("#bookmarkBtn").removeClass("bookmarked");

      // No notification for removal (removed showNotification call)
    } else {
      localStorage.setItem(spreadKey, JSON.stringify({
        leftPage: leftPage,
        rightPage: rightPage,
        timestamp: Date.now()
      }));
      
      // Update button state
      $("#bookmarkBtn").addClass("bookmarked");

      // Show placement notification
      showNotification(`Bookmarked Pages ${leftPage} & ${rightPage}`);
    }
  }
}

// Function to display bookmarks in a modal
function displayBookmarks() {
  if (!bookLoaded) return;

  const bookmarkModalBody = document.getElementById("bookmarkModalBody");
  bookmarkModalBody.innerHTML = "";

  // Use book path to find bookmarks for this specific book
  const bookKey = currentBookPath
    ? currentBookPath.replace(/[^a-zA-Z0-9]/g, "-")
    : "default-book";
  const bookmarkPrefix = `bookmark-${bookKey}-spread-`;

  let hasBookmarks = false;
  let bookmarkHTML = '<ul class="bookmark-list">';
  let bookmarks = [];

  // Check for bookmarks in localStorage
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith(bookmarkPrefix)) {
      hasBookmarks = true;
      try {
        const bookmarkData = JSON.parse(localStorage.getItem(key));
        bookmarks.push({
          key: key,
          leftPage: bookmarkData.leftPage,
          rightPage: bookmarkData.rightPage,
          timestamp: bookmarkData.timestamp || 0
        });
      } catch (e) {
        // Handle old format bookmarks if any exist
        console.warn("Old bookmark format detected:", key);
      }
    }
  }

  // Sort bookmarks by page number
  bookmarks.sort((a, b) => a.leftPage - b.leftPage);

  // Generate HTML for each bookmark
  bookmarks.forEach(bookmark => {
    bookmarkHTML += `
        <li class="bookmark-item" id="bookmark-item-${bookmark.leftPage}-${bookmark.rightPage}">
          <div class="bookmark-item-info">
            <i class="fas fa-bookmark bookmark-icon"></i>
            <span class="bookmark-page-number">Page ${bookmark.leftPage}, ${bookmark.rightPage}</span>
          </div>
          <div class="bookmark-actions">
            <button class="bookmark-goto" onclick="goToPageNumber(${bookmark.leftPage})">Go to page</button>
            <button class="bookmark-remove" onclick="removeBookmarkSpread('${bookKey}', ${bookmark.leftPage}, ${bookmark.rightPage})">Remove</button>
          </div>
        </li>
      `;
  });

  bookmarkHTML += "</ul>";

  if (!hasBookmarks) {
    bookmarkModalBody.innerHTML =
      '<div class="no-bookmarks-message">You have no bookmarks yet for this book. Add bookmarks by clicking the star icon in the bottom controls or "Bookmark Current" in the sidebar.</div>';
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

// Updated function to remove a bookmark spread from the modal
function removeBookmarkSpread(bookKey, leftPage, rightPage) {
  const spreadKey = `bookmark-${bookKey}-spread-${leftPage}-${rightPage}`;
  localStorage.removeItem(spreadKey);

  // Remove the bookmark item from the list with animation
  const bookmarkItem = document.getElementById(`bookmark-item-${leftPage}-${rightPage}`);
  if (bookmarkItem) {
    bookmarkItem.style.transition = "all 0.3s ease";
    bookmarkItem.style.opacity = "0";
    bookmarkItem.style.transform = "translateX(100px)";

    setTimeout(() => {
      bookmarkItem.remove();

      // Check if there are any bookmarks left
      const bookmarkList = document.querySelector(".bookmark-list");
      if (bookmarkList && bookmarkList.children.length === 0) {
        document.getElementById("bookmarkModalBody").innerHTML =
          '<div class="no-bookmarks-message">You have no bookmarks yet for this book. Add bookmarks by clicking the bookmark icon in the bottom controls or "Bookmark Current" in the sidebar.</div>';
      }
    }, 300);
  }

  // Update button state if we're currently on this spread
  const currentPage = parseInt($("#pageInput").val());
  const totalPages = $(".flipbook").turn("pages");
  const { leftPage: currentLeftPage, rightPage: currentRightPage } = calculateSpreadPages(currentPage, totalPages);
  
  if (currentLeftPage === leftPage && currentRightPage === rightPage) {
    $("#bookmarkBtn").removeClass("bookmarked");
  }

  // No notification for removal (removed showNotification call)
}

// Keep the old function for backward compatibility but update it
function removeBookmark(bookKey, pageNum) {
  // This function is kept for any legacy calls but redirects to the new system
  const totalPages = $(".flipbook").turn("pages");
  const { leftPage, rightPage } = calculateSpreadPages(pageNum, totalPages);
  removeBookmarkSpread(bookKey, leftPage, rightPage);
}