# 贡献指南

## 准备工作
1. 将此仓库克隆到本地（如果您没有此仓库的访问权限，请先创建Fork）。`git clone https://github.com/RollingSkyWiki/navlevel-vue.git`。
1. 安装Bun或NodeJS+NPM。推荐使用Bun，因为有的脚本必须要Bun。（Windows 10以下无法使用Bun。）
1. 运行`bun install`。这将会检索`package.json`中的依赖项，并从NPM存储库中下载它们。如果速度较慢，请尝试使用国内镜像（如使用`--registry=https://registry.npmmirror.com`）。

## 测试
运行`bun dev`来启动开发服务器。该命令其实是`bun vite`的别名（Vite是一个前端打包工具，并且内置具有模块热重载特性的开发服务器），所以您也可以直接运行`bun vite`。这将在浏览器中打开根目录下的`index.html`，然后在其中挂载Vue应用。您可以通过在URL查询参数中指定`hant=1`来切换繁体，指定`space=1`来启用文本自动空格。

脚本别名定义在`package.json`的`scripts`字段中，您可以自行查看。下面是常用的脚本的说明：
- `dev`：启动开发服务器。
- `b`：构建生产版本。（我懒，所以用单字符。因为这个构建操作太简单了，我其实不太想配置CI。）
- `bt`：构建对`test/testData.ts`的测试，构建完成后需要把输出的`test.js`粘贴到浏览器控制台运行。如果不需要修改Cargo查询的相关内容，无需运行该测试。（需要Bun）
- `cz`：把`README.md`转换为`README-hant.md`。（需要Bun）

`polyfill/`路径中的文件用于在本地环境模拟HanAssist和提供已预获取到本地的Cargo数据。

## 部署
运行`bun b`来构建生产版本，提交后，将您的这次提交标记一个tag（目前使用`<year><Month(short)><Minor(A-Z)>[.<Patch(1-9)>]`的格式），并推送到GitHub。之后在Wiki中将`MediaWiki:Gadget-navlevel.js`中的HASH替换为这个tag。您也可以直接使用您的提交短哈希，但是这不好记忆。

部署后，前往`Project:首页`，在查询参数中添加`?debug=2`，页面加载出来后，最好再刷新一次缓存，保证您看到的版本是最新的。验证此小工具在生产环境能够正常运行后，即完成开发流程。反之，请回滚`MediaWiki:Gadget-navlevel.js`中的HASH。

一般不太会出现生产环境和测试环境不一致的情况。