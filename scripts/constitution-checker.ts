/**
 * 宪法规则检查器
 * 用于检查AI编写的代码和编程流程是否符合宪法.md的要求
 */

import fs from 'fs';
import path from 'path';

interface RuleCheckResult {
  passed: boolean;
  rule: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

interface ConstitutionRules {
  // 自动应用规则
  autoApply: boolean;
  
  // 沟通确认规则
  questionFormat: boolean;
  ruleUpdate: boolean;
  
  // 模块独立性规则
  moduleIsolation: boolean;
  
  // UI/交互规则
  uiBeauty: boolean;
  animationEffects: boolean;
  
  // 代码质量规则
  typeSafety: boolean;
  errorHandling: boolean;
  
  // 技术栈规则
  useLatestVersion: boolean;
  [key: string]: boolean | undefined;
}

class ConstitutionChecker {
  private constitutionPath: string;
  private constitutionContent: string;
  private rules: ConstitutionRules;

  constructor(constitutionPath: string = '宪法.md') {
    this.constitutionPath = constitutionPath;
    this.constitutionContent = '';
    this.rules = {
      autoApply: false,
      questionFormat: false,
      ruleUpdate: false,
      moduleIsolation: false,
      uiBeauty: false,
      animationEffects: false,
      typeSafety: false,
      errorHandling: false,
      useLatestVersion: false,
    };
    this.loadConstitution();
  }

  /**
   * 加载宪法文件
   */
  private loadConstitution(): void {
    try {
      this.constitutionContent = fs.readFileSync(this.constitutionPath, 'utf-8');
      this.parseRules();
    } catch (error) {
      console.error(`❌ 无法加载宪法文件: ${this.constitutionPath}`, error);
    }
  }

  /**
   * 解析宪法规则
   */
  private parseRules(): void {
    // 检查自动应用规则
    this.rules.autoApply = /代码更改自动应用|直接执行工具调用/i.test(this.constitutionContent);
    
    // 检查问答格式规则
    this.rules.questionFormat = /一次只问一个问题|数字编号/i.test(this.constitutionContent);
    
    // 检查规则更新要求
    this.rules.ruleUpdate = /立即更新要求|已更新-章节编号/i.test(this.constitutionContent);
    
    // 检查模块独立性
    this.rules.moduleIsolation = /模块独立性|严格隔离/i.test(this.constitutionContent);
    
    // 检查UI美观要求
    this.rules.uiBeauty = /特别注重UI界面|美观与交互效果/i.test(this.constitutionContent);
    
    // 检查动画效果
    this.rules.animationEffects = /所有交互必须有动画效果/i.test(this.constitutionContent);
    
    // 检查类型安全
    this.rules.typeSafety = /禁止使用any类型|必须明确每个数据的类型/i.test(this.constitutionContent);
    
    // 检查错误处理
    this.rules.errorHandling = /必须有错误处理|try-catch/i.test(this.constitutionContent);
    
    // 检查版本选择
    this.rules.useLatestVersion = /原则上适用最新稳定版本/i.test(this.constitutionContent);
  }

