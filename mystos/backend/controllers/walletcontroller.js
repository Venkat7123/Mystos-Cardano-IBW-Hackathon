const db = require('../db');

async function register(req, res) {
  try {
    const { pubkey } = req.body;
    if (!pubkey) return res.status(400).json({ error: 'missing_pubkey' });
    const row = await db.get('SELECT id FROM users WHERE pubkey = ?', [pubkey]);
    if (row) return res.json({ status: 'exists', id: row.id });
    const now = new Date().toISOString();
    await db.run('INSERT INTO users (id, pubkey, created_at) VALUES (?, ?, ?)', [pubkey, pubkey, now]);
    res.json({ status: 'ok', id: pubkey });
  } catch (e) {
    console.error('/wallet/register', e);
    res.status(500).json({ error: 'internal' });
  }
}

module.exports = { register };
