import OpenAI from 'openai';
const openai = new OpenAI();

export default async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();

  const { userType, selectors, dry } = req.body;     // selectors = [{prompt,default}]
  const messages = [{ role: 'system', content: 'You are a web CRO copy assistant.' }];

  selectors.forEach(({ prompt, default: d }) =>
    messages.push({ role: 'user', content: `${prompt}. Original: "${d}"` })
  );

  if (dry) {           // allow preview without cost
    const fake = selectors.map(s => `[Preview] ${s.default}`);
    return res.json({ variants: fake });
  }

  const { choices } = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages
  });

  const variants = choices[0].message.content
    .split('\n')
    .map(l => l.replace(/^\d+\.?\s*/, '').trim())
    .filter(Boolean);

  return res.json({ variants });
};