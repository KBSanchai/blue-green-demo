pipeline {
    agent any
    parameters {
        choice(
            name: 'DEPLOY_COLOR',
            choices: ['green', 'blue'],
            description: 'Which color slot to deploy to?'
        )
        booleanParam(
            name: 'SWITCH_TRAFFIC',
            defaultValue: false,
            description: 'Switch live traffic to new slot after health check?'
        )
    }

    environment {
        DOCKER_HUB_USER = 'kbsanchai'
        KUBECONFIG = '/var/lib/jenkins/.kube/config'
        BLUE_IMAGE = "${DOCKER_HUB_USER}/blue-app"
        GREEN_IMAGE = "${DOCKER_HUB_USER}/green-app"
    }

    stages {

        stage('Checkout') {
            steps {
                echo "Deploying to: ${params.DEPLOY_COLOR} slot"
                git branch: 'main', url: 'https://github.com/KBSanchai/blue-green-demo.git'
            }
        }

        stage('Build Blue Image') {
            steps {
                echo 'Building Blue Docker image...'
                sh "docker build -t ${BLUE_IMAGE}:${BUILD_NUMBER} ./app-blue"
                sh "docker tag ${BLUE_IMAGE}:${BUILD_NUMBER} ${BLUE_IMAGE}:latest"
            }
        }

        stage('Build Green Image') {
            steps {
                echo 'Building Green Docker image...'
                sh "docker build -t ${GREEN_IMAGE}:${BUILD_NUMBER} ./app-green"
                sh "docker tag ${GREEN_IMAGE}:${BUILD_NUMBER} ${GREEN_IMAGE}:latest"
            }
        }

        stage('Push Images to Docker Hub') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-credentials', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh 'docker login -u $DOCKER_USER -p $DOCKER_PASS'
                    sh "docker push ${BLUE_IMAGE}:${BUILD_NUMBER}"
                    sh "docker push ${BLUE_IMAGE}:latest"
                    sh "docker push ${GREEN_IMAGE}:${BUILD_NUMBER}"
                    sh "docker push ${GREEN_IMAGE}:latest"
                    sh 'docker logout'
                }
            }
        }

        stage('Deploy Blue') {
            steps {
                echo 'Deploying Blue to Kubernetes...'
                sh "kubectl apply -f kube/blue-deployment.yaml --kubeconfig=${KUBECONFIG}"
                sh "kubectl set image deployment/app-blue app=${BLUE_IMAGE}:${BUILD_NUMBER} --kubeconfig=${KUBECONFIG}"
                sh "kubectl rollout status deployment/app-blue --timeout=120s --kubeconfig=${KUBECONFIG}"
            }
        }

        stage('Deploy Green') {
            when {
                expression { params.DEPLOY_COLOR == 'green' }
            }
            steps {
                echo 'Deploying Green to Kubernetes...'
                sh "kubectl apply -f kube/green-deployment.yaml --kubeconfig=${KUBECONFIG}"
                sh "kubectl set image deployment/app-green app=${GREEN_IMAGE}:${BUILD_NUMBER} --kubeconfig=${KUBECONFIG}"
                sh "kubectl rollout status deployment/app-green --timeout=120s --kubeconfig=${KUBECONFIG}"
            }
        }

        stage('Health Check Green') {
            when {
                expression { params.DEPLOY_COLOR == 'green' }
            }
            steps {
                echo 'Running health check on Green...'
                sh '''
                    sleep 30
                    GREEN_POD=$(kubectl get pods -l app=demo-app,slot=green --kubeconfig=/var/lib/jenkins/.kube/config -o jsonpath='{.items[0].metadata.name}')
                    echo "Testing pod: $GREEN_POD"
                    kubectl port-forward $GREEN_POD 8888:3000 --kubeconfig=/var/lib/jenkins/.kube/config &
                    PF_PID=$!
                    sleep 5
                    HEALTH=$(curl -s http://localhost:8888/health | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['status'])")
                    kill $PF_PID
                    if [ "$HEALTH" = "healthy" ]; then
                        echo "Green health check PASSED!"
                    else
                        echo "Green health check FAILED!"
                        exit 1
                    fi
                '''
            }
        }

        stage('Switch Traffic to Green') {
            when {
                allOf {
                    expression { params.DEPLOY_COLOR == 'green' }
                    expression { params.SWITCH_TRAFFIC == true }
                }
            }
            steps {
                echo 'Switching traffic from Blue to Green...'
                sh "kubectl patch service demo-app-service -p '{\"spec\":{\"selector\":{\"app\":\"demo-app\",\"slot\":\"green\"}}}' --kubeconfig=${KUBECONFIG}"
                echo 'Traffic successfully switched to GREEN!'
            }
        }

        stage('Verify') {
            steps {
                echo '=== Current Deployments ==='
                sh "kubectl get deployments --kubeconfig=${KUBECONFIG}"
                echo '=== All Pods ==='
                sh "kubectl get pods -l app=demo-app --kubeconfig=${KUBECONFIG}"
                echo '=== Active Service ==='
                sh "kubectl get svc demo-app-service --kubeconfig=${KUBECONFIG}"
            }
        }

    }

    post {
        success {
            echo 'Blue-Green pipeline completed successfully!'
            echo 'Access app at: http://<Worker-IP>:30090'
        }
        failure {
            echo 'Pipeline FAILED! Keeping Blue live. Rolling back Green...'
            sh "kubectl patch service demo-app-service -p '{\"spec\":{\"selector\":{\"app\":\"demo-app\",\"slot\":\"blue\"}}}' --kubeconfig=/var/lib/jenkins/.kube/config || true"
            sh "kubectl scale deployment app-green --replicas=0 --kubeconfig=/var/lib/jenkins/.kube/config || true"
        }
        always {
            sh "docker rmi ${BLUE_IMAGE}:${BUILD_NUMBER} || true"
            sh "docker rmi ${GREEN_IMAGE}:${BUILD_NUMBER} || true"
            cleanWs()
        }
    }
}