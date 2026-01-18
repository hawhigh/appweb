/**
 * PlanningAgent
 * Handles project planning, task management, and prioritization.
 */

export interface Task {
    id: string;
    title: string;
    status: 'pending' | 'in-progress' | 'completed';
    priority: 'low' | 'medium' | 'high';
    estimatedHours: number;
}

export interface Plan {
    id: string;
    goal: string;
    tasks: Task[];
    createdAt: string;
}

export class PlanningAgent {
    private static instance: PlanningAgent;
    private plans: Map<string, Plan> = new Map();

    private constructor() { }

    public static getInstance(): PlanningAgent {
        if (!PlanningAgent.instance) {
            PlanningAgent.instance = new PlanningAgent();
            PlanningAgent.instance.loadPlans();
        }
        return PlanningAgent.instance;
    }

    private savePlans() {
        try {
            const data = Array.from(this.plans.entries());
            localStorage.setItem('planning_agent_plans', JSON.stringify(data));
        } catch (e) {
            console.error('Failed to save plans', e);
        }
    }

    private loadPlans() {
        try {
            const data = localStorage.getItem('planning_agent_plans');
            if (data) {
                this.plans = new Map(JSON.parse(data));
            }
        } catch (e) {
            console.error('Failed to load plans', e);
        }
    }

    public createPlan(goal: string): Plan {
        const id = crypto.randomUUID();
        const plan: Plan = {
            id,
            goal,
            tasks: [],
            createdAt: new Date().toISOString(),
        };
        this.plans.set(id, plan);
        this.savePlans();
        return plan;
    }

    public addTask(planId: string, title: string, priority: Task['priority'] = 'medium', hours: number = 1): Plan | null {
        const plan = this.plans.get(planId);
        if (!plan) return null;

        const task: Task = {
            id: crypto.randomUUID(),
            title,
            status: 'pending',
            priority,
            estimatedHours: hours
        };

        plan.tasks.push(task);
        this.savePlans();
        return plan;
    }

    public toggleTask(planId: string, taskId: string): Plan | null {
        const plan = this.plans.get(planId);
        if (!plan) return null;

        const task = plan.tasks.find(t => t.id === taskId);
        if (task) {
            task.status = task.status === 'completed' ? 'pending' : 'completed';
            this.savePlans();
        }
        return plan;
    }

    public prioritizeTasks(planId: string): Task[] | null {
        const plan = this.plans.get(planId);
        if (!plan) return null;

        const priorityMap = { high: 3, medium: 2, low: 1 };

        return [...plan.tasks].sort((a, b) => {
            return priorityMap[b.priority] - priorityMap[a.priority];
        });
    }

    public getCompletionEstimate(planId: string): number {
        const plan = this.plans.get(planId);
        if (!plan) return 0;

        return plan.tasks
            .filter(t => t.status !== 'completed')
            .reduce((acc, t) => acc + t.estimatedHours, 0);
    }

    public getPlan(planId: string): Plan | undefined {
        return this.plans.get(planId);
    }

    public getAllPlans(): Plan[] {
        return Array.from(this.plans.values());
    }
}
