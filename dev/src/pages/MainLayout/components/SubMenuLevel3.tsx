import { MenuItemLevel3 } from '../../../types/menu';
import { useTab } from '../contexts/TabContext';
import styles from '../styles.module.css';

interface SubMenuLevel3Props {
  level3Items: MenuItemLevel3[];
  parentMenuName: string;
  subMenuName: string;
}

const SubMenuLevel3: React.FC<SubMenuLevel3Props> = ({ level3Items }) => {
  const { openTab } = useTab();

  // 如果没有三级菜单项，不渲染
  if (!level3Items || level3Items.length === 0) {
    return null;
  }

  return (
    <div className={styles.submenuLevel3}>
      {level3Items.map(item => (
        <a
          key={item.id}
          href="#"
          className={styles.submenuLevel3Link}
          onClick={e => {
            e.preventDefault();
            openTab(item.id, item.name, item.id);
          }}
        >
          {item.icon && (
            <span className={styles.submenuLevel3Icon}>
              {item.icon.startsWith('http') ? (
                <img src={item.icon} alt={item.name} />
              ) : (
                <span dangerouslySetInnerHTML={{ __html: item.icon }} />
              )}
            </span>
          )}
          <span>{item.name}</span>
        </a>
      ))}
    </div>
  );
};

export default SubMenuLevel3;
