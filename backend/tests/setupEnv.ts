// Runs before the test files are loaded, so the app/database modules pick
// up an in-memory SQLite DB instead of touching the real data file.
process.env.DB_PATH = ':memory:';
process.env.GEMINI_API_KEY = 'test-key';
process.env.GEMINI_MODEL = 'gemini-1.5-flash';
