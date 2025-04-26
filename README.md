# Intent based search using AI

A custom chatbot built with NestJS, MongoDB, PostgreSQL with pgvector extension for vector similarity search. This project implements a sophisticated chatbot system with authentication, monitoring, and vector-based search capabilities.

## Architechture
![Editor _ Mermaid Chart-2025-04-26-162507](https://github.com/user-attachments/assets/c237183d-ff4f-4337-a858-7f49d075f93d)


## Features

- Vector similarity search using pgvector
- Authentication and authorization
- MongoDB for document storage
- PostgreSQL for vector storage
- Monitoring with Prometheus and Grafana
- - Swagger API documentation
- Internationalization support
- CSV data processing
- Redis caching
- Security features (XSS protection, JWT)

## Prerequisites

- Node.js (>= v16)
- MongoDB
- PostgreSQL (with pgvector extension)
- Ollama (for text embeddings)
- Redis
- Docker and Docker Compose (optional)

## Environment Setup

1. Clone the repository
2. Copy `.env.example` to `.env` and update the following variables:

```env
# Application
PORT=
NODE_ENV=

# PostgreSQL
POSTGRES_HOST=
POSTGRES_PORT=
POSTGRES_USER=
POSTGRES_PASSWORD=
POSTGRES_DATABASE=
DB_SCHEMA=

# MongoDB
MONGODB_URI=your_mongodb_connection_string

# Redis
REDIS_HOST=
REDIS_PORT=
REDIS_PASSWORD=

# JWT
JWT_SECRET=
JWT_EXPIRATION=


```

## Quick Start

1. Install dependencies:

```bash
yarn install
```

2. Start the development server:

```bash
yarn start:dev
```

3. Access the API documentation at `http://localhost:3000/api`

## Available Scripts

- `yarn start` - Start the application
- `yarn start:dev` - Start the application in development mode with hot-reload
- `yarn start:debug` - Start the application in debug mode
- `yarn start:prod` - Start the application in production mode
- `yarn build` - Build the application
- `yarn test` - Run tests
- `yarn test:watch` - Run tests in watch mode
- `yarn test:coverage` - Run tests with coverage report
- `yarn lint` - Run ESLint
- `yarn format` - Format code with Prettier
- `yarn seed:up` - Run database seeds
- `yarn create:admin` - Create a super admin user

## Project Structure

```
src/
├── common/          # Shared modules and utilities
├── config/          # Configuration files
├── helper/          # Helper functions and utilities
├── modules/         # Feature modules
│   ├── auth/        # Authentication module
│   ├── chatbot/     # Chatbot core functionality
│   └── ...          # Other feature modules
├── main.ts          # Application entry point
└── app.module.ts    # Root module
```

## Monitoring

The application includes Prometheus metrics and Grafana dashboards:

- Prometheus configuration: `prometheus.yml`
- Grafana dashboard: `grafana-dashboard.json`

## Documentation

Additional documentation can be found in:

- `LANGGRAPH_FLOW.md` - LangGraph implementation details
- `PROBLEM_STATEMENT.md` - Project requirements
- `PROJECT_PLAN.md` - Project planning and architecture
- `SETUP.md` - Detailed setup instructions

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License.
