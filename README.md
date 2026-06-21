# SoundTrail

SoundTrail is a full-stack music discovery and listening-journal application that helps users explore real artists, discover songs, listen to legal catalogue previews, organise music and understand their personal library.

The application combines artist metadata from MusicBrainz with song metadata, album artwork and audio previews from the iTunes Search API.

## Features

* Search real songs and artists
* Play available 30-second catalogue previews
* Explore artist profiles, genres, tags and recordings
* View dynamic artist-focused content on the Home page
* Browse music categories such as Bollywood, Punjabi, Pop, Indie, Chill and Lo-fi
* Receive real playable quick picks
* Global music player with:

  * Play and pause
  * Previous and next track
  * Seek control
  * Volume control
  * Shuffle
  * Repeat
  * Queue
* Spacebar shortcut for play and pause
* Persistent currently selected song and queue
* Like songs and retain them after refreshing
* Create custom playlists using real searched tracks
* Personal listening journal
* Insights generated from liked songs and playlists
* Multiple selectable accent themes
* Responsive glassmorphism interface
* Mobile and desktop navigation
* Custom 404 page

## Important Playback Note

SoundTrail does not host copyrighted music.

The iTunes Search API provides short catalogue previews rather than complete commercial songs. Preview availability can differ depending on the song and regional catalogue.

## Tech Stack

### Frontend

* React 19
* TypeScript
* Vite
* React Router
* Zustand
* Tailwind CSS
* Lucide React
* Motion

### Backend

* Node.js
* Express
* TypeScript
* CORS
* dotenv

### External APIs

* MusicBrainz API for artist metadata
* iTunes Search API for songs, artwork, metadata and previews

### Persistence

* Browser localStorage
* Zustand persistence middleware

## Architecture

```text
SoundTrail
├── React frontend
│   ├── Pages and navigation
│   ├── Global Zustand player
│   ├── HTML audio playback
│   ├── Local playlists and liked songs
│   └── Theme and interface settings
│
├── Express backend
│   ├── Artist search routes
│   ├── Artist details routes
│   ├── Artist recordings routes
│   └── Song search routes
│
├── MusicBrainz API
│   └── Artist metadata
│
└── iTunes Search API
    ├── Song metadata
    ├── Album artwork
    └── Audio previews
```

## Project Structure

```text
SoundTrail/
├── public/
├── src/
│   ├── app/
│   ├── components/
│   │   ├── layout/
│   │   └── player/
│   ├── features/
│   │   ├── player/
│   │   └── theme/
│   ├── lib/
│   ├── pages/
│   ├── services/
│   ├── types/
│   ├── index.css
│   └── main.tsx
│
├── server/
│   ├── src/
│   │   ├── services/
│   │   │   ├── itunes.ts
│   │   │   └── musicbrainz.ts
│   │   └── index.ts
│   ├── package.json
│   └── tsconfig.json
│
├── package.json
├── vite.config.ts
└── README.md
```

## Local Setup

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd SoundTrail
```

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Install backend dependencies

```bash
cd server
npm install
cd ..
```

### 4. Configure the frontend environment

Create:

```text
.env.local
```

Add:

```env
VITE_API_BASE_URL=http://localhost:4000
```

### 5. Configure the backend environment

Create:

```text
server/.env
```

Add:

```env
PORT=4000
```

## Running the Application

Start the backend in one terminal:

```bash
cd server
npm run dev
```

Start the frontend in another terminal:

```bash
npm run dev
```

Open:

```text
http://localhost:5173
```

## Production Build

### Frontend

```bash
npm run lint
npm run build
```

Preview the production frontend:

```bash
npm run preview
```

### Backend

```bash
cd server
npm run build
npm start
```

## Backend Endpoints

### Health check

```http
GET /api/health
```

### Search songs

```http
GET /api/search/tracks?q=Arijit%20Singh
```

### Search artists

```http
GET /api/search/artists?q=Arijit%20Singh
```

### Get artist details

```http
GET /api/artists/:artistId
```

### Get artist recordings

```http
GET /api/artists/:artistId/tracks
```

## Main Pages

### Home

Displays the currently explored artist, selected song, related songs and albums.

### Discover

Provides category browsing, quick picks, recently played tracks and real song and artist search.

### Journal

Allows users to record notes and memories related to their listening experience.

### Insights

Generates statistics from liked tracks and custom playlists.

### Liked Songs

Stores complete track information so real searched songs remain available after refreshing.

### Playlists

Allows users to create persistent collections using liked or currently selected tracks.

### Settings

Controls the application accent theme and interface preferences.

## Keyboard Controls

| Key      | Action                            |
| -------- | --------------------------------- |
| Spacebar | Play or pause the current preview |

The shortcut is disabled while typing inside inputs, text areas and other interactive elements.

## Current Limitations

* Commercial songs are available as previews, not complete streams.
* Data is stored locally in the browser.
* User accounts and cloud synchronisation are not currently included.
* Preview availability depends on the external catalogue.
* The initial JavaScript bundle can be further reduced using route-level code splitting.

## Future Improvements

* Authentication and cloud profiles
* Database-backed playlists and journals
* Listening-history tracking
* Route-level lazy loading
* Improved recommendation ranking
* Artist image integration
* Public playlist sharing
* Progressive Web App support
* Automated testing

## Author

Developed by **Omdeep Masram**.

GitHub: `omicoded19`

## License

This project is intended for educational and portfolio purposes.

Music metadata, artwork and audio previews remain subject to the terms and rights of their respective providers.
