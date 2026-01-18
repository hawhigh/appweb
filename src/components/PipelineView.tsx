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
        'Backlog': '#555',
        'In Progress': '#d4a017', // Gold/Dark Yellow
        'Testing': '#1e90ff',
        'Live': '#00c853'
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
                                    style={{ color: statusColors[item.status] || '#fff', fontWeight: 'bold' }}
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
                .primary-btn {
                    background: #2563eb;
                    color: white;
                    border: none;
                    padding: 0.5rem 1rem;
                    border-radius: 6px;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                .primary-btn:hover { background: #1d4ed8; }
            `}</style>
        </div>
    );
}
