// src/services/midnight.ts
import apiClient from './apiClient'; // adjust path if your api.ts is elsewhere

const { api } = apiClient;

// Type for ethers-like signer (we define our own interface to avoid requiring ethers in frontend)
interface EthersSigner {
  signMessage(message: string): Promise<string>;
}

export type Chain = 'eth' | 'sol';

export type Attestation = {
  tx_id: string;
  rater_pubkey: string;
  counterparty_id: string;
  nonce: string;
  // you can add rating/comment here if you want
};

function canonicalize(att: Attestation) {
  // Must match backend canonicalizeAttestation exactly
  return `${att.tx_id}|${att.rater_pubkey}|${att.counterparty_id}|${att.nonce}`;
}

export async function submitRatingWithMidnight(options: {
  signer: EthersSigner;            // ethers signer (Ethereum). See notes below for Solana.
  chain: Chain;                    // 'eth' or 'sol'
  raterPubkey: string;             // address / pubkey string of the rater
  counterpartyId: string;          // counterparty id (address / DID)
  txId?: string;                   // optional tx id; we will generate if missing
  asset: string;                   // asset symbol e.g. 'ETH'
  rating: number;                  // 1..5
  comment?: string;
}): Promise<any> {
  const {
    signer, chain, raterPubkey, counterpartyId, txId: maybeTxId,
    asset, rating, comment = ''
  } = options;

  // 1) build attestation
  const tx_id = maybeTxId || `tx-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
  const nonce = crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const attestation: Attestation = { tx_id, rater_pubkey: raterPubkey, counterparty_id: counterpartyId, nonce };

  // 2) canonical string
  const message = canonicalize(attestation);

  // 3) sign the canonical string
  let signature: string;
  if (chain === 'eth') {
    signature = await signer.signMessage(message);
  } else {
    // SOLANA NOTE:
    // If you are using a Solana wallet (e.g. Phantom), you need to call its signMessage API.
    // Example (in page where window.solana is available):
    // const encoded = new TextEncoder().encode(message);
    // const signed = await window.solana.signMessage(encoded, 'utf8');
    // signature = Buffer.from(signed.signature).toString('hex'); // adapt to backend solVerify expectations
    throw new Error('Solana signing not implemented in this helper. Use wallet.signMessage and return hex signature.');
  }

  // 4) request Midnight proof (mock endpoint)
  const proveResp = await api.raw('/midnight/prove', 'POST', { attestation });
  // expect { proofId, proofHash, protocol: 'midnight-mock-v1' }
  const proofId = proveResp.proofId;
  const proofHash = proveResp.proofHash;

  // 5) submit rating to backend (includes attestation + signature + proofHash optionally)
  const submitPayload = {
    attestation,
    signature,
    chain,
    asset,
    rating,
    comment,
    proofHash,
    proofId
  };

  const serverResp = await api.submitRating(submitPayload);
  // serverResp should contain { status: 'ok', proofId, proofVerified, reputation: {...} } per backend

  return { serverResp, proveResp, attestation };
}
