// backend/db.js
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const DB_PATH = path.join(DATA_DIR, 'sollenium.sqlite');

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Failed to open DB', err);
    process.exit(1);
  }
});

// run schema
const schema = `
PRAGMA journal_mode = WAL;

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  pubkey TEXT UNIQUE,
  created_at TEXT
);

CREATE TABLE IF NOT EXISTS coins (
  id TEXT PRIMARY KEY,
  symbol TEXT,
  name TEXT,
  balance REAL DEFAULT 0,
  price REAL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS txs (
  id TEXT PRIMARY KEY,
  tx_id TEXT,
  chain TEXT,
  asset TEXT,
  rater_pubkey TEXT,
  counterparty_id TEXT,
  rating INTEGER,
  comment TEXT,
  created_at TEXT
);

CREATE TABLE IF NOT EXISTS tx_history (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  status TEXT DEFAULT 'confirmed',
  token TEXT NOT NULL,
  amount REAL NOT NULL,
  usd_amount REAL DEFAULT 0,
  date TEXT NOT NULL,
  network TEXT,
  hash TEXT,
  from_address TEXT,
  to_address TEXT,
  fee REAL DEFAULT 0,
  description TEXT
);

CREATE TABLE IF NOT EXISTS ratings (
  id TEXT PRIMARY KEY,
  tx_id TEXT,
  rater_pubkey TEXT,
  signature TEXT,
  chain TEXT,
  rating INTEGER,
  comment TEXT,
  proof_id TEXT,
  proof_hash TEXT,
  created_at TEXT
);

CREATE TABLE IF NOT EXISTS reputation (
  id TEXT PRIMARY KEY,
  score REAL DEFAULT 100,
  count INTEGER DEFAULT 0,
  updated_at TEXT
);

CREATE TABLE IF NOT EXISTS proofs (
  id TEXT PRIMARY KEY,
  proof_hash TEXT,
  payload TEXT,
  created_at TEXT,
  anchor_tx TEXT
);
`;

db.exec(schema, (err) => {
  if (err) {
    console.error('Failed to init schema', err);
    process.exit(1);
  }
  // seed coins if empty
  db.get('SELECT COUNT(1) as c FROM coins', (err, row) => {
    if (err) return console.error('count coins error', err);
    if (!row || row.c === 0) {
      // Total balance approximately $10,000
      // BTC: 0.05 * 64200 = $3210
      // ETH: 1.5 * 2650 = $3975  
      // USDT: 2000 * 1 = $2000
      // SOL: 5 * 145 = $725
      // ADA: 225 * 0.4 = $90
      // Total ≈ $10,000
      const insert = db.prepare('INSERT INTO coins (id, symbol, name, balance, price) VALUES (?, ?, ?, ?, ?)');
      insert.run('btc', 'BTC', 'Bitcoin', 0.05, 64200.0);
      insert.run('eth', 'ETH', 'Ethereum', 1.5, 2650.0);
      insert.run('usdt', 'USDT', 'Tether', 2000.0, 1.0);
      insert.run('sol', 'SOL', 'Solana', 5.0, 145.0);
      insert.run('ada', 'ADA', 'Cardano', 225.0, 0.4);
      insert.finalize();
    }
  });
});

// helper promise wrappers for convenience
function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}
function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}
function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}
function prepare(sql) {
  const stmt = db.prepare(sql);
  return {
    run: (...params) => new Promise((resolve, reject) => {
      stmt.run(...params, function (err) { if (err) reject(err); else resolve({ lastID: this.lastID, changes: this.changes }); });
    }),
    finalize: () => stmt.finalize()
  };
}

module.exports = { db, run, get, all, prepare };
