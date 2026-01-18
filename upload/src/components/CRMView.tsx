import { useState } from 'react';
import { AgencyStore, type Client } from '../lib/agents/AgencyStore';

export function CRMView() {
    const store = AgencyStore.getInstance();
    const [clients, setClients] = useState<Client[]>(store.clients);
    const [newClient, setNewClient] = useState('');

    const refresh = () => setClients([...store.clients]);

    const addClient = () => {
        if (!newClient) return;
        store.addClient({
            name: newClient,
            company: 'New Lead',
            status: 'Lead',
            dealValue: 0
        });
        setNewClient('');
        refresh();
    };

    const StatusColumn = ({ status, items }: { status: Client['status'], items: Client[] }) => (
        <div className="crm-column">
            <div className="column-header">
                <h4>{status}</h4>
                <span className="count">{items.length}</span>
            </div>
            <div className="column-body">
                {items.map(client => (
                    <div key={client.id} className="client-card">
                        <div className="card-top">
                            <h5>{client.name}</h5>
                            <span className="client-value">${client.dealValue.toLocaleString()}</span>
                        </div>
                        <p className="company-name">{client.company}</p>

                        <div className="card-actions">
                            <select
                                value={client.status}
                                onChange={(e) => { store.updateClient(client.id, { status: e.target.value as any }); refresh(); }}
                            >
                                <option>Lead</option>
                                <option>Negotiation</option>
                                <option>Active</option>
                                <option>Churned</option>
                            </select>
                            <button className="del-btn" onClick={() => { store.deleteClient(client.id); refresh(); }}>🗑️</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="view-container">
            <div className="toolbar">
                <h2 style={{ color: '#ccc', margin: 0 }}>CRM Pipeline</h2>
                <div style={{ flex: 1 }}></div>
                <input
                    placeholder="New Client Name..."
                    value={newClient}
                    onChange={(e) => setNewClient(e.target.value)}
                />
                <button className="primary-btn" onClick={addClient}>Add Lead</button>
            </div>

            <div className="kanban-board">
                <StatusColumn status="Lead" items={clients.filter(c => c.status === 'Lead')} />
                <StatusColumn status="Negotiation" items={clients.filter(c => c.status === 'Negotiation')} />
                <StatusColumn status="Active" items={clients.filter(c => c.status === 'Active')} />
            </div>

            <style>{`
                .kanban-board {
                    display: flex;
                    gap: 1.5rem;
                    height: 100%;
                    overflow-x: auto;
                    padding-bottom: 1rem;
                }
                .crm-column {
                    flex: 1;
                    min-width: 280px;
                    background: #111;
                    border-radius: 12px;
                    border: 1px solid #333;
                    display: flex;
                    flex-direction: column;
                }
                .column-header {
                    padding: 1rem;
                    border-bottom: 1px solid #333;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: #1a1a1a;
                }
                .column-header h4 { margin: 0; color: #ccc; }
                .count { background: #333; padding: 0.2rem 0.6rem; border-radius: 12px; font-size: 0.8rem; }
                
                .column-body {
                    padding: 1rem;
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    overflow-y: auto;
                }
                .client-card {
                    background: #222;
                    padding: 1rem;
                    border-radius: 8px;
                    border: 1px solid #333;
                    transition: transform 0.2s;
                }
                .client-card:hover { transform: translateY(-2px); border-color: #555; }
                
                .card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
                .card-top h5 { margin: 0; font-size: 1rem; color: white; }
                .client-value { color: #00c853; font-weight: 600; font-size: 0.9rem; }
                .company-name { color: #888; font-size: 0.85rem; margin: 0 0 1rem 0; }

                .card-actions { display: flex; gap: 0.5rem; }
                .card-actions select { 
                    flex: 1; 
                    background: #000; 
                    color: #ccc; 
                    border: 1px solid #444; 
                    border-radius: 4px; 
                    padding: 0.3rem; 
                    font-size: 0.8rem;
                }
                .del-btn { background: none; border: none; cursor: pointer; opacity: 0.5; }
                .del-btn:hover { opacity: 1; }

                .primary-btn {
                    background: #2563eb;
                    color: white;
                    border: none;
                    padding: 0.5rem 1rem;
                    border-radius: 6px;
                    font-weight: 600;
                    cursor: pointer;
                }
            `}</style>
        </div>
    );
}
