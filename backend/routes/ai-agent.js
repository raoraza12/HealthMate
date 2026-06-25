const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// System instruction for the AI Medical Agent
const MEDICAL_SYSTEM_PROMPT = `
You are "HealthMate AI", a professional and empathetic bilingual medical assistant chatbot.
You have comprehensive medical knowledge regarding symptoms, common diseases, health metrics, lifestyle changes, precautions, and medical definitions.
Your goal is to guide patients and doctors with accurate health information.

Rules:
1. Language matching: If the user speaks in English, reply in English. If they speak in Urdu or Roman Urdu (Urdu written in English alphabets like "mujhe bukhar hai"), reply in simple, natural Roman Urdu so it is extremely easy for Pakistani/Indian users to read.
2. Structure: Keep responses concise, clear, and structured with bullet points.
3. Safety: Do not prescribe exact drug dosages.
4. Disclaimer: ALWAYS end your response with a clear disclaimer block.
   - For Roman Urdu/Urdu: "*Disclaimer: Main ek AI medical assistant hoon. Baraye meharbani kisi bhi dawai ya ilaaj se pehle qualified doctor se consult karein.*"
   - For English: "*Disclaimer: I am an AI medical assistant. Please consult a qualified healthcare professional before starting any treatment or medication.*"
`;

// @route   POST api/ai-agent/chat
// @desc    Chat with Gemini AI Medical Agent
// @access  Private
router.post('/chat', auth, async (req, res) => {
    const { message, history } = req.body;

    if (!message) {
        return res.status(400).json({ msg: 'Please provide a message' });
    }

    // Mock response if API key is not configured
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key') {
        console.warn('GEMINI_API_KEY is not configured. Returning mock AI Agent response.');
        
        const lowerMsg = message.toLowerCase();
        let reply = '';
        if (lowerMsg.includes('hello') || lowerMsg.includes('hi') || lowerMsg.includes('aoa') || lowerMsg.includes('salam')) {
            reply = "Assalam-o-Alaikum! Main HealthMate AI medical assistant hoon. Main aapki kya madad kar sakta hoon? (E.g., sugar, blood pressure, ya kisi report ke baare mein poochein).\n\n*Disclaimer: Main ek AI medical assistant hoon. Baraye meharbani kisi bhi dawai ya ilaaj se pehle qualified doctor se consult karein.*";
        } else if (lowerMsg.includes('fever') || lowerMsg.includes('bukhar')) {
            reply = "Bukhar (fever) aam tor par body ka infection se larnay ka natural tariqa hota hai. \n\n**Precautions:**\n- Paani aur liquid fluids zyada piyein.\n- Paracetamol (agar koee allergy na ho) le sakte hain bukhar kam karne ke liye.\n- Gehray thanday paani ki patiyan sir par rakhein.\n- Agar bukhar 3 din se zyada rahay ya 102°F se upar jaye, toh foran doctor ko dikhayein.\n\n*Disclaimer: Main ek AI medical assistant hoon. Baraye meharbani kisi bhi dawai ya ilaaj se pehle qualified doctor se consult karein.*";
        } else {
            reply = `Main aapka sawal samjh gaya hoon: "${message}". Lekin abhi mere pass Gemini API Key configured nahi hai, is liye main detailed medical feedback nahi de sakta. Jab API key lag jaye gi, toh main aapko mukammal medical guide karoon ga.\n\n*Disclaimer: Main ek AI medical assistant hoon. Baraye meharbani kisi bhi dawai ya ilaaj se pehle qualified doctor se consult karein.*`;
        }
        return res.json({ reply });
    }

    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        
        // Initialize the model with the system prompt
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
            systemInstruction: MEDICAL_SYSTEM_PROMPT,
        });

        // Convert the history array from the frontend to the format Gemini expects
        // Gemini expects: [ { role: 'user', parts: [{ text: '...' }] }, { role: 'model', parts: [{ text: '...' }] } ]
        const contents = [];
        if (history && Array.isArray(history)) {
            history.forEach(item => {
                contents.push({
                    role: item.role === 'user' ? 'user' : 'model',
                    parts: [{ text: item.content || item.text || '' }]
                });
            });
        }

        // Add the current message
        contents.push({
            role: 'user',
            parts: [{ text: message }]
        });

        const result = await model.generateContent({
            contents: contents
        });

        const responseText = result.response.text();
        res.json({ reply: responseText });
    } catch (err) {
        console.error('Error calling Gemini in AI Agent route:', err);
        res.status(500).json({ msg: 'Failed to process AI chat. Please try again later.' });
    }
});

module.exports = router;
