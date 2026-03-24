import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import fs from 'fs';

async function main() {
    const envFile = fs.readFileSync('.env.local', 'utf8');
    const apiKey = envFile.match(/GEMINI_API_KEY=(.*)/)?.[1]?.trim().replace(/["']/g, '');

    if (!apiKey) {
        console.error("GEMINI_API_KEY is missing in .env.local");
        return;
    }

    const ai = new GoogleGenAI({ apiKey: apiKey });

    const dbPath = path.resolve(process.cwd(), 'o2c.sqlite');
    const db = await open({ filename: dbPath, driver: sqlite3.Database });

    console.log("Loading entities for embedding...");
    const products = await db.all('SELECT p.product, pd.productDescription FROM products p JOIN product_descriptions pd ON p.product = pd.product');
    const customers = await db.all('SELECT businessPartner, businessPartnerName FROM business_partners');
    
    const embeddings = [];

    // Embed Products
    console.log(`Embedding ${products.length} products...`);
    for (const p of products) {
        const text = `Product: ${p.productDescription} (ID: ${p.product})`;
        try {
            const res = await ai.models.embedContent({
                model: "models/gemini-embedding-001",
                content: { parts: [{ text }] }
            });
            embeddings.push({ id: String(p.product), type: 'Product', text, vector: res.embedding.values });
            process.stdout.write(".");
        } catch (err) {
            console.error(`\nFailed to embed ${p.product}:`, err.message);
        }
        await new Promise(r => setTimeout(r, 600));
    }

    // Embed Customers
    console.log(`\nEmbedding ${customers.length} customers...`);
    for (const c of customers) {
        const text = `Customer: ${c.businessPartnerName} (ID: ${c.businessPartner})`;
        try {
            const res = await ai.models.embedContent({
                model: "models/text-embedding-004",
                content: { parts: [{ text }] }
            });
            embeddings.push({ id: String(c.businessPartner), type: 'Customer', text, vector: res.embedding.values });
            process.stdout.write("!");
        } catch (err) {
             console.error(`\nFailed to embed ${c.businessPartner}:`, err.message);
        }
        await new Promise(r => setTimeout(r, 600));
    }

    fs.writeFileSync('vectors.json', JSON.stringify(embeddings, null, 2));
    console.log("\nEmbeddings saved to vectors.json");
    await db.close();
}

main().catch(console.error);
