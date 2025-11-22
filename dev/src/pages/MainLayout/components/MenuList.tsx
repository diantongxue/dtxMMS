import { useRef, useEffect, useState } from 'react';
import { generateMenuData, level1Icons } from '../../../data/menuData';
import { MenuItemLevel1 } from '../../../types/menu';
import MenuItem from './MenuItem';
import styles from '../styles.module.css';

interface MenuListProps {
  onMenuClick?: (menu: MenuItemLevel1) => void;
}

const MenuList: React.FC<MenuListProps> = ({ onMenuClick }) => {
  const [menus, setMenus] = useState<MenuItemLevel1[]>([]);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const menuListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const menuData = generateMenuData();
    // 为每个菜单添加图标
    menuData.forEach((menu, index) => {
      menu.icon = level1Icons[index];
    });
    setMenus(menuData);
  }, []);

  const handleMenuMouseEnter = (menuId: string, event: React.MouseEvent) => {
    setActiveMenuId(menuId);
    const menuItem = event.currentTarget as HTMLElement;
    const submenu = menuItem.querySelector(`.${styles.submenu}`) as HTMLElement;
    if (submenu) {
      const rect = menuItem.getBoundingClientRect();
      submenu.style.left = `${rect.left}px`;
      submenu.style.top = `${rect.bottom + 2}px`;
    }
  };

  const handleMenuMouseLeave = () => {
    setActiveMenuId(null);
  };

  const handleMenuBarMouseLeave = () => {
    setActiveMenuId(null);
  };

  return (
    <div
      className={styles.menuList}
      ref={menuListRef}
      onMouseLeave={handleMenuBarMouseLeave}
    >
      {menus.map(menu => (
        <MenuItem
          key={menu.id}
          menu={menu}
          isActive={activeMenuId === menu.id}
          onMouseEnter={e => handleMenuMouseEnter(menu.id, e)}
          onMouseLeave={handleMenuMouseLeave}
          onClick={() => onMenuClick?.(menu)}
        />
      ))}
    </div>
  );
};

export default MenuList;
