import { useState, useEffect, useMemo } from 'react';
import {
  Table,
  Button,
  Input,
  Select,
  Space,
  Tag,
  Avatar,
  Modal,
  message,
  // Upload, // 保留用于未来扩展
  Popconfirm,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
  UserOutlined,
  SettingOutlined,
  DesktopOutlined,
  // LogoutOutlined, // 保留用于未来扩展
} from '@ant-design/icons';
// import type { UploadFile } from 'antd/es/upload/interface'; // 保留用于未来扩展
import Skeleton from '../../components/Skeleton';
import UserFormModal from './components/UserFormModal';
import UserDetailModal from './components/UserDetailModal';
import DeviceManagementModal from './components/DeviceManagementModal';
import PasswordPolicyModal from './components/PasswordPolicyModal';
import styles from './styles.module.css';

// 用户数据类型
export interface User {
  id: string;
  username: string;
  realName: string;
  email: string;
  phone: string;
  avatar?: string;
  department: string;
  role: string;
  status: 'active' | 'inactive' | 'locked';
  lastLoginTime?: string;
  lastLoginIp?: string;
  createTime: string;
  deviceCount?: number;
}

// 模拟用户数据
const mockUsers: User[] = [
  {
    id: 'user-001',
    username: 'admin',
    realName: '管理员',
    email: 'admin@example.com',
    phone: '13800138000',
    avatar: '',
    department: '技术部',
    role: '超级管理员',
    status: 'active',
    lastLoginTime: '2024-01-15 10:30:00',
    lastLoginIp: '192.168.1.100',
    createTime: '2023-01-01 00:00:00',
    deviceCount: 1,
  },
  {
    id: 'user-002',
    username: 'zhangsan',
    realName: '张三',
    email: 'zhangsan@example.com',
    phone: '13800138001',
    avatar: '',
    department: '运营部',
    role: '运营专员',
    status: 'active',
    lastLoginTime: '2024-01-15 09:20:00',
    lastLoginIp: '192.168.1.101',
    createTime: '2023-06-15 00:00:00',
    deviceCount: 2,
  },
  {
    id: 'user-003',
    username: 'lisi',
    realName: '李四',
    email: 'lisi@example.com',
    phone: '13800138002',
    avatar: '',
    department: '销售部',
    role: '销售经理',
    status: 'active',
    lastLoginTime: '2024-01-14 18:45:00',
    lastLoginIp: '192.168.1.102',
    createTime: '2023-08-20 00:00:00',
    deviceCount: 0,
  },
  {
    id: 'user-004',
    username: 'wangwu',
    realName: '王五',
    email: 'wangwu@example.com',
    phone: '13800138003',
    avatar: '',
    department: '财务部',
    role: '财务专员',
    status: 'inactive',
    lastLoginTime: '2024-01-10 14:20:00',
    lastLoginIp: '192.168.1.103',
    createTime: '2023-09-10 00:00:00',
    deviceCount: 1,
  },
  {
    id: 'user-005',
    username: 'zhaoliu',
    realName: '赵六',
    email: 'zhaoliu@example.com',
    phone: '13800138004',
    avatar: '',
    department: '人事部',
    role: '人事专员',
    status: 'locked',
    lastLoginTime: '2024-01-05 11:30:00',
    lastLoginIp: '192.168.1.104',
    createTime: '2023-10-05 00:00:00',
    deviceCount: 0,
  },
];

