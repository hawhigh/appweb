import { AgencyStore } from './AgencyStore';
import { AnalystAgent } from './AnalystAgent';
import { StrategistAgent } from './StrategistAgent';
import { CreatorAgent } from './CreatorAgent';
import { MerchantAgent } from './MerchantAgent';

export class ChatAgent {
    private static instance: ChatAgent;
    private store: AgencyStore;
    private analyst: AnalystAgent;
    private strategist: StrategistAgent;
    private creator: CreatorAgent;
    private merchant: MerchantAgent;

    private constructor(creatorAgent: CreatorAgent) {
        this.store = AgencyStore.getInstance();
        this.analyst = AnalystAgent.getInstance();
        this.strategist = StrategistAgent.getInstance();
        this.creator = creatorAgent;
        this.merchant = MerchantAgent.getInstance();
    }

    public static getInstance(creatorAgent?: CreatorAgent): ChatAgent {
        if (!ChatAgent.instance) {
            if (!creatorAgent) throw new Error("ChatAgent: creatorAgent required for initialization");
            ChatAgent.instance = new ChatAgent(creatorAgent);
        }
        return ChatAgent.instance;
    }

    // New Public API for Telegram/External
    public async getChatResponse(input: string): Promise<string> {
        return this.processCommand(input);
    }

