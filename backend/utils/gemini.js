const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Sends a report buffer (PDF or Image) to Gemini for analysis.
 * @param {Buffer} fileBuffer 
 * @param {string} mimeType 
 * @returns {Promise<object>}
 */
const analyzeReport = async (fileBuffer, mimeType) => {
    // If API Key is not set, return mock data to prevent crash and allow testing
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key') {
        console.warn('GEMINI_API_KEY is not configured. Returning mock analysis.');
        return {
            aiSummaryEnglish: "This is a mock analysis because GEMINI_API_KEY is not set. Once configured, Gemini will read your actual PDF/Image. It seems to be a general blood test report showing normal levels overall, with slightly elevated cholesterol.",
            aiSummaryUrdu: "Yeh ek farzi report analysis hai kyunke GEMINI_API_KEY configure nahi hai. Jab aap key lagaenge, toh Gemini asal report parhega. Wese is report ke mutabiq aapka cholesterol thoda barha hua hai.",
            abnormalValues: ["Cholesterol: 220 mg/dL (Slightly High)"],
            doctorQuestions: [
                "Doctor sahab, kya mujhe cholesterol control karne ke liye dawai ki zaroorat hai?",
                "Kya main exercise se ise normal kar sakta hoon?",
                "Mujhe apni diet mein kya changes karne chahiye?"
            ],
            foodsToAvoid: ["Fried foods", "Butter and ghee", "Excessive red meat"],
            healthTips: ["Daily 30 minutes walk karein.", "Paani zyada piyein.", "Haree sabziyan (green vegetables) zyada khayein."]
        };
    }

    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // Using gemini-1.5-flash as it is fast and has a free tier
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const fileData = {
            inlineData: {
                data: fileBuffer.toString('base64'),
                mimeType: mimeType
            }
        };

        const prompt = `
        You are an expert bilingual medical assistant chatbot named "HealthMate".
        Analyze this uploaded medical report or prescription image/PDF and generate a structured JSON response.
        
        The response MUST be a JSON object with the following fields:
        1. aiSummaryEnglish: A clear, simple, and detailed explanation of the report in plain English, explaining what the report is about and key findings.
        2. aiSummaryUrdu: The same explanation but in easy-to-understand Roman Urdu (Urdu written in Latin/English script, e.g., "Aapki report normal hai lekin sugar level thoda zyada hai"). Keep it natural, friendly, and simple.
        3. abnormalValues: An array of strings highlighting any values that are out of the normal range (e.g., "Hemoglobin: 10.5 g/dL (Low)", "Sugar: 140 mg/dL (High)"). If nothing is abnormal, return an empty array.
        4. doctorQuestions: An array of 3-5 relevant questions the patient should ask their doctor based on this report.
        5. foodsToAvoid: An array of foods/drinks the patient should avoid or limit based on this report.
        6. healthTips: An array of general home remedies or lifestyle tips suitable for this health status.

        CRITICAL Rules:
        - Return ONLY valid JSON.
        - Do not wrap it in markdown code blocks like \`\`\`json. Just return the JSON object directly.
        - Do not include any HTML tags.
        `;

        const result = await model.generateContent([fileData, prompt]);
        const responseText = result.response.text();
        
        // Clean markdown JSON wrapper if generated
        const cleanText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanText);
    } catch (error) {
        console.error('Error analyzing report with Gemini:', error);
        // Return a structured error response so backend doesn't crash
        return {
            aiSummaryEnglish: "Failed to analyze the report due to an AI processing error.",
            aiSummaryUrdu: "AI analysis mein error aya hai, baraye meharbani dobara koshish karein.",
            abnormalValues: ["Error processing report"],
            doctorQuestions: ["Please consult your doctor directly."],
            foodsToAvoid: [],
            healthTips: []
        };
    }
};

module.exports = { analyzeReport };
