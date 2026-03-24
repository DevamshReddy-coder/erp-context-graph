import { GoogleGenAI } from '@google/genai';
import fs from 'fs';

async function main() {
    const envFile = fs.readFileSync('.env.local', 'utf8');
    const apiKey = envFile.match(/GEMINI_API_KEY=(.*)/)?.[1]?.trim().replace(/["']/g, '');
    const ai = new GoogleGenAI({ apiKey });

    try {
        const res = await ai.models.embedContent({
            model: "models/text-embedding-004",
            contents: [{ parts: [{ text: "test" }] }]
        });
        console.log("Keys found:", Object.keys(res));
        if (res.embedding) console.log("Values length:", res.embedding.values.length);
        if (res.embeddings) console.log("Multiple embeddings count:", res.embeddings.length);
    } catch (e) {
        console.error(e.message);
    }
}
main();
