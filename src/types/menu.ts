// 菜单类型定义

export interface MenuItemLevel3 {
  id: string;
  name: string;
  icon?: string;
  path?: string;
}

export interface MenuItemLevel2 {
  id: string;
  name: string;
  icon?: string;
  path?: string;
  children: MenuItemLevel3[];
}

export interface MenuItemLevel1 {
  id: string;
  name: string;
  icon?: string;
  path?: string;
  children: MenuItemLevel2[];
}

export interface MenuSearchItem {
  level: 1 | 2 | 3;
  name: string;
  path: string;
  menuId: string; // 菜单ID，用于打开tab
  element?: HTMLElement;
}
