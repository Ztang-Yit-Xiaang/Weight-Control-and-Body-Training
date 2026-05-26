import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Calendar from "expo-calendar";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import * as Notifications from "expo-notifications";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Image,
  Linking,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true
  })
});

const STORAGE_KEY = "vital-lens-state-v2";
const DEFAULT_AI_API_URL = process.env.EXPO_PUBLIC_AI_API_URL || "";

const copy = {
  en: {
    aiUrl: "AI API URL",
    activity: "Activity",
    activityCenter: "Activity Center",
    activityName: "Activity name",
    addPlan: "Add plan",
    aiDraft: "AI draft",
    analyzeBody: "Analyze body photo",
    analyzeIngredients: "Analyze ingredients",
    analyzeMeal: "Analyze meal photo",
    analyzeWorkout: "Analyze workout photo",
    body: "Body",
    calendar: "Calendar",
    checkList: "Today Checklist",
    complete: "Complete",
    confidence: "Confidence",
    diet: "Diet",
    distance: "Distance",
    duration: "Duration min",
    english: "English",
    freeText: "Free text in any language",
    history: "History",
    home: "Home",
    intensity: "Intensity",
    kitchen: "Kitchen",
    language: "Language",
    manualForm: "Manual sport form",
    notes: "Notes",
    parseWithAI: "Parse with AI",
    photoAI: "Photo AI",
    saveActivity: "Save activity",
    settings: "Settings",
    sleep: "Sleep",
    today: "Today",
    traditionalChinese: "繁體中文"
  },
  zh: {
    aiUrl: "AI API 網址",
    activity: "活動",
    activityCenter: "活動中心",
    activityName: "活動名稱",
    addPlan: "加入計畫",
    aiDraft: "AI 草稿",
    analyzeBody: "分析身體照片",
    analyzeIngredients: "分析食材",
    analyzeMeal: "分析餐點照片",
    analyzeWorkout: "分析運動照片",
    body: "身體",
    calendar: "行事曆",
    checkList: "今日清單",
    complete: "完成",
    confidence: "信心度",
    diet: "飲食",
    distance: "距離",
    duration: "時間 分鐘",
    english: "English",
    freeText: "任何語言自由輸入",
    history: "歷史紀錄",
    home: "首頁",
    intensity: "強度",
    kitchen: "廚房",
    language: "語言",
    manualForm: "手動專項表單",
    notes: "備註",
    parseWithAI: "用 AI 解析",
    photoAI: "照片 AI",
    saveActivity: "儲存活動",
    settings: "設定",
    sleep: "睡眠",
    today: "今天",
    traditionalChinese: "繁體中文"
  }
};

const activityCatalog = [
  ["running", "Running", "跑步", "cardio", "run", true],
  ["walking", "Walking", "走路", "cardio", "run", false],
  ["hiking", "Hiking", "健行", "cardio", "run", true],
  ["cycling", "Cycling", "騎自行車", "cardio", "run", true],
  ["indoor-bike", "Indoor bike", "室內腳踏車", "cardio", "run", true],
  ["swimming", "Swimming", "游泳", "cardio", "run", false],
  ["rowing", "Rowing", "划船機", "cardio", "run", true],
  ["elliptical", "Elliptical", "橢圓機", "cardio", "run", true],
  ["jump-rope", "Jump rope", "跳繩", "cardio", "generic", true],
  ["hiit", "HIIT", "高強度間歇", "cardio", "generic", true],
  ["stairs", "Stairs", "爬樓梯", "cardio", "generic", true],
  ["treadmill", "Treadmill", "跑步機", "cardio", "run", true],
  ["basketball", "Basketball", "籃球", "sport", "generic", true],
  ["tennis", "Tennis", "網球", "sport", "generic", true],
  ["badminton", "Badminton", "羽球", "sport", "generic", true],
  ["soccer", "Soccer", "足球", "sport", "generic", true],
  ["volleyball", "Volleyball", "排球", "sport", "generic", true],
  ["boxing", "Boxing", "拳擊", "sport", "generic", true],
  ["dance", "Dance", "跳舞", "sport", "generic", true],
  ["yoga", "Yoga", "瑜伽", "mobility", "generic", true],
  ["pilates", "Pilates", "皮拉提斯", "mobility", "generic", true],
  ["stretching", "Stretching", "伸展", "mobility", "generic", false],
  ["mobility", "Mobility", "活動度訓練", "mobility", "generic", false],
  ["foam-roll", "Foam rolling", "滾筒放鬆", "recovery", "generic", false],
  ["plank", "Plank", "棒式", "core", "hold", true],
  ["side-plank", "Side plank", "側棒式", "core", "hold", true],
  ["crunch", "Crunch", "捲腹", "core", "strength", true],
  ["sit-up", "Sit-up", "仰臥起坐", "core", "strength", true],
  ["leg-raise", "Leg raise", "抬腿", "core", "strength", true],
  ["mountain-climber", "Mountain climber", "登山者", "core", "generic", true],
  ["push-up", "Push-up", "伏地挺身", "strength", "strength", true],
  ["pull-up", "Pull-up", "引體向上", "strength", "strength", true],
  ["chin-up", "Chin-up", "反手引體", "strength", "strength", true],
  ["dip", "Dip", "雙槓撐體", "strength", "strength", true],
  ["squat", "Squat", "深蹲", "strength", "strength", true],
  ["lunge", "Lunge", "弓箭步", "strength", "strength", true],
  ["deadlift", "Deadlift", "硬舉", "strength", "strength", true],
  ["bench-press", "Bench press", "臥推", "strength", "strength", true],
  ["overhead-press", "Overhead press", "肩推", "strength", "strength", true],
  ["row", "Dumbbell row", "啞鈴划船", "strength", "strength", true],
  ["lat-pulldown", "Lat pulldown", "滑輪下拉", "strength", "strength", true],
  ["bicep-curl", "Bicep curl", "二頭彎舉", "strength", "strength", true],
  ["tricep-extension", "Tricep extension", "三頭伸展", "strength", "strength", true],
  ["shoulder-raise", "Lateral raise", "側平舉", "strength", "strength", true],
  ["leg-press", "Leg press", "腿推", "strength", "strength", true],
  ["calf-raise", "Calf raise", "小腿提踵", "strength", "strength", true],
  ["hip-thrust", "Hip thrust", "臀推", "strength", "strength", true],
  ["glute-bridge", "Glute bridge", "臀橋", "strength", "strength", true],
  ["burpee", "Burpee", "波比跳", "strength", "generic", true],
  ["kettlebell-swing", "Kettlebell swing", "壺鈴擺盪", "strength", "strength", true],
  ["farmer-carry", "Farmer carry", "農夫走路", "strength", "generic", true],
  ["battle-rope", "Battle rope", "戰繩", "strength", "generic", true],
  ["clean", "Clean", "上膊", "strength", "strength", true],
  ["snatch", "Snatch", "抓舉", "strength", "strength", true],
  ["step-up", "Step-up", "登階", "strength", "strength", true],
  ["wall-sit", "Wall sit", "靠牆深蹲", "strength", "hold", true],
  ["tai-chi", "Tai chi", "太極", "mobility", "generic", true],
  ["housework", "Housework", "家務", "daily", "generic", false],
  ["gardening", "Gardening", "園藝", "daily", "generic", false],
  ["commute-walk", "Commute walk", "通勤走路", "daily", "run", false]
].map(([id, en, zh, category, formType, photoUseful]) => ({ id, label: { en, zh }, category, formType, photoUseful }));

