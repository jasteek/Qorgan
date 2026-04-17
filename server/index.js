const express = require('express');
const cors = require('cors');
const db = require('./db');

// Load .env from project root
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

// Global API Keys
const OPENAI_KEY = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY || '';
const GEMINI_KEY = process.env.GEMINI_API_KEY || '';
const SPOTIFY_CLIENT_ID = process.env.VITE_SPOTIFY_CLIENT_ID || '';

// 1. Send SMS Code (Mocked)
app.post('/api/auth/send-code', (req, res) => {
  const { phone } = req.body;
  
  // Basic validation (example mapping to KZ format roughly, or just pure numbers)
  const phoneRegex = /^\+?[0-9]{10,15}$/;
  if (!phoneRegex.test(phone)) {
    return res.status(400).json({ error: 'Неверный формат номера телефона. Используйте формат: +77001234567' });
  }

  // Generate 4 digit code
  const code = Math.floor(1000 + Math.random() * 9000).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 min expiry

  // Insert into db (replace if exists)
  db.run(`INSERT INTO auth_codes (phone, code, expires_at) VALUES (?, ?, ?)`, [phone, code, expiresAt], async function(err) {
    if (err) {
       console.error("Error saving auth code:", err);
       return res.status(500).json({ error: 'Ошибка сервера' });
    }
    // Trigger SMS (Mocked bypass)
    console.log(`[SMS-DEMO] Code for ${phone} is ${code}`);
    // Simulate network delay
    setTimeout(() => res.json({ success: true, message: 'Код отправлен (Демо)', code }), 1000);
  });
});

// 2. Verify Code & Login/Register
app.post('/api/auth/verify', (req, res) => {
  const { phone, code, name } = req.body;

  db.get(`SELECT * FROM auth_codes WHERE phone = ? ORDER BY id DESC LIMIT 1`, [phone], (err, row) => {
    if (err || !row) {
      return res.status(400).json({ error: 'Код не найден' });
    }

    if (row.code !== code) {
      return res.status(400).json({ error: 'Неверный код' });
    }

    if (new Date(row.expires_at) < new Date()) {
      return res.status(400).json({ error: 'Код устарел' });
    }

    // Auth Success -> Clear code and find/create user
    db.run(`DELETE FROM auth_codes WHERE phone = ?`, [phone]);

    db.get(`SELECT * FROM users WHERE phone = ?`, [phone], (err, user) => {
      if (user) {
        // User exists -> update name if provided
        if (name && name.trim() !== '' && user.name !== name) {
          db.run(`UPDATE users SET name = ? WHERE id = ?`, [name, user.id], () => {
            user.name = name;
            return res.json({ success: true, user });
          });
        } else {
          return res.json({ success: true, user });
        }
      } else {
        // Create user
        const finalName = name || 'User';
        db.run(`INSERT INTO users (phone, name) VALUES (?, ?)`, [phone, finalName], function(err) {
          if (err) return res.status(500).json({ error: 'Ошибка создания пользователя' });
          res.json({ success: true, user: { id: this.lastID, phone, name: finalName } });
        });
      }
    });
  });
});

// 3. Update Location
app.post('/api/location', (req, res) => {
  const { userId, lat, lng } = req.body;
  if (!userId || !lat || !lng) return res.status(400).json({ error: 'Missing data' });

  // Upsert
  db.run(`
    INSERT INTO locations (user_id, lat, lng, timestamp) 
    VALUES (?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(user_id) DO UPDATE SET lat=excluded.lat, lng=excluded.lng, timestamp=CURRENT_TIMESTAMP
  `, [userId, lat, lng], function(err) {
    if (err) return res.status(500).json({ error: 'Error saving location' });
    res.json({ success: true });
  });
});

