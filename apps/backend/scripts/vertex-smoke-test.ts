import { GoogleAuth } from 'google-auth-library';
import 'dotenv/config'; // Load variables from .env

async function runSmokeTest() {
    console.log("🚀 Starting Vertex AI Embedding Smoke Test...");
    console.log("-------------------------------------------------");

    // Load config manually
    const project = process.env.GCP_PROJECT_ID;
    const location = process.env.GCP_REGION || 'europe-west4';

    if (!project) {
        console.error("❌ GCP_PROJECT_ID is not defined in .env. Please set it.");
        process.exit(1);
    }

    let accessToken;
    try {
        const auth = new GoogleAuth({ scopes: 'https://www.googleapis.com/auth/cloud-platform' });
        const client = await auth.getClient();
        accessToken = (await client.getAccessToken()).token;
        console.log("✅ Successfully acquired Google Auth Token.");
    } catch (e) {
        console.error("❌ Failed to get Google Auth Token:", e.message);
        process.exit(1);
    }

    // The technical snippet targeting ALLPLAN parameters
    const snippet = "ALLPLAN BCM: Metraj hesaplamalarında Miktar_1 ve Miktar_2 niteliklerinin (attributes) çakışması sonucu ortaya çıkan betonarme hacim farklılıklarının kalıp planına aktarımı.";

    const models = [
        'text-multilingual-embedding-002',
        'text-embedding-004'
    ];

    for (const model of models) {
        console.log(`\n🧪 Testing Model: [\${model}]`);
        const url = `https://${location}-aiplatform.googleapis.com/v1/projects/${project}/locations/${location}/publishers/google/models/${model}:predict`;

        const startTime = Date.now();
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                instances: [{ content: snippet }],
            }),
        });

        const endTime = Date.now();

        if (!response.ok) {
            console.error(`❌ Model \${model} Failed (\${response.status}):`, await response.text());
        } else {
            const data = await response.json();
            const vector = data.predictions[0].embeddings.values;
            const dimension = vector.length;

            console.log(`✅ Success! Latency: \${endTime - startTime}ms`);
            console.log(`✅ Embedding Dimensions: \${dimension}`);
            console.log(`✅ Sample Vector (first 5): \${vector.slice(0, 5).map(v => v.toFixed(4)).join(', ')} ...`);

            if (model === 'text-multilingual-embedding-002') {
                console.log("   👉 Insight: Native multilingual structure. Dimension: 768.");
            } else if (model === 'text-embedding-004') {
                console.log("   👉 Insight: Superior context and newer architecture. Dimension: 768. Highly performant for extreme technical reasoning.");
            }
        }
    }

    console.log("\n-------------------------------------------------");
    console.log("🎯 SMOKE TEST COMPLETE.");
}

runSmokeTest();
