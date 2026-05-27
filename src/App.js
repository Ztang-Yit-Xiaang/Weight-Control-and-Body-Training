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
  NativeModules,
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
const DEFAULT_AI_API_URL = process.env.EXPO_PUBLIC_AI_API_URL || "https://weight-control-and-body-training.vercel.app";

const copy = {
  en: {
    addBodyPhotoFirst: "Add height, weight, age, sex, and a progress photo before estimating 體脂率.",
    aiUrl: "AI API URL",
    aiBackend: "AI backend",
    aiConnected: "Connected",
    aiNeedsUrl: "Needs AI API URL",
    aiStatusHelp: "Open Vital Lens Settings and add your Vercel backend URL.",
    aiTest: "AI Test",
    aiTestBodyContext: "Body test uses your current height, weight, age, sex, and a new photo.",
    aiTestExercisePhoto: "Test exercise photo",
    aiTestIngredientsPhoto: "Test ingredients photo",
    aiTestMealPhoto: "Test meal photo",
    aiTestBodyPhoto: "Test body photo",
    aiTestIntro: "Use these buttons to verify the cloud AI before logging real data.",
    aiTestResult: "AI test result",
    aiTestTextExamples: "Text parsing examples",
    aiTextResultPrefix: "Text",
    aiFallbackTitle: "AI fallback",
    aiPhotoFallbackTitle: "AI photo fallback",
    analyzing: "Analyzing...",
    activity: "Activity",
    activityCenter: "Activity Center",
    activityName: "Activity name",
    activityLogged: "Activity saved",
    activityParsed: "Activity parsed by AI",
    activitySavedDetail: "{{name}} · {{minutes}} min · {{intensity}}",
    addPlan: "Add plan",
    age: "Age",
    aiDraft: "AI draft",
    analyzeBody: "Analyze body photo",
    analyzeIngredients: "Analyze ingredients",
    analyzeMeal: "Analyze meal photo",
    analyzeWorkout: "Analyze workout photo",
    body: "Body",
    bodyEstimateCreated: "體脂率 estimate created",
    bodyEstimateHelp: "Add height, weight, age, sex, and a photo to generate an educational range.",
    bodyEstimateTitle: "Estimate 體脂率 from progress context",
    bodyPhotoButton: "Take body progress photo",
    calendar: "Calendar",
    calendarEventAdded: "Calendar event added",
    calendarEventAddedBody: "Added {{kind}} event to Apple Calendar.",
    calendarPermissionBody: "Vital Lens can only add Apple Calendar events after permission is granted.",
    calendarPermissionTitle: "Calendar permission needed",
    calendarAndNotifications: "Notifications and calendar",
    checkList: "Today Checklist",
    cardio: "Cardio",
    complete: "Complete",
    completed: "Completed",
    confidence: "Confidence",
    connectedHint: "Vercel backend is ready for text parsing and photo AI.",
    dailyReview: "Run daily review",
    dailyReviewComplete: "Daily review complete",
    dailyReviewDetail: "Plan training, add 25-35g protein, and protect tonight's sleep target.",
    dailyRhythm: "Daily rhythm",
    detectedIngredients: "Detected ingredients",
    diet: "Diet",
    distance: "Distance",
    duration: "Duration min",
    educationalBodyEstimate: "Educational body estimate",
    educationalBodyNote: "This is an educational range, not a medical measurement. Use consistent lighting, posture, and distance for progress tracking.",
    educationalFallback: "educational fallback",
    english: "English",
    exercise: "exercise",
    female: "Female",
    expoSettingsNote: "Expo Go Settings controls Expo Go. Vital Lens Settings below controls language and AI.",
    fallbackManualDraft: "A local draft was created so you can still edit and save.",
    foodPhotoHelp: "Take a food photo and AI estimates food, calories, protein, carbs, fat, and uncertainty.",
    freeText: "Free text in any language",
    genericMeal: "Meal",
    googleCalendarOpened: "Google Calendar opened",
    googleCalendar: "Google Calendar",
    heightCm: "Height cm",
    history: "History",
    home: "Home",
    holdSec: "Hold sec",
    intensity: "Intensity",
    ingredientsSeen: "Ingredients seen",
    ingredients: "ingredients",
    kg: "kg",
    kcal: "kcal",
    kitchen: "Kitchen",
    kitchenIngredientsAnalyzed: "Kitchen ingredients analyzed",
    kitchenScanner: "Kitchen scanner",
    language: "Language",
    latestEstimate: "Estimated range: {{range}}. Confidence: {{confidence}}. {{notes}}",
    localFallback: "local fallback",
    macAwayInstall: "For use away from your Mac, install an EAS internal iOS build. Expo Go Settings is separate from this Vital Lens Settings screen.",
    male: "Male",
    manual: "manual",
    manualChecklist: "manual checklist",
    manualFallback: "manual fallback",
    manualForm: "Manual sport form",
    mealAddedManually: "Meal added manually",
    meal: "meal prep",
    mealNote: "Meal note",
    mealPhotoAnalyzed: "Meal photo analyzed",
    mealSuggestionsGenerated: "Meal suggestions generated",
    missingFields: "Missing fields",
    moreInfoNeeded: "More information needed",
    moveLoad: "Move load",
    minuteShort: "min",
    morningPlan: "Morning plan",
    nightReview: "Night review",
    noActivity: "No completed activities yet.",
    noCalendarBody: "No writable Apple Calendar was available on this device.",
    noCalendarTitle: "No calendar found",
    notes: "Notes",
    notificationDisabledBody: "Vital Lens cannot schedule reminders without notification permission.",
    notificationDisabledTitle: "Notifications disabled",
    cameraPermissionTitle: "Camera permission needed",
    cameraPermissionBody: "You can still use manual logging, but camera capture needs permission.",
    nutrition: "Nutrition",
    openSettingsForUrl: "Open Vital Lens Settings and add your Vercel backend URL.",
    openaiKeyNote: "Keep OPENAI_API_KEY in Vercel only. The iPhone app calls your cloud backend and never stores the API key.",
    parseWithAI: "Parse with AI",
    parsing: "Parsing...",
    photoAI: "Photo AI",
    photoMealJournal: "Photo meal journal",
    photoSavedManual: "The photo was kept and you can still save manually.",
    photoAiSource: "photo AI",
    planAdded: "Plan added",
    plans: "Plans",
    protein: "protein",
    proteinGrainBowl: "Protein grain bowl",
    recentLogs: "Recent logs",
    recoveryRhythm: "Recovery rhythm",
    recoverySnack: "Recovery snack",
    reps: "Reps",
    reviewMealsTrainingSleep: "Review meals, training, and sleep target.",
    saveActivity: "Save activity",
    saveMeal: "Save meal",
    schedule: "Schedule",
    settings: "Settings",
    settingsEyebrow: "AI and language",
    sex: "Sex",
    sets: "Sets",
    simpleRecoverySnack: "Simple recovery snack",
    sleep: "Sleep",
    sleepQuality: "Sleep quality 1-10",
    sleepRhythm: "Sleep rhythm",
    sleepTarget: "Sleep target",
    sleepTime: "Sleep time",
    sleepTimingUpdated: "Sleep timing updated",
    sport: "Sport",
    strength: "Strength",
    statusNotYet: "Not yet",
    suggestMeals: "Suggest meals",
    suggestionDetail: "High-protein option · works with today's training load.",
    takeBodyPhoto: "Take body progress photo",
    time: "Time",
    timeInputHelp: "Use HH:MM, 24-hour time.",
    todayChecklistReady: "Activity checklist ready",
    todayChecklistReadyDetail: "Running and plank are planned for today",
    today: "Today",
    trackSleep: "Track sleeping timing",
    turnIngredientsIntoMeals: "Turn ingredients into meals",
    unit: "Unit",
    updateSleep: "Update sleep",
    vegetableOmelet: "Vegetable omelet",
    wakeTime: "Wake time",
    weight: "Weight",
    weightKg: "Weight kg",
    appleCalendar: "Apple Calendar",
    workout: "workout",
    core: "Core",
    daily: "Daily",
    hard: "Hard",
    legacy: "Legacy",
    legacyManual: "legacy manual",
    legacyPhoto: "legacy photo",
    light: "Light",
    mobility: "Mobility",
    moderate: "Moderate",
    recovery: "Recovery",
    traditionalChinese: "繁體中文"
  },
  zh: {
    addBodyPhotoFirst: "請先加入身高、體重、年齡、性別與進度照片，再估算體脂率。",
    aiUrl: "AI API 網址",
    aiBackend: "AI 後端",
    aiConnected: "已連線",
    aiNeedsUrl: "需要 AI API 網址",
    aiStatusHelp: "請在 Vital Lens 設定中加入 Vercel 後端網址。",
    aiTest: "AI 測試",
    aiTestBodyContext: "身體測試會使用目前的身高、體重、年齡、性別與一張新照片。",
    aiTestExercisePhoto: "測試運動照片",
    aiTestIngredientsPhoto: "測試食材照片",
    aiTestMealPhoto: "測試餐點照片",
    aiTestBodyPhoto: "測試身體照片",
    aiTestIntro: "用這些按鈕先確認雲端 AI 是否正常，再開始正式記錄。",
    aiTestResult: "AI 測試結果",
    aiTestTextExamples: "文字解析範例",
    aiTextResultPrefix: "文字",
    aiFallbackTitle: "AI 備援",
    aiPhotoFallbackTitle: "照片 AI 備援",
    analyzing: "分析中...",
    activity: "活動",
    activityCenter: "活動中心",
    activityName: "活動名稱",
    activityLogged: "活動已儲存",
    activityParsed: "AI 已解析活動",
    activitySavedDetail: "{{name}} · {{minutes}} 分鐘 · {{intensity}}",
    addPlan: "加入計畫",
    age: "年齡",
    aiDraft: "AI 草稿",
    analyzeBody: "分析身體照片",
    analyzeIngredients: "分析食材",
    analyzeMeal: "分析餐點照片",
    analyzeWorkout: "分析運動照片",
    body: "身體",
    bodyEstimateCreated: "體脂率估算已建立",
    bodyEstimateHelp: "加入身高、體重、年齡、性別與照片後，產生教育用途的區間估算。",
    bodyEstimateTitle: "依進度資料估算體脂率",
    bodyPhotoButton: "拍攝身體進度照片",
    calendar: "行事曆",
    calendarEventAdded: "行事曆事件已新增",
    calendarEventAddedBody: "已新增 {{kind}} 事件到 Apple 行事曆。",
    calendarPermissionBody: "需要授權後，Vital Lens 才能新增 Apple 行事曆事件。",
    calendarPermissionTitle: "需要行事曆權限",
    calendarAndNotifications: "通知與行事曆",
    checkList: "今日清單",
    cardio: "有氧",
    complete: "完成",
    completed: "已完成",
    confidence: "信心度",
    connectedHint: "Vercel 後端已可用於文字解析與照片 AI。",
    dailyReview: "執行每日回顧",
    dailyReviewComplete: "每日回顧完成",
    dailyReviewDetail: "規劃訓練、補充 25-35g 蛋白質，並保護今晚睡眠目標。",
    dailyRhythm: "每日節奏",
    detectedIngredients: "偵測到的食材",
    diet: "飲食",
    distance: "距離",
    duration: "時間 分鐘",
    educationalBodyEstimate: "教育用途體脂估算",
    educationalBodyNote: "這是教育用途的區間估算，不是醫療測量。請用一致的光線、姿勢與距離追蹤進度。",
    educationalFallback: "教育用途備援",
    english: "English",
    exercise: "運動",
    female: "女性",
    expoSettingsNote: "Expo Go 的設定只控制 Expo Go。下方 Vital Lens 設定才控制語言與 AI。",
    fallbackManualDraft: "已建立本機草稿，你仍然可以編輯並儲存。",
    foodPhotoHelp: "拍攝餐點照片後，AI 會估算食物、熱量、蛋白質、碳水、脂肪與不確定性。",
    freeText: "任何語言自由輸入",
    genericMeal: "餐點",
    googleCalendarOpened: "已開啟 Google 行事曆",
    googleCalendar: "Google 行事曆",
    heightCm: "身高 cm",
    history: "歷史紀錄",
    home: "首頁",
    holdSec: "維持秒數",
    intensity: "強度",
    ingredientsSeen: "看到的食材",
    ingredients: "食材",
    kg: "kg",
    kcal: "大卡",
    kitchen: "廚房",
    kitchenIngredientsAnalyzed: "廚房食材已分析",
    kitchenScanner: "廚房掃描",
    language: "語言",
    latestEstimate: "估算區間：{{range}}。信心度：{{confidence}}。{{notes}}",
    localFallback: "本機備援",
    macAwayInstall: "若要離開 Mac 使用，請安裝 EAS 內部 iOS 版本。Expo Go 設定與這個 Vital Lens 設定頁面是分開的。",
    male: "男性",
    manual: "手動",
    manualChecklist: "手動清單",
    manualFallback: "手動備援",
    manualForm: "手動專項表單",
    mealAddedManually: "已手動新增餐點",
    meal: "備餐",
    mealNote: "餐點備註",
    mealPhotoAnalyzed: "餐點照片已分析",
    mealSuggestionsGenerated: "餐點建議已產生",
    missingFields: "缺少欄位",
    moreInfoNeeded: "需要更多資訊",
    moveLoad: "活動量",
    minuteShort: "分鐘",
    morningPlan: "早晨計畫",
    nightReview: "夜間回顧",
    noActivity: "目前沒有已完成活動。",
    noCalendarBody: "此裝置沒有可寫入的 Apple 行事曆。",
    noCalendarTitle: "找不到行事曆",
    notes: "備註",
    notificationDisabledBody: "沒有通知權限時，Vital Lens 無法安排提醒。",
    notificationDisabledTitle: "通知已停用",
    cameraPermissionTitle: "需要相機權限",
    cameraPermissionBody: "你仍然可以手動記錄，但拍照需要相機權限。",
    nutrition: "營養",
    openSettingsForUrl: "請開啟 Vital Lens 設定並加入 Vercel 後端網址。",
    openaiKeyNote: "OPENAI_API_KEY 只放在 Vercel。iPhone App 只呼叫雲端後端，不會儲存 API key。",
    parseWithAI: "用 AI 解析",
    parsing: "解析中...",
    photoAI: "照片 AI",
    photoMealJournal: "照片飲食日誌",
    photoSavedManual: "照片已保留，你仍然可以手動儲存。",
    photoAiSource: "照片 AI",
    planAdded: "計畫已加入",
    plans: "計畫",
    protein: "蛋白質",
    proteinGrainBowl: "高蛋白穀物碗",
    recentLogs: "最近紀錄",
    recoveryRhythm: "恢復節奏",
    recoverySnack: "恢復點心",
    reps: "次數",
    reviewMealsTrainingSleep: "回顧餐點、訓練與睡眠目標。",
    saveActivity: "儲存活動",
    saveMeal: "儲存餐點",
    schedule: "安排",
    settings: "設定",
    settingsEyebrow: "AI 與語言",
    sex: "性別",
    sets: "組數",
    simpleRecoverySnack: "簡單恢復點心",
    sleep: "睡眠",
    sleepQuality: "睡眠品質 1-10",
    sleepRhythm: "睡眠節奏",
    sleepTarget: "睡眠目標",
    sleepTime: "入睡時間",
    sleepTimingUpdated: "睡眠時間已更新",
    sport: "球類與運動",
    strength: "肌力",
    statusNotYet: "尚未建立",
    suggestMeals: "建議餐點",
    suggestionDetail: "高蛋白選項 · 適合今天的訓練量。",
    takeBodyPhoto: "拍攝身體進度照片",
    time: "時間",
    timeInputHelp: "請使用 24 小時制 HH:MM。",
    todayChecklistReady: "活動清單已準備",
    todayChecklistReadyDetail: "今天已規劃跑步與棒式",
    today: "今天",
    trackSleep: "追蹤睡眠時間",
    turnIngredientsIntoMeals: "把食材變成餐點",
    unit: "單位",
    updateSleep: "更新睡眠",
    vegetableOmelet: "蔬菜歐姆蛋",
    wakeTime: "起床時間",
    weight: "重量",
    weightKg: "體重 kg",
    appleCalendar: "Apple 行事曆",
    workout: "訓練",
    core: "核心",
    daily: "日常活動",
    hard: "高強度",
    legacy: "舊紀錄",
    legacyManual: "舊手動紀錄",
    legacyPhoto: "舊照片紀錄",
    light: "低強度",
    mobility: "活動度",
    moderate: "中等強度",
    recovery: "恢復",
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

function detectInitialLocale() {
  const locale =
    NativeModules.SettingsManager?.settings?.AppleLocale ||
    NativeModules.SettingsManager?.settings?.AppleLanguages?.[0] ||
    Intl.DateTimeFormat().resolvedOptions().locale ||
    "en";
  const normalized = String(locale).toLowerCase();
  return normalized.startsWith("zh") || normalized.includes("tw") || normalized.includes("hk") || normalized.includes("hant") ? "zh" : "en";
}

function template(text, values = {}) {
  return String(text || "").replace(/\{\{(\w+)\}\}/g, (_, key) => values[key] ?? "");
}

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
    { id: "seed-1", titleKey: "sleepTimingUpdated", detail: "7h 25m sleep, quality 8/10", createdAt: new Date().toISOString() },
    { id: "seed-2", titleKey: "todayChecklistReady", detailKey: "todayChecklistReadyDetail", createdAt: new Date().toISOString() }
  ],
  settings: {
    locale: detectInitialLocale(),
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

function localizeMeta(value, t) {
  const key = String(value || "").trim().toLowerCase().replace(/\s+/g, "");
  const lookup = {
    "cardio": "cardio",
    "core": "core",
    "daily": "daily",
    "hard": "hard",
    "legacy": "legacy",
    "legacymanual": "legacyManual",
    "legacyphoto": "legacyPhoto",
    "light": "light",
    "localfallback": "localFallback",
    "manual": "manual",
    "manualfallback": "manualFallback",
    "moderate": "moderate",
    "mobility": "mobility",
    "photoai": "photoAiSource",
    "recovery": "recovery",
    "sport": "sport",
    "strength": "strength"
  };
  return lookup[key] ? t(lookup[key]) : value;
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

async function requestCameraPhoto(messages = {}) {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) {
    Alert.alert(messages.title || "Camera permission needed", messages.body || "You can still use manual logging, but camera capture needs permission.");
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

async function scheduleDailyReminder(time, title, body, messages = {}) {
  const permission = await Notifications.requestPermissionsAsync();
  if (!permission.granted) {
    Alert.alert(messages.title || "Notifications disabled", messages.body || "Vital Lens cannot schedule reminders without notification permission.");
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
  const [aiTestResult, setAiTestResult] = useState("");

  const locale = data.settings?.locale || "en";
  const t = (key) => copy[locale]?.[key] || copy.en[key] || key;
  const tt = (key, values) => template(t(key), values);
  const apiBase = normalizeApiUrl(data.settings?.aiApiUrl);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        if (saved) {
          const parsed = JSON.parse(saved);
          setData({
            ...initialState,
            ...parsed,
            settings: {
              ...initialState.settings,
              ...parsed.settings,
              aiApiUrl: parsed.settings?.aiApiUrl || initialState.settings.aiApiUrl
            },
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
      sleep: latestSleep ? `${latestSleep.sleepAt} - ${latestSleep.wakeAt}` : t("statusNotYet")
    };
  }, [allActivityLogs, data.mealLogs, latestSleep, locale]);

  function addRecentLog(title, detail) {
    const log = { id: makeId("recent"), title, detail, createdAt: new Date().toISOString() };
    setData((current) => ({ ...current, recentLogs: [log, ...(current.recentLogs || [])].slice(0, 14) }));
  }

  function cameraMessages() {
    return { title: t("cameraPermissionTitle"), body: t("cameraPermissionBody") };
  }

  function mealIdeas() {
    return [t("proteinGrainBowl"), t("vegetableOmelet"), t("simpleRecoverySnack")];
  }

  function setReadableAiTestResult(label, payload) {
    const pretty = typeof payload === "string" ? payload : JSON.stringify(payload, null, 2);
    setAiTestResult(`${label}\n${pretty}`);
  }

  async function postAI(path, payload) {
    if (!apiBase) throw new Error(t("aiNeedsUrl"));
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
      addRecentLog(t("activityParsed"), `${nextDraft.displayName || nextDraft.activityName} · ${nextDraft.confidence || "AI"}`);
    } catch (error) {
      const fallback = localParseActivity(freeText, locale);
      setDraft(fallback);
      setManual(fallback);
      Alert.alert(t("aiFallbackTitle"), `${error.message}\n\n${t("fallbackManualDraft")}`);
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
    addRecentLog(t("activityLogged"), tt("activitySavedDetail", { name: log.displayName, minutes: log.durationMinutes || "?", intensity: log.intensity }));
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
      notes: `${t("completed")} · ${plan.scheduledTime}`,
      confidence: t("manualChecklist")
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
    addRecentLog(t("planAdded"), `${plan.title} · ${plan.scheduledTime}`);
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
      Alert.alert(t("aiPhotoFallbackTitle"), `${error.message}\n\n${t("photoSavedManual")}`);
      return null;
    } finally {
      setBusy("");
    }
  }

  async function captureWorkoutPhoto() {
    const uri = await requestCameraPhoto(cameraMessages());
    if (!uri) return;
    const analysis = await analyzePhoto("exercise", uri, { activityCatalogSummary: catalogSummary(locale) });
    const parsed = analysis?.activity || localParseActivity("cardio 30 minutes", locale);
    const nextManual = { ...parsed, photoUri: uri, confidence: analysis?.confidence || parsed.confidence || t("manualFallback") };
    setManual(nextManual);
    setDraft(nextManual);
    saveActivityDraft(nextManual, "photo AI");
  }

  async function captureMealPhoto() {
    const uri = await requestCameraPhoto(cameraMessages());
    if (!uri) return;
    const analysis = await analyzePhoto("meal", uri);
    const log = {
      id: makeId("meal"),
      photoUri: uri,
      foods: analysis?.foods || [mealNote || t("photoMealJournal")],
      calories: Number(analysis?.calories) || 0,
      protein: Number(analysis?.protein) || 0,
      carbs: Number(analysis?.carbs) || 0,
      fat: Number(analysis?.fat) || 0,
      confidence: analysis?.confidence || t("manualFallback"),
      createdAt: new Date().toISOString()
    };
    setData((current) => ({ ...current, mealLogs: [log, ...current.mealLogs] }));
    addRecentLog(t("mealPhotoAnalyzed"), `${log.foods.join(", ")} · ${log.calories || "?"} ${t("kcal")} · ${log.protein || 0}g ${t("protein")}`);
  }

  function saveManualMeal() {
    const note = mealNote.trim() || t("genericMeal");
    const log = { id: makeId("meal"), photoUri: null, foods: [note], calories: 0, protein: 0, carbs: 0, fat: 0, confidence: t("manual"), createdAt: new Date().toISOString() };
    setData((current) => ({ ...current, mealLogs: [log, ...current.mealLogs] }));
    addRecentLog(t("mealAddedManually"), note);
    setMealNote("");
  }

  function saveSleep() {
    const log = { id: makeId("sleep"), sleepAt: normalizeTimeInput(sleepAt, "23:35"), wakeAt: normalizeTimeInput(wakeAt, "07:00"), quality: sleepQuality || "8", createdAt: new Date().toISOString() };
    setData((current) => ({ ...current, sleepLogs: [log, ...current.sleepLogs] }));
    addRecentLog(t("sleepTimingUpdated"), `${log.sleepAt} - ${log.wakeAt} · ${t("sleepQuality")} ${log.quality}/10`);
  }

  async function captureIngredients() {
    const uri = await requestCameraPhoto(cameraMessages());
    if (!uri) return;
    const analysis = await analyzePhoto("ingredients", uri);
    const scan = {
      id: makeId("ingredient"),
      photoUri: uri,
      detected: analysis?.ingredients || ["eggs", "spinach", "rice"],
      suggestions: analysis?.suggestions || mealIdeas(),
      confidence: analysis?.confidence || t("manualFallback"),
      createdAt: new Date().toISOString()
    };
    setData((current) => ({ ...current, ingredientScans: [scan, ...current.ingredientScans] }));
    addRecentLog(t("kitchenIngredientsAnalyzed"), scan.detected.join(", "));
  }

  async function suggestMeals() {
    try {
      setBusy("ingredients");
      const analysis = await postAI("/api/analyze-photo", { mode: "ingredients", locale, context: { ingredients } }).then((result) => result.analysis);
      const scan = {
        id: makeId("ingredient"),
        photoUri: null,
        detected: analysis?.ingredients || ingredients.split(",").map((item) => item.trim()).filter(Boolean),
        suggestions: analysis?.suggestions || mealIdeas(),
        confidence: analysis?.confidence || "AI",
        createdAt: new Date().toISOString()
      };
      setData((current) => ({ ...current, ingredientScans: [scan, ...current.ingredientScans] }));
      addRecentLog(t("mealSuggestionsGenerated"), scan.detected.join(", "));
    } catch (error) {
      const scan = {
        id: makeId("ingredient"),
        photoUri: null,
        detected: ingredients.split(",").map((item) => item.trim()).filter(Boolean),
        suggestions: mealIdeas(),
        confidence: t("localFallback"),
        createdAt: new Date().toISOString()
      };
      setData((current) => ({ ...current, ingredientScans: [scan, ...current.ingredientScans] }));
      Alert.alert(t("aiFallbackTitle"), error.message);
    } finally {
      setBusy("");
    }
  }

  async function captureBodyPhoto() {
    const uri = await requestCameraPhoto(cameraMessages());
    if (uri) setBodyForm((current) => ({ ...current, photoUri: uri }));
  }

  async function createBodyEstimate() {
    const fallbackRange = estimateBodyFat(bodyForm);
    if (!fallbackRange || !bodyForm.photoUri) {
      Alert.alert(t("moreInfoNeeded"), t("addBodyPhotoFirst"));
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
      confidence: analysis?.confidence || t("educationalFallback"),
      notes: analysis?.notes || t("educationalBodyNote"),
      createdAt: new Date().toISOString()
    };
    setBodyDraft(estimate);
    setData((current) => ({ ...current, bodyEstimates: [estimate, ...current.bodyEstimates] }));
    addRecentLog(t("bodyEstimateCreated"), `${estimate.estimatedRange} · ${estimate.confidence}`);
  }

  async function updateReminder(kind, patch) {
    const settings = { ...data.reminderSettings, ...patch };
    const isMorning = kind === "morning";
    const enabledKey = isMorning ? "morningEnabled" : "nightEnabled";
    const timeKey = isMorning ? "morningTime" : "nightTime";
    const idKey = isMorning ? "morningNotificationId" : "nightNotificationId";
    const title = isMorning ? `Vital Lens ${t("morningPlan")}` : `Vital Lens ${t("sleepTarget")}`;
    const body = isMorning ? t("dailyReviewDetail") : t("reviewMealsTrainingSleep");
    await cancelReminder(settings[idKey]);
    settings[idKey] = null;
    if (settings[enabledKey]) settings[idKey] = await scheduleDailyReminder(settings[timeKey], title, body, { title: t("notificationDisabledTitle"), body: t("notificationDisabledBody") });
    setData((current) => ({ ...current, reminderSettings: settings }));
  }

  async function createAppleCalendarEvent(kind) {
    const permission = await Calendar.requestCalendarPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(t("calendarPermissionTitle"), t("calendarPermissionBody"));
      return;
    }
    const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
    const targetCalendar = calendars.find((calendar) => calendar.allowsModifications) || calendars[0];
    if (!targetCalendar) {
      Alert.alert(t("noCalendarTitle"), t("noCalendarBody"));
      return;
    }
    const startDate = new Date();
    if (kind === "workout") startDate.setHours(18, 0, 0, 0);
    if (kind === "meal") startDate.setHours(17, 30, 0, 0);
    if (kind === "sleep") startDate.setHours(23, 30, 0, 0);
    const endDate = new Date(startDate);
    endDate.setMinutes(startDate.getMinutes() + (kind === "sleep" ? 30 : 60));
    await Calendar.createEventAsync(targetCalendar.id, { title: `Vital Lens ${t(kind)}`, notes: "Created by Vital Lens.", startDate, endDate, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone });
    addRecentLog(t("calendarEventAdded"), t(kind));
    Alert.alert(t("calendarEventAdded"), tt("calendarEventAddedBody", { kind: t(kind) }));
  }

  function openGoogleCalendar(kind) {
    const startDate = new Date();
    if (kind === "workout") startDate.setHours(18, 0, 0, 0);
    if (kind === "meal") startDate.setHours(17, 30, 0, 0);
    if (kind === "sleep") startDate.setHours(23, 30, 0, 0);
    const endDate = new Date(startDate);
    endDate.setMinutes(startDate.getMinutes() + (kind === "sleep" ? 30 : 60));
    const formatGoogleDate = (date) => date.toISOString().replace(/[-:]|\.\d{3}/g, "");
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`Vital Lens ${t(kind)}`)}&dates=${formatGoogleDate(startDate)}/${formatGoogleDate(endDate)}&details=${encodeURIComponent("Created by Vital Lens.")}`;
    Linking.openURL(url);
    addRecentLog(t("googleCalendarOpened"), t(kind));
  }

  function runDailyReview() {
    addRecentLog(t("dailyReviewComplete"), t("dailyReviewDetail"));
  }

  async function runTextAiTest(example) {
    setBusy(`test-${example}`);
    try {
      const result = await postAI("/api/parse-activity", { text: example, locale, activityCatalogSummary: catalogSummary(locale) });
      const activity = { ...localParseActivity(example, locale), ...result.activity };
      setReadableAiTestResult(`${t("aiTextResultPrefix")}: ${example}`, {
        activity: activity.displayName,
        category: activity.category,
        durationMinutes: activity.durationMinutes,
        metrics: activity.metrics,
        intensity: activity.intensity,
        confidence: activity.confidence,
        missingFields: activity.missingFields
      });
    } catch (error) {
      const fallback = localParseActivity(example, locale);
      setReadableAiTestResult(`${t("aiFallbackTitle")}: ${example}`, { error: error.message, fallback });
    } finally {
      setBusy("");
    }
  }

  async function runPhotoAiTest(mode) {
    const uri = await requestCameraPhoto(cameraMessages());
    if (!uri) return;
    setBusy(`test-${mode}`);
    try {
      const imageDataUrl = await imageToDataUrl(uri);
      const result = await postAI("/api/analyze-photo", { mode, imageDataUrl, locale, context: { bodyForm, ingredients, activityCatalogSummary: catalogSummary(locale) } });
      const analysis = result.analysis || {};
      setReadableAiTestResult(`${t("photoAI")}: ${t(mode)}`, {
        mode: analysis.mode,
        confidence: analysis.confidence,
        activity: analysis.activity?.displayName,
        foods: analysis.foods,
        calories: analysis.calories,
        protein: analysis.protein,
        carbs: analysis.carbs,
        fat: analysis.fat,
        ingredients: analysis.ingredients,
        suggestions: analysis.suggestions,
        estimatedRange: analysis.estimatedRange,
        notes: analysis.notes
      });
    } catch (error) {
      setReadableAiTestResult(`${t("aiPhotoFallbackTitle")}: ${t(mode)}`, { error: error.message });
    } finally {
      setBusy("");
    }
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
            <Text style={styles.eyebrow}>Vital Lens</Text>
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
            <View style={styles.statusCard}>
              <Text style={styles.statusLabel}>{t("aiBackend")}</Text>
              <Text style={styles.statusValue}>{apiBase ? t("aiConnected") : t("aiNeedsUrl")}</Text>
              <Text style={styles.detail}>{apiBase || t("aiStatusHelp")}</Text>
            </View>
            <View style={styles.metricGrid}>
              <Metric label={t("moveLoad")} value={`${summary.moveLoad}%`} detail={`${allActivityLogs.length} ${t("activity")}`} color="#a25842" />
              <Metric label={t("nutrition")} value={`${summary.nutrition}%`} detail={`${data.mealLogs.length} ${t("diet")}`} color="#6f8f72" />
              <Metric label={t("sleepRhythm")} value={summary.sleep} detail={`${t("sleepQuality")} ${latestSleep.quality}/10`} color="#5c87a5" />
              <Metric label="體脂率" value={latestBody?.estimatedRange || t("statusNotYet")} detail={t("educationalBodyEstimate")} color="#d7a441" />
            </View>
            <TouchableOpacity style={styles.primaryButton} onPress={runDailyReview}><Text style={styles.primaryButtonText}>{t("dailyReview")}</Text></TouchableOpacity>
            <RecentLogs logs={data.recentLogs} t={t} />
          </View>
        )}

        {activeTab === "Activity" && (
          <View>
            <Panel title={t("activityCenter")} eyebrow={t("photoAI")}>
              <Text style={styles.label}>{t("freeText")}</Text>
              <TextInput value={freeText} onChangeText={setFreeText} multiline style={[styles.input, styles.multiline]} placeholder="跑步 30 分鐘 3 miles easy" placeholderTextColor="#8a928e" />
              <TouchableOpacity style={styles.primaryButton} onPress={parseActivityWithAI}>
                <Text style={styles.primaryButtonText}>{busy === "parse" ? t("parsing") : t("parseWithAI")}</Text>
              </TouchableOpacity>
              <Insight text={`${t("aiDraft")}: ${draft.displayName || draft.activityName || "-"} · ${draft.durationMinutes || "?"} ${t("minuteShort")} · ${localizeMeta(draft.confidence, t) || "-"}`} />
            </Panel>

            <Panel title={t("manualForm")} eyebrow={t("activity")}>
              <ActivityCatalogPicker catalog={activityCatalog.slice(0, 18)} locale={locale} selectedId={manual.catalogId} onSelect={(item) => setManual({ ...manual, catalogId: item.id, displayName: labelFor(item, locale), category: item.category, formType: item.formType })} />
              <Field label={t("activityName")} value={manual.displayName || ""} onChangeText={(value) => updateManual("displayName", value)} />
              <View style={styles.row}>
                <Field label={t("duration")} value={String(manual.durationMinutes || "")} onChangeText={(value) => updateManual("durationMinutes", value)} keyboardType="number-pad" />
                <Field label={t("intensity")} value={manual.intensity || ""} onChangeText={(value) => updateManual("intensity", value)} />
              </View>
              {manual.formType === "run" && (
                <View style={styles.row}>
                  <Field label={t("distance")} value={String(manual.metrics?.distance || "")} onChangeText={(value) => updateManual("metrics.distance", value)} keyboardType="decimal-pad" />
                  <Field label={t("unit")} value={String(manual.metrics?.distanceUnit || "km")} onChangeText={(value) => updateManual("metrics.distanceUnit", value)} />
                </View>
              )}
              {manual.formType === "hold" && (
                <View style={styles.row}>
                  <Field label={t("holdSec")} value={String(manual.metrics?.holdSeconds || "")} onChangeText={(value) => updateManual("metrics.holdSeconds", value)} keyboardType="number-pad" />
                  <Field label={t("sets")} value={String(manual.metrics?.sets || "")} onChangeText={(value) => updateManual("metrics.sets", value)} keyboardType="number-pad" />
                </View>
              )}
              {manual.formType === "strength" && (
                <>
                  <View style={styles.row}>
                    <Field label={t("sets")} value={String(manual.metrics?.sets || "")} onChangeText={(value) => updateManual("metrics.sets", value)} keyboardType="number-pad" />
                    <Field label={t("reps")} value={String(manual.metrics?.reps || "")} onChangeText={(value) => updateManual("metrics.reps", value)} keyboardType="number-pad" />
                  </View>
                  <Field label={t("weight")} value={String(manual.metrics?.weight || "")} onChangeText={(value) => updateManual("metrics.weight", value)} keyboardType="decimal-pad" />
                </>
              )}
              <Field label={t("notes")} value={manual.notes || ""} onChangeText={(value) => updateManual("notes", value)} multiline />
              <TouchableOpacity style={styles.primaryButton} onPress={() => saveActivity("manual")}><Text style={styles.primaryButtonText}>{t("saveActivity")}</Text></TouchableOpacity>
              <TouchableOpacity style={styles.photoButton} onPress={captureWorkoutPhoto}><Text style={styles.photoButtonText}>{busy === "exercise" ? t("analyzing") : t("analyzeWorkout")}</Text></TouchableOpacity>
            </Panel>

            <Panel title={t("checkList")} eyebrow={t("plans")}>
              <View style={styles.row}>
                <Field label={t("activityName")} value={planTitle} onChangeText={setPlanTitle} />
                <Field label={t("time")} value={planTime} onChangeText={setPlanTime} />
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

            <Panel title={t("history")} eyebrow={t("completed")}>
              <ActivityHistory logs={allActivityLogs} t={t} />
            </Panel>
          </View>
        )}

        {activeTab === "Diet" && (
          <Panel title={t("photoMealJournal")} eyebrow={t("diet")}>
            <TouchableOpacity style={styles.photoButton} onPress={captureMealPhoto}><Text style={styles.photoButtonText}>{busy === "meal" ? t("analyzing") : t("analyzeMeal")}</Text></TouchableOpacity>
            <Field label={t("mealNote")} value={mealNote} onChangeText={setMealNote} placeholder={t("genericMeal")} />
            <TouchableOpacity style={styles.primaryButton} onPress={saveManualMeal}><Text style={styles.primaryButtonText}>{t("saveMeal")}</Text></TouchableOpacity>
            <LatestPhoto uri={data.mealLogs[0]?.photoUri} />
            <Insight text={data.mealLogs[0] ? `${data.mealLogs[0].foods.join(", ")} · ${data.mealLogs[0].calories || t("manual")} ${t("kcal")} · ${data.mealLogs[0].protein || 0}g ${t("protein")} · ${t("confidence")} ${data.mealLogs[0].confidence}` : t("foodPhotoHelp")} />
          </Panel>
        )}

        {activeTab === "Sleep" && (
          <Panel title={t("trackSleep")} eyebrow={t("recoveryRhythm")}>
            <View style={styles.row}>
              <Field label={t("sleepTime")} value={sleepAt} onChangeText={setSleepAt} placeholder="23:35" />
              <Field label={t("wakeTime")} value={wakeAt} onChangeText={setWakeAt} placeholder="07:00" />
            </View>
            <Field label={t("sleepQuality")} value={sleepQuality} onChangeText={setSleepQuality} keyboardType="number-pad" />
            <TouchableOpacity style={styles.primaryButton} onPress={saveSleep}><Text style={styles.primaryButtonText}>{t("updateSleep")}</Text></TouchableOpacity>
          </Panel>
        )}

        {activeTab === "Kitchen" && (
          <Panel title={t("turnIngredientsIntoMeals")} eyebrow={t("kitchenScanner")}>
            <TouchableOpacity style={styles.photoButton} onPress={captureIngredients}><Text style={styles.photoButtonText}>{busy === "ingredients" ? t("analyzing") : t("analyzeIngredients")}</Text></TouchableOpacity>
            <Field label={t("ingredientsSeen")} value={ingredients} onChangeText={setIngredients} multiline />
            <TouchableOpacity style={styles.primaryButton} onPress={suggestMeals}><Text style={styles.primaryButtonText}>{t("suggestMeals")}</Text></TouchableOpacity>
            <LatestPhoto uri={data.ingredientScans[0]?.photoUri} />
            <SuggestionList items={data.ingredientScans[0]?.suggestions || mealIdeas()} t={t} />
          </Panel>
        )}

        {activeTab === "Body" && (
          <Panel title={t("bodyEstimateTitle")} eyebrow={t("educationalBodyEstimate")}>
            <Text style={styles.warning}>{t("educationalBodyNote")}</Text>
            <View style={styles.row}>
              <Field label={t("heightCm")} value={bodyForm.height} onChangeText={(height) => setBodyForm((current) => ({ ...current, height }))} keyboardType="number-pad" />
              <Field label={t("weightKg")} value={bodyForm.weight} onChangeText={(weight) => setBodyForm((current) => ({ ...current, weight }))} keyboardType="decimal-pad" />
            </View>
            <View style={styles.row}>
              <Field label={t("age")} value={bodyForm.age} onChangeText={(age) => setBodyForm((current) => ({ ...current, age }))} keyboardType="number-pad" />
              <View style={styles.field}>
                <Text style={styles.label}>{t("sex")}</Text>
                <Segmented values={[{ label: t("male"), value: "Male" }, { label: t("female"), value: "Female" }]} value={bodyForm.sex} onChange={(sex) => setBodyForm((current) => ({ ...current, sex }))} />
              </View>
            </View>
            <TouchableOpacity style={styles.photoButton} onPress={captureBodyPhoto}><Text style={styles.photoButtonText}>{t("takeBodyPhoto")}</Text></TouchableOpacity>
            <LatestPhoto uri={bodyForm.photoUri || bodyDraft?.photoUri} />
            <TouchableOpacity style={styles.primaryButton} onPress={createBodyEstimate}><Text style={styles.primaryButtonText}>{busy === "body" ? t("analyzing") : t("analyzeBody")}</Text></TouchableOpacity>
            <Insight text={bodyDraft ? tt("latestEstimate", { range: bodyDraft.estimatedRange, confidence: bodyDraft.confidence, notes: bodyDraft.notes || "" }) : t("bodyEstimateHelp")} />
          </Panel>
        )}

        {activeTab === "Calendar" && (
          <Panel title={t("calendarAndNotifications")} eyebrow={t("dailyRhythm")}>
            <ReminderControl label={t("morningPlan")} time={data.reminderSettings.morningTime} enabled={data.reminderSettings.morningEnabled} onTimeChange={(time) => setData((current) => ({ ...current, reminderSettings: { ...current.reminderSettings, morningTime: normalizeTimeInput(time, current.reminderSettings.morningTime) } }))} onToggle={(enabled) => updateReminder("morning", { morningEnabled: enabled })} onSchedule={() => updateReminder("morning", {})} t={t} />
            <ReminderControl label={t("nightReview")} time={data.reminderSettings.nightTime} enabled={data.reminderSettings.nightEnabled} onTimeChange={(time) => setData((current) => ({ ...current, reminderSettings: { ...current.reminderSettings, nightTime: normalizeTimeInput(time, current.reminderSettings.nightTime) } }))} onToggle={(enabled) => updateReminder("night", { nightEnabled: enabled })} onSchedule={() => updateReminder("night", {})} t={t} />
            {["workout", "meal", "sleep"].map((kind) => (
              <View key={kind} style={styles.calendarRow}>
                <Text style={styles.calendarKind}>{t(kind)}</Text>
                <TouchableOpacity style={styles.secondaryButton} onPress={() => createAppleCalendarEvent(kind)}><Text style={styles.secondaryButtonText}>{t("appleCalendar")}</Text></TouchableOpacity>
                <TouchableOpacity style={styles.secondaryButton} onPress={() => openGoogleCalendar(kind)}><Text style={styles.secondaryButtonText}>{t("googleCalendar")}</Text></TouchableOpacity>
              </View>
            ))}
          </Panel>
        )}

        {activeTab === "Settings" && (
          <Panel title={t("settings")} eyebrow={t("settingsEyebrow")}>
            <Text style={styles.label}>{t("language")}</Text>
            <Segmented values={[t("english"), t("traditionalChinese")]} value={locale === "zh" ? t("traditionalChinese") : t("english")} onChange={(value) => setData((current) => ({ ...current, settings: { ...current.settings, locale: value === t("traditionalChinese") ? "zh" : "en" } }))} />
            <Field label={t("aiUrl")} value={data.settings.aiApiUrl || ""} onChangeText={(aiApiUrl) => setData((current) => ({ ...current, settings: { ...current.settings, aiApiUrl } }))} placeholder="https://your-app.vercel.app" />
            <Insight text={t("openaiKeyNote")} />
            <Insight text={t("expoSettingsNote")} />
            <Insight text={t("macAwayInstall")} />
            <View style={styles.aiTestBlock}>
              <Text style={styles.sectionTitle}>{t("aiTest")}</Text>
              <Text style={styles.detail}>{t("aiTestIntro")}</Text>
              <Text style={styles.label}>{t("aiTestTextExamples")}</Text>
              {["跑步 30 分鐘 3 miles easy", "plank 3 sets 60 sec", "深蹲 4 組 每組 10 下"].map((example) => (
                <TouchableOpacity key={example} style={styles.secondaryButton} onPress={() => runTextAiTest(example)}>
                  <Text style={styles.secondaryButtonText}>{busy === `test-${example}` ? t("parsing") : example}</Text>
                </TouchableOpacity>
              ))}
              <Text style={styles.label}>{t("photoAI")}</Text>
              <TouchableOpacity style={styles.photoButton} onPress={() => runPhotoAiTest("exercise")}><Text style={styles.photoButtonText}>{busy === "test-exercise" ? t("analyzing") : t("aiTestExercisePhoto")}</Text></TouchableOpacity>
              <TouchableOpacity style={styles.photoButton} onPress={() => runPhotoAiTest("meal")}><Text style={styles.photoButtonText}>{busy === "test-meal" ? t("analyzing") : t("aiTestMealPhoto")}</Text></TouchableOpacity>
              <TouchableOpacity style={styles.photoButton} onPress={() => runPhotoAiTest("ingredients")}><Text style={styles.photoButtonText}>{busy === "test-ingredients" ? t("analyzing") : t("aiTestIngredientsPhoto")}</Text></TouchableOpacity>
              <Text style={styles.detail}>{t("aiTestBodyContext")}</Text>
              <TouchableOpacity style={styles.photoButton} onPress={() => runPhotoAiTest("body")}><Text style={styles.photoButtonText}>{busy === "test-body" ? t("analyzing") : t("aiTestBodyPhoto")}</Text></TouchableOpacity>
              <Text style={styles.label}>{t("aiTestResult")}</Text>
              <Insight text={aiTestResult || t("statusNotYet")} />
            </View>
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
      {values.map((item) => {
        const optionValue = typeof item === "string" ? item : item.value;
        const optionLabel = typeof item === "string" ? item : item.label;
        return (
        <TouchableOpacity key={optionValue} style={[styles.segment, value === optionValue && styles.activeSegment]} onPress={() => onChange(optionValue)}>
          <Text style={[styles.segmentText, value === optionValue && styles.activeSegmentText]}>{optionLabel}</Text>
        </TouchableOpacity>
      );})}
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

function ActivityHistory({ logs, t }) {
  if (!logs.length) return <Text style={styles.detail}>{t("noActivity")}</Text>;
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
          <Text style={styles.detail}>{localizeMeta(log.category, t)} · {log.durationMinutes || "?"} {t("minuteShort")} · {localizeMeta(log.intensity || "Moderate", t)} · {localizeMeta(log.source, t)}</Text>
          {!!log.notes && <Text style={styles.detail}>{log.notes}</Text>}
        </View>
      ))}
    </View>
  ));
}

function SuggestionList({ items, t }) {
  return (
    <View style={styles.suggestionList}>
      {items.map((item) => (
        <View key={item} style={styles.suggestionItem}>
          <Text style={styles.suggestionTitle}>{item}</Text>
          <Text style={styles.detail}>{t("suggestionDetail")}</Text>
        </View>
      ))}
    </View>
  );
}

function RecentLogs({ logs, t }) {
  return (
    <View style={styles.panel}>
      <Text style={styles.eyebrow}>{t("recentLogs")}</Text>
      {logs.map((log) => (
        <View key={log.id} style={styles.logItem}>
          <Text style={styles.logTime}>{formatTime(log.createdAt)}</Text>
          <Text style={styles.logTitle}>{log.titleKey ? t(log.titleKey) : log.title}</Text>
          <Text style={styles.detail}>{log.detailKey ? t(log.detailKey) : log.detail}</Text>
        </View>
      ))}
    </View>
  );
}

function ReminderControl({ label, time, enabled, onToggle, onTimeChange, onSchedule, t }) {
  return (
    <View style={styles.reminderCard}>
      <View style={styles.reminderHeader}>
        <View>
          <Text style={styles.logTitle}>{label}</Text>
          <Text style={styles.detail}>{t("timeInputHelp")}</Text>
        </View>
        <Switch value={enabled} onValueChange={onToggle} />
      </View>
      <View style={styles.row}>
        <Field label={t("time")} value={time} onChangeText={onTimeChange} placeholder="08:00" />
        <TouchableOpacity style={styles.secondaryButton} onPress={onSchedule}><Text style={styles.secondaryButtonText}>{t("schedule")}</Text></TouchableOpacity>
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
  statusCard: { padding: 14, borderRadius: 8, backgroundColor: "#fff", borderWidth: 1, borderColor: "#dce3df", marginBottom: 14 },
  statusLabel: { color: "#67716d", fontWeight: "800", textTransform: "uppercase", fontSize: 12 },
  statusValue: { color: "#1f2523", fontWeight: "900", fontSize: 18, marginTop: 4 },
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
  aiTestBlock: { marginTop: 18, paddingTop: 14, borderTopWidth: 1, borderTopColor: "#dce3df" },
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
