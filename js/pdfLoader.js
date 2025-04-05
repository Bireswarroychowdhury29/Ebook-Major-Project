// Function to load and setup a PDF book
function loadPDFBook(pdfPath) {
  // Initialize PDF.js
  const pdfjsLib = window.pdfjsLib;
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js";

  // Load book data first, then process the PDF
  loadBookData().then(() => {
    // Find book in data that matches the current path
    const pathParts = pdfPath.split("/");
    const pdfFileName = pathParts[pathParts.length - 1];
    const bookInfo = bookData.find((book) => {
      const bookFileParts = book.bookFile.split("/");
      const bookFileName = bookFileParts[bookFileParts.length - 1];
      return bookFileName.toLowerCase() === pdfFileName.toLowerCase();
    });

    // Set book title from data if found
    if (bookInfo) {
      bookTitle = bookInfo.title;
    } else {
      // Fallback to formatting the filename as before
      let fileName = pdfFileName;
      fileName = fileName.replace(".pdf", "");
      fileName = fileName.replace(/[_-]/g, " ");
      fileName = fileName.replace(/([a-z])([A-Z])/g, "$1 $2");
      fileName = fileName.replace(/\.[^/.]+$/, "");
      bookTitle = fileName
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    }

    // Load the PDF document
    const loadingTask = pdfjsLib.getDocument(pdfPath);
    loadingTask.promise
      .then(function (pdf) {
        pdfDoc = pdf;
        const totalPages = pdf.numPages;

        // Update page title and sidebar header with the proper book title
        document.title = bookTitle;
        $("#bookTitle").text(bookTitle);

        // Reset the flipbook
        const flipbook = $("#flipbook");
        flipbook.html("");

        // Create an array of promises to render all pages
        const renderPromises = [];
        for (let i = 1; i <= totalPages; i++) {
          renderPromises.push(renderPage(pdf, i, flipbook));
        }

        // When all pages are rendered, initialize turn.js
        Promise.all(renderPromises).then(() => {
          // Initialize the flipbook
          flipbook.turn({
            width: 1000,
            height: 650,
            elevation: 50,
            gradients: true,
            autoCenter: true,
          });

          // Update UI
          const actualTotalPages = flipbook.turn("pages");
          $("#pageTotal").text(` / ${actualTotalPages}`);
          updatePageIndex(1);

          // Always keep the book centered
          flipbook.css({
            "margin-left": "auto",
            "margin-right": "auto",
          });

          // Initial adjustment for first page
          updatePageIndex(1);
          adjustFlipbookPosition(1);
          updateSidebarBookmarkState(1);

          // Bind turning event
          flipbook.bind("turning", function (event, page) {
            updatePageIndex(page);
            adjustFlipbookPosition(page);
            // Ensure book stays centered on page turn
            flipbook.css({
              "margin-left": "auto",
              "margin-right": "auto",
            });
            updatePageTurnButtonPositions();
          });

          // Hide loading overlay
          $("#loadingOverlay").fadeOut();
          bookLoaded = true;
          updatePageTurnButtonPositions();
        });
      })
      .catch(function (error) {
        console.error("Error loading PDF:", error);
        alert("Failed to load PDF book: " + error.message);
        // Hide loading overlay
        $("#loadingOverlay").fadeOut();
        // Redirect to library
        window.location.href = "index.html";
      });
  });
}

// Function to render a PDF page and add it to the flipbook
function renderPage(pdf, pageNum, flipbook) {
  return new Promise((resolve) => {
    pdf
      .getPage(pageNum)
      .then(function (page) {
        const viewport = page.getViewport({ scale: 1.5 });

        // Create a canvas for the page
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // Render the PDF page to the canvas
        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        page.render(renderContext).promise.then(() => {
          // Create a div container for the page
          const pageDiv = document.createElement("div");
          pageDiv.className = "pdf-page";
          pageDiv.style.position = "relative";

          // Add the canvas to the page div
          canvas.style.width = "100%";
          canvas.style.height = "100%";
          pageDiv.appendChild(canvas);

          // Extract text content for accessibility
          page.getTextContent().then(function (textContent) {
            if (textContent.items.length > 0) {
              const textDiv = document.createElement("div");
              textDiv.className = "page-text";
              textDiv.style.display = "none"; // Hidden, but available for accessibility

              let text = "";
              textContent.items.forEach((item) => {
                text += item.str + " ";
              });

              textDiv.textContent = text;
              pageDiv.appendChild(textDiv);
            }

            // Add the page to the flipbook
            flipbook.append(pageDiv);
            resolve();
          });
        });
      })
      .catch(function (error) {
        console.error("Error rendering page " + pageNum + ":", error);
        // Add an error page instead
        const errorDiv = document.createElement("div");
        errorDiv.className = "pdf-page error-page";
        errorDiv.innerHTML = `<div class="error-message">Error loading page ${pageNum}</div>`;
        flipbook.append(errorDiv);
        resolve();
      });
  });
}

// Fallback function to load the static demo book
function loadStaticDemoBook() {
  bookTitle = "The Case of the Missing Smile";
  document.title = bookTitle;
  $("#bookTitle").text(bookTitle);

  const flipbook = $(".flipbook");
  flipbook.turn({
    width: 1000,
    height: 650,
    elevation: 50,
    gradients: true,
    autoCenter: true,
  });

  // Always keep the flipbook centered
  $(".flipbook").css({
    "margin-left": "auto",
    "margin-right": "auto",
  });

  const totalPages = flipbook.turn("pages");
  $("#pageTotal").text(` / ${totalPages}`);

  // Initial setup
  updatePageIndex(1);
  adjustFlipbookPosition(1);
  updateSidebarBookmarkState(1);

  // Bind turning event for demo book
  flipbook.bind("turning", function (event, page) {
    updatePageIndex(page);
    adjustFlipbookPosition(page);
  });

  // Hide loading overlay
  $("#loadingOverlay").fadeOut();
  bookLoaded = true;
  updatePageTurnButtonPositions();
}
