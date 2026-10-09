# GroceryTrack — TypeScript Version

இந்த project முழுவதும் TypeScript-க்கு மாற்றப்பட்டுள்ளது.

## 1. Windows PowerShell / CMD
இந்த folder-க்குள் தான் terminal திறக்க வேண்டும். `package.json` இருக்கும் folder-ல் இருக்கிறீர்களா என்பதை:

```powershell
dir
```

மூலம் சரிபார்க்கவும்.

## 2. Dependencies

```powershell
npm install
```

## 3. Environment file

```powershell
copy .env.example .env
notepad .env
```

`.env`-ல் உங்கள் MySQL values கொடுக்கவும்:

```env
DB_HOST=YOUR_DB_HOST
DB_USER=YOUR_DB_USER
DB_PASSWORD=YOUR_DB_PASSWORD
DB_NAME=YOUR_DB_NAME
DB_PORT=3306
DB_SSL_CA=./ca.pem
PORT=3000
JWT_SECRET=YOUR_LONG_RANDOM_SECRET
```

`ca.pem` project root-ல் இருக்க வேண்டும்.

## 4. TypeScript build

```powershell
npm run build
```

## 5. Development server

```powershell
npm run dev
```

## 6. Production

```powershell
npm run build
npm start
```

## TypeScript fixes included

- Express `Request.user` global type declaration
- Safe JWT `jwt.verify()` handling
- Safe `JWT_SECRET` validation
- Safe `.env` loading from `db.ts`
- Safe SSL certificate path validation
- `salesRoutes.ts` authentication guard
- TypeScript strict build configuration
