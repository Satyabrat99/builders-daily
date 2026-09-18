import dotenv from 'dotenv';
dotenv.config();

async function testGroqModels() {
  const key = process.env.GROQ_API_KEY;
  for (const model of ['openai/gpt-oss-120b', 'qwen/qwen3.8-27b']) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: 'Output valid JSON: {"status": "ok"}' }],
          response_format: { type: 'json_object' }
        })
      });
      console.log(`Groq [${model}] status:`, res.status);
      if (res.ok) {
        const data = await res.json();
        console.log(`Groq [${model}] content:`, data.choices?.[0]?.message?.content);
        return { model, status: 200 };
      } else {
        console.log(`Groq [${model}] error:`, await res.text());
      }
    } catch (e) {
      console.log(`Groq [${model}] error:`, e.message);
    }
  }
}

async function testCerebrasModels() {
  const key = process.env.CEREBRAS_API_KEY;
  for (const model of ['gpt-oss-120b', 'qwen-3.8-27b']) {
    try {
      const res = await fetch('https://api.cerebras.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: 'Output valid JSON: {"status": "ok"}' }],
          response_format: { type: 'json_object' }
        })
      });
      console.log(`Cerebras [${model}] status:`, res.status);
      if (res.ok) {
        const data = await res.json();
        console.log(`Cerebras [${model}] content:`, data.choices?.[0]?.message?.content);
        return { model, status: 200 };
      } else {
        console.log(`Cerebras [${model}] error:`, await res.text());
      }
    } catch (e) {
      console.log(`Cerebras [${model}] error:`, e.message);
    }
  }
}

async function testOpenRouterFree() {
  const key = process.env.OPENROUTER_API_KEY;
  const models = [
    'google/gemini-2.0-flash-exp:free',
    'meta-llama/llama-3.3-70b-instruct:free',
    'deepseek/deepseek-r1:free',
    'qwen/qwen-2.5-coder-32b-instruct:free'
  ];
  for (const model of models) {
    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: 'Output JSON: {"status": "ok"}' }],
          response_format: { type: 'json_object' }
        })
      });
      console.log(`OpenRouter [${model}] status:`, res.status);
      if (res.ok) {
        const data = await res.json();
        console.log(`OpenRouter [${model}] content:`, data.choices?.[0]?.message?.content);
        return { model, status: 200 };
      } else {
        console.log(`OpenRouter [${model}] error:`, (await res.text()).substring(0, 100));
      }
    } catch (e) {
      console.log(`OpenRouter [${model}] error:`, e.message);
    }
  }
}

async function run() {
  await testGroqModels();
  await testCerebrasModels();
  await testOpenRouterFree();
}

run();
