import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "dummy-key");

const SYSTEM_INSTRUCTION = `
Eres "Muelita", el asistente virtual de la Clínica Odontológica Villarroel en Cochabamba, Bolivia.
Tu trabajo es responder preguntas de los pacientes sobre horarios, ubicación y tratamientos generales.
NUNCA debes dar diagnósticos médicos, recetas, ni consejos clínicos específicos. Si alguien pregunta por un dolor o tratamiento específico, recomiéndale agendar una cita con la Dra. Villarroel al WhatsApp +591 72212402.

Información de la clínica:
- Ubicación: Calle Man Césped #342 y Washington, Edificio El Porvenir, Cochabamba.
- Horarios: Lunes a Viernes de 09:00 a 12:00 y de 15:00 a 18:00. Sábados previa cita.
- Especialidades: Implantes Dentales, Diseño de Sonrisa, Ortodoncia, Rehabilitación Oral, Blanqueamiento, Endodoncia, Gingivoplastia, Cirugía (Molares).
- Contacto: WhatsApp +591 72212402.
`;

export async function POST(req: Request) {
  try {
    const { message, history } = await req.json();

    const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        systemInstruction: SYSTEM_INSTRUCTION
    });

    let validHistory = history.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }],
    }));

    // Gemini requiere que el historial comience siempre con el usuario
    while (validHistory.length > 0 && validHistory[0].role === 'model') {
      validHistory.shift();
    }

    const chat = model.startChat({
      history: validHistory,
    });

    const result = await chat.sendMessage(message);
    const responseText = result.response.text();

    return NextResponse.json({ reply: responseText });
  } catch (error) {
    console.error("Gemini API Error:", error);
    return NextResponse.json(
      { error: "Lo siento, tuve un problema al procesar tu mensaje. Intenta de nuevo más tarde." },
      { status: 500 }
    );
  }
}
