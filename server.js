const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());
app.use(express.static(path.join(__dirname)));

let sessions = [];

// API route om alle sessies op te halen (voor Roblox en Website)
app.get('/api/sessions', (req, res) => {
  res.json(sessions);
});

// API route om een nieuwe sessie toe te voegen
app.post('/api/sessions', (req, res) => {
  const { host, type, time, status } = req.body;
  const newSession = { 
    id: Date.now(), 
    host, 
    type, 
    time, 
    status: status || 'Scheduled' 
  };
  sessions.push(newSession);
  res.status(201).json({ success: true, session: newSession });
});

// Zorg dat de website (index.html) opent als je naar de link surft
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
