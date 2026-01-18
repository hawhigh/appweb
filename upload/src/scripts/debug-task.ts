
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

async function debug() {
    console.log("--- START DEBUG ---");

    // 1. Setup
    const sheets = new MockSheetsService();
    // Reset store to clear old state for clean test
    AgencyStore.getInstance().resetData();

    const creator = CreatorAgent.getInstance(sheets);
    const chat = ChatAgent.getInstance(creator);

    // 2. Test Creation
    console.log("\n--- TEST: Creating Task ---");
    const createInput = "new task debug impossible task";
    console.log(`Input: "${createInput}"`);
    const createRes = await chat.processCommand(createInput);
    console.log(`Output: ${createRes}`);

    // 3. Verify Store
    const store = AgencyStore.getInstance();
    const tasks = store.pipeline;
    const found = tasks.find(t => t.taskName.includes('debug impossible task'));

    if (found) {
        console.log("✅ Check: Task found in store:", found);
    } else {
        console.error("❌ Check: Task NOT found in store!");
        console.log("Current Pipeline:", JSON.stringify(tasks, null, 2));
    }

    // 4. Test Completion
    console.log("\n--- TEST: Completing Task ---");
    const completeInput = "done debug impossible task";
    console.log(`Input: "${completeInput}"`);
    const completeRes = await chat.processCommand(completeInput);
    console.log(`Output: ${completeRes}`);

    // Verify status
    const updated = store.pipeline.find(t => t.id === found?.id);
    if (updated?.status === 'Live') {
        console.log("✅ Check: Task status is 'Live'");
    } else {
        console.error(`❌ Check: Task status is '${updated?.status}' (Expected 'Live')`);
    }

    console.log("--- END DEBUG ---");
}

debug().catch(console.error);
