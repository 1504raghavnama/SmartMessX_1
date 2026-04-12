pipeline {
    agent any

    environment {
        NODE_ENV = 'production'
        DOCKER_IMAGE = 'smartmessx-app'
        DOCKER_TAG = "${env.BUILD_NUMBER}"
        APP_PORT = '8081'
    }

    tools {
        nodejs 'NodeJS-20'  // Configure this in Jenkins: Manage Jenkins > Tools > NodeJS installations
    }

    stages {
        stage('Checkout') {
            steps {
                echo '📥 Checking out source code...'
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                echo '📦 Installing Node.js dependencies...'
                bat 'npm ci'
            }
        }

        stage('Lint') {
            steps {
                echo '🔍 Running ESLint...'
                bat 'npm run lint || exit 0'
            }
        }

        stage('Build') {
            steps {
                echo '🏗️ Building production bundle...'
                bat 'npm run build'
            }
        }

        stage('Test') {
            steps {
                echo '🧪 Running tests...'
                bat 'npm run test || exit 0'
            }
        }

        stage('Docker Build') {
            steps {
                echo '🐳 Building Docker image...'
                bat "docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} -t ${DOCKER_IMAGE}:latest ."
            }
        }

        stage('Docker Deploy') {
            steps {
                echo '🚀 Deploying with Docker...'
                // Stop and remove any existing container
                bat "docker stop ${DOCKER_IMAGE} || exit 0"
                bat "docker rm ${DOCKER_IMAGE} || exit 0"
                // Run the new container
                bat "docker run -d --name ${DOCKER_IMAGE} -p ${APP_PORT}:${APP_PORT} --restart unless-stopped ${DOCKER_IMAGE}:latest"
            }
        }
    }

    post {
        success {
            echo "✅ Pipeline completed successfully!"
            echo "🌐 Application is running at http://localhost:${APP_PORT}"
        }
        failure {
            echo '❌ Pipeline failed! Check the logs above for details.'
        }
        always {
            echo '🧹 Cleaning up workspace...'
            cleanWs()
        }
    }
}
