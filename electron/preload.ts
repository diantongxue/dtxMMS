import { contextBridge, ipcRenderer } from 'electron';

// 去除自动化标识 - 在preload阶段执行
(function removeAutomationFlags() {
  // 删除 navigator.webdriver
  Object.defineProperty(navigator, 'webdriver', {
    get: () => false,
    configurable: true,
  });

  // 删除其他自动化标识
  const automationFlags = [
    '__webdriver_script_fn',
    '__selenium_unwrapped',
    '__selenium_evaluate',
    '__selenium_callFunction',
    '__selenium_apply',
    '__selenium_getEval',
    '__fxdriver_unwrapped',
    '__fxdriver_evaluate',
    '__fxdriver_callFunction',
    '__fxdriver_apply',
    '__fxdriver_getEval',
    '__driver_evaluate',
    '__webdriver_evaluate',
    '__driver_unwrapped',
    '__fxdriver_unwrapped',
    '__selenium_unwrapped',
    '__webdriver_unwrapped',
    '__driver_script_fn',
    '__fxdriver_script_fn',
    '__selenium_script_fn',
    '__webdriver_script_fn',
    '__puppeteer_evaluate',
    '__puppeteer_evaluateHandle',
    '__puppeteer_queryObjects',
    '__puppeteer_world',
    '__PUPPETEER_WORLD__',
    '__playwright',
    '__pw_manual',
    '__pw_install',
  ];

  // 遵循宪法.md第13.1.1节TypeScript规范：禁止使用any类型
  automationFlags.forEach((flag) => {
    try {
      delete (window as Record<string, unknown>)[flag];
    } catch (e) {
      // 忽略错误（遵循宪法.md第6节错误处理规范）
    }
  });

  // 模拟真实的Chrome特征
  Object.defineProperty(navigator, 'plugins', {
    get: () => [1, 2, 3, 4, 5],
    configurable: true,
  });

  Object.defineProperty(navigator, 'languages', {
    get: () => ['zh-CN', 'zh', 'en-US', 'en'],
    configurable: true,
  });

  // 设置真实的权限（遵循宪法.md第13.1.1节TypeScript规范：禁止使用any类型）
  const originalQuery = window.navigator.permissions.query;
  window.navigator.permissions.query = (
    parameters: PermissionDescriptor
  ): Promise<PermissionStatus> =>
    parameters.name === 'notifications'
      ? Promise.resolve({ state: Notification.permission } as PermissionStatus)
      : originalQuery.call(window.navigator.permissions, parameters);

  // 覆盖chrome对象（如果不存在）（遵循宪法.md第13.1.1节TypeScript规范：禁止使用any类型）
  if (!(window as Record<string, unknown>).chrome) {
    (window as Record<string, unknown>).chrome = {
      runtime: {},
    };
  }
})();

// BrowserView 相关类型定义
interface BrowserViewBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface BrowserViewResult {
  success: boolean;
  error?: string;
  url?: string;
  canGoBack?: boolean;
  canGoForward?: boolean;
}

// 暴露受保护的方法给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  // 可以在这里添加需要暴露给渲染进程的API
  platform: process.platform,
  // 切换窗口最大化/还原
  toggleMaximize: () => ipcRenderer.invoke('toggle-maximize'),
  // 检查窗口是否最大化
  isMaximized: () => ipcRenderer.invoke('is-maximized'),
  // 获取屏幕尺寸
  getScreenSize: () => ipcRenderer.invoke('get-screen-size') as Promise<{ width: number; height: number }>,
  // 设置窗口大小和位置（居中）
  setWindowSize: (width: number, height: number) => ipcRenderer.invoke('set-window-size', width, height),

  // BrowserView 相关 API
  browserView: {
    // 创建 BrowserView
    create: (id: string, url: string, bounds: BrowserViewBounds) =>
      ipcRenderer.invoke('browser-view:create', id, url, bounds) as Promise<BrowserViewResult>,

    // 销毁 BrowserView
    destroy: (id: string) =>
      ipcRenderer.invoke('browser-view:destroy', id) as Promise<BrowserViewResult>,

    // 导航到指定 URL
    navigate: (id: string, url: string) =>
      ipcRenderer.invoke('browser-view:navigate', id, url) as Promise<BrowserViewResult>,

    // 刷新页面
    reload: (id: string) =>
      ipcRenderer.invoke('browser-view:reload', id) as Promise<BrowserViewResult>,

    // 后退
    goBack: (id: string) =>
      ipcRenderer.invoke('browser-view:go-back', id) as Promise<BrowserViewResult>,

    // 前进
    goForward: (id: string) =>
      ipcRenderer.invoke('browser-view:go-forward', id) as Promise<BrowserViewResult>,

    // 检查是否可以后退
    canGoBack: (id: string) =>
      ipcRenderer.invoke('browser-view:can-go-back', id) as Promise<BrowserViewResult & { canGoBack?: boolean }>,

    // 检查是否可以前进
    canGoForward: (id: string) =>
      ipcRenderer.invoke('browser-view:can-go-forward', id) as Promise<BrowserViewResult & { canGoForward?: boolean }>,

    // 获取当前 URL
    getUrl: (id: string) =>
      ipcRenderer.invoke('browser-view:get-url', id) as Promise<BrowserViewResult & { url?: string }>,

    // 设置 BrowserView 的位置和大小
    setBounds: (id: string, bounds: BrowserViewBounds) =>
      ipcRenderer.invoke('browser-view:set-bounds', id, bounds) as Promise<BrowserViewResult>,

    // 显示/隐藏 BrowserView
    setVisibility: (id: string, visible: boolean) =>
      ipcRenderer.invoke('browser-view:set-visibility', id, visible) as Promise<BrowserViewResult>,

    // 监听 BrowserView 事件
    onLoaded: (callback: (id: string) => void) => {
      ipcRenderer.on('browser-view:loaded', (_event, id: string) => callback(id));
    },

    onNavigated: (callback: (id: string, url: string) => void) => {
      ipcRenderer.on('browser-view:navigated', (_event, id: string, url: string) => callback(id, url));
    },

    onLoadFailed: (callback: (id: string, errorCode: number, errorDescription: string) => void) => {
      ipcRenderer.on('browser-view:load-failed', (_event, id: string, errorCode: number, errorDescription: string) =>
        callback(id, errorCode, errorDescription)
      );
    },

    // 移除事件监听器
    removeAllListeners: (channel: string) => {
      ipcRenderer.removeAllListeners(channel);
    },
  },
});
