# AppealFinder

A web application that uses YOLO object detection to identify clothing items in photos, then finds similar items you can shop for. Images are stored in AWS S3 and detection history is kept in MongoDB.

<img width="1912" height="905" alt="image" src="https://github.com/user-attachments/assets/cae2414e-4903-4b35-be76-da700f12713e" />

## Features

- Image upload and object detection using a custom-trained YOLOv8 model (10 classes: sunglass, hat, jacket, shirt, pants, shorts, skirt, dress, bag, shoe)
- Each detected item is cropped; detections below 0.5 confidence are ignored
- Cloud storage of original, annotated, and cropped images using AWS S3
- Detection history tracking with MongoDB
- Reverse image search for similar/shoppable items (SerpAPI Google Lens, with a Google Custom Search fallback)
- React frontend with a landing page, light/dark theme, and responsive layout
- JWT-based authentication (7-day tokens)

## Architecture

- `frontend/` — React 19 (Create React App) + React Router + axios, styled with plain CSS
- `backend/` — Java 21 + Spring Boot 4.1 (Maven, includes the wrapper so no local Maven install is required)
- `python/` — the YOLOv8 detection script, trained model, and its own virtual environment; invoked by the backend as a subprocess

## Prerequisites

- Java 21+ (JDK)
- Node.js (for the frontend) and npm
- Python 3.11 with `ultralytics`, `torch`, `torchvision`, `opencv-python`, `matplotlib`, and `numpy` (see Setup — the `python/venv` virtual environment is gitignored, so you create it yourself)
- A MongoDB connection string (Atlas or local)
- An AWS account with an S3 bucket
- A SerpAPI key (optional — falls back to a generic Google Custom Search if omitted)
- Docker (optional, only for the container build)

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd appeal-recognition
```

2. Create the Python virtual environment and install the detection dependencies:
```bash
cd python
python -m venv venv
venv/Scripts/pip install ultralytics opencv-python matplotlib numpy   # Windows; use venv/bin/pip on macOS/Linux
cd ..
```

3. Configure the backend environment — create `backend/.env` (gitignored):
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

4. Install frontend dependencies:
```bash
cd frontend
npm install
```

5. Make sure the YOLO model files are present (both are committed to the repo):
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
The frontend talks to `http://localhost:5000` by default; set `REACT_APP_API_URL` to point it at a different backend.

## Deployment

1. Build the backend into a runnable jar:
```bash
cd backend
./mvnw -DskipTests package
java -jar target/backend-0.0.1-SNAPSHOT.jar
```
Or build the container image from the repo root — the `Dockerfile` bundles the jar with Python, CPU-only PyTorch, Ultralytics, and the model files, and listens on port 8080:
```bash
docker build -t appealfinder-backend .
docker run -p 8080:8080 --env-file backend/.env appealfinder-backend
```
(The image sets `PYTHON_DIR`, `PYTHON_EXECUTABLE`, and `PORT` itself, so override those in `.env` only if needed.)

2. Build the frontend (set `REACT_APP_API_URL` to your deployed backend URL first):
```bash
cd frontend
npm run build
```

3. Deploy:
- Backend: any host that runs a Java 21 process or a Docker container (detection shells out to Python, so the host needs Python + the YOLO dependencies — the Docker image already includes them)
- Frontend: any static host (Vercel, Netlify, S3 + CloudFront, etc.) — remember to set the backend's `CORS_ALLOWED_ORIGIN` to the frontend's URL
- Database: MongoDB Atlas
- Storage: AWS S3

## Environment Variables

**Backend** — see `backend/.env` above for the full list. `JWT_SECRET`, the `AWS_*` variables, `PYTHON_DIR`, and `PYTHON_EXECUTABLE` are required; `MONGODB_URI`, `PORT`, `CORS_ALLOWED_ORIGIN`, and `AWS_REGION` have defaults; the Google and SerpAPI keys are optional. `PYTHON_DIR`/`PYTHON_EXECUTABLE` tell the backend where to find the detection script and which Python interpreter to run it with.

**Frontend** — `REACT_APP_API_URL` (optional): base URL of the backend API, defaults to `http://localhost:5000`.

## API

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/` | No | Health check |
| `POST` | `/api/auth/register` | No | Create an account |
| `POST` | `/api/auth/login` | No | Log in, returns a JWT |
| `GET` | `/api/auth/me` | Yes | Current user |
| `POST` | `/upload` | Yes | Upload an image (`image` form field, max 20MB) and run detection |
| `GET` | `/api/detection-runs` | Yes | List the current user's detection history |
| `GET` | `/api/detection-runs/{runId}` | Yes | Get a single detection run |
| `GET` | `/api/similar-items?imageUrl=...` | Yes | Find shoppable items similar to an image |

## Project Structure

```
appeal-recognition/
├── frontend/              # React frontend
│   └── src/               # pages, components, auth context, theme styles
├── backend/               # Java Spring Boot backend
│   ├── src/main/java/com/appealfinder/backend/
│   │                      # controller, service, model, repository, security, config
│   └── .env               # backend config (gitignored)
├── python/                # YOLO model, detection script, evaluation script, and venv
├── evaluation_results_*/  # model evaluation metrics
├── Dockerfile             # backend + Python/YOLO container image
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
