const express = require('express');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());

// Default session data in English
let activeSessions = [
  { id: 1, host: "YourName", type: "Training", time: "20:00 CET", status: "Scheduled" }
];

// Endpoint for Roblox to fetch sessions
app.get('/api/sessions', (req, res) => {
  res.json({ success: true, data: activeSessions });
});

// Endpoint for the website to add new sessions
app.post('/api/sessions', (req, res) => {
  const newSession = req.body;
  activeSessions.push(newSession);
  res.json({ success: true, message: "Session successfully added!" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));