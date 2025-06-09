const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const { spawn } = require("child_process");
const fs = require("fs");
const mongoose = require("mongoose");
const { v4: uuidv4 } = require('uuid');
require("dotenv").config();

// Import models
const DetectionRun = require('./models/DetectionRun');

// Import services
const s3Service = require('./services/s3Service');
const shoppingService = require('./services/shoppingService');

// Import middleware
const auth = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/appeal-recognition', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Create the directory if it doesn't exist
        const uploadDir = path.join(__dirname, 'python');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, 'uploaded_image.jpg');
    }
});

const upload = multer({ storage: storage });

// Configure CORS
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json()); // Allows JSON request body

// Import routes
const authRoutes = require('./routes/auth');

// Use routes
app.use('/api/auth', authRoutes);

// Create the results directory if it doesn't exist
const runsDir = path.join(__dirname, 'python/runs');
if (!fs.existsSync(runsDir)) {
    fs.mkdirSync(runsDir, { recursive: true });
}

// Serve static files from the runs directory
app.use('/runs', express.static(runsDir, {
    setHeaders: (res, path) => {
        res.set('Content-Type', 'image/jpeg');
    }
}));

// Add a route to check if images exist
app.get('/check-image/:runId/:type/:filename', (req, res) => {
    const { runId, type, filename } = req.params;
    const filePath = type === 'cropped' 
        ? path.join(runsDir, runId, 'cropped', filename)
        : path.join(runsDir, runId, filename);
    
    console.log(`Checking file: ${filePath}`);
    console.log(`File exists: ${fs.existsSync(filePath)}`);
    
    res.json({
        exists: fs.existsSync(filePath),
        path: filePath
    });
});

// Add a debug route to list files in a run directory
app.get('/debug/run/:runId', (req, res) => {
    const { runId } = req.params;
    const runDir = path.join(runsDir, runId);
    
    if (!fs.existsSync(runDir)) {
        return res.status(404).json({ error: `Run directory not found: ${runDir}` });
    }
    
    const files = fs.readdirSync(runDir);
    const result = {
        runDir,
        files,
        croppedDir: null,
        croppedFiles: []
    };
    
    const croppedDir = path.join(runDir, 'cropped');
    if (fs.existsSync(croppedDir)) {
        result.croppedDir = croppedDir;
        result.croppedFiles = fs.readdirSync(croppedDir);
    }
    
    res.json(result);
});

// Add a route to directly serve cropped images
app.get('/runs/:runId/cropped/:filename', (req, res) => {
    const { runId, filename } = req.params;
    const filePath = path.join(runsDir, runId, 'cropped', filename);
    
    console.log(`Serving cropped image: ${filePath}`);
    console.log(`File exists: ${fs.existsSync(filePath)}`);
    
    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        res.status(404).send(`Cropped image not found: ${filePath}`);
    }
});

// Add a route to directly serve result images
app.get('/runs/:runId/:filename', (req, res) => {
    const { runId, filename } = req.params;
    const filePath = path.join(runsDir, runId, filename);
    
    console.log(`Serving result image: ${filePath}`);
    console.log(`File exists: ${fs.existsSync(filePath)}`);
    
    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        res.status(404).send(`Result image not found: ${filePath}`);
    }
});

// Add a debug route to check the directory structure
app.get('/debug/directory', (req, res) => {
    const result = {
        runsDir,
        exists: fs.existsSync(runsDir),
        contents: []
    };
    
    if (fs.existsSync(runsDir)) {
        result.contents = fs.readdirSync(runsDir);
        
        // Check each run directory
        result.runs = result.contents.map(runId => {
            const runDir = path.join(runsDir, runId);
            const runInfo = {
                runId,
                path: runDir,
                exists: fs.existsSync(runDir),
                files: [],
                croppedDir: null,
                croppedFiles: []
            };
            
            if (fs.existsSync(runDir)) {
                runInfo.files = fs.readdirSync(runDir);
                
                const croppedDir = path.join(runDir, 'cropped');
                if (fs.existsSync(croppedDir)) {
                    runInfo.croppedDir = croppedDir;
                    runInfo.croppedFiles = fs.readdirSync(croppedDir);
                }
            }
            
            return runInfo;
        });
    }
    
    res.json(result);
});

app.get("/", (req, res) => {
    res.send("Server is running");
});

