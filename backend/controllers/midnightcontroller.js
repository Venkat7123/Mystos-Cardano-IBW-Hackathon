const { sha256 } = require('js-sha256');
const { randomUUID } = require('crypto');

async function prove(req, res) {
  const { attestation } = req.body;
  if (!attestation) return res.status(400).json({ error: 'missing_attestation' });

  const canonical = JSON.stringify(attestation);
  const proofHash = sha256(canonical);
  const proofId = randomUUID();

  res.json({
    proofId,
    proofHash,
    protocol: "midnight-mock-v1"
  });
}

async function verify(req, res) {
  const { attestation, proofHash } = req.body;
  const canonical = JSON.stringify(attestation);
  const checkHash = sha256(canonical);

  res.json({
    valid: checkHash === proofHash,
    protocol: "midnight-mock-v1"
  });
}

module.exports = { prove, verify };
