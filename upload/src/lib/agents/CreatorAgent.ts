import { AgencyStore } from './AgencyStore';
import type { ISheetsService } from '../services/interfaces';

export class CreatorAgent {
    private static instance: CreatorAgent;
    private store: AgencyStore;
    private sheetsService: ISheetsService;

    private constructor(sheetsService: ISheetsService) {
        this.store = AgencyStore.getInstance();
        this.sheetsService = sheetsService;
    }

    public static getInstance(sheetsService?: ISheetsService): CreatorAgent {
        if (!CreatorAgent.instance) {
            if (!sheetsService) throw new Error("CreatorAgent: sheetsService required for initialization");
            CreatorAgent.instance = new CreatorAgent(sheetsService);
        }
        return CreatorAgent.instance;
    }

    public postContent(fuzzyName: string): string {
        if (!fuzzyName) return "Which content did you post? (e.g., 'Posted viral video')";

        const item = this.store.content.find(c => c.hook.toLowerCase().includes(fuzzyName.toLowerCase()) && c.status !== 'Posted');

        if (!item) {
            return `🤔 I couldn't find a pending content idea matching "${fuzzyName}".`;
        }

        this.store.updateContentItem(item.id, {
            status: 'Posted',
            postDate: new Date().toISOString().split('T')[0]
        });

        // Add to pulse for instant gratification heuristic
        const currentPulse = this.store.pulse[this.store.pulse.length - 1];
        if (currentPulse) {
            this.store.addPulseItem({
                weekEnding: currentPulse.weekEnding,
                revenue: currentPulse.revenue, // unchanged
                newUsers: currentPulse.newUsers + 5, // heuristic boost
                topPost: item.hook
            });
        }

        return `🎨 **Published**: "${item.hook}" is now Live! (+5 New Users estimated)`;
    }

    public async draftContent(idea: string, platform: 'TikTok' | 'LinkedIn' | 'Web'): Promise<string> {
        const nextDate = this.autoSchedule();

        let draft = "";
        if (platform === 'TikTok') {
            draft = `**Hook**: "${idea.substring(0, 20)}... (Wait for it)"\n**Body**: 3 Quick tips about ${idea}.\n**CTA**: "Follow for more!"`;
        } else if (platform === 'LinkedIn') {
            draft = `**Hook**: "Unpopular opinion about ${idea}..."\n**Body**: detailed breakdown of why this matters for B2B.\n**CTA**: "What do you think? 👇"`;
        } else {
            draft = `**Headline**: "${idea}"\n**Section 1**: Introduction\n**Section 2**: Deep Dive\n**CTA**: "Subscribe"`;
        }

        // Export to Sheets
        const savedToSheets = await this.sheetsService.addRow({
            date: nextDate,
            platform: platform,
            idea: idea,
            script: draft
        });

        const sheetMsg = savedToSheets ? "✅ **Saved to Google Sheets**" : "⚠️ **Not Saved to Sheets** (Check .env)";

        // Return the formatted response directly to ChatAgent
        return `💡 **Idea Saved & Drafted!**
${sheetMsg}
📅 **Date**: ${nextDate}
📱 **Platform**: ${platform}

${draft}
`;
    }

    private autoSchedule(): string {
        const today = new Date();
        let nextDate = new Date(today);
        nextDate.setDate(today.getDate() + 1); // Start tomorrow

        // Look ahead up to 30 days for an empty slot
        for (let i = 0; i < 30; i++) {
            const dateStr = nextDate.toISOString().split('T')[0];
            // Check if any content is already scheduled for this date
            const conflict = this.store.content.find(c => c.postDate === dateStr && c.status !== 'Posted');

            if (!conflict) {
                return dateStr;
            }
            // If conflict, try next day
            nextDate.setDate(nextDate.getDate() + 1);
        }

        // Fallback: just return tomorrow if everything is full (unlikely)
        const fallback = new Date();
        fallback.setDate(fallback.getDate() + 1);
        return fallback.toISOString().split('T')[0];
    }

    public getContentStats(): string {
        const ideas = this.store.content.filter(c => c.status === 'Idea').length;
        const posted = this.store.content.filter(c => c.status === 'Posted').length;

        return `🎨 **Studio Status**:\n- 📝 Ideas: ${ideas}\n- 🚀 Posted: ${posted}`;
    }
}
