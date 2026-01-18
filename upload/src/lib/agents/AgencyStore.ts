/**
 * AgencyStore
 * The "Brain" of the Lean Agency System.
 * Manages state for Pipeline, Content, Assets, and Pulse.
 * Persists to LocalStorage.
 */

// --- NEW INTERFACES (Phase 6) ---
export interface Client {
    id: string;
    name: string;
    company: string;
    status: 'Lead' | 'Negotiation' | 'Active' | 'Churned';
    dealValue: number;
    email?: string;
}

export interface Project {
    id: string;
    name: string;
    clientId?: string;
    status: 'Active' | 'On Hold' | 'Done';
    deadline?: string;
}

export interface PipelineItem {
    id: string;
    taskName: string;
    agent: 'Architect' | 'Merchant';
    status: 'Backlog' | 'In Progress' | 'Testing' | 'Live';
    opalBlock: 'Deep' | 'Normal';
    priority: 'Low' | 'Medium' | 'High';
    dueDate?: string;
    projectId?: string; // Link to Project
}

export interface ContentItem {
    id: string;
    postDate: string;
    platform: 'Instagram' | 'TikTok' | 'YouTube' | 'LinkedIn' | 'Web';
    hook: string;
    storeLink: string;
    status: 'Idea' | 'Scripting' | 'Filming' | 'Editing' | 'Posted';
    batchId?: string;
}

export interface AssetItem {
    id: string;
    name: string;
    type: 'Logo' | 'Code' | 'Video' | 'Document';
    link: string;
    keywords: string[];
}

export interface PulseItem {
    id: string;
    weekEnding: string;
    revenue: number;
    newUsers: number;
    topPost: string;
}

export class AgencyStore {
    private static instance: AgencyStore;

    public pipeline: PipelineItem[] = [];
    public content: ContentItem[] = [];
    public assets: AssetItem[] = [];
    public pulse: PulseItem[] = [];
    public clients: Client[] = []; // CRM
    public projects: Project[] = []; // PM

    // Focus Mode State
    public currentMode: 'Workbench' | 'Studio' | 'Normal' = 'Normal';

    private constructor() {
        this.load();
        // Seed data if empty
        if (this.pipeline.length === 0) this.seedData();
    }

    public static getInstance(): AgencyStore {
        if (!AgencyStore.instance) {
            AgencyStore.instance = new AgencyStore();
        }
        return AgencyStore.instance;
    }

    private save() {
        try {
            localStorage.setItem('agency_store', JSON.stringify({
                pipeline: this.pipeline,
                content: this.content,
                assets: this.assets,
                pulse: this.pulse,
                clients: this.clients,
                projects: this.projects
            }));
        } catch (e) {
            console.error('Failed to save AgencyStore', e);
        }
    }

    private load() {
        try {
            const data = localStorage.getItem('agency_store');
            if (data) {
                const parsed = JSON.parse(data);
                this.pipeline = parsed.pipeline || [];
                this.content = parsed.content || [];
                this.assets = parsed.assets || [];
                this.pulse = parsed.pulse || [];
                this.clients = parsed.clients || [];
                this.projects = parsed.projects || [];
            }
        } catch (e) {
            console.error('Failed to load AgencyStore', e);
        }
    }

    private seedData() {
        this.pipeline = [
            { id: '1', taskName: 'Build Lean Agency Dashboard', agent: 'Architect', status: 'In Progress', opalBlock: 'Deep', priority: 'High', dueDate: new Date().toISOString(), projectId: '1' },
            { id: '2', taskName: 'Update Shop UI', agent: 'Merchant', status: 'Backlog', opalBlock: 'Normal', priority: 'Medium', projectId: '2' }
        ];
        this.content = [
            { id: '1', postDate: '2026-01-20', platform: 'TikTok', hook: 'How I built my agency in 4 hours', storeLink: '/blueprint', status: 'Idea', batchId: 'A1' }
        ];
        this.assets = [
            { id: '1', name: 'Brand Guide', type: 'Document', link: 'gdrive.com/brand', keywords: ['colors', 'fonts'] }
        ];
        this.pulse = [
            { id: '1', weekEnding: '2026-01-16', revenue: 1200, newUsers: 45, topPost: 'Viral TikTok #4' }
        ];
        // New Seed Data
        this.clients = [
            { id: '1', name: 'John Doe', company: 'Acme Corp', status: 'Active', dealValue: 5000, email: 'john@acme.com' },
            { id: '2', name: 'StartUp Inc', company: 'Stealth AI', status: 'Negotiation', dealValue: 12000 }
        ];
        this.projects = [
            { id: '1', name: 'Agency OS V1', status: 'Active', deadline: '2026-02-01' },
            { id: '2', name: 'Client Website', clientId: '1', status: 'Active', deadline: '2026-01-25' }
        ];
        this.save();
    }

    // --- CRUD Operations ---

