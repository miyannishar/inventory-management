import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  try {
    const body = await request.json();
    const { image, inventoryItems } = body;

    if (!image) {
      return NextResponse.json({ error: 'No image data received' }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OpenAI API key is not set' }, { status: 500 });
    }

    console.log('Sending request to OpenAI API...');
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: `Which fruit and vegetable is in this image that I am holding in the hand? If it's one of these items: ${inventoryItems.join(', ')}, respond with that item name. If it's a fruit or vegetable not in the list, respond with the name of the fruit or vegetable. If its not a fruit or vegetable, respond with none` },
            { type: "image_url", image_url: { url: image } }
          ],
        },
      ],
      max_tokens: 300
    });

    console.log('Received response from OpenAI API');
    const detectedObject = response.choices[0].message.content.toLowerCase().trim();
    return NextResponse.json({ detectedObject });
  } catch (error) {
    console.error('Error in object-detection API route:', error);
    return NextResponse.json(
      { error: 'An error occurred during object detection', details: error.message },
      { status: 500 }
    );
  }
}
