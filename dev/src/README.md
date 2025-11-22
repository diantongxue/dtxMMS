# 通用表单组件 (UI-026)

> **注意**：组件开发和使用必须遵循 `宪法.md` 中的规则，特别是第6节代码质量规范、第7节业务逻辑处理规范和第13.1.6节React规范。

通用表单组件，基于 React Hook Form 和 Ant Design Form，提供实时验证、提交状态和错误提示功能。

## 功能特性

- ✅ **实时验证**：支持 onChange、onBlur 等多种验证模式
- ✅ **表单提交状态**：自动管理提交状态和加载动画
- ✅ **重置功能**：一键重置表单到初始值
- ✅ **错误提示**：友好的错误提示动画
- ✅ **类型安全**：完整的 TypeScript 类型支持
- ✅ **Zod 验证**：支持 Zod schema 验证

## 安装依赖

组件依赖以下包（已自动安装）：

```bash
npm install react-hook-form zod @hookform/resolvers
```

## 基础用法

### 1. 简单表单

```tsx
import Form, { FormField } from '@/components/Form';
import { Input, InputNumber } from 'antd';
import { z } from 'zod';

// 定义验证规则
const schema = z.object({
  username: z.string().min(3, '用户名至少3个字符'),
  age: z.number().min(18, '年龄必须大于18岁'),
});

function MyForm() {
  const handleSubmit = async (values: z.infer<typeof schema>) => {
    console.log('提交数据:', values);
    // 处理提交逻辑
  };

  return (
    <Form
      schema={schema}
      onSubmit={handleSubmit}
      defaultValues={{ username: '', age: 18 }}
    >
      <FormField name="username" label="用户名" required>
        <Input placeholder="请输入用户名" />
      </FormField>

      <FormField name="age" label="年龄" required>
        <InputNumber placeholder="请输入年龄" style={{ width: '100%' }} />
      </FormField>
    </Form>
  );
}
```

### 2. 自定义按钮配置

```tsx
<Form
  schema={schema}
  onSubmit={handleSubmit}
  buttonConfig={{
    showSubmit: true,
    submitText: '保存',
    showReset: true,
    resetText: '清空',
    showCancel: true,
    cancelText: '取消',
    buttonLayout: 'right', // 'left' | 'center' | 'right'
  }}
  onCancel={() => {
    console.log('取消操作');
  }}
>
  {/* 表单字段 */}
</Form>
```

### 3. 不同验证模式

```tsx
// onChange 模式（实时验证，默认）
<Form mode="onChange" onSubmit={handleSubmit}>
  {/* 表单字段 */}
</Form>

// onBlur 模式（失焦验证）
<Form mode="onBlur" onSubmit={handleSubmit}>
  {/* 表单字段 */}
</Form>

// onSubmit 模式（提交时验证）
<Form mode="onSubmit" onSubmit={handleSubmit}>
  {/* 表单字段 */}
</Form>
```

### 4. 使用 Ant Design 组件

```tsx
import { Input, Select, DatePicker, Switch } from 'antd';

<Form schema={schema} onSubmit={handleSubmit}>
  <FormField name="email" label="邮箱" required>
    <Input type="email" placeholder="请输入邮箱" />
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
</Form>;
```

### 5. 自定义验证规则

```tsx
import { z } from 'zod';

const schema = z
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
```

### 6. 表单布局

```tsx
// 垂直布局（默认）
<Form layout="vertical" onSubmit={handleSubmit}>
  {/* 表单字段 */}
</Form>

// 水平布局
<Form
  layout="horizontal"
  labelCol={{ span: 6 }}
  wrapperCol={{ span: 18 }}
  onSubmit={handleSubmit}
>
  {/* 表单字段 */}
</Form>

// 内联布局
<Form layout="inline" onSubmit={handleSubmit}>
  {/* 表单字段 */}
</Form>
```

### 7. 加载状态和禁用

```tsx
<Form
  schema={schema}
  onSubmit={handleSubmit}
  loading={isLoading} // 外部加载状态
  disabled={isDisabled} // 禁用整个表单
>
  {/* 表单字段 */}
</Form>
```

### 8. 在子组件中使用表单上下文

```tsx
import { useFormContext } from '@/components/Form';

function CustomField() {
  const { watch, setValue } = useFormContext();

  const username = watch('username');

  return (
    <FormField name="displayName" label="显示名称">
      <Input
        placeholder="显示名称"
        value={username ? `用户: ${username}` : ''}
        onChange={e => setValue('displayName', e.target.value)}
      />
    </FormField>
  );
}
```

