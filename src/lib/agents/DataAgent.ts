/**
 * DataAgent
 * Handles data coverage operations including mock generation, validation, and persistence.
 */

export interface SchemaField {
    type: 'string' | 'number' | 'boolean' | 'date';
    required?: boolean;
}

export interface Schema {
    [key: string]: SchemaField;
}

export class DataAgent {
    private static instance: DataAgent;

    private constructor() { }

    public static getInstance(): DataAgent {
        if (!DataAgent.instance) {
            DataAgent.instance = new DataAgent();
        }
        return DataAgent.instance;
    }

    /**
     * Generates a mock object based on the provided schema.
     */
    public generateMockData<T>(schema: Schema): T {
        const mock: any = {};

        for (const [key, field] of Object.entries(schema)) {
            switch (field.type) {
                case 'string':
                    mock[key] = `Mock ${key} ${Math.floor(Math.random() * 1000)}`;
                    break;
                case 'number':
                    mock[key] = Math.floor(Math.random() * 100);
                    break;
                case 'boolean':
                    mock[key] = Math.random() > 0.5;
                    break;
                case 'date':
                    mock[key] = new Date().toISOString();
                    break;
            }
        }

        return mock as T;
    }

    /**
     * Validates an object against a schema.
     */
    public validateData(data: any, schema: Schema): boolean {
        for (const [key, field] of Object.entries(schema)) {
            if (field.required && (data[key] === undefined || data[key] === null)) {
                console.warn(`Validation Failed: Missing required field ${key}`);
                return false;
            }

            if (data[key] !== undefined) {
                // Simple type checking (could be expanded)
                if (field.type === 'number' && typeof data[key] !== 'number') return false;
                if (field.type === 'boolean' && typeof data[key] !== 'boolean') return false;
                // Date checks etc.
            }
        }
        return true;
    }

    public persistData(key: string, data: any): void {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            console.log(`[DataAgent] Saved ${key}`);
        } catch (e) {
            console.error('[DataAgent] Failed to save data', e);
        }
    }

    public loadData<T>(key: string): T | null {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) as T : null;
        } catch (e) {
            console.error('[DataAgent] Failed to load data', e);
            return null;
        }
    }
}
