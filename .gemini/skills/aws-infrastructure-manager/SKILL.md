---
name: aws-infrastructure-manager
description: Manages AWS Secrets Manager and RDS integrations. Use for updating Spotify refresh tokens, troubleshooting Bastion host SSH tunnels, and configuring the AWS SDK for JavaScript.
---

# AWS Infrastructure Manager

Guidance for managing the cloud components of the Spotify Stats Web App.

## Secrets Manager
- **Secret Name**: Defined by `REACT_APP_SECRET_NAME` in `frontend/.env`.
- **Storage**: Stores `refresh_token`.
- **Access**: The frontend uses the `@aws-sdk/client-secrets-manager` to fetch this token on initialization.

## RDS & Bastion Host
- **RDS Host**: Defined in `backend/.env`.
- **SSH Tunneling**: Access to RDS requires a tunnel through the Bastion host.
- **Tunnel Command Example**: `ssh -L 3306:RDS_ENDPOINT:3306 BASTION_USER@BASTION_HOST -i BASTION_KEY`.

## Credentials & IAM
- Verify `REACT_APP_AWS_ACCESS_KEY_ID` and `REACT_APP_AWS_SECRET_ACCESS_KEY` have permissions for `secretsmanager:GetSecretValue`.
- Ensure the Bastion key file has correct permissions (`chmod 400`).
