# Still — Image Search

A browser-based Unsplash image search app with an Express backend. The backend keeps the Unsplash access key out of browser code.

## Run locally

1. Open a terminal in `image-search-app/backend` and install dependencies:

   ```bash
   npm install
   ```

2. The existing local Unsplash access key has been moved to `backend/.env`. For a fresh setup, copy `.env.example` to `.env` and set `API_KEY` to your Unsplash access key. The `.env` file is ignored by Git; never commit it.

3. Start the API from the `backend` directory:

   ```bash
   npm run dev
   ```

   The API listens on `http://localhost:4001` by default. Set `PORT` in `backend/.env` to change it.

4. Serve `image-search-app/index.html` with a local static web server, such as the VS Code Live Server extension. Keep the API running while searching.

## API

### `GET /`

Health check for the API.

### `GET /api/search?query={query}&page={page}`

Searches Unsplash and returns `results` and `total_pages`. `query` is required and limited to 100 characters. `page` is an optional whole number between 1 and 1000.

The browser calls this backend endpoint; the Unsplash key is sent only from the backend to Unsplash.
