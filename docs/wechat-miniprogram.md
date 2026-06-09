# WeChat Mini Program Setup

Vital Lens now has a WeChat Mini Program prototype in `wechat-miniprogram/`. It keeps the same Vercel AI backend and stores logs locally with WeChat storage.

## 1. Open In WeChat DevTools

1. Install WeChat Developer Tools from the official WeChat Mini Program site.
2. Open WeChat Developer Tools.
3. Choose `Import Project`.
4. Select this folder:

```text
/Users/chenyixin/Documents/Weight Control and Body Training/wechat-miniprogram
```

5. For quick local testing, keep `appid` as `touristappid`.
6. For real preview/upload, replace `touristappid` in `wechat-miniprogram/project.config.json` with your Mini Program AppID.

The project config disables DevTools URL checking for easier first local testing. Real phone preview and release still require the backend domain setup below.

## 2. Backend URL

The Mini Program defaults to:

```text
https://weight-control-and-body-training.vercel.app
```

In the Mini Program Settings tab, you can change `AI API URL` if your Vercel backend URL changes.

The WeChat frontend never stores `OPENAI_API_KEY`. Keep that key only in Vercel.

## 3. Required WeChat Admin Setup

Before real device preview or release, open the WeChat Mini Program admin console and add this as a request legal domain:

```text
https://weight-control-and-body-training.vercel.app
```

If the domain is not configured, `wx.request` may work in DevTools with checks disabled but fail on a real phone.

## 4. Test Checklist

- Open the Home tab and confirm the AI backend URL is shown.
- Activity: test `跑步 30 分鐘 3 miles easy`, `plank 3 sets 60 sec`, and `深蹲 4 組 每組 10 下`.
- Activity photo: choose camera or album and verify an editable exercise draft appears.
- Diet: take or choose a meal photo and verify foods/macros return.
- Kitchen: type ingredients or upload an ingredient photo and verify meal ideas return.
- Body: enter height, weight, age, and sex; test educational 體脂率 estimate.
- Settings: switch English/繁體中文 and run AI Test buttons.

## 5. Preview And Release

For your own phone:

1. In WeChat DevTools, click `Preview`.
2. Scan the preview QR code with WeChat.

For friends:

1. Register or use a real Mini Program AppID.
2. Add friends as project members or testers in the WeChat Mini Program admin console.
3. Upload a trial version from WeChat DevTools.
4. Submit for review before public release.

Unlike iOS apps, users do not download a WeChat Mini Program from the App Store. They open it through WeChat search, QR code, shared card, or a trial/preview QR code.
