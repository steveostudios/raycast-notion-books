# Book Tracker for Raycast

A comprehensive Raycast extension for tracking your reading journey using Notion as your database. Seamlessly manage your book collection, track reading progress, and maintain a complete reading history—all from Raycast.

## Features

### 📚 Complete Book Management

- **Add New Books** - Look up books by ISBN with automatic metadata fetching
- **Start Reading** - Mark when you begin a book with a start date
- **Track Progress** - Update your current page or listening time as you read
- **Finish Books** - Record completion date and rate your reading experience

### 🎧 Audio Book Support

Full support for audiobooks with time-based tracking:

- Enter total length in hours and minutes
- Track progress using "hours/minutes left" instead of pages
- Automatic conversion between time formats
- View listening progress in hours and minutes

### ✨ Smart Features

- **ISBN Lookup** - Automatically fetches book metadata from Open Library API
- **Title Case Formatting** - Automatically formats book titles and subtitles
- **Multiple Formats** - Support for Hardcover, Paperback, Ebook, and Audiobook
- **Cover Images** - Automatic cover image fetching
- **Author & Publisher Management** - Multi-select fields for complex metadata

## Commands

### Book New

Add a new book to your Notion database.

1. Enter the ISBN and select format (Hardcover, Paperback, Ebook, or Audiobook)
2. Review and edit the auto-fetched metadata
3. For audiobooks: Enter total length in hours and minutes
4. For physical/ebooks: Confirm page count
5. Book is added to your Notion database

**Keyboard Shortcut:** Configure in Raycast settings

### Book Start

Start reading a book from your collection.

1. Select a book that hasn't been started yet
2. Choose the start date
3. For audiobooks: Enter remaining time (defaults to full length)
4. For physical/ebooks: Enter current page (defaults to 0)

### Book Read

Update your reading progress.

1. View all books currently in progress
2. Select a book to update
3. For audiobooks: Enter hours and minutes remaining
4. For physical/ebooks: Enter current page number
5. Progress is automatically calculated and saved

### Book Finish

Complete a book and rate it.

1. Select a book you're currently reading
2. Choose the finish date
3. Rate the book (1-5 stars)
4. Progress is automatically set to 100%

## Setup

### Prerequisites

