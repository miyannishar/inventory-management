import { NextResponse } from 'next/server';

export async function POST(request) {
  console.log('API route called');

  const body = await request.json();
  console.log('Request body:', body);

  const { ingredients } = body;

  if (!ingredients || (Array.isArray(ingredients) && ingredients.length === 0)) {
    return NextResponse.json({ message: 'Invalid ingredients list' }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ message: 'OpenAI API key is not set' }, { status: 500 });
  }

  try {
    const ingredientsList = Array.isArray(ingredients) ? ingredients.join(', ') : ingredients;
    console.log('Calling OpenAI API with ingredients:', ingredientsList);
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a helpful assistant that suggests recipes based on available ingredients." },
          { role: "user", content: `Suggest a recipe using some or all of these ingredients: ${ingredientsList}. Provide the recipe name, ingredients list, and step-by-step instructions.` }
        ],
        max_tokens: 500
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API responded with status ${response.status}`);
    }

    const data = await response.json();
    console.log('OpenAI API response:', data);

    const recipeText = data.choices[0].message.content;

    const recipeParts = recipeText.split('\n\n');
    const recipe = {
      name: recipeParts[0].replace('Recipe: ', ''),
      ingredients: recipeParts[1].replace('Ingredients:\n', '').split('\n'),
      steps: recipeParts[2].replace('Instructions:\n', '').split('\n'),
    };

    console.log('Sending recipe:', recipe);
    return NextResponse.json({ recipe });
  } catch (error) {
    console.error('Error in API route:', error);
    return NextResponse.json({ 
      message: 'Error generating recipe suggestion', 
      error: error.message
    }, { status: 500 });
  }
}