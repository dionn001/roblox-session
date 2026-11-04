
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(express.json());
app.use(express.static(__dirname));

// Session storage
let sessions = [];

// Get all sessions
app.get('/api/sessions', (req, res) => {
    res.json(sessions);
});

// Create a new session
app.post('/api/sessions', (req, res) => {
    const { host, type, time, status } = req.body;

    const newSession = {
        id: Date.now(),
        host: host || 'Unknown',
        type: type || 'Training',
        time: time || 'TBD',
        status: status || 'Scheduled'
    };

    sessions.push(newSession);

    res.status(201).json({
        success: true,
        session: newSession
    });
});

// Serve frontend
app.get('/{*splat}', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
