const { chooseImage, imageToDataUrl, requestJson } = require("../../utils/api");
const { catalogSummary, estimateBodyFat, localParseActivity, mealIdeas } = require("../../utils/local-ai");

const STORAGE_KEY = "vital-lens-wechat-state-v1";
const DEFAULT_API_URL = "https://weight-control-and-body-training.vercel.app";

const copy = {
  en: {
    activity: "Activity",
    aiBackend: "AI backend",
    aiTest: "AI Test",
    analyzeBody: "Analyze body photo",
    analyzeExercise: "Analyze exercise photo",
    analyzeIngredients: "Analyze ingredients photo",
    analyzeMeal: "Analyze meal photo",
    apiUrl: "AI API URL",
    body: "Body",
    bodyHelp: "Educational 體脂率 range only, not a medical measurement.",
    calendarNote: "WeChat Mini Program does not write Apple Calendar. Use reminders inside WeChat or add calendar integration later through your backend.",
    connected: "Connected",
    diet: "Diet",
    duration: "Duration min",
    exerciseDraft: "Exercise draft",
    height: "Height cm",
    home: "Home",
    ingredients: "Ingredients",
    intensity: "Intensity",
    kitchen: "Kitchen",
    language: "Language",
    logs: "Recent logs",
    mealNote: "Meal note",
    missingUrl: "Missing AI API URL",
    minute: "min",
    parse: "Parse with AI",
    photoAi: "Photo AI",
    photoFallback: "Photo AI fallback",
    protein: "protein",
    save: "Save",
    settings: "Settings",
    sleep: "Sleep",
    sleepAt: "Sleep time",
    sleepQuality: "Sleep quality 1-10",
    suggestMeals: "Suggest meals",
    testIntro: "Run these examples before real logging.",
    today: "Today",
    wakeAt: "Wake time",
    weight: "Weight kg",
    welcome: "Camera-first wellness logging inside WeChat.",
    age: "Age",
    aiFallback: "AI fallback",
    sex: "Sex",
    male: "Male",
    female: "Female"
  },
  zh: {
    activity: "活動",
    aiBackend: "AI 後端",
    aiTest: "AI 測試",
    analyzeBody: "分析身體照片",
    analyzeExercise: "分析運動照片",
    analyzeIngredients: "分析食材照片",
    analyzeMeal: "分析餐點照片",
    apiUrl: "AI API 網址",
    body: "身體",
    bodyHelp: "只提供教育用途的體脂率區間，不是醫療測量。",
    calendarNote: "微信小程式目前不直接寫入 Apple 行事曆。可先用微信內提醒，之後再透過後端加行事曆整合。",
    connected: "已連線",
    diet: "飲食",
    duration: "時間 分鐘",
    exerciseDraft: "運動草稿",
    height: "身高 cm",
    home: "首頁",
    ingredients: "食材",
    intensity: "強度",
    kitchen: "廚房",
    language: "語言",
    logs: "最近紀錄",
    mealNote: "餐點備註",
    missingUrl: "需要 AI API 網址",
    minute: "分鐘",
    parse: "用 AI 解析",
    photoAi: "照片 AI",
    photoFallback: "照片 AI 備援",
    protein: "蛋白質",
    save: "儲存",
    settings: "設定",
    sleep: "睡眠",
    sleepAt: "入睡時間",
    sleepQuality: "睡眠品質 1-10",
    suggestMeals: "建議餐點",
    testIntro: "正式記錄前，先用這些範例測試。",
    today: "今天",
    wakeAt: "起床時間",
    weight: "體重 kg",
    welcome: "在微信內用拍照優先的方式記錄健康。",
    age: "年齡",
    aiFallback: "AI 備援",
    sex: "性別",
    male: "男性",
    female: "女性"
  }
};

function detectLocale() {
  try {
    const info = wx.getSystemInfoSync();
    return String(info.language || "").toLowerCase().startsWith("zh") ? "zh" : "en";
  } catch (error) {
    return "zh";
  }
}

function makeTabs(text) {
  return [
    { key: "home", label: text.home },
    { key: "activity", label: text.activity },
    { key: "diet", label: text.diet },
    { key: "kitchen", label: text.kitchen },
    { key: "body", label: text.body },
    { key: "sleep", label: text.sleep },
    { key: "settings", label: text.settings }
  ];
}

function makeId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

