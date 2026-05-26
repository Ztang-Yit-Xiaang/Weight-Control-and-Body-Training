const { createStructuredResponse, handleOptions, readBody, sendError, setCors } = require("./_openai");

const analysisSchema = {
  type: "object",
  additionalProperties: false,
  required: ["analysis"],
  properties: {
    analysis: {
      type: "object",
      additionalProperties: false,
      required: ["mode", "confidence", "activity", "foods", "calories", "protein", "carbs", "fat", "ingredients", "suggestions", "estimatedRange", "notes"],
      properties: {
        mode: { type: "string", enum: ["exercise", "meal", "ingredients", "body"] },
        confidence: { type: "string" },
        activity: {
          type: "object",
          additionalProperties: false,
          required: ["catalogId", "displayName", "category", "formType", "durationMinutes", "metrics", "intensity", "notes", "confidence", "missingFields"],
          properties: {
            catalogId: { type: "string" },
            displayName: { type: "string" },
            category: { type: "string" },
            formType: { type: "string", enum: ["run", "hold", "strength", "generic"] },
            durationMinutes: { type: ["number", "string"] },
            metrics: {
              type: "object",
              additionalProperties: false,
              required: ["distance", "distanceUnit", "sets", "reps", "holdSeconds", "weight", "pace"],
              properties: {
                distance: { type: ["number", "string"] },
                distanceUnit: { type: "string" },
                sets: { type: ["number", "string"] },
                reps: { type: ["number", "string"] },
                holdSeconds: { type: ["number", "string"] },
                weight: { type: ["number", "string"] },
                pace: { type: "string" }
              }
            },
            intensity: { type: "string" },
            notes: { type: "string" },
            confidence: { type: "string" },
            missingFields: { type: "array", items: { type: "string" } }
          }
        },
        foods: { type: "array", items: { type: "string" } },
        calories: { type: ["number", "string"] },
        protein: { type: ["number", "string"] },
        carbs: { type: ["number", "string"] },
        fat: { type: ["number", "string"] },
        ingredients: { type: "array", items: { type: "string" } },
        suggestions: { type: "array", items: { type: "string" } },
        estimatedRange: { type: "string" },
        notes: { type: "string" }
      }
    }
  }
};

function buildContent(body) {
  const prompt = {
    mode: body.mode,
    locale: body.locale || "en",
    context: body.context || {}
  };

  const content = [
    {
      type: "input_text",
      text: JSON.stringify(prompt)
    }
  ];

  if (body.imageDataUrl) {
    content.push({
      type: "input_image",
      image_url: body.imageDataUrl
    });
  }

  return content;
}

module.exports = async function handler(req, res) {
  if (handleOptions(req, res)) return;
  setCors(res);

  if (req.method !== "POST") {
    res.status(405).json({ error: "Use POST." });
    return;
  }

  try {
    const body = await readBody(req);
    if (!["exercise", "meal", "ingredients", "body"].includes(body.mode)) {
      res.status(400).json({ error: "Invalid mode." });
      return;
    }
    if (!body.imageDataUrl && body.mode !== "ingredients") {
      res.status(400).json({ error: "Missing imageDataUrl." });
      return;
    }

    const result = await createStructuredResponse({
      name: "photo_analysis",
      schema: analysisSchema,
      instructions: [
        "Analyze a wellness tracker input and return structured JSON only.",
        "For exercise photos, estimate visible activity if possible, but do not invent exact duration unless context provides it.",
        "For meal photos, estimate foods and macros as rough educational values with uncertainty in notes.",
        "For ingredients, detect visible or provided ingredients and suggest practical meals.",
        "For body mode, return only an educational body-fat percentage range. Use supplied height, weight, age, and sex context if available. Do not provide medical diagnosis.",
        "For fields unrelated to the requested mode, return empty arrays, empty strings, or zero-like values while preserving the full schema."
      ].join(" "),
      input: [
        {
          role: "user",
          content: buildContent(body)
        }
      ]
    });

    res.status(200).json(result);
  } catch (error) {
    sendError(res, error);
  }
};
