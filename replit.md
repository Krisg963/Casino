# NordCasino - Online Betting Platform

## Overview
A full-stack Norwegian casino/betting platform with 20+ slot machines, user authentication, wallet system, game history, and an admin panel.

## Architecture

### Stack
- **Frontend**: React + TypeScript + Vite + TailwindCSS + shadcn/ui
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL via Drizzle ORM
- **Auth**: Session-based (express-session + passport-local)
- **Styling**: Dark theme with gold/amber primary color (#F59E0B range)

### Key Features
- 20 themed slot machines (Classic Fruit, Aztec Gold, Space Adventure, Dragon Fire, etc.)
- User registration with 1000 kr welcome bonus
- Wallet system with deposit functionality
- Real-time slot spinning with animated reels
- Game history and statistics
- Full admin panel (users, transactions, game sessions, slot management)

## Project Structure

```
client/src/
  pages/
    Home.tsx          - Lobby with slot catalog + landing page for guests
    Login.tsx         - Login form
    Register.tsx      - Registration form (with 1000 kr welcome bonus)
    SlotGame.tsx      - Individual slot machine game
    Wallet.tsx        - Deposit and transaction history
    History.tsx       - User game history and stats
    admin/
      AdminDashboard.tsx   - Admin home with stats
      AdminUsers.tsx       - User management
      AdminTransactions.tsx - All transaction history
      AdminGames.tsx       - All game sessions
      AdminSlots.tsx       - Enable/disable slot machines
  components/
    Navbar.tsx        - Top navigation bar
    SlotSymbol.tsx    - Individual symbol display component
  lib/
    auth.tsx          - Auth context provider
    queryClient.ts    - TanStack Query client

server/
  routes.ts           - All API endpoints
  storage.ts          - Database operations (DrizzleORM)
  slots-config.ts     - Slot machine configs, spin logic, win calculation
  index.ts            - Express server setup
```

## API Endpoints

### Auth
- `POST /api/auth/register` - Register new user (returns 1000 kr bonus)
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Slots
- `GET /api/slots` - All active slots
- `GET /api/slots/:id` - Single slot details
- `GET /api/slots/:id/symbols` - Slot symbol definitions
- `POST /api/slots/:id/spin` - Spin the slot (requires auth, deducts bet)

### Wallet
- `POST /api/wallet/deposit` - Deposit funds (min 10 kr, max 50,000 kr)
- `GET /api/wallet/transactions` - User transaction history

### Game History
- `GET /api/history` - User game session history

### Admin (requires admin role)
- `GET /api/admin/stats` - Platform statistics
- `GET /api/admin/users` - All users
- `PATCH /api/admin/users/:id/active` - Activate/deactivate user
- `PATCH /api/admin/users/:id/balance` - Adjust user balance
- `PATCH /api/admin/users/:id/role` - Change user role
- `GET /api/admin/transactions` - All transactions
- `GET /api/admin/game-sessions` - All game sessions
- `GET /api/admin/slots` - All slots (including inactive)
- `PATCH /api/admin/slots/:id/active` - Toggle slot active status

## Default Admin Credentials
- Username: `admin`
- Password: `admin123`

## Database Schema

### Tables
- `users` - User accounts (id, username, email, passwordHash, balance, role, isActive)
- `slots` - Slot machine definitions (name, rtp, minBet, maxBet, themeKey, etc.)
- `transactions` - Financial history (deposit, win, loss, bonus, admin_adjust)
- `game_sessions` - Individual spin records with reel results

## Slot Game Mechanics
- 5 reels, 3 rows each = 15 symbols visible (2D slot machine layout)
- 9 paylines: 3 horizontal rows + 2 diagonals + 4 zigzag patterns
- 6 regular symbols per theme + 1 scatter symbol (FREE, gold)
- Symbol values: value3/value4/value5 for 3/4/5 consecutive matches from left
- Scatter symbol triggers free spins: 3 scatters = 5, 4 = 10, 5+ = 15 free spins
- Free spins use the bet amount from when they were won (no balance deduction)
- Free spins can re-trigger during free spin rounds
- Free spins tracked in-memory per user+slot on the server
- Server-side spin generation and win calculation

## Theme
- Dark mode by default
- Gold/amber primary color (CSS: `43 96% 52%`)
- Dark background (`7%` lightness)
