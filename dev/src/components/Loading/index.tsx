import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import React from 'react';
import styles from './styles.module.css';

export type LoadingSize = 'small' | 'default' | 'large';
export type LoadingType = 'spinner' | 'dots' | 'wave' | 'pulse';

interface LoadingProps {
  /** 加载尺寸 */
  size?: LoadingSize;
  /** 加载提示文字 */
  tip?: string;
  /** 是否全屏显示 */
  fullScreen?: boolean;
  /** 加载类型 */
  type?: LoadingType;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 是否显示背景遮罩 */
  mask?: boolean;
}

/**
 * 通用加载组件
 * 支持多种加载动画样式和配置选项
 */
const Loading: React.FC<LoadingProps> = ({
  size = 'default',
  tip = '加载中...',
  fullScreen = false,
  type = 'spinner',
  className = '',
  style,
  mask = true,
}) => {
  const renderLoadingContent = () => {
    switch (type) {
      case 'dots':
        return (
          <div className={styles.dotsLoader}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        );
      case 'wave':
        return (
          <div className={styles.waveLoader}>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
          </div>
        );
      case 'pulse':
        return <div className={styles.pulseLoader}></div>;
      case 'spinner':
      default:
        return (
          <Spin
            size={size}
            tip={tip}
            indicator={
              <LoadingOutlined
                style={{ fontSize: 24, color: '#3964fe' }}
                spin
              />
            }
          />
        );
    }
  };

  return (
    <div
      className={`${styles.loadingContainer} ${fullScreen ? styles.fullScreen : ''} ${
        !mask ? styles.noMask : ''
      } ${className}`}
      style={style}
    >
      <div className={styles.loadingContent}>
        {renderLoadingContent()}
        {tip && type !== 'spinner' && (
          <div className={styles.loadingTip}>{tip}</div>
        )}
      </div>
    </div>
  );
};

export default Loading;
