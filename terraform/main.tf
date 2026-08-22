terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

# Security group: allow SSH (22) and HTTP (your app's port, e.g. 3000)
resource "aws_security_group" "studyflow_sg" {
  name        = "studyflow-sg"
  description = "Allow SSH and app traffic"

  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "App port"
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# EC2 instance running Amazon Linux 2023, pulls & runs your Docker image on boot
resource "aws_instance" "studyflow_server" {
  ami                    = "ami-0182f373e66f89c85" # Amazon Linux 2023, us-east-1 — verify latest before applying
  instance_type          = "t3.micro"               # Free Tier eligible
  vpc_security_group_ids = [aws_security_group.studyflow_sg.id]

  user_data = <<-EOF
              #!/bin/bash
              yum update -y
              yum install -y docker
              systemctl start docker
              systemctl enable docker
              docker pull la13th/studyflow:latest
              docker run -d -p 3000:3000 la13th/studyflow:latest
              EOF

  tags = {
    Name = "studyflow-server"
  }
}

output "public_ip" {
  value = aws_instance.studyflow_server.public_ip
}