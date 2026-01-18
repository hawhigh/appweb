import { useState } from 'react';
import { AgencyStore, type PipelineItem } from '../lib/agents/AgencyStore';
import { EntryModal } from './EntryModal';

export function PipelineView() {
    const store = AgencyStore.getInstance();
    const [items, setItems] = useState<PipelineItem[]>(store.pipeline);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const refresh = () => setItems([...store.pipeline]);

    const getBorderColor = (item: PipelineItem) => {
        if (item.priority === 'High') {
            // Check overdue
            if (item.dueDate && new Date(item.dueDate) < new Date()) {
                return '4px solid #ff0000'; // RED for Overdue
            }
            return '4px solid #ff8800'; // Orange for High
        }
        if (item.status === 'Live') return '4px solid #00cc66'; // Green for Live
        if (item.priority === 'Medium') return '4px solid orange';
        return '4px solid green';
    };

    const statusColors: Record<string, string> = {
        'Backlog': '#444',
        'In Progress': 'var(--primary)',
        'Testing': '#1e90ff',
        'Live': 'var(--accent)'
    };

    return (
        <div className="view-container">
            <div className="toolbar" style={{ justifyContent: 'space-between' }}>
                <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#ccc' }}>Pipeline</h2>
                <button className="primary-btn" onClick={() => setIsModalOpen(true)}>➕ New Task</button>
            </div>

            <table className="agency-table">
                <thead>
                    <tr>
                        <th>Task Name</th>
                        <th>Agent</th>
                        <th>Status</th>
                        <th>Opal Block</th>
                        <th>Priority</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map(item => (
                        <tr key={item.id} style={{ borderLeft: getBorderColor(item) }}>
                            <td>{item.taskName}</td>
                            <td className={`agent-tag ${item.agent.toLowerCase()}`}>{item.agent}</td>
                            <td>
                                <select
                                    value={item.status}
                                    onChange={(e) => { store.updatePipelineItem(item.id, { status: e.target.value as any }); refresh(); }}
                                    style={{
                                        color: statusColors[item.status] || '#fff',
                                        fontWeight: '800',
                                    }}
                                >
                                    <option>Backlog</option>
                                    <option>In Progress</option>
                                    <option>Testing</option>
                                    <option>Live</option>
                                </select>
                            </td>
                            <td>{item.opalBlock}</td>
                            <td>{item.priority}</td>
                            <td>
                                <button className="icon-btn" onClick={() => { store.deletePipelineItem(item.id); refresh(); }}>🗑️</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <EntryModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); refresh(); }}
                type="Task"
            />

            <style>{`
                .agent-tag {
                    font-size: 0.7rem;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .agent-tag.analyst { color: #0ea5e9; }
                .agent-tag.creator { color: #db2777; }
                .agent-tag.strategist { color: var(--primary); }
            `}</style>
        </div >
    );
}
