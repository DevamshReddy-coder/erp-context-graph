const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

async function test() {
  const db = await open({
    filename: 'c:/Users/saide/OneDrive/Documents/Desktop/erp-context-graph/o2c.sqlite',
    driver: sqlite3.Database
  });

  const res = await db.all("SELECT referenceSdDocument FROM billing_document_items WHERE billingDocument = '90504248'");
  console.log(res);

  await db.close();
}
test();
