const db = require('../db');
const { nanoid } = require('nanoid');

// Address validation helper
function isValidAddress(address) {
  if (!address || typeof address !== 'string') return false;
  // Check for Ethereum-style address (0x + 40 hex chars)
  if (/^0x[a-fA-F0-9]{40}$/.test(address)) return true;
  // Check for Bitcoin-style address (starts with 1, 3, or bc1)
  if (/^(1|3)[a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(address)) return true;
  if (/^bc1[a-zA-HJ-NP-Z0-9]{39,59}$/.test(address)) return true;
  // Check for Solana-style address (base58, 32-44 chars)
  if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)) return true;
  return false;
}

async function coins(req, res) {
  try {
    const rows = await db.all('SELECT id, symbol, name, balance, price FROM coins ORDER BY symbol');
    res.json(rows);
  } catch (e) {
    console.error('/tx/coins', e);
    res.status(500).json({ error: 'internal' });
  }
}

async function history(req, res) {
  try {
    const rows = await db.all('SELECT * FROM tx_history ORDER BY date DESC LIMIT 200');
    // Map to frontend Transaction format
    const transactions = rows.map(row => ({
      id: row.id,
      type: row.type,
      status: row.status,
      token: row.token,
      amount: row.amount,
      usdAmount: row.usd_amount,
      date: row.date,
      network: row.network,
      hash: row.hash,
      fromAddress: row.from_address,
      toAddress: row.to_address,
      fee: row.fee,
      description: row.description
    }));
    res.json(transactions);
  } catch (e) {
    console.error('/tx/history', e);
    res.status(500).json({ error: 'internal' });
  }
}

