import { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Input,
  Select,
  Modal,
  Tabs,
  message,
  Space,
  Tag,
  Popconfirm,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  HistoryOutlined,
  // RollbackOutlined, // 保留用于未来扩展
  // SwapOutlined, // 保留用于未来扩展
  UserOutlined,
} from '@ant-design/icons';
import Skeleton from '../../components/Skeleton';
import styles from './styles.module.css';

const { Search } = Input;
const { Option } = Select;

// 流程状态枚举
type ProcessStatus =
  | 'draft'
  | 'running'
  | 'completed'
  | 'rejected'
  | 'cancelled';

// 节点类型枚举
type NodeType = 'start' | 'approval' | 'condition' | 'end';

// 审批类型枚举
type ApprovalType = 'single' | 'all' | 'any' | 'condition';

// 流程数据接口
interface ProcessItem {
  id: string;
  name: string;
  category: string;
  status: ProcessStatus;
  creator: string;
  createTime: string;
  updateTime: string;
  nodeCount: number;
  runningCount: number;
}

// 流程节点接口
interface ProcessNode {
  id: string;
  type: NodeType;
  name: string;
  approvalType?: ApprovalType;
  approvers?: string[];
  condition?: string;
  x: number;
  y: number;
}

// 流程历史记录接口
interface ProcessHistory {
  id: string;
  processId: string;
  action: string;
  operator: string;
  operatorName: string;
  operateTime: string;
  comment?: string;
  result: 'approved' | 'rejected' | 'transferred' | 'delegated';
}

