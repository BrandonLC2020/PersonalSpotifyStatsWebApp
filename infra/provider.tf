terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Uncomment and configure the backend when you are ready to use remote state
  # backend "s3" {
  #   bucket         = "my-terraform-state-bucket"
  #   key            = "spotify-stats/terraform.tfstate"
  #   region         = "us-east-1"
  #   dynamodb_table = "terraform-locks"
  # }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "PersonalSpotifyStats"
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}
