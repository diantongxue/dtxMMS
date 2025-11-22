import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { useState, useEffect, useCallback } from 'react';
import Login from './pages/Login';
import MainLayout from './pages/MainLayout';
import Loading from './components/Loading';
import './styles/index.css';
import styles from './App.module.css';

/**
 * 应用根组件
 * 遵循宪法.md第13.1.6节React规范：函数式组件、类型安全、性能优化
 */
function App(): JSX.Element {
  // 页面初始加载状态（遵循宪法.md第5节加载状态和过渡效果规范）
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
  // 检查localStorage中的登录状态（遵循宪法.md第13.1.1节TypeScript规范，明确类型）
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    try {
      return localStorage.getItem('isLoggedIn') === 'true';
    } catch (error) {
      // 遵循宪法.md第6节错误处理规范：所有操作必须有错误处理
      console.error('Failed to read login status from localStorage:', error);
      return false;
    }
  });
  // 过渡状态：用于控制页面切换动画（遵循宪法.md第5节过渡动画规范）
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [showLogin, setShowLogin] = useState<boolean>(() => {
    try {
      return localStorage.getItem('isLoggedIn') !== 'true';
    } catch (error) {
      console.error('Failed to read login status from localStorage:', error);
      return true;
    }
  });

  // 页面加载时检查登录状态（遵循宪法.md第13.1.6节React规范：useEffect依赖项完整）
  useEffect(() => {
    // 模拟页面加载，显示加载动画（遵循宪法.md第5节加载状态规范）
    const timer = setTimeout(() => {
      try {
        const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
        setIsLoggedIn(loggedIn);
        setShowLogin(!loggedIn);
        setIsInitialLoading(false);
      } catch (error) {
        // 遵循宪法.md第6节错误处理规范
        console.error('Failed to check login status:', error);
        setIsInitialLoading(false);
      }
    }, 500); // 最小显示500ms，避免闪烁

    return () => clearTimeout(timer);
  }, []);

  // 处理登录成功（遵循宪法.md第13.1.6节React规范：使用useCallback缓存函数）
  const handleLoginSuccess = useCallback(() => {
    // 开始过渡动画（遵循宪法.md第5节过渡动画规范：300-500ms）
    setIsTransitioning(true);

    // 使用 requestAnimationFrame 确保动画流畅
    requestAnimationFrame(() => {
      // 先淡出登录页
      setTimeout(() => {
        try {
          setShowLogin(false);
          setIsLoggedIn(true);
          localStorage.setItem('isLoggedIn', 'true');
        } catch (error) {
          // 遵循宪法.md第6节错误处理规范
          console.error('Failed to save login status:', error);
        }

        // 淡入主页
        requestAnimationFrame(() => {
          setTimeout(() => {
            setIsTransitioning(false);
          }, 50);
        });
      }, 350);
    });
  }, []);

  // 如果正在初始加载，显示加载动画
  if (isInitialLoading) {
    return (
      <ConfigProvider locale={zhCN}>
        <Loading fullScreen tip="系统加载中..." />
      </ConfigProvider>
    );
  }

  return (
    <ConfigProvider locale={zhCN}>
      <div className={styles.appContainer}>
        {showLogin && (
          <div
            className={`${styles.pageWrapper} ${styles.loginPage} ${
              isTransitioning ? styles.fadeOut : styles.fadeIn
            }`}
          >
            <Login onLoginSuccess={handleLoginSuccess} />
          </div>
        )}
        {isLoggedIn && (
          <div
            className={`${styles.pageWrapper} ${styles.mainPage} ${
              isTransitioning
                ? styles.fadeIn
                : showLogin
                  ? styles.hidden
                  : styles.fadeIn
            }`}
          >
            <MainLayout />
          </div>
        )}
      </div>
    </ConfigProvider>
  );
}

export default App;
