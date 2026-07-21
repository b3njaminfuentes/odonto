const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config({ path: ".env" });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function run() {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
  try {
    const chat = model.startChat({
      history: [
        { role: 'model', parts: [{ text: "Hola soy Muelita" }] }
      ]
    });
    
    await chat.sendMessage("hola");
    console.log("Success");
  } catch (e) {
    console.error("Error:", e.message);
  }
}
run();
