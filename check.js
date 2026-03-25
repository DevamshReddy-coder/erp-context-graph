const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
async function run() {
    const db = await open({ filename: 'c:/Users/saide/OneDrive/Documents/Desktop/erp-context-graph/o2c.sqlite', driver: sqlite3.Database });
    // The schema truth:
    // billing_document_items.referenceSdDocument = deliveryDocument  
    // outbound_delivery_items.referenceSdDocument = salesOrder
    // sales_order_items.material exists
    const res = await db.all(`
        SELECT soh.salesOrder, bi.billingDocument, soi.material, COUNT(DISTINCT bi.billingDocument) as cnt
        FROM billing_document_items bi 
        JOIN outbound_delivery_items odi ON odi.deliveryDocument = bi.referenceSdDocument 
        JOIN sales_order_headers soh ON soh.salesOrder = odi.referenceSdDocument
        JOIN sales_order_items soi ON soi.salesOrder = soh.salesOrder
        WHERE soh.salesOrder IN (SELECT salesOrder FROM sales_order_headers LIMIT 100) 
        AND soi.material IS NOT NULL 
        GROUP BY soi.material 
        ORDER BY cnt DESC LIMIT 5
    `);
    console.log("RESULTS:", res);
}
run();
