import { useState, useEffect } from 'react';
import { Button, Tag, Modal, Form, Input, Select, Switch, message } from 'antd';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  BellOutlined,
  FilterOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import Skeleton from '../../components/Skeleton';
import styles from './styles.module.css';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Option } = Select;

// 待办事项类型定义
interface TodoItem {
  id: string;
  title: string;
  description?: string;
  category: 'approval' | 'task' | 'notification';
  priority: 'urgent' | 'important' | 'normal';
  status: 'pending' | 'processing' | 'completed';
  createTime: string;
  dueTime?: string;
  assignee?: string;
  creator: string;
  tags?: string[];
}

// 待办分类
const categoryMap = {
  approval: { label: '审批', color: '#3964fe' },
  task: { label: '任务', color: '#52c41a' },
  notification: { label: '通知', color: '#faad14' },
};

// 优先级
const priorityMap = {
  urgent: { label: '紧急', color: '#ff4d4f' },
  important: { label: '重要', color: '#faad14' },
  normal: { label: '普通', color: '#666666' },
};

const TodoList: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [todoList, setTodoList] = useState<TodoItem[]>([]);
  const [filteredList, setFilteredList] = useState<TodoItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [processModalVisible, setProcessModalVisible] = useState(false);
  const [reminderModalVisible, setReminderModalVisible] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState<TodoItem | null>(null);
  const [form] = Form.useForm();
  const [processForm] = Form.useForm();

  // 统计数据
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    completed: 0,
    urgent: 0,
    important: 0,
    normal: 0,
  });

  // 加载数据
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      // 模拟API请求延迟
      await new Promise(resolve => setTimeout(resolve, 800));

      // 模拟数据
      const mockData: TodoItem[] = [
        {
          id: 'todo-001',
          title: '审批销售订单',
          description: '需要审批编号为SO-2024-001的销售订单，金额为50000元',
          category: 'approval',
          priority: 'urgent',
          status: 'pending',
          createTime: '2024-01-15 09:00:00',
          dueTime: '2024-01-16 18:00:00',
          assignee: '张三',
          creator: '李四',
          tags: ['销售', '订单'],
        },
        {
          id: 'todo-002',
          title: '完成月度报表',
          description: '需要完成1月份的销售报表和财务分析',
          category: 'task',
          priority: 'important',
          status: 'processing',
          createTime: '2024-01-14 14:30:00',
          dueTime: '2024-01-20 18:00:00',
          assignee: '王五',
          creator: '赵六',
          tags: ['报表', '月度'],
        },
        {
          id: 'todo-003',
          title: '系统维护通知',
          description: '系统将于本周六晚上22:00-24:00进行维护升级',
          category: 'notification',
          priority: 'normal',
          status: 'pending',
          createTime: '2024-01-15 10:00:00',
          assignee: '所有人',
          creator: '系统管理员',
          tags: ['系统', '维护'],
        },
        {
          id: 'todo-004',
          title: '审批采购申请',
          description: '需要审批采购部门的采购申请，涉及金额30000元',
          category: 'approval',
          priority: 'important',
          status: 'pending',
          createTime: '2024-01-15 11:00:00',
          dueTime: '2024-01-17 18:00:00',
          assignee: '张三',
          creator: '采购部',
          tags: ['采购', '审批'],
        },
        {
          id: 'todo-005',
          title: '客户回访任务',
          description: '需要回访VIP客户，了解产品使用情况和满意度',
          category: 'task',
          priority: 'normal',
          status: 'completed',
          createTime: '2024-01-10 09:00:00',
          dueTime: '2024-01-15 18:00:00',
          assignee: '王五',
          creator: '销售经理',
          tags: ['客户', '回访'],
        },
      ];

      setTodoList(mockData);
      setFilteredList(mockData);
      calculateStats(mockData);
      setIsLoading(false);
    };

    loadData();
  }, []);

  // 计算统计数据
  const calculateStats = (list: TodoItem[]) => {
    const newStats = {
      total: list.length,
      pending: list.filter(item => item.status === 'pending').length,
      processing: list.filter(item => item.status === 'processing').length,
      completed: list.filter(item => item.status === 'completed').length,
      urgent: list.filter(item => item.priority === 'urgent').length,
      important: list.filter(item => item.priority === 'important').length,
      normal: list.filter(item => item.priority === 'normal').length,
    };
    setStats(newStats);
  };

  // 筛选待办事项
  useEffect(() => {
    let filtered = [...todoList];

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    if (selectedPriority !== 'all') {
      filtered = filtered.filter(item => item.priority === selectedPriority);
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(item => item.status === selectedStatus);
    }

    setFilteredList(filtered);
  }, [selectedCategory, selectedPriority, selectedStatus, todoList]);

  // 查看详情
  const handleViewDetail = (todo: TodoItem) => {
    setSelectedTodo(todo);
    setDetailModalVisible(true);
  };

  // 处理待办
  const handleProcess = (todo: TodoItem) => {
    setSelectedTodo(todo);
    processForm.resetFields();
    setProcessModalVisible(true);
  };

  // 提交处理（遵循宪法.md第13.1.1节TypeScript规范：禁止使用any类型）
  const handleProcessSubmit = async (values: Record<string, unknown>) => {
    try {
      // 模拟API请求
      await new Promise(resolve => setTimeout(resolve, 500));

      const updatedList = todoList.map(item => {
        if (item.id === selectedTodo?.id) {
          return {
            ...item,
            status: (
              values.action === 'approve' || values.action === 'complete'
                ? 'completed'
                : 'processing'
            ) as 'completed' | 'processing',
          };
        }
        return item;
      });

      setTodoList(updatedList);
      calculateStats(updatedList);
      setProcessModalVisible(false);
      message.success('处理成功');
    } catch (error) {
      message.error('处理失败，请重试');
    }
  };

  // 打开提醒设置
  const handleReminderSettings = () => {
    setReminderModalVisible(true);
  };

  // 提交提醒设置（遵循宪法.md第13.1.1节TypeScript规范：禁止使用any类型）
  const handleReminderSubmit = async (_values: Record<string, unknown>) => {
    try {
      // 模拟API请求
      await new Promise(resolve => setTimeout(resolve, 500));
      setReminderModalVisible(false);
      message.success('提醒设置已保存');
    } catch (error) {
      message.error('设置失败，请重试');
    }
  };

  if (isLoading) {
    return (
      <div className={styles.todoList}>
        <div className={styles.contentHeader}>
          <Skeleton title rows={1} />
        </div>
        <div className={styles.statsContainer}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className={styles.statCard}>
              <Skeleton title={false} rows={2} />
            </div>
          ))}
        </div>
        <div className={styles.filterContainer}>
          <Skeleton title={false} rows={1} />
        </div>
        <div className={styles.listContainer}>
          <Skeleton rows={5} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.todoList}>
      <div className={styles.contentHeader}>
        <div>
          <h1 className={styles.contentTitle}>待办事项</h1>
          <p className={styles.contentSubtitle}>管理和处理您的待办事项</p>
        </div>
        <div className={styles.headerActions}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => message.info('新增待办功能待开发')}
          >
            新增待办
          </Button>
          <Button icon={<BellOutlined />} onClick={handleReminderSettings}>
            提醒设置
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className={styles.statsContainer}>
        <div className={styles.statCard}>
          <div className={styles.statTitle}>总待办</div>
          <div className={styles.statValue}>{stats.total}</div>
          <div className={styles.statChange}>全部事项</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statTitle}>待处理</div>
          <div className={`${styles.statValue} ${styles.statValueWarning}`}>
            {stats.pending}
          </div>
          <div className={styles.statChange}>需要处理</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statTitle}>处理中</div>
          <div className={`${styles.statValue} ${styles.statValueInfo}`}>
            {stats.processing}
          </div>
          <div className={styles.statChange}>正在处理</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statTitle}>已完成</div>
          <div className={`${styles.statValue} ${styles.statValueSuccess}`}>
            {stats.completed}
          </div>
          <div className={styles.statChange}>已完成事项</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statTitle}>紧急</div>
          <div className={`${styles.statValue} ${styles.statValueDanger}`}>
            {stats.urgent}
          </div>
          <div className={styles.statChange}>紧急事项</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statTitle}>重要</div>
          <div className={`${styles.statValue} ${styles.statValueWarning}`}>
            {stats.important}
          </div>
          <div className={styles.statChange}>重要事项</div>
        </div>
      </div>

      {/* 筛选器 */}
      <div className={styles.filterContainer}>
        <div className={styles.filterLabel}>
          <FilterOutlined /> 筛选条件
        </div>
        <div className={styles.filterButtons}>
          <Button
            type={selectedCategory === 'all' ? 'primary' : 'default'}
            onClick={() => setSelectedCategory('all')}
          >
            全部分类
          </Button>
          <Button
            type={selectedCategory === 'approval' ? 'primary' : 'default'}
            onClick={() => setSelectedCategory('approval')}
          >
            审批
          </Button>
          <Button
            type={selectedCategory === 'task' ? 'primary' : 'default'}
            onClick={() => setSelectedCategory('task')}
          >
            任务
          </Button>
          <Button
            type={selectedCategory === 'notification' ? 'primary' : 'default'}
            onClick={() => setSelectedCategory('notification')}
          >
            通知
          </Button>
        </div>
        <div className={styles.filterButtons}>
          <Button
            type={selectedPriority === 'all' ? 'primary' : 'default'}
            onClick={() => setSelectedPriority('all')}
          >
            全部优先级
          </Button>
          <Button
            type={selectedPriority === 'urgent' ? 'primary' : 'default'}
            danger={selectedPriority === 'urgent'}
            onClick={() => setSelectedPriority('urgent')}
          >
            紧急
          </Button>
          <Button
            type={selectedPriority === 'important' ? 'primary' : 'default'}
            onClick={() => setSelectedPriority('important')}
          >
            重要
          </Button>
          <Button
            type={selectedPriority === 'normal' ? 'primary' : 'default'}
            onClick={() => setSelectedPriority('normal')}
          >
            普通
          </Button>
        </div>
        <div className={styles.filterButtons}>
          <Button
            type={selectedStatus === 'all' ? 'primary' : 'default'}
            onClick={() => setSelectedStatus('all')}
          >
            全部状态
          </Button>
          <Button
            type={selectedStatus === 'pending' ? 'primary' : 'default'}
            onClick={() => setSelectedStatus('pending')}
          >
            待处理
          </Button>
          <Button
            type={selectedStatus === 'processing' ? 'primary' : 'default'}
            onClick={() => setSelectedStatus('processing')}
          >
            处理中
          </Button>
          <Button
            type={selectedStatus === 'completed' ? 'primary' : 'default'}
            onClick={() => setSelectedStatus('completed')}
          >
            已完成
          </Button>
        </div>
      </div>

      {/* 待办列表 */}
      <div className={styles.listContainer}>
        {filteredList.length === 0 ? (
          <div className={styles.emptyState}>
            <p>暂无待办事项</p>
          </div>
        ) : (
          <div className={styles.todoItems}>
            {filteredList.map(todo => (
              <div key={todo.id} className={styles.todoItem}>
                <div className={styles.todoItemHeader}>
                  <div className={styles.todoItemTitle}>
                    {todo.status === 'completed' ? (
                      <CheckCircleOutlined className={styles.completedIcon} />
                    ) : todo.status === 'processing' ? (
                      <ClockCircleOutlined className={styles.processingIcon} />
                    ) : (
                      <ExclamationCircleOutlined
                        className={styles.pendingIcon}
                      />
                    )}
                    <span
                      className={
                        todo.status === 'completed' ? styles.completedTitle : ''
                      }
                    >
                      {todo.title}
                    </span>
                  </div>
                  <div className={styles.todoItemActions}>
                    <Tag color={categoryMap[todo.category].color}>
                      {categoryMap[todo.category].label}
                    </Tag>
                    <Tag color={priorityMap[todo.priority].color}>
                      {priorityMap[todo.priority].label}
                    </Tag>
                    {todo.status !== 'completed' && (
                      <Button
                        type="primary"
                        size="small"
                        onClick={() => handleProcess(todo)}
                      >
                        处理
                      </Button>
                    )}
                    <Button size="small" onClick={() => handleViewDetail(todo)}>
                      详情
                    </Button>
                  </div>
                </div>
                {todo.description && (
                  <div className={styles.todoItemDescription}>
                    {todo.description}
                  </div>
                )}
                <div className={styles.todoItemFooter}>
                  <div className={styles.todoItemMeta}>
                    <span>创建人：{todo.creator}</span>
                    {todo.assignee && <span>处理人：{todo.assignee}</span>}
                    <span>创建时间：{todo.createTime}</span>
                    {todo.dueTime && (
                      <span
                        className={
                          dayjs(todo.dueTime).isBefore(dayjs())
                            ? styles.overdue
                            : ''
                        }
                      >
                        截止时间：{todo.dueTime}
                      </span>
                    )}
                  </div>
                  {todo.tags && todo.tags.length > 0 && (
                    <div className={styles.todoItemTags}>
                      {todo.tags.map(tag => (
                        <Tag key={tag}>
                          {tag}
                        </Tag>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 详情弹窗 */}
      <Modal
        title="待办详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>,
          selectedTodo && selectedTodo.status !== 'completed' && (
            <Button
              key="process"
              type="primary"
              onClick={() => {
                setDetailModalVisible(false);
                handleProcess(selectedTodo);
              }}
            >
              处理
            </Button>
          ),
        ]}
        width={600}
      >
        {selectedTodo && (
          <div className={styles.detailContent}>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>标题：</span>
              <span className={styles.detailValue}>{selectedTodo.title}</span>
            </div>
            {selectedTodo.description && (
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>描述：</span>
                <span className={styles.detailValue}>
                  {selectedTodo.description}
                </span>
              </div>
            )}
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>分类：</span>
              <Tag color={categoryMap[selectedTodo.category].color}>
                {categoryMap[selectedTodo.category].label}
              </Tag>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>优先级：</span>
              <Tag color={priorityMap[selectedTodo.priority].color}>
                {priorityMap[selectedTodo.priority].label}
              </Tag>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>状态：</span>
              <span className={styles.detailValue}>
                {selectedTodo.status === 'pending' && '待处理'}
                {selectedTodo.status === 'processing' && '处理中'}
                {selectedTodo.status === 'completed' && '已完成'}
              </span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>创建人：</span>
              <span className={styles.detailValue}>{selectedTodo.creator}</span>
            </div>
            {selectedTodo.assignee && (
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>处理人：</span>
                <span className={styles.detailValue}>
                  {selectedTodo.assignee}
                </span>
              </div>
            )}
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>创建时间：</span>
              <span className={styles.detailValue}>
                {selectedTodo.createTime}
              </span>
            </div>
            {selectedTodo.dueTime && (
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>截止时间：</span>
                <span className={styles.detailValue}>
                  {selectedTodo.dueTime}
                </span>
              </div>
            )}
            {selectedTodo.tags && selectedTodo.tags.length > 0 && (
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>标签：</span>
                <div className={styles.detailTags}>
                  {selectedTodo.tags.map(tag => (
                    <Tag key={tag}>{tag}</Tag>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* 处理弹窗 */}
      <Modal
        title="处理待办"
        open={processModalVisible}
        onCancel={() => setProcessModalVisible(false)}
        onOk={() => processForm.submit()}
        width={600}
      >
        <Form
          form={processForm}
          layout="vertical"
          onFinish={handleProcessSubmit}
        >
          <Form.Item
            name="action"
            label="处理操作"
            rules={[{ required: true, message: '请选择处理操作' }]}
          >
            <Select placeholder="请选择处理操作">
              <Option value="approve">同意/通过</Option>
              <Option value="reject">拒绝</Option>
              <Option value="complete">完成</Option>
              <Option value="transfer">转办</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="comment"
            label="处理意见"
            rules={[{ required: true, message: '请输入处理意见' }]}
          >
            <TextArea rows={4} placeholder="请输入处理意见" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 提醒设置弹窗 */}
      <Modal
        title="提醒设置"
        open={reminderModalVisible}
        onCancel={() => setReminderModalVisible(false)}
        onOk={() => form.submit()}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleReminderSubmit}
          initialValues={{
            systemNotification: true,
            wechatNotification: true,
            reminderTime: 30,
          }}
        >
          <Form.Item
            name="systemNotification"
            label="系统内通知"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
          <Form.Item
            name="wechatNotification"
            label="企业微信群通知"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
          <Form.Item
            name="reminderTime"
            label="提前提醒时间（分钟）"
            rules={[{ required: true, message: '请输入提醒时间' }]}
          >
            <Input type="number" placeholder="请输入提前提醒时间" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TodoList;
