/**
 * 通用组件统一导出
 */

// 加载组件
export { default as Loading } from './Loading';
export type { LoadingSize, LoadingType } from './Loading';

// 骨架屏组件
export { default as Skeleton } from './Skeleton';
export type { SkeletonVariant } from './Skeleton';

// 按钮加载组件
export { default as ButtonLoading } from './ButtonLoading';

// Logo组件
export { default as Logo } from './Logo';

// 通用弹窗组件
export { default as Modal, ConfirmModal } from './Modal';
export type { ModalProps, ConfirmModalProps } from './Modal';
