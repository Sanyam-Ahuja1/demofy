import { Storage, GetSignedUrlConfig } from '@google-cloud/storage';

// Initialize storage
// Expects GOOGLE_APPLICATION_CREDENTIALS to be set or implicit credentials
// Initialize storage
// Expects GOOGLE_APPLICATION_CREDENTIALS to be set or implicit credentials
let storage: Storage;

// BUCKET_NAME is now lazy loaded

export class StorageService {
  /**
   * Generates a signed URL for uploading a file to GCS
   * @param filename The name of the file to upload
   * @param contentType The MIME type of the file
   * @returns Object containing the upload URL and the public URL
   */
  static async getSignedUrl(filename: string, contentType: string) {
    // Lazy initialization of storage to avoid startup errors if credentials are missing
    if (!storage) {
        let storageOptions: any = {};
        
        if (process.env.GCP_CREDENTIALS) {
            try {
                const credentials = JSON.parse(process.env.GCP_CREDENTIALS);
                storageOptions.credentials = credentials;
            } catch (e) {
                console.error('Failed to parse GCP_CREDENTIALS', e);
            }
        }
        
        storage = new Storage(storageOptions);
    }

    const bucketName = process.env.GCS_BUCKET_NAME || 'farmify-prod-images';
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(filename);

    const options: GetSignedUrlConfig = {
      version: 'v4',
      action: 'write',
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
      contentType,
    };

    const [uploadUrl] = await file.getSignedUrl(options);
    
    // Public URL logic
    const publicUrl = `https://storage.googleapis.com/${bucketName}/${filename}`;

    return { uploadUrl, publicUrl };
  }
}
