#!/bin/bash

# 自动提交脚本
# 使用方法: ./scripts/auto-commit.sh [commit-message]
# 仓库: dtxMMS

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 获取提交信息
COMMIT_MSG=${1:-"chore: auto-commit [$(date +'%Y-%m-%d %H:%M:%S')]"}

echo -e "${YELLOW}开始自动提交...${NC}"

# 检查是否在Git仓库中
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${RED}错误: 当前目录不是Git仓库${NC}"
    exit 1
fi

# 添加所有修改
echo -e "${YELLOW}添加所有修改...${NC}"
git add -A

# 检查是否有修改
if [ -z "$(git status --porcelain)" ]; then
    echo -e "${GREEN}没有需要提交的修改${NC}"
    exit 0
fi

# 显示修改的文件
echo -e "${YELLOW}修改的文件:${NC}"
git status --short

# 提交修改
echo -e "${YELLOW}提交修改...${NC}"
git commit -m "$COMMIT_MSG"

# 检查提交是否成功
if [ $? -eq 0 ]; then
    echo -e "${GREEN}提交成功: $COMMIT_MSG${NC}"
    
    # 推送到远程
    echo -e "${YELLOW}推送到远程仓库...${NC}"
    git push
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}推送成功！${NC}"
    else
        echo -e "${RED}推送失败，请检查网络连接或远程仓库配置${NC}"
        exit 1
    fi
else
    echo -e "${RED}提交失败${NC}"
    exit 1
fi

echo -e "${GREEN}自动提交完成！${NC}"

