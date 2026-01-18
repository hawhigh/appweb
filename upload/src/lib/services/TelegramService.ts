import TelegramBot from 'node-telegram-bot-api';
import { ChatAgent } from '../agents/ChatAgent';

export class TelegramService {
    private bot: TelegramBot;
    private chatAgent: ChatAgent;

    constructor(token: string) {
        this.bot = new TelegramBot(token, { polling: true });
        this.chatAgent = ChatAgent.getInstance();

        console.log('🤖 Telegram Bot Service Initialized');
        this.initializeListeners();
    }

    private initializeListeners() {
        // Handle incoming messages
        this.bot.on('message', async (msg) => {
            const chatId = msg.chat.id;
            const text = msg.text;

            if (!text) return;

            console.log(`📩 Received from ${msg.from?.first_name}: ${text}`);

            // Process via ChatAgent
            try {
                console.log(`⚙️ Processing command: "${text}"`);
                // Simulate "User" context for the agent
                const response = await this.chatAgent.processCommand(text);
                console.log(`📤 Generated response: "${response?.substring(0, 50)}..."`);

                // Send response back
                if (response) {
                    await this.bot.sendMessage(chatId, response, { parse_mode: 'Markdown' });
                    console.log(`✅ Message sent to ${chatId}`);
                } else {
                    console.warn(`⚠️ No response generated for: "${text}"`);
                }
            } catch (error) {
                console.error('Error processing message:', error);
                this.bot.sendMessage(chatId, "⚠️ Error processing command.");
            }
        });

        console.log('👂 Listening for Telegram updates...');
    }

    public stop() {
        this.bot.stopPolling();
    }
}
