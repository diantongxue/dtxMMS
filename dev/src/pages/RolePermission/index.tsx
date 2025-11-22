import { useState, useEffect } from 'react';
import {
  Button,
  Table,
  Modal,
  Form,
  Input,
  Tree,
  Switch,
  Tabs,
  message,
  Space,
  Tag,
  InputNumber,
  Radio,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { DataNode } from 'antd/es/tree';
import Skeleton from '../../components/Skeleton';
// import Loading from '../../components/Loading'; // 保留用于未来扩展
import styles from './styles.module.css';

const { TabPane } = Tabs;
const { TextArea } = Input;

// 角色数据类型
interface Role {
  id: string;
  name: string;
  code: string;
  description: string;
  status: 'active' | 'inactive';
  userCount: number;
  createTime: string;
  updateTime: string;
}

// 权限数据类型
interface Permission {
  id: string;
  name: string;
  code: string;
  type: 'function' | 'menu' | 'button' | 'data';
  parentId?: string;
  children?: Permission[];
}

// 用户权限数据类型
interface UserPermission {
  userId: string;
  userName: string;
  roleIds: string[];
  customPermissions: string[];
}

const RolePermission: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [, setUsers] = useState<UserPermission[]>([]); // 保留用于未来扩展
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isPermissionModalVisible, setIsPermissionModalVisible] =
    useState(false);
  const [isUserPermissionModalVisible, setIsUserPermissionModalVisible] =
    useState(false);
  const [isCacheConfigModalVisible, setIsCacheConfigModalVisible] =
    useState(false);
  const [form] = Form.useForm();
  const [permissionForm] = Form.useForm();
  const [userPermissionForm] = Form.useForm();
  const [cacheConfigForm] = Form.useForm();
  const [checkedKeys, setCheckedKeys] = useState<React.Key[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [autoExpandParent, setAutoExpandParent] = useState(true);
  const [activeTab, setActiveTab] = useState('function');
  const [cacheConfig, setCacheConfig] = useState({
    immediateRefresh: true,
    scheduledRefresh: true,
    refreshInterval: 30, // 分钟
  });

  // 模拟数据加载
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 800));

      // 模拟角色数据
      setRoles([
        {
          id: 'role-1',
          name: '超级管理员',
          code: 'super_admin',
          description: '拥有所有权限',
          status: 'active',
          userCount: 1,
          createTime: '2024-01-01 10:00:00',
          updateTime: '2024-01-01 10:00:00',
        },
        {
          id: 'role-2',
          name: '管理员',
          code: 'admin',
          description: '拥有大部分管理权限',
          status: 'active',
          userCount: 5,
          createTime: '2024-01-01 10:00:00',
          updateTime: '2024-01-01 10:00:00',
        },
        {
          id: 'role-3',
          name: '财务人员',
          code: 'finance',
          description: '拥有财务相关权限',
          status: 'active',
          userCount: 3,
          createTime: '2024-01-01 10:00:00',
          updateTime: '2024-01-01 10:00:00',
        },
        {
          id: 'role-4',
          name: '普通员工',
          code: 'employee',
          description: '基础权限',
          status: 'active',
          userCount: 20,
          createTime: '2024-01-01 10:00:00',
          updateTime: '2024-01-01 10:00:00',
        },
      ]);

      // 模拟权限数据
      setPermissions([
        // 功能权限
        {
          id: 'perm-1',
          name: '财务管理',
          code: 'finance',
          type: 'function',
          children: [
            {
              id: 'perm-1-1',
              name: '财务报表',
              code: 'finance-report',
              type: 'function',
              children: [
                {
                  id: 'perm-1-1-1',
                  name: '查看报表',
                  code: 'finance-report-view',
                  type: 'function',
                },
                {
                  id: 'perm-1-1-2',
                  name: '导出报表',
                  code: 'finance-report-export',
                  type: 'function',
                },
                {
                  id: 'perm-1-1-3',
                  name: '编辑报表',
                  code: 'finance-report-edit',
                  type: 'function',
                },
              ],
            },
            {
              id: 'perm-1-2',
              name: '财务审批',
              code: 'finance-approval',
              type: 'function',
              children: [
                {
                  id: 'perm-1-2-1',
                  name: '审批申请',
                  code: 'finance-approval-apply',
                  type: 'function',
                },
                {
                  id: 'perm-1-2-2',
                  name: '审批记录',
                  code: 'finance-approval-record',
                  type: 'function',
                },
              ],
            },
          ],
        },
        {
          id: 'perm-2',
          name: '销售管理',
          code: 'sales',
          type: 'function',
          children: [
            {
              id: 'perm-2-1',
              name: '销售订单',
              code: 'sales-order',
              type: 'function',
            },
            {
              id: 'perm-2-2',
              name: '销售统计',
              code: 'sales-statistics',
              type: 'function',
            },
          ],
        },
        {
          id: 'perm-3',
          name: '用户管理',
          code: 'user',
          type: 'function',
          children: [
            {
              id: 'perm-3-1',
              name: '用户列表',
              code: 'user-list',
              type: 'function',
            },
            {
              id: 'perm-3-2',
              name: '用户编辑',
              code: 'user-edit',
              type: 'function',
            },
            {
              id: 'perm-3-3',
              name: '用户删除',
              code: 'user-delete',
              type: 'function',
            },
          ],
        },
        // 菜单权限
        {
          id: 'menu-perm-1',
          name: '看板',
          code: 'menu-dashboard',
          type: 'menu',
          children: [
            {
              id: 'menu-perm-1-1',
              name: '数据看板',
              code: 'menu-dashboard-data',
              type: 'menu',
            },
          ],
        },
        {
          id: 'menu-perm-2',
          name: '管理',
          code: 'menu-management',
          type: 'menu',
          children: [
            {
              id: 'menu-perm-2-1',
              name: '销售管理',
              code: 'menu-sales',
              type: 'menu',
            },
            {
              id: 'menu-perm-2-2',
              name: '财务管理',
              code: 'menu-finance',
              type: 'menu',
            },
          ],
        },
        {
          id: 'menu-perm-3',
          name: '设置',
          code: 'menu-settings',
          type: 'menu',
          children: [
            {
              id: 'menu-perm-3-1',
              name: '用户管理',
              code: 'menu-user',
              type: 'menu',
            },
            {
              id: 'menu-perm-3-2',
              name: '角色管理',
              code: 'menu-role',
              type: 'menu',
            },
            {
              id: 'menu-perm-3-3',
              name: '权限管理',
              code: 'menu-permission',
              type: 'menu',
            },
          ],
        },
        // 按钮权限
        {
          id: 'btn-perm-1',
          name: '财务操作',
          code: 'btn-finance',
          type: 'button',
          children: [
            {
              id: 'btn-perm-1-1',
              name: '导出按钮',
              code: 'btn-finance-export',
              type: 'button',
            },
            {
              id: 'btn-perm-1-2',
              name: '删除按钮',
              code: 'btn-finance-delete',
              type: 'button',
            },
            {
              id: 'btn-perm-1-3',
              name: '编辑按钮',
              code: 'btn-finance-edit',
              type: 'button',
            },
          ],
        },
        {
          id: 'btn-perm-2',
          name: '用户操作',
          code: 'btn-user',
          type: 'button',
          children: [
            {
              id: 'btn-perm-2-1',
              name: '添加用户',
              code: 'btn-user-add',
              type: 'button',
            },
            {
              id: 'btn-perm-2-2',
              name: '编辑用户',
              code: 'btn-user-edit',
              type: 'button',
            },
            {
              id: 'btn-perm-2-3',
              name: '删除用户',
              code: 'btn-user-delete',
              type: 'button',
            },
          ],
        },
      ]);

      // 模拟用户数据
      setUsers([
        {
          userId: 'user-1',
          userName: '张三',
          roleIds: ['role-1'],
          customPermissions: [],
        },
        {
          userId: 'user-2',
          userName: '李四',
          roleIds: ['role-2'],
          customPermissions: ['perm-1-1-1'],
        },
        {
          userId: 'user-3',
          userName: '王五',
          roleIds: ['role-3'],
          customPermissions: ['perm-1-1-1', 'perm-1-1-2'],
        },
      ]);

      setIsLoading(false);
    };

    loadData();
  }, []);

  // 表格列定义
  const columns: ColumnsType<Role> = [
    {
      title: '角色名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
    },
    {
      title: '角色代码',
      dataIndex: 'code',
      key: 'code',
      width: 150,
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Tag color={status === 'active' ? 'success' : 'default'}>
          {status === 'active' ? '启用' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '用户数量',
      dataIndex: 'userCount',
      key: 'userCount',
      width: 100,
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 180,
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            onClick={() => handleEditRole(record)}
          >
            编辑
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => handleConfigPermission(record)}
          >
            配置权限
          </Button>
          <Button
            type="link"
            size="small"
            danger
            onClick={() => handleDeleteRole(record)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  // 处理添加角色
  const handleAddRole = () => {
    setSelectedRole(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  // 处理编辑角色
  const handleEditRole = (role: Role) => {
    setSelectedRole(role);
    form.setFieldsValue(role);
    setIsModalVisible(true);
  };

  // 处理删除角色
  const handleDeleteRole = (role: Role) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除角色"${role.name}"吗？`,
      onOk: () => {
        setRoles(roles.filter(r => r.id !== role.id));
        message.success('删除成功');
      },
    });
  };

  // 处理配置权限
  const handleConfigPermission = (role: Role) => {
    setSelectedRole(role);
    // 模拟获取角色已有权限
    const rolePermissions = ['perm-1-1-1', 'perm-1-1-2', 'perm-2-1'];
    setCheckedKeys(rolePermissions);
    setIsPermissionModalVisible(true);
  };

  // 处理保存角色
  const handleSaveRole = async () => {
    try {
      const values = await form.validateFields();
      if (selectedRole) {
        // 更新角色
        setRoles(
          roles.map(r =>
            r.id === selectedRole.id
              ? { ...r, ...values, updateTime: new Date().toLocaleString() }
              : r
          )
        );
        message.success('更新成功');
      } else {
        // 添加角色
        const newRole: Role = {
          id: `role-${Date.now()}`,
          ...values,
          status: 'active',
          userCount: 0,
          createTime: new Date().toLocaleString(),
          updateTime: new Date().toLocaleString(),
        };
        setRoles([...roles, newRole]);
        message.success('添加成功');
      }
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  // 处理保存权限
  const handleSavePermission = async () => {
    if (!selectedRole) return;

    try {
      // 这里应该调用API保存权限
      message.success('权限配置保存成功');
      setIsPermissionModalVisible(false);
      setSelectedRole(null);
      setCheckedKeys([]);
    } catch (error) {
      message.error('权限配置保存失败');
    }
  };

  // 处理用户权限配置
  const handleUserPermission = () => {
    setIsUserPermissionModalVisible(true);
  };

  // 处理权限缓存配置
  const handleCacheConfig = () => {
    cacheConfigForm.setFieldsValue(cacheConfig);
    setIsCacheConfigModalVisible(true);
  };

  // 处理立即刷新权限缓存
  const handleRefreshCache = () => {
    message.loading('正在刷新权限缓存...', 0);
    setTimeout(() => {
      message.destroy();
      message.success('权限缓存刷新成功');
    }, 1000);
  };

  // 处理保存缓存配置
  const handleSaveCacheConfig = async () => {
    try {
      const values = await cacheConfigForm.validateFields();
      setCacheConfig(values);
      message.success('缓存配置保存成功');
      setIsCacheConfigModalVisible(false);
    } catch (error) {
      message.error('缓存配置保存失败');
    }
  };

  // 处理保存用户权限
  const handleSaveUserPermission = async () => {
    try {
      await userPermissionForm.validateFields();
      // values 保留用于未来扩展（保存用户权限数据）
      // 这里应该调用API保存用户权限
      message.success('用户权限配置保存成功');
      setIsUserPermissionModalVisible(false);
      userPermissionForm.resetFields();
    } catch (error) {
      message.error('用户权限配置保存失败');
    }
  };

  // 将权限数据转换为树形结构
  const convertPermissionsToTree = (perms: Permission[]): DataNode[] => {
    return perms.map(perm => ({
      title: (
        <span>
          {perm.name}
          <span className={styles.permissionCode}>({perm.code})</span>
        </span>
      ),
      key: perm.id,
      children: perm.children
        ? convertPermissionsToTree(perm.children)
        : undefined,
    }));
  };

  // 权限树节点选中变化
  const onCheck = (
    checked: React.Key[] | { checked: React.Key[]; halfChecked: React.Key[] }
  ) => {
    const checkedKeysArray = Array.isArray(checked) ? checked : checked.checked;
    setCheckedKeys(checkedKeysArray);
  };

  // 权限树节点展开变化
  const onExpand = (expandedKeysValue: React.Key[]) => {
    setExpandedKeys(expandedKeysValue);
    setAutoExpandParent(false);
  };

  if (isLoading) {
    return (
      <div className={styles.rolePermission}>
        <div className={styles.contentHeader}>
          <Skeleton title rows={1} />
        </div>
        <div className={styles.tableContainer}>
          <Skeleton rows={5} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.rolePermission}>
      <div className={styles.contentHeader}>
        <div>
          <h1 className={styles.contentTitle}>角色权限管理</h1>
          <p className={styles.contentSubtitle}>管理系统角色和权限配置</p>
        </div>
        <Space>
          <Button type="primary" onClick={handleAddRole}>
            添加角色
          </Button>
          <Button onClick={handleUserPermission}>用户权限配置</Button>
          <Button onClick={handleCacheConfig}>缓存配置</Button>
          <Button onClick={handleRefreshCache}>立即刷新缓存</Button>
        </Space>
      </div>

      <div className={styles.tableContainer}>
        <Table
          columns={columns}
          dataSource={roles}
          rowKey="id"
          pagination={{
            total: roles.length,
            pageSize: 10,
            showSizeChanger: true,
            showTotal: total => `共 ${total} 条`,
          }}
        />
      </div>

      {/* 角色添加/编辑弹窗 */}
      <Modal
        title={selectedRole ? '编辑角色' : '添加角色'}
        open={isModalVisible}
        onOk={handleSaveRole}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="角色名称"
            rules={[{ required: true, message: '请输入角色名称' }]}
          >
            <Input placeholder="请输入角色名称" />
          </Form.Item>
          <Form.Item
            name="code"
            label="角色代码"
            rules={[{ required: true, message: '请输入角色代码' }]}
          >
            <Input placeholder="请输入角色代码，如：admin" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <TextArea rows={4} placeholder="请输入角色描述" />
          </Form.Item>
          <Form.Item name="status" label="状态" initialValue="active">
            <Switch
              checkedChildren="启用"
              unCheckedChildren="禁用"
              defaultChecked
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* 权限配置弹窗 */}
      <Modal
        title={`配置权限 - ${selectedRole?.name}`}
        open={isPermissionModalVisible}
        onOk={handleSavePermission}
        onCancel={() => {
          setIsPermissionModalVisible(false);
          setSelectedRole(null);
          setCheckedKeys([]);
        }}
        width={800}
        okText="保存"
        cancelText="取消"
      >
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="功能权限" key="function">
            <div className={styles.permissionTreeContainer}>
              <Tree
                checkable
                onExpand={onExpand}
                expandedKeys={expandedKeys}
                autoExpandParent={autoExpandParent}
                onCheck={onCheck}
                checkedKeys={checkedKeys}
                treeData={convertPermissionsToTree(
                  permissions.filter(p => p.type === 'function')
                )}
              />
            </div>
          </TabPane>
          <TabPane tab="菜单权限" key="menu">
            <div className={styles.permissionTreeContainer}>
              <Tree
                checkable
                onExpand={onExpand}
                expandedKeys={expandedKeys}
                autoExpandParent={autoExpandParent}
                onCheck={onCheck}
                checkedKeys={checkedKeys}
                treeData={convertPermissionsToTree(
                  permissions.filter(p => p.type === 'menu')
                )}
              />
            </div>
          </TabPane>
          <TabPane tab="按钮权限" key="button">
            <div className={styles.permissionTreeContainer}>
              <Tree
                checkable
                onExpand={onExpand}
                expandedKeys={expandedKeys}
                autoExpandParent={autoExpandParent}
                onCheck={onCheck}
                checkedKeys={checkedKeys}
                treeData={convertPermissionsToTree(
                  permissions.filter(p => p.type === 'button')
                )}
              />
            </div>
          </TabPane>
          <TabPane tab="数据权限" key="data">
            <Form form={permissionForm} layout="vertical">
              <Form.Item
                label="数据权限模式"
                name="dataPermissionMode"
                initialValue="mixed"
              >
                <Radio.Group>
                  <Radio value="mixed">混合模式（多种规则组合）</Radio>
                  <Radio value="preset">预设规则</Radio>
                  <Radio value="custom">完全自定义</Radio>
                </Radio.Group>
              </Form.Item>
              <Form.Item
                noStyle
                shouldUpdate={(prevValues, currentValues) =>
                  prevValues.dataPermissionMode !==
                  currentValues.dataPermissionMode
                }
              >
                {({ getFieldValue }) => {
                  const mode = getFieldValue('dataPermissionMode');
                  if (mode === 'preset') {
                    return (
                      <Form.Item label="选择预设规则" name="presetRule">
                        <Radio.Group>
                          <Radio value="all">全部数据</Radio>
                          <Radio value="department">本部门数据</Radio>
                          <Radio value="self">仅本人数据</Radio>
                          <Radio value="subordinate">本人及下属数据</Radio>
                        </Radio.Group>
                      </Form.Item>
                    );
                  }
                  if (mode === 'custom') {
                    return (
                      <Form.Item label="自定义规则" name="customRule">
                        <TextArea
                          rows={8}
                          placeholder='请输入自定义数据权限规则，支持JSON格式，例如：{"type": "department", "ids": ["dept-1", "dept-2"]}'
                        />
                      </Form.Item>
                    );
                  }
                  // 混合模式
                  return (
                    <Form.Item label="数据权限规则" name="dataPermissionRule">
                      <Tabs type="card">
                        <TabPane tab="按部门" key="department">
                          <Tree
                            checkable
                            treeData={[
                              {
                                title: '技术部',
                                key: 'dept-1',
                                children: [
                                  { title: '前端组', key: 'dept-1-1' },
                                  { title: '后端组', key: 'dept-1-2' },
                                ],
                              },
                              { title: '财务部', key: 'dept-2' },
                              { title: '销售部', key: 'dept-3' },
                            ]}
                          />
                        </TabPane>
                        <TabPane tab="按店铺" key="shop">
                          <Tree
                            checkable
                            treeData={[
                              { title: '店铺A', key: 'shop-1' },
                              { title: '店铺B', key: 'shop-2' },
                              { title: '店铺C', key: 'shop-3' },
                            ]}
                          />
                        </TabPane>
                        <TabPane tab="按用户" key="user">
                          <Tree
                            checkable
                            treeData={[
                              { title: '用户组1', key: 'user-group-1' },
                              { title: '用户组2', key: 'user-group-2' },
                            ]}
                          />
                        </TabPane>
                        <TabPane tab="自定义规则" key="custom">
                          <TextArea
                            rows={6}
                            placeholder="请输入自定义数据权限规则，支持JSON格式"
                          />
                        </TabPane>
                      </Tabs>
                    </Form.Item>
                  );
                }}
              </Form.Item>
            </Form>
          </TabPane>
        </Tabs>
      </Modal>

      {/* 用户权限配置弹窗 */}
      <Modal
        title="用户权限配置"
        open={isUserPermissionModalVisible}
        onOk={handleSaveUserPermission}
        onCancel={() => {
          setIsUserPermissionModalVisible(false);
          userPermissionForm.resetFields();
        }}
        width={800}
      >
        <Form form={userPermissionForm} layout="vertical">
          <Form.Item
            name="userId"
            label="选择用户"
            rules={[{ required: true, message: '请选择用户' }]}
          >
            <Input placeholder="请输入或选择用户" />
          </Form.Item>
          <Form.Item name="roleIds" label="分配角色">
            <Tree
              checkable
              treeData={roles.map(role => ({
                title: role.name,
                key: role.id,
              }))}
            />
          </Form.Item>
          <Form.Item name="customPermissions" label="自定义权限">
            <Tree checkable treeData={convertPermissionsToTree(permissions)} />
          </Form.Item>
        </Form>
      </Modal>

      {/* 权限缓存配置弹窗 */}
      <Modal
        title="权限缓存配置"
        open={isCacheConfigModalVisible}
        onOk={handleSaveCacheConfig}
        onCancel={() => {
          setIsCacheConfigModalVisible(false);
        }}
        width={600}
      >
        <Form form={cacheConfigForm} layout="vertical">
          <Form.Item
            name="immediateRefresh"
            label="立即生效"
            valuePropName="checked"
            tooltip="权限变更后立即清除缓存，用户下次请求时重新加载权限"
          >
            <Switch checkedChildren="启用" unCheckedChildren="禁用" />
          </Form.Item>
          <Form.Item
            name="scheduledRefresh"
            label="定时刷新"
            valuePropName="checked"
            tooltip="定期检查权限变更并刷新缓存"
          >
            <Switch checkedChildren="启用" unCheckedChildren="禁用" />
          </Form.Item>
          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) =>
              prevValues.scheduledRefresh !== currentValues.scheduledRefresh
            }
          >
            {({ getFieldValue }) =>
              getFieldValue('scheduledRefresh') ? (
                <Form.Item
                  name="refreshInterval"
                  label="刷新间隔（分钟）"
                  rules={[
                    { required: true, message: '请输入刷新间隔' },
                    { type: 'number', min: 1, message: '刷新间隔至少1分钟' },
                  ]}
                >
                  <InputNumber
                    min={1}
                    max={1440}
                    style={{ width: '100%' }}
                    placeholder="请输入刷新间隔，单位：分钟"
                  />
                </Form.Item>
              ) : null
            }
          </Form.Item>
          <Form.Item label="缓存说明">
            <div className={styles.cacheInfo}>
              <p>• 立即生效：权限变更后立即清除所有用户的权限缓存</p>
              <p>• 定时刷新：系统会定期检查权限变更并自动刷新缓存</p>
              <p>• 建议同时启用两种方式，确保权限及时更新</p>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RolePermission;
