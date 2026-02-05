import express from 'express';
import cors from 'cors';

const app = express(); // returns an object
app.use(cors()); // allows any frontend to make requests
app.use(express.json());

// app.use(
//   cors({
//     origin: 'http://localhost:3000', // your React app URLS
//   }),
// );

const PORT = process.env.PORT || 5008;

app.get('/api/music', async (req, res) => {
  const { q, index = 0 } = req.query;

  try {
    const response = await fetch(
      `https://api.deezer.com/search?q=${encodeURIComponent(q)}&limit=25&index=${index}`,
    );

    const data = await response.json(); // parses Deezer’s JSON response into a JS object
    res.json(data); // sends JSON back to the frontend
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch music' });
  }
});

// Bind app to a port to start the HTTP server
app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});
