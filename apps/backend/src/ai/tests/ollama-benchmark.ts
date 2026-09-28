import axios from 'axios';
import { createCliLogger } from '../../common/utils/cli-logger';

const cliLogger = createCliLogger('OllamaBenchmark');

async function testOllama() {
    const baseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    const model = process.env.OLLAMA_MODEL || 'nomic-embed-text';

    cliLogger.log(`🚀 Starting Ollama Stress Test (${baseUrl}, model: ${model})`);

    const testTexts = [
        "This is a test chunk for Allplan architectural design and BIM modelling.",
        "BIM (Building Information Modeling) is at the core of modern civil engineering.",
        "RTF extraction techniques allow for complex data processing in Allplan systems.",
        "Precast girder bridges require precise modeling for structural integrity.",
        "The Knowledge Pool serves as the central brain for the support desk AI.",
        "Smart chunking ensures that no context is lost during document ingestion.",
        "Vector embeddings allow for high-fidelity semantic similarity searches.",
        "Ollama provides local LLM capabilities with privacy and zero latency costs.",
        "Sequential processing prevents CPU spikes during bulk indexing operations.",
        "Robust error handling and retries ensure 100% indexing success rates."
    ];

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < 20; i++) {
        const text = testTexts[i % testTexts.length];
        const sequenceNum = i + 1;
        cliLogger.log(`[${sequenceNum}/20] Requesting embedding...`);

        const startTime = Date.now();
        try {
            const _response = await axios.post(`${baseUrl}/api/embeddings`, {
                model,
                prompt: text
            }, {
                timeout: 120000 // 120s timeout
            });

            const duration = Date.now() - startTime;
            cliLogger.log(`✅ Success in ${duration}ms`);
            successCount++;
        } catch (err: any) {
            cliLogger.error(`❌ Error during request ${sequenceNum}: ${err.message}`);
            failCount++;
        }

        // Mimic the 500ms breather implemented in the service
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    cliLogger.log(`\nFinal Result: ${successCount} Success, ${failCount} Failed.`);
}

testOllama().catch((error) => cliLogger.error(error));
