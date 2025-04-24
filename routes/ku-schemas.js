const express = require('express');
const path = require('path');
const { readJsonFile, dataDir } = require('../utils/file-utils');

const router = express.Router();

// Get all knowledge unit schemas
router.get('/', async (req, res) => {
	try {
		const schemas = await readJsonFile(path.join(dataDir, 'ku-schemas.json'));
		res.json(schemas);
	} catch (error) {
		console.error('Error fetching schemas:', error);
		res.status(500).json({ error: 'Failed to fetch schemas' });
	}
});

// Get custom field types
router.get('/custom-fields', async (req, res) => {
	try {
		const customFields = await readJsonFile(
			path.join(dataDir, 'custom-fields.json')
		);
		res.json(customFields);
	} catch (error) {
		console.error('Error fetching custom fields:', error);
		res.status(500).json({ error: 'Failed to fetch custom fields' });
	}
});

module.exports = router;
