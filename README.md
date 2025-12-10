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
