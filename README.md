# ZMZ × VC Menu PWA（手机点餐）

This is a menu ordering system developed entirely with AI just to test vibecoding and have fun.

一个手机优先的 PWA 点餐系统：顾客扫码下单，商家在 `/admin` 管理订单。

## 1. 功能概览

- 顾客端（`/`）
  - 分类 Tabs（主食/小吃/饮料）
  - 菜品卡片（图片、描述、标签、售罄）
  - 搜索框
  - 购物车底栏 + 抽屉结算
  - 下单成功页（订单号 + 下单时间）
- 管理端（`/admin`）
  - 订单倒序列表
  - 状态更新（`NEW / COOKING / DONE`）
  - 5 秒自动刷新 + 手动刷新 + 下拉刷新
  - 打印友好样式（`Ctrl/Cmd + P`）
- PWA
  - `manifest.json`
  - `service worker` 缓存静态资源
  - 缓存 Supabase 菜单请求（离线可回落）

## 2. 项目结构

```txt
vc_menu/
├─ api/
│  └─ admin/
│     ├─ login.js
│     ├─ orders.js
│     └─ update-order-status.js
├─ public/
│  ├─ icons/
│  │  ├─ icon-192.svg
│  │  └─ icon-512.svg
│  ├─ manifest.json
│  └─ sw.js
├─ sql/
│  └─ schema.sql
├─ src/
│  ├─ components/
│  │  ├─ CartDrawer.jsx
│  │  ├─ CategoryTabs.jsx
│  │  ├─ MenuCard.jsx
│  │  └─ ThemeToggle.jsx
│  ├─ lib/
│  │  ├─ api.js
│  │  ├─ menu.js
│  │  ├─ pwa.js
│  │  └─ supabase.js
│  ├─ pages/
│  │  ├─ AdminPage.jsx
│  │  ├─ MenuPage.jsx
│  │  └─ OrderSuccessPage.jsx
│  ├─ App.jsx
│  ├─ main.jsx
│  └─ styles.css
├─ .env.example
├─ index.html
├─ package.json
├─ tailwind.config.js
├─ postcss.config.js
├─ vite.config.js
└─ vercel.json
```

## 3. 本地运行

```bash
npm install
cp .env.example .env
npm run dev
```

然后访问：
- 顾客端：`http://localhost:5173/`
- 管理端：`http://localhost:5173/admin`

## 4. Supabase 配置（从 0 开始）

1. 创建 Supabase 项目。
2. 打开 SQL Editor，执行 [sql/schema.sql](/home/sibel/vc_menu/sql/schema.sql)。
3. 在 Supabase 项目中获取：
   - `Project URL`
   - `anon key`
   - `service_role key`
4. 配置环境变量：
   - 前端（Vite）
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
   - Vercel Serverless
     - `SUPABASE_URL`
     - `SUPABASE_SERVICE_ROLE_KEY`
     - `ADMIN_TOKEN`（强随机长串）

## 5. 安全说明（重点）

- 顾客端只使用 `anon key`：
  - 允许读 `menu`
  - 允许写 `orders`（仅插入，状态限定 `NEW`）
- 管理端读/改订单不直接连 Supabase：
  - 通过 `/api/admin/*` 走 Vercel Serverless
  - API 使用 `SERVICE_ROLE_KEY`
  - 通过 `x-admin-token` + `ADMIN_TOKEN` 保护
- 这样可以避免把“订单更新权限”暴露给所有人。

## 6. 部署到 Vercel（免费）

1. 把本目录推到 GitHub。
2. 在 Vercel 导入仓库。
3. Build 设置：
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. 在 Vercel 项目里配置环境变量（同上 6 个）。
5. 部署完成后访问：
   - `https://your-domain.vercel.app/`
   - `https://your-domain.vercel.app/admin`

## 7. 生成二维码分享

上线后把点餐链接生成二维码即可。

```bash
# 安装（一次）
npm i -g qrcode-terminal

# 生成二维码
qrcode-terminal 'https://your-domain.vercel.app/'
```

也可用微信/浏览器在线二维码工具，把顾客端链接转成二维码贴在桌面。

## 8. 主题与设计体系

- 主题：浅色（默认）/深色切换
- 设计 token（见 [styles.css](/home/sibel/vc_menu/src/styles.css)）
  - 大圆角卡片
  - 清晰字号层级
  - 舒适留白
  - 统一按钮风格

## 9. 可选增强

- 使用 Supabase Realtime 订阅订单变更，替换轮询。
- 加一个厨房大屏路由（只显示 `NEW/COOKING`）。
- 在 `orders` 增加 `phone`/`pickup_code` 字段。