const initialState = {
  activityLogs: [],
  workoutLogs: [],
  plannedActivities: [
    { id: "plan-run", catalogId: "running", title: "Running", scheduledTime: "08:00", checked: false, createdAt: new Date().toISOString() },
    { id: "plan-plank", catalogId: "plank", title: "Plank", scheduledTime: "20:00", checked: false, createdAt: new Date().toISOString() }
  ],
  mealLogs: [],
  sleepLogs: [
    { id: "sleep-seed", sleepAt: "23:35", wakeAt: "07:00", quality: "8", createdAt: new Date().toISOString() }
  ],
  bodyEstimates: [],
  ingredientScans: [],
  recentLogs: [
    { id: "seed-1", title: "Wake recorded", detail: "7h 25m sleep, quality 8/10", createdAt: new Date().toISOString() },
    { id: "seed-2", title: "Activity checklist ready", detail: "Running and plank are planned for today", createdAt: new Date().toISOString() }
  ],
  settings: {
    locale: "en",
    aiApiUrl: DEFAULT_AI_API_URL
  },
  reminderSettings: {
    morningEnabled: true,
    morningTime: "08:00",
    nightEnabled: true,
    nightTime: "20:30",
    morningNotificationId: null,
    nightNotificationId: null
  }
};

function makeId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString();
}

function splitTime(value) {
  const [hour, minute] = String(value || "08:00").split(":").map((part) => Number(part));
  return { hour: Number.isFinite(hour) ? hour : 8, minute: Number.isFinite(minute) ? minute : 0 };
}

function normalizeTimeInput(value, fallback) {
  const cleaned = String(value || "").trim();
  if (/^\d{1,2}:\d{2}$/.test(cleaned)) {
    const [hour, minute] = cleaned.split(":").map((part) => Number(part));
    if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
      return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
    }
  }
  return fallback;
}

function labelFor(item, locale) {
  return item?.label?.[locale] || item?.label?.en || item?.displayName || item?.title || "";
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
    confidence: "local fallback",
    missingFields: []
  };
}

function estimateBodyFat({ height, weight, age, sex }) {
  const heightCm = Number(height);
  const weightKg = Number(weight);
  const ageYears = Number(age);
  if (!heightCm || !weightKg || !ageYears || !sex) return null;
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  const sexFactor = sex === "Female" ? 0 : 1;
  const estimate = 1.2 * bmi + 0.23 * ageYears - 10.8 * sexFactor - 5.4;
  const low = Math.max(5, Math.round(estimate - 3));
  const high = Math.min(55, Math.round(estimate + 3));
  return `${low}-${high}%`;
}

async function requestCameraPhoto() {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) {
    Alert.alert("Camera permission needed", "You can still use manual logging, but camera capture needs permission.");
    return null;
  }
  const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [4, 5], quality: 0.72 });
  if (result.canceled || !result.assets?.[0]?.uri) return null;
  return result.assets[0].uri;
}

async function imageToDataUrl(uri) {
  const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
  const ext = String(uri).split(".").pop()?.toLowerCase();
  const mime = ext === "png" ? "image/png" : "image/jpeg";
  return `data:${mime};base64,${base64}`;
}

async function scheduleDailyReminder(time, title, body) {
  const permission = await Notifications.requestPermissionsAsync();
  if (!permission.granted) {
    Alert.alert("Notifications disabled", "Vital Lens cannot schedule reminders without notification permission.");
    return null;
  }
  const { hour, minute } = splitTime(time);
  return Notifications.scheduleNotificationAsync({ content: { title, body }, trigger: { hour, minute, repeats: true } });
}

async function cancelReminder(id) {
  if (id) await Notifications.cancelScheduledNotificationAsync(id);
}

function normalizeApiUrl(url) {
  return String(url || "").trim().replace(/\/$/, "");
}

