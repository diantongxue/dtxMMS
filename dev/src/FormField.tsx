import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { Form as AntForm, FormItemProps } from 'antd';
import styles from './styles.module.css';

/**
 * 表单字段组件属性
 */
export interface FormFieldProps extends Omit<FormItemProps, 'name'> {
  /** 字段名称 */
  name: string;
  /** 字段组件 */
  children: React.ReactElement;
  /** 是否实时验证 */
  validateOnChange?: boolean;
  /** 是否在失焦时验证 */
  validateOnBlur?: boolean;
}

/**
 * 表单字段组件
 * 集成 React Hook Form 和 Ant Design Form
 * 遵循宪法.md第13.1.6节React规范：函数式组件、类型安全
 */
export const FormField: React.FC<FormFieldProps> = ({
  name,
  children,
  validateOnChange = true,
  validateOnBlur = true,
  ...formItemProps
}) => {
  const {
    control,
    formState: { errors },
    trigger,
  } = useFormContext();

  // 遵循宪法.md第13.1.1节TypeScript规范：必须处理可能为null或undefined的值
  const error = errors[name];
  const hasError = Boolean(error);

  return (
    <AntForm.Item
      {...formItemProps}
      validateStatus={hasError ? 'error' : ''}
      help={hasError ? (error?.message as string) : formItemProps.help}
      className={styles.formItem}
    >
      <Controller
        name={name}
        control={control}
        render={({ field }) => {
          // 处理不同类型的输入组件（遵循宪法.md第6节错误处理规范）
          const handleChange = (
            e: React.ChangeEvent<HTMLInputElement> | unknown
          ): void => {
            try {
              const value =
                (e as React.ChangeEvent<HTMLInputElement>)?.target?.value !==
                undefined
                  ? (e as React.ChangeEvent<HTMLInputElement>).target.value
                  : e;
              field.onChange(value);
              if (validateOnChange) {
                // 触发验证
                trigger(name).catch((error: unknown) => {
                  console.error('Validation trigger failed:', error);
                });
              }
              children.props.onChange?.(e);
            } catch (error) {
              console.error('Form field change handler error:', error);
            }
          };

          const handleBlur = (
            e: React.FocusEvent<HTMLInputElement> | unknown
          ): void => {
            try {
              field.onBlur();
              if (validateOnBlur) {
                // 触发验证
                trigger(name).catch((error: unknown) => {
                  console.error('Validation trigger failed:', error);
                });
              }
              children.props.onBlur?.(e);
            } catch (error) {
              console.error('Form field blur handler error:', error);
            }
          };

          // 克隆子元素并注入 field 属性
          const childElement = React.cloneElement(children, {
            ...field,
            ...children.props,
            value: field.value ?? '',
            status: hasError ? 'error' : undefined,
            onChange: handleChange,
            onBlur: handleBlur,
          });

          return (
            <div className={styles.fieldWrapper}>
              {childElement}
              {hasError && (
                <div className={`${styles.errorMessage} ${styles.show}`}>
                  {error?.message as string}
                </div>
              )}
            </div>
          );
        }}
      />
    </AntForm.Item>
  );
};

export default FormField;
