此項目用於[滾動的天空Wiki](https://rs.miraheze.org/)的基於Cargo擴展（可不是Rust）的關卡導航框智能分組排序小工具。

實驗性功能，當前Wiki的Cargo數據中信息不全，有一些功能暫時無法支持。

如果您是繁體中文用戶且發現有個別詞語未適配，請創建Issue或者PR。

## 開發
本項目的實現得益於：
- [Bun](https://bun.com/)（包管理器）
- [Vite](https://vitejs.dev/)（前端構建工具）
- [Vue](https://cn.vuejs.org/)（前端框架）
- [@wikimedia/codex](https://www.mediawiki.org/wiki/Codex)（MediaWiki官方組件庫）
- [Cargo](https://www.mediawiki.org/wiki/Extension:Cargo)（Wiki數據庫擴展）

請先安裝[Bun](https://bun.com/)，然後運行`bun install`安裝依賴。其他包管理器亦可能可行，但未測試。

本項目使用了`vite-plugin-css-injected-by-js`插件，並使用了自制插件將ESM工程轉換為適配MediaWiki的格式。所有`vue`和`@wikimedia/codex`的依賴都會被移除，轉而使用`mw.loader.using`提供的`require`。

## 使用
請在您的[Special:參數設置](https://rs.miraheze.org/wiki/Special:Preferences)中啟用此小工具。
