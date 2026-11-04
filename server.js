
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 10000;

const DATA_FILE = path.join(__dirname, 'data.json');

app.use(express.json());
app.use(express.static(__dirname));

// Default data
const defaultData = {
    sessions: [],
    settings: {
        siteName: 'SessionBoard',
        username: 'Dionn001',
        maintenanceMode: false
    }
};

// Load saved data
function loadData() {
    try {
        if (fs.existsSync(DATA_FILE)) {
            const saved = JSON.parse(
                fs.readFileSync(DATA_FILE, 'utf8')
            );

            return {
                sessions: Array.isArray(saved.sessions)
                    ? saved.sessions : [],
                settings: {
                    ...defaultData.settings,
                    ...(saved.settings || {})
                }
            };
        }
    } catch (error) {
        console.error('Failed to load data:', error);
    }

    return JSON.parse(JSON.stringify(defaultData));
}

let data = loadData();

// Save data
function saveData() {
    try {
        fs.writeFileSync(
            DATA_FILE,
            JSON.stringify(data, null, 2)
        );
    } catch (error) {
        console.error('Failed to save data:', error);
        throw error;
    }
}

// Get sessions
app.get('/api/sessions', (req, res) => {
    res.json(data.sessions);
});

// Create session
app.post('/api/sessions', (req, res) => {
    const { host, type, time, status } = req.body;

    if (!host || !time) {
        return res.status(400).json({
            success: false,
            message: 'Host and time are required'
        });
    }

    const session = {
        id: Date.now(),
        host: String(host).trim(),
        type: type || 'Training',
        time: String(time).trim(),
        status: status || 'Scheduled'
    };

    data.sessions.push(session);

    try {
        saveData();
    } catch {
        data.sessions.pop();

        return res.status(500).json({
            success: false,
            message: 'Failed to save session'
        });
    }

    res.status(201).json({
        success: true,
        session
    });
});

// Delete session
app.delete('/api/sessions/:id', (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid session ID'
        });
    }

    const index = data.sessions.findIndex(
        session => session.id === id
    );

    if (index === -1) {
        return res.status(404).json({
            success: false,
            message: 'Session not found'
        });
    }

    const [deleted] = data.sessions.splice(index, 1);

    try {
        saveData();
    } catch {
        data.sessions.splice(index, 0, deleted);

        return res.status(500).json({
            success: false,
            message: 'Failed to delete session'
        });
    }

    res.json({
        success: true,
        message: 'Session deleted'
    });
});

// Get settings
app.get('/api/settings', (req, res) => {
    res.json(data.settings);
});

// Update settings
app.put('/api/settings', (req, res) => {
    const allowedSettings = [
        'siteName',
        'username',
        'maintenanceMode'
    ];

    const updates = {};

    for (const key of allowedSettings) {
        if (req.body[key] !== undefined) {
            if (
                key === 'siteName' ||
                key === 'username'
            ) {
                if (
                    typeof req.body[key] !== 'string' ||
                    !req.body[key].trim()
                ) {
                    return res.status(400).json({
                        success: false,
                        message: `${key} must be a non-empty string`
                    });
                }

                updates[key] = req.body[key].trim();
            }

            if (key === 'maintenanceMode') {
                if (typeof req.body[key] !== 'boolean') {
                    return res.status(400).json({
                        success: false,
                        message: 'maintenanceMode must be boolean'
                    });
                }

                updates[key] = req.body[key];
            }
        }
    }

    const previousSettings = { ...data.settings };

    Object.assign(data.settings, updates);

    try {
        saveData();
    } catch {
        data.settings = previousSettings;

        return res.status(500).json({
            success: false,
            message: 'Failed to save settings'
        });
    }

    res.json({
        success: true,
        settings: data.settings
    });
});

// Frontend
app.get('/{*splat}', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`SessionBoard running on port ${PORT}`);
});
