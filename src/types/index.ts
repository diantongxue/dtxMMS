// 全局类型定义

export interface User {
  id: string;
  name: string;
  avatar?: string;
  email?: string;
}

export interface MenuItem {
  id: string;
  title: string;
  icon?: string;
  path?: string;
  children?: MenuItem[];
}