// Add auth middleware to routes that need authentication
app.post("/upload", auth, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            console.error('No file uploaded');
            return res.status(400).json({ error: 'No image file uploaded' });
        }

        const userId = req.user._id;
        console.log('File uploaded successfully:', req.file.path);

        // Generate a unique run ID
        const runId = uuidv4();
        
        // Create a new detection run record
        const detectionRun = new DetectionRun({
            userId,
            timestamp: new Date(),
            status: 'processing'
        });
        
        // Save the detection run to get its ID
        await detectionRun.save();
        
        // Check if Python script exists
        const pythonScriptPath = path.join(__dirname, 'python/object_detection_YOLO.py');
        if (!fs.existsSync(pythonScriptPath)) {
            console.error('Python script not found at:', pythonScriptPath);
            detectionRun.status = 'failed';
            detectionRun.error = 'Python script not found';
            await detectionRun.save();
            return res.status(500).json({ error: 'Python script not found' });
        }

        // Check if model file exists
        const modelPath = path.join(__dirname, 'python/trained_YOLO8.pt');
        if (!fs.existsSync(modelPath)) {
            console.error('Model file not found at:', modelPath);
            detectionRun.status = 'failed';
            detectionRun.error = 'Model file not found';
            await detectionRun.save();
            return res.status(500).json({ error: 'Model file not found' });
        }

        // Check if data.yaml exists
        const dataYamlPath = path.join(__dirname, 'python/data.yaml');
        if (!fs.existsSync(dataYamlPath)) {
            console.error('data.yaml not found at:', dataYamlPath);
            detectionRun.status = 'failed';
            detectionRun.error = 'data.yaml not found';
            await detectionRun.save();
            return res.status(500).json({ error: 'data.yaml not found' });
        }

        // Run the Python script
        const pythonProcess = spawn('python', [pythonScriptPath, req.file.path]);
        
        let result = '';
        let error = '';
        let jsonResult = null;

        pythonProcess.stdout.on('data', (data) => {
            console.log('Python stdout:', data.toString());
        });

        pythonProcess.stderr.on('data', (data) => {
            const output = data.toString();
            error += output;
            console.error('Python stderr:', output);
            
            // Look for JSON markers in stderr
            if (output.includes('JSON_RESULT_BEGIN')) {
                const beginIndex = output.indexOf('JSON_RESULT_BEGIN') + 'JSON_RESULT_BEGIN'.length;
                const endIndex = output.indexOf('JSON_RESULT_END');
                
                if (endIndex > beginIndex) {
                    try {
                        const jsonStr = output.substring(beginIndex, endIndex).trim();
                        jsonResult = JSON.parse(jsonStr);
                    } catch (e) {
                        console.error('Error parsing JSON:', e);
                    }
                }
            }
        });

        pythonProcess.on('close', async (code) => {
            console.log('Python process exited with code:', code);
            if (code !== 0) {
                detectionRun.status = 'failed';
                detectionRun.error = `Python script failed: ${error}`;
                await detectionRun.save();
                return res.status(500).json({ error: `Python script failed: ${error}` });
            }

            try {
                if (!jsonResult) {
                    // Try to find the JSON result in the complete error output
                    const beginMarker = 'JSON_RESULT_BEGIN';
                    const endMarker = 'JSON_RESULT_END';
                    const beginIndex = error.indexOf(beginMarker) + beginMarker.length;
                    const endIndex = error.indexOf(endMarker);
                    
                    if (beginIndex > 0 && endIndex > beginIndex) {
                        const jsonStr = error.substring(beginIndex, endIndex).trim();
                        jsonResult = JSON.parse(jsonStr);
                    } else {
                        throw new Error('Could not find JSON result in Python output');
                    }
                }
                
                console.log('Parsed results:', jsonResult);
                
                // Check if result image exists
                const resultImagePath = jsonResult.result_image_path;
                console.log('Result image path:', resultImagePath);
                console.log('Result image exists:', fs.existsSync(resultImagePath));
                
                // Upload original image to S3
                console.log('Uploading original image to S3...');
                const originalImageKey = s3Service.generateS3Key(userId, runId, req.file.originalname, 'original');
                console.log('Original image S3 key:', originalImageKey);
                const originalImageUrl = await s3Service.uploadFile(req.file.path, originalImageKey);
                console.log('Original image uploaded to S3:', originalImageUrl);
                
                // Upload detected image to S3
                console.log('Uploading detected image to S3...');
                const detectedImageKey = s3Service.generateS3Key(userId, runId, req.file.originalname, 'detected');
                console.log('Detected image S3 key:', detectedImageKey);
                const detectedImageUrl = await s3Service.uploadFile(resultImagePath, detectedImageKey);
                console.log('Detected image uploaded to S3:', detectedImageUrl);
                
                // Upload cropped images to S3
                console.log('Uploading cropped images to S3...');
                const croppedImages = [];
                for (const detection of jsonResult.detections) {
                    const croppedImagePath = path.join(path.dirname(resultImagePath), 'cropped', detection.cropped_image);
                    console.log('Checking cropped image path:', croppedImagePath);
                    if (fs.existsSync(croppedImagePath)) {
                        const croppedImageKey = s3Service.generateS3Key(userId, runId, detection.cropped_image, 'cropped');
                        console.log('Cropped image S3 key:', croppedImageKey);
                        const croppedImageUrl = await s3Service.uploadFile(croppedImagePath, croppedImageKey);
                        console.log('Cropped image uploaded to S3:', croppedImageUrl);
                        
                        croppedImages.push({
                            class: detection.class,
                            confidence: detection.confidence,
                            bbox: detection.bbox,
                            imageUrl: croppedImageUrl
                        });
                    } else {
                        console.log('Cropped image not found:', croppedImagePath);
                    }
                }
                
                // Update detection run with image URLs
                detectionRun.originalImageUrl = originalImageUrl;
                detectionRun.detectedImageUrl = detectedImageUrl;
                detectionRun.croppedImages = croppedImages;
                detectionRun.status = 'completed';
                await detectionRun.save();
                
                // Clean up local files
                fs.unlinkSync(req.file.path);
                if (fs.existsSync(resultImagePath)) {
                    fs.unlinkSync(resultImagePath);
                }
                
                // Clean up cropped images
                const croppedDir = path.join(path.dirname(resultImagePath), 'cropped');
                if (fs.existsSync(croppedDir)) {
                    const croppedFiles = fs.readdirSync(croppedDir);
                    for (const file of croppedFiles) {
                        fs.unlinkSync(path.join(croppedDir, file));
                    }
                    fs.rmdirSync(croppedDir);
                }
                
                // Return the detection run ID and image URLs
                const responseData = {
                    runId: detectionRun._id,
                    originalImageUrl: originalImageUrl,
                    detectedImageUrl: detectedImageUrl,
                    croppedImages: croppedImages
                };
                
                console.log('Sending response:', responseData);
                console.log('Response data type:', typeof responseData);
                console.log('Response data keys:', Object.keys(responseData));
                
                res.json(responseData);
            } catch (e) {
                console.error('Failed to process results:', e);
                detectionRun.status = 'failed';
                detectionRun.error = `Failed to process results: ${e.message}`;
                await detectionRun.save();
                res.status(500).json({ error: 'Failed to process results' });
            }
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Add a route to get a user's detection runs
app.get("/api/detection-runs", auth, async (req, res) => {
    try {
        const userId = req.user._id;
        const runs = await DetectionRun.find({ userId }).sort({ timestamp: -1 });
        res.json(runs);
    } catch (error) {
        console.error('Error fetching detection runs:', error);
        res.status(500).json({ error: error.message });
    }
});

// Add a route to get a specific detection run
app.get("/api/detection-runs/:runId", auth, async (req, res) => {
    try {
        const userId = req.user._id;
        const run = await DetectionRun.findOne({ _id: req.params.runId, userId });
        if (!run) {
            return res.status(404).json({ error: 'Detection run not found' });
        }
        res.json(run);
    } catch (error) {
        console.error('Error fetching detection run:', error);
        res.status(500).json({ error: error.message });
    }
});

// Add a route to search for similar items using the detected image
app.get("/api/similar-items/:runId/:filename", auth, async (req, res) => {
    try {
        const { runId, filename } = req.params;
        
        // Check if filename is already a full URL (from S3)
        if (filename.startsWith('http')) {
            // Use the URL directly
            const results = await shoppingService.searchSimilarItemsWeb(filename);
            return res.json(results);
        }
        
        // Otherwise get the detection run to find the S3 image URL
        const run = await DetectionRun.findById(runId);
        if (!run) {
            return res.status(404).json({ error: 'Detection run not found' });
        }
        
        // Find the specific cropped image
        const croppedImage = run.croppedImages.find(img => 
            img.imageUrl.includes(filename) || img.originalFilename === filename
        );
        
        if (!croppedImage) {
            return res.status(404).json({ error: 'Cropped image not found' });
        }
        
        // Use the S3 URL directly for web search
        try {
            const results = await shoppingService.searchSimilarItemsWeb(croppedImage.imageUrl);
            return res.json(results);
        } catch (error) {
            console.error('Web search failed:', error);
            res.status(500).json({ error: 'Failed to search for similar items' });
        }
    } catch (error) {
        console.error('Error searching for similar items:', error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});