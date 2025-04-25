const fs = require('fs-extra');
const path = require('path');

// Paths
const frontendDir = path.join(__dirname, '../annotation-app/src');
const backendDataDir = path.join(__dirname, 'data');
const frontendTxtDir = path.join(frontendDir, 'lib/txt');
const backendDocumentsDir = path.join(backendDataDir, 'documents');

// Ensure directories exist
fs.ensureDirSync(backendDataDir);
fs.ensureDirSync(backendDocumentsDir);

async function migrateData() {
	try {
		console.log('Starting data migration...');

		// 1. Copy text files from frontend to backend
		console.log('Copying document files...');
		await fs.copy(frontendTxtDir, backendDocumentsDir);

		// 2. Extract and save schemas, customFields, and dynamicLists
		console.log('Creating JSON data files...');

		// Load the mock-data.ts file content
		const mockDataPath = path.join(frontendDir, 'lib/mock-data.ts');
		const mockDataContent = await fs.readFile(mockDataPath, 'utf8');

		// Extract schemas
		const schemasMatch = mockDataContent.match(
			/export const knowledgeUnitSchemas: KnowledgeUnitSchema\[\] = ([\s\S]*?);/
		);
		if (schemasMatch) {
			const schemasStr = schemasMatch[1].replace(/^export const .+? = /, '');
			// Convert TypeScript to JSON (very simplified approach)
			const schemasJson = eval(`(${schemasStr})`);
			await fs.writeJson(
				path.join(backendDataDir, 'ku-schemas.json'),
				schemasJson,
				{ spaces: 2 }
			);
		}

		// Extract customFieldTypes
		const customFieldsMatch = mockDataContent.match(
			/export const customFieldTypes: CustomFieldType\[\] = ([\s\S]*?);/
		);
		if (customFieldsMatch) {
			const customFieldsStr = customFieldsMatch[1].replace(
				/^export const .+? = /,
				''
			);
			const customFieldsJson = eval(`(${customFieldsStr})`);
			await fs.writeJson(
				path.join(backendDataDir, 'custom-fields.json'),
				customFieldsJson,
				{ spaces: 2 }
			);
		}

		// Extract dynamicLists
		const dynamicListsMatch = mockDataContent.match(
			/export const dynamicLists = ([\s\S]*?);/
		);
		if (dynamicListsMatch) {
			const dynamicListsStr = dynamicListsMatch[1].replace(
				/^export const .+? = /,
				''
			);
			const dynamicListsJson = eval(`(${dynamicListsStr})`);
			await fs.writeJson(
				path.join(backendDataDir, 'dynamic-lists.json'),
				dynamicListsJson,
				{ spaces: 2 }
			);
		}

		// 3. Create empty annotations file
		await fs.writeJson(path.join(backendDataDir, 'annotations.json'), [], {
			spaces: 2,
		});

		console.log('Data migration completed successfully!');
	} catch (error) {
		console.error('Error during data migration:', error);
		process.exit(1);
	}
}

migrateData();
