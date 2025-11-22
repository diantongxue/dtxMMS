import { app, BrowserWindow, ipcMain, screen, WebContents, BrowserView, session } from 'electron';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

// 开发环境判断
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

/**
 * 获取真实的Chrome User-Agent（根据平台）
 */
function getRealChromeUserAgent(): string {
  if (process.platform === 'darwin') {
    // macOS Chrome User-Agent
    return 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
  } else if (process.platform === 'win32') {
    // Windows Chrome User-Agent
    return 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
  } else {
    // Linux Chrome User-Agent
    return 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
  }
}

/**
 * 去除自动化标识的JavaScript代码
 */
const removeAutomationFlagsScript = `
(function() {
  // 删除 navigator.webdriver
  Object.defineProperty(navigator, 'webdriver', {
    get: () => false,
    configurable: true
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
    '__pw_install'
  ];
  
  automationFlags.forEach(flag => {
    try {
      delete window[flag];
    } catch (e) {
      // 忽略错误
    }
  });
  
  // 模拟真实的Chrome特征
  Object.defineProperty(navigator, 'plugins', {
    get: () => [1, 2, 3, 4, 5],
    configurable: true
  });
  
  Object.defineProperty(navigator, 'languages', {
    get: () => ['zh-CN', 'zh', 'en-US', 'en'],
    configurable: true
  });
  
  // 设置真实的权限
  const originalQuery = window.navigator.permissions.query;
  window.navigator.permissions.query = (parameters) => (
    parameters.name === 'notifications' ?
      Promise.resolve({ state: Notification.permission }) :
      originalQuery(parameters)
  );
  
  // 覆盖chrome对象（如果不存在）
  if (!window.chrome) {
    window.chrome = {
      runtime: {}
    };
  }
  
  // 设置真实的webgl vendor和renderer
  const getParameter = WebGLRenderingContext.prototype.getParameter;
  WebGLRenderingContext.prototype.getParameter = function(parameter) {
    if (parameter === 37445) {
      return 'Intel Inc.';
    }
    if (parameter === 37446) {
      return 'Intel Iris OpenGL Engine';
    }
    return getParameter.call(this, parameter);
  };
})();
`;

/**
 * 配置WebContents以去除自动化标识并模拟真实浏览器环境
 * @param webContents - Electron的WebContents对象
 */
