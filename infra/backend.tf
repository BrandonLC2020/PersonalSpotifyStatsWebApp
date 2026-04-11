# ------------------------------------------------------------------------------
# Backend EC2 server (for running Docker manually)
# ------------------------------------------------------------------------------

# IAM Role so the EC2 instance can pull images from ECR without AWS keys
resource "aws_iam_role" "ec2_role" {
  name = "spotify-stats-ec2-role-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ecr_readonly" {
  role       = aws_iam_role.ec2_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
}

resource "aws_iam_instance_profile" "ec2_profile" {
  name = "spotify-stats-ec2-profile-${var.environment}"
  role = aws_iam_role.ec2_role.name
}

# Backend Security Group
resource "aws_security_group" "backend" {
  name        = "spotify-stats-backend-sg"
  description = "Security group for the Rails backend EC2 instance"
  vpc_id      = aws_vpc.main.id

  # Allow HTTP inbound to the Rails app
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Allow standard Rails Puma port 3001
  ingress {
    from_port   = 3001
    to_port     = 3001
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Allow SSH from Bastion Host or specific IPs
  ingress {
    from_port       = 22
    to_port         = 22
    protocol        = "tcp"
    security_groups = [aws_security_group.bastion.id]
  }

  # Allow outbound traffic
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "spotify-stats-backend-sg"
  }
}

# Allow EC2 to talk to RDS
resource "aws_security_group_rule" "rds_ingress_from_backend" {
  type                     = "ingress"
  from_port                = 3306
  to_port                  = 3306
  protocol                 = "tcp"
  security_group_id        = aws_security_group.rds.id
  source_security_group_id = aws_security_group.backend.id
}

# The latest Amazon Linux 2 AMI
data "aws_ami" "amazon_linux_2" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["amzn2-ami-hvm-*-x86_64-gp2"]
  }
}

# EC2 Instance
resource "aws_instance" "backend" {
  ami                  = data.aws_ami.amazon_linux_2.id
  instance_type        = "t3.small"
  subnet_id            = aws_subnet.public[1].id
  key_name             = var.ssh_key_name
  iam_instance_profile = aws_iam_instance_profile.ec2_profile.name

  vpc_security_group_ids = [aws_security_group.backend.id]

  # Install Docker on boot
  user_data = <<-EOF
              #!/bin/bash
              yum update -y
              amazon-linux-extras install docker -y
              service docker start
              usermod -a -G docker ec2-user
              chkconfig docker on

              # Install Docker Compose
              curl -L "https://github.com/docker/compose/releases/download/v2.24.5/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
              chmod +x /usr/local/bin/docker-compose
              EOF

  tags = {
    Name = "Spotify Stats Backend EC2 Server"
  }
}

# Allocate a persistent Elastic IP for the server so the IP doesn't change on reboot
resource "aws_eip" "backend" {
  instance = aws_instance.backend.id
  domain   = "vpc"

  tags = {
    Name = "Backend Application EIP"
  }
}

output "backend_public_ip" {
  value       = aws_eip.backend.public_ip
  description = "The direct Public IP of the backend EC2 server"
}
