[繁體中文](README-hant.md)

此项目用于[滚动的天空Wiki](https://rs.miraheze.org/)的基于Cargo扩展（可不是Rust）的关卡导航框智能分组排序小工具。

实验性功能，当前Wiki的Cargo数据中信息不全，有一些功能暂时无法支持。

如果您是繁体中文用户且发现有个别词语未适配，请创建Issue或者PR。

## 开发
本项目的实现得益于：
- [Bun](https://bun.com/)（包管理器）
- [Vite](https://vitejs.dev/)（前端构建工具）
- [Vue](https://cn.vuejs.org/)（前端框架）
- [@wikimedia/codex](https://www.mediawiki.org/wiki/Codex)（MediaWiki官方组件库）
- [Cargo](https://www.mediawiki.org/wiki/Extension:Cargo)（Wiki数据库扩展）

请先安装[Bun](https://bun.com/)，然后运行`bun install`安装依赖。其他包管理器亦可能可行，但未测试。

本项目使用了`vite-plugin-css-injected-by-js`插件，并使用了自制插件将ESM工程转换为适配MediaWiki的格式。所有`vue`和`@wikimedia/codex`的依赖都会被移除，转而使用`mw.loader.using`提供的`require`。

## 使用
如果您是开发者：请在您的用户JS中用JSDelivr引入此仓库的代码。
```js
// 将<HASH>替换为最新发布的提交短哈希
$.getScript('https://cdn.jsdelivr.net/gh/RollingSkyWiki/navlevel-vue@<HASH>/dist/navlevel.iife.min.js');
```


如果您是用户：请在您的[Special:参数设置](https://rs.miraheze.org/wiki/Special:Preferences)中启用此小工具。

### 扩展接口
25DecD版本暴露了一系列API给用户使用，用户可以通过它们来自定义更多的分组和排序规则。

您需要通过`window.NavLevel`这一全局变量来使用。注意，无论先于还是晚于此小工具运行，您的配置都会生效。具体地说：
- 若在此小工具加载前，`window.NavLevel`不存在，你需要手动定义一个对象。当此小工具加载时，它将这个对象的配置应用到小工具内部。
- 若在此小工具加载后，`window.NavLevel`已被此小工具定义，此对象中的`Sorting`、`sortingFunctions`、`Grouping`、`groupingFunctions`就是此小工具内部的配置内容。修改它们的内容会立即生效，因为是同一个对象。

由于此小工具的代码是通过JSDelivr加载的，并不是直接写在`MediaWiki:Gadget-navlevel.js`中的，所以不能保证您在`User:<用户名>/common.js`中的代码一定比此小工具晚运行。因此，您最好同时考虑上面两种情况。最佳实践是添加`window.NavLevel = window.NavLevel || { Sorting: {}, sortingFunctions: {}, Grouping: {}, groupingFunctions: {} };`，之后再添加您的配置。

除了自定义分组和排序方式，您还可以通过`window.NavLevel.processPopup(levelEntry, divElement)`来自定义弹窗内容。该函数接受一个`levelEntry`对象和一个`<div>`元素的DOM对象（这个`<div>`就是弹窗），您可以在其中对div元素进行修改。目前`LevelEntry`的结构如下：
```ts
export interface LevelEntry {
    /** 带繁简转换的中文名 */
    name: string;
    /** 序号 */
    num: number;
    /** 页面名 */
    page: string;
    /** 星数 */
    stars: number;
    /** 类型 */
    type: "共创" | "官方";
    /** 首次出现版本 */
    inVer: string;
    /** 移除版本 */
    remVer: string;
    /** 恢复版本 */
    resVer: string;
    /** 首次出现版本的发布日期 */
    inDate: string;
    /** 奖励方式 */
    award: "none" | "crown" | "present";
    /** 钻石数 */
    dia: number;
}
```

如果您嫌您的用户脚本加载过慢以至于此小工具挂载后还要数百毫秒才能应用您的配置的话，您可以选择使用[TamperMonkey](https://www.tampermonkey.net/)脚本来代替`User:<用户名>/common.js`，并将加载时机设为`document-start`。这样，此小工具加载时会直接应用您的配置，您在应用挂载时就能直接看到自定义的分组排序方式。

您可以参考[此仓库](https://github.com/Zes-Minkey-Young/navlevel-tenableH)来使用扩展配置。
