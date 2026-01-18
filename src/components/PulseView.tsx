import { useState } from 'react';
import { AgencyStore, type PulseItem } from '../lib/agents/AgencyStore';

export function PulseView() {
    const store = AgencyStore.getInstance();
    const [items] = useState<PulseItem[]>(store.pulse);

    // Calculate generic totals
    const totalRevenue = items.reduce((acc, i) => acc + i.revenue, 0);
    const totalUsers = items.reduce((acc, i) => acc + i.newUsers, 0);

    return (
        <div className="view-container">
            <div className="stats-grid">
                <div className="stat-card">
                    <h3>Total Revenue</h3>
                    <p className="stat-value">${totalRevenue}</p>
                </div>
                <div className="stat-card">
                    <h3>New Users</h3>
                    <p className="stat-value">{totalUsers}</p>
                </div>
                <div className="stat-card">
                    <h3>Top Performing</h3>
                    <p className="stat-value" style={{ fontSize: '1.2rem' }}>{items[0]?.topPost || 'N/A'}</p>
                </div>
            </div>

            <h3 style={{ marginTop: '2rem' }}>Weekly History</h3>
            <table className="agency-table">
                <thead>
                    <tr>
                        <th>Week Ending</th>
                        <th>Revenue</th>
                        <th>New Users</th>
                        <th>Top Post</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map(item => (
                        <tr key={item.id}>
                            <td>{item.weekEnding}</td>
                            <td>${item.revenue}</td>
                            <td>{item.newUsers}</td>
                            <td>{item.topPost}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
