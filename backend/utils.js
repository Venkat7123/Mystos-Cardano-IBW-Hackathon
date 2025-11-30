const {ethers} = require('ethers');
const nacl = require('tweetnacl');
const bs58 = require('bs58');
const { sha256 } = require('js-sha256');
const { nanoid } = require('nanoid');

function canonicalizeAttestation(att) {
  return `${att.tx_id}|${att.rater_pubkey}|${att.counterparty_id}|${att.nonce}`;
}

function ethVerify(attestation, signature, expectedAddr) {
  try {
    const canonical = canonicalizeAttestation(attestation);
    const signer = ethers.verifyMessage(canonical, signature);
    return signer.toLowerCase() === expectedAddr.toLowerCase();
  } catch (e) {
    console.error('eth verify error', e);
    return false;
  }
}

function hexToUint8(hex) {
  if (!hex) return null;
  if (hex.startsWith('0x')) hex = hex.slice(2);
  const len = Math.floor(hex.length / 2);
  const u8 = new Uint8Array(len);
  for (let i = 0; i < len; i++) u8[i] = parseInt(hex.substr(i * 2, 2), 16);
  return u8;
}

function mysVerify(attestation, signatureHex, expectedPubkeyBase58) {
  try {
    const canonical = canonicalizeAttestation(attestation);
    const msgBytes = new TextEncoder().encode(canonical);
    const sigBytes = hexToUint8(signatureHex);
    if (!sigBytes) return false;
    const pubkeyBytes = bs58.decode(expectedPubkeyBase58);
    return nacl.sign.detached.verify(msgBytes, sigBytes, pubkeyBytes);
  } catch (e) {
    console.error('sol verify error', e);
    return false;
  }
}

async function mockGenerateProof(attestation) {
  await new Promise(r => setTimeout(r, 300));
  const inputHash = sha256(canonicalizeAttestation(attestation));
  const id = nanoid();
  return { id, proofHash: inputHash, createdAt: new Date().toISOString(), note: 'mock-proof' };
}

module.exports = {
  canonicalizeAttestation,
  ethVerify,
  mysVerify,
  mockGenerateProof
};
