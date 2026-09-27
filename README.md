# 錦和高中 課表查詢系統

React + Vite 建置的課表查詢系統，支援班級 / 教師雙向查詢、列印 A4 課表、Google Sheet 即時同步。

## 功能特色

- 🔍 **智慧搜尋** — 輸入班級代碼或教師姓名即時查詢
- 🔄 **班級 ↔ 教師切換** — 點擊課表中的教師/班級名稱直接跳轉
- 🖨️ **列印優化** — 一鍵列印 A4 直式課表，格式對齊實體課表
- 📊 **Google Sheet 同步** — 自動從雲端試算表抓取最新排課資料
- 📦 **離線備援** — 內建完整預設資料，無網路時仍可使用

## 快速開始

### 1. 安裝依賴

```bash
npm install
```

### 2. 設定環境變數

複製範例檔並填入實際值：

```bash
cp .env.example .env
```

編輯 `.env`：

```env
GOOGLE_SHEET_URL=你的Google Sheet CSV公開連結
ACCOUNT=登入帳號
PASSWORD=登入密碼
```

### 3. 啟動開發伺服器

```bash
npm run dev
```

開啟 `http://localhost:5173/` 即可瀏覽。

### 4. 建置生產版本

```bash
npm run build
npm run preview
```

## 部署到 GitHub Pages

本專案已配置 GitHub Actions 自動部署，push 到 `main` 分支即自動觸發。

### 設定步驟

#### Step 1：建立 GitHub Repository

```bash
git init
git add .
git commit -m "init: 課表查詢系統"
git remote add origin https://github.com/你的帳號/class-schedule.git
git branch -M main
git push -u origin main
```

#### Step 2：設定 Repository Secrets

到 GitHub Repository → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**，新增以下三個 Secrets：

| Secret 名稱 | 說明 | 範例值 |
|---|---|---|
| `GOOGLE_SHEET_URL` | Google Sheet CSV 公開連結 | `https://docs.google.com/spreadsheets/d/e/.../pub?output=csv` |
| `ACCOUNT` | 登入帳號 | `teacher` |
| `PASSWORD` | 登入密碼 | `your_password` |

#### Step 3：啟用 GitHub Pages

到 GitHub Repository → **Settings** → **Pages**：

- **Source** 選擇 **GitHub Actions**

#### Step 4：觸發部署

push 到 `main` 分支後，GitHub Actions 會自動執行：

1. 安裝依賴 (`npm ci`)
2. 注入環境變數並建置 (`npm run build`)
3. 部署到 GitHub Pages

部署完成後，網站網址為：

```
https://你的帳號.github.io/class-schedule/
```

可在 **Actions** 頁籤查看部署進度與紀錄。

## 專案結構

```
class-schedule/
├── .github/workflows/deploy.yml  # GitHub Actions 自動部署
├── src/
│   ├── components/               # React 元件
│   │   ├── ScheduleView.jsx      # 課表主檢視
│   │   ├── DataSourceModal.jsx   # 資料來源設定
│   │   ├── LoginPage.jsx         # 登入頁面
│   │   └── Navbar.jsx            # 導覽列
│   ├── constants/
│   │   ├── scheduleData.js       # 節次/時間定義 & 預設資料
│   │   └── clean_rows.json       # 離線課表資料集
│   ├── services/
│   │   └── sheetService.js       # Google Sheet 載入 & 解析
│   ├── App.jsx                   # 主應用元件
│   ├── index.css                 # 全域樣式 & 列印樣式
│   └── main.jsx                  # 進入點
├── index.html
├── vite.config.js
├── .env.example                  # 環境變數範例
├── .gitignore
└── package.json
```

## 技術棧

- **React 18** + **Vite 6**
- **PapaParse** — CSV 解析
- **Lucide React** — 圖示
- **Google Fonts** — Noto Sans TC / Outfit
