import { useState, useRef, useEffect } from 'react';
import {
  SettingOutlined,
  BellOutlined,
  UserOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { Spin } from 'antd';
import MenuList from './MenuList';
import { generateMenuData } from '../../../data/menuData';
import { MenuSearchItem } from '../../../types/menu';
import Logo from '../../../components/Logo';
import { useTab } from '../contexts/TabContext';
import styles from '../styles.module.css';

// 声明全局类型
declare global {
  interface Window {
    electronAPI?: {
      platform: string;
      toggleMaximize: () => Promise<void>;
      isMaximized: () => Promise<boolean>;
      getScreenSize: () => Promise<{ width: number; height: number }>;
      setWindowSize: (width: number, height: number) => Promise<void>;
    };
  }
}

const TopMenuBar: React.FC = () => {
  const { openTab } = useTab();
  const [searchValue, setSearchValue] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchResults, setSearchResults] = useState<MenuSearchItem[]>([]);
  const [allMenuItems, setAllMenuItems] = useState<MenuSearchItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 收集所有菜单项用于搜索
  useEffect(() => {
    const menuData = generateMenuData();
    const items: MenuSearchItem[] = [];

    menuData.forEach(menu => {
      // 一级菜单通常不直接打开tab，但保留用于搜索
      items.push({
        level: 1,
        name: menu.name,
        path: menu.name,
        menuId: menu.id,
      });

      menu.children.forEach(subMenu => {
        // 二级菜单：如果没有三级菜单，使用二级菜单ID；如果有三级菜单，不直接打开
        items.push({
          level: 2,
          name: subMenu.name,
          path: `${menu.name} > ${subMenu.name}`,
          menuId: subMenu.children.length === 0 ? subMenu.id : '', // 只有没有三级菜单时才可打开
        });

        subMenu.children.forEach(level3 => {
          // 三级菜单：使用三级菜单ID
          items.push({
            level: 3,
            name: level3.name,
            path: `${menu.name} > ${subMenu.name} > ${level3.name}`,
            menuId: level3.id,
          });
        });
      });
    });

    setAllMenuItems(items);
  }, []);

  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);

    if (value.trim().length === 0) {
      setShowSearchResults(false);
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    // 显示搜索加载状态
    setIsSearching(true);
    setShowSearchResults(true);

    // 模拟搜索延迟，提升用户体验
    await new Promise(resolve => setTimeout(resolve, 200));

    const keyword = value.toLowerCase();
    const results = allMenuItems.filter(
      item =>
        // 只显示可以打开的菜单项（有 menuId）
        item.menuId &&
        (item.name.toLowerCase().includes(keyword) ||
          item.path.toLowerCase().includes(keyword))
    );

    setSearchResults(results.slice(0, 20));
    setIsSearching(false);
  };

  const highlightKeyword = (text: string, keyword: string) => {
    if (!keyword) return text;
    const regex = new RegExp(`(${keyword})`, 'gi');
    return text.replace(
      regex,
      '<mark style="background: rgba(57, 100, 254, 0.2); color: #3964fe; padding: 2px 4px; border-radius: 3px;">$1</mark>'
    );
  };

  const handleSearchResultClick = (item: MenuSearchItem) => {
    // 如果菜单项有 menuId，则打开或跳转到对应的 tab
    if (item.menuId) {
      openTab(item.menuId, item.name, item.menuId);
    }
    setSearchValue('');
    setShowSearchResults(false);
  };

  // 处理双击标题栏最大化/缩小一半居中
  useEffect(() => {
    const handleDoubleClick = async (e: Event) => {
      // 检查是否点击在可拖动区域（菜单栏空白区域）
      const target = e.target as HTMLElement;
      const menuBar = target.closest(`.${styles.menuBar}`);

      if (menuBar && window.electronAPI) {
        // 检查是否点击在交互元素上（搜索框、菜单、按钮等）
        const isInteractive = target.closest(
          `.${styles.menuSearch}, .${styles.menuList}, .${styles.topbarActions}, button, a, input, select`
        );

        // 检查是否点击在区域二（滇同学·智慧系统）
        const isLogoArea2 = target.closest(`.${styles.logoTextArea}`);

        // 如果点击在空白区域或区域二，执行操作
        if (!isInteractive || isLogoArea2) {
          // 如果双击区域二，取消区域一的点击刷新事件
          if (isLogoArea2 && logoClickTimerRef.current) {
            clearTimeout(logoClickTimerRef.current);
            logoClickTimerRef.current = null;
            logoClickCountRef.current = 0;
          }

          const isMaximized = await window.electronAPI.isMaximized();

          if (isMaximized) {
            // 如果当前是最大化，缩小到屏幕一半并居中
            const screenSize = await window.electronAPI.getScreenSize();
            const halfWidth = Math.floor(screenSize.width / 2);
            const halfHeight = Math.floor(screenSize.height / 2);
            await window.electronAPI.setWindowSize(halfWidth, halfHeight);
          } else {
            // 如果当前是非最大化，最大化窗口
            await window.electronAPI.toggleMaximize();
          }
        }
      }
    };

    const menuBar = document.querySelector(`.${styles.menuBar}`);
    if (menuBar) {
      menuBar.addEventListener('dblclick', handleDoubleClick);
      return () => {
        menuBar.removeEventListener('dblclick', handleDoubleClick);
      };
    }
  }, []);

  const logoClickTimerRef = useRef<NodeJS.Timeout | null>(null);
  const logoClickCountRef = useRef(0);

  // 处理点击logo刷新页面，并回到数据看板
  const handleLogoClick = () => {
    logoClickCountRef.current += 1;

    // 清除之前的定时器
    if (logoClickTimerRef.current) {
      clearTimeout(logoClickTimerRef.current);
    }

    // 延迟执行，如果检测到双击则取消
    logoClickTimerRef.current = setTimeout(() => {
      // 如果只点击了一次（没有双击），执行刷新
      if (logoClickCountRef.current === 1) {
        // 设置激活的 tab 为数据看板
        try {
          localStorage.setItem('dtxmms_activeTab', 'dashboard');
        } catch (error) {
          console.error('Failed to save active tab to storage:', error);
        }
        // 刷新页面
        window.location.reload();
      }
      // 重置计数
      logoClickCountRef.current = 0;
    }, 300); // 300ms 内如果没有第二次点击，认为是单击
  };

  return (
    <div className={styles.menuBar} data-draggable="true">
      <div className={styles.logo}>
        {/* 区域一：Logo图标 - 点击刷新 */}
        <div className={styles.logoIconArea} onClick={handleLogoClick}>
          <Logo size="small" showText={false} />
        </div>
        {/* 区域二：滇同学·智慧系统 - 双击执行最大化/缩小，可以拖动 */}
        <div className={styles.logoTextArea}>
          <span className={styles.logoText}>滇同学</span>
          <span className={styles.logoSeparator}>·</span>
          <span className={styles.logoText}>智慧系统</span>
        </div>
      </div>

      <div className={styles.menuSearch} ref={searchRef}>
        <div className={styles.searchInputWrapper}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="搜索菜单..."
            value={searchValue}
            onChange={handleSearchChange}
          />
          {isSearching && (
            <div className={styles.searchLoading}>
              <Spin size="small" />
            </div>
          )}
          {!isSearching && searchValue && (
            <SearchOutlined className={styles.searchIcon} />
          )}
        </div>
        {showSearchResults && (
          <div
            className={`${styles.searchResults} ${showSearchResults ? styles.show : ''}`}
          >
            {isSearching ? (
              <div className={styles.searchLoadingResults}>
                <Spin size="small" tip="搜索中..." />
              </div>
            ) : searchResults.length === 0 ? (
              <div className={styles.searchNoResults}>未找到匹配的菜单</div>
            ) : (
              searchResults.map((searchItem, index) => (
                <div
                  key={index}
                  className={styles.searchResultItem}
                  onClick={() => handleSearchResultClick(searchItem)}
                  style={{
                    fontWeight:
                      searchItem.level === 1
                        ? 600
                        : searchItem.level === 2
                          ? 500
                          : 400,
                  }}
                >
                  <div
                    dangerouslySetInnerHTML={{
                      __html: highlightKeyword(searchItem.name, searchValue),
                    }}
                  />
                  <div
                    className={styles.searchResultPath}
                    dangerouslySetInnerHTML={{
                      __html: highlightKeyword(searchItem.path, searchValue),
                    }}
                  />
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <MenuList />

      <div className={styles.topbarActions}>
        <button className={styles.btnIcon} title="设置">
          <SettingOutlined />
        </button>
        <button className={styles.btnIcon} title="通知">
          <BellOutlined />
        </button>
        <div className={styles.userAccount}>
          <div className={styles.userAvatar}>
            <UserOutlined />
          </div>
          <span className={styles.userName}>管理员</span>
        </div>
      </div>
    </div>
  );
};

export default TopMenuBar;
