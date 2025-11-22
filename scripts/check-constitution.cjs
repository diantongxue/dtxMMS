#!/usr/bin/env node

/**
 * 宪法规则检查脚本
 * 在开发过程中自动检查代码是否符合宪法规则
 */

const fs = require('fs');
const path = require('path');

// 简化的检查器（Node.js版本）
class SimpleConstitutionChecker {
  constructor() {
    this.constitutionPath = path.join(__dirname, '..', '宪法.md');
    this.constitutionContent = '';
    this.loadConstitution();
  }

  loadConstitution() {
    try {
      this.constitutionContent = fs.readFileSync(this.constitutionPath, 'utf-8');
    } catch (error) {
      console.error(`❌ 无法加载宪法文件: ${this.constitutionPath}`);
      process.exit(1);
    }
  }

  checkBeforeAction(action, context = {}) {
    const errors = [];
    const warnings = [];

    // 检查需求确认
    if ((action === 'write_code' || action === 'create_file') && !context.requirementConfirmed) {
      errors.push({
        rule: '功能开发前需求确认',
        message: '⚠️  在需求确认前就开始编码，违反宪法规则。必须先通过问答确认需求。'
      });
    }

    // 检查规则更新
    if (action === 'update_constitution' && !context.immediateUpdate) {
      errors.push({
        rule: '规则更新',
        message: '⚠️  规则更新必须立即执行，禁止延迟更新'
      });
    }

    // 检查模块独立性
    if (action === 'modify_file' && context.affectsOtherModules) {
      errors.push({
        rule: '模块独立性',
        message: '⚠️  修改可能影响其他模块，违反模块独立性原则'
      });
    }

    if (errors.length > 0) {
      console.log('\n❌ 宪法规则检查失败：\n');
      errors.forEach(e => console.log(`  - [${e.rule}] ${e.message}`));
      console.log('\n请先解决这些问题，然后再继续下一步操作。\n');
      return false;
    }

    if (warnings.length > 0) {
      console.log('\n⚠️  宪法规则检查警告：\n');
      warnings.forEach(w => console.log(`  - [${w.rule}] ${w.message}`));
      console.log();
    }

    return true;
  }

  checkCodeFile(filePath) {
    if (!fs.existsSync(filePath)) {
      return { passed: false, errors: [`文件不存在: ${filePath}`] };
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const errors = [];
    const warnings = [];
    const fileExt = path.extname(filePath);

    // 检查TypeScript any类型
    if ((fileExt === '.ts' || fileExt === '.tsx') && /\bany\b/.test(content)) {
      const matches = content.match(/\bany\b/g);
      errors.push(`发现 ${matches.length} 处使用any类型，违反宪法规则`);
    }

    // 检查错误处理
    if (content.includes('await') && !/try\s*\{[\s\S]*await/i.test(content)) {
      warnings.push('异步操作建议添加try-catch错误处理');
    }

    // 检查CSS Modules
    if ((fileExt === '.tsx' || fileExt === '.jsx')) {
      if (/import\s+['"]\.\/.*\.css['"]/.test(content) && 
          !/import\s+.*from\s+['"]\.\/.*\.module\.css['"]/.test(content)) {
        errors.push('使用了全局CSS，应该使用CSS Modules');
      }
    }

    return {
      passed: errors.length === 0,
      errors,
      warnings
    };
  }
}

// 导出检查器
const checker = new SimpleConstitutionChecker();

// 如果作为模块导入
if (require.main !== module) {
  module.exports = checker;
} else {
  // 命令行使用
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.log('用法: node check-constitution.js <action> [file]');
    console.log('示例: node check-constitution.js write_code');
    console.log('示例: node check-constitution.js check_file src/App.tsx');
    process.exit(0);
  }

  const action = args[0];
  
  if (action === 'check_file' && args[1]) {
    const result = checker.checkCodeFile(args[1]);
    if (result.passed) {
      console.log('✅ 文件检查通过');
      if (result.warnings.length > 0) {
        console.log('⚠️  警告:');
        result.warnings.forEach(w => console.log(`  - ${w}`));
      }
    } else {
      console.log('❌ 文件检查失败:');
      result.errors.forEach(e => console.log(`  - ${e}`));
      process.exit(1);
    }
  } else {
    const context = {};
    if (action === 'write_code') {
      context.requirementConfirmed = process.env.REQUIREMENT_CONFIRMED === 'true';
    }
    
    const passed = checker.checkBeforeAction(action, context);
    if (!passed) {
      process.exit(1);
    }
  }
}

