import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Modal as AntModal, Button, Spin } from 'antd';
import type { ModalProps as AntModalProps } from 'antd';
import styles from './styles.module.css';

export interface ModalProps extends Omit<AntModalProps, 'open' | 'visible'> {
  /** 是否显示弹窗 */
  open?: boolean;
  /** 是否可拖拽 */
  draggable?: boolean;
  /** 是否显示加载状态 */
  loading?: boolean;
  /** 确认按钮文本 */
  confirmText?: string;
  /** 取消按钮文本 */
  cancelText?: string;
  /** 是否显示确认按钮 */
  showConfirm?: boolean;
  /** 是否显示取消按钮 */
  showCancel?: boolean;
  /** 确认按钮点击回调 */
  onConfirm?: () => void | Promise<void>;
  /** 取消按钮点击回调 */
  onCancel?: () => void;
  /** 弹窗内容 */
  children?: React.ReactNode;
}

/**
 * 通用弹窗组件
 * 支持拖拽、加载状态、确认对话框等功能
 */
const Modal: React.FC<ModalProps> = ({
  open = false,
  draggable = false,
  loading = false,
  confirmText = '确认',
  cancelText = '取消',
  showConfirm = true,
  showCancel = true,
  onConfirm,
  onCancel,
  children,
  className = '',
  footer,
  ...restProps
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const dragStateRef = useRef({
    isDragging: false,
    startX: 0,
    startY: 0,
    offsetX: 0,
    offsetY: 0,
  });

  // 处理弹窗显示/隐藏动画
  useEffect(() => {
    if (open) {
      setIsVisible(true);
      // 延迟一帧以确保动画生效
      requestAnimationFrame(() => {
        setIsAnimating(true);
      });
    } else {
      setIsAnimating(false);
      // 等待动画完成后再隐藏
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [open]);

  // 拖拽功能
  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!draggable || !headerRef.current) return;

      e.preventDefault();
      dragStateRef.current.isDragging = true;
      dragStateRef.current.startX = e.clientX;
      dragStateRef.current.startY = e.clientY;

      const modalElement = modalRef.current?.querySelector(
        '.ant-modal'
      ) as HTMLElement;
      if (modalElement) {
        const rect = modalElement.getBoundingClientRect();
        dragStateRef.current.offsetX = e.clientX - rect.left;
        dragStateRef.current.offsetY = e.clientY - rect.top;
      }
    },
    [draggable]
  );

  useEffect(() => {
    if (!draggable || !isVisible) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragStateRef.current.isDragging || !modalRef.current) return;

      const modalElement = modalRef.current.querySelector(
        '.ant-modal'
      ) as HTMLElement;
      if (!modalElement) return;

      // 如果是第一次拖拽，需要初始化位置
      if (!dragStateRef.current.offsetX && !dragStateRef.current.offsetY) {
        const rect = modalElement.getBoundingClientRect();
        dragStateRef.current.offsetX = e.clientX - rect.left;
        dragStateRef.current.offsetY = e.clientY - rect.top;
      }

      const deltaX = e.clientX - dragStateRef.current.startX;
      const deltaY = e.clientY - dragStateRef.current.startY;

      // 获取当前弹窗位置（如果是居中，需要计算）
      const rect = modalElement.getBoundingClientRect();
      let currentX = rect.left;
      let currentY = rect.top;

      // 如果弹窗是居中状态，计算初始位置
      if (modalElement.style.left === '' && modalElement.style.top === '') {
        currentX = (window.innerWidth - rect.width) / 2;
        currentY = (window.innerHeight - rect.height) / 2;
      }

      const newX = currentX + deltaX;
      const newY = currentY + deltaY;

      // 限制拖拽范围，不能拖出视口
      const maxX = window.innerWidth - rect.width;
      const maxY = window.innerHeight - rect.height;

      const constrainedX = Math.max(0, Math.min(newX, maxX));
      const constrainedY = Math.max(0, Math.min(newY, maxY));

      modalElement.style.position = 'fixed';
      modalElement.style.left = `${constrainedX}px`;
      modalElement.style.top = `${constrainedY}px`;
      modalElement.style.margin = '0';
      modalElement.style.transform = 'none';

      dragStateRef.current.startX = e.clientX;
      dragStateRef.current.startY = e.clientY;
    };

    const handleMouseUp = () => {
      dragStateRef.current.isDragging = false;
      // 重置偏移量，下次拖拽时重新计算
      dragStateRef.current.offsetX = 0;
      dragStateRef.current.offsetY = 0;
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggable, isVisible]);

  // 处理确认按钮点击
  const handleConfirm = useCallback(async () => {
    if (onConfirm) {
      await onConfirm();
    }
  }, [onConfirm]);

  // 处理取消按钮点击
  const handleCancel = useCallback(() => {
    if (onCancel) {
      onCancel();
    }
  }, [onCancel]);

  // 自定义footer
  const renderFooter = () => {
    if (footer === null) return null;
    if (footer !== undefined) return footer;

    return (
      <div className={styles.footer}>
        {showCancel && (
          <Button onClick={handleCancel} disabled={loading}>
            {cancelText}
          </Button>
        )}
        {showConfirm && (
          <Button type="primary" onClick={handleConfirm} loading={loading}>
            {confirmText}
          </Button>
        )}
      </div>
    );
  };

  if (!isVisible) return null;

  return (
    <div
      ref={modalRef}
      className={`${styles.modalWrapper} ${isAnimating ? styles.visible : ''} ${className}`}
    >
      <AntModal
        {...restProps}
        open={isVisible}
        onCancel={handleCancel}
        footer={renderFooter()}
        className={`${styles.modal} ${draggable ? styles.draggable : ''}`}
        maskClosable={!loading}
        closable={!loading}
        destroyOnClose
      >
        {draggable && (
          <div
            ref={headerRef}
            className={styles.dragHandle}
            onMouseDown={handleMouseDown}
          >
            <div className={styles.dragIcon}>⋮⋮</div>
          </div>
        )}
        {loading && (
          <div className={styles.loadingOverlay}>
            <Spin size="large" tip="加载中..." />
          </div>
        )}
        <div className={loading ? styles.contentLoading : ''}>{children}</div>
      </AntModal>
    </div>
  );
};

/**
 * 确认对话框
 */
export interface ConfirmModalProps {
  /** 是否显示 */
  open?: boolean;
  /** 标题 */
  title?: string;
  /** 内容 */
  content?: React.ReactNode;
  /** 确认按钮文本 */
  confirmText?: string;
  /** 取消按钮文本 */
  cancelText?: string;
  /** 确认按钮类型 */
  confirmType?: 'default' | 'primary' | 'danger';
  /** 确认回调 */
  onConfirm?: () => void | Promise<void>;
  /** 取消回调 */
  onCancel?: () => void;
  /** 是否显示加载状态 */
  loading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  open = false,
  title = '确认操作',
  content = '确定要执行此操作吗？',
  confirmText = '确认',
  cancelText = '取消',
  // confirmType 参数保留用于未来扩展，目前未使用
  // confirmType = 'primary',
  onConfirm,
  onCancel,
  loading = false,
}) => {
  return (
    <Modal
      open={open}
      title={title}
      onConfirm={onConfirm}
      onCancel={onCancel}
      loading={loading}
      confirmText={confirmText}
      cancelText={cancelText}
      width={420}
      centered
    >
      <div className={styles.confirmContent}>{content}</div>
    </Modal>
  );
};

export default Modal;
