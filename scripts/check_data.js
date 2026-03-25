const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('../o2c.sqlite');
db.get("SELECT * FROM billing_document_headers WHERE billingDocument='90504248'", (err, row) => {
    console.log("Invoice:", row);
    db.close();
});
