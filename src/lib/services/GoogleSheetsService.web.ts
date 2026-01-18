import type { ISheetsService } from './interfaces';

export class GoogleSheetsService implements ISheetsService {
    public async addRow(data: { date: string, platform: string, idea: string, script: string }): Promise<boolean> {
        console.log('[Web Mock] Saving to sheets:', data);
        // In a real app, this would call an API endpoint (e.g. /api/sheets)
        return true;
    }
}
