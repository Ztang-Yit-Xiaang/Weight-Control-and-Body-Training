const { createStructuredResponse, handleOptions, readBody, sendError, setCors } = require("./_openai");

const activitySchema = {
  type: "object",
  additionalProperties: false,
  required: ["activity"],
  properties: {
    activity: {
      type: "object",
      additionalProperties: false,
      required: ["catalogId", "displayName", "category", "formType", "durationMinutes", "metrics", "intensity", "notes", "confidence", "missingFields"],
      properties: {
        catalogId: { type: "string" },
        displayName: { type: "string" },
        category: { type: "string", enum: ["cardio", "strength", "core", "mobility", "sport", "daily", "recovery", "generic"] },
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
        intensity: { type: "string", enum: ["Light", "Moderate", "Hard"] },
        notes: { type: "string" },
        confidence: { type: "string" },
        missingFields: { type: "array", items: { type: "string" } }
      }
    }
  }
};

module.exports = async function handler(req, res) {
  if (handleOptions(req, res)) return;
  setCors(res);

  if (req.method !== "POST") {
    res.status(405).json({ error: "Use POST." });
    return;
  }

  try {
    const body = await readBody(req);
    if (!body.text || typeof body.text !== "string") {
      res.status(400).json({ error: "Missing text." });
      return;
    }

    const result = await createStructuredResponse({
      name: "activity_parse",
      schema: activitySchema,
      instructions: [
        "Parse multilingual exercise text into an editable activity draft for a wellness tracker.",
        "Prefer the closest catalogId from the provided catalog. If uncertain, use a generic form but preserve the user's wording in notes.",
        "For running/walking/cycling/swimming use formType run. For plank/wall-sit holds use hold. For reps/sets/weight use strength.",
        "Never invent precise metrics that are not present. Put missing information in missingFields.",
        "Return Traditional Chinese displayName when locale is zh, otherwise English."
      ].join(" "),
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: JSON.stringify({
                text: body.text,
                locale: body.locale || "en",
                activityCatalogSummary: body.activityCatalogSummary || []
              })
            }
          ]
        }
      ]
    });

    res.status(200).json(result);
  } catch (error) {
    sendError(res, error);
  }
};
