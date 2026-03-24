const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

async function test() {
  const db = await open({
    filename: 'c:/Users/saide/OneDrive/Documents/Desktop/erp-context-graph/o2c.sqlite',
    driver: sqlite3.Database
  });

  const res = await db.all("SELECT * FROM journal_entry_items_accounts_receivable WHERE referenceDocument = '90504248' OR accountingDocument IN (SELECT accountingDocument FROM billing_document_headers WHERE billingDocument = '90504248')");
  console.log(JSON.stringify(res, null, 2));

  await db.close();
}
test();
