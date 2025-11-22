# 滇同学·智慧系统

> **重要提示**：本项目开发必须遵循 `宪法.md` 中的全局规则。项目特定规则请参考 `p-rules.md`。如遇冲突，以 `宪法.md` 为准。

## 项目简介

这是一套公司内部使用的智慧管理系统，主要功能包括：
1. 内部OA系统
2. 电商后台管理（多平台账号登录和管理）
3. 手机APP控制和数据采集（通过Appium控制安卓手机，透明代理获取数据）

## 技术栈

- **前端**：React 19 + Vite + TypeScript + Ant Design 5.x
- **桌面应用**：Electron最新版
- **后端**：NestJS + TypeScript + Prisma
- **数据库**：SQLite（测试期）→ PostgreSQL（后期）
- **浏览器控制**：Playwright
- **手机控制**：Appium
- **代理**：mitmproxy或自研
- **图表**：AntV G2 + ECharts
- **小程序**：Taro

## 开发环境要求

- Node.js >= 18.0.0
- npm >= 9.0.0

## 安装依赖

```bash
npm install
```

## 开发命令

### Web开发模式
```bash
npm run dev
```

### Electron开发模式
```bash
npm run electron:dev
```

### 构建

#### 构建Web版本
```bash
npm run build
```

#### 构建Electron应用（所有平台）
```bash
npm run electron:build
```

#### 构建Windows安装包
```bash
npm run electron:build:win
```

#### 构建Mac安装包
```bash
npm run electron:build:mac
```

## 代码规范

### 代码检查
```bash
npm run lint
```

### 自动修复代码
```bash
npm run lint:fix
```

### 代码格式化
```bash
npm run format
```

### 检查代码格式
```bash
npm run format:check
```

## 项目结构

```
├── src/                    # 源代码目录
│   ├── components/         # 组件目录
│   ├── pages/              # 页面目录
│   ├── styles/             # 样式文件
│   ├── utils/              # 工具函数
│   ├── App.tsx             # 根组件
│   └── main.tsx            # 入口文件
├── electron/               # Electron主进程代码
│   ├── main.ts             # 主进程入口
│   └── preload.ts          # 预加载脚本
├── public/                 # 静态资源
├── dist/                   # 构建输出目录
├── dist-electron/          # Electron构建输出
└── release/                # 打包输出目录
```

## 开发规范

> **注意**：所有开发规范必须遵循 `宪法.md` 中的规则。以下为补充说明。

### 代码规范（遵循宪法.md第6节）
- **文件命名**：小写字母和连字符，如 `user-profile.tsx`
- **组件命名**：PascalCase，如 `UserProfile`（遵循宪法.md第13.1.6节React组件规范）
- **函数命名**：camelCase，如 `getUserData`
- **常量命名**：UPPER_SNAKE_CASE，如 `MAX_RETRY_COUNT`
- **类型安全**：所有函数参数和返回值必须有类型定义，禁止使用any类型（遵循宪法.md第13.1.1节TypeScript规范）
- **代码分割**：组件文件不超过300行，超过必须拆分（遵循宪法.md第3.3节代码分割规则）

### 模块独立性（遵循宪法.md第3节）
- **业务模块严格隔离**：所有业务模块之间严格隔离，不允许共享代码或样式
- **修改原则**：修改代码时，只修改当前开发模块相关的文件；不要修改已完成的模块代码，除非明确要求
- **新增原则**：新增功能时，优先创建新文件/新组件，而不是修改现有文件

## 视觉规范（遵循p-rules.md）

- **主色调**：`#3964fe`（蓝色）
- **辅助色**：成功`#52c41a`、警告`#faad14`、错误`#ff4d4f`
- **背景色**：`#f5f5f5`
- **文字色**：`#333333`、`#666666`、`#999999`
- **Logo使用**：系统统一使用"滇同学"logo，详细规范请参考 `p-rules.md`

## 开发进度

> **注意**：开发必须严格按照 `开发文档.md` 中的模块顺序开发，遵循宪法.md第11.1节开发流程规范。

- [x] UI-001：项目初始化和基础配置
- [ ] UI-002：登录页面
- [ ] UI-003：主页面框架
- [ ] ...（更多模块开发中）

详细开发计划请参考 `开发文档.md`

## License

Copyright © 2024 滇同学·智慧系统

