import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import TopMenuBar from './components/TopMenuBar';
import TabBar from './components/TabBar';
import TabContent from './components/TabContent';
import BottomBar from './components/BottomBar';
import GlobalContextMenu from './components/GlobalContextMenu';
import { TabContext } from './contexts/TabContext';
import styles from './styles.module.css';

// localStorage 键名
const TABS_STORAGE_KEY = 'dtxmms_tabs';
const ACTIVE_TAB_STORAGE_KEY = 'dtxmms_activeTab';

export interface TabItem {
  id: string;
  title: string;
  pageId?: string; // 页面ID，用于映射到对应的页面组件
  content?: React.ReactNode;
  pinned?: boolean; // 是否固定
}

// 默认 tab 数据
const getDefaultTabs = (): TabItem[] => [
  {
    id: 'dashboard',
    title: '数据看板',
    pinned: true, // 数据看板永远固定
  },
];

// 从 localStorage 加载 tabs
const loadTabsFromStorage = (): TabItem[] => {
  try {
    const stored = localStorage.getItem(TABS_STORAGE_KEY);
    if (stored) {
      const parsedTabs = JSON.parse(stored) as TabItem[];
      // 确保数据看板存在且固定
      const dashboardTab = parsedTabs.find(tab => tab.id === 'dashboard');
      if (!dashboardTab) {
        return getDefaultTabs();
      }
      // 确保数据看板是固定的
      const tabsWithDashboard = parsedTabs.map(tab =>
        tab.id === 'dashboard' ? { ...tab, pinned: true } : tab
      );
      return tabsWithDashboard;
    }
  } catch (error) {
    console.error('Failed to load tabs from storage:', error);
  }
  return getDefaultTabs();
};

// 从 localStorage 加载当前激活的 tab
const loadActiveTabFromStorage = (tabs: TabItem[]): string => {
  try {
    const stored = localStorage.getItem(ACTIVE_TAB_STORAGE_KEY);
    if (stored) {
      // 检查存储的 tabId 是否在当前的 tabs 中存在
      const tabExists = tabs.some(tab => tab.id === stored);
      if (tabExists) {
        return stored;
      }
    }
  } catch (error) {
    console.error('Failed to load active tab from storage:', error);
  }
  // 如果存储的 tab 不存在，返回数据看板
  return 'dashboard';
};

