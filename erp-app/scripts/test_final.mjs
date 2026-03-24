import fs from 'fs';

async function main() {
    const envFile = fs.readFileSync('.env.local', 'utf8');
    const apiKey = envFile.match(/GEMINI_API_KEY=(.*)/)?.[1]?.trim().replace(/["']/g, '');
    const MODEL = "gemini-2.5-flash";

    console.log(`Testing ${MODEL} with API Key...`);
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: "Hello" }] }] })
    });
    
    const data = await res.json();
    console.log("Status:", res.status);
    console.log("Response:", JSON.stringify(data));
}
main();