const UserManagement: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [isFormModalVisible, setIsFormModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isDeviceModalVisible, setIsDeviceModalVisible] = useState(false);
  const [isPasswordPolicyModalVisible, setIsPasswordPolicyModalVisible] =
    useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [deviceUserId, setDeviceUserId] = useState<string | null>(null);

  // 加载用户数据
  useEffect(() => {
    const loadUsers = async () => {
      setIsLoading(true);
      // 模拟API请求延迟
      await new Promise(resolve => setTimeout(resolve, 800));
      setUsers(mockUsers);
      setFilteredUsers(mockUsers);
      setIsLoading(false);
    };

    loadUsers();
  }, []);

  // 过滤用户数据
  useEffect(() => {
    let filtered = [...users];

    // 搜索过滤
    if (searchText) {
      filtered = filtered.filter(
        user =>
          user.username.toLowerCase().includes(searchText.toLowerCase()) ||
          user.realName.toLowerCase().includes(searchText.toLowerCase()) ||
          user.email.toLowerCase().includes(searchText.toLowerCase()) ||
          user.phone.includes(searchText)
      );
    }

    // 状态过滤
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.status === statusFilter);
    }

    // 部门过滤
    if (departmentFilter !== 'all') {
      filtered = filtered.filter(user => user.department === departmentFilter);
    }

    setFilteredUsers(filtered);
  }, [users, searchText, statusFilter, departmentFilter]);

  // 获取所有部门列表
  const departments = useMemo(() => {
    const deptSet = new Set(users.map(user => user.department));
    return Array.from(deptSet);
  }, [users]);

  // 表格列定义
  const columns: ColumnsType<User> = [
    {
      title: '头像',
      dataIndex: 'avatar',
      key: 'avatar',
      width: 80,
      render: (_, record) => (
        <Avatar
          src={record.avatar}
          icon={<UserOutlined />}
          size="default"
          style={{ backgroundColor: '#3964fe' }}
        />
      ),
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      width: 120,
      sorter: (a, b) => a.username.localeCompare(b.username),
    },
    {
      title: '真实姓名',
      dataIndex: 'realName',
      key: 'realName',
      width: 120,
      sorter: (a, b) => a.realName.localeCompare(b.realName),
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      width: 180,
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      key: 'phone',
      width: 130,
    },
    {
      title: '部门',
      dataIndex: 'department',
      key: 'department',
      width: 120,
      filters: departments.map(dept => ({ text: dept, value: dept })),
      onFilter: (value, record) => record.department === value,
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      width: 120,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const statusMap: Record<string, { text: string; color: string }> = {
          active: { text: '正常', color: 'success' },
          inactive: { text: '未激活', color: 'default' },
          locked: { text: '已锁定', color: 'error' },
        };
        const statusInfo = statusMap[status] || {
          text: status,
          color: 'default',
        };
        return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
      },
      filters: [
        { text: '正常', value: 'active' },
        { text: '未激活', value: 'inactive' },
        { text: '已锁定', value: 'locked' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: '最后登录',
      dataIndex: 'lastLoginTime',
      key: 'lastLoginTime',
      width: 160,
      sorter: (a, b) => {
        if (!a.lastLoginTime || !b.lastLoginTime) return 0;
        return (
          new Date(a.lastLoginTime).getTime() -
          new Date(b.lastLoginTime).getTime()
        );
      },
      render: (text: string) => text || '从未登录',
    },
    {
      title: '登录设备',
      key: 'deviceCount',
      width: 100,
      render: (_, record) => (
        <Button
          type="link"
          icon={<DesktopOutlined />}
          onClick={() => handleViewDevices(record.id)}
        >
          {record.deviceCount || 0} 台
        </Button>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => handleViewDetail(record)}
          >
            详情
          </Button>
          <Popconfirm
            title="确定要删除这个用户吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // 处理添加用户
  const handleAdd = () => {
    setEditingUser(null);
    setIsFormModalVisible(true);
  };

  // 处理编辑用户
  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsFormModalVisible(true);
  };

  // 处理查看详情
  const handleViewDetail = (user: User) => {
    setViewingUser(user);
    setIsDetailModalVisible(true);
  };

  // 处理删除用户
  const handleDelete = (userId: string) => {
    setUsers(users.filter(user => user.id !== userId));
    message.success('删除成功');
  };

  // 处理查看设备
  const handleViewDevices = (userId: string) => {
    setDeviceUserId(userId);
    setIsDeviceModalVisible(true);
  };

  // 处理保存用户
  const handleSave = (userData: Partial<User>) => {
    if (editingUser) {
      // 编辑
      setUsers(
        users.map(user =>
          user.id === editingUser.id ? { ...user, ...userData } : user
        )
      );
      message.success('更新成功');
    } else {
      // 新增
      const newUser: User = {
        id: `user-${Date.now()}`,
        ...userData,
        createTime: new Date().toLocaleString('zh-CN'),
        deviceCount: 0,
      } as User;
      setUsers([...users, newUser]);
      message.success('添加成功');
    }
    setIsFormModalVisible(false);
    setEditingUser(null);
  };

  // 处理批量删除
  const handleBatchDelete = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要删除的用户');
      return;
    }
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除选中的 ${selectedRowKeys.length} 个用户吗？`,
      onOk: () => {
        setUsers(users.filter(user => !selectedRowKeys.includes(user.id)));
        setSelectedRowKeys([]);
        message.success('删除成功');
      },
    });
  };

  // 处理批量操作
  const handleBatchOperation = (operation: string) => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要操作的用户');
      return;
    }
    // 这里可以实现批量激活、锁定等操作
    message.info(`批量${operation}功能待实现`);
  };

  // 行选择配置
  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => {
      setSelectedRowKeys(keys);
    },
  };

  if (isLoading) {
    return (
      <div className={styles.userManagement}>
        <div className={styles.contentHeader}>
          <Skeleton title rows={1} />
        </div>
        <div className={styles.tableContainer}>
          <Skeleton rows={8} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.userManagement}>
      <div className={styles.contentHeader}>
        <div>
          <h1 className={styles.contentTitle}>用户管理</h1>
          <p className={styles.contentSubtitle}>管理系统用户信息、权限和设备</p>
        </div>
        <Space>
          <Button
            icon={<SettingOutlined />}
            onClick={() => setIsPasswordPolicyModalVisible(true)}
          >
            密码策略
          </Button>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => window.location.reload()}
          >
            刷新
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            添加用户
          </Button>
        </Space>
      </div>

      <div className={styles.filterBar}>
        <Space size="middle" wrap>
          <Input
            placeholder="搜索用户名、姓名、邮箱或手机号"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            style={{ width: 300 }}
            allowClear
          />
          <Select
            placeholder="选择状态"
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 120 }}
          >
            <Select.Option value="all">全部状态</Select.Option>
            <Select.Option value="active">正常</Select.Option>
            <Select.Option value="inactive">未激活</Select.Option>
            <Select.Option value="locked">已锁定</Select.Option>
          </Select>
          <Select
            placeholder="选择部门"
            value={departmentFilter}
            onChange={setDepartmentFilter}
            style={{ width: 120 }}
          >
            <Select.Option value="all">全部部门</Select.Option>
            {departments.map(dept => (
              <Select.Option key={dept} value={dept}>
                {dept}
              </Select.Option>
            ))}
          </Select>
          {selectedRowKeys.length > 0 && (
            <Space>
              <span className={styles.selectedCount}>
                已选择 {selectedRowKeys.length} 项
              </span>
              <Button size="small" onClick={() => handleBatchOperation('激活')}>
                批量激活
              </Button>
              <Button size="small" onClick={() => handleBatchOperation('锁定')}>
                批量锁定
              </Button>
              <Popconfirm
                title="确定要删除选中的用户吗？"
                onConfirm={handleBatchDelete}
                okText="确定"
                cancelText="取消"
              >
                <Button size="small" danger>
                  批量删除
                </Button>
              </Popconfirm>
            </Space>
          )}
        </Space>
      </div>

      <div className={styles.tableContainer}>
        <Table
          columns={columns}
          dataSource={filteredUsers}
          rowKey="id"
          rowSelection={rowSelection}
          scroll={{ x: 1400 }}
          pagination={{
            total: filteredUsers.length,
            pageSize: 10,
            showSizeChanger: true,
            showTotal: total => `共 ${total} 条`,
          }}
        />
      </div>

      {/* 用户表单弹窗 */}
      <UserFormModal
        visible={isFormModalVisible}
        user={editingUser}
        onCancel={() => {
          setIsFormModalVisible(false);
          setEditingUser(null);
        }}
        onSave={handleSave}
      />

      {/* 用户详情弹窗 */}
      <UserDetailModal
        visible={isDetailModalVisible}
        user={viewingUser}
        onCancel={() => {
          setIsDetailModalVisible(false);
          setViewingUser(null);
        }}
        onEdit={handleEdit}
      />

      {/* 设备管理弹窗 */}
      <DeviceManagementModal
        visible={isDeviceModalVisible}
        userId={deviceUserId}
        onCancel={() => {
          setIsDeviceModalVisible(false);
          setDeviceUserId(null);
        }}
      />

      {/* 密码策略弹窗 */}
      <PasswordPolicyModal
        visible={isPasswordPolicyModalVisible}
        onCancel={() => setIsPasswordPolicyModalVisible(false)}
      />
    </div>
  );
};

export default UserManagement;