  /**
   * 检查代码文件是否符合宪法规则
   */
  checkCodeFile(filePath: string): RuleCheckResult[] {
    const results: RuleCheckResult[] = [];
    
    if (!fs.existsSync(filePath)) {
      return [{
        passed: false,
        rule: '文件存在性',
        message: `文件不存在: ${filePath}`,
        severity: 'error'
      }];
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const fileExt = path.extname(filePath);

    // 检查TypeScript类型安全
    if (fileExt === '.ts' || fileExt === '.tsx') {
      if (this.rules.typeSafety) {
        // 检查是否有any类型
        const anyMatches = content.match(/\bany\b/g);
        if (anyMatches && anyMatches.length > 0) {
          results.push({
            passed: false,
            rule: '类型安全',
            message: `发现 ${anyMatches.length} 处使用any类型，违反宪法规则`,
            severity: 'error'
          });
        }

        // 检查函数是否有类型定义
        const functionMatches = content.match(/function\s+\w+\s*\([^)]*\)/g);
        if (functionMatches) {
          functionMatches.forEach((func, _index) => {
            if (!/:.*=>|:\s*\w+/g.test(func)) {
              results.push({
                passed: false,
                rule: '类型安全',
                message: `函数缺少类型定义: ${func.substring(0, 50)}...`,
                severity: 'warning'
              });
            }
          });
        }
      }
    }

    // 检查错误处理
    if (this.rules.errorHandling) {
      const asyncMatches = content.match(/async\s+function|\bawait\b/g);
      if (asyncMatches && asyncMatches.length > 0) {
        const hasTryCatch = /try\s*\{[\s\S]*await[\s\S]*catch/i.test(content);
        if (!hasTryCatch && content.includes('await')) {
          results.push({
            passed: false,
            rule: '错误处理',
            message: '异步操作缺少try-catch错误处理',
            severity: 'error'
          });
        }
      }
    }

    // 检查CSS Modules使用
    if (fileExt === '.tsx' || fileExt === '.jsx') {
      const hasGlobalStyle = /import\s+['"]\.\/.*\.css['"]/g.test(content);
      const hasModuleStyle = /import\s+.*from\s+['"]\.\/.*\.module\.css['"]/g.test(content);
      
      if (hasGlobalStyle && !hasModuleStyle) {
        results.push({
          passed: false,
          rule: 'CSS Modules',
          message: '使用了全局CSS，应该使用CSS Modules',
          severity: 'error'
        });
      }
    }

    return results;
  }

  /**
   * 检查开发流程是否符合宪法规则
   */
  // 遵循宪法.md第13.1.1节TypeScript规范：禁止使用any类型
  checkDevelopmentProcess(action: string, context?: unknown): RuleCheckResult[] {
    const results: RuleCheckResult[] = [];

    // 检查是否在需求确认前就开始编码
    if (action === 'write_code' || action === 'create_file') {
      if (!context?.requirementConfirmed) {
        results.push({
          passed: false,
          rule: '功能开发前需求确认',
          message: '在需求确认前就开始编码，违反宪法规则。必须先通过问答确认需求。',
          severity: 'error'
        });
      }
    }

    // 检查规则更新
    if (action === 'update_constitution' && this.rules.ruleUpdate) {
      if (!context?.immediateUpdate) {
        results.push({
          passed: false,
          rule: '规则更新',
          message: '规则更新必须立即执行，禁止延迟更新',
          severity: 'error'
        });
      }
    }

    // 检查模块独立性
    if (action === 'modify_file' && this.rules.moduleIsolation) {
      if (context?.affectsOtherModules) {
        results.push({
          passed: false,
          rule: '模块独立性',
          message: '修改可能影响其他模块，违反模块独立性原则',
          severity: 'error'
        });
      }
    }

    return results;
  }

  /**
   * 检查依赖版本是否符合最新版本原则
   */
  checkDependencyVersion(packageName: string, currentVersion: string, latestVersion: string): RuleCheckResult[] {
    const results: RuleCheckResult[] = [];

    if (this.rules.useLatestVersion) {
      if (currentVersion !== latestVersion) {
        results.push({
          passed: false,
          rule: '版本选择原则',
          message: `${packageName} 当前版本 ${currentVersion}，最新稳定版本 ${latestVersion}，建议更新到最新版本`,
          severity: 'warning'
        });
      }
    }

    return results;
  }

  /**
   * 在执行下一个动作前进行检查和提醒
   */
  // 遵循宪法.md第13.1.1节TypeScript规范：禁止使用any类型
  async checkBeforeNextAction(nextAction: string, context?: unknown): Promise<boolean> {
    const processResults = this.checkDevelopmentProcess(nextAction, context);
    
    const errors = processResults.filter(r => r.severity === 'error');
    const warnings = processResults.filter(r => r.severity === 'warning');

    if (errors.length > 0) {
      console.log('\n⚠️  宪法规则检查失败，发现以下错误：\n');
      errors.forEach(result => {
        console.log(`❌ [${result.rule}] ${result.message}`);
      });
      console.log('\n请先解决这些问题，然后再继续下一步操作。\n');
      return false;
    }

    if (warnings.length > 0) {
      console.log('\n⚠️  宪法规则检查警告：\n');
      warnings.forEach(result => {
        console.log(`⚠️  [${result.rule}] ${result.message}`);
      });
      console.log('\n建议修复这些问题，但可以继续操作。\n');
    }

    return true;
  }

  /**
   * 生成检查报告
   */
  generateReport(filePaths?: string[]): string {
    let report = '# 宪法规则检查报告\n\n';
    report += `检查时间: ${new Date().toLocaleString()}\n\n`;
    
    report += '## 规则状态\n\n';
    Object.entries(this.rules).forEach(([key, value]) => {
      report += `- ${key}: ${value ? '✅' : '❌'}\n`;
    });

    if (filePaths && filePaths.length > 0) {
      report += '\n## 文件检查结果\n\n';
      filePaths.forEach(filePath => {
        const results = this.checkCodeFile(filePath);
        report += `### ${filePath}\n\n`;
        if (results.length === 0) {
          report += '✅ 通过检查\n\n';
        } else {
          results.forEach(result => {
            const icon = result.severity === 'error' ? '❌' : '⚠️';
            report += `${icon} [${result.rule}] ${result.message}\n\n`;
          });
        }
      });
    }

    return report;
  }
}

export default ConstitutionChecker;

// 如果直接运行此文件
if (require.main === module) {
  const checker = new ConstitutionChecker();
  console.log(checker.generateReport());
}

