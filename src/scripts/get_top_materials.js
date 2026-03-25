const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('../o2c.sqlite');
db.all("SELECT material, COUNT(*) as c FROM sales_order_items GROUP BY material ORDER BY c DESC LIMIT 10", (err, rows) => {
    if (err) console.error(err);
    else console.log("Top Materials:", rows);
    db.close();
});
