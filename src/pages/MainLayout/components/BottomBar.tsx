import { useState, useEffect } from 'react';
// Modal 保留用于未来扩展
// import { Modal } from 'antd';
import styles from '../styles.module.css';
import FocusDataSettingsModal from './FocusDataSettingsModal';

interface FocusDataItem {
  id: string;
  label: string;
  value: string | number;
  unit?: string;
}

const BottomBar: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<string>('');
  const [focusData, setFocusData] = useState<FocusDataItem[]>([]);
  const [isSettingsModalVisible, setIsSettingsModalVisible] = useState(false);

  // 获取当前登录账号
  useEffect(() => {
    const rememberedUsername = localStorage.getItem('rememberedUsername');
    const username = rememberedUsername || '未登录';
    setCurrentUser(username);
  }, []);

  // 从localStorage加载关注的数据
  useEffect(() => {
    const savedFocusData = localStorage.getItem('focusData');
    if (savedFocusData) {
      try {
        setFocusData(JSON.parse(savedFocusData));
      } catch (error) {
        console.error('加载关注数据失败:', error);
      }
    }
  }, []);

  // 保存关注的数据
  const handleSaveFocusData = (data: FocusDataItem[]) => {
    setFocusData(data);
    localStorage.setItem('focusData', JSON.stringify(data));
    setIsSettingsModalVisible(false);
  };

  return (
    <>
      <div className={styles.bottomBar}>
        <div className={styles.bottomBarLeft}>
          <span className={styles.userInfo}>
            <span className={styles.userLabel}>当前账号：</span>
            <span className={styles.userName}>{currentUser}</span>
          </span>
        </div>
        <div className={styles.bottomBarCenter}>
          {focusData.length > 0 ? (
            <div className={styles.focusDataList}>
              {focusData.map(item => (
                <div key={item.id} className={styles.focusDataItem}>
                  <span className={styles.focusDataLabel}>{item.label}：</span>
                  <span className={styles.focusDataValue}>
                    {item.value}
                    {item.unit && (
                      <span className={styles.focusDataUnit}>{item.unit}</span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.focusDataEmpty}>暂无关注数据</div>
          )}
        </div>
        <div className={styles.bottomBarRight}>
          <button
            className={styles.settingsButton}
            onClick={() => setIsSettingsModalVisible(true)}
            title="设置关注数据"
          >
            <svg
              viewBox="0 0 1024 1024"
              xmlns="http://www.w3.org/2000/svg"
              className={styles.settingsIcon}
            >
              <path d="M512 64a32 32 0 0 1 32 32v64a32 32 0 0 1-64 0V96a32 32 0 0 1 32-32zm0 768a32 32 0 0 1 32 32v64a32 32 0 1 1-64 0v-64a32 32 0 0 1 32-32zm448-384a32 32 0 0 1-32 32h-64a32 32 0 1 1 0-64h64a32 32 0 0 1 32 32zm-768 0a32 32 0 0 1-32 32H96a32 32 0 1 1 0-64h64a32 32 0 0 1 32 32zm678.4-192a32 32 0 0 1-22.4 9.6 32 32 0 0 1-22.4-54.4l45.2-45.2a32 32 0 0 1 45.2 45.2l-45.2 45.2zm-566.4 566.4a32 32 0 0 1-22.4 9.6 32 32 0 0 1-22.4-54.4l45.2-45.2a32 32 0 0 1 45.2 45.2l-45.2 45.2zm566.4 0a32 32 0 0 1-45.2-45.2l45.2-45.2a32 32 0 1 1 45.2 45.2l-45.2 45.2zm-566.4-566.4a32 32 0 0 1 45.2-45.2l45.2 45.2a32 32 0 0 1-45.2 45.2l-45.2-45.2zM512 192a320 320 0 1 0 0 640 320 320 0 0 0 0-640zm0 64a256 256 0 1 1 0 512 256 256 0 0 1 0-512z" />
            </svg>
          </button>
        </div>
      </div>

      <FocusDataSettingsModal
        visible={isSettingsModalVisible}
        focusData={focusData}
        onSave={handleSaveFocusData}
        onCancel={() => setIsSettingsModalVisible(false)}
      />
    </>
  );
};

export default BottomBar;
