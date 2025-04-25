const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const config = require('config');
const fs = require('fs-extra');

// Import routes
const documentRoutes = require('./routes/documents');
const schemaRoutes = require('./routes/ku-schemas');
const annotationRoutes = require('./routes/annotations');
const listRoutes = require('./routes/lists');

// Initialize express app
const app = express();
const port = config.get('port');

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api/documents', documentRoutes);
app.use('/api/schemas', schemaRoutes);
app.use('/api/annotations', annotationRoutes);
app.use('/api/lists', listRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
	res.json({ status: 'ok' });
});

// Initialize data directory
const dataDir = path.join(__dirname, 'data');
fs.ensureDirSync(dataDir);
fs.ensureDirSync(path.join(dataDir, 'documents'));

// Start server
app.listen(port, () => {
	console.log(`Backend server running on port ${port}`);
	console.log(`API available at http://localhost:${port}/api`);
});
