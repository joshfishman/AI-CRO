(async () => {
  const path = window.location.pathname.replace(/\/$/, '');
  const configUrl = `/configs${path.replace(/\W+/g, '-')}.json`;

  try {
    const config = await fetch(configUrl).then(res => res.json());

    const messages = [{ role: "system", content: "You are a web copy optimizer." }];
    config.selectors.forEach(({ selector, prompt, default: def }) => {
      messages.push({ role: "user", content: `${prompt} Original: "${def}"` });
    });

    const userType = sessionStorage.getItem("user_type") || "default";
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer YOUR_OPENAI_KEY`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ model: "gpt-4o", messages })
    });

    const content = await res.json();
    const updates = content.choices[0].message.content
      .split("\n")
      .map(l => l.replace(/^\d+\.\s*/, '').trim())
      .filter(Boolean);

    config.selectors.forEach((item, i) => {
      const el = document.querySelector(item.selector);
      if (el && updates[i]) el.textContent = updates[i];
    });

  } catch (err) {
    console.error("Personalization failed or config missing", err);
  }
})();