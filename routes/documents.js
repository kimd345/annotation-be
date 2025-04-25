const express = require('express');
const path = require('path');
const config = require('config');
const {
	readJsonFile,
	getAllDocuments,
	markDocumentsWithAnnotations,
	dataDir,
} = require('../utils/file-utils');

const router = express.Router();

// Get documents with pagination
router.get('/', async (req, res) => {
	try {
		// Parse pagination parameters
		const page = parseInt(req.query.page) || 0;
		const limit = parseInt(req.query.limit) || config.get('documentChunkSize');

		// Load all documents and annotations
		let documents = await getAllDocuments();
		const knowledgeUnits = await readJsonFile(
			path.join(dataDir, 'annotations.json')
		);

		// Mark documents that have annotations
		documents = markDocumentsWithAnnotations(documents, knowledgeUnits);

		// Sort documents (annotated first)
		documents.sort((a, b) => {
			if (a.hasAnnotations && !b.hasAnnotations) return -1;
			if (!a.hasAnnotations && b.hasAnnotations) return 1;
			return a.title.localeCompare(b.title);
		});

		// Paginate results
		const startIndex = page * limit;
		const endIndex = startIndex + limit;
		const paginatedDocuments = documents.slice(startIndex, endIndex);

		// Send response with pagination metadata
		res.json({
			documents: paginatedDocuments,
			metadata: {
				total: documents.length,
				page,
				limit,
				hasMore: endIndex < documents.length,
			},
		});
	} catch (error) {
		console.error('Error fetching documents:', error);
		res.status(500).json({ error: 'Failed to fetch documents' });
	}
});

// Get a single document by ID
router.get('/:id', async (req, res) => {
	try {
		const documents = await getAllDocuments();
		const document = documents.find((doc) => doc.id === req.params.id);

		if (!document) {
			return res.status(404).json({ error: 'Document not found' });
		}

		res.json(document);
	} catch (error) {
		console.error('Error fetching document:', error);
		res.status(500).json({ error: 'Failed to fetch document' });
	}
});

module.exports = router;
