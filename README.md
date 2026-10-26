# PageFlow

PageFlow is a modern digital ebook library and reader built with HTML, CSS, and JavaScript. The project provides a clean browsing experience for a catalog of books, category-based discovery, local search, and a rich reading experience with page-turn animation, bookmark management, highlighting, zoom controls, and accessibility-oriented reading tools.

This project is designed as a polished front-end ebook application and can be run directly in a browser without a complex backend setup.

## Project Overview

PageFlow allows users to:

- Browse a library of books in a card-based grid
- Filter books by category such as Fiction, Non-Fiction, Children’s, Mystery, and Science
- Search for books by title, author, or genre
- Open a selected book in a dedicated reader interface
- Navigate through pages using buttons or keyboard-style controls
- Bookmark favorite pages
- Highlight text in the reader
- Zoom in and out of pages
- Use a reading assistant with text-to-speech and dictionary lookup tools

## Features

### Library Experience

- Responsive bookstore layout
- Floating navigation bar
- Category filters
- Quick search across the library
- Mobile-friendly menu and responsive UI
- Interactive book cards with rating metadata

### Reader Experience

- Full-page digital book viewer
- Page-flip and navigation controls
- Previous/next page buttons
- Page jump input
- Zoom controls
- Bookmarking support
- Highlighting notes for selected pages
- Sidebar navigation
- A dedicated UI for managing bookmarks and highlights

### Accessibility and Reading Support

- Text-to-speech option
- Dictionary lookup support
- Large and clean interface for comfortable reading
- Visual controls for page viewing and reading flow

## Tech Stack

- HTML5
- CSS3
- JavaScript (Vanilla JS)
- jQuery
- PDF.js for PDF rendering and page handling
- Font Awesome icons

## Project Structure

```text
Ebook-Major-Project/
├── .github/
├── books/
│   ├── c1.pdf
│   ├── c2.pdf
│   ├── f1.pdf
│   ├── f2.pdf
│   ├── m1.pdf
│   ├── m2.pdf
│   ├── nf1.pdf
│   ├── nf2.pdf
│   ├── s1.pdf
│   └── s2.pdf
├── covers/
│   ├── C1.png
│   ├── C2.png
│   ├── F1.png
│   ├── F2.png
│   ├── M1.png
│   ├── M2.png
│   ├── NF1.png
│   ├── NF2.png
│   ├── S1.png
│   └── S2.png
├── css/
│   ├── controls.css
│   ├── library.css
│   ├── modal.css
│   ├── sidebar.css
│   ├── style.css
│   └── widget.css
├── images/
│   ├── ...
├── js/
│   ├── bookData.js
│   ├── bookmarks.js
│   ├── config.js
│   ├── core.js
│   ├── highlighter.js
│   ├── jquery.js
│   ├── library.js
│   ├── navigation.js
│   ├── pdfLoader.js
│   ├── turn.js
│   ├── widget.js
│   └── zoom.js
├── .gitignore
├── book-viewer.html
├── index.html
├── LICENSE
├── package.json
├── package-lock.json
├── README.md
└── ...
```

## Key Files

- `index.html` – the main library page where books are listed and filtered
- `book-viewer.html` – the PDF/ebook reading interface
- `js/library.js` – library logic, search, filtering, and book selection
- `js/bookData.js` – predefined catalog metadata and book mapping
- `js/pdfLoader.js` – PDF loading and page handling logic
- `js/bookmarks.js` – bookmarks and bookmark modal functionality
- `js/highlighter.js` – highlight creation and management
- `js/widget.js` – AI/helper widget behavior and quick tools
- `css/` – all styling for the library, viewer, sidebars, and modals

## Getting Started

### Prerequisites

You only need:

- A modern browser such as Chrome, Edge, Firefox, or Brave
- A local web server (recommended for better compatibility)

### Installation

1. Clone the repository

```bash
git clone https://github.com/Bireswarroychowdhury29/Ebook-Major-Project.git
cd Ebook-Major-Project
```

2. Start a local web server

You can use Python's built-in server:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

Alternatively, you can open `index.html` directly in the browser, though a local server is recommended for smoother execution.

## How to Use

### Library Page

- Open `index.html`
- Browse through the book grid
- Use category buttons to filter the catalog
- Type in the search bar to locate books by title, author, or genre
- Click a book card to open the reader

### Reader Page

- Use the sidebar to navigate to cover page, reading start, last page, or bookmarks
- Click the left or right navigation buttons to flip pages
- Use the page number input to jump to a specific page
- Use zoom controls to increase or reduce page size
- Bookmark the current page for quick return
- Highlight text for study or later review
- Use the floating helper tools for text-to-speech and dictionary features

## Browser Compatibility

This project is built with standard web technologies and is intended to work well in modern browsers. For best results, use:

- Chrome
- Edge
- Firefox
- Safari

## Notes

- The project uses local PDF book files stored in the `books/` directory.
- Book metadata is defined in the JavaScript files rather than fetched from an external database.
- This project is a front-end prototype and a good academic or portfolio project for demonstrating a readable digital library experience.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.

## Author

Created by Bireswarroychowdhury29.

## Acknowledgements

- PDF.js for rendering PDF documents in-browser
- Font Awesome for icons
- jQuery for UI and DOM interactions
- Open-source web tooling and libraries used in the project

## Future Enhancements

Possible improvements for this project include:

- Backend integration with a real database
- User authentication
- Book upload support
- Dark mode theme
- Offline support via service workers
- Reading progress persistence
- Better annotation and note management
- Cloud syncing for bookmarks and highlights

## Conclusion

PageFlow is a feature-rich ebook application that combines a digital library interface with a modern reading experience. It is a strong example of a front-end project that focuses on user interaction, accessibility, and content consumption in a web-based format.

If you want to extend or improve the project, the current structure makes it easy to add additional features, refactor code, or connect the application to a backend service.

---

Made with care for a sleek and reader-friendly digital library experience.