// 4. Get Contacts' Locations (Two-way mutual sync)
app.get('/api/location/contacts', (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: 'userId missing' });
  
  // Get current user's phone to check who added them
  db.get(`SELECT phone FROM users WHERE id = ?`, [userId], (err, currentUser) => {
    if (err || !currentUser) return res.status(500).json({ error: 'User not found' });
    const myPhone = currentUser.phone;

    db.all(`
      -- 1) People I have added (They are in my emergency_contacts list)
      SELECT l.user_id, l.lat, l.lng, l.timestamp, u.phone, c.name 
      FROM locations l
      JOIN users u ON l.user_id = u.id
      JOIN emergency_contacts c ON c.phone = u.phone
      WHERE c.user_id = ? AND l.timestamp >= datetime('now', '-24 hour')
      
      UNION
      
      -- 2) People who added ME (My phone is in their emergency_contacts list)
      SELECT l.user_id, l.lat, l.lng, l.timestamp, u.phone, u.name 
      FROM locations l
      JOIN users u ON l.user_id = u.id
      JOIN emergency_contacts c ON c.user_id = u.id
      WHERE c.phone = ? AND l.timestamp >= datetime('now', '-24 hour')
    `, [userId, myPhone], (err, rows) => {
      if (err) return res.status(500).json({ error: 'Error fetching locations' });
      
      res.json({ contacts: rows || [] });
    });
  });
});

// 5. Emergency Contacts CRUD
app.get('/api/contacts', (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: 'userId required' });
  
  db.all(`SELECT * FROM emergency_contacts WHERE user_id = ? ORDER BY created_at DESC`, [userId], (err, rows) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.json({ contacts: rows || [] });
  });
});

app.post('/api/contacts', (req, res) => {
  const { userId, name, phone, relation } = req.body;
  if (!userId || !name || !phone) return res.status(400).json({ error: 'Missing fields' });
  
  db.run(`INSERT INTO emergency_contacts (user_id, name, phone, relation) VALUES (?, ?, ?, ?)`,
    [userId, name, phone, relation || ''], function(err) {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.json({ success: true, contact: { id: this.lastID, user_id: userId, name, phone, relation } });
  });
});

app.delete('/api/contacts/:id', (req, res) => {
  const { id } = req.params;
  db.run(`DELETE FROM emergency_contacts WHERE id = ?`, [id], function(err) {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.json({ success: true });
  });
});

