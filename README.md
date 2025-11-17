# IPTV Player for Media Station X

A full-featured IPTV player app for Media Station X platform.

## Features

✅ **M3U/M3U8 Playlist Support** - Load playlists from URLs
✅ **IP Server Support** - Connect to IPTV servers with IP, port, username, password
✅ **Xtream Codes API** - Full support for Xtream Codes based servers
✅ **Multi-Language Subtitles** - Search and download subtitles in any language
✅ **OpenSubtitles Integration** - Largest subtitle database support
✅ **Auto-Load Subtitles** - Automatically fetch subtitles for your content
✅ **Channel Categories** - Organize channels by groups
✅ **Favorites** - Mark your favorite channels
✅ **Search** - Find channels quickly
✅ **Live TV Streaming** - HLS and MPEG-TS support
✅ **Channel Logos** - Display channel logos from playlist

## Quick Start

### 1. Start Web Server
```bash
cd C:\1\iptv-player-msx
python -m http.server 8001
```

### 2. Open in MSX
```
http://YOUR_IP:8001/start.json
```

### 3. Add Channels

**Option A: Add M3U Playlist**
1. Go to "Playlists" → "Add M3U Playlist"
2. Enter playlist URL (e.g., `http://example.com/playlist.m3u`)
3. Click "Load Playlist"

**Option B: Add IP Server**
1. Go to "Playlists" → "Add IP Server"
2. Enter server details:
   - Server IP address (e.g., `192.168.1.100`)
   - Port (e.g., `8000`)
   - Username
   - Password
3. Click "Connect & Load Channels"

### 4. Watch Channels
1. Go to "Live TV" → "All Channels"
2. Click any channel to start watching

## Finding M3U Playlists

**Free IPTV Sources:**
- https://github.com/iptv-org/iptv (free channels)
- Your IPTV provider's M3U URL
- Local M3U files

**Example Playlist URLs:**
```
https://iptv-org.github.io/iptv/index.m3u
```

## Supported Formats

**Playlists & Servers:**
- **M3U/M3U8** playlists
- **Xtream Codes API** servers
- **IP-based IPTV servers** (with username/password authentication)

**Streaming:**
- **HLS** streams (.m3u8)
- **HTTP/HTTPS** streams
- **MPEG-TS** streams

**Subtitles:**
- **SRT** (SubRip)
- **VTT** (WebVTT)
- **OpenSubtitles API**
- **Custom subtitle servers**

## Project Structure

```
iptv-player-msx/
├── start.json                # MSX entry point
├── plugins/
│   ├── add-playlist.html     # Add M3U playlist
│   ├── channels.html         # Channel list
│   ├── favorites.html        # Favorite channels
│   ├── categories.html       # Channel categories
│   ├── playlists.html        # Manage playlists
│   └── js/
│       ├── storage.js        # LocalStorage manager
│       └── m3u-parser.js     # M3U playlist parser
└── README.md
```

## Usage

### Add Playlist
- Enter playlist name and M3U URL
- System automatically parses and saves channels

### Browse Channels
- All channels sorted by category
- Click to watch instantly
- Add to favorites with star button

### Manage Favorites
- Quick access to favorite channels
- Toggle favorites on/off

### Search
- Search by channel name or category
- Real-time filtering

## Technical Details

**Storage:** Browser localStorage
**Playlist Format:** M3U/M3U8
**Streaming:** HLS, HTTP, HTTPS, MPEG-TS
**Parser:** Custom JavaScript M3U parser

## Subtitle Configuration

### Setting Up Subtitle Servers

The app supports automatic subtitle fetching from multiple sources.

#### OpenSubtitles (Recommended)

1. **Register**: Go to [opensubtitles.com](https://www.opensubtitles.com) and create a free account
2. **Get API Key**: Profile → API → Generate API key
3. **Add to App**:
   - Go to "Subtitles" → "Add Subtitle Server"
   - Select "OpenSubtitles API"
   - Enter your API key
   - Select preferred languages (English, Arabic, etc.)
   - Enable "Auto-Load" if you want automatic subtitle fetching

#### Supported Languages

- English (en)
- Arabic (ar)
- Spanish (es)
- French (fr)
- German (de)
- Italian (it)
- Portuguese (pt)
- Russian (ru)
- Chinese (zh)
- Japanese (ja)
- Korean (ko)
- Hindi (hi)
- Turkish (tr)
- And many more...

### Searching for Subtitles

1. Go to "Subtitles" → "Search Subtitles"
2. Enter movie/show name or IMDB ID
3. Select your preferred language
4. Click "Search"
5. Download and save subtitles for your channels

### Auto-Load Subtitles

When enabled, the app will automatically:
- Search for subtitles when you start watching
- Download the best match for your language
- Save subtitles for offline use
- Convert formats (SRT → VTT) automatically

## IP Server Configuration

### Xtream Codes Servers

The app supports Xtream Codes API format, commonly used by IPTV providers.

**Server URL Format:**
```
http://server-ip:port/player_api.php?username=XXX&password=YYY
```

**Example:**
- **Server IP:** 192.168.1.100
- **Port:** 8000
- **Username:** myuser
- **Password:** mypass
- **API Path:** /player_api.php (default)

### Custom IPTV Servers

For servers with M3U endpoints:
- Set **API Path** to `/get.php` or your server's M3U endpoint
- The app will fetch the M3U playlist and parse channels

## Troubleshooting

### IP Server won't connect
- Verify server IP and port are correct
- Check username and password
- Ensure the server is online and accessible
- Try pinging the server: `ping 192.168.1.100`
- Check firewall settings

### Playlist won't load
- Check URL is accessible
- Verify it's a valid M3U file
- Check CORS headers

### Channels won't play
- Verify stream URL is valid
- Check if streams require authentication
- Some streams may be geo-blocked

### No channels showing
- Add a playlist first
- Check browser console for errors

## Tips

1. Use playlists with valid, working stream URLs
2. Free IPTV channels may be unreliable
3. Some streams require VPN
4. EPG (TV Guide) requires playlist support

## License

Created for Media Station X platform

## Version

1.0.0 - Initial Release
