import { useState, useEffect, useCallback } from 'react';
import { Modal, Table, Button, Tag, Popconfirm, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { LogoutOutlined, DesktopOutlined } from '@ant-design/icons';
import Skeleton from '../../../components/Skeleton';
import styles from './DeviceManagementModal.module.css';

// 设备数据类型
interface Device {
  id: string;
  deviceName: string;
  deviceType: string;
  os: string;
  browser?: string;
  ip: string;
  location: string;
  lastActiveTime: string;
  status: 'online' | 'offline';
}

interface DeviceManagementModalProps {
  visible: boolean;
  userId: string | null;
  onCancel: () => void;
}

// 模拟设备数据
const mockDevices: Record<string, Device[]> = {
  'user-001': [
    {
      id: 'device-001',
      deviceName: 'MacBook Pro',
      deviceType: 'Desktop',
      os: 'macOS 14.0',
      browser: 'Chrome 120.0',
      ip: '192.168.1.100',
      location: '北京市',
      lastActiveTime: '2024-01-15 10:30:00',
      status: 'online',
    },
  ],
  'user-002': [
    {
      id: 'device-002',
      deviceName: 'Windows PC',
      deviceType: 'Desktop',
      os: 'Windows 11',
      browser: 'Chrome 120.0',
      ip: '192.168.1.101',
      location: '上海市',
      lastActiveTime: '2024-01-15 09:20:00',
      status: 'online',
    },
    {
      id: 'device-003',
      deviceName: 'iPhone 14',
      deviceType: 'Mobile',
      os: 'iOS 17.0',
      browser: 'Safari',
      ip: '192.168.1.102',
      location: '上海市',
      lastActiveTime: '2024-01-14 18:45:00',
      status: 'offline',
    },
  ],
  'user-004': [
    {
      id: 'device-004',
      deviceName: 'Windows PC',
      deviceType: 'Desktop',
      os: 'Windows 10',
      browser: 'Edge 120.0',
      ip: '192.168.1.103',
      location: '广州市',
      lastActiveTime: '2024-01-10 14:20:00',
      status: 'offline',
    },
  ],
};

const DeviceManagementModal: React.FC<DeviceManagementModalProps> = ({
  visible,
  userId,
  onCancel,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [devices, setDevices] = useState<Device[]>([]);

  // 遵循宪法.md第13.1.6节React规范：使用useCallback优化性能
  const loadDevices = useCallback(async () => {
    setIsLoading(true);
    // 模拟API请求延迟
    await new Promise(resolve => setTimeout(resolve, 500));
    const userDevices = mockDevices[userId || ''] || [];
    setDevices(userDevices);
    setIsLoading(false);
  };

  // 处理踢出设备
  const handleKickOut = (deviceId: string) => {
    setDevices(devices.filter(device => device.id !== deviceId));
    message.success('设备已踢出');
  };

  // 处理批量踢出
  const handleBatchKickOut = (deviceIds: string[]) => {
    setDevices(devices.filter(device => !deviceIds.includes(device.id)));
    message.success('设备已批量踢出');
  };

  // 表格列定义
  const columns: ColumnsType<Device> = [
    {
      title: '设备名称',
      dataIndex: 'deviceName',
      key: 'deviceName',
      width: 150,
    },
    {
      title: '设备类型',
      dataIndex: 'deviceType',
      key: 'deviceType',
      width: 100,
      render: (type: string) => (
        <Tag icon={<DesktopOutlined />} color="blue">
          {type}
        </Tag>
      ),
    },
    {
      title: '操作系统',
      dataIndex: 'os',
      key: 'os',
      width: 150,
    },
    {
      title: '浏览器',
      dataIndex: 'browser',
      key: 'browser',
      width: 150,
    },
    {
      title: 'IP地址',
      dataIndex: 'ip',
      key: 'ip',
      width: 130,
    },
    {
      title: '位置',
      dataIndex: 'location',
      key: 'location',
      width: 100,
    },
    {
      title: '最后活跃',
      dataIndex: 'lastActiveTime',
      key: 'lastActiveTime',
      width: 160,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const statusMap: Record<string, { text: string; color: string }> = {
          online: { text: '在线', color: 'success' },
          offline: { text: '离线', color: 'default' },
        };
        const statusInfo = statusMap[status] || {
          text: status,
          color: 'default',
        };
        return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Popconfirm
          title="确定要踢出这个设备吗？"
          onConfirm={() => handleKickOut(record.id)}
          okText="确定"
          cancelText="取消"
        >
          <Button type="link" danger size="small" icon={<LogoutOutlined />}>
            踢出
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <Modal
      title="设备管理"
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={1000}
    >
      {isLoading ? (
        <div className={styles.loadingContainer}>
          <Skeleton rows={5} />
        </div>
      ) : devices.length === 0 ? (
        <div className={styles.emptyContainer}>
          <DesktopOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
          <p>该用户暂无登录设备</p>
        </div>
      ) : (
        <div className={styles.deviceContainer}>
          <div className={styles.deviceHeader}>
            <span>共 {devices.length} 台设备</span>
            <Popconfirm
              title="确定要踢出所有设备吗？"
              onConfirm={() => handleBatchKickOut(devices.map(d => d.id))}
              okText="确定"
              cancelText="取消"
            >
              <Button danger icon={<LogoutOutlined />}>
                批量踢出
              </Button>
            </Popconfirm>
          </div>
          <Table
            columns={columns}
            dataSource={devices}
            rowKey="id"
            pagination={false}
            size="small"
          />
        </div>
      )}
    </Modal>
  );
};

export default DeviceManagementModal;





