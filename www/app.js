// ============================================================
// 咸鱼影视 - 热更新入口
// 核心思路：
//   1. 内置一个默认网址（DEFAULT_URL），保证离线/首次也能打开
//   2. 启动时异步拉取远程配置 remote.json，拿到最新入口地址
//   3. 远程配置写入 localStorage 缓存，下次启动即使断网也用缓存
//   4. 网站内容本身在线 => 网站更新，App 内自动就是最新
// 以后网站换域名 / 换入口，只改 remote.json 一个文件即可，
// 不需要重新签名、重新安装。
// ============================================================

// 内置兜底地址（写死在包里，永远可用）
var DEFAULT_URL = 'https://www.xianyu8.my';

// 远程配置地址：改成你自己的静态服务器/对象存储/GitHub raw 地址
// 例如 GitHub Pages: 'https://xxx.github.io/xianyu8/remote.json'
var REMOTE_CONFIG_URL = 'https://www.xianyu8.my/remote.json';

var CACHE_KEY = 'xianyu8_entry_url';
var CACHE_TIME_KEY = 'xianyu8_entry_ts';

var webview = document.getElementById('webview');
var splash = document.getElementById('splash');
var errbox = document.getElementById('error');

// 优先用本地缓存，其次用内置默认值，保证秒开
function cachedUrl() {
  try {
    var u = localStorage.getItem(CACHE_KEY);
    if (u) return u;
  } catch (e) {}
  return DEFAULT_URL;
}

function open(url) {
  webview.src = url;
}

function showError(msg) {
  errbox.style.display = 'flex';
  document.getElementById('errmsg').textContent = msg;
}

// iframe 加载完成 => 隐藏启动画面
webview.addEventListener('load', function () {
  if (webview.src && webview.src !== 'about:blank') {
    webview.classList.add('ready');
    splash.classList.add('hide');
  }
});

// iframe 加载失败（注意：跨域 iframe 无法可靠捕获错误状态，
// 这里主要靠 timeout 兜底）
webview.addEventListener('error', function () {
  // 跨域 iframe 的 error 事件拿不到具体原因，仅作记录
});

// 启动主流程
function boot() {
  var url = cachedUrl();
  open(url);

  // 拉远程配置，更新缓存（下次启动生效，避免闪屏）
  fetchRemoteConfig();
}

function fetchRemoteConfig() {
  fetch(REMOTE_CONFIG_URL + '?t=' + Date.now(), { cache: 'no-store' })
    .then(function (r) {
      if (!r.ok) throw new Error('http ' + r.status);
      return r.json();
    })
    .then(function (cfg) {
      if (cfg && cfg.url) {
        try {
          localStorage.setItem(CACHE_KEY, cfg.url);
          localStorage.setItem(CACHE_TIME_KEY, String(Date.now()));
        } catch (e) {}
        // 如果配置的地址和当前不同，且页面还在启动阶段，则切过去
        if (cfg.url !== webview.src && !webview.classList.contains('ready')) {
          open(cfg.url);
        }
      }
    })
    .catch(function () {
      // 拉配置失败：静默，继续用缓存/内置地址，不影响使用
    });
}

boot();
