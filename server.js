const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Opslag in het geheugen voor Workspaces en Sessies
let workspaces = [
  { id: 'default', name: 'Mijn Roblox Workspace', code: '1234' }
];

let sessions = [];

// Get alle workspaces
app.get('/api/workspaces', (req, res) => {
  res.json(workspaces);
});

// Maak een nieuwe workspace aan
app.post('/api/workspaces', (req, res) => {
  const { name, code } = req.body;
  const newWorkspace = {
    id: name.toLowerCase().replace(/\s+/g, '-'),
    name,
    code: code || '1234'
  };
  workspaces.push(newWorkspace);
  res.status(201).json({ success: true, workspace: newWorkspace });
});

// Get sessies per workspace
app.get('/api/sessions/:workspaceId', (req, res) => {
  const { workspaceId } = req.params;
  const filteredSessions = sessions.filter(s => s.workspaceId === workspaceId);
  res.json(filteredSessions);
});

// Voeg sessie toe aan specifieke workspace
app.post('/api/sessions', (req, res) => {
  const { workspaceId, host, type, time, date } = req.body;
  const newSession = {
    id: Date.now(),
    workspaceId: workspaceId || 'default',
    host,
    type,
    time,
    date: date || new Date().toISOString().split('T')[0],
    status: 'Scheduled'
  };
  sessions.push(newSession);
  res.status(201).json({ success: true, session: newSession });
});

// Stuur altijd index.html door
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server draait op poort ${PORT}`);
});
