import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';
import pg from 'pg';
import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const { Client } = pg;

async function testNeonDB() {
  console.log('Testing Neon DB Connection...');
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    const res = await client.query('SELECT NOW()');
    console.log('✅ Neon DB Connection Successful! Server time:', res.rows[0].now);
  } catch (err) {
    console.error('❌ Neon DB Connection Failed:', err);
  } finally {
    await client.end();
  }
}

// ... rest of imports stay the same, but I will replace the testCloudflareR2 function

async function testCloudflareR2() {
  console.log('\nTesting Cloudflare R2 Connection...');
  
  if (!process.env.R2_ACCOUNT_ID || !process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY || !process.env.R2_BUCKET_NAME) {
      console.error('❌ Cloudflare R2 Connection Failed: Missing environment variables.');
      return;
  }

  const s3 = new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
  });

  try {
    // Since the token is bucket-scoped, we shouldn't list all buckets.
    // Instead, let's try to list objects inside the specific bucket.
    const command = new ListObjectsV2Command({
        Bucket: process.env.R2_BUCKET_NAME,
        MaxKeys: 1,
    });
    
    await s3.send(command);
    console.log(`✅ Cloudflare R2 Connection Successful! Allowed access to bucket: "${process.env.R2_BUCKET_NAME}".`);
  } catch (err) {
    console.error('❌ Cloudflare R2 Connection Failed:', err);
  }
}

async function runTests() {
  await testNeonDB();
  await testCloudflareR2();
}

runTests();
