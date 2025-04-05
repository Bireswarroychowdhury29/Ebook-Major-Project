// Function to load book data
function loadBookData() {
  return new Promise((resolve) => {
    // Hardcoded data from bookdata.txt
    bookData = [
      {
        title: "The Lion Who Saw Himself In The Water",
        author: "Idries Shah",
        category: "children",
        rating: 4.5,
        cover: "covers/C1.png",
        bookFile: "books/c1.pdf",
      },
      {
        title: "The Silly Chicken",
        author: "Idries Shah",
        category: "children",
        rating: 4.1,
        cover: "covers/C2.png",
        bookFile: "books/c2.pdf",
      },
      {
        title: "How It All Began",
        author: "Herobrine",
        category: "fiction",
        rating: 4.7,
        cover: "covers/F1.png",
        bookFile: "books/f1.pdf",
      },
      {
        title: "Portrait Of A King",
        author: "L.A. Buck",
        category: "fiction",
        rating: 4.3,
        cover: "covers/F2.png",
        bookFile: "books/f2.pdf",
      },
      {
        title: "The Absent Author",
        author: "Ron Roy",
        category: "mystery",
        rating: 3.8,
        cover: "covers/M1.png",
        bookFile: "books/m1.pdf",
      },
      {
        title: "The White Wolf",
        author: "Ron Roy",
        category: "mystery",
        rating: 4,
        cover: "covers/M2.png",
        bookFile: "books/m2.pdf",
      },
      {
        title: "Cesar Chavez - Autobiography",
        author: "Anne Schraff",
        category: "non-fiction",
        rating: 4.9,
        cover: "covers/NF1.png",
        bookFile: "books/nf1.pdf",
      },
      {
        title: "Kalinski Art",
        author: "John Paul Kirkham",
        category: "non-fiction",
        rating: 4,
        cover: "covers/NF2.png",
        bookFile: "books/nf2.pdf",
      },
      {
        title: "A Cavity Is A Hole In Your Tooth",
        author: "Jim Henson",
        category: "science",
        rating: 3.5,
        cover: "covers/S1.png",
        bookFile: "books/s1.pdf",
      },
      {
        title: "The Skeleton Inside You",
        author: "Philip Balestrino",
        category: "science",
        rating: 4.4,
        cover: "covers/S2.png",
        bookFile: "books/s2.pdf",
      },
    ];
    resolve(bookData);
  });
}
