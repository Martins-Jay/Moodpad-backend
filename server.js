import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

import 'dotenv/config';
// console.log('JAMENDO_CLIENT_ID:', process.env.JAMENDO_CLIENT_ID);

const app = express();

app.use(
  cors({
    origin: [
      'http://localhost:3000',
      'http://192.168.88.24:3000',
      'https://moodpad-app.vercel.app',
    ],
  }),
);

app.use(express.json());

const PORT = process.env.PORT || 5008;

const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute per IP
});

// Jamendo route
app.get('/api/jamendo', apiLimiter, async (req, res) => {
  const { q, offset = 0 } = req.query;

  const query = q.toString();
  const offsetNum = Number(offset) || 0;

  try {
    const clientId = process.env.JAMENDO_CLIENT_ID;

    const response = await fetch(
      `https://api.jamendo.com/v3.0/tracks/?client_id=${clientId}&format=json&limit=25&offset=${offsetNum}&search=${encodeURIComponent(
        query,
      )}&audioformat=mp32`,
    );

    const data = await response.json();

    res.json({ data: data.results || [] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch Jamendo music' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});

// Deezer route (keep for now)
// app.get('/api/music', apiLimiter, async (req, res) => {
//   const { q, index = 0 } = req.query;

//   try {
//     const response = await fetch(
//       `https://api.deezer.com/search?q=${encodeURIComponent(q)}&limit=25&index=${index}`,
//     );

//     const data = await response.json();

//     res.json(data);
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to fetch music' });
//   }
// });
