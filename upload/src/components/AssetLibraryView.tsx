import { useState } from 'react';
import { AgencyStore, type AssetItem } from '../lib/agents/AgencyStore';

export function AssetLibraryView() {
    const store = AgencyStore.getInstance();
    const [items, setItems] = useState<AssetItem[]>(store.assets);
    const [newItem, setNewItem] = useState<Partial<AssetItem>>({ type: 'Document' });

    const refresh = () => setItems([...store.assets]);

    const handleAdd = () => {
        if (!newItem.name) return;
        store.addAssetItem(newItem as any);
        setNewItem({ type: 'Document', name: '', link: '', keywords: [] });
        refresh();
    };

    return (
        <div className="view-container">
            <div className="toolbar">
                <input
                    placeholder="Asset Name"
                    value={newItem.name || ''}
                    onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                />
                <select value={newItem.type} onChange={e => setNewItem({ ...newItem, type: e.target.value as any })}>
                    <option>Document</option>
                    <option>Logo</option>
                    <option>Code</option>
                    <option>Video</option>
                </select>
                <input
                    placeholder="Link"
                    value={newItem.link || ''}
                    onChange={e => setNewItem({ ...newItem, link: e.target.value })}
                />
                <button onClick={handleAdd}>Add Asset</button>
            </div>

            <div className="asset-grid">
                {items.map(item => (
                    <div key={item.id} className="asset-card">
                        <div className="asset-icon">
                            {item.type === 'Document' ? '📄' : item.type === 'Logo' ? '🎨' : item.type === 'Code' ? '💻' : '🎥'}
                        </div>
                        <div className="asset-info">
                            <h3>{item.name}</h3>
                            <a href={item.link} target="_blank">Open Link</a>
                        </div>
                        <button className="delete-btn" onClick={() => { store.deleteAssetItem(item.id); refresh(); }}>×</button>
                    </div>
                ))}
            </div>
        </div>
    );
}
