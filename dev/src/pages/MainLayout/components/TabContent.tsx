import { TabItem } from '../index';
import Dashboard from '../../Dashboard';
import DeviceManagement from '../../DeviceManagement';
import Charts from '../../Charts';
import ScreenDisplay from '../../ScreenDisplay';
import RolePermission from '../../RolePermission';
import ApprovalProcess from '../../ApprovalProcess';
import MerchantPreview from '../../MerchantPreview';
import TodoList from '../../TodoList';
import UserManagement from '../../UserManagement';
import styles from '../styles.module.css';

interface TabContentProps {
  tabs: TabItem[];
  activeTabId: string;
}

const TabContent: React.FC<TabContentProps> = ({ tabs, activeTabId }) => {
  const renderTabContent = (tab: TabItem) => {
    if (tab.id === 'dashboard') {
      return <Dashboard />;
    }
    if (tab.id === 'device-management') {
      return <DeviceManagement />;
    }
    if (tab.id === 'charts') {
      return <Charts />;
    }
    // 数据大屏页面（支持菜单ID和自定义ID）
    if (tab.id === 'menu-6-1' || tab.id === 'screen-display') {
      return <ScreenDisplay />;
    }
    // 权限管理页面
    if (tab.id === 'menu-7-3' || tab.id === 'role-permission') {
      return <RolePermission />;
    }
    // 审批流程页面
    if (tab.id === 'menu-4-12' || tab.id === 'approval-process') {
      return <ApprovalProcess />;
    }
    // 待办事项页面
    if (tab.id === 'todo-list' || tab.id === 'menu-4-12-todo') {
      return <TodoList />;
    }
    // 商家后台预览页面
    if (
      tab.id === 'menu-3-1' ||
      tab.id === 'merchant-preview' ||
      tab.pageId === 'merchant-preview' ||
      tab.pageId === 'menu-3-1'
    ) {
      return <MerchantPreview />;
    }
    // 平台账号管理页面（暂时使用UserManagement作为占位，后续需要创建专门的PlatformAccount页面）
    if (
      tab.id === 'menu-3-3' ||
      tab.id === 'platform-account' ||
      tab.pageId === 'platform-account' ||
      tab.pageId === 'menu-3-3'
    ) {
      // TODO: 创建专门的PlatformAccount页面组件
      return <UserManagement />;
    }
    // 用户管理页面
    if (
      tab.id === 'menu-7-1' ||
      tab.id === 'user-management' ||
      tab.pageId === 'user-management' ||
      tab.pageId === 'menu-7-1'
    ) {
      return <UserManagement />;
    }
    if (tab.content) {
      return tab.content;
    }
    return (
      <div className={styles.contentHeader}>
        <h1 className={styles.contentTitle}>{tab.title}</h1>
        <p className={styles.contentSubtitle}>内容区域</p>
      </div>
    );
  };

  return (
    <div className={styles.tabContent}>
      {tabs.map(tab => (
        <div
          key={tab.id}
          className={`${styles.tabPanel} ${activeTabId === tab.id ? styles.active : ''}`}
        >
          {renderTabContent(tab)}
        </div>
      ))}
    </div>
  );
};

export default TabContent;
