// sw.js 文件

// 安装
self.addEventListener('install', event => {
  // 缓存静态资源和html

});

// 激活
self.addEventListener('activate', event => {
  // 激活状态，可做旧缓存清理工作
});

// 缓存的请求和返回
self.addEventListener('fetch', event => {
  
});

// 接收消息
// SW 不再在 install 阶段执行 skipWaiting 了
self.addEventListener('message', event => {
  // sw 不在 install 阶段执行 skipWaiting
  if (event.data = "skipWaiting") {
    self.skipWaiting();
  }
});
