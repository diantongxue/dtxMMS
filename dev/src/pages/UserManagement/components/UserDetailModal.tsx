import { Modal, Descriptions, Avatar, Tag, Button } from 'antd';
import { UserOutlined, EditOutlined } from '@ant-design/icons';
import type { User } from '../index';
import styles from './UserDetailModal.module.css';

interface UserDetailModalProps {
  visible: boolean;
  user: User | null;
  onCancel: () => void;
  onEdit: (user: User) => void;
}

const UserDetailModal: React.FC<UserDetailModalProps> = ({
  visible,
  user,
  onCancel,
  onEdit,
}) => {
  if (!user) return null;

  const statusMap: Record<string, { text: string; color: string }> = {
    active: { text: '正常', color: 'success' },
    inactive: { text: '未激活', color: 'default' },
    locked: { text: '已锁定', color: 'error' },
  };

  const statusInfo = statusMap[user.status] || {
    text: user.status,
    color: 'default',
  };

  return (
    <Modal
      title="用户详情"
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button
          key="edit"
          type="primary"
          icon={<EditOutlined />}
          onClick={() => onEdit(user)}
        >
          编辑
        </Button>,
        <Button key="close" onClick={onCancel}>
          关闭
        </Button>,
      ]}
      width={700}
    >
      <div className={styles.detailContent}>
        <div className={styles.avatarSection}>
          <Avatar
            src={user.avatar}
            icon={<UserOutlined />}
            size={100}
            style={{ backgroundColor: '#3964fe' }}
          />
          <div className={styles.userInfo}>
            <h3>{user.realName}</h3>
            <p className={styles.username}>@{user.username}</p>
            <Tag color={statusInfo.color}>{statusInfo.text}</Tag>
          </div>
        </div>

        <Descriptions column={2} bordered>
          <Descriptions.Item label="用户ID">{user.id}</Descriptions.Item>
          <Descriptions.Item label="用户名">{user.username}</Descriptions.Item>
          <Descriptions.Item label="真实姓名">
            {user.realName}
          </Descriptions.Item>
          <Descriptions.Item label="邮箱">{user.email}</Descriptions.Item>
          <Descriptions.Item label="手机号">{user.phone}</Descriptions.Item>
          <Descriptions.Item label="部门">{user.department}</Descriptions.Item>
          <Descriptions.Item label="角色">{user.role}</Descriptions.Item>
          <Descriptions.Item label="状态">
            <Tag color={statusInfo.color}>{statusInfo.text}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="最后登录时间" span={2}>
            {user.lastLoginTime || '从未登录'}
          </Descriptions.Item>
          <Descriptions.Item label="最后登录IP" span={2}>
            {user.lastLoginIp || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="登录设备数" span={2}>
            {user.deviceCount || 0} 台
          </Descriptions.Item>
          <Descriptions.Item label="创建时间" span={2}>
            {user.createTime}
          </Descriptions.Item>
        </Descriptions>
      </div>
    </Modal>
  );
};

export default UserDetailModal;





