pipeline {
    agent {
        docker {
            image 'node:20'
            args '-u root'
        }
    }

    environment {
        REMOTE_HOST = "marcin201.mikrus.xyz"
        REMOTE_USER = "root"
        REMOTE_PATH = "/var/www/juniorChartsFrontend"
        SSH_CREDENTIALS = "mikrus-ssh"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Test docker i ') {
            steps {
                sh 'docker --version'
                sh 'docker-compose --version'
                sh 'npm test'
            }
        }

        stage('Build Angular Frontend') {
            steps {
                dir('frontend') {
                    sh """
                        npm ci
                        npm install -g @angular/cli
                        ng build --configuration production
                    """
                }
            }
        }

        stage('Upload Frontend to Mikrus') {
            steps {
                sshagent(credentials: [SSH_CREDENTIALS]) {
                    sh """
                        rsync -avz --delete frontend/dist/juniorChartsFrontend/ \
                        ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}/
                    """
                }
            }
        }

        stage('Reload Nginx') {
            steps {
                sshagent(credentials: [SSH_CREDENTIALS]) {
                    sh """
                        ssh ${REMOTE_USER}@${REMOTE_HOST} 'systemctl reload nginx'
                    """
                }
            }
        }
    }
}
