variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Deployment environment (e.g., dev, prod)"
  type        = string
  default     = "dev"
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "db_username" {
  description = "Username for the RDS instance"
  type        = string
  sensitive   = true
}

variable "db_password" {
  description = "Password for the RDS instance"
  type        = string
  sensitive   = true
}

variable "db_name" {
  description = "Name of the RDS database"
  type        = string
  default     = "spotify_stats_db"
}

variable "bastion_allowed_ips" {
  description = "List of IPs allowed to SSH into the Bastion Host"
  type        = list(string)
  default     = ["0.0.0.0/0"] # WARNING: Change this to your specific IP address for better security
}

variable "ssh_key_name" {
  description = "Name of the EC2 Key Pair used for SSH access"
  type        = string
}

variable "domain_name" {
  description = "The root domain name for the frontend (e.g., example.com)"
  type        = string
  default     = ""
}
