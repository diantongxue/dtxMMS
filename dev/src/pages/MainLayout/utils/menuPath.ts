import { generateMenuData } from '../../../data/menuData';
// 类型通过类型推断使用，不需要显式导入
// MenuItemLevel1, MenuItemLevel2, MenuItemLevel3 类型在函数内部通过类型推断使用
// import { MenuItemLevel1, MenuItemLevel2, MenuItemLevel3 } from '../../../types/menu';

export interface MenuPath {
  level1: string;
  level2: string;
  level3?: string;
}

/**
 * 根据菜单ID查找菜单路径
 * @param menuId 菜单ID
 * @returns 菜单路径，如果找不到返回 null
 */
export function findMenuPath(menuId: string): MenuPath | null {
  const menuData = generateMenuData();

  // 特殊处理：数据看板的 id 是 'dashboard'，对应菜单中的 'menu-1-1'
  if (menuId === 'dashboard') {
    menuId = 'menu-1-1';
  }

  for (const level1 of menuData) {
    // 检查是否是一级菜单
    if (level1.id === menuId) {
      return {
        level1: level1.name,
        level2: '',
        level3: undefined,
      };
    }

    for (const level2 of level1.children) {
      // 检查是否是二级菜单
      if (level2.id === menuId) {
        return {
          level1: level1.name,
          level2: level2.name,
          level3: undefined,
        };
      }

      // 检查是否是三级菜单
      for (const level3 of level2.children) {
        if (level3.id === menuId) {
          return {
            level1: level1.name,
            level2: level2.name,
            level3: level3.name,
          };
        }
      }
    }
  }

  return null;
}

