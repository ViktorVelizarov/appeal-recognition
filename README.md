# AppealFinder

A web application that uses YOLO object detection to identify clothing items in photos, then finds similar items you can shop for. Images are stored in AWS S3 and detection history is kept in MongoDB.

## Features

- Image upload and object detection using YOLO
- Cloud storage of images using AWS S3
- Detection history tracking with MongoDB
- Reverse image search for similar/shoppable items (SerpAPI, with a Google Custom Search fallback)
- Modern React frontend with Material-UI
- JWT-based authentication

## Architecture

- `frontend/` — React (Create React App) + MUI
- `backend/` — Java 21 + Spring Boot 4 (Maven, includes the wrapper so no local Maven install is required)
- `python/` — the YOLOv8 detection script, trained model, and its own virtual environment; invoked by the backend as a subprocess

## Prerequisites

- Java 21+ (JDK)
- Node.js (for the frontend) and npm
- Python 3.11 (a venv already exists at `python/venv` with the required packages)
- A MongoDB connection string (Atlas or local)
- An AWS account with an S3 bucket
- A SerpAPI key (optional — falls back to a generic Google Custom Search if omitted)

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd appeal-recognition
```

2. Configure the backend environment — create `backend/.env` (gitignored):
```bash
PORT=5000
MONGODB_URI=<your MongoDB connection string, including the database name>
JWT_SECRET=<a long random string>

AWS_ACCESS_KEY_ID=<...>
AWS_SECRET_ACCESS_KEY=<...>
AWS_REGION=us-east-1
AWS_BUCKET_NAME=<...>

GOOGLE_API_KEY=<optional, for the fallback search>
GOOGLE_SEARCH_ENGINE_ID=<optional>
SERPAPI_API_KEY=<optional but recommended>

PYTHON_DIR=<absolute path to the python/ directory>
PYTHON_EXECUTABLE=<absolute path to python/venv/Scripts/python.exe>

CORS_ALLOWED_ORIGIN=http://localhost:3000
```

3. Install frontend dependencies:
```bash
cd frontend
npm install
```

4. Place YOLO model files (if not already present):
- Trained model at `python/trained_YOLO8.pt`
- Class config at `python/data.yaml`

## Development

1. Start the backend (from `backend/`):
```bash
./mvnw spring-boot:run
```
On Windows, `./run.ps1` loads `backend/.env` into the process environment first, then runs the same command — use it if `spring-boot:run` doesn't pick up your `.env` values automatically.

2. Start the frontend (from `frontend/`):
```bash
npm start
```

## Deployment

1. Build the backend into a runnable jar:
```bash
cd backend
./mvnw -DskipTests package
java -jar target/backend-0.0.1-SNAPSHOT.jar
```

2. Build the frontend:
```bash
cd frontend
npm run build
```

3. Deploy:
- Backend: any host that runs a Java 21 process (with network access to Python + the venv, since detection shells out to it)
- Frontend: any static host (Netlify, Vercel, S3 + CloudFront, etc.)
- Database: MongoDB Atlas
- Storage: AWS S3

## Environment Variables

See `backend/.env` above for the full list. `PYTHON_DIR`/`PYTHON_EXECUTABLE` are backend-specific (not present in the original Node version) — they tell the backend where to find the detection script and which Python interpreter to run it with.

## Project Structure

```
appeal-recognition/
├── frontend/              # React frontend
├── backend/               # Java Spring Boot backend
│   ├── src/main/java/com/appealfinder/backend/
│   └── .env               # backend config (gitignored)
├── python/                # YOLO model, detection script, and venv
└── README.md
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
