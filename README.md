# JustWalks 🚶‍♀️

Generate fresh, looped walking routes by desired time. Perfect for exploring your neighborhood with variety while keeping your location data private.

![JustWalks App](https://via.placeholder.com/800x400/10b981/ffffff?text=JustWalks+-+Fresh+Walking+Routes)

## Features

- 🕐 **Time-based Planning**: Set target duration (15min - 2h) and get perfect loop routes
- 🔄 **Fresh Routes**: "New route, same length" button generates variety while avoiding repetition
- ❤️ **Save Favorites**: Keep track of your best routes for repeat walks
- 🐕 **Dog-friendly**: Add your dog's profile for personalized walking experiences
- 📱 **Mobile PWA**: Works offline, installable on mobile devices
- 🔒 **Privacy-first**: All data stays on your device, no tracking
- 🗺️ **Multiple Maps**: Leaflet/OSM (free) or Mapbox (with token)
- ⚡ **Smart Routing**: Uses OpenRouteService with local fallback for demos

## Quick Start

### Development

```bash
# Install dependencies
npm install
# or
pnpm install

# Start development server
npm run dev
# or
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Environment Variables

Create a `.env` file (copy from `.env.example`):

```bash
# Optional: Enhanced maps (fallback to Leaflet if not provided)
VITE_MAPBOX_TOKEN=your_mapbox_token_here

# Server-side only (for Netlify functions) - never exposed to client
ORS_API_KEY=your_openrouteservice_key_here
```

**Note**: Without `ORS_API_KEY`, the app runs in demo mode with simulated routes.

## Deployment

### Netlify (Recommended)

JustWalks is optimized for Netlify with serverless functions to proxy API calls and protect your keys.

#### 1. Deploy to Netlify

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/yourusername/justwalks)

Or manually:

```bash
# Build the app
npm run build

# Deploy to Netlify
# Upload the 'dist' folder to Netlify
```

#### 2. Configure Environment Variables

In your Netlify dashboard:

1. Go to **Site settings** → **Environment variables**
2. Add `ORS_API_KEY` with your OpenRouteService API key
3. Optionally add `VITE_MAPBOX_TOKEN` for enhanced maps

#### 3. Get API Keys

**OpenRouteService (Required for real routing):**
1. Visit [openrouteservice.org](https://openrouteservice.org)
2. Sign up for a free account
3. Generate an API key (5000 requests/day free)
4. Add to Netlify environment variables as `ORS_API_KEY`

**Mapbox (Optional for enhanced maps):**
1. Visit [mapbox.com](https://mapbox.com)
2. Sign up for an account
3. Generate a public access token
4. Add to Netlify environment variables as `VITE_MAPBOX_TOKEN`

### GitHub Pages (Static Demo)

For a pure static deployment without serverless functions:

```bash
# Build for static deployment
npm run build

# Deploy to GitHub Pages
# Upload 'dist' folder to gh-pages branch
```

**Limitations in static mode:**
- Routes are simulated (demo mode only)
- No real OpenRouteService integration
- All functionality works, but routes are synthetic

### Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard:
# - ORS_API_KEY (for /api/route and /api/isochrone functions)
# - VITE_MAPBOX_TOKEN (optional)
```

## Project Structure

```
justwalks/
├── netlify.toml              # Netlify configuration
├── netlify/functions/        # Serverless API functions
│   ├── route.ts             # ORS Directions API proxy
│   └── isochrone.ts         # ORS Isochrones API proxy
├── public/                  # Static assets
│   ├── favicon.svg
│   ├── robots.txt
│   └── site.webmanifest
├── src/
│   ├── routes/              # Page components
│   │   ├── Home.tsx         # Landing page
│   │   ├── Planner.tsx      # Route planning interface
│   │   ├── History.tsx      # Routes and favorites
│   │   └── Settings.tsx     # User preferences
│   ├── components/          # Reusable UI components
│   │   ├── MapView.tsx      # Leaflet map integration
│   │   ├── Controls.tsx     # Duration/pace controls
│   │   ├── RouteStats.tsx   # Route information display
│   │   └── ...
│   ├── lib/                 # Core utilities
│   │   ├── routing.ts       # Route generation algorithms
│   │   ├── distance.ts      # Pace/time/distance conversions
│   │   ├── storage.ts       # IndexedDB for local data
│   │   ├── map.ts           # Map provider abstractions
│   │   ├── dedupe.ts        # Route variety scoring
│   │   └── mockRouter.ts    # Demo mode fallback
│   └── styles/
│       └── index.css        # Tailwind CSS
├── package.json
├── vite.config.ts           # Vite + PWA configuration
└── tailwind.config.js
```

## How It Works

### Loop Generation Algorithm

JustWalks uses two strategies to generate interesting loop routes:

#### 1. Isochrone-guided (Preferred with ORS)
1. Convert target time + pace → target distance
2. Request ORS isochrone for half the time budget from start point
3. Sample candidate waypoints on the reachable boundary
4. Generate routes: start → waypoint → start
5. Select best match by distance and variety score

#### 2. Radius Heuristic (Fallback)
1. Estimate radius ≈ (target distance / π) for circular loop
2. Generate waypoints on noisy circle around start point
3. Route start → waypoint → start
4. Select best match

#### Variety Scoring
- Segments routes into chunks and hash coordinates
- Compare against recent routes to avoid >60% overlap
- Weight recent routes more heavily than older ones

### Data Storage

All data is stored locally using IndexedDB:
- **Routes**: Generated paths with coordinates and metadata
- **Favorites**: User-saved routes with custom names
- **Settings**: Home location, pace preferences, dog profile
- **History**: Walk records and route usage

No data ever leaves your device except for anonymous map tile requests and proxied API calls (when using real routing).

## API Integration

### OpenRouteService

- **Directions API**: Generates walking routes between points
- **Isochrones API**: Calculates reachable areas within time budgets
- **Rate limits**: 5000 requests/day on free tier
- **Profiles**: Uses `foot-walking` for pedestrian-optimized routes

### Leaflet + OpenStreetMap

- Free, open-source mapping
- No API key required
- Tile usage respects OSM usage policy
- Cached locally for offline use

## Development

### Running Tests

```bash
# Run unit tests
npm run test

# Run tests with UI
npm run test:ui

# Run tests in watch mode
npm test -- --watch
```

### Building

```bash
# Production build
npm run build

# Preview production build
npm run preview
```

### Linting

```bash
# Lint code
npm run lint

# Lint and fix
npm run lint -- --fix
```

## Configuration

### Tailwind CSS

Customized for the walking/fitness theme:
- Primary green color palette (`#10b981`)
- Mobile-first responsive design
- Custom component classes for buttons and cards

### PWA Settings

- **Caching**: Shell files, fonts, and map tiles
- **Offline**: Core functionality works without internet
- **Install**: Add to home screen on mobile
- **Updates**: Automatic service worker updates

### Browser Support

- **Modern browsers**: Chrome 88+, Firefox 85+, Safari 14+
- **Mobile**: iOS Safari 14+, Chrome Mobile 88+
- **Requirements**: IndexedDB, Service Workers, Geolocation API

## Privacy & Security

- **Local-first**: Routes and settings stored in browser only
- **No tracking**: No analytics, cookies, or user identification
- **API proxy**: Serverless functions hide API keys from client
- **Map tiles**: Standard OSM tile requests (IP-based location)
- **HTTPS required**: Service workers and geolocation need secure context

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Use TypeScript for all new code
- Follow existing component patterns
- Add tests for utility functions
- Update README for new features
- Respect the privacy-first approach

## License

MIT License - see [LICENSE](LICENSE) for details.

## Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/justwalks/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/justwalks/discussions)
- **Documentation**: This README and inline code comments

## Roadmap

### Near-term
- [ ] Turn-by-turn navigation integration
- [ ] Elevation charts and hill difficulty
- [ ] Route sharing (privacy-preserving)
- [ ] Import/export favorites

### Future
- [ ] Multiple start points for commute planning
- [ ] Weather integration
- [ ] Social features (anonymous route discovery)
- [ ] Wearable device integration

---

**Made with 💚 for walkers everywhere. Keep exploring, keep moving!**

![Walking Route Example](https://via.placeholder.com/600x300/f3f4f6/374151?text=Fresh+Routes+Every+Time)