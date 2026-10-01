const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_PROMPT = `You are a medical triage assistant for a doctor appointment website called "Doctor Appointment Website".

Your job is to help patients understand their symptoms, suggest possible conditions, and recommend the right medical specialist to visit.

RULES:
1. Analyze the patient's described symptoms carefully.
2. Suggest 2-4 possible medical conditions (most common/likely first).
3. Recommend ONE primary medical specialization they should visit.
4. Rate urgency: "low", "moderate", "high", or "emergency".
5. Give brief, practical advice (1-2 sentences).
6. Always include a medical disclaimer.
7. Be empathetic and professional.
8. If the message is NOT about health/medical symptoms (e.g., greetings, random questions), respond naturally as a helpful medical assistant but still return the JSON format with empty arrays.
9. NEVER provide a definitive diagnosis — always suggest consulting a doctor.

AVAILABLE SPECIALIZATIONS (use only these):
- General Physician
- Cardiologist
- Dermatologist
- Neurologist
- Orthopedic
- ENT Specialist
- Gynecologist
- Ophthalmologist
- Dentist
- Psychiatrist
- Pulmonologist
- Gastroenterologist
- Pediatrician
- Urologist
- Endocrinologist

You MUST respond ONLY with valid JSON in this exact format (no markdown, no code fences):
{
  "message": "Your empathetic response explaining the analysis to the patient",
  "conditions": ["Condition 1", "Condition 2"],
  "specialization": "General Physician",
  "urgency": "low",
  "advice": "Brief practical advice",
  "disclaimer": "This is an AI-generated suggestion and not a medical diagnosis. Please consult a qualified doctor for proper evaluation."
}

If the user's message is a greeting or not symptom-related, return:
{
  "message": "Your friendly response as a medical assistant",
  "conditions": [],
  "specialization": "",
  "urgency": "",
  "advice": "",
  "disclaimer": ""
}`;

/**
 * Analyze symptoms using Gemini AI and return structured medical suggestions.
 * @param {string} userMessage - Patient's symptom description
 * @param {Array} conversationHistory - Previous messages for context
 * @returns {Object} AI analysis with conditions, specialization, urgency
 */
async function analyzeSymptoms(userMessage, conversationHistory = []) {
  const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });

  // Build conversation context
  const historyContext = conversationHistory
    .slice(-6) // Last 6 messages for context
    .map(msg => `${msg.role === 'user' ? 'Patient' : 'Assistant'}: ${msg.content}`)
    .join('\n');

  const prompt = `${SYSTEM_PROMPT}

${historyContext ? `Previous conversation:\n${historyContext}\n\n` : ''}Patient's current message: "${userMessage}"

Respond with ONLY valid JSON:`;

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();

  // Parse JSON from response (handle potential markdown fences)
  let cleanText = text.trim();
  if (cleanText.startsWith('```json')) cleanText = cleanText.slice(7);
  if (cleanText.startsWith('```')) cleanText = cleanText.slice(3);
  if (cleanText.endsWith('```')) cleanText = cleanText.slice(0, -3);
  cleanText = cleanText.trim();

  try {
    return JSON.parse(cleanText);
  } catch (parseError) {
    // Fallback if JSON parsing fails
    return {
      message: text,
      conditions: [],
      specialization: '',
      urgency: '',
      advice: 'Please describe your symptoms in more detail so I can help you better.',
      disclaimer: 'This is an AI-generated suggestion and not a medical diagnosis.',
    };
  }
}

module.exports = { analyzeSymptoms };