export default function App() {
  const [data, setData] = useState(initialState);
  const [activeTab, setActiveTab] = useState("Home");
  const [busy, setBusy] = useState("");
  const [freeText, setFreeText] = useState("跑步 30 分鐘 3 miles easy");
  const [draft, setDraft] = useState(localParseActivity("running 30 minutes", "en"));
  const [manual, setManual] = useState(localParseActivity("running 30 minutes", "en"));
  const [planTitle, setPlanTitle] = useState("Running");
  const [planTime, setPlanTime] = useState("08:00");
  const [mealNote, setMealNote] = useState("");
  const [sleepAt, setSleepAt] = useState("23:35");
  const [wakeAt, setWakeAt] = useState("07:00");
  const [sleepQuality, setSleepQuality] = useState("8");
  const [ingredients, setIngredients] = useState("eggs, spinach, salmon, rice, Greek yogurt");
  const [bodyForm, setBodyForm] = useState({ height: "", weight: "", age: "", sex: "Male", photoUri: null });
  const [bodyDraft, setBodyDraft] = useState(null);

  const locale = data.settings?.locale || "en";
  const t = (key) => copy[locale]?.[key] || copy.en[key] || key;
  const apiBase = normalizeApiUrl(data.settings?.aiApiUrl);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        if (saved) {
          const parsed = JSON.parse(saved);
          setData({
            ...initialState,
            ...parsed,
            settings: { ...initialState.settings, ...parsed.settings },
            reminderSettings: { ...initialState.reminderSettings, ...parsed.reminderSettings }
          });
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data)).catch(() => {});
  }, [data]);

  const latestSleep = data.sleepLogs[0] || initialState.sleepLogs[0];
  const latestBody = data.bodyEstimates[0];
  const allActivityLogs = [...(data.activityLogs || []), ...(data.workoutLogs || []).map((log) => ({
    id: log.id,
    displayName: log.type,
    category: "legacy",
    durationMinutes: log.durationMinutes,
    intensity: log.intensity,
    metrics: {},
    notes: log.aiDraft,
    source: log.photoUri ? "legacy photo" : "legacy manual",
    photoUri: log.photoUri,
    completedAt: log.createdAt,
    createdAt: log.createdAt
  }))];

  const summary = useMemo(() => {
    const minutes = allActivityLogs.reduce((sum, log) => sum + Number(log.durationMinutes || 0), 0);
    const protein = data.mealLogs.reduce((sum, log) => sum + Number(log.protein || 0), 0);
    return {
      moveLoad: Math.min(100, Math.round((minutes / 70) * 100)) || 0,
      nutrition: Math.min(100, 55 + data.mealLogs.length * 9 + Math.round(protein / 12)),
      sleep: latestSleep ? `${latestSleep.sleepAt} to ${latestSleep.wakeAt}` : "Not logged"
    };
  }, [allActivityLogs, data.mealLogs, latestSleep]);

  function addRecentLog(title, detail) {
    const log = { id: makeId("recent"), title, detail, createdAt: new Date().toISOString() };
    setData((current) => ({ ...current, recentLogs: [log, ...(current.recentLogs || [])].slice(0, 14) }));
  }

  async function postAI(path, payload) {
    if (!apiBase) throw new Error("AI API URL is not configured.");
    const response = await fetch(`${apiBase}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const json = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(json.error || `AI request failed: ${response.status}`);
    return json;
  }

  async function parseActivityWithAI() {
    setBusy("parse");
    try {
      const result = await postAI("/api/parse-activity", { text: freeText, locale, activityCatalogSummary: catalogSummary(locale) });
      const nextDraft = { ...localParseActivity(freeText, locale), ...result.activity };
      setDraft(nextDraft);
      setManual(nextDraft);
      addRecentLog("Activity parsed by AI", `${nextDraft.displayName || nextDraft.activityName} · ${nextDraft.confidence || "AI"}`);
    } catch (error) {
      const fallback = localParseActivity(freeText, locale);
      setDraft(fallback);
      setManual(fallback);
      Alert.alert("AI fallback", `${error.message}\n\nA local draft was created so you can still edit and save.`);
    } finally {
      setBusy("");
    }
  }

  function updateManual(path, value) {
    setManual((current) => {
      if (path.startsWith("metrics.")) {
        const key = path.replace("metrics.", "");
        return { ...current, metrics: { ...(current.metrics || {}), [key]: value } };
      }
      return { ...current, [path]: value };
    });
  }

  function buildActivityLog(input, source = "manual") {
    const catalog = activityCatalog.find((item) => item.id === input.catalogId) || findCatalogByName(input.displayName) || activityCatalog[0];
    return {
      id: makeId("activity"),
      catalogId: input.catalogId || catalog.id,
      displayName: input.displayName || input.activityName || labelFor(catalog, locale),
      category: input.category || catalog.category,
      formType: input.formType || catalog.formType,
      completedAt: new Date().toISOString(),
      durationMinutes: Number(input.durationMinutes) || 0,
      metrics: input.metrics || {},
      intensity: input.intensity || "Moderate",
      notes: input.notes || "",
      source,
      language: locale,
      photoUri: input.photoUri || null,
      aiDraft: source.includes("AI") ? input : null,
      checked: true
    };
  }

  function saveActivityDraft(input, source = "manual") {
    const log = buildActivityLog(input, source);
    setData((current) => ({ ...current, activityLogs: [log, ...(current.activityLogs || [])] }));
    addRecentLog("Activity saved", `${log.displayName} · ${log.durationMinutes || "?"} min · ${log.intensity}`);
    return log;
  }

  function saveActivity(source = "manual") {
    saveActivityDraft(manual, source);
  }

  function completePlan(plan) {
    const item = activityCatalog.find((entry) => entry.id === plan.catalogId) || activityCatalog[0];
    const nextManual = {
      catalogId: item.id,
      displayName: plan.title || labelFor(item, locale),
      category: item.category,
      formType: item.formType,
      durationMinutes: "30",
      metrics: {},
      intensity: "Moderate",
      notes: `Completed from checklist at ${plan.scheduledTime}`,
      confidence: "manual checklist"
    };
    setManual(nextManual);
    saveActivityDraft(nextManual, "checklist");
    if (!plan.checked) togglePlan(plan.id);
  }

  function addPlan(catalogId) {
    const item = activityCatalog.find((entry) => entry.id === catalogId) || findCatalogByName(planTitle) || activityCatalog[0];
    const plan = {
      id: makeId("plan"),
      catalogId: item.id,
      title: planTitle.trim() || labelFor(item, locale),
      scheduledTime: normalizeTimeInput(planTime, "08:00"),
      checked: false,
      createdAt: new Date().toISOString()
    };
    setData((current) => ({ ...current, plannedActivities: [plan, ...(current.plannedActivities || [])] }));
    addRecentLog("Plan added", `${plan.title} · ${plan.scheduledTime}`);
  }

  function togglePlan(planId) {
    setData((current) => ({
      ...current,
      plannedActivities: (current.plannedActivities || []).map((plan) => plan.id === planId ? { ...plan, checked: !plan.checked } : plan)
    }));
  }

  async function analyzePhoto(mode, uri, context = {}) {
    setBusy(mode);
    try {
      const imageDataUrl = await imageToDataUrl(uri);
      const result = await postAI("/api/analyze-photo", { mode, imageDataUrl, locale, context });
      return result.analysis;
    } catch (error) {
      Alert.alert("AI photo fallback", `${error.message}\n\nThe photo was kept and you can still save manually.`);
      return null;
    } finally {
      setBusy("");
    }
  }

  async function captureWorkoutPhoto() {
    const uri = await requestCameraPhoto();
    if (!uri) return;
    const analysis = await analyzePhoto("exercise", uri, { activityCatalogSummary: catalogSummary(locale) });
    const parsed = analysis?.activity || localParseActivity("cardio 30 minutes", locale);
    const nextManual = { ...parsed, photoUri: uri, confidence: analysis?.confidence || parsed.confidence || "manual fallback" };
    setManual(nextManual);
    setDraft(nextManual);
    saveActivityDraft(nextManual, "photo AI");
  }

  async function captureMealPhoto() {
    const uri = await requestCameraPhoto();
    if (!uri) return;
    const analysis = await analyzePhoto("meal", uri);
    const log = {
      id: makeId("meal"),
      photoUri: uri,
      foods: analysis?.foods || [mealNote || "meal photo"],
      calories: Number(analysis?.calories) || 0,
      protein: Number(analysis?.protein) || 0,
      carbs: Number(analysis?.carbs) || 0,
      fat: Number(analysis?.fat) || 0,
      confidence: analysis?.confidence || "manual fallback",
      createdAt: new Date().toISOString()
    };
    setData((current) => ({ ...current, mealLogs: [log, ...current.mealLogs] }));
    addRecentLog("Meal photo analyzed", `${log.foods.join(", ")} · ${log.calories || "?"} kcal · ${log.protein || 0}g protein`);
  }

  function saveManualMeal() {
    const note = mealNote.trim() || "Meal";
    const log = { id: makeId("meal"), photoUri: null, foods: [note], calories: 0, protein: 0, carbs: 0, fat: 0, confidence: "manual", createdAt: new Date().toISOString() };
    setData((current) => ({ ...current, mealLogs: [log, ...current.mealLogs] }));
    addRecentLog("Meal added manually", note);
    setMealNote("");
  }

  function saveSleep() {
    const log = { id: makeId("sleep"), sleepAt: normalizeTimeInput(sleepAt, "23:35"), wakeAt: normalizeTimeInput(wakeAt, "07:00"), quality: sleepQuality || "8", createdAt: new Date().toISOString() };
    setData((current) => ({ ...current, sleepLogs: [log, ...current.sleepLogs] }));
    addRecentLog("Sleep timing updated", `${log.sleepAt} to ${log.wakeAt} · quality ${log.quality}/10`);
  }

  async function captureIngredients() {
    const uri = await requestCameraPhoto();
    if (!uri) return;
    const analysis = await analyzePhoto("ingredients", uri);
    const scan = {
      id: makeId("ingredient"),
      photoUri: uri,
      detected: analysis?.ingredients || ["eggs", "spinach", "rice"],
      suggestions: analysis?.suggestions || ["Protein grain bowl", "Vegetable omelet", "Recovery snack"],
      confidence: analysis?.confidence || "manual fallback",
      createdAt: new Date().toISOString()
    };
    setData((current) => ({ ...current, ingredientScans: [scan, ...current.ingredientScans] }));
    addRecentLog("Kitchen ingredients analyzed", scan.detected.join(", "));
  }

  async function suggestMeals() {
    try {
      setBusy("ingredients");
      const analysis = await postAI("/api/analyze-photo", { mode: "ingredients", locale, context: { ingredients } }).then((result) => result.analysis);
      const scan = {
        id: makeId("ingredient"),
        photoUri: null,
        detected: analysis?.ingredients || ingredients.split(",").map((item) => item.trim()).filter(Boolean),
        suggestions: analysis?.suggestions || ["Lean protein grain bowl", "Vegetable omelet", "Simple recovery snack"],
        confidence: analysis?.confidence || "AI text",
        createdAt: new Date().toISOString()
      };
      setData((current) => ({ ...current, ingredientScans: [scan, ...current.ingredientScans] }));
      addRecentLog("Meal suggestions generated", scan.detected.join(", "));
    } catch (error) {
      const scan = {
        id: makeId("ingredient"),
        photoUri: null,
        detected: ingredients.split(",").map((item) => item.trim()).filter(Boolean),
        suggestions: ["Lean protein grain bowl", "Vegetable omelet", "Simple recovery snack"],
        confidence: "local fallback",
        createdAt: new Date().toISOString()
      };
      setData((current) => ({ ...current, ingredientScans: [scan, ...current.ingredientScans] }));
      Alert.alert("AI fallback", error.message);
    } finally {
      setBusy("");
    }
  }

  async function captureBodyPhoto() {
    const uri = await requestCameraPhoto();
    if (uri) setBodyForm((current) => ({ ...current, photoUri: uri }));
  }

  async function createBodyEstimate() {
    const fallbackRange = estimateBodyFat(bodyForm);
    if (!fallbackRange || !bodyForm.photoUri) {
      Alert.alert("More information needed", "Add height, weight, age, sex, and a progress photo before estimating 體脂率.");
      return;
    }
    const analysis = await analyzePhoto("body", bodyForm.photoUri, { bodyForm });
    const estimate = {
      id: makeId("body"),
      photoUri: bodyForm.photoUri,
      height: Number(bodyForm.height),
      weight: Number(bodyForm.weight),
      age: Number(bodyForm.age),
      sex: bodyForm.sex,
      estimatedRange: analysis?.estimatedRange || fallbackRange,
      confidence: analysis?.confidence || "educational fallback",
      notes: analysis?.notes || "Educational estimate only; not a medical measurement.",
      createdAt: new Date().toISOString()
    };
    setBodyDraft(estimate);
    setData((current) => ({ ...current, bodyEstimates: [estimate, ...current.bodyEstimates] }));
    addRecentLog("體脂率 estimate created", `${estimate.estimatedRange} · ${estimate.confidence}`);
  }

  async function updateReminder(kind, patch) {
    const settings = { ...data.reminderSettings, ...patch };
    const isMorning = kind === "morning";
    const enabledKey = isMorning ? "morningEnabled" : "nightEnabled";
    const timeKey = isMorning ? "morningTime" : "nightTime";
    const idKey = isMorning ? "morningNotificationId" : "nightNotificationId";
    const title = isMorning ? "Vital Lens morning plan" : "Vital Lens nightly review";
    const body = isMorning ? "Plan today's workout and meals." : "Review meals, training, and sleep target.";
    await cancelReminder(settings[idKey]);
    settings[idKey] = null;
    if (settings[enabledKey]) settings[idKey] = await scheduleDailyReminder(settings[timeKey], title, body);
    setData((current) => ({ ...current, reminderSettings: settings }));
  }

  async function createAppleCalendarEvent(kind) {
    const permission = await Calendar.requestCalendarPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Calendar permission needed", "Vital Lens can only add Apple Calendar events after permission is granted.");
      return;
    }
    const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
    const targetCalendar = calendars.find((calendar) => calendar.allowsModifications) || calendars[0];
    if (!targetCalendar) {
      Alert.alert("No calendar found", "No writable Apple Calendar was available on this device.");
      return;
    }
    const startDate = new Date();
    if (kind === "workout") startDate.setHours(18, 0, 0, 0);
    if (kind === "meal") startDate.setHours(17, 30, 0, 0);
    if (kind === "sleep") startDate.setHours(23, 30, 0, 0);
    const endDate = new Date(startDate);
    endDate.setMinutes(startDate.getMinutes() + (kind === "sleep" ? 30 : 60));
    await Calendar.createEventAsync(targetCalendar.id, { title: `Vital Lens ${kind}`, notes: "Created by Vital Lens.", startDate, endDate, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone });
    addRecentLog("Apple Calendar event added", kind);
    Alert.alert("Calendar event added", `Added ${kind} event to Apple Calendar.`);
  }

  function openGoogleCalendar(kind) {
    const startDate = new Date();
    if (kind === "workout") startDate.setHours(18, 0, 0, 0);
    if (kind === "meal") startDate.setHours(17, 30, 0, 0);
    if (kind === "sleep") startDate.setHours(23, 30, 0, 0);
    const endDate = new Date(startDate);
    endDate.setMinutes(startDate.getMinutes() + (kind === "sleep" ? 30 : 60));
    const formatGoogleDate = (date) => date.toISOString().replace(/[-:]|\.\d{3}/g, "");
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`Vital Lens ${kind}`)}&dates=${formatGoogleDate(startDate)}/${formatGoogleDate(endDate)}&details=${encodeURIComponent("Created by Vital Lens.")}`;
    Linking.openURL(url);
    addRecentLog("Google Calendar opened", kind);
  }

  function runDailyReview() {
    addRecentLog("Daily review complete", "Plan training, add 25-35g protein, and protect tonight's sleep target.");
  }

  const tabs = [
    ["Home", t("home")],
    ["Activity", t("activity")],
    ["Diet", t("diet")],
    ["Sleep", t("sleep")],
    ["Kitchen", t("kitchen")],
    ["Body", t("body")],
    ["Calendar", t("calendar")],
    ["Settings", t("settings")]
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <View style={styles.brandMark}><Text style={styles.brandText}>VL</Text></View>
          <View style={styles.headerCopy}>
            <Text style={styles.eyebrow}>AI wellness tracker</Text>
            <Text style={styles.title}>Vital Lens</Text>
            <Text style={styles.subtitle}>{locale === "zh" ? "拍照優先的運動、飲食、睡眠與身體追蹤。" : "Camera-first training, diet, sleep, and body tracking."}</Text>
          </View>
        </View>

        <View style={styles.tabBar}>
          {tabs.map(([tab, label]) => (
            <TouchableOpacity key={tab} style={[styles.tab, activeTab === tab && styles.activeTab]} onPress={() => setActiveTab(tab)}>
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {activeTab === "Home" && (
          <View>
            <Text style={styles.sectionTitle}>{t("today")}</Text>
            <View style={styles.metricGrid}>
              <Metric label="Move load" value={`${summary.moveLoad}%`} detail={`${allActivityLogs.length} sessions tracked`} color="#a25842" />
              <Metric label="Nutrition" value={`${summary.nutrition}%`} detail={`${data.mealLogs.length} meals logged`} color="#6f8f72" />
              <Metric label="Sleep rhythm" value={summary.sleep} detail={`Quality ${latestSleep.quality}/10`} color="#5c87a5" />
              <Metric label="體脂率" value={latestBody?.estimatedRange || "Not yet"} detail="Educational range only" color="#d7a441" />
            </View>
            <TouchableOpacity style={styles.primaryButton} onPress={runDailyReview}><Text style={styles.primaryButtonText}>Run daily review</Text></TouchableOpacity>
            <RecentLogs logs={data.recentLogs} />
          </View>
        )}

        {activeTab === "Activity" && (
          <View>
            <Panel title={t("activityCenter")} eyebrow="AI activity logging">
              <Text style={styles.label}>{t("freeText")}</Text>
              <TextInput value={freeText} onChangeText={setFreeText} multiline style={[styles.input, styles.multiline]} placeholder="跑步 30 分鐘 3 miles easy" placeholderTextColor="#8a928e" />
              <TouchableOpacity style={styles.primaryButton} onPress={parseActivityWithAI}>
                <Text style={styles.primaryButtonText}>{busy === "parse" ? "Parsing..." : t("parseWithAI")}</Text>
              </TouchableOpacity>
              <Insight text={`${t("aiDraft")}: ${draft.displayName || draft.activityName || "-"} · ${draft.durationMinutes || "?"} min · ${draft.confidence || "-"}`} />
            </Panel>

            <Panel title={t("manualForm")} eyebrow="Editable structured fields">
              <ActivityCatalogPicker catalog={activityCatalog.slice(0, 18)} locale={locale} selectedId={manual.catalogId} onSelect={(item) => setManual({ ...manual, catalogId: item.id, displayName: labelFor(item, locale), category: item.category, formType: item.formType })} />
              <Field label={t("activityName")} value={manual.displayName || ""} onChangeText={(value) => updateManual("displayName", value)} />
              <View style={styles.row}>
                <Field label={t("duration")} value={String(manual.durationMinutes || "")} onChangeText={(value) => updateManual("durationMinutes", value)} keyboardType="number-pad" />
                <Field label={t("intensity")} value={manual.intensity || ""} onChangeText={(value) => updateManual("intensity", value)} />
              </View>
              {manual.formType === "run" && (
                <View style={styles.row}>
                  <Field label={t("distance")} value={String(manual.metrics?.distance || "")} onChangeText={(value) => updateManual("metrics.distance", value)} keyboardType="decimal-pad" />
                  <Field label="Unit" value={String(manual.metrics?.distanceUnit || "km")} onChangeText={(value) => updateManual("metrics.distanceUnit", value)} />
                </View>
              )}
              {manual.formType === "hold" && (
                <View style={styles.row}>
                  <Field label="Hold sec" value={String(manual.metrics?.holdSeconds || "")} onChangeText={(value) => updateManual("metrics.holdSeconds", value)} keyboardType="number-pad" />
                  <Field label="Sets" value={String(manual.metrics?.sets || "")} onChangeText={(value) => updateManual("metrics.sets", value)} keyboardType="number-pad" />
                </View>
              )}
              {manual.formType === "strength" && (
                <>
                  <View style={styles.row}>
                    <Field label="Sets" value={String(manual.metrics?.sets || "")} onChangeText={(value) => updateManual("metrics.sets", value)} keyboardType="number-pad" />
                    <Field label="Reps" value={String(manual.metrics?.reps || "")} onChangeText={(value) => updateManual("metrics.reps", value)} keyboardType="number-pad" />
                  </View>
                  <Field label="Weight" value={String(manual.metrics?.weight || "")} onChangeText={(value) => updateManual("metrics.weight", value)} keyboardType="decimal-pad" />
                </>
              )}
              <Field label={t("notes")} value={manual.notes || ""} onChangeText={(value) => updateManual("notes", value)} multiline />
              <TouchableOpacity style={styles.primaryButton} onPress={() => saveActivity("manual")}><Text style={styles.primaryButtonText}>{t("saveActivity")}</Text></TouchableOpacity>
              <TouchableOpacity style={styles.photoButton} onPress={captureWorkoutPhoto}><Text style={styles.photoButtonText}>{busy === "exercise" ? "Analyzing..." : t("analyzeWorkout")}</Text></TouchableOpacity>
            </Panel>

            <Panel title={t("checkList")} eyebrow="Plans">
              <View style={styles.row}>
                <Field label={t("activityName")} value={planTitle} onChangeText={setPlanTitle} />
                <Field label="Time" value={planTime} onChangeText={setPlanTime} />
              </View>
              <TouchableOpacity style={styles.secondaryButton} onPress={() => addPlan()}><Text style={styles.secondaryButtonText}>{t("addPlan")}</Text></TouchableOpacity>
              {(data.plannedActivities || []).map((plan) => (
                <View key={plan.id} style={styles.checkRow}>
                  <TouchableOpacity style={[styles.checkbox, plan.checked && styles.checkboxOn]} onPress={() => togglePlan(plan.id)}>
                    <Text style={styles.checkboxText}>{plan.checked ? "✓" : ""}</Text>
                  </TouchableOpacity>
                  <View style={styles.checkText}>
                    <Text style={styles.logTitle}>{plan.title}</Text>
                    <Text style={styles.detail}>{plan.scheduledTime}</Text>
                  </View>
                  <TouchableOpacity style={styles.smallButton} onPress={() => completePlan(plan)}><Text style={styles.smallButtonText}>{t("complete")}</Text></TouchableOpacity>
                </View>
              ))}
            </Panel>

            <Panel title={t("history")} eyebrow="Completed">
              <ActivityHistory logs={allActivityLogs} />
            </Panel>
          </View>
        )}

        {activeTab === "Diet" && (
          <Panel title="Capture food without typing everything" eyebrow="Photo meal journal">
            <TouchableOpacity style={styles.photoButton} onPress={captureMealPhoto}><Text style={styles.photoButtonText}>{busy === "meal" ? "Analyzing..." : t("analyzeMeal")}</Text></TouchableOpacity>
            <Field label="Meal note" value={mealNote} onChangeText={setMealNote} placeholder="chicken rice bowl" />
            <TouchableOpacity style={styles.primaryButton} onPress={saveManualMeal}><Text style={styles.primaryButtonText}>Save meal</Text></TouchableOpacity>
            <LatestPhoto uri={data.mealLogs[0]?.photoUri} />
            <Insight text={data.mealLogs[0] ? `${data.mealLogs[0].foods.join(", ")} · ${data.mealLogs[0].calories || "manual"} kcal · ${data.mealLogs[0].protein || 0}g protein · confidence ${data.mealLogs[0].confidence}` : "Take a food photo and AI estimates food, calories, protein, carbs, fat, and uncertainty."} />
          </Panel>
        )}

        {activeTab === "Sleep" && (
          <Panel title="Track sleeping timing" eyebrow="Recovery rhythm">
            <View style={styles.row}>
              <Field label="Sleep time" value={sleepAt} onChangeText={setSleepAt} placeholder="23:35" />
              <Field label="Wake time" value={wakeAt} onChangeText={setWakeAt} placeholder="07:00" />
            </View>
            <Field label="Sleep quality 1-10" value={sleepQuality} onChangeText={setSleepQuality} keyboardType="number-pad" />
            <TouchableOpacity style={styles.primaryButton} onPress={saveSleep}><Text style={styles.primaryButtonText}>Update sleep</Text></TouchableOpacity>
          </Panel>
        )}

        {activeTab === "Kitchen" && (
          <Panel title="Turn ingredients into meals" eyebrow="Kitchen scanner">
            <TouchableOpacity style={styles.photoButton} onPress={captureIngredients}><Text style={styles.photoButtonText}>{busy === "ingredients" ? "Analyzing..." : t("analyzeIngredients")}</Text></TouchableOpacity>
            <Field label="Ingredients seen" value={ingredients} onChangeText={setIngredients} multiline />
            <TouchableOpacity style={styles.primaryButton} onPress={suggestMeals}><Text style={styles.primaryButtonText}>Suggest meals</Text></TouchableOpacity>
            <LatestPhoto uri={data.ingredientScans[0]?.photoUri} />
            <SuggestionList items={data.ingredientScans[0]?.suggestions || ["Salmon rice bowl", "Spinach egg wrap", "Greek yogurt recovery bowl"]} />
          </Panel>
        )}

        {activeTab === "Body" && (
          <Panel title="Estimate 體脂率 from progress context" eyebrow="Educational body estimate">
            <Text style={styles.warning}>This is an educational range, not a medical measurement. Use consistent lighting, posture, and distance for progress tracking.</Text>
            <View style={styles.row}>
              <Field label="Height cm" value={bodyForm.height} onChangeText={(height) => setBodyForm((current) => ({ ...current, height }))} keyboardType="number-pad" />
              <Field label="Weight kg" value={bodyForm.weight} onChangeText={(weight) => setBodyForm((current) => ({ ...current, weight }))} keyboardType="decimal-pad" />
            </View>
            <View style={styles.row}>
              <Field label="Age" value={bodyForm.age} onChangeText={(age) => setBodyForm((current) => ({ ...current, age }))} keyboardType="number-pad" />
              <View style={styles.field}>
                <Text style={styles.label}>Sex</Text>
                <Segmented values={["Male", "Female"]} value={bodyForm.sex} onChange={(sex) => setBodyForm((current) => ({ ...current, sex }))} />
              </View>
            </View>
            <TouchableOpacity style={styles.photoButton} onPress={captureBodyPhoto}><Text style={styles.photoButtonText}>Take body progress photo</Text></TouchableOpacity>
            <LatestPhoto uri={bodyForm.photoUri || bodyDraft?.photoUri} />
            <TouchableOpacity style={styles.primaryButton} onPress={createBodyEstimate}><Text style={styles.primaryButtonText}>{busy === "body" ? "Analyzing..." : t("analyzeBody")}</Text></TouchableOpacity>
            <Insight text={bodyDraft ? `Estimated range: ${bodyDraft.estimatedRange}. Confidence: ${bodyDraft.confidence}. ${bodyDraft.notes || ""}` : "Add height, weight, age, sex, and a photo to generate an educational range."} />
          </Panel>
        )}

        {activeTab === "Calendar" && (
          <Panel title="Notifications and calendar" eyebrow="Daily rhythm">
            <ReminderControl label="Morning plan" time={data.reminderSettings.morningTime} enabled={data.reminderSettings.morningEnabled} onTimeChange={(time) => setData((current) => ({ ...current, reminderSettings: { ...current.reminderSettings, morningTime: normalizeTimeInput(time, current.reminderSettings.morningTime) } }))} onToggle={(enabled) => updateReminder("morning", { morningEnabled: enabled })} onSchedule={() => updateReminder("morning", {})} />
            <ReminderControl label="Night review" time={data.reminderSettings.nightTime} enabled={data.reminderSettings.nightEnabled} onTimeChange={(time) => setData((current) => ({ ...current, reminderSettings: { ...current.reminderSettings, nightTime: normalizeTimeInput(time, current.reminderSettings.nightTime) } }))} onToggle={(enabled) => updateReminder("night", { nightEnabled: enabled })} onSchedule={() => updateReminder("night", {})} />
            {["workout", "meal", "sleep"].map((kind) => (
              <View key={kind} style={styles.calendarRow}>
                <Text style={styles.calendarKind}>{kind}</Text>
                <TouchableOpacity style={styles.secondaryButton} onPress={() => createAppleCalendarEvent(kind)}><Text style={styles.secondaryButtonText}>Apple Calendar</Text></TouchableOpacity>
                <TouchableOpacity style={styles.secondaryButton} onPress={() => openGoogleCalendar(kind)}><Text style={styles.secondaryButtonText}>Google Calendar</Text></TouchableOpacity>
              </View>
            ))}
          </Panel>
        )}

        {activeTab === "Settings" && (
          <Panel title={t("settings")} eyebrow="AI and language">
            <Text style={styles.label}>{t("language")}</Text>
            <Segmented values={[t("english"), t("traditionalChinese")]} value={locale === "zh" ? t("traditionalChinese") : t("english")} onChange={(value) => setData((current) => ({ ...current, settings: { ...current.settings, locale: value === t("traditionalChinese") ? "zh" : "en" } }))} />
            <Field label={t("aiUrl")} value={data.settings.aiApiUrl || ""} onChangeText={(aiApiUrl) => setData((current) => ({ ...current, settings: { ...current.settings, aiApiUrl } }))} placeholder="https://your-app.vercel.app" />
            <Insight text="Keep OPENAI_API_KEY in Vercel only. The Expo app calls your cloud backend; it never stores the API key." />
          </Panel>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Metric({ label, value, detail, color }) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
      <View style={styles.meter}><View style={[styles.meterFill, { width: "72%", backgroundColor: color }]} /></View>
      <Text style={styles.detail}>{detail}</Text>
    </View>
  );
}

function Panel({ eyebrow, title, children }) {
  return (
    <View style={styles.panel}>
      <Text style={styles.eyebrow}>{eyebrow}</Text>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Segmented({ values, value, onChange }) {
  return (
    <View style={styles.segmented}>
      {values.map((item) => (
        <TouchableOpacity key={item} style={[styles.segment, value === item && styles.activeSegment]} onPress={() => onChange(item)}>
          <Text style={[styles.segmentText, value === item && styles.activeSegmentText]}>{item}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function Field({ label, multiline, ...props }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput {...props} multiline={multiline} style={[styles.input, multiline && styles.multiline]} placeholderTextColor="#8a928e" />
    </View>
  );
}

function LatestPhoto({ uri }) {
  if (!uri) return null;
  return <Image source={{ uri }} style={styles.previewImage} />;
}

function Insight({ text }) {
  return (
    <View style={styles.insight}>
      <Text style={styles.insightText}>{text}</Text>
    </View>
  );
}

function ActivityCatalogPicker({ catalog, locale, selectedId, onSelect }) {
  return (
    <View style={styles.chipWrap}>
      {catalog.map((item) => (
        <TouchableOpacity key={item.id} style={[styles.chip, selectedId === item.id && styles.chipActive]} onPress={() => onSelect(item)}>
          <Text style={[styles.chipText, selectedId === item.id && styles.chipTextActive]}>{labelFor(item, locale)}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function ActivityHistory({ logs }) {
  if (!logs.length) return <Text style={styles.detail}>No completed activities yet.</Text>;
  const grouped = logs.reduce((acc, log) => {
    const key = formatDate(log.completedAt || log.createdAt);
    acc[key] = acc[key] || [];
    acc[key].push(log);
    return acc;
  }, {});
  return Object.entries(grouped).map(([date, items]) => (
    <View key={date} style={styles.historyGroup}>
      <Text style={styles.logTitle}>{date}</Text>
      {items.map((log) => (
        <View key={log.id} style={styles.logItem}>
          <Text style={styles.logTime}>{formatTime(log.completedAt || log.createdAt)}</Text>
          <Text style={styles.logTitle}>{log.displayName}</Text>
          <Text style={styles.detail}>{log.category} · {log.durationMinutes || "?"} min · {log.intensity || "Moderate"} · {log.source}</Text>
          {!!log.notes && <Text style={styles.detail}>{log.notes}</Text>}
        </View>
      ))}
    </View>
  ));
}

function SuggestionList({ items }) {
  return (
    <View style={styles.suggestionList}>
      {items.map((item) => (
        <View key={item} style={styles.suggestionItem}>
          <Text style={styles.suggestionTitle}>{item}</Text>
          <Text style={styles.detail}>High-protein option · works with today's training load.</Text>
        </View>
      ))}
    </View>
  );
}

function RecentLogs({ logs }) {
  return (
    <View style={styles.panel}>
      <Text style={styles.eyebrow}>Recent logs</Text>
      {logs.map((log) => (
        <View key={log.id} style={styles.logItem}>
          <Text style={styles.logTime}>{formatTime(log.createdAt)}</Text>
          <Text style={styles.logTitle}>{log.title}</Text>
          <Text style={styles.detail}>{log.detail}</Text>
        </View>
      ))}
    </View>
  );
}

function ReminderControl({ label, time, enabled, onToggle, onTimeChange, onSchedule }) {
  return (
    <View style={styles.reminderCard}>
      <View style={styles.reminderHeader}>
        <View>
          <Text style={styles.logTitle}>{label}</Text>
          <Text style={styles.detail}>Use HH:MM, 24-hour time.</Text>
        </View>
        <Switch value={enabled} onValueChange={onToggle} />
      </View>
      <View style={styles.row}>
        <Field label="Time" value={time} onChangeText={onTimeChange} placeholder="08:00" />
        <TouchableOpacity style={styles.secondaryButton} onPress={onSchedule}><Text style={styles.secondaryButtonText}>Schedule</Text></TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#eef2ee" },
  container: { padding: 18, paddingBottom: 42 },
  header: { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 18 },
  brandMark: { alignItems: "center", justifyContent: "center", width: 52, height: 52, borderRadius: 8, backgroundColor: "#1f2523" },
  brandText: { color: "#fff", fontWeight: "900", fontSize: 18 },
  headerCopy: { flex: 1 },
  eyebrow: { color: "#67716d", fontSize: 12, fontWeight: "800", textTransform: "uppercase", marginBottom: 5 },
  title: { color: "#1f2523", fontSize: 30, fontWeight: "900" },
  subtitle: { color: "#67716d", fontSize: 15, lineHeight: 21 },
  tabBar: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 18 },
  tab: { minHeight: 38, justifyContent: "center", paddingHorizontal: 13, borderRadius: 8, backgroundColor: "#fff", borderWidth: 1, borderColor: "#dce3df" },
  activeTab: { backgroundColor: "#1f2523", borderColor: "#1f2523" },
  tabText: { color: "#67716d", fontWeight: "800" },
  activeTabText: { color: "#fff" },
  sectionTitle: { color: "#1f2523", fontSize: 24, fontWeight: "900", marginBottom: 14 },
  metricGrid: { gap: 12, marginBottom: 14 },
  metricCard: { padding: 16, borderRadius: 8, backgroundColor: "#fff", borderWidth: 1, borderColor: "#dce3df" },
  metricLabel: { color: "#67716d", fontWeight: "800" },
  metricValue: { color: "#1f2523", fontSize: 30, fontWeight: "900", marginVertical: 8 },
  meter: { height: 8, overflow: "hidden", borderRadius: 999, backgroundColor: "#e7ece8" },
  meterFill: { height: 8, borderRadius: 999 },
  detail: { color: "#67716d", fontSize: 14, lineHeight: 20, marginTop: 6 },
  panel: { padding: 18, borderRadius: 8, backgroundColor: "#fff", borderWidth: 1, borderColor: "#dce3df", marginBottom: 14 },
  segmented: { flexDirection: "row", padding: 4, borderRadius: 8, borderWidth: 1, borderColor: "#dce3df", backgroundColor: "#f5f7f4", marginBottom: 12 },
  segment: { flex: 1, minHeight: 38, alignItems: "center", justifyContent: "center", borderRadius: 6, paddingHorizontal: 8 },
  activeSegment: { backgroundColor: "#fff" },
  segmentText: { color: "#67716d", fontWeight: "800", textAlign: "center" },
  activeSegmentText: { color: "#1f2523" },
  primaryButton: { minHeight: 46, alignItems: "center", justifyContent: "center", borderRadius: 8, backgroundColor: "#1f2523", paddingHorizontal: 16, marginTop: 12 },
  primaryButtonText: { color: "#fff", fontWeight: "900" },
  secondaryButton: { minHeight: 44, alignItems: "center", justifyContent: "center", borderRadius: 8, borderWidth: 1, borderColor: "#1f2523", paddingHorizontal: 12, marginTop: 12 },
  secondaryButtonText: { color: "#1f2523", fontWeight: "900" },
  smallButton: { minHeight: 34, alignItems: "center", justifyContent: "center", borderRadius: 8, backgroundColor: "#1f2523", paddingHorizontal: 10 },
  smallButtonText: { color: "#fff", fontWeight: "900", fontSize: 12 },
  photoButton: { minHeight: 96, alignItems: "center", justifyContent: "center", borderRadius: 8, borderWidth: 1.5, borderStyle: "dashed", borderColor: "#aab7b0", backgroundColor: "#f5f7f4", padding: 16, marginTop: 12, marginBottom: 12 },
  photoButtonText: { color: "#1f2523", fontWeight: "900", fontSize: 16, textAlign: "center" },
  row: { flexDirection: "row", gap: 10, alignItems: "flex-end" },
  field: { flex: 1, marginBottom: 10 },
  label: { color: "#67716d", fontWeight: "800", marginBottom: 7 },
  input: { minHeight: 44, borderWidth: 1, borderColor: "#dce3df", borderRadius: 8, backgroundColor: "#fff", paddingHorizontal: 12, color: "#1f2523" },
  multiline: { minHeight: 86, paddingTop: 12, textAlignVertical: "top" },
  previewImage: { width: "100%", height: 260, borderRadius: 8, marginTop: 4, marginBottom: 12, backgroundColor: "#dce3df" },
  insight: { padding: 14, borderRadius: 8, backgroundColor: "#f7f8f5", marginTop: 10 },
  insightText: { color: "#4f5a56", lineHeight: 21 },
  warning: { color: "#7c5620", backgroundColor: "#fbf3df", borderRadius: 8, padding: 12, lineHeight: 20, marginBottom: 12 },
  suggestionList: { gap: 10, marginTop: 10 },
  suggestionItem: { padding: 13, borderRadius: 8, borderWidth: 1, borderColor: "#dce3df" },
  suggestionTitle: { color: "#1f2523", fontWeight: "900", fontSize: 16 },
  logItem: { padding: 13, borderRadius: 8, borderWidth: 1, borderColor: "#dce3df", marginTop: 10 },
  logTime: { color: "#67716d", fontSize: 13 },
  logTitle: { color: "#1f2523", fontWeight: "900", fontSize: 16, marginTop: 2 },
  reminderCard: { padding: 13, borderRadius: 8, borderWidth: 1, borderColor: "#dce3df", marginBottom: 12 },
  reminderHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  calendarRow: { paddingVertical: 12, borderTopWidth: 1, borderTopColor: "#dce3df" },
  calendarKind: { color: "#1f2523", fontWeight: "900", textTransform: "capitalize", fontSize: 17 },
  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 },
  chip: { borderWidth: 1, borderColor: "#dce3df", borderRadius: 999, paddingHorizontal: 12, minHeight: 34, justifyContent: "center", backgroundColor: "#fff" },
  chipActive: { borderColor: "#1f2523", backgroundColor: "#1f2523" },
  chipText: { color: "#67716d", fontWeight: "800" },
  chipTextActive: { color: "#fff" },
  checkRow: { flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 1, borderColor: "#dce3df", borderRadius: 8, padding: 12, marginTop: 10 },
  checkbox: { width: 28, height: 28, borderRadius: 6, borderWidth: 1, borderColor: "#1f2523", alignItems: "center", justifyContent: "center" },
  checkboxOn: { backgroundColor: "#1f2523" },
  checkboxText: { color: "#fff", fontWeight: "900" },
  checkText: { flex: 1 },
  historyGroup: { marginTop: 8 }
});
