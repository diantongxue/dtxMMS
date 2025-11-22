import { useState, useEffect, useRef } from 'react';
import Skeleton from '../../components/Skeleton';
import { useTab } from '../MainLayout/contexts/TabContext';
import styles from './styles.module.css';

interface BrowserInstance {
  id: string;
  name: string;
  platform: string;
  url: string;
  status: 'online' | 'offline' | 'crashed';
  memory: number; // MB
  cpu: number; // %
  visible: boolean;
}

// Electron API 类型定义
interface ElectronAPI {
  platform?: string;
  browserView: {
    create: (id: string, url: string, bounds: { x: number; y: number; width: number; height: number }) => Promise<{ success: boolean; error?: string }>;
    destroy: (id: string) => Promise<{ success: boolean; error?: string }>;
    navigate: (id: string, url: string) => Promise<{ success: boolean; error?: string }>;
    reload: (id: string) => Promise<{ success: boolean; error?: string }>;
    goBack: (id: string) => Promise<{ success: boolean; error?: string }>;
    goForward: (id: string) => Promise<{ success: boolean; error?: string }>;
    canGoBack: (id: string) => Promise<{ success: boolean; canGoBack?: boolean; error?: string }>;
    canGoForward: (id: string) => Promise<{ success: boolean; canGoForward?: boolean; error?: string }>;
    getUrl: (id: string) => Promise<{ success: boolean; url?: string; error?: string }>;
    setBounds: (id: string, bounds: { x: number; y: number; width: number; height: number }) => Promise<{ success: boolean; error?: string }>;
    setVisibility: (id: string, visible: boolean) => Promise<{ success: boolean; error?: string }>;
    onLoaded: (callback: (id: string) => void) => void;
    onNavigated: (callback: (id: string, url: string) => void) => void;
    onLoadFailed: (callback: (id: string, errorCode: number, errorDescription: string) => void) => void;
    removeAllListeners: (channel: string) => void;
  };
}

