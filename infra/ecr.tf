resource "aws_ecr_repository" "backend" {
  name                 = "spotify-stats-backend"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name        = "spotify-stats-backend-repo"
    Environment = var.environment
  }
}
