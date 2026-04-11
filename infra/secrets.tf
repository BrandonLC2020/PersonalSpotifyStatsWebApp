resource "aws_secretsmanager_secret" "spotify_stats_secrets" {
  name        = "spotify-stats-secrets-${var.environment}"
  description = "Secrets for the Spotify Stats Application (Backend DB and Frontend refresh tokens)"
}

# Create a placeholder for the secret values.
# IMPORTANT: It is highly recommended NOT to hardcode real secrets in Terraform.
# This approach creates an initial empty JSON block that you can manually update
# in the AWS Console, or manage via environment variables / external vaults.

resource "aws_secretsmanager_secret_version" "initial_secrets_version" {
  secret_id = aws_secretsmanager_secret.spotify_stats_secrets.id

  # Provide initial placeholder values
  secret_string = jsonencode({
    DB_PASSWORD                 = "REPLACE_ME_IN_AWS_CONSOLE",
    REACT_APP_CLIENT_ID       = "REPLACE_ME_IN_AWS_CONSOLE",
    REACT_APP_CLIENT_SECRET   = "REPLACE_ME_IN_AWS_CONSOLE"
  })

  # Ignore changes to this secret string so Terraform doesn't overwrite manual updates
  lifecycle {
    ignore_changes = [secret_string]
  }
}
