import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

import 'dotenv/config';
console.log('JAMENDO_CLIENT_ID:', process.env.JAMENDO_CLIENT_ID);
console.log('TMDB:', process.env.TMDB_ACCESS_TOKEN);

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
  max: 200, // 30 requests per minute per IP
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

// TMDb route (movies)
app.get('/api/tmdb/discover', apiLimiter, async (req, res) => {
  const { with_genres = '', sort_by = 'popularity.desc', page = 1 } = req.query;

  const pageNum = Math.min(Math.max(Number(page) || 1, 1), 20); // keep it safe

  try {
    const token = process.env.TMDB_ACCESS_TOKEN;

    if (!token) {
      return res
        .status(500)
        .json({ error: 'TMDB_ACCESS_TOKEN missing in env' });
    }

    const url = new URL('https://api.themoviedb.org/3/discover/movie');
    if (with_genres) url.searchParams.set('with_genres', String(with_genres));
    url.searchParams.set('sort_by', String(sort_by));
    url.searchParams.set('page', String(pageNum));
    url.searchParams.set('include_adult', 'false');
    url.searchParams.set('language', 'en-US');

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({
        error: 'Failed to fetch TMDb movies',
        details: errText,
      });
    }

    const data = await response.json();

    // Keep response clean like your Jamendo route
    res.json({ results: data.results || [] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch TMDb movies' });
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