const MerchantPreview: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBrowserId, setSelectedBrowserId] = useState<string | null>(null);
  const [browsers, setBrowsers] = useState<BrowserInstance[]>([]);
  const [currentUrl, setCurrentUrl] = useState('');
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [isBrowserLoading, setIsBrowserLoading] = useState(true);
  const [browserError, setBrowserError] = useState<string | null>(null);
  const browserPreviewRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const currentBrowserViewIdRef = useRef<string | null>(null);
  const { openTab } = useTab();

  // 检查是否在 Electron 环境中，并获取 electronAPI
  const electronAPI = (() => {
    if (typeof window === 'undefined') return null;
    // 遵循宪法.md第13.1.1节TypeScript规范：禁止使用any类型
    const api = (window as unknown as Record<string, unknown>).electronAPI as ElectronAPI | undefined;
    if (api && api.browserView) {
      return api;
    }
    return null;
  })();

  const isElectron = electronAPI !== null;

  useEffect(() => {
    // 模拟数据加载
    const loadData = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 800));

      // 模拟200+账号数据（这里只显示部分）
      const mockBrowsers: BrowserInstance[] = [
        {
          id: 'browser-001',
          name: '拼多多商家后台 - 账号1',
          platform: '拼多多',
          url: 'https://mms.pinduoduo.com',
          status: 'online',
          memory: 256,
          cpu: 12,
          visible: true,
        },
        {
          id: 'browser-002',
          name: '拼多多商家后台 - 账号2',
          platform: '拼多多',
          url: 'https://mms.pinduoduo.com',
          status: 'online',
          memory: 234,
          cpu: 8,
          visible: true,
        },
        {
          id: 'browser-003',
          name: '抖店商家后台 - 账号1',
          platform: '抖店',
          url: 'https://fxg.jinritemai.com',
          status: 'online',
          memory: 189,
          cpu: 5,
          visible: false,
        },
        {
          id: 'browser-004',
          name: '淘宝商家后台 - 账号1',
          platform: '淘宝',
          url: 'https://seller.taobao.com',
          status: 'crashed',
          memory: 0,
          cpu: 0,
          visible: false,
        },
      ];

      setBrowsers(mockBrowsers);
      if (mockBrowsers.length > 0) {
        setSelectedBrowserId(mockBrowsers[0].id);
        setCurrentUrl(mockBrowsers[0].url);
      }
      setIsLoading(false);
    };

    loadData();
  }, []);

  // 计算 BrowserView 的位置和大小
  const calculateBrowserViewBounds = () => {
    if (!browserPreviewRef.current || !toolbarRef.current) {
      return { x: 0, y: 0, width: 0, height: 0 };
    }

    const containerRect = browserPreviewRef.current.getBoundingClientRect();
    const toolbarRect = toolbarRef.current.getBoundingClientRect();

    // 获取窗口位置（相对于屏幕）
    const x = Math.round(containerRect.left);
    const y = Math.round(containerRect.top + toolbarRect.height);
    const width = Math.round(containerRect.width);
    const height = Math.round(containerRect.height - toolbarRect.height);

    return { x, y, width, height };
  };

  // 创建或更新 BrowserView
  const createOrUpdateBrowserView = async (browserId: string, url: string) => {
    if (!electronAPI || !electronAPI.browserView) {
      // 非 Electron 环境或 browserView 未正确暴露
      console.error('BrowserView API 不可用:', {
        hasElectronAPI: !!electronAPI,
        hasBrowserView: !!(electronAPI && electronAPI.browserView),
        // 遵循宪法.md第13.1.1节TypeScript规范：禁止使用any类型
        windowElectronAPI: (window as unknown as Record<string, unknown>).electronAPI,
      });
      setBrowserError('BrowserView API 未正确加载，请检查 Electron 配置');
      setIsBrowserLoading(false);
      return;
    }

    try {
      setIsBrowserLoading(true);
      setBrowserError(null);

      const bounds = calculateBrowserViewBounds();

      // 如果 bounds 无效，等待一下再重试
      if (bounds.width === 0 || bounds.height === 0) {
        setTimeout(() => createOrUpdateBrowserView(browserId, url), 100);
        return;
      }

      // 如果已存在 BrowserView，先隐藏并销毁
      if (currentBrowserViewIdRef.current && currentBrowserViewIdRef.current !== browserId) {
        // 先隐藏旧的 BrowserView
        await electronAPI.browserView.setVisibility(currentBrowserViewIdRef.current, false);
        // 然后销毁
        await electronAPI.browserView.destroy(currentBrowserViewIdRef.current);
      }

      // 创建新的 BrowserView（如果不存在）或显示已存在的
      let result;
      if (currentBrowserViewIdRef.current === browserId) {
        // 如果是要显示的 BrowserView 已存在，只需要更新位置和显示
        result = await electronAPI.browserView.setBounds(browserId, bounds);
        if (result.success) {
          await electronAPI.browserView.setVisibility(browserId, true);
        }
      } else {
        // 创建新的 BrowserView
        result = await electronAPI.browserView.create(browserId, url, bounds);
        if (result.success) {
          // 确保新创建的 BrowserView 是可见的
          await electronAPI.browserView.setVisibility(browserId, true);
        }
      }

      if (result.success) {
        currentBrowserViewIdRef.current = browserId;
        // 更新导航状态
        updateNavigationState(browserId);
      } else {
        setBrowserError(result.error || '创建 BrowserView 失败');
        setIsBrowserLoading(false);
      }
    } catch (error: unknown) {
      // 遵循宪法.md第6节错误处理规范：所有异步操作必须有错误处理
      const err = error as { message?: string };
      setBrowserError(err.message || '创建 BrowserView 时发生错误');
      setIsBrowserLoading(false);
    }
  };

  // 更新导航状态（后退/前进）
  const updateNavigationState = async (browserId: string) => {
    if (!electronAPI || !electronAPI.browserView) return;

    try {
      const [backResult, forwardResult] = await Promise.all([
        electronAPI.browserView.canGoBack(browserId),
        electronAPI.browserView.canGoForward(browserId),
      ]);

      if (backResult.success) {
        setCanGoBack(backResult.canGoBack || false);
      }
      if (forwardResult.success) {
        setCanGoForward(forwardResult.canGoForward || false);
      }
    } catch (error) {
      // 忽略错误
    }
  };

  // 监听 BrowserView 事件
  useEffect(() => {
    if (!electronAPI || !electronAPI.browserView) return;

    const handleLoaded = (id: string) => {
      if (id === currentBrowserViewIdRef.current) {
        setIsBrowserLoading(false);
        setBrowserError(null);
        updateNavigationState(id);
      }
    };

    const handleNavigated = (id: string, url: string) => {
      if (id === currentBrowserViewIdRef.current) {
        setCurrentUrl(url);
        updateNavigationState(id);
      }
    };

    const handleLoadFailed = (id: string, errorCode: number, errorDescription: string) => {
      if (id === currentBrowserViewIdRef.current) {
        setIsBrowserLoading(false);
        setBrowserError(`页面加载失败: ${errorDescription} (错误代码: ${errorCode})`);
      }
    };

    electronAPI.browserView.onLoaded(handleLoaded);
    electronAPI.browserView.onNavigated(handleNavigated);
    electronAPI.browserView.onLoadFailed(handleLoadFailed);

    return () => {
      if (electronAPI && electronAPI.browserView) {
        electronAPI.browserView.removeAllListeners('browser-view:loaded');
        electronAPI.browserView.removeAllListeners('browser-view:navigated');
        electronAPI.browserView.removeAllListeners('browser-view:load-failed');
      }
    };
  }, [electronAPI]);

  // 获取当前选中的浏览器实例（必须在所有使用它的地方之前定义）
  const currentBrowser = browsers.find(b => b.id === selectedBrowserId);

  // 监听窗口大小变化，更新 BrowserView 位置和大小
  useEffect(() => {
    if (!electronAPI || !electronAPI.browserView || !currentBrowserViewIdRef.current || !browserPreviewRef.current) return;

    const updateBounds = () => {
      const bounds = calculateBrowserViewBounds();
      if (bounds.width > 0 && bounds.height > 0 && currentBrowserViewIdRef.current) {
        electronAPI.browserView.setBounds(currentBrowserViewIdRef.current, bounds);
      }
    };

    // 使用 ResizeObserver 监听容器大小变化
    const resizeObserver = new ResizeObserver(() => {
      updateBounds();
    });

    resizeObserver.observe(browserPreviewRef.current);
    if (toolbarRef.current) {
      resizeObserver.observe(toolbarRef.current);
    }

    // 同时监听窗口大小变化
    window.addEventListener('resize', updateBounds);
    window.addEventListener('scroll', updateBounds);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateBounds);
      window.removeEventListener('scroll', updateBounds);
    };
  }, [electronAPI, currentBrowserViewIdRef.current]);

  // 当选中浏览器改变时，创建或更新 BrowserView
  useEffect(() => {
    if (!selectedBrowserId || !currentBrowser || !browserPreviewRef.current || !toolbarRef.current) {
      // 如果没有选中的浏览器，隐藏所有 BrowserView
      if (currentBrowserViewIdRef.current && electronAPI?.browserView) {
        electronAPI.browserView.setVisibility(currentBrowserViewIdRef.current, false).catch(() => {
          // 忽略错误
        });
      }
      return;
    }

    // 先隐藏旧的 BrowserView（如果存在且不是当前要显示的）
    const previousBrowserId = currentBrowserViewIdRef.current;
    if (previousBrowserId && previousBrowserId !== selectedBrowserId && electronAPI?.browserView) {
      electronAPI.browserView.setVisibility(previousBrowserId, false).catch(() => {
        // 忽略错误
      });
    }

    // 等待 DOM 渲染完成后再创建 BrowserView
    const timer = setTimeout(() => {
      createOrUpdateBrowserView(selectedBrowserId, currentBrowser.url);
    }, 100);

    return () => {
      clearTimeout(timer);
      // 清理：当组件卸载或浏览器切换时，隐藏当前的 BrowserView
      if (currentBrowserViewIdRef.current && electronAPI?.browserView) {
        electronAPI.browserView.setVisibility(currentBrowserViewIdRef.current, false).catch(() => {
          // 忽略错误
        });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBrowserId, currentBrowser?.id, currentBrowser?.url]);

  // 监听页面可见性变化，当页面隐藏时隐藏 BrowserView
  useEffect(() => {
    if (!electronAPI?.browserView) return;

    const handleVisibilityChange = () => {
      if (document.hidden && currentBrowserViewIdRef.current) {
        // 页面隐藏时，隐藏 BrowserView
        electronAPI.browserView.setVisibility(currentBrowserViewIdRef.current, false).catch(() => {
          // 忽略错误
        });
      } else if (!document.hidden && currentBrowserViewIdRef.current && selectedBrowserId) {
        // 页面显示时，显示当前选中的 BrowserView
        electronAPI.browserView.setVisibility(currentBrowserViewIdRef.current, true).catch(() => {
          // 忽略错误
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [electronAPI, selectedBrowserId]);

  // 组件卸载时，清理所有 BrowserView
  useEffect(() => {
    return () => {
      // 组件卸载时，隐藏并销毁所有 BrowserView
      if (currentBrowserViewIdRef.current && electronAPI?.browserView) {
        electronAPI.browserView.setVisibility(currentBrowserViewIdRef.current, false).catch(() => {
          // 忽略错误
        });
        electronAPI.browserView.destroy(currentBrowserViewIdRef.current).catch(() => {
          // 忽略错误
        });
        currentBrowserViewIdRef.current = null;
      }
    };
  }, [electronAPI]);

  // 处理刷新
  const handleRefresh = async () => {
    if (electronAPI?.browserView && currentBrowserViewIdRef.current) {
      setIsBrowserLoading(true);
      setBrowserError(null);
      await electronAPI.browserView.reload(currentBrowserViewIdRef.current);
    }
  };

  // 处理前进
  const handleForward = async () => {
    if (electronAPI?.browserView && currentBrowserViewIdRef.current) {
      await electronAPI.browserView.goForward(currentBrowserViewIdRef.current);
      updateNavigationState(currentBrowserViewIdRef.current);
    }
  };

  // 处理后退
  const handleBack = async () => {
    if (electronAPI?.browserView && currentBrowserViewIdRef.current) {
      await electronAPI.browserView.goBack(currentBrowserViewIdRef.current);
      updateNavigationState(currentBrowserViewIdRef.current);
    }
  };

  // 处理地址栏输入
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentUrl(e.target.value);
  };

  // 处理地址栏提交
  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (electronAPI?.browserView && currentBrowserViewIdRef.current && currentUrl) {
      setIsBrowserLoading(true);
      setBrowserError(null);
      await electronAPI.browserView.navigate(currentBrowserViewIdRef.current, currentUrl);
    }
  };

  // 处理浏览器切换
  const handleBrowserSwitch = (browserId: string) => {
    const browser = browsers.find(b => b.id === browserId);
    if (browser) {
      setSelectedBrowserId(browserId);
      setCurrentUrl(browser.url);
    }
  };

  // 处理窗口显示/隐藏切换
  const handleToggleVisibility = (browserId: string) => {
    setBrowsers(prev =>
      prev.map(b => (b.id === browserId ? { ...b, visible: !b.visible } : b))
    );
  };

  // 处理数据快速提取
  const handleQuickExtract = () => {
    // BrowserView 中可以通过 executeJavaScript 来执行脚本
    // 这里暂时留空，后续可以通过 IPC 实现
  };

  // 处理快捷操作
  const handleQuickAction = (_action: string) => {
    // BrowserView 中可以通过 executeJavaScript 来执行脚本
    // 这里暂时留空，后续可以通过 IPC 实现
  };

  // 处理显示统计数据
  const handleShowStats = () => {
    // BrowserView 中可以通过 executeJavaScript 来执行脚本
    // 这里暂时留空，后续可以通过 IPC 实现
  };

  // 处理崩溃恢复
  const handleRecover = (browserId: string) => {
    setBrowsers(prev =>
      prev.map(b => (b.id === browserId ? { ...b, status: 'online' } : b))
    );
  };

  if (isLoading) {
    return (
      <div className={styles.merchantPreview}>
        <div className={styles.contentHeader}>
          <Skeleton title rows={1} />
        </div>
        <div className={styles.browserContainer}>
          <Skeleton rows={10} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.merchantPreview}>
      <div className={styles.contentHeader}>
        <h1 className={styles.contentTitle}>商家后台预览</h1>
        <p className={styles.contentSubtitle}>
          管理200+商家账号的浏览器实例，支持实时预览和操作
          {isElectron && <span style={{ color: '#10b981', marginLeft: '8px' }}>✓ 使用 BrowserView</span>}
        </p>
      </div>

      <div className={styles.browserContainer}>
        {/* 左侧浏览器列表 */}
        <div className={styles.browserList}>
          <div className={styles.browserListHeader}>
            <span className={styles.browserListTitle}>浏览器实例</span>
            <div className={styles.browserListHeaderRight}>
              <span className={styles.browserCount}>
                {browsers.length} 个实例
              </span>
              <button
                className={styles.platformAccountBtn}
                onClick={() => {
                  // 打开平台账号页面
                  openTab('menu-3-3', '平台账号', 'menu-3-3');
                }}
                title="打开平台账号管理"
              >
                平台账号
              </button>
            </div>
          </div>
          <div className={styles.browserListContent}>
            {browsers.map(browser => (
              <div
                key={browser.id}
                className={`${styles.browserItem} ${selectedBrowserId === browser.id ? styles.active : ''
                  } ${browser.status === 'crashed' ? styles.crashed : ''}`}
                onClick={() => handleBrowserSwitch(browser.id)}
              >
                <div className={styles.browserItemHeader}>
                  <div className={styles.browserItemInfo}>
                    <div className={styles.browserItemName}>{browser.name}</div>
                    <div className={styles.browserItemPlatform}>
                      {browser.platform}
                    </div>
                  </div>
                  <div className={styles.browserItemActions}>
                    <button
                      className={styles.visibilityBtn}
                      onClick={e => {
                        e.stopPropagation();
                        handleToggleVisibility(browser.id);
                      }}
                      title={browser.visible ? '隐藏' : '显示'}
                    >
                      {browser.visible ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </div>
                <div className={styles.browserItemStatus}>
                  <span
                    className={`${styles.statusBadge} ${browser.status === 'online'
                      ? styles.statusOnline
                      : browser.status === 'crashed'
                        ? styles.statusCrashed
                        : styles.statusOffline
                      }`}
                  >
                    {browser.status === 'online'
                      ? '在线'
                      : browser.status === 'crashed'
                        ? '已崩溃'
                        : '离线'}
                  </span>
                  {browser.status === 'crashed' && (
                    <button
                      className={styles.recoverBtn}
                      onClick={e => {
                        e.stopPropagation();
                        handleRecover(browser.id);
                      }}
                    >
                      恢复
                    </button>
                  )}
                </div>
                {browser.status === 'online' && (
                  <div className={styles.browserItemResources}>
                    <div className={styles.resourceItem}>
                      <span className={styles.resourceLabel}>内存:</span>
                      <span className={styles.resourceValue}>
                        {browser.memory} MB
                      </span>
                    </div>
                    <div className={styles.resourceItem}>
                      <span className={styles.resourceLabel}>CPU:</span>
                      <span className={styles.resourceValue}>
                        {browser.cpu}%
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 右侧浏览器预览区域 */}
        <div className={styles.browserPreview} ref={browserPreviewRef}>
          {currentBrowser?.status === 'crashed' ? (
            <div className={styles.crashPrompt}>
              <div className={styles.crashIcon}>⚠️</div>
              <div className={styles.crashTitle}>浏览器实例已崩溃</div>
              <div className={styles.crashMessage}>
                该浏览器实例已崩溃，请点击恢复按钮重新启动
              </div>
              <button
                className={styles.recoverBtnLarge}
                onClick={() => handleRecover(currentBrowser.id)}
              >
                恢复浏览器实例
              </button>
            </div>
          ) : (
            <>
              {/* 浏览器工具栏 */}
              <div className={styles.browserToolbar} ref={toolbarRef}>
                <div className={styles.toolbarLeft}>
                  <button
                    className={styles.toolbarBtn}
                    onClick={handleBack}
                    disabled={!canGoBack}
                    title="后退"
                  >
                    ←
                  </button>
                  <button
                    className={styles.toolbarBtn}
                    onClick={handleForward}
                    disabled={!canGoForward}
                    title="前进"
                  >
                    →
                  </button>
                  <button
                    className={styles.toolbarBtn}
                    onClick={handleRefresh}
                    title="刷新"
                  >
                    🔄
                  </button>
                </div>
                <form className={styles.urlBar} onSubmit={handleUrlSubmit}>
                  <input
                    type="text"
                    value={currentUrl}
                    onChange={handleUrlChange}
                    className={styles.urlInput}
                    placeholder="输入网址..."
                  />
                </form>
                <div className={styles.toolbarRight}>
                  <button
                    className={styles.injectBtn}
                    onClick={handleQuickExtract}
                    title="数据快速提取"
                  >
                    📊 提取数据
                  </button>
                  <button
                    className={styles.injectBtn}
                    onClick={() => handleQuickAction('refresh')}
                    title="快捷操作"
                  >
                    ⚡ 快捷操作
                  </button>
                  <button
                    className={styles.injectBtn}
                    onClick={handleShowStats}
                    title="显示统计数据"
                  >
                    📈 统计数据
                  </button>
                </div>
              </div>

              {/* BrowserView 预览区域 */}
              <div className={styles.iframeContainer}>
                {isBrowserLoading && (
                  <div className={styles.iframeLoading}>
                    <div className={styles.loadingSpinner}></div>
                    <div className={styles.loadingText}>正在加载页面...</div>
                  </div>
                )}
                {browserError && (
                  <div className={styles.iframeError}>
                    <div className={styles.errorIcon}>⚠️</div>
                    <div className={styles.errorTitle}>页面加载失败</div>
                    <div className={styles.errorMessage}>{browserError}</div>
                    <button
                      className={styles.retryBtn}
                      onClick={() => {
                        if (currentBrowser) {
                          createOrUpdateBrowserView(currentBrowser.id, currentBrowser.url);
                        }
                      }}
                    >
                      重试
                    </button>
                  </div>
                )}
                {!isElectron && (
                  <div className={styles.iframeError}>
                    <div className={styles.errorIcon}>ℹ️</div>
                    <div className={styles.errorTitle}>需要 Electron 环境</div>
                    <div className={styles.errorMessage}>
                      BrowserView 功能仅在 Electron 客户端中可用。请在 Electron 客户端中打开此页面。
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MerchantPreview;
