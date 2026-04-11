resource "aws_db_subnet_group" "default" {
  name       = "spotify-stats-db-subnet-group"
  subnet_ids = aws_subnet.private[*].id

  tags = {
    Name = "Spotify Stats DB Subnet Group"
  }
}

resource "aws_security_group" "rds" {
  name        = "spotify-stats-rds-sg"
  description = "Allow MySQL inbound traffic from Bastion and Backend"
  vpc_id      = aws_vpc.main.id

  # Rule for allowing access from the backend (to be configured later)
  # ingress {
  #   from_port       = 3306
  #   to_port         = 3306
  #   protocol        = "tcp"
  #   security_groups = [aws_security_group.backend.id]
  # }

  # Rule for allowing access from Bastion
  ingress {
    from_port       = 3306
    to_port         = 3306
    protocol        = "tcp"
    security_groups = [aws_security_group.bastion.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "spotify-stats-rds-sg"
  }
}

resource "aws_db_instance" "default" {
  identifier           = "spotify-stats-db-${var.environment}"
  allocated_storage    = 20
  storage_type         = "gp2"
  engine               = "mysql"
  engine_version       = "8.0" # Make sure to match your required MySQL version
  instance_class       = "db.t3.micro"
  db_name              = var.db_name
  username             = var.db_username
  password             = var.db_password
  parameter_group_name = "default.mysql8.0"
  skip_final_snapshot  = true

  db_subnet_group_name   = aws_db_subnet_group.default.name
  vpc_security_group_ids = [aws_security_group.rds.id]

  tags = {
    Name        = "spotify-stats-rds"
    Environment = var.environment
  }
}
