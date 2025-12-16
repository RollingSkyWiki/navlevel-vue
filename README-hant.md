[繁體中文](README-hant.md)

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
如果您是開發者：請在您的用戶JS中用JSDelivr引入此倉庫的代碼。
```js
// 將<HASH>替換為最新發布的提交短哈希
$.getScript('https://cdn.jsdelivr.net/gh/RollingSkyWiki/navlevel-vue@<HASH>/dist/navlevel.iife.min.js');
```


如果您是用戶：請在您的[Special:參數設置](https://rs.miraheze.org/wiki/Special:Preferences)中啟用此小工具。

### 擴展接口
25DecD版本暴露了一系列API給用戶使用，用戶可以通過它們來自定義更多的分組和排序規則。

您需要通過`window.NavLevel`這一全局變量來使用。注意，無論先於還是晚於此小工具運行，您的配置都會生效。具體地說：
- 若在此小工具加載前，`window.NavLevel`不存在，你需要手動定義一個對象。當此小工具加載時，它將這個對象的配置應用到小工具內部。
- 若在此小工具加載後，`window.NavLevel`已被此小工具定義，此對象中的`Sorting`、`sortingFunctions`、`Grouping`、`groupingFunctions`就是此小工具內部的配置內容。修改它們的內容會立即生效，因為是同一個對象。

由於此小工具的代碼是通過JSDelivr加載的，並不是直接寫在`MediaWiki:Gadget-navlevel.js`中的，所以不能保證您在`User:<用戶名>/common.js`中的代碼一定比此小工具晚運行。因此，您最好同時考慮上面兩種情況。最佳實踐是添加`window.NavLevel = window.NavLevel || { Sorting: {}, sortingFunctions: {}, Grouping: {}, groupingFunctions: {} };`，之後再添加您的配置。

除了自定義分組和排序方式，您還可以通過`window.NavLevel.processPopup(levelEntry, divElement)`來自定義彈窗內容。該函數接受一個`levelEntry`對象和一個`<div>`元素的DOM對象（這個`<div>`就是彈窗），您可以在其中對div元素進行修改。

如果您嫌您的用戶腳本加載過慢以至於此小工具掛載後還要數百毫秒才能應用您的配置的話，您可以選擇使用[TamperMonkey](https://www.tampermonkey.net/)腳本來代替`User:<用戶名>/common.js`，並將加載時機設為`document-start`。這樣，此小工具加載時會直接應用您的配置，您在應用掛載時就能直接看到自定義的分組排序方式。

您可以參考[此倉庫](https://github.com/Zes-Minkey-Young/navlevel-tenableH)來使用擴展配置。
