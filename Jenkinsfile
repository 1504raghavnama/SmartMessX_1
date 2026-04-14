pipeline {
    agent any

    environment {
        DOCKER_IMAGE = 'smartmessx'
        CONTAINER_NAME = 'smartmessx-container'
    }

    stages {

        stage('Checkout Code') {
            steps {
                echo '📥 Cloning repository...'
                checkout scm
            }
        }

        stage('Build Docker Image') {
            steps {
                echo '🐳 Building Docker image...'
                bat 'docker build -t %DOCKER_IMAGE% .'
            }
        }

        stage('Stop Old Container') {
            steps {
                echo '🛑 Stopping old container (if exists)...'
                bat 'docker stop %CONTAINER_NAME% || exit 0'
                bat 'docker rm %CONTAINER_NAME% || exit 0'
            }
        }

        stage('Run Container') {
            steps {
                echo '🚀 Starting new container...'
                bat 'docker run -d -p 3000:80 --name %CONTAINER_NAME% %DOCKER_IMAGE%'
            }
        }
    }

    post {
        success {
            echo '✅ Deployment successful!'
            echo '🌐 Open: http://localhost:3000'
        }
        failure {
            echo '❌ Pipeline failed. Check console logs.'
        }
        always {
            echo '🧹 Cleaning workspace...'
            cleanWs()
        }
    }
}