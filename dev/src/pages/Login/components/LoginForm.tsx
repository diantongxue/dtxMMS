import { useState, useEffect } from 'react';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import styles from '../styles.module.css';

interface LoginFormProps {
  onSubmit: (values: {
    username: string;
    password: string;
    remember: boolean;
  }) => void;
  onForgotPassword: () => void;
  loading: boolean;
}

const LoginForm: React.FC<LoginFormProps> = ({
  onSubmit,
  onForgotPassword,
  loading,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // 加载记住的账号和密码
  useEffect(() => {
    const rememberedUsername = localStorage.getItem('rememberedUsername');
    const rememberedPassword = localStorage.getItem('rememberedPassword');
    if (rememberedUsername) {
      setUsername(rememberedUsername);
      setRemember(true);
    }
    if (rememberedPassword) {
      setPassword(rememberedPassword);
    }
  }, []);

  const validateUsername = (value: string) => {
    if (!value.trim()) {
      setUsernameError('请输入账号');
      return false;
    }
    setUsernameError('');
    return true;
  };

  const validatePassword = (value: string) => {
    if (!value.trim()) {
      setPasswordError('请输入密码');
      return false;
    }
    if (value.length < 6) {
      setPasswordError('密码长度至少6位');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleUsernameBlur = () => {
    validateUsername(username);
  };

  const handlePasswordBlur = () => {
    validatePassword(password);
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
    if (usernameError) {
      setUsernameError('');
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (passwordError) {
      setPasswordError('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const isUsernameValid = validateUsername(username);
    const isPasswordValid = validatePassword(password);

    if (isUsernameValid && isPasswordValid) {
      onSubmit({ username, password, remember });
    }
  };

  return (
    <form className={styles.loginForm} onSubmit={handleSubmit}>
      <div className={styles.formGroup}>
        <label className={styles.formLabel} htmlFor="username">
          账号
        </label>
        <div className={styles.formInputWrapper}>
          <input
            type="text"
            id="username"
            className={`${styles.formInput} ${usernameError ? styles.error : ''}`}
            placeholder="请输入账号"
            value={username}
            onChange={handleUsernameChange}
            onBlur={handleUsernameBlur}
            autoComplete="username"
            disabled={loading}
          />
          <UserOutlined className={styles.inputIcon} />
        </div>
        {usernameError && (
          <div className={`${styles.errorMessage} ${styles.show}`}>
            {usernameError}
          </div>
        )}
      </div>

      <div className={styles.formGroup}>
        <label className={styles.formLabel} htmlFor="password">
          密码
        </label>
        <div className={styles.formInputWrapper}>
          <input
            type="password"
            id="password"
            className={`${styles.formInput} ${passwordError ? styles.error : ''}`}
            placeholder="请输入密码"
            value={password}
            onChange={handlePasswordChange}
            onBlur={handlePasswordBlur}
            autoComplete="current-password"
            disabled={loading}
          />
          <LockOutlined className={styles.inputIcon} />
        </div>
        {passwordError && (
          <div className={`${styles.errorMessage} ${styles.show}`}>
            {passwordError}
          </div>
        )}
      </div>

      <button
        type="submit"
        className={`${styles.loginButton} ${loading ? styles.loading : ''}`}
        disabled={loading}
      >
        {loading ? (
          <span className={styles.buttonText}>登录中...</span>
        ) : (
          <span className={styles.buttonText}>登录</span>
        )}
      </button>

      <div className={styles.formOptions}>
        <label className={styles.rememberMe}>
          <input
            type="checkbox"
            id="remember"
            checked={remember}
            onChange={e => setRemember(e.target.checked)}
            disabled={loading}
          />
          <span>记住我</span>
        </label>
        <a
          href="#"
          className={styles.forgotPassword}
          onClick={e => {
            e.preventDefault();
            onForgotPassword();
          }}
        >
          忘记密码？
        </a>
      </div>
    </form>
  );
};

export default LoginForm;
