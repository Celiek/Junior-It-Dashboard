pipeline {
    agent { label 'local' }

    environment {
        REMOTE_HOST = "marcin201.mikrus.xyz"
        REMOTE_USER = "root"
        REMOTE_PORT = 10201
        REMOTE_PATH = "/var/www/juniorChartsFrontend"
        SSH_CREDENTIALS = "mikrus-ssh"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Angular Frontend') {
            steps {
                dir('Frontend') {
                    sh """
                        npm ci
                        npm run build -- --configuration production
                        ls -la dist/frontend
                    """
                }
            }
        }

        stage('Upload Frontend to Mikrus') {
            steps {
                sshagent(credentials: [SSH_CREDENTIALS]) {
                    sh """
                        # Dynamiczne wykrycie czy pliki są w /browser czy bezpośrednio w dist/frontend
                        SRC_DIR="Frontend/dist/frontend/browser"
                        if [ ! -d "\$SRC_DIR" ]; then
                            SRC_DIR="Frontend/dist/frontend"
                        fi

                        # rsync z uwzględnieniem niestandardowego portu SSH (-p 10201)
                        rsync -avz --delete -e "ssh -p ${REMOTE_PORT} -o StrictHostKeyChecking=no" \
                        \$SRC_DIR/ \
                        ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}/
                    """
                }
            }
        }

        stage('Reload Nginx') {
            steps {
                sshagent(credentials: [SSH_CREDENTIALS]) {
                    sh """
                        ssh -o StrictHostKeyChecking=no ${REMOTE_USER}@${REMOTE_HOST} 'systemctl reload nginx'
                    """
                }
            }
        }
    }
}