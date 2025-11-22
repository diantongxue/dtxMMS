import { contextBridge, ipcRenderer } from 'electron';
// 去除自动化标识 - 在preload阶段执行
(function removeAutomationFlags() {
    // 删除 navigator.webdriver
    Object.defineProperty(navigator, 'webdriver', {
        get: function () { return false; },
        configurable: true,
    });
    // 删除其他自动化标识
    var automationFlags = [
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
    automationFlags.forEach(function (flag) {
        try {
            delete window[flag];
        }
        catch (e) {
            // 忽略错误
        }
    });
    // 模拟真实的Chrome特征
    Object.defineProperty(navigator, 'plugins', {
        get: function () { return [1, 2, 3, 4, 5]; },
        configurable: true,
    });
    Object.defineProperty(navigator, 'languages', {
        get: function () { return ['zh-CN', 'zh', 'en-US', 'en']; },
        configurable: true,
    });
    // 设置真实的权限
    var originalQuery = window.navigator.permissions.query;
    window.navigator.permissions.query = function (parameters) {
        return parameters.name === 'notifications'
            ? Promise.resolve({ state: Notification.permission })
            : originalQuery(parameters);
    };
    // 覆盖chrome对象（如果不存在）
    if (!window.chrome) {
        window.chrome = {
            runtime: {},
        };
    }
})();
// 暴露受保护的方法给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
    // 可以在这里添加需要暴露给渲染进程的API
    platform: process.platform,
    // 切换窗口最大化/还原
    toggleMaximize: function () { return ipcRenderer.invoke('toggle-maximize'); },
    // 检查窗口是否最大化
    isMaximized: function () { return ipcRenderer.invoke('is-maximized'); },
    // 获取屏幕尺寸
    getScreenSize: function () { return ipcRenderer.invoke('get-screen-size'); },
    // 设置窗口大小和位置（居中）
    setWindowSize: function (width, height) { return ipcRenderer.invoke('set-window-size', width, height); },
    // BrowserView 相关 API
    browserView: {
        // 创建 BrowserView
        create: function (id, url, bounds) {
            return ipcRenderer.invoke('browser-view:create', id, url, bounds);
        },
        // 销毁 BrowserView
        destroy: function (id) {
            return ipcRenderer.invoke('browser-view:destroy', id);
        },
        // 导航到指定 URL
        navigate: function (id, url) {
            return ipcRenderer.invoke('browser-view:navigate', id, url);
        },
        // 刷新页面
        reload: function (id) {
            return ipcRenderer.invoke('browser-view:reload', id);
        },
        // 后退
        goBack: function (id) {
            return ipcRenderer.invoke('browser-view:go-back', id);
        },
        // 前进
        goForward: function (id) {
            return ipcRenderer.invoke('browser-view:go-forward', id);
        },
        // 检查是否可以后退
        canGoBack: function (id) {
            return ipcRenderer.invoke('browser-view:can-go-back', id);
        },
        // 检查是否可以前进
        canGoForward: function (id) {
            return ipcRenderer.invoke('browser-view:can-go-forward', id);
        },
        // 获取当前 URL
        getUrl: function (id) {
            return ipcRenderer.invoke('browser-view:get-url', id);
        },
        // 设置 BrowserView 的位置和大小
        setBounds: function (id, bounds) {
            return ipcRenderer.invoke('browser-view:set-bounds', id, bounds);
        },
        // 显示/隐藏 BrowserView
        setVisibility: function (id, visible) {
            return ipcRenderer.invoke('browser-view:set-visibility', id, visible);
        },
        // 监听 BrowserView 事件
        onLoaded: function (callback) {
            ipcRenderer.on('browser-view:loaded', function (_event, id) { return callback(id); });
        },
        onNavigated: function (callback) {
            ipcRenderer.on('browser-view:navigated', function (_event, id, url) { return callback(id, url); });
        },
        onLoadFailed: function (callback) {
            ipcRenderer.on('browser-view:load-failed', function (_event, id, errorCode, errorDescription) {
                return callback(id, errorCode, errorDescription);
            });
        },
        // 移除事件监听器
        removeAllListeners: function (channel) {
            ipcRenderer.removeAllListeners(channel);
        },
    },
});
