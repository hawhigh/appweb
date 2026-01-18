import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import dotenv from 'dotenv';

dotenv.config();

import type { ISheetsService } from './interfaces';

export class GoogleSheetsService implements ISheetsService {
    private doc: GoogleSpreadsheet | null = null;
    private initialized = false;

    constructor() {
        const sheetId = process.env.GOOGLE_SHEET_ID;
        const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
        const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

        if (sheetId && clientEmail && privateKey) {
            const auth = new JWT({
                email: clientEmail,
                key: privateKey,
                scopes: ['https://www.googleapis.com/auth/spreadsheets'],
            });
            this.doc = new GoogleSpreadsheet(sheetId, auth);
        } else {
            console.warn('⚠️ Sheets credentials missing. Export disabled.');
        }
    }

    public async addRow(data: { date: string, platform: string, idea: string, script: string }) {
        if (!this.doc) return false;

        try {
            if (!this.initialized) {
                await this.doc.loadInfo();
                this.initialized = true;
            }

            const sheet = this.doc.sheetsByIndex[0]; // Assume first sheet
            await sheet.addRow({
                Date: data.date,
                Platform: data.platform,
                Idea: data.idea,
                Script: data.script,
                Status: 'Draft'
            });
            console.log('✅ Saved to Google Sheet');
            return true;
        } catch (error) {
            console.error('❌ Failed to save to sheet:', error);
            return false;
        }
    }
}
