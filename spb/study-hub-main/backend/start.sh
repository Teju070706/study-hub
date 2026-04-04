# Study Hub Server Setup & Startup

# 1. Navigate to server directory
cd server

# 2. Install dependencies (if not already done)
npm install

# 3. Generate Prisma Client
npx prisma generate

# 4. Push database schema
npx prisma db push

# 5. Seed the database (optional - adds sample data)
node prisma/seed.js

# 6. Start the server
npm run dev