function configureWebContentsForRealBrowser(webContents: WebContents): void {
  // 设置真实的User-Agent
  webContents.setUserAgent(getRealChromeUserAgent());

  // 在页面加载完成后注入去除自动化标识的脚本
  webContents.on('did-finish-load', () => {
    webContents.executeJavaScript(removeAutomationFlagsScript).catch(() => {
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

// 安全的 console 输出函数（遵循宪法.md第13.1.1节TypeScript规范：禁止使用any类型）
interface ErrorWithMessage {
  message?: string;
}

const safeConsole = {
  log: (...args: unknown[]): void => {
    try {
      console.log(...args);
    } catch (error: unknown) {
      // 忽略 EPIPE 错误（遵循宪法.md第6节错误处理规范）
      const err = error as ErrorWithMessage;
      if (!err?.message?.includes('EPIPE')) {
        // 如果不是EPIPE错误，尝试其他方式记录
      }
    }
  },
  warn: (...args: unknown[]): void => {
    try {
      console.warn(...args);
    } catch (error: unknown) {
      const err = error as ErrorWithMessage;
      if (!err?.message?.includes('EPIPE')) {
        // 如果不是EPIPE错误，尝试其他方式记录
      }
    }
  },
  error: (...args: unknown[]): void => {
    try {
      console.error(...args);
    } catch (error: unknown) {
      const err = error as ErrorWithMessage;
      if (!err?.message?.includes('EPIPE')) {
        // 如果不是EPIPE错误，尝试其他方式记录
      }
    }
  },
};

// 处理 EPIPE 错误和其他未捕获的异常（必须在应用启动前设置）
// EPIPE 错误通常发生在进程退出或流关闭时尝试写入，可以安全忽略
process.on('uncaughtException', (error: Error) => {
  // 忽略 EPIPE 错误（通常发生在流关闭时尝试写入）
  if (error.message && error.message.includes('EPIPE')) {
    return; // 静默忽略，不显示错误对话框
  }
  // 其他错误正常处理（只在开发环境显示）
  if (isDev) {
    safeConsole.error('Uncaught Exception:', error);
  }
});

// 处理 stderr 写入错误，避免 EPIPE 错误显示对话框（遵循宪法.md第13.1.1节TypeScript规范：禁止使用any类型）
const originalStderrWrite = process.stderr.write.bind(process.stderr);
process.stderr.write = function (
  chunk: string | Uint8Array,
  encoding?: BufferEncoding,
  callback?: (error?: Error | null) => void
): boolean {
  try {
    return originalStderrWrite(chunk, encoding, callback);
  } catch (error: unknown) {
    // 忽略 EPIPE 错误（遵循宪法.md第6节错误处理规范）
    const err = error as ErrorWithMessage;
    if (err && err.message && err.message.includes('EPIPE')) {
      return true;
    }
    throw error;
  }
};

const originalStdoutWrite = process.stdout.write.bind(process.stdout);
process.stdout.write = function (
  chunk: string | Uint8Array,
  encoding?: BufferEncoding,
  callback?: (error?: Error | null) => void
): boolean {
  try {
    return originalStdoutWrite(chunk, encoding, callback);
  } catch (error: unknown) {
    const err = error as ErrorWithMessage;
    if (err && err.message && err.message.includes('EPIPE')) {
      return true;
    }
    throw error;
  }
};

// 处理未捕获的 Promise 拒绝
process.on('unhandledRejection', (reason: unknown) => {
  // 忽略 EPIPE 相关的拒绝
  if (reason instanceof Error && reason.message && reason.message.includes('EPIPE')) {
    return;
  }
  safeConsole.error('Unhandled Rejection:', reason);
});

// 处理进程警告（可能触发 EPIPE）
process.on('warning', (warning: Error) => {
  // 忽略 EPIPE 相关的警告
  if (warning.message && warning.message.includes('EPIPE')) {
    return;
  }
  // 其他警告正常处理（使用安全的console输出）
  safeConsole.warn('Process Warning:', warning);
});

let mainWindow: BrowserWindow | null = null;
// BrowserView 管理：使用 Map 存储多个 BrowserView 实例
const browserViews = new Map<string, BrowserView>();

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
  mainWindow.webContents.on('unresponsive', () => {
    // 不显示无响应对话框
  });

  // 加载应用
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(join(__dirname, '../dist/index.html'));
  }

  // 禁用新窗口打开
  mainWindow.webContents.setWindowOpenHandler(() => {
    return { action: 'deny' };
  });

  // 窗口准备好后显示并最大化
  mainWindow.once('ready-to-show', () => {
    mainWindow?.maximize();
    mainWindow?.show();
  });

  // 注册IPC处理器
  ipcMain.handle('toggle-maximize', () => {
    if (mainWindow) {
      if (mainWindow.isMaximized()) {
        mainWindow.unmaximize();
      } else {
        mainWindow.maximize();
      }
    }
  });

  ipcMain.handle('is-maximized', () => {
    return mainWindow?.isMaximized() ?? false;
  });

  // 获取屏幕尺寸
  ipcMain.handle('get-screen-size', () => {
    const primaryDisplay = screen.getPrimaryDisplay();
    return {
      width: primaryDisplay.workAreaSize.width,
      height: primaryDisplay.workAreaSize.height,
    };
  });

  // 设置窗口大小和位置（居中）
  ipcMain.handle('set-window-size', (_event, width: number, height: number) => {
    if (mainWindow) {
      const primaryDisplay = screen.getPrimaryDisplay();
      const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;

      // 计算居中位置
      const x = Math.floor((screenWidth - width) / 2);
      const y = Math.floor((screenHeight - height) / 2);

      mainWindow.setBounds({ x, y, width, height });
    }
  });

  // 窗口大小改变时，更新所有 BrowserView 的位置和大小
  mainWindow.on('resize', () => {
    updateBrowserViewBounds();
  });

  mainWindow.on('closed', () => {
    // 清理所有 BrowserView
    browserViews.forEach((view) => {
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
function updateBrowserViewBounds(): void {
  if (!mainWindow) return;

  // 这里可以根据实际需求计算 BrowserView 的位置和大小
  // 暂时留空，由具体的 BrowserView 管理函数来处理
}

/**
 * BrowserView IPC 处理器
 */

// 创建 BrowserView
ipcMain.handle('browser-view:create', (_event, id: string, url: string, bounds: { x: number; y: number; width: number; height: number }) => {
  if (!mainWindow) {
    return { success: false, error: '主窗口不存在' };
  }

  try {
    // 如果已存在，先销毁
    if (browserViews.has(id)) {
      const existingView = browserViews.get(id);
      if (existingView && mainWindow) {
        mainWindow.removeBrowserView(existingView);
        // BrowserView 的 webContents 会在 BrowserView 被移除后自动清理
      }
      browserViews.delete(id);
    }

    // 为每个 BrowserView 创建独立的会话，避免账号串号
    // 使用 partition 来隔离会话，每个浏览器实例有独立的 Cookie 和存储
    const partition = `persist:browser-${id}`;
    // 创建会话（虽然未直接使用，但通过partition在BrowserView配置中使用）
    session.fromPartition(partition);

    // 创建新的 BrowserView，使用独立会话
    const browserView = new BrowserView({
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
    browserView.webContents.on('did-finish-load', () => {
      // 页面加载完成，可以发送事件通知渲染进程
      mainWindow?.webContents.send('browser-view:loaded', id);
    });

    // 监听导航事件
    browserView.webContents.on('did-navigate', (_event, navigationUrl) => {
      mainWindow?.webContents.send('browser-view:navigated', id, navigationUrl);
    });

    // 监听导航状态变化
    browserView.webContents.on('did-navigate-in-page', (_event, navigationUrl) => {
      mainWindow?.webContents.send('browser-view:navigated', id, navigationUrl);
    });

    // 监听加载失败
    browserView.webContents.on('did-fail-load', (_event, errorCode, errorDescription) => {
      mainWindow?.webContents.send('browser-view:load-failed', id, errorCode, errorDescription);
    });

    return { success: true };
  } catch (error: unknown) {
    // 遵循宪法.md第6节错误处理规范：所有异步操作必须有错误处理
    const err = error as ErrorWithMessage;
    return { success: false, error: err.message || '创建 BrowserView 失败' };
  }
});

// 销毁 BrowserView
ipcMain.handle('browser-view:destroy', (_event, id: string) => {
  if (!mainWindow) {
    return { success: false, error: '主窗口不存在' };
  }

  try {
    const browserView = browserViews.get(id);
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
  } catch (error: unknown) {
    // 遵循宪法.md第6节错误处理规范：所有异步操作必须有错误处理
    const err = error as ErrorWithMessage;
    return { success: false, error: err.message || '销毁 BrowserView 失败' };
  }
});

// 导航到指定 URL
ipcMain.handle('browser-view:navigate', (_event, id: string, url: string) => {
  try {
    const browserView = browserViews.get(id);
    if (browserView) {
      browserView.webContents.loadURL(url);
      return { success: true };
    }
    return { success: false, error: 'BrowserView 不存在' };
  } catch (error: unknown) {
    const err = error as ErrorWithMessage;
    return { success: false, error: err.message || '导航失败' };
  }
});

// 刷新页面
ipcMain.handle('browser-view:reload', (_event, id: string) => {
  try {
    const browserView = browserViews.get(id);
    if (browserView) {
      browserView.webContents.reload();
      return { success: true };
    }
    return { success: false, error: 'BrowserView 不存在' };
  } catch (error: unknown) {
    const err = error as ErrorWithMessage;
    return { success: false, error: err.message || '刷新失败' };
  }
});

// 后退
ipcMain.handle('browser-view:go-back', (_event, id: string) => {
  try {
    const browserView = browserViews.get(id);
    if (browserView && browserView.webContents.canGoBack()) {
      browserView.webContents.goBack();
      return { success: true };
    }
    return { success: false, error: '无法后退' };
  } catch (error: unknown) {
    const err = error as ErrorWithMessage;
    return { success: false, error: err.message || '后退失败' };
  }
});

// 前进
ipcMain.handle('browser-view:go-forward', (_event, id: string) => {
  try {
    const browserView = browserViews.get(id);
    if (browserView && browserView.webContents.canGoForward()) {
      browserView.webContents.goForward();
      return { success: true };
    }
    return { success: false, error: '无法前进' };
  } catch (error: unknown) {
    const err = error as ErrorWithMessage;
    return { success: false, error: err.message || '前进失败' };
  }
});

// 检查是否可以后退
ipcMain.handle('browser-view:can-go-back', (_event, id: string) => {
  try {
    const browserView = browserViews.get(id);
    if (browserView) {
      return { success: true, canGoBack: browserView.webContents.canGoBack() };
    }
    return { success: false, error: 'BrowserView 不存在' };
  } catch (error: unknown) {
    const err = error as ErrorWithMessage;
    return { success: false, error: err.message || '检查失败' };
  }
});

// 检查是否可以前进
ipcMain.handle('browser-view:can-go-forward', (_event, id: string) => {
  try {
    const browserView = browserViews.get(id);
    if (browserView) {
      return { success: true, canGoForward: browserView.webContents.canGoForward() };
    }
    return { success: false, error: 'BrowserView 不存在' };
  } catch (error: unknown) {
    const err = error as ErrorWithMessage;
    return { success: false, error: err.message || '检查失败' };
  }
});

// 获取当前 URL
ipcMain.handle('browser-view:get-url', (_event, id: string) => {
  try {
    const browserView = browserViews.get(id);
    if (browserView) {
      return { success: true, url: browserView.webContents.getURL() };
    }
    return { success: false, error: 'BrowserView 不存在' };
  } catch (error: unknown) {
    const err = error as ErrorWithMessage;
    return { success: false, error: err.message || '获取 URL 失败' };
  }
});

// 设置 BrowserView 的位置和大小
ipcMain.handle('browser-view:set-bounds', (_event, id: string, bounds: { x: number; y: number; width: number; height: number }) => {
  try {
    const browserView = browserViews.get(id);
    if (browserView && mainWindow) {
      // 确保 bounds 有效
      const validBounds = {
        x: Math.max(0, Math.round(bounds.x)),
        y: Math.max(0, Math.round(bounds.y)),
        width: Math.max(1, Math.round(bounds.width)),
        height: Math.max(1, Math.round(bounds.height)),
      };
      browserView.setBounds(validBounds);
      return { success: true };
    }
    return { success: false, error: 'BrowserView 不存在' };
  } catch (error: unknown) {
    const err = error as ErrorWithMessage;
    return { success: false, error: err.message || '设置边界失败' };
  }
});

// 显示/隐藏 BrowserView
ipcMain.handle('browser-view:set-visibility', (_event, id: string, visible: boolean) => {
  if (!mainWindow) {
    return { success: false, error: '主窗口不存在' };
  }

  try {
    const browserView = browserViews.get(id);
    if (browserView) {
      if (visible) {
        mainWindow.addBrowserView(browserView);
      } else {
        mainWindow.removeBrowserView(browserView);
      }
      return { success: true };
    }
    return { success: false, error: 'BrowserView 不存在' };
  } catch (error: unknown) {
    const err = error as ErrorWithMessage;
    return { success: false, error: err.message || '设置可见性失败' };
  }
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
