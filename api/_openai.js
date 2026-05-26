const MODEL = process.env.OPENAI_MODEL || "gpt-4o";

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function handleOptions(req, res) {
  setCors(res);
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return true;
  }
  return false;
}

async function readBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") return JSON.parse(req.body || "{}");
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

function extractJson(response) {
  if (response.output_text) return JSON.parse(response.output_text);
  const texts = [];
  for (const item of response.output || []) {
    for (const part of item.content || []) {
      if (part.type === "output_text" && part.text) texts.push(part.text);
      if (part.type === "text" && part.text) texts.push(part.text);
    }
  }
  if (!texts.length) throw new Error("OpenAI response did not include JSON text.");
  return JSON.parse(texts.join(""));
}

async function createStructuredResponse({ instructions, input, schema, name }) {
  if (!process.env.OPENAI_API_KEY) {
    const error = new Error("OPENAI_API_KEY is not configured on the backend.");
    error.statusCode = 500;
    throw error;
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: MODEL,
      instructions,
      input,
      text: {
        format: {
          type: "json_schema",
          name,
          strict: true,
          schema
        }
      }
    })
  });

  const json = await response.json();
  if (!response.ok) {
    const error = new Error(json.error?.message || `OpenAI request failed with ${response.status}`);
    error.statusCode = response.status;
    throw error;
  }
  return extractJson(json);
}

function sendError(res, error) {
  setCors(res);
  res.status(error.statusCode || 500).json({ error: error.message || "Unexpected server error" });
}

module.exports = {
  createStructuredResponse,
  handleOptions,
  readBody,
  sendError,
  setCors
};
