export interface ISheetsService {
    addRow(data: { date: string, platform: string, idea: string, script: string }): Promise<boolean>;
}
