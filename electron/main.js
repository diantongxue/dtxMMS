import { app, BrowserWindow, ipcMain, screen, BrowserView, session } from 'electron';
import { join } from 'path';
import { fileURLToPath } from 'url';
var __dirname = fileURLToPath(new URL('.', import.meta.url));
// 开发环境判断
var isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
/**
 * 获取真实的Chrome User-Agent（根据平台）
 */
function getRealChromeUserAgent() {
    if (process.platform === 'darwin') {
        // macOS Chrome User-Agent
        return 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
    }
    else if (process.platform === 'win32') {
        // Windows Chrome User-Agent
        return 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
    }
    else {
        // Linux Chrome User-Agent
        return 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
    }
}
/**
 * 去除自动化标识的JavaScript代码
 */
var removeAutomationFlagsScript = "\n(function() {\n  // \u5220\u9664 navigator.webdriver\n  Object.defineProperty(navigator, 'webdriver', {\n    get: () => false,\n    configurable: true\n  });\n  \n  // \u5220\u9664\u5176\u4ED6\u81EA\u52A8\u5316\u6807\u8BC6\n  const automationFlags = [\n    '__webdriver_script_fn',\n    '__selenium_unwrapped',\n    '__selenium_evaluate',\n    '__selenium_callFunction',\n    '__selenium_apply',\n    '__selenium_getEval',\n    '__fxdriver_unwrapped',\n    '__fxdriver_evaluate',\n    '__fxdriver_callFunction',\n    '__fxdriver_apply',\n    '__fxdriver_getEval',\n    '__driver_evaluate',\n    '__webdriver_evaluate',\n    '__driver_unwrapped',\n    '__fxdriver_unwrapped',\n    '__selenium_unwrapped',\n    '__webdriver_unwrapped',\n    '__driver_script_fn',\n    '__fxdriver_script_fn',\n    '__selenium_script_fn',\n    '__webdriver_script_fn',\n    '__puppeteer_evaluate',\n    '__puppeteer_evaluateHandle',\n    '__puppeteer_queryObjects',\n    '__puppeteer_world',\n    '__PUPPETEER_WORLD__',\n    '__playwright',\n    '__pw_manual',\n    '__pw_install'\n  ];\n  \n  automationFlags.forEach(flag => {\n    try {\n      delete window[flag];\n    } catch (e) {\n      // \u5FFD\u7565\u9519\u8BEF\n    }\n  });\n  \n  // \u6A21\u62DF\u771F\u5B9E\u7684Chrome\u7279\u5F81\n  Object.defineProperty(navigator, 'plugins', {\n    get: () => [1, 2, 3, 4, 5],\n    configurable: true\n  });\n  \n  Object.defineProperty(navigator, 'languages', {\n    get: () => ['zh-CN', 'zh', 'en-US', 'en'],\n    configurable: true\n  });\n  \n  // \u8BBE\u7F6E\u771F\u5B9E\u7684\u6743\u9650\n  const originalQuery = window.navigator.permissions.query;\n  window.navigator.permissions.query = (parameters) => (\n    parameters.name === 'notifications' ?\n      Promise.resolve({ state: Notification.permission }) :\n      originalQuery(parameters)\n  );\n  \n  // \u8986\u76D6chrome\u5BF9\u8C61\uFF08\u5982\u679C\u4E0D\u5B58\u5728\uFF09\n  if (!window.chrome) {\n    window.chrome = {\n      runtime: {}\n    };\n  }\n  \n  // \u8BBE\u7F6E\u771F\u5B9E\u7684webgl vendor\u548Crenderer\n  const getParameter = WebGLRenderingContext.prototype.getParameter;\n  WebGLRenderingContext.prototype.getParameter = function(parameter) {\n    if (parameter === 37445) {\n      return 'Intel Inc.';\n    }\n    if (parameter === 37446) {\n      return 'Intel Iris OpenGL Engine';\n    }\n    return getParameter.call(this, parameter);\n  };\n})();\n";
/**
 * 配置WebContents以去除自动化标识并模拟真实浏览器环境
 * @param webContents - Electron的WebContents对象
 */
