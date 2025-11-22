import { MenuItemLevel1 } from '../../../types/menu';
import SubMenuItem from './SubMenuItem';
import styles from '../styles.module.css';

interface SubMenuProps {
  menu: MenuItemLevel1;
}

const SubMenu: React.FC<SubMenuProps> = ({ menu }) => {
  return (
    <div className={styles.submenu}>
      {menu.children.map(subItem => (
        <SubMenuItem
          key={subItem.id}
          subItem={subItem}
          parentMenuName={menu.name}
        />
      ))}
    </div>
  );
};

export default SubMenu;
