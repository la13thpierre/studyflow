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

data "aws_ami" "amazon_linux" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-*-x86_64"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
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
    cidr_blocks = [var.my_ip]
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
  ami                    = data.aws_ami.amazon_linux.id
  instance_type          = "t3.micro"               # Free Tier eligible
  vpc_security_group_ids = [aws_security_group.studyflow_sg.id]

  user_data = <<-EOF
              #!/bin/bash
              yum update -y
              yum install -y docker
              systemctl start docker
              systemctl enable docker
              docker pull la13th/studyflow:latest
              docker run -d -p 3000:3000 \
                -e GEMINI_API_KEY="${var.gemini_api_key}" \
                -e GROQ_API_KEY="${var.groq_api_key}" \
                -e SUPABASE_URL="${var.supabase_url}" \
                -e SUPABASE_ANON_KEY="${var.supabase_anon_key}" \
                la13th/studyflow:latest
              EOF

  tags = {
    Name = "studyflow-server"
  }
}

output "public_ip" {
  value = aws_instance.studyflow_server.public_ip
}