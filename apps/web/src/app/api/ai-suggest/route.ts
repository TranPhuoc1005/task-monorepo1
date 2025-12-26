import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
    const { messages } = await req.json();

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

    const model = genAI.getGenerativeModel({
        model: "gemini-1.0-pro",
    });

    const result = await model.generateContent(messages[0].content);

    return Response.json({
        content: [
            {
                type: "text",
                text: result.response.text(),
            },
        ],
    });
}
