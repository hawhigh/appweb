import { useState, useEffect } from 'react';
import { AgencyStore, type PipelineItem, type ContentItem } from '../lib/agents/AgencyStore';

interface EntryModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: 'Task' | 'Content';
}

export function EntryModal({ isOpen, onClose, type }: EntryModalProps) {
    const store = AgencyStore.getInstance();

    // Form State
    const [taskData, setTaskData] = useState<Partial<PipelineItem>>({
        priority: 'Medium',
        agent: 'Architect',
        status: 'Backlog',
        opalBlock: 'Normal'
    });

    const [contentData, setContentData] = useState<Partial<ContentItem>>({
        platform: 'TikTok',
        status: 'Idea'
    });

    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) setError('');
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (type === 'Task') {
            if (!taskData.taskName) {
                setError('Task Name is required.');
                return;
            }
            store.addPipelineItem({
                ...taskData as any,
                // Ensure defaults
                priority: taskData.priority || 'Medium',
                agent: taskData.agent || 'Architect',
                status: 'Backlog',
                opalBlock: taskData.opalBlock || 'Normal'
            });
        } else {
            if (!contentData.hook) {
                setError('Hook / Idea is required.');
                return;
            }
            store.addContentItem({
                ...contentData as any,
                postDate: contentData.postDate || new Date().toISOString().split('T')[0],
                platform: contentData.platform || 'TikTok',
                status: 'Idea',
                storeLink: contentData.storeLink || ''
            });
        }

        onClose();
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h3>New {type}</h3>
                    <button onClick={onClose} className="close-btn">✖</button>
                </div>

                <form onSubmit={handleSubmit} className="entry-form">
                    {type === 'Task' ? (
                        <>
                            <div className="form-group">
                                <label>Task Name</label>
                                <input
                                    autoFocus
                                    placeholder="e.g. Build Login Page"
                                    value={taskData.taskName || ''}
                                    onChange={e => setTaskData({ ...taskData, taskName: e.target.value })}
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Agent</label>
                                    <select
                                        value={taskData.agent}
                                        onChange={e => setTaskData({ ...taskData, agent: e.target.value as any })}
                                    >
                                        <option>Architect</option>
                                        <option>Merchant</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Priority</label>
                                    <select
                                        value={taskData.priority}
                                        onChange={e => setTaskData({ ...taskData, priority: e.target.value as any })}
                                    >
                                        <option>Height</option>
                                        <option>Medium</option>
                                        <option>Low</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Due Date</label>
                                    <input
                                        type="date"
                                        value={taskData.dueDate || ''}
                                        onChange={e => setTaskData({ ...taskData, dueDate: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Opal Block</label>
                                    <select
                                        value={taskData.opalBlock}
                                        onChange={e => setTaskData({ ...taskData, opalBlock: e.target.value as any })}
                                    >
                                        <option>Normal</option>
                                        <option>Deep</option>
                                    </select>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="form-group">
                                <label>Hook / Idea</label>
                                <textarea
                                    autoFocus
                                    placeholder="e.g. Top 3 tips for..."
                                    value={contentData.hook || ''}
                                    onChange={e => setContentData({ ...contentData, hook: e.target.value })}
                                    rows={3}
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Platform</label>
                                    <select
                                        value={contentData.platform}
                                        onChange={e => setContentData({ ...contentData, platform: e.target.value as any })}
                                    >
                                        <option>TikTok</option>
                                        <option>Instagram</option>
                                        <option>YouTube</option>
                                        <option>LinkedIn</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Post Date</label>
                                    <input
                                        type="date"
                                        value={contentData.postDate || ''}
                                        onChange={e => setContentData({ ...contentData, postDate: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Link (Optional)</label>
                                <input
                                    placeholder="https://..."
                                    value={contentData.storeLink || ''}
                                    onChange={e => setContentData({ ...contentData, storeLink: e.target.value })}
                                />
                            </div>
                        </>
                    )}

                    {error && <div className="error-msg">{error}</div>}

                    <div className="modal-actions">
                        <button type="button" onClick={onClose} className="cancel-btn">Cancel</button>
                        <button type="submit" className="submit-btn">Create {type}</button>
                    </div>
                </form>
            </div>

            <style>{`
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.7);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 2000;
                    backdrop-filter: blur(2px);
                }
                .modal-content {
                    background: #1e1e1e;
                    width: 450px;
                    border-radius: 12px;
                    border: 1px solid #333;
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
                    overflow: hidden;
                    animation: slideUp 0.2s ease-out;
                }
                @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                
                .modal-header {
                    padding: 1rem 1.5rem;
                    background: #2563eb;
                    color: white;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .modal-header h3 { margin: 0; font-size: 1.1rem; }
                .close-btn { background: none; border: none; color: white; cursor: pointer; font-size: 1.2rem; }

                .entry-form { padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem; }
                
                .form-group { display: flex; flex-direction: column; gap: 0.5rem; flex: 1; }
                .form-group label { font-size: 0.85rem; color: #888; font-weight: 500; }
                .form-group input, .form-group select, .form-group textarea {
                    padding: 0.6rem;
                    background: #111;
                    border: 1px solid #333;
                    border-radius: 6px;
                    color: white;
                    font-family: inherit;
                    outline: none;
                }
                .form-group input:focus, .form-group select:focus, .form-group textarea:focus {
                    border-color: #2563eb;
                    box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
                }

                .form-row { display: flex; gap: 1rem; }

                .error-msg { color: #fe8989; font-size: 0.9rem; background: rgba(254, 137, 137, 0.1); padding: 0.5rem; border-radius: 4px; }

                .modal-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 1rem;
                    margin-top: 1rem;
                }
                .cancel-btn {
                    padding: 0.6rem 1.2rem;
                    background: transparent;
                    border: 1px solid #444;
                    color: #ccc;
                    border-radius: 6px;
                    cursor: pointer;
                }
                .submit-btn {
                    padding: 0.6rem 1.2rem;
                    background: #2563eb;
                    border: none;
                    color: white;
                    font-weight: 600;
                    border-radius: 6px;
                    cursor: pointer;
                }
                .submit-btn:hover { background: #1d4ed8; }
            `}</style>
        </div>
    );
}
