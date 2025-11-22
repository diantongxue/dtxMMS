/**
 * 通用表单组件使用示例
 * 此文件仅作为示例参考，不会在项目中使用
 */

import React from 'react';
import { Input, InputNumber, Select, DatePicker, Switch } from 'antd';
import Form, { FormField } from './index';
import { z } from 'zod';

// 示例 1: 基础表单
const basicSchema = z.object({
  username: z.string().min(3, '用户名至少3个字符'),
  email: z.string().email('请输入有效的邮箱地址'),
});

export const BasicFormExample: React.FC = () => {
  const handleSubmit = async (values: z.infer<typeof basicSchema>) => {
    console.log('提交数据:', values);
    // 模拟 API 调用
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  return (
    <Form
      schema={basicSchema}
      onSubmit={handleSubmit}
      defaultValues={{ username: '', email: '' }}
    >
      <FormField name="username" label="用户名" required>
        <Input placeholder="请输入用户名" />
      </FormField>

      <FormField name="email" label="邮箱" required>
        <Input type="email" placeholder="请输入邮箱" />
      </FormField>
    </Form>
  );
};

// 示例 2: 复杂表单（包含多种输入类型）
const complexSchema = z.object({
  name: z.string().min(2, '姓名至少2个字符'),
  age: z.number().min(18, '年龄必须大于18岁').max(100, '年龄不能超过100岁'),
  gender: z.enum(['male', 'female'] as const),
  birthday: z.date().optional(),
  active: z.boolean(),
  description: z.string().max(500, '描述不能超过500个字符').optional(),
});

export const ComplexFormExample: React.FC = () => {
  const handleSubmit = async (values: z.infer<typeof complexSchema>) => {
    console.log('提交数据:', values);
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  return (
    <Form
      schema={complexSchema}
      onSubmit={handleSubmit}
      defaultValues={{
        name: '',
        age: 18,
        gender: undefined,
        active: false,
        description: '',
      }}
      layout="horizontal"
      labelCol={{ span: 6 }}
      wrapperCol={{ span: 18 }}
    >
      <FormField name="name" label="姓名" required>
        <Input placeholder="请输入姓名" />
      </FormField>

      <FormField name="age" label="年龄" required>
        <InputNumber
          placeholder="请输入年龄"
          style={{ width: '100%' }}
          min={18}
          max={100}
        />
      </FormField>

      <FormField name="gender" label="性别" required>
        <Select placeholder="请选择性别">
          <Select.Option value="male">男</Select.Option>
          <Select.Option value="female">女</Select.Option>
        </Select>
      </FormField>

      <FormField name="birthday" label="生日">
        <DatePicker style={{ width: '100%' }} />
      </FormField>

      <FormField name="active" label="是否激活">
        <Switch />
      </FormField>

      <FormField name="description" label="描述" help="最多500个字符">
        <Input.TextArea rows={4} placeholder="请输入描述" maxLength={500} showCount />
      </FormField>
    </Form>
  );
};

// 示例 3: 自定义按钮配置
export const CustomButtonFormExample: React.FC = () => {
  const handleSubmit = async (values: z.infer<typeof basicSchema>) => {
    console.log('提交数据:', values);
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  const handleCancel = () => {
    console.log('取消操作');
  };

  return (
    <Form
      schema={basicSchema}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      buttonConfig={{
        showSubmit: true,
        submitText: '保存',
        showReset: true,
        resetText: '清空',
        showCancel: true,
        cancelText: '取消',
        buttonLayout: 'right',
      }}
      defaultValues={{ username: '', email: '' }}
    >
      <FormField name="username" label="用户名" required>
        <Input placeholder="请输入用户名" />
      </FormField>

      <FormField name="email" label="邮箱" required>
        <Input type="email" placeholder="请输入邮箱" />
      </FormField>
    </Form>
  );
};

// 示例 4: 密码确认验证
const passwordSchema = z
  .object({
    password: z
      .string()
      .min(6, '密码至少6个字符')
      .regex(/[A-Z]/, '密码必须包含大写字母')
      .regex(/[a-z]/, '密码必须包含小写字母')
      .regex(/[0-9]/, '密码必须包含数字'),
    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: '两次密码输入不一致',
    path: ['confirmPassword'],
  });

export const PasswordFormExample: React.FC = () => {
  const handleSubmit = async (values: z.infer<typeof passwordSchema>) => {
    console.log('提交数据:', values);
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  return (
    <Form
      schema={passwordSchema}
      onSubmit={handleSubmit}
      defaultValues={{ password: '', confirmPassword: '' }}
    >
      <FormField name="password" label="密码" required>
        <Input.Password placeholder="请输入密码" />
      </FormField>

      <FormField name="confirmPassword" label="确认密码" required>
        <Input.Password placeholder="请再次输入密码" />
      </FormField>
    </Form>
  );
};

// 示例 5: 不同验证模式
export const ValidationModeExample: React.FC = () => {
  const handleSubmit = async (values: z.infer<typeof basicSchema>) => {
    console.log('提交数据:', values);
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  return (
    <Form
      schema={basicSchema}
      onSubmit={handleSubmit}
      mode="onBlur" // 失焦时验证
      defaultValues={{ username: '', email: '' }}
    >
      <FormField name="username" label="用户名" required>
        <Input placeholder="请输入用户名" />
      </FormField>

      <FormField name="email" label="邮箱" required>
        <Input type="email" placeholder="请输入邮箱" />
      </FormField>
    </Form>
  );
};
