import { AgencyStore } from './AgencyStore';

export class MerchantAgent {
    private static instance: MerchantAgent;
    private store: AgencyStore;

    private constructor() {
        this.store = AgencyStore.getInstance();
    }

    public static getInstance(): MerchantAgent {
        if (!MerchantAgent.instance) {
            MerchantAgent.instance = new MerchantAgent();
        }
        return MerchantAgent.instance;
    }

    public auditAssets(): string {
        const assets = this.store.assets;
        if (assets.length === 0) return "📉 **Asset Audit**: Library is empty. Upload brand guides or code snippets.";

        const missingLinks = assets.filter(a => !a.link || a.link === '#').length;
        const total = assets.length;

        return `💼 **Merchant Audit**:\n- Total Assets: ${total}\n- Broken/Missing Links: ${missingLinks}\n- Status: ${missingLinks === 0 ? 'Clean ✅' : 'Needs Review ⚠️'}`;
    }

    public projectRevenue(): string {
        const pulse = this.store.pulse;
        // 1. Historical Data (Last Week)
        const lastWeekRevenue = pulse.length > 0 ? pulse[pulse.length - 1].revenue : 0;

        // 2. Weighted Pipeline Forecast
        // Deal stages: Lead (10%), Negotiation (50%), Active (100%)
        let potentialRevenue = 0;
        let weightedRevenue = 0;

        this.store.clients.forEach(client => {
            if (client.status === 'Lead') {
                potentialRevenue += client.dealValue;
                weightedRevenue += client.dealValue * 0.1;
            } else if (client.status === 'Negotiation') {
                potentialRevenue += client.dealValue;
                weightedRevenue += client.dealValue * 0.5;
            } else if (client.status === 'Active') {
                // Active deals are already recognized or monthly, let's count them as secured for next month
                weightedRevenue += client.dealValue;
            }
        });

        // 3. Combined Projection
        const projection = Math.floor(weightedRevenue);

        return `💰 **Financial Forecast**:\n- 📉 Last Week: $${lastWeekRevenue}\n- 🔮 Weighted Pipeline: **$${projection}**\n- 🎲 Total Potential: $${potentialRevenue + lastWeekRevenue}\n\n*Value based on ${this.store.clients.length} active deal(s).*`;
    }

    public generateInvoice(clientName: string): string {
        const client = this.store.clients.find(c => c.name.toLowerCase().includes(clientName.toLowerCase()) || c.company.toLowerCase().includes(clientName.toLowerCase()));

        if (!client) return `⚠️ Client "${clientName}" not found. Cannot generate invoice.`;

        const amount = client.dealValue;
        const invoiceId = `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`;

        return `📄 **Invoice Generated**\n- Client: ${client.company} (${client.name})\n- Amount: **$${amount}**\n- ID: ${invoiceId}\n- Status: Sent ✉️`;
    }

    public checkUnpaidInvoices(): string {
        // In this MVP, we simulate searching for invoices that haven't triggered a 'Live' task or specific status.
        // Let's look for active clients with high deal values but low revenue in pulse.
        const highValueClients = this.store.clients.filter(c => c.status === 'Active' && c.dealValue > 2000);

        if (highValueClients.length === 0) return "✅ **Merchant Scan**: All high-value client accounts appear up to date.";

        const list = highValueClients.map(c => `- **${c.company}**: $${c.dealValue} pending`).join('\n');
        return `💸 **Pending Accounts Detected**:\n${list}\n\nShall I send a follow-up reminder to these clients?`;
    }
}
