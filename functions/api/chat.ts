export interface Env {
  GEMINI_API_KEY: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { request, env } = context;
    const body = await request.json() as { messages: { role: string; content: string }[] };

    if (!env.GEMINI_API_KEY) {
      return new Response(JSON.stringify({ error: "AI Tutor is not fully configured on the server." }), { 
        status: 500, 
        headers: { "Content-Type": "application/json" } 
      });
    }

    // Format for Gemini API
    const contents = body.messages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    // Add a system prompt conceptually as the first message to guide the tutor
    const systemPrompt = {
      role: 'user',
      parts: [{ text: "You are an AI Tutor for StudySpark, an app that turns notes into study capsules. Keep your answers concise, encouraging, and focused on helping the student understand their study material better. Use simple markdown for formatting." }]
    };
    
    // Gemini 1.5 doesn't officially support 'system' role in contents this way without systemInstruction,
    // so we just prepend it if needed, or better, we can use system_instruction if using the v1beta API.
    // For simplicity, we just use systemInstruction in the body if we want, but let's just stick to standard contents to avoid breaking.

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${env.GEMINI_API_KEY}`;
    
    const requestBody = {
      systemInstruction: {
        parts: [{ text: "You are an AI Tutor for StudySpark, an app that turns notes into study capsules. Keep your answers concise, encouraging, and focused on helping the student understand their study material better. Use simple markdown for formatting." }]
      },
      contents: contents,
    };

    const response = await fetch(geminiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", errorText);
      return new Response(JSON.stringify({ error: "Failed to communicate with AI provider" }), { 
        status: 502, 
        headers: { "Content-Type": "application/json" } 
      });
    }

    const data = await response.json();
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't generate a response.";

    return new Response(JSON.stringify({ response: responseText }), {
      headers: {
        "Content-Type": "application/json",
      }
    });
  } catch (error: any) {
    console.error("Error in chat function:", error);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500, 
      headers: { "Content-Type": "application/json" } 
    });
  }
};
