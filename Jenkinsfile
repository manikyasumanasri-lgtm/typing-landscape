pipeline {
    agent any
    environment {
        IMAGE_NAME = 'typing-landscape'
        CONTAINER_NAME = 'typing-landscape'
    }
    triggers {
        githubPush()
        pollSCM('H/2 * * * *')
    }
    stages {
        stage('Checkout') {
            steps {
                // Pull the code from source control
                checkout scm
            }
        }
        stage('Build') {
            steps {
                // Build the Docker image tagged with build number and latest
                sh "docker build -t ${IMAGE_NAME}:${BUILD_NUMBER} -t ${IMAGE_NAME}:latest ."
            }
        }
        stage('Test') {
            steps {
                // Run pytest inside the built image
                sh "docker run --rm ${IMAGE_NAME}:latest pytest -q"
            }
        }
        stage('Deploy') {
            steps {
                // Remove old container if it exists
                sh "docker rm -f ${CONTAINER_NAME} || true"
                // Run the new image
                sh "docker run -d -p 8081:5000 --name ${CONTAINER_NAME} ${IMAGE_NAME}:latest"
            }
        }
        stage('Health Check') {
            steps {
                // Wait for the app to start and check health endpoint
                sleep 5
                sh "curl -f http://localhost:8081/health"
            }
        }
    }
    post {
        success {
            echo 'Pipeline succeeded!'
            // Clean up dangling images
            sh 'docker image prune -f'
        }
        failure {
            echo 'Pipeline failed. Please check the logs.'
        }
    }
}
