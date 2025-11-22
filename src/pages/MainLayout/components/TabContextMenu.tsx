import { useEffect, useRef } from 'react';
import {
    PushpinOutlined,
    CloseOutlined,
    VerticalLeftOutlined,
    VerticalRightOutlined,
    DeleteOutlined,
} from '@ant-design/icons';
import { TabItem } from '../index';
import styles from '../styles.module.css';

interface TabContextMenuProps {
    tab: TabItem;
    tabs: TabItem[];
    activeTabId: string;
    position: { x: number; y: number };
    onClose: () => void;
    onPin?: (tabId: string) => void;
    onUnpin?: (tabId: string) => void;
    onCloseCurrent?: (tabId: string) => void;
    onCloseLeft?: (tabId: string) => void;
    onCloseRight?: (tabId: string) => void;
    onCloseAll?: () => void;
}

const TabContextMenu: React.FC<TabContextMenuProps> = ({
    tab,
    tabs,
    position,
    onClose,
    onPin,
    onUnpin,
    onCloseCurrent,
    onCloseLeft,
    onCloseRight,
    onCloseAll,
}) => {
    const isDashboard = tab.id === 'dashboard';
    const isPinned = tab.pinned || isDashboard;
    const currentIndex = tabs.findIndex(t => t.id === tab.id);
    const hasLeftTabs = currentIndex > 0 && tabs.slice(0, currentIndex).some(t => !t.pinned && t.id !== 'dashboard');
    const hasRightTabs = currentIndex >= 0 && currentIndex < tabs.length - 1 && tabs.slice(currentIndex + 1).some(t => !t.pinned);

    const menuRef = useRef<HTMLDivElement>(null);

    // 使用估算的菜单宽度（140px min-width + padding）来预先计算位置，避免跳动
    const estimatedMenuWidth = 160;
    const estimatedMenuHeight = 200; // 估算最大高度
    const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1920;
    const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 1080;

    // 计算初始位置
    let left = position.x + 4; // 鼠标右侧 4px
    let top = position.y; // 鼠标下方

    // 如果菜单超出右边界，显示在鼠标左侧
    if (left + estimatedMenuWidth > viewportWidth) {
        left = position.x - estimatedMenuWidth - 4;
    }

    // 如果菜单超出下边界，显示在鼠标上方
    if (top + estimatedMenuHeight > viewportHeight) {
        top = position.y - estimatedMenuHeight;
    }

    // 确保不超出左边界
    if (left < 0) {
        left = 4;
    }

    // 确保不超出上边界
    if (top < 0) {
        top = 4;
    }

    // 微调位置，确保菜单完全在视口内（在渲染后）
    useEffect(() => {
        if (!menuRef.current) return;

        const menu = menuRef.current;
        const menuRect = menu.getBoundingClientRect();
        const menuWidth = menuRect.width;
        const menuHeight = menuRect.height;
        const currentLeft = parseFloat(menu.style.left);
        const currentTop = parseFloat(menu.style.top);

        // 只在必要时微调，避免明显跳动
        let needsAdjust = false;
        let newLeft = currentLeft;
        let newTop = currentTop;

        if (currentLeft + menuWidth > viewportWidth) {
            newLeft = viewportWidth - menuWidth - 4;
            needsAdjust = true;
        }

        if (currentTop + menuHeight > viewportHeight) {
            newTop = viewportHeight - menuHeight - 4;
            needsAdjust = true;
        }

        if (needsAdjust) {
            menu.style.left = `${newLeft}px`;
            menu.style.top = `${newTop}px`;
        }
    }, [position]);

    const handleClick = (e: React.MouseEvent, action: () => void) => {
        e.stopPropagation();
        action();
        onClose();
    };

    // 计算菜单位置，使用 fixed 定位（相对于视口）
    const menuStyle: React.CSSProperties = {
        position: 'fixed',
        left: `${left}px`,
        top: `${top}px`,
    };

    return (
        <div
            ref={menuRef}
            className={styles.tabContextMenu}
            style={menuStyle}
            onClick={e => e.stopPropagation()}
        >
            {!isDashboard && (
                <div
                    className={styles.contextMenuItem}
                    onClick={e => {
                        if (isPinned && onUnpin) {
                            handleClick(e, () => onUnpin(tab.id));
                        } else if (!isPinned && onPin) {
                            handleClick(e, () => onPin(tab.id));
                        }
                    }}
                >
                    <PushpinOutlined className={styles.contextMenuIcon} />
                    <span>{isPinned ? '取消固定' : '固定当前'}</span>
                </div>
            )}
            {!isDashboard && onCloseCurrent && (
                <div
                    className={styles.contextMenuItem}
                    onClick={e => handleClick(e, () => onCloseCurrent(tab.id))}
                >
                    <CloseOutlined className={styles.contextMenuIcon} />
                    <span>关闭当前</span>
                </div>
            )}
            {hasLeftTabs && onCloseLeft && (
                <div
                    className={styles.contextMenuItem}
                    onClick={e => handleClick(e, () => onCloseLeft(tab.id))}
                >
                    <VerticalRightOutlined className={styles.contextMenuIcon} />
                    <span>关闭左侧</span>
                </div>
            )}
            {hasRightTabs && onCloseRight && (
                <div
                    className={styles.contextMenuItem}
                    onClick={e => handleClick(e, () => onCloseRight(tab.id))}
                >
                    <VerticalLeftOutlined className={styles.contextMenuIcon} />
                    <span>关闭右侧</span>
                </div>
            )}
            {tabs.length > 1 && onCloseAll && (
                <div
                    className={styles.contextMenuItem}
                    onClick={e => handleClick(e, () => onCloseAll())}
                >
                    <DeleteOutlined className={styles.contextMenuIcon} />
                    <span>关闭全部</span>
                </div>
            )}
        </div>
    );
};

export default TabContextMenu;

