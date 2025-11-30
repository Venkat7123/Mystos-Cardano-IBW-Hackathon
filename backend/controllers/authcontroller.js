const jwt = require('jsonwebtoken');
const db = require('../db');
const { ethVerify, solVerify } = require('../utils');
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

async function login(req, res) {
  try {
    const { pubkey, signature, chain } = req.body;
    if (!pubkey || !signature || !chain) return res.status(400).json({ error: 'missing_fields' });

    const loginMessage = `Sollenium login ${pubkey}`;
    const att = { tx_id: 'login', rater_pubkey: pubkey, counterparty_id: 'login', nonce: loginMessage };

    let verified = false;
    if (chain === 'eth') verified = ethVerify(att, signature, pubkey);
    else if (chain === 'sol') verified = solVerify(att, signature, pubkey);
    else return res.status(400).json({ error: 'unsupported_chain' });

    if (!verified) return res.status(401).json({ error: 'invalid_signature' });

    const existing = await db.get('SELECT id FROM users WHERE pubkey = ?', [pubkey]);
    if (!existing) {
      const now = new Date().toISOString();
      await db.run('INSERT INTO users (id, pubkey, created_at) VALUES (?, ?, ?)', [pubkey, pubkey, now]);
    }

    const token = jwt.sign({ sub: pubkey }, JWT_SECRET, { expiresIn: '30d' });
    res.cookie('sollenium_session', token, { httpOnly: true, sameSite: 'lax', maxAge: 30 * 24 * 60 * 60 * 1000 });
    res.json({ status: 'ok', id: pubkey });
  } catch (e) {
    console.error('/auth/login error', e);
    res.status(500).json({ error: 'internal' });
  }
}

function logout(req, res) {
  res.clearCookie('sollenium_session');
  res.json({ status: 'ok' });
}

function me(req, res) {
  const token = req.cookies && req.cookies.sollenium_session;
  if (!token) return res.status(401).json({ error: 'not_logged_in' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    res.json({ status: 'ok', id: payload.sub });
  } catch (e) {
    res.status(401).json({ error: 'invalid_session' });
  }
}

module.exports = { login, logout, me };
