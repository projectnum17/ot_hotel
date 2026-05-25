# 🚀 Optimized Gulp Starter

## 🛠 Commands
* `npm install` — Installing dependencies.
* `npx gulp` — Launch dev mode (server + watch).
* `npx gulp --prod` — Final build (minified, PurgeCSS, without sourcemaps).

## 📁 Structure
* `src/assets/scss/` — SASS source code.
* `src/assets/js/` — JS (Webpack + Babel).
* `src/templates/` — Panini components (layouts, partials, etc.).
* `src/assets/fonts/` — for auto convert ttf to woff2

## ⚙️ Features
* In HTML, use `@@suffix` for paths: `<link href="css/style@@suffix.css">`.
* Automatic removal of unused CSS in Production.
* BEM validation and HTML formatting.