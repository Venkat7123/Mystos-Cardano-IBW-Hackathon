const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'data', 'sollenium.sqlite'));

db.serialize(() => {
  // Update balances to total ~$10,000
  db.run('UPDATE coins SET balance = 0.05 WHERE symbol = "BTC"');   // 0.05 * 64200 = $3210
  db.run('UPDATE coins SET balance = 1.5 WHERE symbol = "ETH"');    // 1.5 * 2650 = $3975
  db.run('UPDATE coins SET balance = 2000.0 WHERE symbol = "USDT"'); // 2000 * 1 = $2000
  db.run('UPDATE coins SET balance = 5.0 WHERE symbol = "SOL"');    // 5 * 145 = $725
  db.run('UPDATE coins SET balance = 225.0 WHERE symbol = "ADA"');  // 225 * 0.4 = $90
  
  db.all('SELECT symbol, balance, price, balance*price as value FROM coins', (err, rows) => {
    if (err) {
      console.error(err);
    } else {
      console.log('Updated balances:');
      rows.forEach(r => console.log(`${r.symbol}: ${r.balance} x $${r.price} = $${r.value.toFixed(2)}`));
      const total = rows.reduce((s, r) => s + r.value, 0);
      console.log(`\nTotal: $${total.toFixed(2)}`);
    }
    db.close();
  });
});
