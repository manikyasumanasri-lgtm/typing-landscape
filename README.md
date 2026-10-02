# Typing Landscape

A web application that creates a dynamic landscape as you type. Your typing speed and total characters dictate the growth and evolution of the world!

## Structure
- Flask backend API and serving
- Vanilla JS, HTML, CSS frontend (no frameworks)
- Docker integration for containerization
- Jenkins Pipeline for CI/CD

## Running Locally

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
2. Run tests:
   ```bash
   pytest
   ```
3. Start the application:
   ```bash
   python app.py
   ```
4. Open your browser and navigate to `http://localhost:5000`.

## Running with Docker

1. Build the image:
   ```bash
   docker build -t typing-landscape .
   ```
2. Run the container:
   ```bash
   docker run -d -p 5000:5000 --name typing-landscape typing-landscape
   ```
3. Open `http://localhost:5000` in your browser.

## CI/CD with Jenkins

### Installing Jenkins using Docker
Run a Jenkins container that can build Docker images (DinD or mounting the socket):
```bash
docker run -u root --rm -d -p 8080:8080 -p 50000:50000 -v jenkins-data:/var/jenkins_home -v /var/run/docker.sock:/var/run/docker.sock --name jenkins jenkins/jenkins:lts
```
*Note: You need to install Docker CLI inside the Jenkins container, or use a custom image that has it pre-installed.*

Required Jenkins Plugins:
- Pipeline
- Git
- Docker Pipeline
- GitHub

### Creating a Pipeline Job
1. In Jenkins, create a New Item -> Pipeline.
2. In the Pipeline section, choose "Pipeline script from SCM".
3. Select Git and provide your repository URL.
4. Make sure Script Path is `Jenkinsfile`.

### Setting up the GitHub Webhook
1. Go to your GitHub repository -> Settings -> Webhooks.
2. Add a webhook pointing to `http://<jenkins-url>/github-webhook/`.
3. Select "Just the push event".
   *If Jenkins is running locally, use [ngrok](https://ngrok.com/) to expose it: `ngrok http 8080` and use the ngrok URL.*

### Testing the Pipeline
1. Push a change to the repository.
2. Watch the Jenkins dashboard as it checks out, builds, tests, and deploys.
3. Open `http://localhost:8081` (port used in deployment stage) to see the updated app.

### Troubleshooting
- **Permission denied on docker.sock**: Run `chmod 666 /var/run/docker.sock` on the host, or run Jenkins as root.
- **Port 8081 already in use**: Stop any existing containers or change the deployed port in the `Jenkinsfile`.
- **Webhook not firing**: Ensure ngrok is running and the URL matches exactly with `/github-webhook/`.
- **curl not found in Jenkins**: Modify the `Health Check` stage to use a container with curl or install it.
