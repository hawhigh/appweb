import { useState, useRef, useEffect } from 'react';
import { ChatAgent } from '../lib/agents/ChatAgent';

export function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{ sender: 'user' | 'agent', text: string }[]>([
        { sender: 'agent', text: '🧠 **System Online**.\nI am your Agency Brain. How can I help?' }
    ]);
    const [input, setInput] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSubmit = (e: React.FormEvent | string) => {
        if (typeof e !== 'string') e.preventDefault();
        const text = typeof e === 'string' ? e : input;

        if (!text.trim()) return;

        // User Message
        setMessages(prev => [...prev, { sender: 'user', text: text }]);
        if (typeof e !== 'string') setInput("");

        // Agent Response
        const agent = ChatAgent.getInstance();
        agent.processMessage(text).then(response => {
            setTimeout(() => {
                setMessages(prev => [...prev, { sender: 'agent', text: response }]);
            }, 400);
        });
    };

    // --- Helpers ---

    const parseMarkdown = (text: string) => {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
            .replace(/\n/g, '<br/>') // Line breaks
            .replace(/- (.*?)(?=<br\/>|$)/g, '• $1'); // Simple lists
    };

    const getAgentTheme = (text: string) => {
        if (text.includes('♟️')) return 'strategist';
        if (text.includes('🎨')) return 'creator';
        if (text.includes('⚠️') || text.includes('📈') || text.includes('🟢')) return 'analyst';
        return 'system';
    };

    const chips = [
        { label: '❤️ Health', cmd: 'Health' },
        { label: '📅 Plan Day', cmd: 'Plan my day' },
        { label: '💼 Audit', cmd: 'Audit assets' },
        { label: '💰 Revenue', cmd: 'Revenue projection' },
        { label: '🚀 Finish...', cmd: 'Finish ' },
        { label: '🎨 Posted...', cmd: 'Posted ' },
    ];

    const handleChip = (chip: { label: string, cmd: string }) => {
        if (chip.cmd.endsWith(' ')) {
            setInput(chip.cmd); // Pre-fill
            document.querySelector<HTMLInputElement>('.chat-input input')?.focus();
        } else {
            handleSubmit(chip.cmd); // Send
        }
    };

    return (
        <div className="chat-widget">
            {!isOpen && (
                <button className="chat-toggle" onClick={() => setIsOpen(true)}>
                    🧠
                </button>
            )}

            {isOpen && (
                <div className="chat-window">
                    <div className="chat-header">
                        <h3>Agency Brain 🧠</h3>
                        <button onClick={() => setIsOpen(false)}>✖</button>
                    </div>

                    <div className="chat-messages">
                        {messages.map((msg, idx) => {
                            const theme = msg.sender === 'agent' ? getAgentTheme(msg.text) : 'user';
                            return (
                                <div key={idx} className={`message ${msg.sender} ${theme}`}>
                                    <div className="message-content" dangerouslySetInnerHTML={{ __html: parseMarkdown(msg.text) }} />
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="chat-chips">
                        {chips.map(c => (
                            <button key={c.label} onClick={() => handleChip(c)}>{c.label}</button>
                        ))}
                    </div>

                    <form className="chat-input" onSubmit={handleSubmit}>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type a command..."
                            autoFocus
                        />
                        <button type="submit">Send</button>
                    </form>
                </div>
            )}

            <style>{`
                .chat-widget {
                    position: fixed;
                    bottom: 2rem;
                    right: 2rem;
                    z-index: 1000;
                    font-family: 'Inter', system-ui, sans-serif;
                }
                .chat-toggle {
                    width: 60px;
                    height: 60px;
                    border-radius: var(--radius-sm);
                    background: var(--gold-gradient);
                    border: none;
                    box-shadow: var(--shadow-glow);
                    font-size: 30px;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .chat-toggle:hover {
                    transform: scale(1.05) rotate(5deg);
                    box-shadow: 0 0 30px var(--primary-glow);
                }
                .chat-window {
                    width: 380px;
                    height: 600px;
                    background: var(--bg-glass);
                    backdrop-filter: var(--glass-blur);
                    border-radius: var(--radius-lg);
                    display: flex;
                    flex-direction: column;
                    box-shadow: var(--shadow-lg);
                    border: 1px solid var(--border-glass);
                    overflow: hidden;
                    animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                }
                @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

                .chat-header {
                    padding: 1.2rem;
                    background: rgba(255, 255, 255, 0.03);
                    border-bottom: 1px solid var(--border-glass);
                    color: white;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .chat-header h3 {
                    margin: 0;
                    font-size: 1rem;
                    font-weight: 800;
                    letter-spacing: 0.5px;
                    background: var(--gold-gradient);
                    -webkit-background-clip: text;
                    background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                .chat-header button {
                    background: transparent;
                    border: none;
                    color: var(--text-muted);
                    cursor: pointer;
                    font-size: 1.2rem;
                    transition: color 0.2s;
                }
                .chat-header button:hover { color: white; }

                .chat-messages {
                    flex: 1;
                    padding: 1.2rem;
                    overflow-y: auto;
                    display: flex;
                    flex-direction: column;
                    gap: 1.2rem;
                    scrollbar-width: thin;
                    scrollbar-color: var(--border-glass) transparent;
                }
                
                /* Messages */
                .message {
                    max-width: 85%;
                    padding: 0.8rem 1rem;
                    border-radius: var(--radius-md);
                    font-size: 0.9rem;
                    line-height: 1.6;
                    position: relative;
                    animation: messageAppear 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                @keyframes messageAppear { from { opacity: 0; transform: scale(0.95) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }

                .message.user {
                    align-self: flex-end;
                    background: #222;
                    color: white;
                    border: 1px solid var(--border-glass);
                    border-bottom-right-radius: 2px;
                }

                /* AGENT THEMES */
                .message.agent {
                    align-self: flex-start;
                    border-bottom-left-radius: 2px;
                    color: #fff;
                    border: 1px solid var(--border-glass);
                    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                }
                .message.agent.system { background: rgba(255,255,255,0.05); }
                .message.agent.strategist { 
                    background: linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(10, 10, 10, 0.9) 100%); 
                    border-left: 3px solid var(--primary);
                }
                .message.agent.creator { 
                    background: linear-gradient(135deg, rgba(219, 39, 119, 0.1) 0%, rgba(10, 10, 10, 0.9) 100%); 
                    border-left: 3px solid #db2777;
                }
                .message.agent.analyst { 
                    background: linear-gradient(135deg, rgba(14, 165, 233, 0.1) 0%, rgba(10, 10, 10, 0.9) 100%); 
                    border-left: 3px solid #0ea5e9;
                }

                /* CHIPS */
                .chat-chips {
                    padding: 0.6rem 1rem;
                    display: flex;
                    gap: 0.5rem;
                    overflow-x: auto;
                    background: rgba(0,0,0,0.2);
                    border-top: 1px solid var(--border-glass);
                    scrollbar-width: none;
                }
                .chat-chips button {
                    background: #111;
                    border: 1px solid var(--border-glass);
                    color: var(--text-muted);
                    padding: 0.35rem 0.8rem;
                    border-radius: var(--radius-sm);
                    font-size: 0.75rem;
                    font-weight: 600;
                    cursor: pointer;
                    white-space: nowrap;
                    transition: all 0.2s;
                }
                .chat-chips button:hover {
                    background: var(--bg-surface);
                    color: var(--primary);
                    border-color: var(--primary-glow);
                }

                .chat-input {
                    padding: 1.2rem;
                    background: rgba(0,0,0,0.3);
                    display: flex;
                    gap: 0.6rem;
                }
                .chat-input input {
                    flex: 1;
                    padding: 0.8rem 1rem;
                    border-radius: var(--radius-sm);
                    border: 1px solid var(--border-glass);
                    background: #000;
                    color: white;
                    outline: none;
                    transition: border-color 0.2s;
                    font-size: 0.9rem;
                }
                .chat-input input:focus {
                    border-color: var(--primary);
                }
                .chat-input button {
                    padding: 0 1.2rem;
                    background: var(--gold-gradient);
                    border: none;
                    border-radius: var(--radius-sm);
                    color: black;
                    font-weight: 800;
                    text-transform: uppercase;
                    font-size: 0.75rem;
                    letter-spacing: 0.5px;
                    cursor: pointer;
                    transition: filter 0.2s;
                }
                .chat-input button:hover {
                    filter: brightness(1.1);
                }
            `}</style>
        </div>
    );
}
