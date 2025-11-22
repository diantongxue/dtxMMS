import React, { useState } from 'react';
import styles from './Logo.module.css';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
  className?: string;
  textSize?: number; // 自定义文字大小（px）
}

const Logo: React.FC<LogoProps> = ({
  size = 'medium',
  showText = true,
  className = '',
  textSize,
}) => {
  const [imageError, setImageError] = useState(false);

  const sizeMap = {
    small: 32,
    medium: 48,
    large: 72,
  };

  const logoSize = sizeMap[size];

  // Logo图片路径
  const logoPath = '/logo.png';

  return (
    <div className={`${styles.logo} ${styles[size]} ${className}`}>
      <div
        className={styles.logoIcon}
        style={{
          width: `${logoSize}px`,
          height: `${logoSize}px`,
        }}
      >
        {!imageError ? (
          <img
            src={logoPath}
            alt="滇同学"
            className={styles.logoImage}
            onError={() => setImageError(true)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
            }}
          />
        ) : (
          <div className={styles.logoPlaceholder}>
            <span>滇</span>
          </div>
        )}
      </div>
      {showText && (
        <div
          className={styles.logoText}
          style={textSize ? { fontSize: `${textSize}px` } : undefined}
        >
          滇同学
        </div>
      )}
    </div>
  );
};

export default Logo;