    public async processCommand(input: string): Promise<string> {
        const lower = input.toLowerCase().trim();

        // 1. Greeting
        if (lower.includes('hello') || lower.includes('hi') || lower.includes('ahoj') || lower.includes('cau')) {
            return "👋 Ahoj! Tu je tvoj Agency OS. Čo ideme robiť?";
        }

        // --- SMART PARSING (Regex) ---

        // TASK DETECTION
        // Matches: "uloha: text", "task text", "pridaj ulohu text", "new task text"
        const taskMatch = input.match(/^(?:uloha:|task:|úloha:|task|uloha|pridaj ulohu|new task)\s+(.+)/i);
        if (taskMatch) {
            const content = taskMatch[1].trim();

            // Auto-Sorting Logic
            let agent: 'Architect' | 'Merchant' = 'Architect';
            if (content.toLowerCase().includes('faktur') || content.toLowerCase().includes('client') || content.toLowerCase().includes('zmluv')) {
                agent = 'Merchant';
            }

            this.store.addPipelineItem({
                taskName: content,
                agent: agent,
                status: 'Backlog',
                opalBlock: 'Normal',
                priority: 'Medium'
            });
            return `✅ **Manager**: Úloha uložená.\n- Zadanie: "${content}"\n- Pridelené: **${agent}**`;
        }


        // IDEA DETECTION
        // Matches: "napada: text", "idea text", "napad text", "new idea text"
        const ideaMatch = input.match(/^(?:napada:|idea:|napad:|idea|napad|mam napad)\s+(.+)/i);
        if (ideaMatch) {
            const content = ideaMatch[1].trim();

            let platform: 'TikTok' | 'LinkedIn' | 'Web' = 'TikTok';
            if (content.toLowerCase().includes('linkedin') || content.toLowerCase().includes('biznis') || content.toLowerCase().includes('b2b')) platform = 'LinkedIn';
            if (content.toLowerCase().includes('navrh') || content.toLowerCase().includes('web') || content.toLowerCase().includes('site')) platform = 'Web';

            this.store.addContentItem({
                postDate: new Date().toISOString().split('T')[0],
                // @ts-ignore
                platform: platform,
                hook: content,
                storeLink: '',
                status: 'Idea'
            });

            // TRIGGER WORKFLOW
            return this.creator.draftContent(content, platform as any);
        }


        // ANALYSIS DETECTION
        // Matches: "analyze: text", "analyzuj text", "rozober text", "breakdown text"
        const analyzeMatch = input.match(/^(?:analyze:|rozober:|breakdown:|analyzuj|rozober|checkni)\s+(.+)/i);
        if (analyzeMatch) {
            const content = analyzeMatch[1].trim();
            return this.strategist.analyzeTask(content);
        }

        // INVOICE DETECTION
        // Matches: "invoice: text", "faktura text", "vystav fakturu text", "invoice for text"
        const invoiceMatch = input.match(/^(?:invoice:|faktura:|bill:|fakturu pre|invoice for|vystav fakturu)\s+(.+)/i);
        if (invoiceMatch) {
            const content = invoiceMatch[1].trim();
            return this.merchant.generateInvoice(content);
        }

        // COMPLETION DETECTION
        const completeMatch = input.match(/^(?:complete|done|hotovo|dokonci|finish)[:\s]+\s*(.+)/i);
        if (completeMatch) {
            const content = completeMatch[1].trim();
            return this.strategist.completeTask(content);
        }

        // PROJECT DETECTION
        const projectMatch = input.match(/^(?:plan project|novy projekt|new project)\s+(.+)/i);
        if (projectMatch) {
            const projectName = projectMatch[1].trim();
            return this.strategist.scaffoldProject(projectName);
        }


        // --- DIRECT COMMANDS ---

        if (lower === ('prepare data') || lower === ('reset data')) {
            this.store.resetData();
            return "♻️ **System Reset**: Data cleared and re-seeded.";
        }

        // --- AUTOMATION COMMANDS (Specific matches first) ---

        if (lower.includes('weekly report') || lower.includes('tyzdenny report')) {
            return this.analyst.generateWeeklyReport();
        }

        if (lower.includes('daily briefing') || lower.includes('ranny prehlad') || lower.includes('briefing')) {
            const health = this.analyst.getSystemHealth();
            const pulse = this.analyst.analyzePulse();
            const tasks = this.analyst.getOverdueTasks();
            const strategy = this.strategist.planDay();

            return `🌅 **Daily Briefing**\n\n${health}\n\n${pulse}\n\n${tasks}\n\n**Strategy**:\n${strategy}`;
        }

        if (lower.includes('auto pilot') || lower.includes('auto draft') || lower.includes('draft trends')) {
            const trends = this.analyst.getRawTrends();
            const results: string[] = [];

            for (const trend of trends) {
                let platform: 'LinkedIn' | 'TikTok' = 'LinkedIn';
                if (trend.toLowerCase().includes('video') || trend.toLowerCase().includes('short')) platform = 'TikTok';
                await this.creator.draftContent(trend, platform);
                results.push(`- Drafted for **${platform}**: "${trend}"`);
            }

            return `🤖 **Auto-Pilot Executed**\nI've analyzed the market and drafted ${results.length} new posts based on active trends:\n\n${results.join('\n')}\n\nCheck your **Content Engine** or **Google Sheets** for details.`;
        }

        if (lower.includes('check invoices') || lower.includes('pending money') || lower.includes('dlhy')) {
            return this.merchant.checkUnpaidInvoices();
        }

        // MULTI-STEP WORKFLOW: setup campaign
        const campaignMatch = input.match(/^(?:setup campaign|nova kampan)\s+(.+)/i);
        if (campaignMatch) {
            const campaignName = campaignMatch[1].trim();
            const projectRes = this.strategist.scaffoldProject(campaignName);
            const automationRes = await this.processCommand(`auto pilot`);

            return `⚡ **Workflow "Campaign Sprint" Executed**\n\n${projectRes}\n\n${automationRes}\n\n**Next Step**: Your pipeline is primed for "${campaignName}".`;
        }

        // --- DIRECT COMMANDS (Generic fallback) ---

        if (lower.includes('clean desk') || lower.includes('upratať') || lower.includes('cleanup')) {
            const completed = this.store.pipeline.filter(t => t.status === 'Live');
            completed.forEach(t => this.store.archiveTask(t.id));
            return `🧹 **Clean Desk Protocol**:\nArchived ${completed.length} completed tasks. Pipeline is clean.`;
        }

        if (lower.includes('status') || lower.includes('pulse') || lower.includes('report') || lower.includes('analysis') || lower === 'info') {
            return this.analyst.analyzePulse();
        }

        // Help / Fallback
        return `🤖 **Manager**: Try writing naturally:\n- "uloha kupit mlieko"\n- "napad na video o AI"\n- "analyzuj login page"\n- "faktura pre Google"`;
    }

    public async processMessage(input: string): Promise<string> {
        return this.processCommand(input);
    }
}
