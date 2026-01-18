
import { ChatAgent } from '../lib/agents/ChatAgent';
import { CreatorAgent } from '../lib/agents/CreatorAgent';
import { AgencyStore } from '../lib/agents/AgencyStore';
import type { ISheetsService } from '../lib/services/interfaces';

// Mock LocalStorage
class MockStorage {
    private store: { [key: string]: string } = {};
    getItem(key: string) { return this.store[key] || null; }
    setItem(key: string, value: string) { this.store[key] = value; }
    clear() { this.store = {}; }
}
(global as any).localStorage = new MockStorage();

// Mock Sheets Service
class MockSheetsService implements ISheetsService {
    async addRow(data: any): Promise<boolean> {
        console.log("MOCK: Added row to sheets", data);
        return true;
    }
}

async function debugV3() {
    console.log("--- START DEBUG V3 ---");

    // 1. Setup
    const sheets = new MockSheetsService();
    const store = AgencyStore.getInstance();
    store.resetData();

    // Add extra pulse data for weekly report
    store.addPulseItem({ weekEnding: '2026-01-09', revenue: 1000, newUsers: 30, topPost: 'Old Viral' });

    const creator = CreatorAgent.getInstance(sheets);
    const chat = ChatAgent.getInstance(creator);

    // 2. Test Weekly Report
    console.log("\n--- TEST: Weekly Report ---");
    const reportRes = await chat.processCommand("weekly report");
    console.log(`Output:\n${reportRes}`);

    // 3. Test Invoice Check
    console.log("\n--- TEST: Check Invoices ---");
    // Ensure we have active high value client
    store.addClient({ name: 'Whale', company: 'MegaCorp', status: 'Active', dealValue: 5000, email: 'whale@mega.com' });
    const invoiceRes = await chat.processCommand("check invoices");
    console.log(`Output:\n${invoiceRes}`);

    // 4. Test Campaign Setup (Chained Workflow)
    console.log("\n--- TEST: Setup Campaign ---");
    const campaignRes = await chat.processCommand("setup campaign Black Friday");
    console.log(`Output:\n${campaignRes}`);

    // Verify side effects
    const hasProject = store.projects.find(p => p.name === 'Black Friday');
    const ideas = store.content.length;

    console.log(`\nVerification: 
- Project Created: ${!!hasProject}
- Total Content Ideas: ${ideas} (> 1 means auto-pilot worked)`);

    console.log("--- END DEBUG V3 ---");
}

debugV3().catch(console.error);
