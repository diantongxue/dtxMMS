import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { PlusOutlined, CloseOutlined, PushpinOutlined } from '@ant-design/icons';
import { TabItem } from '../index';
import TabContextMenu from './TabContextMenu';
import TabTooltip from './TabTooltip';
import styles from '../styles.module.css';

interface TabBarProps {
  tabs: TabItem[];
  activeTabId: string;
  onTabChange: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
  onTabAdd: () => void;
  onTabPin?: (tabId: string) => void;
  onTabUnpin?: (tabId: string) => void;
  onCloseLeft?: (tabId: string) => void;
  onCloseRight?: (tabId: string) => void;
  onCloseAll?: () => void;
}

const TabBar: React.FC<TabBarProps> = ({
  tabs,
  activeTabId,
  onTabChange,
  onTabClose,
  onTabAdd,
  onTabPin,
  onTabUnpin,
  onCloseLeft,
  onCloseRight,
  onCloseAll,
}) => {
  const [contextMenu, setContextMenu] = useState<{
    tab: TabItem;
    position: { x: number; y: number };
  } | null>(null);
  const [tooltip, setTooltip] = useState<{
    tab: TabItem;
    position: { x: number; y: number };
  } | null>(null);
  const tooltipTimerRef = useRef<NodeJS.Timeout | null>(null);
  const tabBarRef = useRef<HTMLDivElement>(null);

  // 当激活的tab改变时，关闭提示
  useEffect(() => {
    if (tooltip && tooltip.tab.id !== activeTabId) {
      setTooltip(null);
      if (tooltipTimerRef.current) {
        clearTimeout(tooltipTimerRef.current);
        tooltipTimerRef.current = null;
      }
    }
  }, [activeTabId, tooltip]);

  // 点击外部关闭右键菜单
  useEffect(() => {
    if (!contextMenu) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const contextMenuElement = document.querySelector(`.${styles.tabContextMenu}`);

      // 如果点击的不是 tabBar 内的元素，也不是右键菜单内的元素，则关闭菜单
      if (
        tabBarRef.current &&
        !tabBarRef.current.contains(target) &&
        contextMenuElement &&
        !contextMenuElement.contains(target)
      ) {
        setContextMenu(null);
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as Node;
      const contextMenuElement = document.querySelector(`.${styles.tabContextMenu}`);

      // 如果右键点击的不是 tabBar 内的元素，也不是右键菜单内的元素，则关闭菜单
      if (
        tabBarRef.current &&
        !tabBarRef.current.contains(target) &&
        contextMenuElement &&
        !contextMenuElement.contains(target)
      ) {
        setContextMenu(null);
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
  }, [contextMenu]);

  const handleTabClick = (tabId: string, e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(`.${styles.tabClose}`)) {
      return; // 如果点击的是关闭按钮，不切换tab
    }
    if ((e.target as HTMLElement).closest(`.${styles.tabPin}`)) {
      return; // 如果点击的是固定图标，不切换tab
    }
    onTabChange(tabId);
  };

  const handleTabCloseClick = (tabId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onTabClose(tabId);
  };

  const handleTabContextMenu = (tab: TabItem, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // 关闭提示
    setTooltip(null);
    if (tooltipTimerRef.current) {
      clearTimeout(tooltipTimerRef.current);
      tooltipTimerRef.current = null;
    }

    // 使用视口坐标，因为菜单会通过 Portal 渲染到 body
    setContextMenu({
      tab,
      position: {
        x: e.clientX,
        y: e.clientY + 4,
      },
    });
  };

  const handleTabMouseEnter = (tab: TabItem, e: React.MouseEvent) => {
    // 只有当前激活的tab才显示提示
    if (tab.id !== activeTabId) {
      return;
    }

    // 清除之前的定时器
    if (tooltipTimerRef.current) {
      clearTimeout(tooltipTimerRef.current);
      tooltipTimerRef.current = null;
    }

    // 3秒后显示提示
    tooltipTimerRef.current = setTimeout(() => {
      // 再次检查是否仍然是当前激活的tab
      if (tab.id === activeTabId) {
        setTooltip({
          tab,
          position: {
            x: e.clientX,
            y: e.clientY,
          },
        });
      }
      tooltipTimerRef.current = null;
    }, 3000);
  };

  const handleTabMouseLeave = () => {
    // 清除定时器，如果提示还没显示，则取消显示
    if (tooltipTimerRef.current) {
      clearTimeout(tooltipTimerRef.current);
      tooltipTimerRef.current = null;
    }
    // 如果提示已显示，立即关闭
    if (tooltip) {
      setTooltip(null);
    }
  };

  const handleTooltipClose = () => {
    setTooltip(null);
    if (tooltipTimerRef.current) {
      clearTimeout(tooltipTimerRef.current);
      tooltipTimerRef.current = null;
    }
  };

  const isDashboard = (tabId: string) => tabId === 'dashboard';
  const isPinned = (tab: TabItem) => tab.pinned || isDashboard(tab.id);

  return (
    <div className={styles.tabBar} ref={tabBarRef}>
      {tabs.map(tab => {
        const pinned = isPinned(tab);
        const showClose = !isDashboard(tab.id) && tabs.length > 1;
        const showPin = pinned && !isDashboard(tab.id); // 数据看板不显示固定图标

        return (
          <button
            key={tab.id}
            className={`${styles.tabItem} ${activeTabId === tab.id ? styles.active : ''} ${pinned ? styles.pinned : ''}`}
            onClick={e => handleTabClick(tab.id, e)}
            onContextMenu={e => handleTabContextMenu(tab, e)}
            onMouseEnter={e => handleTabMouseEnter(tab, e)}
            onMouseLeave={handleTabMouseLeave}
          >
            {showPin && <PushpinOutlined className={styles.tabPin} />}
            <span>{tab.title}</span>
            {showClose && (
              <span
                className={styles.tabClose}
                onClick={e => handleTabCloseClick(tab.id, e)}
              >
                <CloseOutlined />
              </span>
            )}
          </button>
        );
      })}
      <button className={styles.tabAdd} onClick={onTabAdd} title="新建标签">
        <PlusOutlined />
      </button>
      {contextMenu &&
        createPortal(
          <TabContextMenu
            tab={contextMenu.tab}
            tabs={tabs}
            activeTabId={activeTabId}
            position={contextMenu.position}
            onClose={() => setContextMenu(null)}
            onPin={onTabPin}
            onUnpin={onTabUnpin}
            onCloseCurrent={onTabClose}
            onCloseLeft={onCloseLeft}
            onCloseRight={onCloseRight}
            onCloseAll={onCloseAll}
          />,
          document.body
        )}
      {tooltip &&
        createPortal(
          <TabTooltip
            tab={tooltip.tab}
            position={tooltip.position}
            onClose={handleTooltipClose}
          />,
          document.body
        )}
    </div>
  );
};

export default TabBar;