function configureWebContentsForRealBrowser(webContents) {
    // 设置真实的User-Agent
    webContents.setUserAgent(getRealChromeUserAgent());
    // 在页面加载完成后注入去除自动化标识的脚本
    webContents.on('did-finish-load', function () {
        webContents.executeJavaScript(removeAutomationFlagsScript).catch(function () {
            // 忽略错误
        });
    });
}
// 禁用 Electron 的错误对话框（必须在应用启动前设置）
// 注意：disableHardwareAcceleration 可能会影响性能，如果不需要可以移除
// app.disableHardwareAcceleration(); // 某些情况下可以减少EPIPE错误
app.commandLine.appendSwitch('disable-features', 'VizDisplayCompositor');
// 完全禁用 Electron 的错误对话框
// 通过设置环境变量来禁用错误对话框
if (process.platform === 'win32') {
    process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = '1';
}
// 安全的 console 输出函数
var safeConsole = {
    log: function () {
        var _a;
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        try {
            console.log.apply(console, args);
        }
        catch (error) {
            // 忽略 EPIPE 错误
            if (!((_a = error === null || error === void 0 ? void 0 : error.message) === null || _a === void 0 ? void 0 : _a.includes('EPIPE'))) {
                // 如果不是EPIPE错误，尝试其他方式记录
            }
        }
    },
    warn: function () {
        var _a;
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        try {
            console.warn.apply(console, args);
        }
        catch (error) {
            // 忽略 EPIPE 错误
            if (!((_a = error === null || error === void 0 ? void 0 : error.message) === null || _a === void 0 ? void 0 : _a.includes('EPIPE'))) {
                // 如果不是EPIPE错误，尝试其他方式记录
            }
        }
    },
    error: function () {
        var _a;
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        try {
            console.error.apply(console, args);
        }
        catch (error) {
            // 忽略 EPIPE 错误
            if (!((_a = error === null || error === void 0 ? void 0 : error.message) === null || _a === void 0 ? void 0 : _a.includes('EPIPE'))) {
                // 如果不是EPIPE错误，尝试其他方式记录
            }
        }
    },
};
// 处理 EPIPE 错误和其他未捕获的异常（必须在应用启动前设置）
// EPIPE 错误通常发生在进程退出或流关闭时尝试写入，可以安全忽略
process.on('uncaughtException', function (error) {
    // 忽略 EPIPE 错误（通常发生在流关闭时尝试写入）
    if (error.message && error.message.includes('EPIPE')) {
        return; // 静默忽略，不显示错误对话框
    }
    // 其他错误正常处理（只在开发环境显示）
    if (isDev) {
        safeConsole.error('Uncaught Exception:', error);
    }
});
// 处理 stderr 写入错误，避免 EPIPE 错误显示对话框
var originalStderrWrite = process.stderr.write.bind(process.stderr);
process.stderr.write = function (chunk, encoding, callback) {
    try {
        return originalStderrWrite(chunk, encoding, callback);
    }
    catch (error) {
        // 忽略 EPIPE 错误
        if (error && error.message && error.message.includes('EPIPE')) {
            return true;
        }
        throw error;
    }
};
var originalStdoutWrite = process.stdout.write.bind(process.stdout);
process.stdout.write = function (chunk, encoding, callback) {
    try {
        return originalStdoutWrite(chunk, encoding, callback);
    }
    catch (error) {
        // 忽略 EPIPE 错误
        if (error && error.message && error.message.includes('EPIPE')) {
            return true;
        }
        throw error;
    }
};
// 处理未捕获的 Promise 拒绝
process.on('unhandledRejection', function (reason) {
    // 忽略 EPIPE 相关的拒绝
    if (reason instanceof Error && reason.message && reason.message.includes('EPIPE')) {
        return;
    }
    safeConsole.error('Unhandled Rejection:', reason);
});
// 处理进程警告（可能触发 EPIPE）
process.on('warning', function (warning) {
    // 忽略 EPIPE 相关的警告
    if (warning.message && warning.message.includes('EPIPE')) {
        return;
    }
    // 其他警告正常处理（使用安全的console输出）
    safeConsole.warn('Process Warning:', warning);
});
var mainWindow = null;
// BrowserView 管理：使用 Map 存储多个 BrowserView 实例
var browserViews = new Map();
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1200,
        minHeight: 800,
        webPreferences: {
            preload: join(__dirname, 'preload.cjs'),
            nodeIntegration: false,
            contextIsolation: true,
            // 去除自动化标识
            enableBlinkFeatures: '',
            // 禁用自动化相关功能
            spellcheck: false,
        },
        // Mac系统：使用hiddenInset避免系统按钮遮挡，但需要自定义标题栏
        // 其他系统：使用默认标题栏
        titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
        frame: process.platform !== 'darwin', // Windows/Linux显示框架，Mac隐藏
        show: false,
        // 允许窗口拖动
        transparent: false,
    });
    // 配置主窗口以去除自动化标识并模拟真实浏览器环境
    configureWebContentsForRealBrowser(mainWindow.webContents);
    // 捕获渲染进程错误，不显示对话框
    mainWindow.webContents.on('unresponsive', function () {
        // 不显示无响应对话框
    });
    // 加载应用
    if (isDev) {
        mainWindow.loadURL('http://localhost:5173');
        mainWindow.webContents.openDevTools();
    }
    else {
        mainWindow.loadFile(join(__dirname, '../dist/index.html'));
    }
    // 禁用新窗口打开
    mainWindow.webContents.setWindowOpenHandler(function () {
        return { action: 'deny' };
    });
    // 窗口准备好后显示并最大化
    mainWindow.once('ready-to-show', function () {
        mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.maximize();
        mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.show();
    });
    // 注册IPC处理器
    ipcMain.handle('toggle-maximize', function () {
        if (mainWindow) {
            if (mainWindow.isMaximized()) {
                mainWindow.unmaximize();
            }
            else {
                mainWindow.maximize();
            }
        }
    });
    ipcMain.handle('is-maximized', function () {
        var _a;
        return (_a = mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.isMaximized()) !== null && _a !== void 0 ? _a : false;
    });
    // 获取屏幕尺寸
    ipcMain.handle('get-screen-size', function () {
        var primaryDisplay = screen.getPrimaryDisplay();
        return {
            width: primaryDisplay.workAreaSize.width,
            height: primaryDisplay.workAreaSize.height,
        };
    });
    // 设置窗口大小和位置（居中）
    ipcMain.handle('set-window-size', function (_event, width, height) {
        if (mainWindow) {
            var primaryDisplay = screen.getPrimaryDisplay();
            var _a = primaryDisplay.workAreaSize, screenWidth = _a.width, screenHeight = _a.height;
            // 计算居中位置
            var x = Math.floor((screenWidth - width) / 2);
            var y = Math.floor((screenHeight - height) / 2);
            mainWindow.setBounds({ x: x, y: y, width: width, height: height });
        }
    });
    // 窗口大小改变时，更新所有 BrowserView 的位置和大小
    mainWindow.on('resize', function () {
        updateBrowserViewBounds();
    });
    mainWindow.on('closed', function () {
        // 清理所有 BrowserView
        browserViews.forEach(function (view) {
            if (mainWindow) {
                mainWindow.removeBrowserView(view);
            }
            // BrowserView 的 webContents 会在 BrowserView 被移除后自动清理
        });
        browserViews.clear();
        mainWindow = null;
    });
}
/**
 * 更新所有 BrowserView 的边界（位置和大小）
 */
