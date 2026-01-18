import { useState } from 'react';
import { AgencyStore, type ContentItem } from '../lib/agents/AgencyStore';
import { EntryModal } from './EntryModal';

export function ContentEngineView() {
    const store = AgencyStore.getInstance();
    const [items, setItems] = useState<ContentItem[]>(store.content);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const refresh = () => setItems([...store.content]);

    return (
        <div className="view-container">
            <div className="toolbar" style={{ justifyContent: 'space-between' }}>
                <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#ccc' }}>Content Studio</h2>
                <button className="primary-btn" onClick={() => setIsModalOpen(true)}>➕ New Idea</button>
            </div>

            <table className="agency-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Platform</th>
                        <th>Hook / Idea</th>
                        <th>Link</th>
                        <th>Status</th>
                        <th>Batch ID</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map(item => (
                        <tr key={item.id}>
                            <td>{item.postDate || 'TBD'}</td>
                            <td>{item.platform}</td>
                            <td>{item.hook}</td>
                            <td><a href={item.storeLink} target="_blank">{item.storeLink}</a></td>
                            <td>
                                <select
                                    value={item.status}
                                    onChange={(e) => { store.updateContentItem(item.id, { status: e.target.value as any }); refresh(); }}
                                >
                                    <option>Idea</option>
                                    <option>Scripting</option>
                                    <option>Filming</option>
                                    <option>Editing</option>
                                    <option>Posted</option>
                                </select>
                            </td>
                            <td>
                                <input
                                    className="bare-input"
                                    value={item.batchId || ''}
                                    placeholder="-"
                                    onChange={(e) => { store.updateContentItem(item.id, { batchId: e.target.value }); refresh(); }}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <EntryModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); refresh(); }}
                type="Content"
            />
        </div>
    );
}
