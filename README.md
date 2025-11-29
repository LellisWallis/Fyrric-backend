# GameCore Backend API

Production-ready Backend as a Service for game developers. Handles authentication, leaderboards, matchmaking, cloud saves, and analytics.

## Features

- ✅ **Authentication** - Email/password, guest accounts, JWT tokens
- ✅ **Leaderboards** - Global rankings with seasonal resets
- ✅ **Matchmaking** - Skill-based matching and custom lobbies
- ✅ **Cloud Saves** - Cross-platform player data sync
- ✅ **Analytics** - Event tracking and player metrics
- ✅ **API Keys** - Secure access control per game
- ✅ **Rate Limiting** - Built-in usage tracking

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT + bcrypt

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Database

Create a PostgreSQL database and set the DATABASE_URL in your `.env` file:

```bash
cp .env.example .env
# Edit .env with your database URL
```

### 3. Run Server

```bash
npm start
```

The API will be available at `http://localhost:3000`

## Environment Variables

```env
NODE_ENV=development          # development or production
PORT=3000                     # Server port
DATABASE_URL=postgresql://... # PostgreSQL connection string
JWT_SECRET=your-secret-key    # Secret for JWT tokens
```

## API Endpoints

### Authentication

#### Register User
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "player@example.com",
  "username": "PlayerOne",
  "password": "securePassword123"
}
```

Returns: User object, JWT token, and API key

#### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "player@example.com",
  "password": "securePassword123"
}
```

Returns: User object, JWT token, and list of API keys

#### Guest Login
```http
POST /api/v1/auth/guest
```

Returns: Guest user object and JWT token

### Leaderboards

All leaderboard endpoints require `X-API-Key` header.

#### Submit Score
```http
POST /api/v1/leaderboard/submit
X-API-Key: your-api-key
Content-Type: application/json

{
  "leaderboardId": "global-highscore",
  "playerId": "player123",
  "playerName": "PlayerOne",
  "score": 9850,
  "metadata": {
    "level": 12,
    "time": 145.2
  }
}
```

#### Get Top Scores
```http
GET /api/v1/leaderboard/top/global-highscore?limit=10&offset=0
X-API-Key: your-api-key
```

#### Get Player Rank
```http
GET /api/v1/leaderboard/rank/global-highscore/player123
X-API-Key: your-api-key
```

### Matchmaking

#### Find Match
```http
POST /api/v1/matchmaking/find
X-API-Key: your-api-key
Content-Type: application/json

{
  "mode": "ranked",
  "playerId": "player123",
  "skillRating": 1500,
  "region": "eu-west"
}
```

#### Create Lobby
```http
POST /api/v1/matchmaking/lobby/create
X-API-Key: your-api-key
Content-Type: application/json

{
  "name": "Pro Players Only",
  "mode": "ranked",
  "maxPlayers": 8,
  "isPrivate": false
}
```

Returns lobby code that players can use to join.

#### Join Lobby
```http
POST /api/v1/matchmaking/lobby/join
X-API-Key: your-api-key
Content-Type: application/json

{
  "lobbyCode": "ABC123",
  "playerId": "player123"
}
```

### Cloud Saves

#### Save Player Data
```http
POST /api/v1/saves/save
X-API-Key: your-api-key
Content-Type: application/json

{
  "playerId": "player123",
  "data": {
    "level": 42,
    "experience": 15750,
    "inventory": ["sword", "shield", "potion"]
  }
}
```

#### Load Player Data
```http
GET /api/v1/saves/load/player123
X-API-Key: your-api-key
```

### Analytics

#### Track Event
```http
POST /api/v1/analytics/track
X-API-Key: your-api-key
Content-Type: application/json

{
  "eventName": "level_completed",
  "playerId": "player123",
  "properties": {
    "level": 5,
    "time": 127.5,
    "score": 8450
  }
}
```

#### Get Event Stats
```http
GET /api/v1/analytics/events?limit=50
X-API-Key: your-api-key
```

#### Get Daily Active Users
```http
GET /api/v1/analytics/dau?days=30
X-API-Key: your-api-key
```

## Database Schema

The database automatically initializes with the following tables:

- **users** - User accounts
- **api_keys** - API keys for game projects
- **leaderboards** - Leaderboard definitions
- **leaderboard_scores** - Individual scores
- **matches** - Matchmaking matches and lobbies
- **match_players** - Players in matches
- **cloud_saves** - Player save data
- **analytics_events** - Tracked events
- **usage_stats** - API usage tracking

## Deployment

### Railway

1. Create Railway account
2. Create new project
3. Add PostgreSQL database
4. Connect GitHub repo or deploy directly
5. Set environment variables
6. Deploy!

Railway automatically provides DATABASE_URL.

### Heroku

```bash
heroku create your-gamecore-api
heroku addons:create heroku-postgresql:mini
heroku config:set JWT_SECRET=your-secret-key
git push heroku main
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## Security

- ✅ JWT tokens for user authentication
- ✅ API keys for game authentication
- ✅ Password hashing with bcrypt
- ✅ SQL injection protection via parameterized queries
- ✅ Rate limiting via usage tracking
- ✅ CORS enabled

## Performance

- Database indexes on frequently queried columns
- Connection pooling for PostgreSQL
- Efficient JSON storage for flexible data
- Automatic cleanup of old matches

## Monitoring

Check usage for any API key:

```sql
SELECT endpoint, SUM(calls_count) as total_calls
FROM usage_stats
WHERE api_key_id = 'your-api-key-id'
GROUP BY endpoint;
```

## Support

- Documentation: https://docs.gamecore.io
- GitHub: https://github.com/gamecore
- Discord: https://discord.gg/gamecore

## License

MIT
