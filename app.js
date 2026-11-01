const express = require("express");
const path = require("path");
const fs = require("fs");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

const app = express();
app.use(express.json());

// Enable CORS for cross-origin client requests
app.use((request, response, next) => {
    response.header("Access-Control-Allow-Origin", "*");
    response.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    response.header(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS"
    );
    if (request.method === "OPTIONS") {
        return response.sendStatus(200);
    }
    next();
});

const PORT = process.env.PORT || 3000;
const databaseDir = path.join(__dirname, "database");
const databasePath = path.join(databaseDir, "books.db");

let db;

const initializeDBAndServer = async () => {
    try {
        // Ensure database directory exists
        if (!fs.existsSync(databaseDir)) {
            fs.mkdirSync(databaseDir, { recursive: true });
        }

        db = await open({
            filename: databasePath,
            driver: sqlite3.Database,
        });

        // Ensure table exists on fresh deployments
        await db.run(`
            CREATE TABLE IF NOT EXISTS book (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                author TEXT NOT NULL,
                price INTEGER NOT NULL,
                pages INTEGER NOT NULL
            )
        `);

        app.listen(PORT, () => {
            console.log(`Server running at http://localhost:${PORT}/`);
        });
    } catch (error) {
        console.error(`Database connection failed: ${error.message}`);
        process.exit(1);
    }
};

initializeDBAndServer();

// Root endpoint for health check and API overview
app.get("/", (request, response) => {
    response.status(200).json({
        message: "Book Management API is running",
        endpoints: {
            getAllBooks: "GET /books/",
            getBookById: "GET /books/:bookId/",
            addBook: "POST /books/",
            updateBook: "PUT /books/:bookId/",
            deleteBook: "DELETE /books/:bookId/",
        },
    });
});

// GET all books
app.get("/books/", async (request, response) => {
    try {
        const books = await db.all("SELECT * FROM book");
        response.status(200).json(books);
    } catch (error) {
        response.status(500).json({ error: "Failed to retrieve books" });
    }
});

// GET one book
app.get("/books/:bookId/", async (request, response) => {
    try {
        const { bookId } = request.params;
        const book = await db.get("SELECT * FROM book WHERE id = ?", bookId);

        if (!book) {
            return response.status(404).json({ error: "Book not found" });
        }

        response.status(200).json(book);
    } catch (error) {
        response.status(500).json({ error: "Failed to retrieve book" });
    }
});

// POST a book
app.post("/books/", async (request, response) => {
    try {
        const { title, author, price, pages } = request.body;

        if (!title || !author || price == null || pages == null) {
            return response.status(400).json({
                error: "title, author, price, and pages are required",
            });
        }

        const result = await db.run(
            "INSERT INTO book (title, author, price, pages) VALUES (?, ?, ?, ?)",
            title,
            author,
            price,
            pages
        );

        response.status(201).json({
            id: result.lastID,
            title,
            author,
            price,
            pages,
        });
    } catch (error) {
        response.status(500).json({ error: "Failed to add book" });
    }
});

// PUT a book
app.put("/books/:bookId/", async (request, response) => {
    try {
        const { bookId } = request.params;
        const { title, author, price, pages } = request.body;

        if (!title || !author || price == null || pages == null) {
            return response.status(400).json({
                error: "title, author, price, and pages are required",
            });
        }

        const result = await db.run(
            "UPDATE book SET title = ?, author = ?, price = ?, pages = ? WHERE id = ?",
            title,
            author,
            price,
            pages,
            bookId
        );

        if (result.changes === 0) {
            return response.status(404).json({ error: "Book not found" });
        }

        response.status(200).json({ message: "Book updated successfully" });
    } catch (error) {
        response.status(500).json({ error: "Failed to update book" });
    }
});

// DELETE a book
app.delete("/books/:bookId/", async (request, response) => {
    try {
        const { bookId } = request.params;

        const result = await db.run("DELETE FROM book WHERE id = ?", bookId);

        if (result.changes === 0) {
            return response.status(404).json({ error: "Book not found" });
        }

        response.status(200).json({ message: "Book deleted successfully" });
    } catch (error) {
        response.status(500).json({ error: "Failed to delete book" });
    }
});

module.exports = app;
