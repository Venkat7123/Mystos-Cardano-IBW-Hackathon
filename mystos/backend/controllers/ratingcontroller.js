const db = require('../db');
const { ethVerify, solVerify, mockGenerateProof } = require('../utils');
const { randomUUID } = require('nanoid');

async function submit(req, res) {
  try {
    const { attestation, signature, chain, asset, rating, comment } = req.body;
    if (!attestation || !signature || !chain) return res.status(400).json({ error: 'missing_fields' });

    let valid = false;
    if (chain === 'eth') valid = ethVerify(attestation, signature, attestation.rater_pubkey);
    else if (chain === 'sol') valid = solVerify(attestation, signature, attestation.rater_pubkey);
    else return res.status(400).json({ error: 'unsupported_chain' });

    if (!valid) return res.status(400).json({ error: 'invalid_signature' });

    const axios = require('axios');

    const proveResp = await axios.post("http://localhost:4000/midnight/prove", {
      attestation
    });

    const proofId = proveResp.data.proofId;
    const proofHash = proveResp.data.proofHash;

    await db.run(
      `INSERT INTO proofs (id, proof_hash, payload, created_at, anchor_tx)
   VALUES (?, ?, ?, ?, ?)`,
      [
        proofId,
        proofHash,
        JSON.stringify(attestation),
        new Date().toISOString(),
        null
      ]
    );


    const txId = attestation.tx_id || `tx-${randomUUID()}`;
    const now = new Date().toISOString();

    await db.run(`INSERT OR REPLACE INTO txs (id, tx_id, chain, asset, rater_pubkey, counterparty_id, rating, comment, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [txId, attestation.tx_id, chain, asset, attestation.rater_pubkey, attestation.counterparty_id, rating, comment, now]);

    const proofObj = await mockGenerateProof(attestation);
    await db.run('INSERT INTO proofs (id, proof_hash, payload, created_at, anchor_tx) VALUES (?, ?, ?, ?, ?)',
      [proofObj.id, proofObj.proofHash, JSON.stringify(attestation), proofObj.createdAt, null]);

    const ratingId = randomUUID();
    await db.run(`INSERT INTO ratings (id, tx_id, rater_pubkey, signature, chain, rating, comment, proof_id, proof_hash, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [ratingId, attestation.tx_id, attestation.rater_pubkey, signature, chain, rating, comment, proofObj.id, proofObj.proofHash, now]);

    // update reputation
    const repId = attestation.counterparty_id;
    const existing = await db.get('SELECT * FROM reputation WHERE id = ?', [repId]);
    let newScore = 100, newCount = 1;
    if (!existing) {
      newScore = ratingToScore(rating);
      await db.run('INSERT INTO reputation (id, score, count, updated_at) VALUES (?, ?, ?, ?)', [repId, newScore, newCount, now]);
    } else {
      newCount = existing.count + 1;
      newScore = Math.round(((existing.score * existing.count) + ratingToScore(rating)) / newCount);
      await db.run('UPDATE reputation SET score = ?, count = ?, updated_at = ? WHERE id = ?', [newScore, newCount, now, repId]);
    }

    const repRow = await db.get('SELECT * FROM reputation WHERE id = ?', [repId]);
    res.json({ status: 'ok', proofId: proofObj.id, proofVerified: true, reputation: repRow });
  } catch (e) {
    console.error('/rating/submit error', e);
    res.status(500).json({ error: 'internal', detail: e.message });
  }
}

function ratingToScore(r) {
  return Math.round((r - 1) * 20 + 20);
}

module.exports = { submit };
