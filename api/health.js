const { handleOptions, setCors } = require("./_openai");

module.exports = async function handler(req, res) {
  if (handleOptions(req, res)) return;
  setCors(res);

  res.status(200).json({
    ok: true,
    service: "vital-lens-ai",
    openaiConfigured: Boolean(process.env.OPENAI_API_KEY),
    model: process.env.OPENAI_MODEL || "gpt-4o"
  });
};
