function normalizeApiUrl(url) {
  return String(url || "").trim().replace(/\/$/, "");
}

function requestJson(apiBase, path, payload) {
  const base = normalizeApiUrl(apiBase);
  if (!base) {
    return Promise.reject(new Error("Missing AI API URL."));
  }
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${base}${path}`,
      method: "POST",
      data: payload,
      header: {
        "content-type": "application/json"
      },
      success(res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data || {});
        } else {
          const message = (res.data && res.data.error) || `AI request failed: ${res.statusCode}`;
          reject(new Error(message));
        }
      },
      fail(error) {
        reject(new Error(error.errMsg || "Network request failed."));
      }
    });
  });
}

function chooseImage() {
  return new Promise((resolve, reject) => {
    wx.chooseMedia({
      count: 1,
      mediaType: ["image"],
      sourceType: ["camera", "album"],
      sizeType: ["compressed"],
      success(result) {
        const file = result.tempFiles && result.tempFiles[0];
        if (!file || !file.tempFilePath) {
          reject(new Error("No image selected."));
          return;
        }
        resolve(file.tempFilePath);
      },
      fail(error) {
        reject(new Error(error.errMsg || "Image selection failed."));
      }
    });
  });
}

function imageToDataUrl(filePath) {
  return new Promise((resolve, reject) => {
    const fs = wx.getFileSystemManager();
    fs.readFile({
      filePath,
      encoding: "base64",
      success(result) {
        const lower = String(filePath || "").toLowerCase();
        const mime = lower.endsWith(".png") ? "image/png" : "image/jpeg";
        resolve(`data:${mime};base64,${result.data}`);
      },
      fail(error) {
        reject(new Error(error.errMsg || "Could not read image."));
      }
    });
  });
}

module.exports = {
  chooseImage,
  imageToDataUrl,
  normalizeApiUrl,
  requestJson
};
