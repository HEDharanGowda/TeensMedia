const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const crypto = require('crypto');

const {
  S3_BUCKET,
  S3_REGION,
  S3_CDN_BASE_URL,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
} = process.env;

if (!S3_BUCKET || !S3_REGION) {
  console.warn('[storageService] S3_BUCKET or S3_REGION not set. Image uploads will fail.');
}

const s3 = new S3Client({
  region: S3_REGION,
  credentials: AWS_ACCESS_KEY_ID && AWS_SECRET_ACCESS_KEY
    ? {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
      }
    : undefined,
});

function buildPublicUrl(key) {
  if (S3_CDN_BASE_URL) {
    return `${S3_CDN_BASE_URL.replace(/\/$/, '')}/${key}`;
  }
  return `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/${key}`;
}

function getKeyFromUrl(url) {
  if (!url) return null;
  if (S3_CDN_BASE_URL && url.startsWith(S3_CDN_BASE_URL)) {
    return url.replace(`${S3_CDN_BASE_URL.replace(/\/$/, '')}/`, '');
  }
  const bucketHost = `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/`;
  if (url.startsWith(bucketHost)) {
    return url.replace(bucketHost, '');
  }
  return null;
}

async function uploadBase64Image(imageBase64, keyPrefix = 'posts') {
  if (!imageBase64) {
    throw new Error('No image provided');
  }
  if (!S3_BUCKET || !S3_REGION) {
    throw new Error('S3 configuration missing (S3_BUCKET, S3_REGION)');
  }

  const buffer = Buffer.from(imageBase64, 'base64');
  if (!buffer.length) {
    throw new Error('Invalid image buffer');
  }

  const key = `${keyPrefix}/${Date.now()}-${crypto.randomUUID()}.jpg`;

  const command = new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: 'image/jpeg',
    // No ACL: supports buckets with Object Ownership/BucketOwnerEnforced
  });

  await s3.send(command);

  return { imageUrl: buildPublicUrl(key), key };
}

async function deleteObject(key) {
  if (!key || !S3_BUCKET) return;
  const command = new DeleteObjectCommand({ Bucket: S3_BUCKET, Key: key });
  await s3.send(command);
}

module.exports = {
  uploadBase64Image,
  deleteObject,
  getKeyFromUrl,
};
