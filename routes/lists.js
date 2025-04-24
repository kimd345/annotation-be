const express = require('express');
const path = require('path');
const config = require('config');
const { readJsonFile, dataDir } = require('../utils/file-utils');

const router = express.Router();

// Get all available list types
router.get('/types', async (req, res) => {
	try {
		const dynamicLists = await readJsonFile(
			path.join(dataDir, 'dynamic-lists.json')
		);
		res.json(Object.keys(dynamicLists));
	} catch (error) {
		console.error('Error fetching list types:', error);
		res.status(500).json({ error: 'Failed to fetch list types' });
	}
});

// Get items from a specific list with pagination
router.get('/:listType', async (req, res) => {
	try {
		const listType = req.params.listType;
		const search = req.query.search || '';
		const page = parseInt(req.query.page) || 0;
		const limit = parseInt(req.query.limit) || config.get('listChunkSize');

		const dynamicLists = await readJsonFile(
			path.join(dataDir, 'dynamic-lists.json')
		);

		if (!dynamicLists[listType]) {
			return res.status(404).json({ error: 'List type not found' });
		}

		let items = dynamicLists[listType];

		// Filter by search term if provided
		if (search) {
			const searchLower = search.toLowerCase();
			items = items.filter(
				(item) =>
					typeof item === 'string' && item.toLowerCase().includes(searchLower)
			);
		}

		// Paginate results
		const startIndex = page * limit;
		const endIndex = startIndex + limit;
		const paginatedItems = items.slice(startIndex, endIndex);

		res.json({
			items: paginatedItems,
			metadata: {
				total: items.length,
				page,
				limit,
				hasMore: endIndex < items.length,
			},
		});
	} catch (error) {
		console.error('Error fetching list items:', error);
		res.status(500).json({ error: 'Failed to fetch list items' });
	}
});

module.exports = router;
