import { useState, useEffect } from 'react';
import { Table, Input, Button, Space, Tag, Modal, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
  PoweroffOutlined,
} from '@ant-design/icons';
import Skeleton from '../../components/Skeleton';
import styles from './styles.module.css';

// 设备状态枚举
type DeviceStatus = 'online' | 'offline' | 'operating';

// 设备数据类型
interface Device {
  id: string;
  name: string;
  type: string;
  status: DeviceStatus;
  ip?: string;
  lastOnline: string;
  battery?: number;
  network?: string;
  dataCount: number;
  location?: string;
}

// 设备详情数据类型
interface DeviceDetail extends Device {
  model?: string;
  os?: string;
  version?: string;
  memory?: string;
  storage?: string;
  connectedAt?: string;
  totalOperations?: number;
  successRate?: number;
}

const DeviceManagement: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [devices, setDevices] = useState<Device[]>([]);
  const [filteredDevices, setFilteredDevices] = useState<Device[]>([]);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<DeviceStatus | 'all'>('all');
  const [selectedDevice, setSelectedDevice] = useState<DeviceDetail | null>(
    null
  );
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);

  // 模拟数据加载
  useEffect(() => {
    const loadDevices = async () => {
      setIsLoading(true);
      // 模拟API请求延迟
      await new Promise(resolve => setTimeout(resolve, 800));

      const mockDevices: Device[] = [
        {
          id: 'device-001',
          name: '华为 P50',
          type: '手机',
          status: 'online',
          ip: '192.168.1.101',
          lastOnline: '刚刚',
          battery: 85,
          network: 'WiFi',
          dataCount: 1234,
          location: '办公室A',
        },
        {
          id: 'device-002',
          name: '小米 13',
          type: '手机',
          status: 'online',
          ip: '192.168.1.102',
          lastOnline: '2分钟前',
          battery: 92,
          network: 'WiFi',
          dataCount: 987,
          location: '办公室B',
        },
        {
          id: 'device-003',
          name: 'iPhone 14',
          type: '手机',
          status: 'offline',
          ip: '192.168.1.103',
          lastOnline: '1小时前',
          battery: 0,
          network: '无',
          dataCount: 456,
          location: '办公室C',
        },
        {
          id: 'device-004',
          name: 'OPPO Find X5',
          type: '手机',
          status: 'operating',
          ip: '192.168.1.104',
          lastOnline: '刚刚',
          battery: 78,
          network: 'WiFi',
          dataCount: 2345,
          location: '办公室D',
        },
        {
          id: 'device-005',
          name: 'vivo X90',
          type: '手机',
          status: 'online',
          ip: '192.168.1.105',
          lastOnline: '5分钟前',
          battery: 65,
          network: 'WiFi',
          dataCount: 678,
          location: '办公室E',
        },
        {
          id: 'device-006',
          name: '荣耀 Magic5',
          type: '手机',
          status: 'offline',
          ip: '192.168.1.106',
          lastOnline: '3小时前',
          battery: 0,
          network: '无',
          dataCount: 321,
          location: '办公室F',
        },
      ];

      setDevices(mockDevices);
      setFilteredDevices(mockDevices);
      setIsLoading(false);
    };

    loadDevices();
  }, []);

  // 搜索和筛选
  useEffect(() => {
    let filtered = devices;

    // 状态筛选
    if (statusFilter !== 'all') {
      filtered = filtered.filter(device => device.status === statusFilter);
    }

    // 搜索筛选
    if (searchText) {
      filtered = filtered.filter(
        device =>
          device.name.toLowerCase().includes(searchText.toLowerCase()) ||
          device.id.toLowerCase().includes(searchText.toLowerCase()) ||
          device.type.toLowerCase().includes(searchText.toLowerCase()) ||
          device.location?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    setFilteredDevices(filtered);
  }, [searchText, statusFilter, devices]);

  // 获取状态标签
  const getStatusTag = (status: DeviceStatus) => {
    const statusConfig = {
      online: { color: 'success', text: '在线' },
      offline: { color: 'error', text: '离线' },
      operating: { color: 'processing', text: '操作中' },
    };
    const config = statusConfig[status];
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  // 查看设备详情
  const handleViewDetail = (device: Device) => {
    // 模拟获取详细数据
    const detail: DeviceDetail = {
      ...device,
      model: device.name,
      os: 'Android 13',
      version: '1.0.0',
      memory: '8GB',
      storage: '256GB',
      connectedAt: '2024-01-15 10:30:00',
      totalOperations: 5678,
      successRate: 98.5,
    };
    setSelectedDevice(detail);
    setIsDetailModalVisible(true);
  };

  // 刷新设备
  const handleRefresh = async () => {
    message.loading({ content: '正在刷新设备状态...', key: 'refresh' });
    // 模拟刷新延迟
    await new Promise(resolve => setTimeout(resolve, 1000));
    message.success({ content: '设备状态已更新', key: 'refresh' });
    // 这里应该重新加载设备数据
  };

  // 重启设备
  const handleRestart = (device: Device) => {
    Modal.confirm({
      title: '确认重启设备',
      content: `确定要重启设备 "${device.name}" 吗？`,
      onOk: async () => {
        message.loading({ content: '正在重启设备...', key: 'restart' });
        await new Promise(resolve => setTimeout(resolve, 1500));
        message.success({ content: '设备重启成功', key: 'restart' });
      },
    });
  };

  // 表格列定义
  const columns: ColumnsType<Device> = [
    {
      title: '设备ID',
      dataIndex: 'id',
      key: 'id',
      width: 120,
      fixed: 'left',
    },
    {
      title: '设备名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
    },
    {
      title: '设备类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: DeviceStatus) => getStatusTag(status),
    },
    {
      title: 'IP地址',
      dataIndex: 'ip',
      key: 'ip',
      width: 130,
      render: (ip: string) => ip || '-',
    },
    {
      title: '电池电量',
      dataIndex: 'battery',
      key: 'battery',
      width: 100,
      render: (battery: number) => {
        if (battery === undefined || battery === 0) return '-';
        return (
          <span className={battery < 20 ? styles.lowBattery : ''}>
            {battery}%
          </span>
        );
      },
    },
    {
      title: '网络状态',
      dataIndex: 'network',
      key: 'network',
      width: 100,
      render: (network: string) => network || '-',
    },
    {
      title: '最后在线',
      dataIndex: 'lastOnline',
      key: 'lastOnline',
      width: 120,
    },
    {
      title: '采集数据量',
      dataIndex: 'dataCount',
      key: 'dataCount',
      width: 120,
      render: (count: number) => count.toLocaleString(),
    },
    {
      title: '位置',
      dataIndex: 'location',
      key: 'location',
      width: 120,
      render: (location: string) => location || '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      fixed: 'right',
      // 遵循宪法.md第13.1.1节TypeScript规范：禁止使用any类型
      render: (_: unknown, record: Device) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
            size="small"
          >
            详情
          </Button>
          <Button
            type="link"
            icon={<ReloadOutlined />}
            onClick={() => handleRestart(record)}
            size="small"
            danger={record.status === 'offline'}
          >
            重启
          </Button>
        </Space>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className={styles.deviceManagement}>
        <div className={styles.contentHeader}>
          <Skeleton title rows={1} />
        </div>
        <div className={styles.filterBar}>
          <Skeleton title={false} rows={1} />
        </div>
        <div className={styles.tableContainer}>
          <Skeleton rows={6} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.deviceManagement}>
      <div className={styles.contentHeader}>
        <h1 className={styles.contentTitle}>设备管理</h1>
        <p className={styles.contentSubtitle}>管理和监控所有连接的设备</p>
      </div>

      <div className={styles.filterBar}>
        <Space size="middle" wrap>
          <Input
            placeholder="搜索设备名称、ID、类型或位置"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            allowClear
            style={{ width: 300 }}
          />
          <Space>
            <Button
              type={statusFilter === 'all' ? 'primary' : 'default'}
              onClick={() => setStatusFilter('all')}
            >
              全部
            </Button>
            <Button
              type={statusFilter === 'online' ? 'primary' : 'default'}
              onClick={() => setStatusFilter('online')}
            >
              在线
            </Button>
            <Button
              type={statusFilter === 'offline' ? 'primary' : 'default'}
              onClick={() => setStatusFilter('offline')}
            >
              离线
            </Button>
            <Button
              type={statusFilter === 'operating' ? 'primary' : 'default'}
              onClick={() => setStatusFilter('operating')}
            >
              操作中
            </Button>
          </Space>
          <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
            刷新
          </Button>
        </Space>
        <div className={styles.statistics}>
          <span>总计: {devices.length}</span>
          <span>在线: {devices.filter(d => d.status === 'online').length}</span>
          <span>
            离线: {devices.filter(d => d.status === 'offline').length}
          </span>
          <span>
            操作中: {devices.filter(d => d.status === 'operating').length}
          </span>
        </div>
      </div>

      <div className={styles.tableContainer}>
        <Table
          columns={columns}
          dataSource={filteredDevices}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: total => `共 ${total} 条记录`,
          }}
          scroll={{ x: 1200 }}
        />
      </div>

      {/* 设备详情弹窗 */}
      <Modal
        title="设备详情"
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsDetailModalVisible(false)}>
            关闭
          </Button>,
          <Button
            key="restart"
            type="primary"
            danger
            icon={<PoweroffOutlined />}
            onClick={() => {
              if (selectedDevice) {
                handleRestart(selectedDevice);
                setIsDetailModalVisible(false);
              }
            }}
          >
            重启设备
          </Button>,
        ]}
        width={600}
      >
        {selectedDevice && (
          <div className={styles.deviceDetail}>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>设备ID:</span>
              <span className={styles.detailValue}>{selectedDevice.id}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>设备名称:</span>
              <span className={styles.detailValue}>{selectedDevice.name}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>设备类型:</span>
              <span className={styles.detailValue}>{selectedDevice.type}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>设备状态:</span>
              <span className={styles.detailValue}>
                {getStatusTag(selectedDevice.status)}
              </span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>IP地址:</span>
              <span className={styles.detailValue}>
                {selectedDevice.ip || '-'}
              </span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>电池电量:</span>
              <span className={styles.detailValue}>
                {selectedDevice.battery !== undefined &&
                selectedDevice.battery > 0
                  ? `${selectedDevice.battery}%`
                  : '-'}
              </span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>网络状态:</span>
              <span className={styles.detailValue}>
                {selectedDevice.network || '-'}
              </span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>位置:</span>
              <span className={styles.detailValue}>
                {selectedDevice.location || '-'}
              </span>
            </div>
            {selectedDevice.model && (
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>设备型号:</span>
                <span className={styles.detailValue}>
                  {selectedDevice.model}
                </span>
              </div>
            )}
            {selectedDevice.os && (
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>操作系统:</span>
                <span className={styles.detailValue}>{selectedDevice.os}</span>
              </div>
            )}
            {selectedDevice.version && (
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>版本号:</span>
                <span className={styles.detailValue}>
                  {selectedDevice.version}
                </span>
              </div>
            )}
            {selectedDevice.memory && (
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>内存:</span>
                <span className={styles.detailValue}>
                  {selectedDevice.memory}
                </span>
              </div>
            )}
            {selectedDevice.storage && (
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>存储:</span>
                <span className={styles.detailValue}>
                  {selectedDevice.storage}
                </span>
              </div>
            )}
            {selectedDevice.connectedAt && (
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>连接时间:</span>
                <span className={styles.detailValue}>
                  {selectedDevice.connectedAt}
                </span>
              </div>
            )}
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>最后在线:</span>
              <span className={styles.detailValue}>
                {selectedDevice.lastOnline}
              </span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>采集数据量:</span>
              <span className={styles.detailValue}>
                {selectedDevice.dataCount.toLocaleString()}
              </span>
            </div>
            {selectedDevice.totalOperations !== undefined && (
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>总操作次数:</span>
                <span className={styles.detailValue}>
                  {selectedDevice.totalOperations.toLocaleString()}
                </span>
              </div>
            )}
            {selectedDevice.successRate !== undefined && (
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>成功率:</span>
                <span className={styles.detailValue}>
                  {selectedDevice.successRate}%
                </span>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DeviceManagement;





