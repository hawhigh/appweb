import { useState, useEffect } from 'react'
import { PipelineView } from './components/PipelineView'
import { ContentEngineView } from './components/ContentEngineView'
import { AssetLibraryView } from './components/AssetLibraryView' // Fixed import
import { PulseView } from './components/PulseView'
import { ChatWidget } from './components/ChatWidget'
import { CRMView } from './components/CRMView'
import { ProjectView } from './components/ProjectView'

import { DataAgent } from './lib/agents/DataAgent'
import { PlanningAgent } from './lib/agents/PlanningAgent'
import { AgencyStore } from './lib/agents/AgencyStore'
import { CreatorAgent } from './lib/agents/CreatorAgent'
import { ChatAgent } from './lib/agents/ChatAgent'
import { GoogleSheetsService } from './lib/services/GoogleSheetsService.web'
import './App.css'

type View = 'pipeline' | 'content' | 'assets' | 'pulse' | 'crm' | 'projects';

function App() {
  const store = AgencyStore.getInstance();
  const [currentView, setCurrentView] = useState<View>('pipeline')
  const [focusMode, setFocusMode] = useState<'Normal' | 'Workbench' | 'Studio'>(store.currentMode);

  // Initialize Agents
  useEffect(() => {
    // Composition Root - Web
    const sheetsService = new GoogleSheetsService();
    const creatorAgent = CreatorAgent.getInstance(sheetsService);
    ChatAgent.getInstance(creatorAgent);

    DataAgent.getInstance();
    PlanningAgent.getInstance();
  }, []);

  const handleModeChange = (newMode: 'Normal' | 'Workbench' | 'Studio') => {
    store.currentMode = newMode;
    setFocusMode(newMode);
    // Automatically switch to a safe view if current view is hidden
    if (newMode === 'Workbench' && (currentView === 'content' || currentView === 'pulse')) setCurrentView('pipeline');
    if (newMode === 'Studio' && (currentView === 'pipeline' || currentView === 'crm')) setCurrentView('content');
  };

  const getVisibleViews = () => {
    if (focusMode === 'Workbench') return ['pipeline', 'projects', 'assets', 'crm']; // Focus on Build/Data
    if (focusMode === 'Studio') return ['content', 'assets', 'pulse']; // Focus on Creator
    return ['pipeline', 'projects', 'content', 'crm', 'assets', 'pulse']; // Normal
  };

  const navItems = [
    { id: 'pipeline', label: '⚡ Pipeline', icon: '⚡' },
    { id: 'projects', label: '📁 Projects', icon: '📁' },
    { id: 'content', label: '🎥 Studio', icon: '🎥' },
    { id: 'crm', label: '🤝 CRM', icon: '🤝' },
    { id: 'assets', label: '📦 Assets', icon: '📦' },
    { id: 'pulse', label: '❤️ Pulse', icon: '❤️' }
  ];

  const visibleNav = navItems.filter(item => getVisibleViews().includes(item.id));

  return (
    <div className="app-shell">
      <nav className="sidebar">
        <div className="logo">AgencyOS</div>

        <div className="nav-links">
          {visibleNav.map((item) => (
            <button
              key={item.id}
              className={currentView === item.id ? 'active' : ''}
              onClick={() => setCurrentView(item.id as View)}
            >
              <span className="icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>

        <div className="user-profile">
          <div className="avatar">RM</div>
          <div className="info">
            <span className="name">RenMac</span>
            {/* Mode Selector */}
            <select
              value={focusMode}
              onChange={(e) => handleModeChange(e.target.value as any)}
              className="mode-select"
            >
              <option value="Normal">Normal</option>
              <option value="Workbench">Workbench</option>
              <option value="Studio">Studio</option>
            </select>
          </div>
        </div>
      </nav>

      <style>{`
            .mode-select {
                background: #333;
                color: #ccc;
                border: none;
                border-radius: 4px;
                padding: 2px 4px;
                font-size: 0.75rem;
                margin-top: 4px;
                cursor: pointer;
            }
            .mode-select:hover { color: white; background: #444; }
       `}</style>
      <main className="main-content">
        <header className="top-bar">
          <h1>{navItems.find(n => n.id === currentView)?.label}</h1>
          <div className="actions">
            <button className="icon-btn">🔔</button>
            <button className="icon-btn">⚙️</button>
          </div>
        </header>

        <div className="content-area">
          {currentView === 'pipeline' && <PipelineView />}
          {currentView === 'projects' && <ProjectView />}
          {currentView === 'content' && <ContentEngineView />}
          {currentView === 'crm' && <CRMView />}
          {currentView === 'assets' && <AssetLibraryView />}
          {currentView === 'pulse' && <PulseView />}
        </div>
      </main>

      <ChatWidget />
    </div>
  )
}

export default App