const MainLayout: React.FC = () => {
  // 初始化时从 localStorage 加载 tabs
  const initialTabs = loadTabsFromStorage();
  const [tabs, setTabs] = useState<TabItem[]>(initialTabs);
  const [activeTabId, setActiveTabId] = useState<string>(() =>
    loadActiveTabFromStorage(initialTabs)
  );
  // 全局右键菜单状态
  const [globalContextMenu, setGlobalContextMenu] = useState<{
    position: { x: number; y: number };
  } | null>(null);
  const mainContentRef = useRef<HTMLDivElement>(null);

  // 保存 tabs 到 localStorage
  const saveTabsToStorage = (tabsToSave: TabItem[]) => {
    try {
      localStorage.setItem(TABS_STORAGE_KEY, JSON.stringify(tabsToSave));
    } catch (error) {
      console.error('Failed to save tabs to storage:', error);
    }
  };

  // 保存当前激活的 tab 到 localStorage
  const saveActiveTabToStorage = (tabId: string) => {
    try {
      localStorage.setItem(ACTIVE_TAB_STORAGE_KEY, tabId);
    } catch (error) {
      console.error('Failed to save active tab to storage:', error);
    }
  };

  // 当 tabs 或 activeTabId 变化时，保存到 localStorage
  useEffect(() => {
    saveTabsToStorage(tabs);
  }, [tabs]);

  useEffect(() => {
    saveActiveTabToStorage(activeTabId);
  }, [activeTabId]);

  const handleTabChange = (tabId: string) => {
    setActiveTabId(tabId);
  };

  // 排序 tabs：固定的在前，按固定时间排序，未固定的在后
  const sortTabs = (tabsToSort: TabItem[]): TabItem[] => {
    const pinnedTabs = tabsToSort.filter(tab => tab.pinned);
    const unpinnedTabs = tabsToSort.filter(tab => !tab.pinned);
    // 数据看板永远在最前面
    const dashboardTab = pinnedTabs.find(tab => tab.id === 'dashboard');
    const otherPinnedTabs = pinnedTabs.filter(tab => tab.id !== 'dashboard');
    return dashboardTab
      ? [dashboardTab, ...otherPinnedTabs, ...unpinnedTabs]
      : [...pinnedTabs, ...unpinnedTabs];
  };

  const handleTabClose = (tabId: string) => {
    // 数据看板不能关闭
    if (tabId === 'dashboard') {
      return;
    }

    if (tabs.length === 1) {
      return; // 至少保留一个tab
    }

    const newTabs = tabs.filter(tab => tab.id !== tabId);
    const sortedTabs = sortTabs(newTabs);
    setTabs(sortedTabs);

    // 如果关闭的是当前激活的tab，激活第一个tab
    if (activeTabId === tabId) {
      setActiveTabId(sortedTabs[0].id);
    }
  };

  // 固定当前 tab
  const handleTabPin = (tabId: string) => {
    // 数据看板已经固定，不需要操作
    if (tabId === 'dashboard') {
      return;
    }

    const newTabs = tabs.map(tab =>
      tab.id === tabId ? { ...tab, pinned: true } : tab
    );
    const sortedTabs = sortTabs(newTabs);
    setTabs(sortedTabs);
  };

  // 取消固定当前 tab
  const handleTabUnpin = (tabId: string) => {
    // 数据看板不能取消固定
    if (tabId === 'dashboard') {
      return;
    }

    const newTabs = tabs.map(tab =>
      tab.id === tabId ? { ...tab, pinned: false } : tab
    );
    const sortedTabs = sortTabs(newTabs);
    setTabs(sortedTabs);
  };

  // 关闭左侧 tabs
  const handleCloseLeft = (tabId: string) => {
    const currentIndex = tabs.findIndex(tab => tab.id === tabId);
    if (currentIndex <= 0) {
      return; // 没有左侧的 tab
    }

    // 保留数据看板和当前 tab 及其右侧的 tabs
    const newTabs = tabs.filter(
      (tab, index) =>
        tab.id === 'dashboard' || index >= currentIndex || tab.pinned
    );
    const sortedTabs = sortTabs(newTabs);
    setTabs(sortedTabs);

    // 如果当前 tab 被关闭了，激活第一个 tab
    if (!sortedTabs.find(tab => tab.id === tabId)) {
      setActiveTabId(sortedTabs[0].id);
    }
  };

  // 关闭右侧 tabs
  const handleCloseRight = (tabId: string) => {
    const currentIndex = tabs.findIndex(tab => tab.id === tabId);
    if (currentIndex < 0 || currentIndex === tabs.length - 1) {
      return; // 没有右侧的 tab
    }

    // 保留当前 tab 及其左侧的 tabs，以及固定的 tabs
    const newTabs = tabs.filter(
      (tab, index) => index <= currentIndex || tab.pinned || tab.id === 'dashboard'
    );
    const sortedTabs = sortTabs(newTabs);
    setTabs(sortedTabs);
  };

  // 关闭全部 tabs（除了数据看板）
  const handleCloseAll = () => {
    const dashboardTab = tabs.find(tab => tab.id === 'dashboard');
    if (dashboardTab) {
      setTabs([dashboardTab]);
      setActiveTabId('dashboard');
    }
  };

  const handleTabAdd = () => {
    const newTabId = `tab-${Date.now()}`;
    const newTab: TabItem = {
      id: newTabId,
      title: '新标签页',
    };
    setTabs([...tabs, newTab]);
    setActiveTabId(newTabId);
  };

  // 处理菜单点击打开tab
  const handleOpenTab = (menuId: string, title: string, pageId?: string) => {
    // 检查是否已经存在该tab
    const existingTab = tabs.find(
      tab => tab.id === menuId || tab.pageId === menuId
    );
    if (existingTab) {
      setActiveTabId(existingTab.id);
      return;
    }

    // 创建新tab
    const newTab: TabItem = {
      id: menuId,
      title,
      pageId: pageId || menuId,
      pinned: false,
    };
    const newTabs = [...tabs, newTab];
    const sortedTabs = sortTabs(newTabs);
    setTabs(sortedTabs);
    setActiveTabId(menuId);
  };

  // 处理全局右键菜单
  const handleGlobalContextMenu = (e: React.MouseEvent) => {
    // 检查是否点击在需要排除的区域
    const target = e.target as HTMLElement;
    const isMenuBar = target.closest(`.${styles.menuBar}`);
    const isTabBar = target.closest(`.${styles.tabBar}`);
    const isBottomBar = target.closest(`.${styles.bottomBar}`);
    const isContextMenu = target.closest(`.${styles.tabContextMenu}`);

    // 如果点击在这些区域，不显示全局右键菜单
    if (isMenuBar || isTabBar || isBottomBar || isContextMenu) {
      return;
    }

    // 如果点击在 mainContent 区域内（主要是 TabContent 区域），显示全局右键菜单
    if (mainContentRef.current && mainContentRef.current.contains(target)) {
      e.preventDefault();
      e.stopPropagation();

      setGlobalContextMenu({
        position: {
          x: e.clientX,
          y: e.clientY,
        },
      });
    }
  };

  // 关闭全局右键菜单
  const handleCloseGlobalContextMenu = () => {
    setGlobalContextMenu(null);
  };

  // 处理刷新
  const handleRefresh = () => {
    // 当前激活的 tab ID 已经保存在 localStorage 中
    // 刷新后会自动恢复，所以直接刷新页面即可
    window.location.reload();
  };

  // 点击外部关闭全局右键菜单
  useEffect(() => {
    if (!globalContextMenu) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const contextMenuElement = document.querySelector(`.${styles.tabContextMenu}`);

      // 如果点击的不是 mainContent 内的元素，也不是右键菜单内的元素，则关闭菜单
      if (
        contextMenuElement &&
        !contextMenuElement.contains(target)
      ) {
        setGlobalContextMenu(null);
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as Node;
      const contextMenuElement = document.querySelector(`.${styles.tabContextMenu}`);

      // 如果右键点击的不是 mainContent 内的元素，也不是右键菜单内的元素，则关闭菜单
      if (
        contextMenuElement &&
        !contextMenuElement.contains(target)
      ) {
        setGlobalContextMenu(null);
      }
    };

    // 延迟添加事件监听，避免立即触发
    const timer = setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
      document.addEventListener('contextmenu', handleContextMenu);
    }, 0);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [globalContextMenu]);

  return (
    <TabContext.Provider value={{ openTab: handleOpenTab }}>
      <div className={styles.container}>
        <TopMenuBar />
        <div
          ref={mainContentRef}
          className={styles.mainContent}
          onContextMenu={handleGlobalContextMenu}
        >
          <TabBar
            tabs={tabs}
            activeTabId={activeTabId}
            onTabChange={handleTabChange}
            onTabClose={handleTabClose}
            onTabAdd={handleTabAdd}
            onTabPin={handleTabPin}
            onTabUnpin={handleTabUnpin}
            onCloseLeft={handleCloseLeft}
            onCloseRight={handleCloseRight}
            onCloseAll={handleCloseAll}
          />
          <TabContent tabs={tabs} activeTabId={activeTabId} />
        </div>
        <BottomBar />
      </div>
      {globalContextMenu &&
        createPortal(
          <GlobalContextMenu
            position={globalContextMenu.position}
            onClose={handleCloseGlobalContextMenu}
            onRefresh={handleRefresh}
          />,
          document.body
        )}
    </TabContext.Provider>
  );
};

export default MainLayout;
