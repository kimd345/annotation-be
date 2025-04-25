const express = require('express');
const path = require('path');
const { readJsonFile, writeJsonFile, dataDir } = require('../utils/file-utils');

const router = express.Router();

// Get all knowledge units for a document
router.get('/document/:documentId', async (req, res) => {
	try {
		const documentId = req.params.documentId;
		const knowledgeUnits = await readJsonFile(
			path.join(dataDir, 'annotations.json')
		);

		const documentKUs = knowledgeUnits.filter(
			(ku) => ku.documentId === documentId
		);
		res.json(documentKUs);
	} catch (error) {
		console.error('Error fetching annotations:', error);
		res.status(500).json({ error: 'Failed to fetch annotations' });
	}
});

// Save a knowledge unit
router.post('/', async (req, res) => {
	try {
		const newKU = req.body;
		const knowledgeUnits = await readJsonFile(
			path.join(dataDir, 'annotations.json')
		);

		// Find if KU already exists
		const existingIndex = knowledgeUnits.findIndex((ku) => ku.id === newKU.id);

		if (existingIndex !== -1) {
			// Update existing KU
			knowledgeUnits[existingIndex] = newKU;
			console.log(`Updated knowledge unit: ${newKU.id}`);
		} else {
			// Add new KU
			knowledgeUnits.push(newKU);
			console.log(`Created new knowledge unit: ${newKU.id}`);
		}

		await writeJsonFile(path.join(dataDir, 'annotations.json'), knowledgeUnits);
		res.status(201).json(newKU);
	} catch (error) {
		console.error('Error saving annotation:', error);
		res.status(500).json({ error: 'Failed to save annotation' });
	}
});

// Delete a knowledge unit
router.delete('/:id', async (req, res) => {
	try {
		const kuId = req.params.id;
		const knowledgeUnits = await readJsonFile(
			path.join(dataDir, 'annotations.json')
		);

		const updatedKUs = knowledgeUnits.filter((ku) => ku.id !== kuId);

		if (updatedKUs.length === knowledgeUnits.length) {
			return res.status(404).json({ error: 'Knowledge unit not found' });
		}

		await writeJsonFile(path.join(dataDir, 'annotations.json'), updatedKUs);
		res.status(204).send();
	} catch (error) {
		console.error('Error deleting annotation:', error);
		res.status(500).json({ error: 'Failed to delete annotation' });
	}
});

// Export all annotations for a document
router.get('/export/:documentId', async (req, res) => {
	try {
		const documentId = req.params.documentId;
		const knowledgeUnits = await readJsonFile(
			path.join(dataDir, 'annotations.json')
		);
		const documentKUs = knowledgeUnits.filter(
			(ku) => ku.documentId === documentId
		);

		// Get the document details
		const documents = await getAllDocuments();
		const document = documents.find((doc) => doc.id === documentId);

		if (!document) {
			return res.status(404).json({ error: 'Document not found' });
		}

		// Create export data
		const exportData = {
			document: {
				id: document.id,
				title: document.title,
				fileName: document.fileName,
			},
			knowledgeUnits: documentKUs,
		};

		res.json(exportData);
	} catch (error) {
		console.error('Error exporting annotations:', error);
		res.status(500).json({ error: 'Failed to export annotations' });
	}
});

module.exports = router;
