import { createContext, useContext } from 'react';
// TabItem 类型在接口定义中使用，不需要单独导入
// import { TabItem } from '../index';

interface TabContextType {
  openTab: (menuId: string, title: string, pageId?: string) => void;
}

export const TabContext = createContext<TabContextType | null>(null);

export const useTab = () => {
  const context = useContext(TabContext);
  if (!context) {
    throw new Error('useTab must be used within TabProvider');
  }
  return context;
};





