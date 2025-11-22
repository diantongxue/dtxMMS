import { useState } from 'react';
import { message } from 'antd';
import LoginBackground from './components/LoginBackground';
import LoginForm from './components/LoginForm';
import Logo from '../../components/Logo';
import styles from './styles.module.css';

interface LoginFormData {
  username: string;
  password: string;
  remember: boolean;
}

interface LoginProps {
  onLoginSuccess?: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [loading, setLoading] = useState(false);
  // 获取当前年份
  const currentYear = new Date().getFullYear();

  const handleLogin = async (values: LoginFormData) => {
    setLoading(true);
    try {
      // 开发期间默认密码验证
      const isDevPassword = values.password === '123456';

      if (!isDevPassword) {
        message.error('账号或密码错误');
        setLoading(false);
        return;
      }

      // 模拟登录请求
      await new Promise(resolve => setTimeout(resolve, 1500));

      // 如果勾选了记住我，保存账号和密码
      if (values.remember) {
        localStorage.setItem('rememberedUsername', values.username);
        localStorage.setItem('rememberedPassword', values.password);
      } else {
        localStorage.removeItem('rememberedUsername');
        localStorage.removeItem('rememberedPassword');
      }

      // 保存登录状态
      localStorage.setItem('isLoggedIn', 'true');

      message.success('登录成功！', 1);

      // 短暂延迟后开始切换动画，让用户看到成功提示
      setTimeout(() => {
        if (onLoginSuccess) {
          onLoginSuccess();
        }
      }, 800);
    } catch (error) {
      message.error('账号或密码错误');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    message.info('请联系管理员重置密码');
  };

  return (
    <div className={styles.loginPage}>
      <LoginBackground />
      <div className={styles.loginContainer}>
        <div className={styles.loginHeader}>
          <Logo size="large" showText={true} className={styles.loginLogo} />
          <h1 className={styles.loginTitle}>智慧系统</h1>
          <p className={styles.loginSubtitle}>欢迎登录，请使用您的账号密码</p>
        </div>

        <LoginForm
          onSubmit={handleLogin}
          onForgotPassword={handleForgotPassword}
          loading={loading}
        />

        <div className={styles.loginFooter}>
          <p>© {currentYear} 滇同学·智慧系统 版权所有</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
