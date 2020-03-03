/**
 * 注册 service worker
 * 
 */

function emitUpdate() {
  // 监测 sw 触发事件更新，发送 sw.update 事件来通知外部
  const event = document.createEvent('Event');
  event.initEvent('sw.update', true, true);
  window.dispatchEvent(event);
}

// function invokeServiceWorkerUpdateFlow(registration) {
//   // TODO implement your own UI notification element
//   notification.show("New version of the app is available. Refresh now?");
//   notification.addEventListener('click', () => {
//       if (registration.waiting) {
//           // let waiting Service Worker know it should became active
//           registration.waiting.postMessage('skipWaiting')
//       }
//   })
// }

if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    // 在通过 importScripts() 提取 Service Worker 内加载的资源时，它们仍会遵循缓存标头。设置 updateViaCache 选项来替换此默认行为
    // https://developers.google.com/web/fundamentals/primers/service-workers/lifecycle?hl=zh-cn
    navigator.serviceWorker.register('sw.js', {scope: '/', updateViaCache: 'none'})
      .then(registration => {

        if (registration.waiting) {
          // 判断 SW 是否处于 waiting 状态，是则弹出提示，
          // 引导用户点击以执行 skipWaiting
          // invokeServiceWorkerUpdateFlow();

          emitUpdate();
          return;
        }

        registration.addEventListener('updatefound', () => {
          const installingWorker = registration.installing;
          if (installingWorker) {
            installingWorker.addEventListener('statechange', () => {
              if (installingWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  // invokeServiceWorkerUpdateFlow();
                  emitUpdate();
                }
              }
            });
          }
        });

        // 执行刷新操作
        let refreshing = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          if (refreshing) {
            return
          }
          refreshing = true;
          window.location.reload();
        });

        // registration.onupdatefound = () => {
        //   // sw更新改进： https://github.com/lavas-project/lavas/issues/212
        //   // 用 registration.onupdatefound 方法，检测 SW 的更新
        //   const installingWorker = registration.installing;
        //   if (installingWorker) {
        //     installingWorker.onstatechange = () => {
        //       if (installingWorker.state === 'installed') {
        //         if (navigator.serviceWorker.controller) {
        //           emitUpdate();
        //         }
        //       }
        //     }
        //   }
        // }

        // 注册成功
        console.log('ServiceWorker 注册成功', registration.scope);
      })
      .catch(err => {
  
        // 注册失败:(
        console.error('ServiceWorker 注册失败', err);
      });
    navigator.serviceWorker.addEventListener('message', event => {
      console.log('这是来自Service Worker的message', event.data);
      messageFromServiceWorker(event.data)
    });

    // 断网处理
    window.addEventListener('offline', offlineEvent);
  
    // 网络恢复
    window.addEventListener('online', onlineEvent);
    
    // 监听 sw 自定义更新事件
    window.addEventListener('sw.update', () => {
      console.log('监听sw.update事件');
      // postMessage('skipWating');
      try {
        navigator.serviceWorker.getRegistration().then(reg => {
          reg.waiting.postMessage('skipWaiting');
        });
      } catch (e) {
        window.location.reload();
      }
    });
  });
}

/**
 * 卸载 service worker
 * 
 */
function unregister () {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(registration => {
      registration.unregister();
    })
  }

  // if ('serviceWorker' in navigator) {
  //   navigator.serviceWorker.getRegistrations().then(registrations => {
  //     for (const registration of registrations) {
  //       console.log('serviceWorker unregistered');
  //       registration.unregister();
  //     }
  //   });
  // }
}

// 获取数据
const dom1 = document.getElementById('cacheFirst');

function cacheFirst() {
  axios.get('/cacheFirst').then(response => {
    dom1.innerText = response.data
  });
}

const dom2 = document.getElementById('networkOnly');

function networkOnly() {
  axios.get('/networkOnly').then(response => {
    dom2.innerText = response.data
  });
}


// 消息通知
function notifyMe(title, desc) {
  // 先检查浏览器是否支持
  if (!("Notification" in window)) {
    alert("This browser does not support desktop notification");
  }

  // 检查用户是否同意接受通知
  else if (Notification.permission === "granted") {
    // If it's okay let's create a notification
    new Notification(title, {
      body: desc,
      icon: '/icon.png',
      requireInteraction: true
    });
  }

  // 否则我们需要向用户获取权限
  else if (Notification.permission !== 'denied') {
    Notification.requestPermission(function (permission) {
      // 如果用户同意，就可以向他们发送通知
      if (permission === "granted") {
        new Notification(title, {
          body: desc,
          icon: '/icon.png',
          requireInteraction: true
        });
      } else {
        console.warn('用户拒绝通知');
      }
    });
  }
}

// postMessage 页面发送给Service Worker
function postMessage(config) {
  const controller = navigator.serviceWorker.controller;

  if (!controller) {
    return;
  }

  controller.postMessage(config, []);
}


// 离线事件处理
function offlineEvent() {
  // 页面notification 提示
  notifyMe('掉线通知', '您现在已处于离线状态');

  // 页面向Service Worker post掉线message
  postMessage({
    type: 'offline',
    msg: '您掉线啦'
  })
}

// 上线事件处理
function onlineEvent() {
// 页面notification 提示
  notifyMe('网络恢复', '您的网络恢复啦');

  // 页面向Service Worker post掉线message
  postMessage({
    type: 'online',
    msg: '您的网络恢复啦'
  })
}

// 集中处理来自Service Worker的消息
function messageFromServiceWorker(message) {
  if (message.type === 'applyNotify') {
    Notification.requestPermission(function (permission) {
      // 如果用户同意，就可以向他们发送通知
      if (permission === "granted") {
        console.log('用户同意通知');
      } else {
        console.warn('用户拒绝通知');
      }
    });
  }
}

  
// 链接：https://juejin.im/post/5c81cc985188257df17f109c

// try {
//   navigator.serviceWorker.getRegistration().then(reg => {
//     reg.waiting.postMessage('skipWaiting');
//   });
// } catch (e) {
//   window.location.reload();
// }