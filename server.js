const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const { spawn } = require("child_process");
const fs = require("fs");
const mongoose = require("mongoose");
require("dotenv").config();

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

app.use(cors());
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

app.post("/upload", upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            console.error('No file uploaded');
            return res.status(400).json({ error: 'No image file uploaded' });
        }

        console.log('File uploaded successfully:', req.file.path);

        // Check if Python script exists
        const pythonScriptPath = path.join(__dirname, 'python/object_detection_YOLO.py');
        if (!fs.existsSync(pythonScriptPath)) {
            console.error('Python script not found at:', pythonScriptPath);
            return res.status(500).json({ error: 'Python script not found' });
        }

        // Check if model file exists
        const modelPath = path.join(__dirname, 'python/trained_YOLO8.pt');
        if (!fs.existsSync(modelPath)) {
            console.error('Model file not found at:', modelPath);
            return res.status(500).json({ error: 'Model file not found' });
        }

        // Check if data.yaml exists
        const dataYamlPath = path.join(__dirname, 'python/data.yaml');
        if (!fs.existsSync(dataYamlPath)) {
            console.error('data.yaml not found at:', dataYamlPath);
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

        pythonProcess.on('close', (code) => {
            console.log('Python process exited with code:', code);
            if (code !== 0) {
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
                
                // Clean up the uploaded file
                fs.unlinkSync(req.file.path);
                
                // Extract the run ID from the run directory path
                const runId = path.basename(jsonResult.run_directory);
                
                // Construct the correct URLs for the frontend
                const resultImageUrl = `/runs/${runId}/detected_${path.basename(req.file.originalname)}`;
                
                // Log the constructed URL for debugging
                console.log('Result image URL:', resultImageUrl);
                
                // Check if cropped images exist
                if (jsonResult.detections && jsonResult.detections.length > 0) {
                    console.log('Checking cropped images:');
                    jsonResult.detections.forEach(detection => {
                        const croppedPath = path.join(runsDir, runId, 'cropped', detection.cropped_image);
                        console.log(`Cropped image path: ${croppedPath}`);
                        console.log(`Cropped image exists: ${fs.existsSync(croppedPath)}`);
                    });
                }
                
                // Return the run ID separately to make it easier for the frontend
                res.json({
                    ...jsonResult,
                    result_image_url: resultImageUrl,
                    run_id: runId
                });
            } catch (e) {
                console.error('Failed to parse results:', e);
                res.status(500).json({ error: 'Failed to parse Python script results' });
            }
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});