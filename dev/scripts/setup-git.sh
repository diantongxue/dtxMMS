#!/bin/bash

# Git仓库配置脚本
# 使用方法: ./scripts/setup-git.sh YOUR_GITHUB_USERNAME

GITHUB_USERNAME=$1
GITHUB_TOKEN="${GITHUB_TOKEN:-}"  # 从环境变量读取，不要硬编码
REPO_NAME="dtxMMS"

if [ -z "$GITHUB_USERNAME" ]; then
    echo "错误: 请提供GitHub用户名"
    echo "使用方法: ./scripts/setup-git.sh YOUR_GITHUB_USERNAME"
    exit 1
fi

echo "配置Git仓库..."
echo "GitHub用户名: $GITHUB_USERNAME"
echo "仓库名称: $REPO_NAME"

# 移除旧的远程仓库
git remote remove origin 2>/dev/null

# 检查token是否存在
if [ -z "$GITHUB_TOKEN" ]; then
    echo "错误: 请设置GITHUB_TOKEN环境变量"
    echo "使用方法: export GITHUB_TOKEN=your_token && ./scripts/setup-git.sh YOUR_USERNAME"
    exit 1
fi

# 添加新的远程仓库（使用token）
git remote add origin "https://${GITHUB_TOKEN}@github.com/${GITHUB_USERNAME}/${REPO_NAME}.git"

# 配置credential helper（可选，更安全）
git config credential.helper store
echo "https://${GITHUB_USERNAME}:${GITHUB_TOKEN}@github.com" > ~/.git-credentials

echo "远程仓库配置完成！"
echo ""
echo "下一步："
echo "1. 确保GitHub上已创建仓库: $REPO_NAME"
echo "2. 运行: git push -u origin main"