    // Pipeline
    public addPipelineItem(item: Omit<PipelineItem, 'id'>) {
        this.pipeline.push({ ...item, id: crypto.randomUUID() });
        this.save();
    }
    public updatePipelineItem(id: string, updates: Partial<PipelineItem>) {
        const item = this.pipeline.find(i => i.id === id);
        if (item) {
            const oldStatus = item.status;
            Object.assign(item, updates);

            // --- AUTOMATION 1: Revenue Trigger ---
            // If Task moved to 'Live' and is Merchant/Architect, gen revenue
            if (updates.status === 'Live' && oldStatus !== 'Live') {
                const amount = Math.floor(Math.random() * 400) + 100; // $100-$500
                // Add to current week's pulse or create new
                const today = new Date().toISOString().split('T')[0];
                let pulse = this.pulse[this.pulse.length - 1];
                if (!pulse) {
                    this.addPulseItem({ weekEnding: today, revenue: amount, newUsers: 0, topPost: '-' });
                } else {
                    pulse.revenue += amount;
                }
            }

            // --- AUTOMATION 2: Auto-Project Completion ---
            if (item.projectId) {
                const projectTasks = this.pipeline.filter(t => t.projectId === item.projectId);
                const allDone = projectTasks.every(t => t.status === 'Live');
                const project = this.projects.find(p => p.id === item.projectId);

                if (project && allDone && projectTasks.length > 0) {
                    project.status = 'Done';
                } else if (project && !allDone && project.status === 'Done') {
                    project.status = 'Active'; // Re-open if task moves back
                }
            }

            this.save();
        }
    }
    public deletePipelineItem(id: string) {
        this.pipeline = this.pipeline.filter(i => i.id !== id);
        this.save();
    }

    public archiveTask(id: string) {
        // For MVP, archiving = deleting from active view
        this.deletePipelineItem(id);
    }

    // Content
    public addContentItem(item: Omit<ContentItem, 'id'>) {
        this.content.push({ ...item, id: crypto.randomUUID() });
        this.save();
    }
    public updateContentItem(id: string, updates: Partial<ContentItem>) {
        const item = this.content.find(i => i.id === id);
        if (item) {
            Object.assign(item, updates);
            this.save();
        }
    }

    // Assets
    public addAssetItem(item: Omit<AssetItem, 'id'>) {
        this.assets.push({ ...item, id: crypto.randomUUID() });
        this.save();
    }
    public deleteAssetItem(id: string) {
        this.assets = this.assets.filter(i => i.id !== id);
        this.save();
    }

    // Pulse
    public addPulseItem(item: Omit<PulseItem, 'id'>) {
        this.pulse.push({ ...item, id: crypto.randomUUID() });
        this.save();
    }

    // Clients
    public addClient(item: Omit<Client, 'id'>) {
        this.clients.push({ ...item, id: crypto.randomUUID() });
        this.save();
    }
    public updateClient(id: string, updates: Partial<Client>) {
        const client = this.clients.find(i => i.id === id);
        if (client) {
            const oldStatus = client.status;
            Object.assign(client, updates);

            // --- AUTOMATION 3: Sales Handoff ---
            // Lead -> Active : Auto-create "Onboarding" Project
            if (updates.status === 'Active' && oldStatus !== 'Active') {
                // Check if project exists
                const exists = this.projects.find(p => p.clientId === client.id && p.name.includes('Onboarding'));
                if (!exists) {
                    // Create Project
                    const newProjId = crypto.randomUUID();
                    this.projects.push({
                        id: newProjId,
                        name: `${client.company} Onboarding`,
                        clientId: client.id,
                        status: 'Active',
                        deadline: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split('T')[0]
                    });

                    // Add Standard Tasks
                    const tasks = [
                        { name: 'Send Contract', agent: 'Merchant', priority: 'High' },
                        { name: 'Setup Slack Channel', agent: 'Manager', priority: 'Medium' },
                        { name: 'Kickoff Call', agent: 'Strategist', priority: 'High' }
                    ];

                    tasks.forEach(t => {
                        this.pipeline.push({
                            id: crypto.randomUUID(),
                            taskName: t.name,
                            // @ts-ignore
                            agent: t.agent,
                            status: 'Backlog',
                            priority: t.priority as any,
                            opalBlock: 'Normal',
                            projectId: newProjId
                        });
                    });
                }
            }

            this.save();
        }
    }
    public deleteClient(id: string) {
        this.clients = this.clients.filter(i => i.id !== id);
        this.save();
    }

    // Projects
    public addProject(item: Omit<Project, 'id'>) {
        this.projects.push({ ...item, id: crypto.randomUUID() });
        this.save();
    }
    public updateProject(id: string, updates: Partial<Project>) {
        const item = this.projects.find(i => i.id === id);
        if (item) {
            Object.assign(item, updates);
            this.save();
        }
    }
    public deleteProject(id: string) {
        this.projects = this.projects.filter(i => i.id !== id);
        this.save();
    }

    public resetData() {
        // Clear all arrays
        this.pipeline = [];
        this.content = [];
        this.assets = [];
        this.pulse = [];
        this.clients = [];
        this.projects = [];

        // Re-seed with initial data
        this.seedData();

        // Force save to overwrite local storage
        this.save();
    }

    // --- MANAGER AGENT ACTIONS ---

    public cleanDesk() {
        // 1. Archive Pipeline (Status: 'Live')
        const completedTasks = this.pipeline.filter(t => t.status === 'Live');
        if (completedTasks.length > 0) {
            console.log(`[Manager] Archiving ${completedTasks.length} tasks.`);
            // In a real app, we would push to an 'Archive' store.
            // For this MVP, we just remove them from the active view to "Clear the Desk".
            this.pipeline = this.pipeline.filter(t => t.status !== 'Live');
        }

        // 2. Archive Content (Status: 'Posted')
        const postedContent = this.content.filter(c => c.status === 'Posted');
        if (postedContent.length > 0) {
            console.log(`[Manager] Archiving ${postedContent.length} posts.`);
            this.content = this.content.filter(c => c.status !== 'Posted');
        }

        this.save();
    }
}
