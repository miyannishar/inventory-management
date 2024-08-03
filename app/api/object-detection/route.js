// app/api/detect-object/route.js
import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request) {
  try {
    const { image, inventoryItems } = await request.json();

    if (!image) {
      console.error('No image data received');
      return NextResponse.json({ error: 'No image data received' }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is not set');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    console.log('Sending request to OpenAI API...');
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: `What object is in this image? Only respond with one of these words: ${inventoryItems.join(', ')}. If none of these objects are present, say 'none'.` },
              { type: "image_url", image_url: { url: image } }
            ],
          },
        ],
        max_tokens: 300
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('Received response from OpenAI API');
    const detectedObject = response.data.choices[0].message.content.toLowerCase().trim();
    return NextResponse.json({ detectedObject });
  } catch (error) {
    console.error('Error in detect-object API route:', error);
    if (error.response) {
      console.error('OpenAI API response:', error.response.data);
    }
    return NextResponse.json({ error: 'An error occurred during object detection', details: error.message }, { status: 500 });
  }
}