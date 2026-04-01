
1. Push your code to GitHub.
2. In Render, create a **Web Service** from this repo.
3. Configure:
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
4. Add environment variables in Render dashboard:
   - `MONGO_URI` = your MongoDB connection string
   - `JWT_SECRET` = a strong random secret
   - `PORT` = `10000` (Render default is also fine)
   - `CORS_ORIGIN` = your frontend URL (example: `https://your-app.vercel.app`)
5. Deploy and copy backend URL, for example:
   - `https://mom-pharmacy-api.onrender.com`

## 2) Deploy Frontend (Vercel)

1. In Vercel, import the same GitHub repo.
2. Configure:
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. Add environment variable in Vercel dashboard:
   - `VITE_BASE_URL` = your deployed backend URL
     - Example: `https://mom-pharmacy-api.onrender.com`
4. Deploy.

## 3) Final Check

1. Open frontend URL.
2. Signup/login and test donor search.
3. If API calls fail, check:
   - Backend logs for CORS or Mongo errors
   - `CORS_ORIGIN` exactly matches frontend origin
   - `VITE_BASE_URL` points to backend root URL (without trailing slash is preferred)

## Notes

- Frontend now uses `frontend/src/config/api.js` for API base URL.
- Backend now reads `CORS_ORIGIN` (comma-separated origins supported).
- No new `.env` files are required for deployment.
