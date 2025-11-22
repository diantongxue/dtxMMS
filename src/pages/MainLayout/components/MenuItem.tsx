import { MenuItemLevel1 } from '../../../types/menu';
import SubMenu from './SubMenu';
import styles from '../styles.module.css';

interface MenuItemProps {
  menu: MenuItemLevel1;
  isActive: boolean;
  onMouseEnter: (e: React.MouseEvent) => void;
  onMouseLeave: () => void;
  onClick: () => void;
}

const MenuItem: React.FC<MenuItemProps> = ({
  menu,
  isActive,
  onMouseEnter,
  onMouseLeave,
  onClick,
}) => {
  return (
    <div
      className={`${styles.menuItem} ${isActive ? styles.active : ''}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <a
        href="#"
        className={styles.menuLink}
        onClick={e => {
          e.preventDefault();
          onClick();
        }}
      >
        <span
          className={styles.menuIcon}
          dangerouslySetInnerHTML={{ __html: menu.icon || '' }}
        />
        <span>{menu.name}</span>
      </a>
      <SubMenu menu={menu} />
    </div>
  );
};

export default MenuItem;
