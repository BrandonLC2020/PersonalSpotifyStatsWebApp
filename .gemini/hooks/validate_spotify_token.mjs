import fs from 'fs';
import path from 'path';
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

// spotify-token-validator: Validates the refresh token in AWS Secrets Manager.

function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const content = fs.readFileSync(filePath, 'utf8');
  return content.split('
').reduce((acc, line) => {
    const [key, value] = line.split('=');
    if (key && value) acc[key.trim()] = value.trim();
    return acc;
  }, {});
}

async function validateToken() {
  const env = loadEnv('frontend/.env');
  
  const region = env.REACT_APP_AWS_DEFAULT_REGION;
  const secretName = env.REACT_APP_SECRET_NAME;
  const accessKeyId = env.REACT_APP_AWS_ACCESS_KEY_ID;
  const secretAccessKey = env.REACT_APP_AWS_SECRET_ACCESS_KEY;

  if (!region || !secretName || !accessKeyId || !secretAccessKey) {
    console.log("❌ ERROR: Missing AWS credentials in frontend/.env");
    process.exit(1);
  }

  const client = new SecretsManagerClient({
    region,
    credentials: { accessKeyId, secretAccessKey }
  });

  try {
    const response = await client.send(new GetSecretValueCommand({ SecretId: secretName }));
    const secret = JSON.parse(response.SecretString);
    
    if (secret.refresh_token) {
      console.log(`✅ SUCCESS: Found refresh_token in secret '${secretName}'.`);
    } else {
      console.log(`❌ ERROR: 'refresh_token' key missing in secret '${secretName}'.`);
    }
  } catch (error) {
    console.log(`❌ ERROR: Failed to fetch secret '${secretName}': ${error.message}`);
  }
}

console.log("--- Spotify Token Validator ---");
validateToken();
