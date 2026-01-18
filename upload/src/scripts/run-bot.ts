import { LocalStorage } from 'node-localstorage';
import path from 'path';
import dotenv from 'dotenv';
import { TelegramService } from '../lib/services/TelegramService.ts';
import { CreatorAgent } from '../lib/agents/CreatorAgent';
import { ChatAgent } from '../lib/agents/ChatAgent';
import { GoogleSheetsService } from '../lib/services/GoogleSheetsService.node';

// Load env vars
dotenv.config();

// Polyfill LocalStorage for Node.js
if (typeof localStorage === "undefined" || localStorage === null) {
    // Store data in .scratch folder
    const dataPath = path.resolve(process.cwd(), '.scratch');
    global.localStorage = new LocalStorage(dataPath);
}

const TOKEN = process.env.TELEGRAM_BOT_TOKEN || '5994798456:AAG9bC1-Yf6w58v5i_7aBfyTt4mkDgZ4XeU'; // Fallback to provided token

if (!TOKEN) {
    console.error('❌ No TELEGRAM_BOT_TOKEN provided!');
    process.exit(1);
}

// Composition Root - Node
const sheetsService = new GoogleSheetsService();
const creatorAgent = CreatorAgent.getInstance(sheetsService);
ChatAgent.getInstance(creatorAgent);

const service = new TelegramService(TOKEN);

// Keep alive
process.on('SIGINT', () => {
    service.stop();
    console.log('🛑 Bot stopped');
    process.exit(0);
});
