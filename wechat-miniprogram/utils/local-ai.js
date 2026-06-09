const activityCatalog = [
  ["running", "Running", "跑步", "cardio", "run"],
  ["walking", "Walking", "走路", "cardio", "run"],
  ["cycling", "Cycling", "騎自行車", "cardio", "run"],
  ["swimming", "Swimming", "游泳", "cardio", "run"],
  ["jump-rope", "Jump rope", "跳繩", "cardio", "generic"],
  ["hiit", "HIIT", "高強度間歇", "cardio", "generic"],
  ["basketball", "Basketball", "籃球", "sport", "generic"],
  ["tennis", "Tennis", "網球", "sport", "generic"],
  ["badminton", "Badminton", "羽球", "sport", "generic"],
  ["yoga", "Yoga", "瑜伽", "mobility", "generic"],
  ["plank", "Plank", "棒式", "core", "hold"],
  ["side-plank", "Side plank", "側棒式", "core", "hold"],
  ["crunch", "Crunch", "捲腹", "core", "strength"],
  ["push-up", "Push-up", "伏地挺身", "strength", "strength"],
  ["pull-up", "Pull-up", "引體向上", "strength", "strength"],
  ["squat", "Squat", "深蹲", "strength", "strength"],
  ["lunge", "Lunge", "弓箭步", "strength", "strength"],
  ["deadlift", "Deadlift", "硬舉", "strength", "strength"],
  ["bench-press", "Bench press", "臥推", "strength", "strength"],
  ["row", "Dumbbell row", "啞鈴划船", "strength", "strength"],
  ["housework", "Housework", "家務", "daily", "generic"]
].map(([id, en, zh, category, formType]) => ({ id, label: { en, zh }, category, formType }));

function labelFor(item, locale) {
  return (item && item.label && item.label[locale]) || (item && item.label && item.label.en) || "";
}

function catalogSummary(locale) {
  return activityCatalog.map((item) => ({
    id: item.id,
    name: labelFor(item, locale),
    category: item.category,
    formType: item.formType
  }));
}

function findCatalogByName(text) {
  const lower = String(text || "").toLowerCase();
  return activityCatalog.find((item) => lower.includes(item.id) || lower.includes(item.label.en.toLowerCase()) || lower.includes(item.label.zh));
}

function localParseActivity(text, locale) {
  const catalog = findCatalogByName(text) || activityCatalog[0];
  const durationMatch = String(text).match(/(\d+)\s*(min|mins|minute|minutes|分鐘|分)/i);
  const distanceMatch = String(text).match(/(\d+(?:\.\d+)?)\s*(km|公里|mile|miles|mi)/i);
  const setsMatch = String(text).match(/(\d+)\s*(sets|set|組)/i);
  const repsMatch = String(text).match(/(\d+)\s*(reps|rep|下|次)/i);
  const holdMatch = String(text).match(/(\d+)\s*(sec|secs|second|seconds|秒)/i);
  return {
    catalogId: catalog.id,
    displayName: labelFor(catalog, locale),
    category: catalog.category,
    formType: catalog.formType,
    durationMinutes: durationMatch ? durationMatch[1] : "",
    metrics: {
      distance: distanceMatch ? distanceMatch[1] : "",
      distanceUnit: distanceMatch ? distanceMatch[2] : "",
      sets: setsMatch ? setsMatch[1] : "",
      reps: repsMatch ? repsMatch[1] : "",
      holdSeconds: holdMatch ? holdMatch[1] : "",
      weight: "",
      pace: ""
    },
    intensity: /hard|heavy|高|累|強/i.test(text) ? "Hard" : /easy|light|輕鬆|低/i.test(text) ? "Light" : "Moderate",
    notes: text,
    confidence: locale === "zh" ? "本機備援" : "local fallback",
    missingFields: []
  };
}

function estimateBodyFat(form) {
  const heightCm = Number(form.height);
  const weightKg = Number(form.weight);
  const ageYears = Number(form.age);
  if (!heightCm || !weightKg || !ageYears || !form.sex) return "";
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  const sexFactor = form.sex === "Female" ? 0 : 1;
  const estimate = 1.2 * bmi + 0.23 * ageYears - 10.8 * sexFactor - 5.4;
  const low = Math.max(5, Math.round(estimate - 3));
  const high = Math.min(55, Math.round(estimate + 3));
  return `${low}-${high}%`;
}

function mealIdeas(locale) {
  return locale === "zh"
    ? ["高蛋白穀物碗", "蔬菜歐姆蛋", "簡單恢復點心"]
    : ["Protein grain bowl", "Vegetable omelet", "Simple recovery snack"];
}

module.exports = {
  activityCatalog,
  catalogSummary,
  estimateBodyFat,
  labelFor,
  localParseActivity,
  mealIdeas
};
