# 宪法规则检查工具

## 功能说明

这个工具用于检查AI编写的代码和编程流程是否符合`宪法.md`的要求。

## 使用方法

### 1. TypeScript版本（推荐）

```typescript
import ConstitutionChecker from './scripts/constitution-checker';

const checker = new ConstitutionChecker();

// 检查代码文件
const results = checker.checkCodeFile('src/App.tsx');
results.forEach(result => {
  if (!result.passed) {
    console.log(`❌ [${result.rule}] ${result.message}`);
  }
});

// 在执行下一个动作前检查
const canContinue = await checker.checkBeforeNextAction('write_code', {
  requirementConfirmed: true
});

if (!canContinue) {
  // 停止执行，提醒用户
  return;
}
```

### 2. Node.js版本（命令行）

```bash
# 检查开发流程
node scripts/check-constitution.js write_code

# 检查文件
node scripts/check-constitution.js check_file src/App.tsx

# 设置环境变量（表示需求已确认）
REQUIREMENT_CONFIRMED=true node scripts/check-constitution.js write_code
```

## 检查规则

### 1. 代码质量检查
- ✅ TypeScript类型安全（禁止any类型）
- ✅ 错误处理（异步操作必须有try-catch）
- ✅ CSS Modules使用（禁止全局CSS）

### 2. 开发流程检查
- ✅ 需求确认（开发前必须先确认需求）
- ✅ 规则更新（必须立即更新，禁止延迟）
- ✅ 模块独立性（禁止影响其他模块）

### 3. 依赖版本检查
- ✅ 版本选择原则（原则上使用最新稳定版本）

## 集成到开发流程

### 在AI开发流程中使用

1. **开发前检查**：
```javascript
// 在开始编码前
const checker = new ConstitutionChecker();
const canStart = await checker.checkBeforeNextAction('write_code', {
  requirementConfirmed: false // 如果未确认，会阻止继续
});
```

2. **代码检查**：
```javascript
// 在创建/修改文件后
const results = checker.checkCodeFile('src/components/Button.tsx');
if (results.some(r => !r.passed && r.severity === 'error')) {
  // 阻止继续，要求修复
}
```

3. **生成报告**：
```javascript
const report = checker.generateReport(['src/App.tsx', 'src/components/Button.tsx']);
console.log(report);
```

## 注意事项

- 检查器会在执行下一个动作前自动提醒
- 错误级别的问题会阻止继续操作
- 警告级别的问题会提醒但允许继续
- 所有检查都基于`宪法.md`文件的内容

