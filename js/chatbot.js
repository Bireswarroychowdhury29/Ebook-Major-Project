// Chatbot functionality using Gemini API
let chatHistory = [];

document.addEventListener("DOMContentLoaded", function() {
    // Create the chatbot button if it doesn't exist
    if (!document.getElementById('chatbotButton')) {
        createChatbotButton();
    }
});

function createChatbotButton() {
    // Create the chatbot button
    const chatbotButton = document.createElement('div');
    chatbotButton.id = 'chatbotButton';
    chatbotButton.className = 'chatbot-button';
    chatbotButton.innerHTML = '<img src="images/bot.png" alt="Chat Assistant" />';
    chatbotButton.title = "Ask me anything about books or PageFlow!";
    
    // Add click event to the button
    chatbotButton.addEventListener('click', toggleChatWindow);
    
    // Append the button to the body
    document.body.appendChild(chatbotButton);
}

function toggleChatWindow() {
    let chatWindow = document.getElementById('chatbotWindow');
    
    if (chatWindow) {
        // If the chat window exists, toggle its visibility
        if (chatWindow.style.display === 'none') {
            chatWindow.style.display = 'flex';
        } else {
            chatWindow.style.display = 'none';
        }
    } else {
        // Create the chat window if it doesn't exist
        createChatWindow();
    }
}

function createChatWindow() {
    // Create chat window container
    const chatWindow = document.createElement('div');
    chatWindow.id = 'chatbotWindow';
    chatWindow.className = 'chatbot-window';
    
    // Create header
    const header = document.createElement('div');
    header.className = 'chatbot-header';
    
    const title = document.createElement('div');
    title.className = 'chatbot-title';
    title.innerHTML = '<img src="images/bot.png" alt="Bot" /> PageFlow Assistant';
    
    const closeBtn = document.createElement('button');
    closeBtn.className = 'chatbot-close';
    closeBtn.innerHTML = '&times;';
    closeBtn.onclick = toggleChatWindow;
    
    header.appendChild(title);
    header.appendChild(closeBtn);
    
    // Create chat messages container
    const messagesContainer = document.createElement('div');
    messagesContainer.className = 'chatbot-messages';
    messagesContainer.id = 'chatbotMessages';
    
    // Add welcome message
    const welcomeMessage = document.createElement('div');
    welcomeMessage.className = 'message bot-message';
    welcomeMessage.innerHTML = `
        <div class="message-content">
            <p>👋 Hello! I'm your PageFlow assistant. You can ask me about:</p>
            <ul>
                <li>Book information and summaries</li>
                <li>How to use PageFlow features</li>
                <li>Reading recommendations</li>
                <li>Navigation help</li>
            </ul>
            <p>How can I help you today?</p>
        </div>
    `;
    messagesContainer.appendChild(welcomeMessage);
    
    // Create input area
    const inputArea = document.createElement('div');
    inputArea.className = 'chatbot-input';
    
    const textInput = document.createElement('input');
    textInput.type = 'text';
    textInput.id = 'chatbotInput';
    textInput.placeholder = 'Type your question here...';
    textInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    const sendButton = document.createElement('button');
    sendButton.className = 'chatbot-send';
    sendButton.innerHTML = '<i class="fas fa-paper-plane"></i>';
    sendButton.onclick = sendMessage;
    
    inputArea.appendChild(textInput);
    inputArea.appendChild(sendButton);
    
    // Assemble chat window
    chatWindow.appendChild(header);
    chatWindow.appendChild(messagesContainer);
    chatWindow.appendChild(inputArea);
    
    // Add to document
    document.body.appendChild(chatWindow);
    
    // Focus on input
    textInput.focus();
}

function sendMessage() {
    const input = document.getElementById('chatbotInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Clear input
    input.value = '';
    
    // Add user message to chat
    addMessage('user', message);
    
    // Show typing indicator
    showTypingIndicator();
    
    // Add to chat history
    chatHistory.push({ role: "user", parts: [{ text: message }] });
    
    // Get response from Gemini AI
    getGeminiResponse(message);
}

function addMessage(sender, content) {
    const messagesContainer = document.getElementById('chatbotMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    messageDiv.innerHTML = `
        <div class="message-bubble">
            <div class="message-content">${content}</div>
        </div>
    `;
    
    messagesContainer.appendChild(messageDiv);
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function showTypingIndicator() {
    const messagesContainer = document.getElementById('chatbotMessages');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot-message typing-indicator';
    typingDiv.id = 'typingIndicator';
    
    typingDiv.innerHTML = `
        <div class="message-bubble">
            <div class="typing-dots">
                <span></span><span></span><span></span>
            </div>
        </div>
    `;
    
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function removeTypingIndicator() {
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

async function getGeminiResponse(message) {
    try {
        // Get API key from window object (set by config.js)
        const apiKey = window.GEMINI_API_KEY;
        
        if (!apiKey) {
            throw new Error("API key not found. Make sure config.js is properly loaded.");
        }
        
        // Context to help the model understand its role
        const context = "You are PageFlow's helpful AI assistant. You provide information about books, help with using the PageFlow ebook reader application, and offer reading recommendations. Your responses should be helpful, concise, and friendly. Current features of PageFlow include: bookmarking pages, highlighting text, zoom controls, page navigation, and a text-to-speech feature. If you don't know the specific answer about a particular book's content, you can suggest how the user might find that information in the app.";
        
        // Create the prompt with context and chat history
        let prompt = context;
        if (chatHistory.length > 0) {
            // Format chat history for the prompt
            prompt += "\n\nConversation history:\n";
            chatHistory.forEach(msg => {
                prompt += `${msg.role}: ${msg.parts[0].text}\n`;
            });
        }
        
        // Add the current message
        prompt += `\nUser: ${message}\n\nAssistant: `;
        
        // Make request to Gemini API
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    role: "user",
                    parts: [{ text: prompt }]
                }]
            })
        });

        if (!response.ok) {
            throw new Error(`API request failed with status: ${response.status}`);
        }

        const data = await response.json();
        
        // Check if we have a valid response with content
        if (data && 
            data.candidates && 
            data.candidates[0] && 
            data.candidates[0].content && 
            data.candidates[0].content.parts && 
            data.candidates[0].content.parts[0] && 
            data.candidates[0].content.parts[0].text) {
            
            // Get the assistant's response
            const aiResponse = data.candidates[0].content.parts[0].text;
            
            // Remove typing indicator
            removeTypingIndicator();
            
            // Add AI message to chat
            addMessage('bot', formatBotResponse(aiResponse));
            
            // Add to chat history
            chatHistory.push({ role: "assistant", parts: [{ text: aiResponse }] });
            
            // Limit chat history length to avoid token limits
            if (chatHistory.length > 10) {
                chatHistory = chatHistory.slice(-10);
            }
            
        } else {
            throw new Error('Invalid response format from API');
        }
        
    } catch (error) {
        console.error('Error getting response from Gemini:', error);
        
        // Remove typing indicator
        removeTypingIndicator();
        
        // Show error message
        addMessage('bot', "I'm sorry, I encountered an error while processing your request. Please try again later.");
    }
}

function formatBotResponse(text) {
    // Convert markdown-style formatting to HTML
    let formattedText = text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
        .replace(/\*(.*?)\*/g, '<em>$1</em>')             // Italic
        .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>') // Code blocks
        .replace(/`(.*?)`/g, '<code>$1</code>')           // Inline code
        .replace(/\n/g, '<br>');                          // Line breaks
    
    return formattedText;
}