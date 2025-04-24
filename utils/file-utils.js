const fs = require('fs-extra');
const path = require('path');

// Base data directory path
const dataDir = path.join(__dirname, '../data');

/**
 * Read JSON file
 * @param {string} filePath - Path to the JSON file
 * @returns {Promise<object>} - Parsed JSON data
 */
const readJsonFile = async (filePath) => {
	try {
		return await fs.readJson(filePath);
	} catch (error) {
		if (error.code === 'ENOENT') {
			// File doesn't exist, return empty object/array
			return path.basename(filePath) === 'annotations.json' ? [] : {};
		}
		throw error;
	}
};

/**
 * Write data to JSON file
 * @param {string} filePath - Path to the JSON file
 * @param {object} data - Data to write
 */
const writeJsonFile = async (filePath, data) => {
	await fs.ensureDir(path.dirname(filePath));
	await fs.writeJson(filePath, data, { spaces: 2 });
};

/**
 * Read all document files from the documents directory
 * @returns {Promise<Array>} - Array of document objects
 */
const getAllDocuments = async () => {
	const documentsDir = path.join(dataDir, 'documents');
	await fs.ensureDir(documentsDir);

	const files = await fs.readdir(documentsDir);
	const documents = [];

	for (const file of files) {
		if (path.extname(file) === '.txt') {
			const filePath = path.join(documentsDir, file);
			const content = await fs.readFile(filePath, 'utf8');
			const lines = content.split('\n');
			const title = lines[0] || 'Untitled Document';

			documents.push({
				id: path.basename(file, '.txt'),
				title,
				fileName: file,
				content,
				hasAnnotations: false,
			});
		}
	}

	return documents;
};

/**
 * Check which documents have annotations
 * @param {Array} documents - Array of document objects
 * @param {Array} knowledgeUnits - Array of knowledge units
 * @returns {Array} - Array of documents with hasAnnotations flag set
 */
const markDocumentsWithAnnotations = (documents, knowledgeUnits) => {
	const documentsWithAnnotations = new Set(
		knowledgeUnits.map((ku) => ku.documentId)
	);

	return documents.map((doc) => ({
		...doc,
		hasAnnotations: documentsWithAnnotations.has(doc.id),
	}));
};

module.exports = {
	readJsonFile,
	writeJsonFile,
	getAllDocuments,
	markDocumentsWithAnnotations,
	dataDir,
};
