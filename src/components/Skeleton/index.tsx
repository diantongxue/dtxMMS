import {
  Skeleton as AntSkeleton,
  SkeletonProps as AntSkeletonProps,
} from 'antd';
import React from 'react';
import styles from './styles.module.css';

export type SkeletonVariant =
  | 'default'
  | 'card'
  | 'list'
  | 'table'
  | 'paragraph';

interface SkeletonProps
  extends Omit<AntSkeletonProps, 'active' | 'avatar' | 'title' | 'paragraph'> {
  /** 骨架屏变体类型 */
  variant?: SkeletonVariant;
  /** 是否显示动画 */
  active?: boolean;
  /** 是否显示头像 */
  avatar?: boolean;
  /** 是否显示标题 */
  title?: boolean;
  /** 段落行数 */
  rows?: number;
  /** 自定义类名 */
  className?: string;
  /** 是否显示圆角 */
  round?: boolean;
}

/**
 * 通用骨架屏组件
 * 支持多种预设样式和自定义配置
 */
const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'default',
  rows = 3,
  active = true,
  avatar = false,
  title = true,
  className = '',
  round = false,
  ...restProps
}) => {
  const renderSkeleton = () => {
    switch (variant) {
      case 'card':
        return (
          <div className={styles.cardSkeleton}>
            {avatar && <AntSkeleton.Avatar active={active} size="large" />}
            <div className={styles.cardContent}>
              <AntSkeleton
                active={active}
                title={{ width: '60%' }}
                paragraph={{ rows: 2 }}
              />
            </div>
          </div>
        );
      case 'list':
        return (
          <div className={styles.listSkeleton}>
            {Array.from({ length: rows }).map((_, index) => (
              <div key={index} className={styles.listItem}>
                {avatar && (
                  <AntSkeleton.Avatar active={active} size="default" />
                )}
                <div className={styles.listContent}>
                  <AntSkeleton
                    active={active}
                    title={{ width: '40%' }}
                    paragraph={{ rows: 1 }}
                  />
                </div>
              </div>
            ))}
          </div>
        );
      case 'table':
        return (
          <div className={styles.tableSkeleton}>
            <AntSkeleton
              active={active}
              title={{ width: '100%' }}
              paragraph={{ rows: 0 }}
            />
            {Array.from({ length: rows }).map((_, index) => (
              <div key={index} className={styles.tableRow}>
                <AntSkeleton
                  active={active}
                  title={{ width: '100%' }}
                  paragraph={{ rows: 0 }}
                />
              </div>
            ))}
          </div>
        );
      case 'paragraph':
        return (
          <AntSkeleton active={active} title={false} paragraph={{ rows }} />
        );
      case 'default':
      default:
        return (
          <AntSkeleton
            active={active}
            avatar={avatar}
            title={title}
            paragraph={{ rows }}
            {...restProps}
          />
        );
    }
  };

  return (
    <div
      className={`${styles.skeletonContainer} ${styles[variant]} ${
        round ? styles.round : ''
      } ${className}`}
    >
      {renderSkeleton()}
    </div>
  );
};

export default Skeleton;
