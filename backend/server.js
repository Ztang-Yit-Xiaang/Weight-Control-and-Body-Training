const health = require("./api/health");
const parseActivity = require("./api/parse-activity");
const analyzePhoto = require("./api/analyze-photo");

function patchResponse(res) {
  if (!res.status) {
    res.status = function status(code) {
      res.statusCode = code;
      return res;
    };
  }
  if (!res.json) {
    res.json = function json(body) {
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.end(JSON.stringify(body));
    };
  }
}

module.exports = function handler(req, res) {
  const path = (req.url || "").split("?")[0];
  patchResponse(res);

  if (path === "/api/health") return health(req, res);
  if (path === "/api/parse-activity") return parseActivity(req, res);
  if (path === "/api/analyze-photo") return analyzePhoto(req, res);

  res.statusCode = 200;
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.end(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Vital Lens AI Backend</title>
  </head>
  <body>
    <main>
      <h1>Vital Lens AI Backend</h1>
      <p>This Vercel deployment hosts the AI API for the Vital Lens iPhone app.</p>
      <p>Health check: <a href="/api/health">/api/health</a></p>
    </main>
  </body>
</html>`);
};