const ApprovalProcess: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [processList, setProcessList] = useState<ProcessItem[]>([]);
  const [selectedProcess, setSelectedProcess] = useState<ProcessItem | null>(
    null
  );
  const [, setActiveTab] = useState('list'); // 保留用于未来扩展
  const [isDesignerOpen, setIsDesignerOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [actionType] = useState<
    'withdraw' | 'transfer' | 'delegate'
  >('withdraw');
  // setActionType 保留用于未来扩展
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [nodes, setNodes] = useState<ProcessNode[]>([]);
  const [historyList, setHistoryList] = useState<ProcessHistory[]>([]);

  // 加载流程列表
  useEffect(() => {
    const loadProcessList = async () => {
      setIsLoading(true);
      // 模拟API请求延迟
      await new Promise(resolve => setTimeout(resolve, 800));

      const mockData: ProcessItem[] = [
        {
          id: 'process-001',
          name: '请假审批流程',
          category: '人事管理',
          status: 'running',
          creator: '张三',
          createTime: '2024-01-15 10:30:00',
          updateTime: '2024-01-20 14:20:00',
          nodeCount: 5,
          runningCount: 3,
        },
        {
          id: 'process-002',
          name: '采购审批流程',
          category: '采购管理',
          status: 'draft',
          creator: '李四',
          createTime: '2024-01-18 09:15:00',
          updateTime: '2024-01-18 09:15:00',
          nodeCount: 4,
          runningCount: 0,
        },
        {
          id: 'process-003',
          name: '报销审批流程',
          category: '财务管理',
          status: 'completed',
          creator: '王五',
          createTime: '2024-01-10 11:00:00',
          updateTime: '2024-01-19 16:45:00',
          nodeCount: 6,
          runningCount: 0,
        },
        {
          id: 'process-004',
          name: '合同审批流程',
          category: '法务管理',
          status: 'running',
          creator: '赵六',
          createTime: '2024-01-12 13:20:00',
          updateTime: '2024-01-20 10:30:00',
          nodeCount: 7,
          runningCount: 2,
        },
      ];

      setProcessList(mockData);
      setIsLoading(false);
    };

    loadProcessList();
  }, []);

  // 加载流程历史记录
  const loadHistory = async (processId: string) => {
    // 模拟API请求
    await new Promise(resolve => setTimeout(resolve, 500));

    const mockHistory: ProcessHistory[] = [
      {
        id: 'history-001',
        processId,
        action: '提交审批',
        operator: 'user-001',
        operatorName: '张三',
        operateTime: '2024-01-20 09:00:00',
        result: 'approved',
      },
      {
        id: 'history-002',
        processId,
        action: '审批通过',
        operator: 'user-002',
        operatorName: '李四',
        operateTime: '2024-01-20 10:30:00',
        comment: '同意申请',
        result: 'approved',
      },
      {
        id: 'history-003',
        processId,
        action: '转办',
        operator: 'user-003',
        operatorName: '王五',
        operateTime: '2024-01-20 11:15:00',
        comment: '转办给财务部门',
        result: 'transferred',
      },
    ];

    setHistoryList(mockHistory);
  };

  // 获取状态标签
  const getStatusTag = (status: ProcessStatus) => {
    const statusMap = {
      draft: { color: 'default', text: '草稿' },
      running: { color: 'processing', text: '运行中' },
      completed: { color: 'success', text: '已完成' },
      rejected: { color: 'error', text: '已拒绝' },
      cancelled: { color: 'warning', text: '已取消' },
    };
    const config = statusMap[status];
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  // 过滤流程列表
  const filteredProcessList = processList.filter(process => {
    const matchSearch =
      process.name.toLowerCase().includes(searchText.toLowerCase()) ||
      process.category.toLowerCase().includes(searchText.toLowerCase());
    const matchStatus =
      statusFilter === 'all' || process.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // 表格列定义
  const columns = [
    {
      title: '流程名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 150,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: ProcessStatus) => getStatusTag(status),
    },
    {
      title: '创建人',
      dataIndex: 'creator',
      key: 'creator',
      width: 120,
    },
    {
      title: '节点数',
      dataIndex: 'nodeCount',
      key: 'nodeCount',
      width: 100,
    },
    {
      title: '运行中',
      dataIndex: 'runningCount',
      key: 'runningCount',
      width: 100,
      render: (count: number) => (
        <Tag color={count > 0 ? 'processing' : 'default'}>{count}</Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 180,
    },
    {
      title: '更新时间',
      dataIndex: 'updateTime',
      key: 'updateTime',
      width: 180,
    },
    {
      title: '操作',
      key: 'action',
      width: 280,
      // 遵循宪法.md第13.1.1节TypeScript规范：禁止使用any类型
      render: (_: unknown, record: ProcessItem) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewProcess(record)}
          >
            查看
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEditProcess(record)}
          >
            编辑
          </Button>
          <Button
            type="link"
            icon={<HistoryOutlined />}
            onClick={() => handleViewHistory(record)}
          >
            历史
          </Button>
          <Popconfirm
            title="确定要删除这个流程吗？"
            onConfirm={() => handleDeleteProcess(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // 查看流程
  const handleViewProcess = (process: ProcessItem) => {
    setSelectedProcess(process);
    setActiveTab('designer');
    setIsDesignerOpen(true);
  };

  // 编辑流程
  const handleEditProcess = (process: ProcessItem) => {
    setSelectedProcess(process);
    setActiveTab('designer');
    setIsDesignerOpen(true);
    // 加载流程节点数据
    loadProcessNodes(process.id);
  };

  // 查看历史
  const handleViewHistory = async (process: ProcessItem) => {
    setSelectedProcess(process);
    await loadHistory(process.id);
    setIsHistoryOpen(true);
  };

  // 删除流程
  const handleDeleteProcess = (id: string) => {
    setProcessList(processList.filter(p => p.id !== id));
    message.success('删除成功');
  };

  // 加载流程节点（遵循宪法.md第13.1.1节TypeScript规范：未使用的参数使用下划线前缀）
  const loadProcessNodes = async (_processId: string) => {
    // 模拟API请求
    await new Promise(resolve => setTimeout(resolve, 300));

    const mockNodes: ProcessNode[] = [
      { id: 'node-1', type: 'start', name: '开始', x: 100, y: 100 },
      {
        id: 'node-2',
        type: 'approval',
        name: '部门审批',
        approvalType: 'single',
        approvers: ['user-001'],
        x: 100,
        y: 200,
      },
      {
        id: 'node-3',
        type: 'approval',
        name: '财务审批',
        approvalType: 'all',
        approvers: ['user-002', 'user-003'],
        x: 100,
        y: 300,
      },
      { id: 'node-4', type: 'end', name: '结束', x: 100, y: 400 },
    ];

    setNodes(mockNodes);
  };

  // 打开操作弹窗（撤回/转办/委托）（保留用于未来扩展）
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // const _handleOpenActionModal = (
  //   _type: 'withdraw' | 'transfer' | 'delegate'
  // ) => {
  //   setActionType(type);
  //   setIsActionModalOpen(true);
  // };

  // 提交操作
  const handleSubmitAction = () => {
    message.success(
      `${actionType === 'withdraw' ? '撤回' : actionType === 'transfer' ? '转办' : '委托'}成功`
    );
    setIsActionModalOpen(false);
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <Skeleton title rows={1} />
        </div>
        <div className={styles.content}>
          <Skeleton rows={8} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>审批流程管理</h1>
          <p className={styles.subtitle}>管理和配置审批流程，支持可视化设计</p>
        </div>
        <div className={styles.headerRight}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setSelectedProcess(null);
              setActiveTab('designer');
              setIsDesignerOpen(true);
            }}
          >
            新建流程
          </Button>
        </div>
      </div>

      <div className={styles.toolbar}>
        <Space>
          <Search
            placeholder="搜索流程名称或分类"
            allowClear
            style={{ width: 300 }}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
          />
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 150 }}
          >
            <Option value="all">全部状态</Option>
            <Option value="draft">草稿</Option>
            <Option value="running">运行中</Option>
            <Option value="completed">已完成</Option>
            <Option value="rejected">已拒绝</Option>
            <Option value="cancelled">已取消</Option>
          </Select>
        </Space>
      </div>

      <div className={styles.content}>
        <Table
          columns={columns}
          dataSource={filteredProcessList}
          rowKey="id"
          pagination={{
            total: filteredProcessList.length,
            pageSize: 10,
            showSizeChanger: true,
            showTotal: total => `共 ${total} 条`,
          }}
        />
      </div>

      {/* 流程设计器弹窗 */}
      <Modal
        title={selectedProcess ? '编辑流程' : '新建流程'}
        open={isDesignerOpen}
        onCancel={() => setIsDesignerOpen(false)}
        width={1200}
        footer={null}
        destroyOnClose
      >
        <ProcessDesigner
          process={selectedProcess}
          nodes={nodes}
          onNodesChange={setNodes}
          onSave={() => {
            message.success('保存成功');
            setIsDesignerOpen(false);
          }}
        />
      </Modal>

      {/* 流程历史记录弹窗 */}
      <Modal
        title="流程历史记录"
        open={isHistoryOpen}
        onCancel={() => setIsHistoryOpen(false)}
        width={800}
        footer={null}
      >
        <ProcessHistory historyList={historyList} />
      </Modal>

      {/* 流程操作弹窗（撤回/转办/委托） */}
      <Modal
        title={
          actionType === 'withdraw'
            ? '撤回流程'
            : actionType === 'transfer'
              ? '转办流程'
              : '委托流程'
        }
        open={isActionModalOpen}
        onOk={handleSubmitAction}
        onCancel={() => setIsActionModalOpen(false)}
        width={600}
      >
        <ProcessActionForm type={actionType} />
      </Modal>
    </div>
  );
};

// 流程设计器组件
interface ProcessDesignerProps {
  process: ProcessItem | null;
  nodes: ProcessNode[];
  onNodesChange: (nodes: ProcessNode[]) => void;
  onSave: () => void;
}

const ProcessDesigner: React.FC<ProcessDesignerProps> = ({
  process: _process, // 遵循宪法.md第13.1.1节TypeScript规范：未使用的参数使用下划线前缀
  nodes,
  onNodesChange,
  onSave,
}) => {
  // process 参数保留用于未来扩展
  const [activeTab, setActiveTab] = useState('design');
  const [selectedNode, setSelectedNode] = useState<ProcessNode | null>(null);

  const tabItems = [
    {
      key: 'design',
      label: '流程设计',
      children: (
        <div className={styles.designerCanvas}>
          <div className={styles.designerToolbar}>
            <Space>
              <Button size="small">开始节点</Button>
              <Button size="small">审批节点</Button>
              <Button size="small">条件分支</Button>
              <Button size="small">结束节点</Button>
            </Space>
          </div>
          <div className={styles.canvasArea}>
            {nodes.length === 0 ? (
              <div className={styles.emptyCanvas}>
                <p>拖拽左侧节点到画布开始设计流程</p>
              </div>
            ) : (
              <div className={styles.nodesContainer}>
                {nodes.map(node => (
                  <div
                    key={node.id}
                    className={`${styles.node} ${selectedNode?.id === node.id ? styles.selected : ''}`}
                    style={{ left: node.x, top: node.y }}
                    onClick={() => setSelectedNode(node)}
                  >
                    <div className={styles.nodeContent}>
                      <div className={styles.nodeIcon}>
                        {node.type === 'start' && '▶'}
                        {node.type === 'approval' && <UserOutlined />}
                        {node.type === 'condition' && '?'}
                        {node.type === 'end' && '■'}
                      </div>
                      <div className={styles.nodeName}>{node.name}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'config',
      label: '节点配置',
      children: selectedNode ? (
        <NodeConfigForm
          node={selectedNode}
          onNodeChange={updatedNode => {
            const newNodes = nodes.map(n =>
              n.id === updatedNode.id ? updatedNode : n
            );
            onNodesChange(newNodes);
            setSelectedNode(updatedNode);
          }}
        />
      ) : (
        <div className={styles.emptyConfig}>
          <p>请先选择一个节点进行配置</p>
        </div>
      ),
    },
  ];

  return (
    <div className={styles.designer}>
      <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
      <div className={styles.designerFooter}>
        <Space>
          <Button onClick={() => {}}>取消</Button>
          <Button type="primary" onClick={onSave}>
            保存
          </Button>
        </Space>
      </div>
    </div>
  );
};

// 节点配置表单组件
interface NodeConfigFormProps {
  node: ProcessNode;
  onNodeChange: (node: ProcessNode) => void;
}

const NodeConfigForm: React.FC<NodeConfigFormProps> = ({
  node,
  onNodeChange,
}) => {
  const [formData, setFormData] = useState<ProcessNode>(node);

  useEffect(() => {
    setFormData(node);
  }, [node]);

  // 遵循宪法.md第13.1.1节TypeScript规范：禁止使用any类型，支持数组类型
  const handleChange = (field: keyof ProcessNode, value: string | number | boolean | string[] | undefined) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    onNodeChange(updated);
  };

  return (
    <div className={styles.nodeConfigForm}>
      <div className={styles.formItem}>
        <label>节点名称：</label>
        <Input
          value={formData.name}
          onChange={e => handleChange('name', e.target.value)}
        />
      </div>
      {formData.type === 'approval' && (
        <>
          <div className={styles.formItem}>
            <label>审批类型：</label>
            <Select
              value={formData.approvalType}
              onChange={value => handleChange('approvalType', value)}
              style={{ width: '100%' }}
            >
              <Option value="single">单人审批</Option>
              <Option value="all">会签（所有人同意）</Option>
              <Option value="any">或签（任一人同意）</Option>
              <Option value="condition">条件分支</Option>
            </Select>
          </div>
          <div className={styles.formItem}>
            <label>审批人：</label>
            <Select
              mode="multiple"
              value={formData.approvers}
              onChange={value => handleChange('approvers', value)}
              style={{ width: '100%' }}
              placeholder="选择审批人"
            >
              <Option value="user-001">张三</Option>
              <Option value="user-002">李四</Option>
              <Option value="user-003">王五</Option>
              <Option value="user-004">赵六</Option>
            </Select>
          </div>
        </>
      )}
      {formData.type === 'condition' && (
        <div className={styles.formItem}>
          <label>条件表达式：</label>
          <Input.TextArea
            value={formData.condition}
            onChange={e => handleChange('condition', e.target.value)}
            rows={4}
            placeholder="例如：amount > 10000"
          />
        </div>
      )}
    </div>
  );
};

// 流程历史记录组件
interface ProcessHistoryProps {
  historyList: ProcessHistory[];
}

const ProcessHistory: React.FC<ProcessHistoryProps> = ({ historyList }) => {
  const getResultTag = (result: string) => {
    const resultMap = {
      approved: { color: 'success', text: '通过' },
      rejected: { color: 'error', text: '拒绝' },
      transferred: { color: 'processing', text: '转办' },
      delegated: { color: 'warning', text: '委托' },
    };
    const config = resultMap[result as keyof typeof resultMap];
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  return (
    <div className={styles.historyList}>
      {historyList.length === 0 ? (
        <div className={styles.emptyHistory}>暂无历史记录</div>
      ) : (
        <div className={styles.historyTimeline}>
          {historyList.map((history, _index) => (
            <div key={history.id} className={styles.historyItem}>
              <div className={styles.historyDot} />
              <div className={styles.historyContent}>
                <div className={styles.historyHeader}>
                  <span className={styles.historyAction}>{history.action}</span>
                  {getResultTag(history.result)}
                </div>
                <div className={styles.historyInfo}>
                  <span>操作人：{history.operatorName}</span>
                  <span>时间：{history.operateTime}</span>
                </div>
                {history.comment && (
                  <div className={styles.historyComment}>
                    备注：{history.comment}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// 流程操作表单组件
interface ProcessActionFormProps {
  type: 'withdraw' | 'transfer' | 'delegate';
}

const ProcessActionForm: React.FC<ProcessActionFormProps> = ({ type }) => {
  const [comment, setComment] = useState('');

  return (
    <div className={styles.actionForm}>
      {type === 'transfer' && (
        <div className={styles.formItem}>
          <label>转办给：</label>
          <Select style={{ width: '100%' }} placeholder="选择转办对象">
            <Option value="user-001">张三</Option>
            <Option value="user-002">李四</Option>
            <Option value="user-003">王五</Option>
          </Select>
        </div>
      )}
      {type === 'delegate' && (
        <div className={styles.formItem}>
          <label>委托给：</label>
          <Select style={{ width: '100%' }} placeholder="选择委托对象">
            <Option value="user-001">张三</Option>
            <Option value="user-002">李四</Option>
            <Option value="user-003">王五</Option>
          </Select>
        </div>
      )}
      <div className={styles.formItem}>
        <label>备注：</label>
        <Input.TextArea
          value={comment}
          onChange={e => setComment(e.target.value)}
          rows={4}
          placeholder="请输入备注信息"
        />
      </div>
    </div>
  );
};

export default ApprovalProcess;
