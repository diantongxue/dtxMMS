import { useRef, useState } from 'react';
import { MenuItemLevel2 } from '../../../types/menu';
import SubMenuLevel3 from './SubMenuLevel3';
import { useTab } from '../contexts/TabContext';
import styles from '../styles.module.css';

interface SubMenuItemProps {
  subItem: MenuItemLevel2;
  parentMenuName: string;
}

const SubMenuItem: React.FC<SubMenuItemProps> = ({
  subItem,
  parentMenuName,
}) => {
  const { openTab } = useTab();
  const [indicatorHeight, setIndicatorHeight] = useState(0);
  const [indicatorTop, setIndicatorTop] = useState(0);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const linkRef = useRef<HTMLAnchorElement>(null);
  const itemRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (linkRef.current && itemRef.current) {
      const linkRect = linkRef.current.getBoundingClientRect();
      const itemRect = itemRef.current.getBoundingClientRect();
      const top = linkRect.top - itemRect.top;
      const height = linkRect.height * 0.7;
      setIndicatorTop(top);
      setIndicatorHeight(height);
    }
  };

  const handleMouseLeave = () => {
    setIndicatorHeight(0);
  };

  const handleSubItemMouseEnter = () => {
    handleMouseEnter();
    // 智能定位三级菜单（只有当有三级菜单时才执行）
    if (subItem.children.length > 0 && itemRef.current) {
      const submenuItemRect = itemRef.current.getBoundingClientRect();
      const windowWidth = window.innerWidth;
      const level3Width = 600;
      const gap = 6;
      const safeMargin = 20;

      const submenuItemRight = submenuItemRect.right;
      const level3RightEdge = submenuItemRight + gap + level3Width;

      const level3 = itemRef.current.querySelector(
        `.${styles.submenuLevel3}`
      ) as HTMLElement;
      if (level3) {
        if (level3RightEdge > windowWidth - safeMargin) {
          level3.classList.add(styles.showLeft);
        } else {
          level3.classList.remove(styles.showLeft);
        }
      }
    }
  };

  return (
    <div
      className={styles.submenuItem}
      ref={itemRef}
      onMouseEnter={handleSubItemMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className={styles.submenuIndicator}
        ref={indicatorRef}
        style={{
          top: `${indicatorTop}px`,
          height: `${indicatorHeight}px`,
        }}
      />
      <a
        href="#"
        className={styles.submenuLink}
        ref={linkRef}
        onClick={e => {
          e.preventDefault();
          // 如果没有三级菜单，点击时打开对应的tab
          if (subItem.children.length === 0) {
            openTab(subItem.id, subItem.name, subItem.id);
          }
        }}
      >
        <span>
          {subItem.icon && (
            <span className={styles.submenuIcon}>
              {subItem.icon.startsWith('http') ? (
                <img src={subItem.icon} alt={subItem.name} />
              ) : (
                <span dangerouslySetInnerHTML={{ __html: subItem.icon }} />
              )}
            </span>
          )}
          {subItem.name}
        </span>
        {subItem.children.length > 0 && (
          <span className={styles.submenuArrow}>›</span>
        )}
      </a>
      {subItem.children.length > 0 && (
        <SubMenuLevel3
          level3Items={subItem.children}
          parentMenuName={parentMenuName}
          subMenuName={subItem.name}
        />
      )}
    </div>
  );
};

export default SubMenuItem;
