import { GoogleGenAI } from '@google/genai';
import fs from 'fs';

async function main() {
    const envFile = fs.readFileSync('.env.local', 'utf8');
    const apiKey = envFile.match(/GEMINI_API_KEY=(.*)/)?.[1]?.trim().replace(/["']/g, '');
    const ai = new GoogleGenAI({ apiKey });

    try {
        const res = await ai.models.generateContent({
            model: "models/gemini-1.5-flash",
            contents: [{ parts: [{ text: "Respond ONLY with valid JSON: {\"test\": true}" }] }]
        });
        const txt = res.candidates?.[0]?.content?.parts?.[0]?.text;
        console.log("Response text:", txt);
        if (txt) {
            console.log("Matches JSON:", !!txt.match(/\{[\s\S]*\}/));
        } else {
            console.log("No text found!");
        }
    } catch (e) {
        console.error("SDK Error:", e.message);
    }
}
main();