async function send(req, res) {
  try {
    const { to_address, token, amount, note } = req.body;
    
    // Validate required fields
    if (!to_address || !token || !amount) {
      return res.status(400).json({ error: 'missing_fields', message: 'Missing required fields' });
    }
    
    // Validate address format
    if (!isValidAddress(to_address)) {
      return res.status(400).json({ error: 'invalid_address', message: 'Invalid recipient address format' });
    }
    
    const amountNum = Number(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return res.status(400).json({ error: 'invalid_amount', message: 'Amount must be a positive number' });
    }

    const coin = await db.get('SELECT balance, price FROM coins WHERE symbol = ?', [token.toUpperCase()]);
    if (!coin) return res.status(400).json({ error: 'asset_not_found', message: 'Asset not found' });
    
    if (coin.balance < amountNum) {
      return res.status(400).json({ error: 'insufficient_balance', message: 'Insufficient balance' });
    }

    // Update balance
    const newBalance = coin.balance - amountNum;
    await db.run('UPDATE coins SET balance = ? WHERE symbol = ?', [newBalance, token.toUpperCase()]);

    // Create transaction record
    const txId = `tx-${nanoid()}`;
    const txHash = `0x${nanoid(64)}`;
    const now = new Date().toISOString();
    const fee = 0.002; // Mock fee
    const usdAmount = amountNum * coin.price;
    
    await db.run(`
      INSERT INTO tx_history (id, type, status, token, amount, usd_amount, date, network, hash, from_address, to_address, fee, description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [txId, 'send', 'confirmed', token.toUpperCase(), amountNum, usdAmount, now, token.toUpperCase(), txHash, 'self', to_address, fee, note || null]);

    const rows = await db.all('SELECT id, symbol, name, balance, price FROM coins ORDER BY symbol');
    const totalUSD = rows.reduce((s, r) => s + (r.balance * r.price), 0);
    
    res.json({ 
      status: 'ok', 
      txId,
      txHash,
      balancePerCoin: rows, 
      totalUSD 
    });
  } catch (e) {
    console.error('/tx/send', e);
    res.status(500).json({ error: 'internal', message: 'Internal server error' });
  }
}

async function receive(req, res) {
  try {
    const { from_address, token, amount, note } = req.body;
    
    if (!from_address || !token || !amount) {
      return res.status(400).json({ error: 'missing_fields', message: 'Missing required fields' });
    }
    
    // Validate sender address format
    if (!isValidAddress(from_address)) {
      return res.status(400).json({ error: 'invalid_address', message: 'Invalid sender address format' });
    }
    
    const amountNum = Number(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return res.status(400).json({ error: 'invalid_amount', message: 'Amount must be a positive number' });
    }

    const coin = await db.get('SELECT balance, price FROM coins WHERE symbol = ?', [token.toUpperCase()]);
    if (!coin) return res.status(400).json({ error: 'asset_not_found', message: 'Asset not found' });

    // Update balance
    const newBalance = coin.balance + amountNum;
    await db.run('UPDATE coins SET balance = ? WHERE symbol = ?', [newBalance, token.toUpperCase()]);

    // Create transaction record
    const txId = `tx-${nanoid()}`;
    const txHash = `0x${nanoid(64)}`;
    const now = new Date().toISOString();
    const fee = 0;
    const usdAmount = amountNum * coin.price;
    
    await db.run(`
      INSERT INTO tx_history (id, type, status, token, amount, usd_amount, date, network, hash, from_address, to_address, fee, description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [txId, 'receive', 'confirmed', token.toUpperCase(), amountNum, usdAmount, now, token.toUpperCase(), txHash, from_address, 'self', fee, note || null]);

    const rows = await db.all('SELECT id, symbol, name, balance, price FROM coins ORDER BY symbol');
    const totalUSD = rows.reduce((s, r) => s + (r.balance * r.price), 0);
    
    res.json({ 
      status: 'ok', 
      txId,
      txHash,
      balancePerCoin: rows, 
      totalUSD 
    });
  } catch (e) {
    console.error('/tx/receive', e);
    res.status(500).json({ error: 'internal', message: 'Internal server error' });
  }
}

// Swap tokens
async function swap(req, res) {
  try {
    const { fromToken, toToken, fromAmount, toAmount } = req.body;
    
    // Validate required fields
    if (!fromToken || !toToken || !fromAmount) {
      return res.status(400).json({ error: 'missing_fields', message: 'Missing required fields' });
    }
    
    if (fromToken === toToken) {
      return res.status(400).json({ error: 'same_token', message: 'Cannot swap same token' });
    }
    
    const amountNum = Number(fromAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return res.status(400).json({ error: 'invalid_amount', message: 'Amount must be a positive number' });
    }

    // Get source coin
    const fromCoin = await db.get('SELECT balance, price FROM coins WHERE symbol = ?', [fromToken.toUpperCase()]);
    if (!fromCoin) {
      return res.status(400).json({ error: 'asset_not_found', message: `Source asset ${fromToken} not found` });
    }
    
    if (fromCoin.balance < amountNum) {
      return res.status(400).json({ error: 'insufficient_balance', message: 'Insufficient balance' });
    }

    // Get destination coin
    const toCoin = await db.get('SELECT balance, price FROM coins WHERE symbol = ?', [toToken.toUpperCase()]);
    if (!toCoin) {
      return res.status(400).json({ error: 'asset_not_found', message: `Destination asset ${toToken} not found` });
    }

    // Calculate swap amounts
    const receivedAmount = toAmount || (amountNum * (fromCoin.price / toCoin.price));
    
    // Update balances
    const newFromBalance = fromCoin.balance - amountNum;
    const newToBalance = toCoin.balance + receivedAmount;
    
    await db.run('UPDATE coins SET balance = ? WHERE symbol = ?', [newFromBalance, fromToken.toUpperCase()]);
    await db.run('UPDATE coins SET balance = ? WHERE symbol = ?', [newToBalance, toToken.toUpperCase()]);

    // Create transaction record
    const txId = `tx-${nanoid()}`;
    const txHash = `0x${nanoid(64)}`;
    const now = new Date().toISOString();
    const fee = 0.001 * amountNum; // 0.1% fee
    const usdAmount = amountNum * fromCoin.price;
    
    await db.run(`
      INSERT INTO tx_history (id, type, status, token, amount, usd_amount, date, network, hash, from_address, to_address, fee, description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [txId, 'swap', 'confirmed', `${fromToken.toUpperCase()}->${toToken.toUpperCase()}`, amountNum, usdAmount, now, 'SWAP', txHash, fromToken.toUpperCase(), toToken.toUpperCase(), fee, `Swapped ${amountNum} ${fromToken} for ${receivedAmount.toFixed(6)} ${toToken}`]);

    const rows = await db.all('SELECT id, symbol, name, balance, price FROM coins ORDER BY symbol');
    const totalUSD = rows.reduce((s, r) => s + (r.balance * r.price), 0);
    
    res.json({ 
      status: 'ok', 
      txId,
      txHash,
      fromAmount: amountNum,
      toAmount: receivedAmount,
      balancePerCoin: rows, 
      totalUSD 
    });
  } catch (e) {
    console.error('/tx/swap', e);
    res.status(500).json({ error: 'internal', message: 'Internal server error' });
  }
}

module.exports = { coins, history, send, receive, swap };
