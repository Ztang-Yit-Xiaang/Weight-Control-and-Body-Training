module.exports = function handler(req, res) {
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
