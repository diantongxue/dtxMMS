import styles from '../styles.module.css';

const LoginBackground: React.FC = () => {
  return (
    <div className={styles.bgDecoration}>
      {/* 网格背景 */}
      <div className={styles.bgGrid}></div>

      {/* 光晕效果 */}
      <div className={`${styles.bgGlow} ${styles.bgGlow1}`}></div>
      <div className={`${styles.bgGlow} ${styles.bgGlow2}`}></div>
      <div className={`${styles.bgGlow} ${styles.bgGlow3}`}></div>

      {/* 科技线条 */}
      <div className={`${styles.techLine} ${styles.techLine1}`}></div>
      <div className={`${styles.techLine} ${styles.techLine2}`}></div>
      <div className={`${styles.techLine} ${styles.techLine3}`}></div>

      {/* 扫描线 */}
      <div className={styles.scanLine}></div>

      {/* 数据流 */}
      <div className={`${styles.dataStream} ${styles.dataStream1}`}></div>
      <div className={`${styles.dataStream} ${styles.dataStream2}`}></div>
      <div className={`${styles.dataStream} ${styles.dataStream3}`}></div>

      {/* 六边形装饰 */}
      <div className={`${styles.hexagon} ${styles.hexagon1}`}></div>
      <div className={`${styles.hexagon} ${styles.hexagon2}`}></div>

      {/* 粒子效果 */}
      <div
        className={styles.particle}
        style={{ top: '20%', left: '20%', animationDelay: '0s' }}
      />
      <div
        className={styles.particle}
        style={{ top: '40%', left: '60%', animationDelay: '2s' }}
      />
      <div
        className={styles.particle}
        style={{ top: '70%', left: '30%', animationDelay: '4s' }}
      />
      <div
        className={styles.particle}
        style={{ top: '30%', left: '80%', animationDelay: '6s' }}
      />
      <div
        className={styles.particle}
        style={{ top: '60%', left: '10%', animationDelay: '8s' }}
      />
      <div
        className={styles.particle}
        style={{ top: '80%', left: '70%', animationDelay: '10s' }}
      />
    </div>
  );
};

export default LoginBackground;
