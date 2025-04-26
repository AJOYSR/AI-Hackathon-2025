# Project Setup Guide

This guide will help you set up all the necessary dependencies and configurations for running the AI Search Pipeline project.

## Prerequisites

### 1. Node.js and npm/yarn
- Install Node.js (version 18 or higher)
  - Windows: Download from [Node.js website](https://nodejs.org/)
  - Linux: 
    ```bash
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
    ```
  - macOS: 
    ```bash
    brew install node@18
    ```

- Verify installation:
  ```bash
  node --version
  npm --version
  ```

### 2. Redis
- Windows:
  1. Download Redis for Windows from [Microsoft Archive](https://github.com/microsoftarchive/redis/releases)
  2. Run the installer
  3. Start Redis server from the installed location

- Linux:
  ```bash
  sudo apt-get update
  sudo apt-get install redis-server
  sudo systemctl enable redis-server
  sudo systemctl start redis-server
  ```

- macOS:
  ```bash
  brew install redis
  brew services start redis
  ```

- Verify Redis is running:
  ```bash
  redis-cli ping
  # Should return: PONG
  ```

### 3. Environment Variables
Create a `.env` file in the project root with the following variables:

```env
# Google Generative AI Configuration
GOOGLE_GENERATIVE_AI_API_KEY=your_api_key_here

# Redis Configuration
REDIS_URL=redis://localhost:6379

# Application Configuration
PORT=4040
NODE_ENV=development
```

### 4. Project Dependencies
Install project dependencies:

```bash
# Using npm
npm install

# Or using yarn
yarn install
```

## Development Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd <project-directory>
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Start the development server:
   ```bash
   npm run start:dev
   # or
   yarn start:dev
   ```

## Production Setup

1. Build the application:
   ```bash
   npm run build
   # or
   yarn build
   ```

2. Start the production server:
   ```bash
   npm run start:prod
   # or
   yarn start:prod
   ```

## Troubleshooting

### Redis Connection Issues
If you encounter Redis connection issues:

1. Verify Redis is running:
   ```bash
   redis-cli ping
   ```

2. Check Redis configuration:
   - Windows: Check Redis service is running
   - Linux/macOS: Check Redis service status
     ```bash
     sudo systemctl status redis
     # or
     brew services list
     ```

3. Verify Redis URL in `.env` file:
   ```
   REDIS_URL=redis://localhost:6379
   ```

### Google Generative AI API Issues
If you encounter API authentication issues:

1. Verify your API key:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Navigate to APIs & Services > Credentials
   - Verify your API key is active and has access to the Generative Language API

2. Check environment variables:
   - Ensure `GOOGLE_GENERATIVE_AI_API_KEY` is set correctly in `.env`
   - Restart the application after updating the key

### Node.js Version Issues
If you encounter Node.js version compatibility issues:

1. Use nvm (Node Version Manager) to manage Node.js versions:
   ```bash
   # Install nvm
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

   # Install and use Node.js 18
   nvm install 18
   nvm use 18
   ```

## Additional Resources

- [Node.js Documentation](https://nodejs.org/en/docs/)
- [Redis Documentation](https://redis.io/documentation)
- [Google Generative AI Documentation](https://cloud.google.com/vertex-ai/docs/generative-ai/start/quickstarts/api-quickstart)
- [NestJS Documentation](https://docs.nestjs.com/) 