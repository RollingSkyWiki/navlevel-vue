// server.js
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { watch } from "fs/promises";

// 获取当前文件路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 文件路径
const filePath = join(__dirname, "..", "dist", "myth.iife.js");

// 存储 WebSocket 连接
const connections = new Set();

// 监听文件变化

const watcher = watch(filePath);
(async () => {
for await (const event of watcher) {
    console.log(`文件 ${filePath} 已更新:`, event);
    
    // 向所有连接的客户端发送更新通知
    const message = "update";
    
    // 广播消息给所有 WebSocket 客户端
    for (const ws of connections) {
    if (ws.readyState === 1) { // OPEN state
        ws.send(message);
    }
    }
}
})();

console.log(`正在监听文件变化: ${filePath}`);

// 创建 HTTP/WebSocket 服务器
const server = Bun.serve({
  port: 11451,
  
  websocket: {
    open(ws) {
      console.log("新的 WebSocket 连接");
      connections.add(ws);
      
      // 发送欢迎消息
      ws.send(JSON.stringify({
        type: "welcome",
        message: "Connected to wikiwindows update server",
        timestamp: Date.now()
      }));
    },
    
    message(ws, message) {
      console.log("收到 WebSocket 消息:", message);
      
      try {
        const data = JSON.parse(message);
        // 可以根据需要处理客户端发送的消息
        if (data.type === "ping") {
          ws.send(JSON.stringify({
            type: "pong",
            timestamp: Date.now()
          }));
        }
      } catch (e) {
        console.error("解析 WebSocket 消息失败:", e);
      }
    },
    
    close(ws) {
      console.log("WebSocket 连接关闭");
      connections.delete(ws);
    }
  },
  
  async fetch(req, server) {
    const url = new URL(req.url);
    
    // 处理 WebSocket 升级请求
    if (url.pathname === "/ws" && req.headers.get("upgrade") === "websocket") {
      const success = server.upgrade(req);
      return success 
        ? undefined // 让 upgrade 处理
        : new Response("WebSocket upgrade failed", { status: 400 });
    }
    
    // 提供静态文件服务
    if (url.pathname === "/ww.js") {
      try {
        const file = Bun.file(filePath);
        if (await file.exists()) {
          return new Response(file);
        } else {
          return new Response("File not found", { status: 404 });
        }
      } catch (error) {
        console.error("读取文件错误:", error);
        return new Response("Internal server error", { status: 500 });
      }
    }
    
    // 默认路由
    return new Response("")
  }
});

console.log(`服务器运行在 http://localhost:${server.port}`);
console.log(`WebSocket 端点: ws://localhost:${server.port}/ws`);
console.log(`静态文件路径: http://localhost:${server.port}/wikiwindows.iife.js`);
// new WebSocket().onmessage = ((ev) => {ev.data})