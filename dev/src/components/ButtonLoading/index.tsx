import React from 'react';
import { Button, ButtonProps } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import styles from './styles.module.css';

/**
 * 按钮加载组件Props
 * 遵循宪法.md第13.1.1节TypeScript规范：所有函数参数和返回值必须有类型定义
 */
export interface ButtonLoadingProps extends ButtonProps {
  /** 是否显示加载状态 */
  loading?: boolean;
  /** 加载时显示的文本 */
  loadingText?: string;
}

/**
 * 按钮加载组件
 * 遵循宪法.md第13.1.6节React规范：函数式组件、类型安全
 */
const ButtonLoading: React.FC<ButtonLoadingProps> = ({
  loading = false,
  loadingText,
  children,
  disabled,
  ...restProps
}) => {
  return (
    <Button
      {...restProps}
      disabled={disabled || loading}
      className={`${styles.buttonLoading} ${restProps.className || ''}`}
    >
      {loading && <LoadingOutlined className={styles.loadingIcon} spin />}
      {loading ? loadingText || children : children}
    </Button>
  );
};

export default ButtonLoading;

