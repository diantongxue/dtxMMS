import { useEffect, useRef } from 'react';
import { ReloadOutlined } from '@ant-design/icons';
import styles from '../styles.module.css';

interface GlobalContextMenuProps {
  position: { x: number; y: number };
  onClose: () => void;
  onRefresh: () => void;
}

const GlobalContextMenu: React.FC<GlobalContextMenuProps> = ({
  position,
  onClose,
  onRefresh,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  // 使用估算的菜单宽度和高度来预先计算位置，避免跳动
  const estimatedMenuWidth = 140;
  const estimatedMenuHeight = 60;
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
    // viewportWidth 和 viewportHeight 是常量，不需要添加到依赖数组
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      <div
        className={styles.contextMenuItem}
        onClick={e => handleClick(e, onRefresh)}
      >
        <ReloadOutlined className={styles.contextMenuIcon} />
        <span>刷新</span>
      </div>
    </div>
  );
};

export default GlobalContextMenu;



