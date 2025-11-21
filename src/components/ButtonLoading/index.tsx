import { Button, ButtonProps } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import React from 'react';
import styles from './styles.module.css';

interface ButtonLoadingProps extends Omit<ButtonProps, 'loading'> {
  /** 是否显示加载状态 */
  loading?: boolean;
  /** 加载时显示的文本 */
  loadingText?: string;
  /** 加载图标位置 */
  loadingPosition?: 'left' | 'right';
}

/**
 * 按钮加载组件
 * 增强Ant Design Button的加载状态显示
 */
const ButtonLoading: React.FC<ButtonLoadingProps> = ({
  loading = false,
  loadingText,
  loadingPosition = 'left',
  children,
  icon,
  className = '',
  disabled,
  ...restProps
}) => {
  const renderIcon = () => {
    if (loading) {
      return <LoadingOutlined className={styles.loadingIcon} spin />;
    }
    return icon;
  };

  const renderContent = () => {
    if (loading && loadingText) {
      return (
        <span className={styles.buttonContent}>
          {loadingPosition === 'left' && renderIcon()}
          <span>{loadingText}</span>
          {loadingPosition === 'right' && renderIcon()}
        </span>
      );
    }
    if (loadingPosition === 'right' && loading) {
      return (
        <span className={styles.buttonContent}>
          <span>{children}</span>
          {renderIcon()}
        </span>
      );
    }
    return children;
  };

  return (
    <Button
      {...restProps}
      className={`${styles.buttonLoading} ${className}`}
      disabled={disabled || loading}
      icon={loadingPosition === 'left' ? renderIcon() : icon}
      loading={false}
    >
      {renderContent()}
    </Button>
  );
};

export default ButtonLoading;
