// AI Chatbot Companion Logic
const OPENROUTER_KEY = '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';

const chatbotHTML = `
    <a href="https://t.me/Jobmella_bot" target="_blank" id="hr-bot-trigger" title="HR Bot">
        <i class="fab fa-telegram-plane"></i>
        <span class="bot-label">HR Bot</span>
    </a>
    <button id="chatbot-trigger">
        <i class="fas fa-robot"></i>
    </button>
    <div id="chatbot-window">
        <div class="chatbot-header">
            <div class="bot-info">
                <div class="bot-avatar">
                    <i class="fas fa-robot"></i>
                </div>
                <div>
                    <h4 style="margin:0; font-size: 1rem;">Nex AI Assistant</h4>
                    <span style="font-size: 0.7rem; opacity: 0.6;">Always Online</span>
                </div>
            </div>
            <button onclick="toggleChatbot()" style="background:none; border:none; color:#fff; cursor:pointer; font-size: 1.2rem;">✕</button>
        </div>
        <div class="chatbot-messages" id="chatbot-messages">
            <div class="chat-bubble bot">
                Hello! I'm Nex. I'm here to help you with your interview prep, career goals, or technical questions. How can I assist you today?
            </div>
        </div>
        <div class="typing-indicator" id="typing-indicator">Nex is thinking...</div>
        <div class="chatbot-input-area">
            <input type="text" id="chatbot-input" placeholder="Ask me anything..." onkeypress="handleBotKey(event)">
            <button class="chatbot-send-btn" onclick="sendBotMessage()">
                <i class="fas fa-paper-plane"></i>
            </button>
        </div>
    </div>
`;

// Inject Chatbot into DOM
document.addEventListener('DOMContentLoaded', () => {
    const botContainer = document.createElement('div');
    botContainer.innerHTML = chatbotHTML;
    document.body.appendChild(botContainer);

    // Add event listener for the trigger
    document.getElementById('chatbot-trigger').addEventListener('click', toggleChatbot);
});

function toggleChatbot() {
    const window = document.getElementById('chatbot-window');
    window.classList.toggle('active');
}

function handleBotKey(e) {
    if (e.key === 'Enter') sendBotMessage();
}

async function sendBotMessage() {
    const input = document.getElementById('chatbot-input');
    const message = input.value.trim();
    if (!message) return;

    // Add user message to UI
    appendMessage(message, 'user');
    input.value = '';

    // Show typing indicator
    const indicator = document.getElementById('typing-indicator');
    indicator.style.display = 'block';

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENROUTER_KEY} `,
                'HTTP-Referer': window.location.origin,
                'X-Title': 'Interview Master AI'
            },
            body: JSON.stringify({
                model: "openai/gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: "You are Nex AI, a helpful and friendly career and interview coach for the Interview Master platform. You provide expert advice on resumes, interview techniques, and technical skills. Keep responses professional, encouraging, and concise."
                    },
                    { role: "user", content: message }
                ]
            })
        });

        const data = await response.json();
        indicator.style.display = 'none';

        if (data.choices && data.choices[0].message) {
            appendMessage(data.choices[0].message.content, 'bot');
        } else {
            throw new Error('Invalid API response');
        }
    } catch (error) {
        console.error('Chatbot error:', error);
        indicator.style.display = 'none';
        appendMessage("I'm having a bit of trouble connecting to the network. Could you please try again in a moment?", 'bot');
    }
}

function appendMessage(text, sender) {
    const container = document.getElementById('chatbot-messages');
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${sender}`;
    bubble.innerHTML = text.replace(/\n/g, '<br>');
    container.appendChild(bubble);
    container.scrollTop = container.scrollHeight;
}
