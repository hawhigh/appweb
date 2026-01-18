import { useState } from 'react';
import { AgencyStore, type Project } from '../lib/agents/AgencyStore';

export function ProjectView() {
    const store = AgencyStore.getInstance();
    const [projects, setProjects] = useState<Project[]>(store.projects);
    const [newProject, setNewProject] = useState('');

    const refresh = () => setProjects([...store.projects]);

    const addProject = () => {
        if (!newProject) return;
        store.addProject({
            name: newProject,
            status: 'Active',
            deadline: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0]
        });
        setNewProject('');
        refresh();
    };

    const getProgress = (projectId: string) => {
        const tasks = store.pipeline.filter(t => t.projectId === projectId);
        if (tasks.length === 0) return 0;
        const passed = tasks.filter(t => t.status === 'Live').length;
        return Math.floor((passed / tasks.length) * 100);
    };

    return (
        <div className="view-container">
            <div className="toolbar">
                <h2 style={{ color: '#ccc', margin: 0 }}>Active Projects</h2>
                <div style={{ flex: 1 }}></div>
                <input
                    placeholder="New Project..."
                    value={newProject}
                    onChange={(e) => setNewProject(e.target.value)}
                />
                <button className="primary-btn" onClick={addProject}>Start Project</button>
            </div>

            <div className="project-grid">
                {projects.map(proj => {
                    const progress = getProgress(proj.id);
                    return (
                        <div key={proj.id} className="project-card">
                            <div className="project-header">
                                <h3>{proj.name}</h3>
                                <span className={`status-badge ${proj.status.toLowerCase().replace(' ', '-')}`}>{proj.status}</span>
                            </div>

                            <div className="progress-section">
                                <div className="progress-labels">
                                    <span>Progress</span>
                                    <span>{progress}%</span>
                                </div>
                                <div className="progress-bar">
                                    <div className="fill" style={{ width: `${progress}%`, background: progress === 100 ? '#00c853' : '#2563eb' }}></div>
                                </div>
                            </div>

                            <div className="project-meta">
                                <span>📅 {proj.deadline || 'No Deadline'}</span>
                                <button className="del-btn" onClick={() => { store.deleteProject(proj.id); refresh(); }}>🗑️</button>
                            </div>
                        </div>
                    );
                })}
            </div>

            <style>{`
                .project-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 1.5rem;
                    padding: 1rem 0;
                }
                .project-card {
                    background: #111;
                    border: 1px solid #333;
                    border-radius: 12px;
                    padding: 1.5rem;
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                    transition: all 0.2s;
                }
                .project-card:hover { border-color: #555; transform: translateY(-2px); }

                .project-header { display: flex; justify-content: space-between; align-items: start; }
                .project-header h3 { margin: 0; color: white; font-size: 1.1rem; }
                
                .status-badge { 
                    font-size: 0.75rem; padding: 0.2rem 0.6rem; border-radius: 12px; font-weight: 600; 
                }
                .status-badge.active { background: rgba(37, 99, 235, 0.2); color: #60a5fa; border: 1px solid #2563eb; }
                .status-badge.on-hold { background: rgba(234, 179, 8, 0.2); color: #facc15; border: 1px solid #eab308; }
                .status-badge.done { background: rgba(34, 197, 94, 0.2); color: #4ade80; border: 1px solid #22c55e; }

                .progress-labels { display: flex; justify-content: space-between; font-size: 0.85rem; color: #888; margin-bottom: 0.5rem; }
                .progress-bar { height: 6px; background: #333; border-radius: 3px; overflow: hidden; }
                .fill { height: 100%; transition: width 0.5s ease; }

                .project-meta { display: flex; justify-content: space-between; align-items: center; color: #666; font-size: 0.85rem; }
                
                .primary-btn {
                    background: #2563eb;
                    color: white;
                    border: none;
                    padding: 0.5rem 1rem;
                    border-radius: 6px;
                    font-weight: 600;
                    cursor: pointer;
                }
                .del-btn { background: none; border: none; cursor: pointer; opacity: 0.5; }
                .del-btn:hover { opacity: 1; }
            `}</style>
        </div>
    );
}