Page({
  data: {
    activeTab: "home",
    apiUrl: DEFAULT_API_URL,
    locale: "zh",
    text: copy.zh,
    tabs: makeTabs(copy.zh),
    activityText: "跑步 30 分鐘 3 miles easy",
    activityDraft: localParseActivity("跑步 30 分鐘", "zh"),
    mealNote: "",
    ingredients: "eggs, spinach, salmon, rice, Greek yogurt",
    bodyForm: {
      height: "",
      weight: "",
      age: "",
      sex: "Male"
    },
    sexOptions: [copy.zh.male, copy.zh.female],
    sexIndex: 0,
    sleepAt: "23:35",
    wakeAt: "07:00",
    sleepQuality: "8",
    logs: [],
    latestMeal: null,
    latestIngredients: null,
    latestBody: null,
    aiTestResult: "",
    busy: ""
  },

  onLoad() {
    const saved = wx.getStorageSync(STORAGE_KEY) || {};
    const locale = saved.locale || detectLocale();
    const text = copy[locale] || copy.zh;
    const bodyForm = saved.bodyForm || this.data.bodyForm;
    this.setData({
      ...saved,
      locale,
      text,
      tabs: makeTabs(text),
      apiUrl: saved.apiUrl || DEFAULT_API_URL,
      bodyForm,
      sexOptions: [text.male, text.female],
      sexIndex: bodyForm.sex === "Female" ? 1 : 0
    });
  },

  persist() {
    wx.setStorageSync(STORAGE_KEY, {
      apiUrl: this.data.apiUrl,
      locale: this.data.locale,
      logs: this.data.logs,
      latestMeal: this.data.latestMeal,
      latestIngredients: this.data.latestIngredients,
      latestBody: this.data.latestBody,
      bodyForm: this.data.bodyForm,
      sleepAt: this.data.sleepAt,
      wakeAt: this.data.wakeAt,
      sleepQuality: this.data.sleepQuality
    });
  },

  switchTab(event) {
    this.setData({ activeTab: event.currentTarget.dataset.tab });
  },

  setLocale(event) {
    const locale = event.currentTarget.dataset.locale;
    const text = copy[locale] || copy.zh;
    this.setData({ locale, text, tabs: makeTabs(text), sexOptions: [text.male, text.female] });
    this.persist();
  },

  onInput(event) {
    const field = event.currentTarget.dataset.field;
    this.setData({ [field]: event.detail.value });
    this.persist();
  },

  onBodyInput(event) {
    const field = event.currentTarget.dataset.field;
    this.setData({ [`bodyForm.${field}`]: event.detail.value });
    this.persist();
  },

  onSexChange(event) {
    const sexIndex = Number(event.detail.value) || 0;
    this.setData({
      sexIndex,
      "bodyForm.sex": sexIndex === 1 ? "Female" : "Male"
    });
    this.persist();
  },

  addLog(title, detail) {
    const log = { id: makeId("log"), title, detail, time: new Date().toLocaleString() };
    this.setData({ logs: [log, ...this.data.logs].slice(0, 20) });
    this.persist();
  },

  async postAI(path, payload) {
    return requestJson(this.data.apiUrl, path, payload);
  },

  async parseActivity() {
    this.setData({ busy: "parse" });
    try {
      const result = await this.postAI("/api/parse-activity", {
        text: this.data.activityText,
        locale: this.data.locale,
        activityCatalogSummary: catalogSummary(this.data.locale)
      });
      const activity = { ...localParseActivity(this.data.activityText, this.data.locale), ...result.activity };
      this.setData({ activityDraft: activity });
      this.addLog(this.data.text.activity, `${activity.displayName} · ${activity.durationMinutes || "?"} ${this.data.text.minute} · ${activity.confidence || "AI"}`);
    } catch (error) {
      const activity = localParseActivity(this.data.activityText, this.data.locale);
      this.setData({ activityDraft: activity });
      wx.showModal({ title: this.data.text.aiFallback, content: error.message, showCancel: false });
    } finally {
      this.setData({ busy: "" });
    }
  },

  saveActivity() {
    const draft = this.data.activityDraft;
    this.addLog(this.data.text.activity, `${draft.displayName} · ${draft.durationMinutes || "?"} ${this.data.text.minute} · ${draft.intensity}`);
    wx.showToast({ title: this.data.text.save });
  },

  async analyzePhotoMode(mode) {
    this.setData({ busy: mode });
    try {
      const filePath = await chooseImage();
      const imageDataUrl = await imageToDataUrl(filePath);
      const result = await this.postAI("/api/analyze-photo", {
        mode,
        imageDataUrl,
        locale: this.data.locale,
        context: {
          bodyForm: this.data.bodyForm,
          ingredients: this.data.ingredients,
          activityCatalogSummary: catalogSummary(this.data.locale)
        }
      });
      const analysis = result.analysis || {};
      if (mode === "exercise") {
        const activity = analysis.activity || localParseActivity("cardio 30 minutes", this.data.locale);
        this.setData({ activityDraft: activity });
        this.addLog(this.data.text.activity, `${activity.displayName || mode} · ${analysis.confidence || activity.confidence || "AI"}`);
      }
      if (mode === "meal") {
        this.setData({ latestMeal: analysis });
        this.addLog(this.data.text.diet, `${(analysis.foods || []).join(", ")} · ${analysis.calories || "?"} kcal`);
      }
      if (mode === "ingredients") {
        this.setData({ latestIngredients: analysis });
        this.addLog(this.data.text.kitchen, `${(analysis.ingredients || []).join(", ")}`);
      }
      if (mode === "body") {
        const fallbackRange = estimateBodyFat(this.data.bodyForm);
        const estimate = {
          estimatedRange: analysis.estimatedRange || fallbackRange,
          confidence: analysis.confidence || "educational fallback",
          notes: analysis.notes || this.data.text.bodyHelp
        };
        this.setData({ latestBody: estimate });
        this.addLog(this.data.text.body, `${estimate.estimatedRange} · ${estimate.confidence}`);
      }
      this.persist();
    } catch (error) {
      wx.showModal({ title: this.data.text.photoFallback, content: error.message, showCancel: false });
    } finally {
      this.setData({ busy: "" });
    }
  },

  analyzeExercisePhoto() {
    return this.analyzePhotoMode("exercise");
  },

  analyzeMealPhoto() {
    return this.analyzePhotoMode("meal");
  },

  analyzeIngredientsPhoto() {
    return this.analyzePhotoMode("ingredients");
  },

  analyzeBodyPhoto() {
    return this.analyzePhotoMode("body");
  },

  async suggestMeals() {
    this.setData({ busy: "ingredients" });
    try {
      const result = await this.postAI("/api/analyze-photo", {
        mode: "ingredients",
        locale: this.data.locale,
        context: { ingredients: this.data.ingredients }
      });
      const analysis = result.analysis || {};
      const latestIngredients = {
        ingredients: analysis.ingredients || this.data.ingredients.split(",").map((item) => item.trim()).filter(Boolean),
        suggestions: analysis.suggestions || mealIdeas(this.data.locale),
        confidence: analysis.confidence || "AI"
      };
      this.setData({ latestIngredients });
      this.addLog(this.data.text.kitchen, latestIngredients.ingredients.join(", "));
      this.persist();
    } catch (error) {
      this.setData({
        latestIngredients: {
          ingredients: this.data.ingredients.split(",").map((item) => item.trim()).filter(Boolean),
          suggestions: mealIdeas(this.data.locale),
          confidence: "local fallback"
        }
      });
      wx.showModal({ title: this.data.text.aiFallback, content: error.message, showCancel: false });
    } finally {
      this.setData({ busy: "" });
    }
  },

  saveMeal() {
    const note = this.data.mealNote || (this.data.locale === "zh" ? "餐點" : "Meal");
    this.setData({ latestMeal: { foods: [note], calories: 0, protein: 0, confidence: "manual" }, mealNote: "" });
    this.addLog(this.data.text.diet, note);
    this.persist();
  },

  estimateBody() {
    const range = estimateBodyFat(this.data.bodyForm);
    if (!range) {
      wx.showModal({ title: this.data.text.body, content: this.data.text.bodyHelp, showCancel: false });
      return;
    }
    const estimate = { estimatedRange: range, confidence: "educational fallback", notes: this.data.text.bodyHelp };
    this.setData({ latestBody: estimate });
    this.addLog(this.data.text.body, range);
    this.persist();
  },

  saveSleep() {
    this.addLog(this.data.text.sleep, `${this.data.sleepAt} - ${this.data.wakeAt} · ${this.data.sleepQuality}/10`);
    this.persist();
    wx.showToast({ title: this.data.text.save });
  },

  async runTextTest(event) {
    const example = event.currentTarget.dataset.example;
    this.setData({ busy: "test" });
    try {
      const result = await this.postAI("/api/parse-activity", {
        text: example,
        locale: this.data.locale,
        activityCatalogSummary: catalogSummary(this.data.locale)
      });
      this.setData({ aiTestResult: JSON.stringify(result.activity || result, null, 2) });
    } catch (error) {
      this.setData({ aiTestResult: JSON.stringify({ error: error.message, fallback: localParseActivity(example, this.data.locale) }, null, 2) });
    } finally {
      this.setData({ busy: "" });
    }
  },

  async runPhotoTest(event) {
    const mode = event.currentTarget.dataset.mode;
    this.setData({ busy: "test" });
    try {
      const filePath = await chooseImage();
      const imageDataUrl = await imageToDataUrl(filePath);
      const result = await this.postAI("/api/analyze-photo", {
        mode,
        imageDataUrl,
        locale: this.data.locale,
        context: {
          bodyForm: this.data.bodyForm,
          ingredients: this.data.ingredients,
          activityCatalogSummary: catalogSummary(this.data.locale)
        }
      });
      this.setData({ aiTestResult: JSON.stringify(result.analysis || result, null, 2) });
    } catch (error) {
      this.setData({ aiTestResult: JSON.stringify({ error: error.message }, null, 2) });
    } finally {
      this.setData({ busy: "" });
    }
  }
});
