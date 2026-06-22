<div align="center">

# 🎵 SoundTrail

### Discover music, preview songs, save favourites, and build your personal music library.

SoundTrail is a full-stack music discovery platform built with React, TypeScript, Express, and MongoDB.

[![Live App](https://img.shields.io/badge/Live_App-Open_SoundTrail-8B5CF6?style=for-the-badge\&logo=vercel\&logoColor=white)](https://sound-trail.vercel.app)
[![GitHub](https://img.shields.io/badge/Source_Code-GitHub-181717?style=for-the-badge\&logo=github\&logoColor=white)](https://github.com/omicoded19/SoundTrail)
[![Backend](https://img.shields.io/badge/Backend_API-Render-46E3B7?style=for-the-badge\&logo=render\&logoColor=black)](https://soundtrail-api.onrender.com/api/health)

</div>

---

## Live Links

* **Application:** https://sound-trail.vercel.app
* **Repository:** https://github.com/omicoded19/SoundTrail
* **Backend API:** https://soundtrail-api.onrender.com/api/health

> The Render backend may take a few seconds to wake up after inactivity.

---

## About the Project

SoundTrail allows users to search for real songs, artists, albums, and genres using external music APIs.

Users can listen to available catalogue previews, like songs, create playlists, and keep their personal library synced through MongoDB.

The application also includes:

* A **Journal** section for personal music-related notes and reflections
* An **Insights** section for viewing listening and library-related summaries
* Custom accent themes
* Responsive desktop and mobile layouts

---

## Main Features

### Music Discovery

* Search by song title, artist, album, genre, or keywords
* Intelligent ranking of title, artist, and album matches
* Artist profiles with metadata, genres, location, and recordings
* Browse categories such as Bollywood, Punjabi, Pop, Indie, Chill, and Lo-fi

### Audio Player

* Play and pause
* Previous and next track
* Progress seeking
* Volume control
* Shuffle
* Repeat and repeat-one
* Playback queue
* Desktop and mobile player layouts
* 30-second catalogue previews when available

### Authentication

* User registration
* User login
* Password hashing with bcryptjs
* JWT authentication
* Protected frontend and backend routes
* Automatic session restoration

### Liked Songs

* Like and unlike songs
* Instant visual updates
* Persistent MongoDB storage
* Play all liked songs
* Remove songs from the library
* Likes remain after refresh and login

### Playlists

* Create playlists
* Add descriptions
* Rename playlists
* Delete playlists
* Add songs from the global player
* Add liked or currently playing tracks
* Remove songs
* Play individual tracks or the full playlist
* Prevent duplicate songs
* Store playlists in MongoDB

### Journal and Insights

* Journal page for music notes and personal reflections
* Insights page for viewing listening and library-related information
* Dedicated navigation sections inside the application

---

## Tech Stack

### Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* Zustand
* React Router
* Lucide React
* HTML Audio API

### Backend

* Node.js
* Express
* TypeScript
* MongoDB Atlas
* Mongoose
* JSON Web Tokens
* bcryptjs
* CORS
* dotenv

### External Services

* MusicBrainz API
* iTunes Search API
* Artist image provider
* Vercel
* Render
* MongoDB Atlas

---

## How Users Use SoundTrail

1. Open the live application.
2. Register or log in.
3. Search for a song or artist.
4. Play any available preview.
5. Press the heart button to save a song.
6. Open **Liked Songs** to manage saved tracks.
7. Create a playlist and add songs to it.
8. Use the list-plus button in the music player to add the current song.
9. Open **Journal** to record music-related notes.
10. Open **Insights** to view library and listening summaries.
11. Change the accent colour from **Settings**.

---

## Project Structure

```text
SoundTrail/
├── src/
│   ├── app/
│   ├── components/
│   │   ├── layout/
│   │   ├── player/
│   │   └── playlists/
│   ├── features/
│   │   ├── auth/
│   │   ├── player/
│   │   ├── playlists/
│   │   └── theme/
│   ├── pages/
│   │   ├── ArtistDetailsPage.tsx
│   │   ├── DiscoverPage.tsx
│   │   ├── HomePage.tsx
│   │   ├── InsightsPage.tsx
│   │   ├── JournalPage.tsx
│   │   ├── LikedSongsPage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── PlaylistsPage.tsx
│   │   ├── RegisterPage.tsx
│   │   └── SettingsPage.tsx
│   ├── services/
│   ├── types/
│   ├── App.tsx
│   └── main.tsx
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── index.ts
│   └── package.json
│
├── package.json
├── vite.config.ts
├── vercel.json
└── README.md
```

---

# Running Locally

## Prerequisites

Install:

* Node.js
* npm
* Git
* MongoDB Atlas account

---

## 1. Clone the repository

```bash
git clone https://github.com/omicoded19/SoundTrail.git
cd SoundTrail
```

---

## 2. Install frontend dependencies

```bash
npm install
```

---

## 3. Install backend dependencies

```bash
cd server
npm install
cd ..
```

---

## 4. Create the frontend environment file

Create:

```text
.env.local
```

Add:

```env
VITE_API_BASE_URL=http://localhost:4000
```

---

## 5. Create the backend environment file

Create:

```text
server/.env
```

Add:

```env
PORT=4000
CLIENT_URL=http://localhost:5173
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_long_random_secret
```

Generate a JWT secret using:

```bash
openssl rand -base64 48
```

Do not commit `.env` or `.env.local`.

---

## 6. Start the backend

Open the first terminal:

```bash
cd server
npm run dev
```

The backend will run at:

```text
http://localhost:4000
```

Test it at:

http://localhost:4000/api/health

---

## 7. Start the frontend

Open another terminal in the main project folder:

```bash
npm run dev
```

The frontend will usually run at:

http://localhost:5173

---

## Available Commands

### Frontend

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

### Backend

```bash
cd server
npm run dev
npm run build
npm start
```

---

## Main API Routes

### Authentication

```http
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

### Search

```http
GET /api/search/tracks?q=<query>
GET /api/search/artists?q=<query>
GET /api/artists/:artistId
GET /api/artists/:artistId/tracks
```

### Liked Songs

```http
GET    /api/library/liked
POST   /api/library/liked
DELETE /api/library/liked/:trackId
```

### Playlists

```http
GET    /api/playlists
POST   /api/playlists
GET    /api/playlists/:playlistId
PATCH  /api/playlists/:playlistId
DELETE /api/playlists/:playlistId
POST   /api/playlists/:playlistId/tracks
DELETE /api/playlists/:playlistId/tracks/:trackId
```

Protected routes require:

```http
Authorization: Bearer <token>
```

---

## Deployment

### Frontend

The frontend is deployed on Vercel.

```env
VITE_API_BASE_URL=https://soundtrail-api.onrender.com
```

### Backend

The backend is deployed on Render with the root directory:

```text
server
```

Build command:

```bash
npm install && npm run build
```

Start command:

```bash
npm start
```

Required environment variables:

```env
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_long_random_secret
CLIENT_URL=https://sound-trail.vercel.app
```

---

## Current Limitations

* Full commercial songs are not streamed
* Preview availability varies by track and region
* External music APIs may occasionally be unavailable
* Render may have a short cold-start delay
* Artist images may not exist for every artist

---

## Future Improvements

* Listening-history tracking
* More detailed Insights analytics
* Persistent Journal entries
* Public playlist sharing
* Collaborative playlists
* Personalised recommendations
* Custom playlist artwork
* Automated testing
* Route-level code splitting
* Redis caching

---

## Resume Summary

> Built and deployed a full-stack music discovery platform using React, TypeScript, Express, and MongoDB Atlas. Integrated MusicBrainz and iTunes APIs for real artist metadata, search ranking, artwork, and playable previews. Implemented JWT authentication, persistent liked songs, playlists, a global audio player, Journal and Insights sections, responsive design, and cloud deployment using Vercel and Render.

---

## Author

**Om Deep Masram**

* GitHub: https://github.com/omicoded19
* Repository: https://github.com/omicoded19/SoundTrail
* Live Application: https://sound-trail.vercel.app

---

## Disclaimer

SoundTrail does not host or distribute copyrighted music files.

Track metadata, artwork, artist information, links, and preview audio are provided by third-party services and remain subject to their terms and availability.
