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
                    border-radius: 50%;
                    background: #2563eb;
                    border: none;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                    font-size: 30px;
                    cursor: pointer;
                    transition: transform 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .chat-toggle:hover {
                    transform: scale(1.1);
                }
                .chat-window {
                    width: 380px;
                    height: 600px;
                    background: #111;
                    border-radius: 16px;
                    display: flex;
                    flex-direction: column;
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
                    border: 1px solid #333;
                    overflow: hidden;
                }
                .chat-header {
                    padding: 1rem;
                    background: #1f1f1f;
                    border-bottom: 1px solid #333;
                    color: white;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-weight: 600;
                }
                .chat-header button {
                    background: transparent;
                    border: none;
                    color: #888;
                    cursor: pointer;
                    font-size: 1.2rem;
                }
                .chat-messages {
                    flex: 1;
                    padding: 1rem;
                    overflow-y: auto;
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }
                
                /* Messages */
                .message {
                    max-width: 85%;
                    padding: 0.8rem 1rem;
                    border-radius: 12px;
                    font-size: 0.95rem;
                    line-height: 1.5;
                    position: relative;
                    animation: fadeIn 0.3s ease;
                }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }

                .message.user {
                    align-self: flex-end;
                    background: #2563eb;
                    color: white;
                    border-bottom-right-radius: 2px;
                }

                /* AGENT THEMES */
                .message.agent {
                    align-self: flex-start;
                    border-bottom-left-radius: 2px;
                    color: #e5e5e5;
                    border: 1px solid rgba(255,255,255,0.1);
                }
                .message.agent.system { background: #1f1f1f; }
                .message.agent.strategist { 
                    background: linear-gradient(135deg, #1f1f1f 0%, #2e1065 100%); 
                    border-left: 3px solid #a855f7;
                }
                .message.agent.creator { 
                    background: linear-gradient(135deg, #1f1f1f 0%, #831843 100%); 
                    border-left: 3px solid #db2777;
                }
                .message.agent.analyst { 
                    background: linear-gradient(135deg, #1f1f1f 0%, #0c4a6e 100%); 
                    border-left: 3px solid #0ea5e9;
                }

                /* CHIPS */
                .chat-chips {
                    padding: 0.5rem 1rem;
                    display: flex;
                    gap: 0.5rem;
                    overflow-x: auto;
                    background: #161616;
                    border-top: 1px solid #333;
                    scrollbar-width: none;
                }
                .chat-chips button {
                    background: #222;
                    border: 1px solid #333;
                    color: #ccc;
                    padding: 0.3rem 0.8rem;
                    border-radius: 20px;
                    font-size: 0.8rem;
                    cursor: pointer;
                    white-space: nowrap;
                    transition: all 0.2s;
                }
                .chat-chips button:hover {
                    background: #333;
                    color: white;
                    border-color: #555;
                }

                .chat-input {
                    padding: 1rem;
                    background: #161616;
                    display: flex;
                    gap: 0.5rem;
                }
                .chat-input input {
                    flex: 1;
                    padding: 0.8rem;
                    border-radius: 8px;
                    border: 1px solid #333;
                    background: #0a0a0a;
                    color: white;
                    outline: none;
                }
                .chat-input input:focus {
                    border-color: #2563eb;
                }
                .chat-input button {
                    padding: 0 1.2rem;
                    background: #2563eb;
                    border: none;
                    border-radius: 8px;
                    color: white;
                    font-weight: 600;
                    cursor: pointer;
                }
            `}</style>
        </div>
    );
}
