# Git使用说明

## 一、仓库初始化

### 1.1 创建GitHub仓库
- 仓库名称：`dtxMMS`
- 登录GitHub → 新建仓库 → 输入 `dtxMMS`

### 1.2 本地初始化
```bash
cd "/Users/mac/Desktop/滇同学·智慧系统"
git init
git remote add origin https://github.com/YOUR_USERNAME/dtxMMS.git
git add .
git commit -m "feat: 初始化项目"
git push -u origin main
```

## 二、日常开发流程

```bash
# 1. 创建功能分支
git checkout -b feature/UI-001-项目初始化

# 2. 开发功能后提交
git add .
git commit -m "feat(UI-001): 完成项目初始化"

# 3. 推送到远程
git push origin feature/UI-001-项目初始化

# 4. 在GitHub上创建Pull Request
# 5. 代码审查通过后合并到main分支
```

## 三、提交信息规范

```
<type>(<scope>): <subject>
```

**Type类型**：
- `feat`: 新功能
- `fix`: 修复bug
- `docs`: 文档更新
- `style`: 代码格式
- `ui`: UI界面相关

**示例**：
```bash
git commit -m "feat(UI-002): 完成登录页面UI开发"
git commit -m "fix(UI-003): 修复Tab切换动画问题"
```

## 四、自动提交

已配置GitHub Actions自动提交，会在以下情况自动提交：
- 手动触发（GitHub → Actions → Auto Commit → Run workflow）
- 定时触发（每天凌晨2点，可在`.github/workflows/auto-commit.yml`中调整）

## 五、注意事项

1. **不要提交敏感信息**：.env、密钥等文件已在.gitignore中
2. **使用分支开发**：不要在main分支直接开发
3. **提交前测试**：确保代码可以正常运行
4. **频繁提交**：每完成一个小功能就提交
