const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const axios = require('axios'); // For making API requests

// Get the API Key from environment variables (set this in Render)
const API_KEY = process.env.API_KEY;
const AI_API_URL = 'https://api.openai.com/v1/completions'; // Use the appropriate endpoint

// Initialize the WhatsApp client
const client = new Client({
    authStrategy: new LocalAuth(), // This will save the session for future logins
});

// Event when QR code is generated for the first-time authentication
client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});

// Event when client is ready (logged in)
client.on('ready', () => {
    console.log('Bot is ready!');
});

// Function to call the AI API and get a response
async function getAIResponse(messageText) {
    try {
        const response = await axios.post(
            AI_API_URL,
            {
                model: 'text-davinci-003', // Change model as needed
                prompt: messageText,
                max_tokens: 150,
                temperature: 0.7,
            },
            {
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json',
                },
            }
        );
        return response.data.choices[0].text.trim();
    } catch (error) {
        console.error('Error fetching AI response:', error);
        return 'Sorry, I am unable to process your request right now.';
    }
}

// Event when a message is received
client.on('message', async (message) => {
    console.log('Received message:', message.body);

    // If the message starts with a tag (e.g., @MetroTex AI)
    if (message.body.includes('@MetroTex AI')) {
        const aiResponse = await getAIResponse(message.body.replace('@MetroTex AI', '').trim());
        message.reply(aiResponse);
    } else {
        message.reply('I can only respond to messages tagged with @MetroTex AI');
    }
});

// Initialize the WhatsApp client
client.initialize();
