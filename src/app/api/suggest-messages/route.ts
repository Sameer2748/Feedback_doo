// app/api/suggest-messages/route.ts
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // Ensure you have this in your .env file
});

export async function POST(request: Request) {
    try {
        const prompt =
            "Create a list of three open-ended and engaging questions formatted as a single string. Each question should be separated by '||'. These questions are for an anonymous social messaging platform, like Qooh.me, and should be suitable for a diverse audience.";

        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo', // or 'gpt-4', depending on your access
            messages: [
                { role: 'system', content: 'You are a helpful assistant.' },
                { role: 'user', content: prompt },
            ],
        });

        const questions = completion.choices[0].message.content; // Get the generated questions

        return NextResponse.json({ success: true, questions }); // Use NextResponse for App Router
    } catch (error) {
        console.error('Error fetching data from OpenAI:', error);
        return NextResponse.json({ success: false, message: 'Error fetching data from OpenAI' }, { status: 500 });
    }
}