// 6. Proxy AI (Gemini / OpenAI with offline fallback)
app.post('/api/ai/chat', async (req, res) => {
  const { messages, language } = req.body;
  
  if (GEMINI_KEY) {
    try {
      const https = require('https');
      
      // Map standard roles to Gemini roles
      const contents = messages.map(m => ({
        role: m.role === 'assistant' ? 'model' : m.role,
        parts: [{ text: m.content }]
      }));

      const data = JSON.stringify({
        systemInstruction: {
          parts: [{ text: "Ты — Самрұқ (Samruk), AI-ассистент по безопасности в приложении Qorǵan для защиты женщин в Казахстане. Помогай в экстренных ситуациях, предлагай безопасные маршруты, оказывай психологическую поддержку. Отвечай на том языке, на котором пишет пользователь. Давай короткие, лаконичные, дружелюбные и поддерживающие ответы. Будь заботливым и профессиональным." }]
        },
        contents: contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500
        }
      });
      
      const options = {
        hostname: 'generativelanguage.googleapis.com',
        path: `/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
        },
      };

      const apiReq = https.request(options, (apiRes) => {
        let body = '';
        apiRes.on('data', (chunk) => { body += chunk; });
        apiRes.on('end', () => {
          try {
            const parsed = JSON.parse(body);
            const reply = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
            if (reply) {
              res.json({ message: reply });
            } else {
              if (parsed.error) console.error('Gemini Error:', parsed.error.message);
              res.json({ message: getOfflineFallback(messages, language) });
            }
          } catch {
            res.json({ message: getOfflineFallback(messages, language) });
          }
        });
      });

      apiReq.on('error', () => {
        res.json({ message: getOfflineFallback(messages, language) });
      });
      apiReq.write(data);
      apiReq.end();
      return;
    } catch {
      // Fall through to offline
    }
  }

  // Offline fallback
  const responseText = getOfflineFallback(messages, language);
  setTimeout(() => {
    res.json({ message: responseText });
  }, 800);
});

function getOfflineFallback(messages, language) {
  const lastMsg = (messages[messages.length - 1]?.content || '').toLowerCase();
  
  if (/(помощь|угроза|страшн|боюсь|преследуют|sos|danger|help|көмек|қорқамын)/.test(lastMsg)) {
    if (language === 'kk') return "⚠️ Қауіпсіз жерге барыңыз! Карта арқылы ең жақын полиция немесе ауруханаға барыңыз.";
    if (language === 'en') return "⚠️ Get to a safe place immediately! Check the map for the nearest police station or hospital.";
    return "⚠️ Срочно идите в безопасное место! На Карте отмечены ближайшие пункты полиции и скорой.";
  }
  if (/(привет|салем|сәлем|hello|hi)/.test(lastMsg)) {
    if (language === 'kk') return "Сәлеметсіз бе! Мен Qorgan қауіпсіздік көмекшісімін. Сізге қалай көмектесе аламын?";
    if (language === 'en') return "Hello! I'm your Qorgan safety assistant. How can I help you?";
    return "Привет! Я ваш ассистент Qorgan. Как я могу вам помочь?";
  }
  if (language === 'kk') return "Мен сіздің сұрауыңызды талдаудамын. Қауіпсіздігіңіз — менің басты міндетім.";
  if (language === 'en') return "I'm analyzing your request. Your safety is my priority. Use the map for safe routes.";
  return "Я анализирую ситуацию. Ваша безопасность — мой приоритет. Используйте карту для безопасных маршрутов.";
}

// 7. Spotify Search Proxy (browser can't call Spotify directly due to CORS)
let spotifyToken = null;
let spotifyTokenExpiry = 0;

async function getSpotifyToken() {
  if (spotifyToken && Date.now() < spotifyTokenExpiry) return spotifyToken;
  if (!SPOTIFY_CLIENT_ID) return null;
  
  const https = require('https');
  return new Promise((resolve) => {
    const body = `grant_type=client_credentials&client_id=${SPOTIFY_CLIENT_ID}&client_secret=${SPOTIFY_CLIENT_ID}`;
    const options = {
      hostname: 'accounts.spotify.com',
      path: '/api/token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(body),
      },
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (c) => { data += c; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.access_token) {
            spotifyToken = parsed.access_token;
            spotifyTokenExpiry = Date.now() + (parsed.expires_in - 60) * 1000;
            resolve(spotifyToken);
          } else {
            console.error('Spotify token error:', data);
            resolve(null);
          }
        } catch { resolve(null); }
      });
    });
    req.on('error', () => resolve(null));
    req.write(body);
    req.end();
  });
}

app.get('/api/spotify/search', async (req, res) => {
  const { q } = req.query;
  if (!q) return res.json({ tracks: [] });

  const token = await getSpotifyToken();
  if (!token) return res.json({ tracks: [], error: 'No Spotify token' });

  const https = require('https');
  const options = {
    hostname: 'api.spotify.com',
    path: `/v1/search?q=${encodeURIComponent(q)}&type=track&limit=10`,
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` },
  };

  const apiReq = https.request(options, (apiRes) => {
    let body = '';
    apiRes.on('data', (c) => { body += c; });
    apiRes.on('end', () => {
      try {
        const data = JSON.parse(body);
        const tracks = (data.tracks?.items || []).map((t) => ({
          id: t.id,
          title: t.name,
          artist: t.artists?.map((a) => a.name).join(', ') || '',
          duration: `${Math.floor(t.duration_ms / 60000)}:${String(Math.floor((t.duration_ms % 60000) / 1000)).padStart(2, '0')}`,
          preview_url: t.preview_url,
          album_image: t.album?.images?.[1]?.url || t.album?.images?.[0]?.url || '',
        }));
        res.json({ tracks });
      } catch {
        res.json({ tracks: [] });
      }
    });
  });
  apiReq.on('error', () => res.json({ tracks: [] }));
  apiReq.end();
});

app.listen(PORT, () => {
  console.log(`Qorgan Backend Server running on http://localhost:${PORT}`);
  console.log(`  OpenAI key: ${OPENAI_KEY ? '✓ loaded' : '✗ missing'}`);
  console.log(`  Spotify ID: ${SPOTIFY_CLIENT_ID ? '✓ loaded' : '✗ missing'}`);
});

// Serve Frontend in Production
const path = require('path');
app.use(express.static(path.join(__dirname, '../dist')));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../dist/index.html')));
