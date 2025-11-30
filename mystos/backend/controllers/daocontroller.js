// backend/controllers/daoController.js
const { randomUUID } = require('crypto');
const db = require('../db'); // uses the db wrapper we set up earlier

// demo static proposals (you can also store these in DB)
const STATIC_PROPOSALS = [
  { id: 'p1', title: 'Increase staking rewards', summary: 'Vote to increase staking rewards by 5%', details: 'Proposal p1 full details and rationale. This will affect staking reward distribution for the next epoch.' },
  { id: 'p2', title: 'Add SOL to treasury', summary: 'Allocate small reserve in SOL', details: 'Proposal p2 full details and rationale. We propose a small strategic allocation to SOL to diversify treasury.' },
  { id: 'prop-101', title: 'Treasury Allocation Q1', summary: 'Allocate funds for marketing and grants', details: 'Detailed budget line items and expected impact metrics.' }
];

// GET /dao/proposals
async function proposals(req, res) {
  // For demo, return static list. Later, fetch from DB or IPFS.
  res.json(STATIC_PROPOSALS.map(p => ({ id: p.id, title: p.title, summary: p.summary })));
}

// GET /dao/proposals/:id
async function proposalById(req, res) {
  const id = req.params.id;
  const found = STATIC_PROPOSALS.find(p => p.id === id);
  if (found) {
    return res.json(found);
  }

  // if you want to support DB-stored proposals, try reading from DB
  try {
    const row = await db.get('SELECT id, title, summary, details FROM dao_proposals WHERE id = ?', [id]);
    if (row) return res.json(row);
  } catch (e) {
    console.warn('dao.proposalById db lookup failed', e);
  }

  return res.status(404).json({ error: 'not_found' });
}

// POST /dao/vote  — records a simple vote entry
async function vote(req, res) {
  try {
    const { proposalId, voter, choice } = req.body;
    if (!proposalId || !voter || !choice) return res.status(400).json({ error: 'missing_fields' });

    const id = `vote-${randomUUID()}`;
    const now = new Date().toISOString();

    // store in txs table or create small votes table — we'll use 'txs' for minimal demo
    await db.run(`INSERT INTO txs (id, tx_id, chain, asset, rater_pubkey, counterparty_id, rating, comment, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [id, id, 'dao', 'VOTE', voter, proposalId, null, JSON.stringify({ choice }), now]);

    // optionally return current vote counts (simple aggregate)
    const rows = await db.all('SELECT counterparty_id as proposalId, COUNT(1) as votes FROM txs WHERE chain = ? GROUP BY counterparty_id', ['dao']);
    const counts = rows.reduce((acc, r) => { acc[r.proposalId] = r.votes; return acc; }, {});

    res.json({ status: 'ok', voteId: id, counts });
  } catch (e) {
    console.error('/dao/vote error', e);
    res.status(500).json({ error: 'internal', detail: e.message });
  }
}

module.exports = { proposals, proposalById, vote };