## API 文档

### Form Props

| 属性          | 类型                                                           | 默认值       | 说明                       |
| ------------- | -------------------------------------------------------------- | ------------ | -------------------------- |
| onSubmit      | `(values: T) => Promise<void> \| void`                         | -            | 表单提交回调               |
| onReset       | `() => void`                                                   | -            | 表单重置回调               |
| onCancel      | `() => void`                                                   | -            | 取消回调                   |
| defaultValues | `Partial<T>`                                                   | -            | 表单初始值                 |
| schema        | `z.ZodType<T>`                                                 | -            | Zod 验证规则               |
| buttonConfig  | `FormButtonConfig`                                             | -            | 按钮配置                   |
| layout        | `'horizontal' \| 'vertical' \| 'inline'`                       | `'vertical'` | 表单布局                   |
| labelCol      | `{ span: number }`                                             | -            | 标签宽度                   |
| wrapperCol    | `{ span: number }`                                             | -            | 输入框宽度                 |
| loading       | `boolean`                                                      | `false`      | 加载状态                   |
| disabled      | `boolean`                                                      | `false`      | 禁用状态                   |
| className     | `string`                                                       | -            | 自定义类名                 |
| mode          | `'onChange' \| 'onBlur' \| 'onSubmit' \| 'onTouched' \| 'all'` | `'onChange'` | 验证模式                   |
| formProps     | `AntFormProps`                                                 | -            | Ant Design Form 的其他属性 |

### FormField Props

| 属性             | 类型           | 默认值  | 说明             |
| ---------------- | -------------- | ------- | ---------------- |
| name             | `string`       | -       | 字段名称（必填） |
| label            | `string`       | -       | 字段标签         |
| required         | `boolean`      | `false` | 是否必填         |
| help             | `string`       | -       | 帮助文本         |
| tooltip          | `string`       | -       | 提示信息         |
| validateOnChange | `boolean`      | `true`  | 是否实时验证     |
| validateOnBlur   | `boolean`      | `true`  | 是否失焦验证     |
| children         | `ReactElement` | -       | 字段组件（必填） |

### FormButtonConfig

| 属性          | 类型                            | 默认值    | 说明             |
| ------------- | ------------------------------- | --------- | ---------------- |
| showSubmit    | `boolean`                       | `true`    | 是否显示提交按钮 |
| submitText    | `string`                        | `'提交'`  | 提交按钮文本     |
| showReset     | `boolean`                       | `true`    | 是否显示重置按钮 |
| resetText     | `string`                        | `'重置'`  | 重置按钮文本     |
| showCancel    | `boolean`                       | `false`   | 是否显示取消按钮 |
| cancelText    | `string`                        | `'取消'`  | 取消按钮文本     |
| customButtons | `ReactNode`                     | -         | 自定义按钮       |
| buttonLayout  | `'left' \| 'center' \| 'right'` | `'right'` | 按钮布局         |

## 样式定制

组件使用 CSS Modules，可以通过覆盖样式类名来自定义样式：

- `.form` - 表单容器
- `.formItem` - 表单项
- `.fieldWrapper` - 字段包装器
- `.errorMessage` - 错误消息
- `.formButtons` - 按钮区域
- `.submitButton` - 提交按钮
- `.resetButton` - 重置按钮
- `.cancelButton` - 取消按钮

## 注意事项（遵循宪法.md规则）

1. **必须使用 FormField 包裹输入组件**：所有表单字段必须使用 `FormField` 组件包裹
2. **Zod schema 验证**：推荐使用 Zod 定义验证规则，提供更好的类型安全（遵循宪法.md第13.1.1节TypeScript规范）
3. **实时验证性能**：`onChange` 模式会在每次输入时验证，大数据量表单建议使用 `onBlur` 模式
4. **错误提示动画**：错误提示有淡入动画，提升用户体验（遵循宪法.md第5节过渡动画规范）
5. **响应式设计**：组件支持响应式设计，移动端自动调整布局（遵循宪法.md第4.2节响应式设计规范）
6. **类型安全**：所有函数参数和返回值必须有类型定义，禁止使用any类型（遵循宪法.md第13.1.1节TypeScript规范）
7. **错误处理**：所有异步操作必须有错误处理，API调用必须有try-catch（遵循宪法.md第6节错误处理规范）
8. **表单验证**：表单验证必须完整，数据格式验证必须严格（遵循宪法.md第7节边界情况处理规范）

## 示例代码

完整示例请参考项目中的使用场景。