- [Raycast](https://www.raycast.com/) installed on macOS or Windows
- A [Notion](https://www.notion.so/) account
- Node.js 18 or higher

### Notion Setup

#### 1. Create a Notion Integration

1. Go to [Notion Integrations](https://www.notion.so/my-integrations)
2. Click **"+ New integration"**
3. Give it a name (e.g., "Book Tracker")
4. Select the workspace where your book database lives
5. Copy the **Internal Integration Token** (starts with `secret_`)

#### 2. Create Your Book Database

Create a new database in Notion with these exact properties:

| Property Name | Type         | Description                                     |
| ------------- | ------------ | ----------------------------------------------- |
| Title         | Title        | Book title                                      |
| Subtitle      | Rich Text    | Book subtitle                                   |
| ISBN          | Number       | ISBN-13 or ISBN-10                              |
| Author(s)     | Multi-select | Book authors                                    |
| Publishers    | Multi-select | Publishers                                      |
| Format        | Select       | Hardcover, Paperback, Ebook, or Audio           |
| Page Total    | Number       | Total pages (for non-audio books)               |
| Pages Read    | Number       | Current page (for non-audio books)              |
| Minutes Total | Number       | Total minutes (for audiobooks)                  |
| Minutes Read  | Number       | Minutes listened (for audiobooks)               |
| Cover         | Files        | Book cover image                                |
| Fiction       | Checkbox     | Fiction vs Non-fiction                          |
| Date Start    | Date         | Reading start date                              |
| Date Finish   | Date         | Reading completion date                         |
| Stars         | Select       | Rating (⭐, ⭐⭐, ⭐⭐⭐, ⭐⭐⭐⭐, ⭐⭐⭐⭐⭐) |

#### 3. Share Database with Integration

1. Open your book database in Notion
2. Click **"..."** (More) in the top-right corner
3. Select **"Add connections"**
4. Choose your integration from the list

#### 4. Get Your Database ID

From your database URL in Notion:

```
https://notion.so/workspace/DATABASE_ID?v=...
                           ^^^^^^^^^^^
```

The database ID is the 32-character string (with or without hyphens).

### Extension Setup

#### 1. Install Dependencies

```bash
npm install
```

#### 2. Configure Extension

Open Raycast and search for "Book" commands. On first use, you'll be prompted to enter:

- **Notion Token**: Your integration token from step 1 (starts with `secret_`)
- **Notion Database Id**: Your database id from Notion from step 4
- **Dry Run** (optional): Enable to test without writing to Notion

#### 3. Run in Development

```bash
npm run dev
```

#### 4. Build for Production

```bash
npm run build
```

## Usage Examples

### Adding a Fiction Hardcover

1. Run **Book New**
2. Enter ISBN: `9780544003415`
3. Select Format: **Hardcover**
4. Review title: "The Lord of the Rings"
5. Edit if needed, check "Fiction"
6. Submit → Book added! 📚

### Adding an Audiobook

1. Run **Book New**
2. Enter ISBN: `9780593383216`
3. Select Format: **Audiobook**
4. Review title: "Project Hail Mary"
5. Enter hours: `16` and minutes: `45`
6. Submit → Audiobook added! 🎧

### Starting and Tracking Progress

1. Run **Book Start**
2. Select "The Lord of the Rings"
3. Choose today's date
4. Enter current page: `10`
5. Later, run **Book Read** to update progress
6. Enter current page: `150`

### Finishing and Rating

1. Run **Book Finish**
2. Select "Project Hail Mary"
3. Choose today's date
4. Rate: ⭐⭐⭐⭐⭐
5. Done! Progress set to 100% automatically

## Project Structure

```
book/
├── src/
│   ├── book-new.tsx       # Add new books command
│   ├── book-start.tsx     # Start reading command
│   ├── book-read.tsx      # Update progress command
│   ├── book-finish.tsx    # Finish book command
│   └── lib/
│       ├── constants.ts   # Notion property names & database ID
│       ├── errors.ts      # Error handling utilities
│       ├── isbn.ts        # ISBN validation and normalization
│       ├── normalize.ts   # Text formatting (title case, etc.)
│       ├── notion.ts      # Notion API client and operations
│       ├── openlibrary.ts # Open Library API integration
│       └── types.ts       # TypeScript type definitions
├── assets/
│   └── extension-icon.png # Extension icon
├── package.json           # Extension manifest
├── tsconfig.json         # TypeScript configuration
└── README.md             # This file
```

## Technology Stack

- **Raycast API** - Extension framework
- **Notion SDK v2.3** - Database integration
- **Open Library API** - Book metadata lookup
- **TypeScript** - Type-safe development
- **React Hooks** - State management

## Development

### Available Scripts

```bash
# Run extension in development mode
npm run dev

# Build for production
npm run build

# Lint code
npm run lint

# Fix linting issues
npm run fix-lint

# Publish to Raycast Store
npm run publish
```

### Code Quality

- ✅ **TypeScript** - Full type coverage with minimal `any` usage
- ✅ **ESLint** - Following Raycast's official style guide
- ✅ **Prettier** - Consistent code formatting
- ✅ **Type Safety** - Custom types for Notion data structures

## Troubleshooting

### "Could not find database" Error

- Verify your database ID in `constants.ts` is correct
- Ensure the database is shared with your Notion integration
- Check that your integration token is valid

### "Invalid ISBN" Error

- Ensure you're using ISBN-10 or ISBN-13 format
- Remove any hyphens or spaces
- Try searching Open Library directly to verify the ISBN exists

### Books Not Appearing in Commands

- **Book Start**: Only shows books without a start date
- **Book Read**: Only shows books with a start date but no finish date
- **Book Finish**: Same as Book Read
- Check your Notion database filters and property values

### Audiobook Time Not Calculating

- Ensure you entered hours and minutes when creating the audiobook
- Verify "Minutes Total" property exists in your Notion database
- Check that Format is set to "AUDIO"

## Contributing

This is a personal project, but suggestions and improvements are welcome! Feel free to:

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## License

MIT License - feel free to use and modify for your own reading tracking needs!

## Author

Created by [@steveostudios](https://github.com/steveostudios)

## Acknowledgments

- [Raycast](https://www.raycast.com/) for the amazing productivity platform
- [Open Library](https://openlibrary.org/) for the free book metadata API
- [Notion](https://www.notion.so/) for the flexible database platform

---

**Happy Reading!** 📚✨
