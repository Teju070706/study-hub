# Study Hub

Study materials sharing platform separated into frontend and backend folders.

## Setup

### Backend (Node.js + Prisma)
```bash
cd backend
npm install
npx prisma db push  # or npm run db:push
node prisma/seed.js # optional seed data
npm run dev
```
- Runs on http://localhost:3001
- Uploads served at http://localhost:3001/uploads

### Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
- Runs on http://localhost:8080
- Set VITE_API_URL=http://localhost:3001 in .env if needed (default OK)

## Production
- Backend: `npm run start`
- Frontend: `npm run build` then serve dist/

## VSCode Note
Reload window after moving files as tabs reference old paths (src/ → frontend/src/).