function updateBrowserViewBounds() {
    if (!mainWindow)
        return;
    // 这里可以根据实际需求计算 BrowserView 的位置和大小
    // 暂时留空，由具体的 BrowserView 管理函数来处理
}
/**
 * BrowserView IPC 处理器
 */
// 创建 BrowserView
ipcMain.handle('browser-view:create', function (_event, id, url, bounds) {
    if (!mainWindow) {
        return { success: false, error: '主窗口不存在' };
    }
    try {
        // 如果已存在，先销毁
        if (browserViews.has(id)) {
            var existingView = browserViews.get(id);
            if (existingView && mainWindow) {
                mainWindow.removeBrowserView(existingView);
                // BrowserView 的 webContents 会在 BrowserView 被移除后自动清理
            }
            browserViews.delete(id);
        }
        // 为每个 BrowserView 创建独立的会话，避免账号串号
        // 使用 partition 来隔离会话，每个浏览器实例有独立的 Cookie 和存储
        var partition = "persist:browser-".concat(id);
        var browserSession = session.fromPartition(partition);
        // 创建新的 BrowserView，使用独立会话
        var browserView = new BrowserView({
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true,
                // 去除自动化标识
                enableBlinkFeatures: '',
                spellcheck: false,
                // 使用独立会话，避免账号串号
                partition: partition,
            },
        });
        // 配置 BrowserView 以去除自动化标识
        configureWebContentsForRealBrowser(browserView.webContents);
        // 设置位置和大小
        browserView.setBounds(bounds);
        // 添加到主窗口
        mainWindow.addBrowserView(browserView);
        // 加载 URL
        browserView.webContents.loadURL(url);
        // 存储 BrowserView
        browserViews.set(id, browserView);
        // 监听页面加载事件
        browserView.webContents.on('did-finish-load', function () {
            // 页面加载完成，可以发送事件通知渲染进程
            mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.webContents.send('browser-view:loaded', id);
        });
        // 监听导航事件
        browserView.webContents.on('did-navigate', function (_event, navigationUrl) {
            mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.webContents.send('browser-view:navigated', id, navigationUrl);
        });
        // 监听导航状态变化
        browserView.webContents.on('did-navigate-in-page', function (_event, navigationUrl) {
            mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.webContents.send('browser-view:navigated', id, navigationUrl);
        });
        // 监听加载失败
        browserView.webContents.on('did-fail-load', function (_event, errorCode, errorDescription) {
            mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.webContents.send('browser-view:load-failed', id, errorCode, errorDescription);
        });
        return { success: true };
    }
    catch (error) {
        return { success: false, error: error.message || '创建 BrowserView 失败' };
    }
});
// 销毁 BrowserView
ipcMain.handle('browser-view:destroy', function (_event, id) {
    if (!mainWindow) {
        return { success: false, error: '主窗口不存在' };
    }
    try {
        var browserView = browserViews.get(id);
        if (browserView) {
            mainWindow.removeBrowserView(browserView);
            // BrowserView 的 webContents 会在 BrowserView 被移除后自动清理
            browserViews.delete(id);
            // 清理会话（可选，如果需要完全清除数据）
            // 注意：如果使用 persist 分区，数据会保留，下次创建同名分区时会恢复
            // 如果需要完全清除，可以调用 session.fromPartition(`persist:browser-${id}`).clearStorageData()
            return { success: true };
        }
        return { success: false, error: 'BrowserView 不存在' };
    }
    catch (error) {
        return { success: false, error: error.message || '销毁 BrowserView 失败' };
    }
});
// 导航到指定 URL
ipcMain.handle('browser-view:navigate', function (_event, id, url) {
    try {
        var browserView = browserViews.get(id);
        if (browserView) {
            browserView.webContents.loadURL(url);
            return { success: true };
        }
        return { success: false, error: 'BrowserView 不存在' };
    }
    catch (error) {
        return { success: false, error: error.message || '导航失败' };
    }
});
// 刷新页面
ipcMain.handle('browser-view:reload', function (_event, id) {
    try {
        var browserView = browserViews.get(id);
        if (browserView) {
            browserView.webContents.reload();
            return { success: true };
        }
        return { success: false, error: 'BrowserView 不存在' };
    }
    catch (error) {
        return { success: false, error: error.message || '刷新失败' };
    }
});
// 后退
ipcMain.handle('browser-view:go-back', function (_event, id) {
    try {
        var browserView = browserViews.get(id);
        if (browserView && browserView.webContents.canGoBack()) {
            browserView.webContents.goBack();
            return { success: true };
        }
        return { success: false, error: '无法后退' };
    }
    catch (error) {
        return { success: false, error: error.message || '后退失败' };
    }
});
// 前进
ipcMain.handle('browser-view:go-forward', function (_event, id) {
    try {
        var browserView = browserViews.get(id);
        if (browserView && browserView.webContents.canGoForward()) {
            browserView.webContents.goForward();
            return { success: true };
        }
        return { success: false, error: '无法前进' };
    }
    catch (error) {
        return { success: false, error: error.message || '前进失败' };
    }
});
// 检查是否可以后退
ipcMain.handle('browser-view:can-go-back', function (_event, id) {
    try {
        var browserView = browserViews.get(id);
        if (browserView) {
            return { success: true, canGoBack: browserView.webContents.canGoBack() };
        }
        return { success: false, error: 'BrowserView 不存在' };
    }
    catch (error) {
        return { success: false, error: error.message || '检查失败' };
    }
});
// 检查是否可以前进
ipcMain.handle('browser-view:can-go-forward', function (_event, id) {
    try {
        var browserView = browserViews.get(id);
        if (browserView) {
            return { success: true, canGoForward: browserView.webContents.canGoForward() };
        }
        return { success: false, error: 'BrowserView 不存在' };
    }
    catch (error) {
        return { success: false, error: error.message || '检查失败' };
    }
});
// 获取当前 URL
ipcMain.handle('browser-view:get-url', function (_event, id) {
    try {
        var browserView = browserViews.get(id);
        if (browserView) {
            return { success: true, url: browserView.webContents.getURL() };
        }
        return { success: false, error: 'BrowserView 不存在' };
    }
    catch (error) {
        return { success: false, error: error.message || '获取 URL 失败' };
    }
});
// 设置 BrowserView 的位置和大小
ipcMain.handle('browser-view:set-bounds', function (_event, id, bounds) {
    try {
        var browserView = browserViews.get(id);
        if (browserView && mainWindow) {
            // 确保 bounds 有效
            var validBounds = {
                x: Math.max(0, Math.round(bounds.x)),
                y: Math.max(0, Math.round(bounds.y)),
                width: Math.max(1, Math.round(bounds.width)),
                height: Math.max(1, Math.round(bounds.height)),
            };
            browserView.setBounds(validBounds);
            return { success: true };
        }
        return { success: false, error: 'BrowserView 不存在' };
    }
    catch (error) {
        return { success: false, error: error.message || '设置边界失败' };
    }
});
// 显示/隐藏 BrowserView
ipcMain.handle('browser-view:set-visibility', function (_event, id, visible) {
    if (!mainWindow) {
        return { success: false, error: '主窗口不存在' };
    }
    try {
        var browserView = browserViews.get(id);
        if (browserView) {
            if (visible) {
                mainWindow.addBrowserView(browserView);
            }
            else {
                mainWindow.removeBrowserView(browserView);
            }
            return { success: true };
        }
        return { success: false, error: 'BrowserView 不存在' };
    }
    catch (error) {
        return { success: false, error: error.message || '设置可见性失败' };
    }
});
app.whenReady().then(function () {
    createWindow();
    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
