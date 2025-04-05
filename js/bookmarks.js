function updateBookmarkButton(currentPage) {
  if (!bookLoaded) return;

  const totalPages = $(".flipbook").turn("pages");
  const isCoverPage =
    currentPage === 1 || currentPage === totalPages;

  $("#bookmarkBtn").prop("disabled", isCoverPage);
}

function toggleBookmark() {
  if (!bookLoaded) return;

  const currentPage = parseInt($("#pageInput").val());
  const totalPages = $(".flipbook").turn("pages");
  const isCoverPage =
    currentPage === 1 || currentPage === totalPages;

  if (isCoverPage) {
    alert("Cannot bookmark cover pages");
    return;
  }

  if (!isNaN(currentPage)) {
    // Use book path to create unique bookmark keys per book
    const bookKey = currentBookPath
      ? currentBookPath.replace(/[^a-zA-Z0-9]/g, "-")
      : "default-book";
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
  const bookKey = currentBookPath
    ? currentBookPath.replace(/[^a-zA-Z0-9]/g, "-")
    : "default-book";
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
      document.getElementById("bookmarkModalBody").innerHTML =
        '<div class="no-bookmarks-message">You have no bookmarks yet for this book. Add bookmarks by clicking the star icon in the bottom controls or "Bookmark Current" in the sidebar.</div>';
    }
  }, 300);

  // Show notification
  showNotification(`Bookmark removed from page ${pageNum}`);
}
