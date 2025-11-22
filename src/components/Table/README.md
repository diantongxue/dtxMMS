# 通用表格组件 (CommonTable)

> **注意**：组件开发和使用必须遵循 `宪法.md` 中的规则，特别是第6节代码质量规范、第7节业务逻辑处理规范和第13.1.6节React规范。

通用表格组件，基于 Ant Design Table 封装，提供排序、筛选、分页、虚拟滚动、导出等功能。

## 功能特性

- ✅ 基础功能：排序、筛选、分页
- ✅ 加载状态：骨架屏加载动画
- ✅ 空状态：自定义空状态展示
- ✅ 虚拟滚动：大数据量自动启用虚拟滚动（>100条）
- ✅ 导出功能：支持导出 Excel、CSV、JSON 格式
- ✅ 刷新功能：支持手动刷新数据
- ✅ 响应式设计：适配不同屏幕尺寸
- ✅ 动画效果：所有交互都有平滑的动画效果

## 使用方法

### 基础用法

```tsx
import CommonTable from '@/components/Table';
import type { TableColumnType } from '@/components/Table';

interface DataType {
  id: string;
  name: string;
  age: number;
  address: string;
}

const columns: TableColumnType<DataType>[] = [
  {
    title: '姓名',
    dataIndex: 'name',
    key: 'name',
    sorter: (a, b) => a.name.localeCompare(b.name),
  },
  {
    title: '年龄',
    dataIndex: 'age',
    key: 'age',
    sorter: (a, b) => a.age - b.age,
  },
  {
    title: '地址',
    dataIndex: 'address',
    key: 'address',
  },
];

const dataSource: DataType[] = [
  { id: '1', name: '张三', age: 25, address: '北京市' },
  { id: '2', name: '李四', age: 30, address: '上海市' },
];

function MyComponent() {
  return <CommonTable columns={columns} dataSource={dataSource} rowKey="id" />;
}
```

### 带加载状态

```tsx
const [loading, setLoading] = useState(false);

<CommonTable
  columns={columns}
  dataSource={dataSource}
  loading={loading}
  rowKey="id"
/>;
```

### 启用虚拟滚动

```tsx
// 自动启用（数据量>100时）
<CommonTable
  columns={columns}
  dataSource={largeDataSource}
  enableVirtualScroll={true}
  rowKey="id"
/>

// 手动指定滚动高度
<CommonTable
  columns={columns}
  dataSource={dataSource}
  scroll={{ y: 600 }}
  rowKey="id"
/>
```

### 自定义导出

```tsx
const handleExport = (type: 'excel' | 'csv' | 'json') => {
  // 自定义导出逻辑
  console.log('导出类型:', type);
};

<CommonTable
  columns={columns}
  dataSource={dataSource}
  onExport={handleExport}
  rowKey="id"
/>;
```

### 隐藏导出按钮

```tsx
<CommonTable
  columns={columns}
  dataSource={dataSource}
  showExport={false}
  rowKey="id"
/>
```

### 刷新功能

```tsx
const handleRefresh = () => {
  // 刷新数据
  fetchData();
};

<CommonTable
  columns={columns}
  dataSource={dataSource}
  onRefresh={handleRefresh}
  rowKey="id"
/>;
```

### 自定义空状态

```tsx
<CommonTable
  columns={columns}
  dataSource={[]}
  emptyText="暂无数据"
  emptyDescription="请稍后再试或联系管理员"
  rowKey="id"
/>
```

### 列配置扩展

```tsx
const columns: TableColumnType<DataType>[] = [
  {
    title: '姓名',
    dataIndex: 'name',
    key: 'name',
    exportable: true, // 是否导出（默认true）
    exportTitle: '用户姓名', // 导出时的列名
  },
  {
    title: '密码',
    dataIndex: 'password',
    key: 'password',
    exportable: false, // 不导出敏感信息
  },
];
```

## API

### CommonTableProps

继承 Ant Design Table 的所有 Props，并扩展以下属性：

| 属性                | 说明             | 类型                         | 默认值         |
| ------------------- | ---------------- | ---------------------------- | -------------- |
| columns             | 列配置           | `TableColumnType<T>[]`       | -              |
| dataSource          | 数据源           | `T[]`                        | `[]`           |
| loading             | 加载状态         | `boolean`                    | `false`        |
| showExport          | 是否显示导出按钮 | `boolean`                    | `true`         |
| onExport            | 导出回调         | `(type: ExportType) => void` | -              |
| enableVirtualScroll | 是否启用虚拟滚动 | `boolean`                    | 自动（>100条） |
| virtualRowHeight    | 虚拟滚动行高     | `number`                     | `32`           |
| onRefresh           | 刷新回调         | `() => void`                 | -              |
| emptyText           | 空状态文本       | `string`                     | `'暂无数据'`   |
| emptyDescription    | 空状态描述       | `string`                     | -              |

### TableColumnType

继承 Ant Design ColumnType，并扩展以下属性：

| 属性        | 说明         | 类型      | 默认值  |
| ----------- | ------------ | --------- | ------- |
| exportable  | 是否支持导出 | `boolean` | `true`  |
| exportTitle | 导出时的列名 | `string`  | `title` |

## 样式定制

组件使用 CSS Modules，可以通过覆盖样式类名来自定义样式：

- `.tableContainer` - 表格容器
- `.toolbar` - 工具栏
- `.table` - 表格主体
- `.emptyState` - 空状态

## 注意事项（遵循宪法.md规则）

1. 虚拟滚动在数据量大于100条时自动启用，也可以通过 `enableVirtualScroll` 手动控制（遵循p-rules.md大数据量处理规范）
2. Excel 导出需要额外的库支持，默认只提供接口，需要自定义实现
3. 导出功能会过滤掉 `exportable: false` 的列
4. 所有交互都有动画效果，提升用户体验（遵循宪法.md第4.1节交互效果规范）
5. **类型安全**：所有函数参数和返回值必须有类型定义，禁止使用any类型（遵循宪法.md第13.1.1节TypeScript规范）
6. **错误处理**：所有异步操作必须有错误处理，API调用必须有try-catch（遵循宪法.md第6节错误处理规范）
7. **加载状态**：所有数据加载必须显示加载状态（遵循宪法.md第5节加载状态和过渡效果规范）
8. **边界情况**：必须处理空数据、加载失败、网络错误等情况（遵循宪法.md第7节边界情况处理规范）





