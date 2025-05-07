const mongoose = require('mongoose');

const DetectionRunSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    originalImageUrl: {
        type: String,
        required: false
    },
    detectedImageUrl: {
        type: String,
        required: false
    },
    croppedImages: [{
        class: String,
        confidence: Number,
        bbox: [Number],
        imageUrl: String
    }],
    status: {
        type: String,
        enum: ['processing', 'completed', 'failed'],
        default: 'processing'
    },
    error: {
        type: String,
        required: false
    }
});

module.exports = mongoose.model('DetectionRun', DetectionRunSchema); 