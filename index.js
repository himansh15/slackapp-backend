const express = require('express');
const fetch = require('node-fetch'); // Make sure it's version 2.x installed!
require('dotenv').config();
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const SLACK_TOKEN = process.env.SLACK_BOT_TOKEN;

// Root endpoint for a friendly status check
app.get('/', (req, res) => {
  res.send('Slack Messenger API backend is running!');
});

// 1. Get Slack channels
app.get('/api/channels', async (req, res) => {
  try {
    const resp = await fetch('https://slack.com/api/conversations.list', {
      headers: { Authorization: `Bearer ${SLACK_TOKEN}` }
    });
    const data = await resp.json();
    if (data.ok) {
      res.json({ channels: data.channels.map(ch => ({ id: ch.id, name: ch.name })) });
    } else {
      res.status(500).json({ error: data.error || 'Could not fetch channels' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message || 'Unknown error occurred' });
  }
});

// 2. Send a message to a channel
app.post('/api/sendMessage', async (req, res) => {
  const { channel, message } = req.body;
  try {
    const resp = await fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SLACK_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ channel, text: message })
    });
    const data = await resp.json();
    if (data.ok) {
      res.json({ ok: true });
    } else {
      res.status(500).json({ ok: false, error: data.error });
    }
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message || 'Unknown error occurred' });
  }
});

// Use the port assigned by Render, or default to 3001 locally
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));