const state = {
  exerciseType: "Cardio",
  logs: []
};

const logList = document.querySelector("#logList");

function timeNow() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function addLog(title, detail) {
  const entry = { time: timeNow(), title, detail };
  state.logs.unshift(entry);

  const article = document.createElement("article");
  article.innerHTML = `<span>${entry.time}</span><strong>${entry.title}</strong><p>${entry.detail}</p>`;
  logList.prepend(article);
}

function attachPreview(inputId, resultId, analyzer) {
  const input = document.querySelector(inputId);
  const drop = input.closest(".photo-drop");
  const result = document.querySelector(resultId);

  input.addEventListener("change", () => {
    const file = input.files && input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      drop.classList.add("has-preview");
      drop.style.backgroundImage = `linear-gradient(180deg, rgba(0,0,0,0.08), rgba(0,0,0,0.62)), url("${reader.result}")`;
    });
    reader.readAsDataURL(file);

    const insight = analyzer(file.name);
    result.innerHTML = insight.html;
    addLog(insight.title, insight.detail);
  });
}

document.querySelectorAll("[data-exercise-type]").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll("[data-exercise-type]").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    state.exerciseType = button.dataset.exerciseType;
  });
});

attachPreview("#exercisePhoto", "#exerciseResult", () => {
  if (state.exerciseType === "Anaerobic") {
    return {
      title: "Anaerobic session drafted",
      detail: "Strength circuit · 32 min · hard · estimated 210 kcal",
      html: "<strong>AI draft:</strong> Strength circuit detected. Suggested log: 32 min, hard intensity, push/pull pattern. Add warm-up mobility next time."
    };
  }

  return {
    title: "Cardio session drafted",
    detail: "Running or cycling · 42 min · moderate · estimated 430 kcal",
    html: "<strong>AI draft:</strong> Cardio activity detected. Suggested log: 42 min, moderate intensity, aerobic base focus. Hydrate and add protein within 90 minutes."
  };
});

attachPreview("#mealPhoto", "#mealResult", () => ({
  title: "Meal photo analyzed",
  detail: "Balanced plate · 620 kcal · 42g protein",
  html: "<strong>AI estimate:</strong> Rice or grain base, lean protein, vegetables. Approx. 620 kcal, 42g protein, 68g carbs, 18g fat. Confidence: medium; edit portions if needed."
}));

attachPreview("#ingredientPhoto", "#mealSuggestions", () => ({
  title: "Kitchen ingredients scanned",
  detail: "3 meal ideas generated from visible ingredients",
  html: `
    <article><strong>Egg spinach rice bowl</strong><span>Fast recovery meal · 24g protein · uses pantry staples</span></article>
    <article><strong>Greek yogurt protein plate</strong><span>No-cook option · fruit or nuts work well · good late snack</span></article>
    <article><strong>Salmon vegetable skillet</strong><span>High protein dinner · 20 min · supports strength training</span></article>
  `
}));

document.querySelector("#exerciseForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const duration = data.get("duration") || "30";
  const intensity = data.get("intensity");
  const detail = `${state.exerciseType} · ${duration} min · ${intensity}`;
  document.querySelector("#exerciseResult").innerHTML = `<strong>Manual log saved:</strong> ${detail}. The AI coach will use this for load and recovery suggestions.`;
  addLog("Exercise added manually", detail);
});

document.querySelector("#mealForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const note = data.get("note") || "Meal";
  const portion = data.get("portion");
  const detail = `${note} · ${portion} portion`;
  document.querySelector("#mealResult").innerHTML = `<strong>Meal saved:</strong> ${detail}. Add a photo later to improve macro confidence.`;
  addLog("Meal added manually", detail);
});

document.querySelector("#sleepForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const sleepAt = data.get("sleepAt");
  const wakeAt = data.get("wakeAt");
  const quality = data.get("quality");
  const detail = `${sleepAt} to ${wakeAt} · quality ${quality}/10`;
  document.querySelector("#sleepResult").textContent = `Sleep updated: ${detail}. Keep bedtime within a 45 minute window for better recovery trend quality.`;
  document.querySelector("#sleepScore").textContent = "Updated";
  addLog("Sleep timing updated", detail);
});

document.querySelector("#ingredientForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const ingredients = String(data.get("ingredients") || "").toLowerCase();
  const suggestions = document.querySelector("#mealSuggestions");

  const hasEggs = ingredients.includes("egg");
  const hasFish = ingredients.includes("salmon") || ingredients.includes("fish") || ingredients.includes("tuna");
  const hasYogurt = ingredients.includes("yogurt");

  suggestions.innerHTML = `
    <article><strong>${hasFish ? "Salmon rice bowl" : "Lean protein grain bowl"}</strong><span>Post-workout option · prioritize protein and slow carbs</span></article>
    <article><strong>${hasEggs ? "Spinach egg wrap" : "Vegetable omelet"}</strong><span>Quick breakfast · easy portion control · high satiety</span></article>
    <article><strong>${hasYogurt ? "Greek yogurt recovery bowl" : "Simple recovery snack"}</strong><span>Low prep · useful when dinner is light or protein is behind</span></article>
  `;
  addLog("Meal suggestions generated", ingredients || "From kitchen photo");
});

document.querySelector("#quickReviewBtn").addEventListener("click", () => {
  const message = "Today: keep cardio moderate, add 25-35g protein at dinner, and protect the 23:30 sleep target.";
  addLog("Daily review complete", message);
});
