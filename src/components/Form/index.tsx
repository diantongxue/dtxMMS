import { ReactNode } from 'react';
import {
  Form as AntForm,
  FormProps as AntFormProps,
  Button,
  Space,
} from 'antd';
import { FormProvider, useForm, FieldValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import styles from './styles.module.css';
import { FormField } from './FormField';

/**
 * 表单按钮配置
 */
export interface FormButtonConfig {
  /** 是否显示提交按钮 */
  showSubmit?: boolean;
  /** 提交按钮文本 */
  submitText?: string;
  /** 是否显示重置按钮 */
  showReset?: boolean;
  /** 重置按钮文本 */
  resetText?: string;
  /** 是否显示取消按钮 */
  showCancel?: boolean;
  /** 取消按钮文本 */
  cancelText?: string;
  /** 自定义按钮 */
  customButtons?: ReactNode;
  /** 按钮布局 */
  buttonLayout?: 'left' | 'center' | 'right';
}

/**
 * 通用表单组件属性
 */
export interface FormProps<T extends FieldValues = FieldValues> {
  /** 表单提交回调 */
  onSubmit: (values: T) => Promise<void> | void;
  /** 表单重置回调 */
  onReset?: () => void;
  /** 取消回调 */
  onCancel?: () => void;
  /** 表单初始值 */
  defaultValues?: Partial<T>;
  /** 表单验证规则（Zod schema） */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schema?: z.ZodType<any, any, any>;
  /** 按钮配置 */
  buttonConfig?: FormButtonConfig;
  /** 表单布局 */
  layout?: 'horizontal' | 'vertical' | 'inline';
  /** 标签宽度 */
  labelCol?: { span: number };
  /** 输入框宽度 */
  wrapperCol?: { span: number };
  /** 是否显示加载状态 */
  loading?: boolean;
  /** 是否禁用表单 */
  disabled?: boolean;
  /** 自定义类名 */
  className?: string;
  /** 表单子元素 */
  children: ReactNode;
  /** Ant Design Form 的其他属性 */
  formProps?: Omit<AntFormProps, 'onFinish' | 'form'>;
  /** 验证模式 */
  mode?: 'onChange' | 'onBlur' | 'onSubmit' | 'onTouched' | 'all';
}

/**
 * 通用表单组件
 */
function Form<T extends FieldValues = FieldValues>({
  onSubmit,
  onReset,
  onCancel,
  defaultValues,
  schema,
  buttonConfig = {},
  layout = 'vertical',
  labelCol,
  wrapperCol,
  loading = false,
  disabled = false,
  className,
  children,
  formProps,
  mode = 'onChange', // 默认实时验证
}: FormProps<T>) {
  // 创建 React Hook Form 实例（遵循宪法.md第13.1.1节TypeScript规范：类型安全）
  const methods = useForm<T>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    defaultValues: defaultValues as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: schema ? (zodResolver(schema) as any) : undefined,
    mode, // 验证模式
  });

  const {
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = methods;

  // 处理表单提交
  const handleFormSubmit = async (values: T) => {
    try {
      await onSubmit(values);
    } catch (error) {
      console.error('Form submit error:', error);
      throw error; // 重新抛出错误，让调用者处理
    }
  };

  // 处理表单重置
  const handleFormReset = () => {
    reset(defaultValues as T);
    onReset?.();
  };

  // 按钮配置默认值
  const {
    showSubmit = true,
    submitText = '提交',
    showReset = true,
    resetText = '重置',
    showCancel = false,
    cancelText = '取消',
    customButtons,
    buttonLayout = 'right',
  } = buttonConfig;

  // 按钮布局样式
  const buttonLayoutClass = {
    left: styles.buttonLeft,
    center: styles.buttonCenter,
    right: styles.buttonRight,
  }[buttonLayout];

  return (
    <FormProvider {...methods}>
      <AntForm
        {...formProps}
        layout={layout}
        labelCol={labelCol}
        wrapperCol={wrapperCol}
        className={`${styles.form} ${className || ''}`}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onFinish={handleSubmit(handleFormSubmit as any)}
      >
        {children}

        {(showSubmit || showReset || showCancel || customButtons) && (
          <AntForm.Item
            className={`${styles.formButtons} ${buttonLayoutClass}`}
          >
            <Space>
              {showSubmit && (
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isSubmitting || loading}
                  disabled={disabled}
                  className={styles.submitButton}
                >
                  {submitText}
                </Button>
              )}
              {showReset && (
                <Button
                  htmlType="button"
                  onClick={handleFormReset}
                  disabled={disabled || isSubmitting || loading}
                  className={styles.resetButton}
                >
                  {resetText}
                </Button>
              )}
              {showCancel && (
                <Button
                  htmlType="button"
                  onClick={onCancel}
                  disabled={disabled || isSubmitting || loading}
                  className={styles.cancelButton}
                >
                  {cancelText}
                </Button>
              )}
              {customButtons}
            </Space>
          </AntForm.Item>
        )}
      </AntForm>
    </FormProvider>
  );
}

export default Form;

/**
 * 导出表单 Hook，方便在子组件中使用
 * 注意：此导出会导致 Fast refresh 警告，但这是必要的工具函数导出
 */
// eslint-disable-next-line react-refresh/only-export-components
export { useFormContext } from 'react-hook-form';

/**
 * 导出表单字段组件
 */
export { FormField };

/**
 * 导出类型（已在接口定义处导出，这里注释掉避免重复导出）
 */
// export type { FormProps, FormButtonConfig };
