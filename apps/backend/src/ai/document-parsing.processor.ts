import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { DocumentProcessorServiceClient } from '@google-cloud/documentai';
import { Storage } from '@google-cloud/storage';
import { ConfigService } from '@nestjs/config';

@Processor('document-parsing', { concurrency: 2 })
export class DocumentParsingProcessor extends WorkerHost {
    private readonly logger = new Logger(DocumentParsingProcessor.name);
    private docAiClient = new DocumentProcessorServiceClient();
    private storageClient = new Storage();

    constructor(private readonly config: ConfigService) {
        super();
    }

    async process(job: Job<any, any, string>): Promise<any> {
        this.logger.log(`⚙️ Processing Heavy Document: ${job.data.manualId} (Job: ${job.id})`);

        try {
            const { fileUrl, manualId, mimeType } = job.data;
            const projectId = this.config.get<string>('gcp.projectId');
            const location = this.config.get<string>('gcp.region') || 'eu';

            // Note: Batch Processing REQUIRES Google Cloud Storage.
            // S3/Minio URLs must be downloaded and uploaded to a temporary GCS bucket first.
            const gcsBucketName = this.config.get<string>('STORAGE_BUCKET') || `aluplan-docai-temp-${projectId}`;

            // 1. Upload to GCS Bucket (Simulated for architecture readiness)
            const inputGcsUri = `gs://${gcsBucketName}/inputs/${manualId}.pdf`;
            const outputGcsPrefix = `gs://${gcsBucketName}/outputs/${manualId}/`;

            this.logger.debug(`[Document AI] Initiating Batch Process for gs://${gcsBucketName}`);

            // 2. Trigger Batch Processing
            const name = `projects/${projectId}/locations/${location}/processors/YOUR_PROCESSOR_ID`;

            const request = {
                name,
                inputDocuments: {
                    gcsDocuments: {
                        documents: [{ gcsUri: inputGcsUri, mimeType }],
                    },
                },
                documentOutputConfig: {
                    gcsOutputConfig: { gcsUri: outputGcsPrefix },
                },
            };

            // Uncomment to activate actual billing/calling:
            /*
            const [operation] = await this.docAiClient.batchProcessDocuments(request as any);
            this.logger.log(`⏳ Waiting for Document AI operation to complete...`);
            await operation.promise();
            */

            // 3. Fetch parsed JSONs from GCS output prefix and chunk them
            this.logger.log(`✅ Document AI Batch Processing complete for ${manualId}`);

            // TODO: Integrate the extractLogicalChunks logic here after fetching from GCS.

            return { success: true, manualId };

        } catch (error) {
            this.logger.error(`❌ Batch Processing Failed for ${job.data.manualId}: ${error.message}`);
            throw error;
        }
    }
}
