import { useState, useEffect } from 'react';
import Skeleton from '../../components/Skeleton';
import styles from './styles.module.css';

const Dashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState({
    onlineDevices: 0,
    todayData: 0,
    totalOrders: 0,
    dataRate: 0,
    deviceList: [] as Array<{
      id: string;
      name: string;
      status: string;
      lastOnline: string;
      dataCount: number;
    }>,
  });

  useEffect(() => {
    // 模拟数据加载
    const loadData = async () => {
      setIsLoading(true);
      // 模拟API请求延迟
      await new Promise(resolve => setTimeout(resolve, 800));

      setData({
        onlineDevices: 3,
        todayData: 1234,
        totalOrders: 5678,
        dataRate: 98.5,
        deviceList: [
          {
            id: 'device-001',
            name: '华为 P50',
            status: '在线',
            lastOnline: '刚刚',
            dataCount: 456,
          },
          {
            id: 'device-002',
            name: '小米 13',
            status: '在线',
            lastOnline: '2分钟前',
            dataCount: 389,
          },
          {
            id: 'device-003',
            name: 'iPhone 14',
            status: '离线',
            lastOnline: '1小时前',
            dataCount: 234,
          },
        ],
      });

      setIsLoading(false);
    };

    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.contentHeader}>
          <Skeleton title rows={1} />
        </div>
        <div className={styles.contentGrid}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className={styles.card}>
              <Skeleton title={false} rows={2} />
            </div>
          ))}
        </div>
        <div className={styles.tableContainer}>
          <Skeleton rows={5} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      <div className={styles.contentHeader}>
        <h1 className={styles.contentTitle}>数据看板</h1>
        <p className={styles.contentSubtitle}>实时监控设备状态和数据采集情况</p>
      </div>

      <div className={styles.contentGrid}>
        <div className={styles.card}>
          <div className={styles.cardTitle}>在线设备</div>
          <div className={styles.cardValue}>{data.onlineDevices}</div>
          <div className={styles.cardChange}>↑ 1 台</div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardTitle}>今日采集数据</div>
          <div className={styles.cardValue}>
            {data.todayData.toLocaleString()}
          </div>
          <div className={styles.cardChange}>↑ 12%</div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardTitle}>订单总数</div>
          <div className={styles.cardValue}>
            {data.totalOrders.toLocaleString()}
          </div>
          <div className={styles.cardChange}>↑ 8%</div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardTitle}>数据采集率</div>
          <div className={styles.cardValue}>{data.dataRate}%</div>
          <div className={styles.cardChange}>↑ 2.3%</div>
        </div>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>设备ID</th>
              <th>设备名称</th>
              <th>状态</th>
              <th>最后在线</th>
              <th>采集数据量</th>
            </tr>
          </thead>
          <tbody>
            {data.deviceList.map(device => (
              <tr key={device.id}>
                <td>{device.id}</td>
                <td>{device.name}</td>
                <td>
                  <span
                    className={`${styles.badge} ${
                      device.status === '在线'
                        ? styles.badgeSuccess
                        : styles.badgeWarning
                    }`}
                  >
                    {device.status}
                  </span>
                </td>
                <td>{device.lastOnline}</td>
                <td>{device.dataCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
