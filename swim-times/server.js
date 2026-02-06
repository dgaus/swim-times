import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'swim_db.json');

app.use(cors());
app.use(express.json());

// Serve static files from dist
app.use(express.static(path.join(__dirname, 'dist')));

// Ensure data directory exists
async function initDB() {
    try {
        await fs.mkdir(DATA_DIR, { recursive: true });
        // Check if file exists and is valid
        try {
            await fs.access(DB_FILE);
            const content = await fs.readFile(DB_FILE, 'utf-8');
            // Validate it's valid JSON
            if (!content.trim()) {
                console.log('DB file is empty, initializing with empty array');
                await fs.writeFile(DB_FILE, JSON.stringify([], null, 2));
            } else {
                JSON.parse(content); // Validate JSON
            }
        } catch (err) {
            // File doesn't exist or is invalid JSON
            console.log('DB file missing or invalid, creating new one');
            await fs.writeFile(DB_FILE, JSON.stringify([], null, 2));
        }
    } catch (err) {
        console.error('Failed to initialize DB:', err);
        process.exit(1);
    }
}

// Helper to safely read records with error recovery
async function safeReadRecords() {
    try {
        const content = await fs.readFile(DB_FILE, 'utf-8');
        if (!content.trim()) {
            // Empty file, return empty array and fix the file
            await fs.writeFile(DB_FILE, JSON.stringify([], null, 2));
            return [];
        }
        return JSON.parse(content);
    } catch (err) {
        if (err.code === 'ENOENT') {
            // File was deleted, recreate it
            console.warn('DB file was deleted, recreating...');
            await fs.mkdir(DATA_DIR, { recursive: true });
            await fs.writeFile(DB_FILE, JSON.stringify([], null, 2));
            return [];
        } else if (err instanceof SyntaxError) {
            // Invalid JSON, backup and recreate
            console.error('DB file contains invalid JSON, backing up and recreating...');
            const backupFile = `${DB_FILE}.backup.${Date.now()}`;
            try {
                await fs.copyFile(DB_FILE, backupFile);
                console.log(`Backed up corrupted file to: ${backupFile}`);
            } catch (backupErr) {
                console.error('Failed to backup corrupted file:', backupErr);
            }
            await fs.writeFile(DB_FILE, JSON.stringify([], null, 2));
            return [];
        }
        throw err;
    }
}

// API Routes
app.get('/api/records', async (req, res) => {
    try {
        const records = await safeReadRecords();
        res.json(records);
    } catch (err) {
        console.error('Error reading records:', err);
        res.status(500).json({ error: 'Failed to read records' });
    }
});

app.post('/api/records', async (req, res) => {
    try {
        const { rating, timestamp, id, day, time } = req.body;
        if (!rating || !timestamp || !id) {
            return res.status(400).json({ error: 'Missing fields' });
        }

        const records = await safeReadRecords();

        const newRecord = { id, rating, timestamp, day, time };
        records.push(newRecord);

        await fs.writeFile(DB_FILE, JSON.stringify(records, null, 2));
        res.json(newRecord);
    } catch (err) {
        console.error('Error saving record:', err);
        res.status(500).json({ error: 'Failed to save record' });
    }
});

app.delete('/api/records/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const records = await safeReadRecords();

        const filteredRecords = records.filter(r => r.id !== id);

        await fs.writeFile(DB_FILE, JSON.stringify(filteredRecords, null, 2));
        res.json({ success: true });
    } catch (err) {
        console.error('Error deleting record:', err);
        res.status(500).json({ error: 'Failed to delete record' });
    }
});

// Catch-all for SPA
app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start
initDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});

