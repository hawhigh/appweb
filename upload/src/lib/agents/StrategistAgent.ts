import { AgencyStore } from './AgencyStore';

export class StrategistAgent {
    private static instance: StrategistAgent;
    private store: AgencyStore;

    private constructor() {
        this.store = AgencyStore.getInstance();
    }

    public static getInstance(): StrategistAgent {
        if (!StrategistAgent.instance) {
            StrategistAgent.instance = new StrategistAgent();
        }
        return StrategistAgent.instance;
    }

    public suggestPriorities(): string {
        const backlog = this.store.pipeline.filter(t => t.status === 'Backlog');

        if (backlog.length === 0) return "Backlog is empty! Amazing work. Maybe add some new ideas?";

        // Heuristic: High priority first
        const highPri = backlog.filter(t => t.priority === 'High');

        if (highPri.length > 0) {
            return `♟️ **Strategist Advice**: Crush the ${highPri.length} HIGH priority items first. Start with: "**${highPri[0].taskName}**".`;
        }

        return `♟️ **Strategy**: All critical tasks cleared. Pick the oldest task from backlog: "**${backlog[0].taskName}**"`;
    }

    public recommendMode(): string {
        // Count tasks by type
        const devTasks = this.store.pipeline.filter(t => t.status !== 'Live' && (t.agent === 'Architect' || t.agent === 'Merchant')).length;
        const creativeTasks = this.store.content.filter(c => c.status !== 'Posted').length;

        if (devTasks > creativeTasks) {
            return `♟️ **Mode Rec**: You have ${devTasks} pending build tasks. Switch to **Workbench** mode and ship code.`;
        } else if (creativeTasks > devTasks) {
            return `♟️ **Mode Rec**: You have ${creativeTasks} content ideas. Switch to **Studio** mode and create.`;
        }

        return "♟️ **Mode Rec**: Balanced load. Stay in **Normal** mode or pick your poison.";
    }

    public planDay(): string {
        const highPri = this.store.pipeline.find(t => t.priority === 'High' && t.status !== 'Live');
        const idea = this.store.content.find(c => c.status === 'Idea');
        const revenue = this.store.pulse.length > 0 ? this.store.pulse[this.store.pulse.length - 1].revenue : 0;

        let plan = `♟️ **Daily Battle Plan**:\n`;

        // 1. Firefighting
        if (highPri) {
            plan += `1. 🔥 **Priority**: Squash "${highPri.taskName}".\n`;
        } else {
            plan += `1. ✅ **Maintenance**: Review 'Live' tasks.\n`;
        }

        // 2. Growth
        if (idea) {
            plan += `2. 🎬 **Growth**: Script video for "${idea.hook}".\n`;
        } else {
            plan += `2. 🧠 **Brainstorm**: Add 3 new content ideas.\n`;
        }

        // 3. Money
        plan += `3. 💰 **Revenue**: Goal is $${Math.floor(revenue * 1.1)}. Check interactions.`;

        return plan;
    }

    public scaffoldProject(projectName: string): string {
        if (!projectName) return "Please name your project. e.g., 'Plan project Omega'.";

        // 1. Create Project
        const newProject = {
            name: projectName,
            status: 'Active' as const,
            deadline: new Date(new Date().setDate(new Date().getDate() + 14)).toISOString().split('T')[0]
        };
        this.store.addProject(newProject);

        // Find the project we just added (last one with this name, or by ID if we returned it, but addProject is void currently)
        // store.addProject generates an ID. Let's assume we can find it or modify store to return it.
        // Since addProject is void, we'll search for it.
        const createdProject = this.store.projects.find(p => p.name === projectName);
        const projectId = createdProject ? createdProject.id : undefined;

        const tasks = [
            { name: `Design DB Schema for ${projectName}`, agent: 'Architect', priority: 'High' },
            { name: `Setup GitHub Repo for ${projectName}`, agent: 'Architect', priority: 'High' },
            { name: `Define MVP Features for ${projectName}`, agent: 'Manager', priority: 'Medium' },
            { name: `Write Landing Page Copy for ${projectName}`, agent: 'Merchant', priority: 'Medium' },
        ];

        tasks.forEach(t => {
            this.store.addPipelineItem({
                taskName: t.name,
                // @ts-ignore
                agent: t.agent,
                status: 'Backlog',
                priority: t.priority as any,
                opalBlock: 'Deep',
                projectId: projectId
            });
        });

        const idea = `Launch ${projectName}: Behind the scenes`;
        this.store.addContentItem({
            postDate: new Date().toISOString().split('T')[0],
            // @ts-ignore
            platform: 'LinkedIn',
            hook: idea,
            storeLink: '',
            status: 'Idea'
        });

        return `🏗️ **Project Scaffolding Complete** for "${projectName}".\n- Created **Project** entity.\n- Created ${tasks.length} Pipeline tasks linked to it.\n- Added 1 Content Idea ("${idea}").\n\nCheck the **Projects** tab!`;
    }

    public analyzeTask(taskName: string): string {
        if (!taskName) return "Which task should I analyze? (e.g., 'Analyze Fix Login')";

        // 1. Find Task
        const task = this.store.pipeline.find(t => t.taskName.toLowerCase().includes(taskName.toLowerCase()));
        if (!task) return `🤔 Task "${taskName}" not found in Pipeline.`;

        // 2. "Gemini" Simulation (Breakdown)
        // In a real app, this would call the Gemini API.
        // Here we simulate the breakdown based on keywords.
        let steps = [
            "Research requirements",
            "Draft implementation plan",
            "Execute code changes",
            "Verify and deploy"
        ];

        if (taskName.toLowerCase().includes('video') || taskName.toLowerCase().includes('content')) {
            steps = [
                "Script the hook and body",
                "Film raw footage (A-Roll)",
                "Edit with captions (CapCut)",
                "Create thumbnail and post"
            ];
        } else if (taskName.toLowerCase().includes('bug') || taskName.toLowerCase().includes('fix')) {
            steps = [
                "Reproduce the issue locally",
                "Identify root cause in code",
                "Apply fix and regression test",
                "Push hotfix to production"
            ];
        }

        // 3. Create Subtasks (Linked to same project if exists)
        steps.forEach(step => {
            this.store.addPipelineItem({
                taskName: `${step} (${task.taskName})`,
                agent: 'Architect',
                status: 'Backlog',
                priority: 'Medium',
                opalBlock: 'Normal',
                projectId: task.projectId
            });
        });

        return `🧬 **Deep Analysis Complete**:\nBroken down "${task.taskName}" into ${steps.length} executable steps.\n\n${steps.map(s => `- ${s}`).join('\n')}`;
    }

    public completeTask(fuzzyName: string): string {
        if (!fuzzyName) return "Which task did you finish? (e.g., 'Finish Database')";

        const task = this.store.pipeline.find(t => t.taskName.toLowerCase().includes(fuzzyName.toLowerCase()) && t.status !== 'Live');

        if (!task) {
            return `🤔 I couldn't find an active task matching "${fuzzyName}".`;
        }

        this.store.updatePipelineItem(task.id, {
            status: 'Live'
        });

        return `🚀 **Deployed**: "${task.taskName}" is now LIVE. Great work!`;
    }
}
