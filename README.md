# Appeal Recognition System

A web application that uses YOLO object detection to identify and analyze images. The system stores images in AWS S3 and maintains detection history in MongoDB.

## Features

- Image upload and object detection using YOLO
- Cloud storage of images using AWS S3
- Detection history tracking with MongoDB
- Modern React frontend with Material-UI
- Secure authentication system
- Responsive design for all devices

## Prerequisites

- Node.js (v14 or higher)
- Python 3.8 or higher
- MongoDB
- AWS Account with S3 access
- YOLO model files

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd appeal-recognition
```

2. Install dependencies:
```bash
# Install Node.js dependencies
npm install

# Install Python dependencies
pip install -r requirements.txt
```

3. Configure environment variables:
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your configuration
```

4. Set up MongoDB:
```bash
# Start MongoDB service
mongod

# Create database and user (if needed)
```

5. Configure AWS S3:
- Create an S3 bucket
- Create an IAM user with S3 access
- Add the credentials to your .env file

6. Place YOLO model files:
- Place your trained YOLO model in the `python` directory
- Ensure the model file is named `trained_YOLO8.pt`

## Development

1. Start the backend server:
```bash
npm run dev
```

2. Start the frontend development server:
```bash
cd client
npm start
```

## Deployment

1. Build the frontend:
```bash
cd client
npm run build
```

2. Set up production environment variables:
```bash
# Create production .env file
cp .env.example .env.production
# Edit with production values
```

3. Deploy to your preferred hosting platform:
- Backend: Heroku, AWS EC2, or similar
- Frontend: Netlify, Vercel, or similar
- Database: MongoDB Atlas
- Storage: AWS S3

## Environment Variables

- `PORT`: Server port (default: 3001)
- `MONGODB_URI`: MongoDB connection string
- `AWS_ACCESS_KEY_ID`: AWS access key
- `AWS_SECRET_ACCESS_KEY`: AWS secret key
- `AWS_REGION`: AWS region
- `AWS_BUCKET_NAME`: S3 bucket name
- `JWT_SECRET`: Secret for JWT tokens
- `JWT_EXPIRES_IN`: JWT token expiration

## Project Structure

```
appeal-recognition/
├── client/                 # React frontend
├── python/                 # Python YOLO detection
├── models/                 # MongoDB models
├── services/              # AWS S3 service
├── server.js              # Express server
├── requirements.txt       # Python dependencies
└── package.json          # Node.js dependencies
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 