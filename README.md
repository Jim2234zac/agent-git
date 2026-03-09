# Node.js Web Application

A simple Node.js web application using Express.js

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm (comes with Node.js)

### Installation

1. Install dependencies:
```bash
npm install
```

### Running the Application

**Development mode** (with auto-reload):
```bash
npm run dev
```

**Production mode**:
```bash
npm start
```

The server will start on `http://localhost:3000`

## Project Structure

```
.
├── server.js          # Main server file
├── package.json       # Project metadata and dependencies
├── .gitignore         # Git ignore rules
├── public/            # Static files (create as needed)
└── README.md          # This file
```

## Available Routes

- `GET /` - Welcome page
- `GET /api/hello` - API endpoint that returns JSON

## Next Steps

1. Customize the routes in `server.js`
2. Add more middleware as needed
3. Create additional routes and controllers
4. Add a database connection if needed
5. Deploy to your hosting platform

## License

ISC
