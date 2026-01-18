import { AgencyStore } from './AgencyStore';

export class AnalystAgent {
    private static instance: AnalystAgent;
    private store: AgencyStore;

    private constructor() {
        this.store = AgencyStore.getInstance();
    }

    public static getInstance(): AnalystAgent {
        if (!AnalystAgent.instance) {
            AnalystAgent.instance = new AnalystAgent();
        }
        return AnalystAgent.instance;
    }

    public analyzePulse(): string {
        const pulseData = this.store.pulse;
        if (pulseData.length === 0) return "No sufficient data to analyze trends yet.";

        const lastWeek = pulseData[pulseData.length - 1];
        // simple heuristic: if revenue > 1000, it's good.
        const revStatus = lastWeek.revenue > 1000 ? "Healthy 🟢" : "Needs Attention 🔴";

        return `📊 **Analyst Report**\n- Revenue Status: ${revStatus} ($${lastWeek.revenue})\n- Growth: +${lastWeek.newUsers} users\n- Top Performer: "${lastWeek.topPost}"`;
    }

    public generateWeeklyReport(): string {
        const pulse = this.store.pulse;
        if (pulse.length < 2) return "📊 **Weekly Report**: Not enough historical data yet. Check back next week!";

        const current = pulse[pulse.length - 1];
        const previous = pulse[pulse.length - 2];

        const revChange = ((current.revenue - previous.revenue) / previous.revenue) * 100;
        const userChange = ((current.newUsers - previous.newUsers) / previous.newUsers) * 100;

        const revIcon = revChange >= 0 ? '📈' : '📉';
        const userIcon = userChange >= 0 ? '🚀' : '🔻';

        return `📑 **Weekly Performance Report** (Week Ending ${current.weekEnding})
        
---
💰 **Revenue**: $${current.revenue} (${revIcon} ${revChange.toFixed(1)}%)
👥 **New Users**: ${current.newUsers} (${userIcon} ${userChange.toFixed(1)}%)
🏆 **Top Content**: "${current.topPost}"

**Analyst Insight**: ${revChange > 5 ? 'Momentum is strong. Scale ad spend.' : 'Growth is stalling. Optimize retention.'}`;
    }

    public getOverdueTasks(): string {
        const now = new Date();
        const overdue = this.store.pipeline.filter(t => t.dueDate && new Date(t.dueDate) < now && t.status !== 'Live');

        if (overdue.length === 0) return "✅ No overdue tasks found. We are on track.";

        const taskNames = overdue.map(t => `- ${t.taskName} (${t.agent})`).join('\n');
        return `⚠️ **Overdue Items Detected**:\n${taskNames}`;
    }

    public getSystemHealth(): string {
        let score = 100;
        const report: string[] = [];

        // 1. Overdue Tasks (-10 each, max -30)
        const now = new Date();
        const overdueCount = this.store.pipeline.filter(t => t.dueDate && new Date(t.dueDate) < now && t.status !== 'Live').length;
        if (overdueCount > 0) {
            const penalty = Math.min(overdueCount * 10, 30);
            score -= penalty;
            report.push(`⚠️ -${penalty}pts: ${overdueCount} overdue task(s).`);
        }

        // 2. Empty Pipeline (-20)
        if (this.store.pipeline.length < 3) {
            score -= 20;
            report.push(`📉 -20pts: Pipeline is thin (<3 items).`);
        }

        // 3. Revenue Health (Example)
        const lastWeek = this.store.pulse.length > 0 ? this.store.pulse[this.store.pulse.length - 1] : null;
        if (!lastWeek || lastWeek.revenue < 500) {
            score -= 10;
            report.push(`💸 -10pts: Low revenue momentum.`);
        }

        const color = score > 80 ? '🟢' : score > 50 ? '🟡' : '🔴';

        if (score === 100) return `🟢 **System Health: 100%**\nPerfect score. You are operating at peak efficiency.`;

        return `${color} **System Health: ${score}%**\n${report.join('\n')}`;
    }

    public getRawTrends(): string[] {
        // Simulates fetching trends from Google Trends / Twitter
        const trends = [
            "AI Agents for SMBs",
            "Micro-SaaS 2026",
            "React 21 Features",
            "Sustainable Tech",
            "DeepSeek vs OpenAI",
            "Local-First Software"
        ];
        // Randomly pick 3
        return trends.sort(() => 0.5 - Math.random()).slice(0, 3);
    }

    public checkTrends(): string {
        const picked = this.getRawTrends();

        picked.forEach(trend => {
            this.store.addContentItem({
                postDate: new Date().toISOString().split('T')[0],
                // @ts-ignore
                platform: 'LinkedIn',
                hook: `Trend Watch: Why ${trend} is exploding`,
                storeLink: '',
                status: 'Idea'
            });
        });

        return `📈 **Trend Watcher Executed**:\nAdded ${picked.length} new trending topics to your Content Idea list.\n\n${picked.map(t => `- ${t}`).join('\n')}`;
    }
}
