import { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Upload, Avatar, message } from 'antd';
import { UserOutlined, PlusOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import type { User } from '../index';
import styles from './UserFormModal.module.css';

interface UserFormModalProps {
  visible: boolean;
  user: User | null;
  onCancel: () => void;
  onSave: (userData: Partial<User>) => void;
}

const UserFormModal: React.FC<UserFormModalProps> = ({
  visible,
  user,
  onCancel,
  onSave,
}) => {
  const [form] = Form.useForm();
  const [avatarFileList, setAvatarFileList] = useState<UploadFile[]>([]);
  const [avatarUrl, setAvatarUrl] = useState<string>('');

  useEffect(() => {
    if (visible) {
      if (user) {
        // 编辑模式，填充表单
        form.setFieldsValue({
          username: user.username,
          realName: user.realName,
          email: user.email,
          phone: user.phone,
          department: user.department,
          role: user.role,
          status: user.status,
        });
        setAvatarUrl(user.avatar || '');
      } else {
        // 新增模式，重置表单
        form.resetFields();
        setAvatarUrl('');
        setAvatarFileList([]);
      }
    }
  }, [visible, user, form]);

  // 处理头像上传（遵循宪法.md第13.1.1节TypeScript规范：禁止使用any类型）
  interface UploadFileInfo {
    file: {
      status?: string;
      originFileObj?: File;
    };
  }
  const handleAvatarChange = (info: UploadFileInfo) => {
    if (info.file.status === 'done' || info.file.status === 'uploading') {
      // 这里应该上传到服务器，暂时使用本地预览
      const reader = new FileReader();
      reader.onload = e => {
        setAvatarUrl(e.target?.result as string);
      };
      if (info.file.originFileObj) {
        reader.readAsDataURL(info.file.originFileObj);
      }
    }
  };

  // 处理保存
  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const userData: Partial<User> = {
        ...values,
        avatar: avatarUrl,
      };
      onSave(userData);
      form.resetFields();
      setAvatarUrl('');
      setAvatarFileList([]);
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  // 处理取消
  const handleCancel = () => {
    form.resetFields();
    setAvatarUrl('');
    setAvatarFileList([]);
    onCancel();
  };

  // 上传前验证
  const beforeUpload = (file: File) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('只能上传 JPG/PNG 格式的图片!');
      return false;
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('图片大小不能超过 2MB!');
      return false;
    }
    return false; // 阻止自动上传，使用自定义上传逻辑
  };

  return (
    <Modal
      title={user ? '编辑用户' : '添加用户'}
      open={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      width={600}
      okText="保存"
      cancelText="取消"
      destroyOnClose
    >
      <Form form={form} layout="vertical" className={styles.form}>
        <div className={styles.avatarSection}>
          <Form.Item label="头像" name="avatar">
            <Upload
              name="avatar"
              listType="picture-card"
              showUploadList={false}
              beforeUpload={beforeUpload}
              onChange={handleAvatarChange}
              fileList={avatarFileList}
            >
              {avatarUrl ? (
                <Avatar
                  src={avatarUrl}
                  icon={<UserOutlined />}
                  size={100}
                  style={{ backgroundColor: '#3964fe' }}
                />
              ) : (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>上传头像</div>
                </div>
              )}
            </Upload>
          </Form.Item>
        </div>

        <Form.Item
          label="用户名"
          name="username"
          rules={[
            { required: true, message: '请输入用户名' },
            { min: 3, message: '用户名至少3个字符' },
            { max: 20, message: '用户名最多20个字符' },
            {
              pattern: /^[a-zA-Z0-9_]+$/,
              message: '用户名只能包含字母、数字和下划线',
            },
          ]}
        >
          <Input placeholder="请输入用户名" disabled={!!user} />
        </Form.Item>

        <Form.Item
          label="真实姓名"
          name="realName"
          rules={[{ required: true, message: '请输入真实姓名' }]}
        >
          <Input placeholder="请输入真实姓名" />
        </Form.Item>

        <Form.Item
          label="邮箱"
          name="email"
          rules={[
            { required: true, message: '请输入邮箱' },
            { type: 'email', message: '请输入有效的邮箱地址' },
          ]}
        >
          <Input placeholder="请输入邮箱" />
        </Form.Item>

        <Form.Item
          label="手机号"
          name="phone"
          rules={[
            { required: true, message: '请输入手机号' },
            { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号' },
          ]}
        >
          <Input placeholder="请输入手机号" />
        </Form.Item>

        <Form.Item
          label="部门"
          name="department"
          rules={[{ required: true, message: '请选择部门' }]}
        >
          <Select placeholder="请选择部门">
            <Select.Option value="技术部">技术部</Select.Option>
            <Select.Option value="运营部">运营部</Select.Option>
            <Select.Option value="销售部">销售部</Select.Option>
            <Select.Option value="财务部">财务部</Select.Option>
            <Select.Option value="人事部">人事部</Select.Option>
            <Select.Option value="行政部">行政部</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="角色"
          name="role"
          rules={[{ required: true, message: '请选择角色' }]}
        >
          <Select placeholder="请选择角色">
            <Select.Option value="超级管理员">超级管理员</Select.Option>
            <Select.Option value="管理员">管理员</Select.Option>
            <Select.Option value="运营专员">运营专员</Select.Option>
            <Select.Option value="销售经理">销售经理</Select.Option>
            <Select.Option value="销售专员">销售专员</Select.Option>
            <Select.Option value="财务专员">财务专员</Select.Option>
            <Select.Option value="人事专员">人事专员</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="状态"
          name="status"
          rules={[{ required: true, message: '请选择状态' }]}
        >
          <Select placeholder="请选择状态">
            <Select.Option value="active">正常</Select.Option>
            <Select.Option value="inactive">未激活</Select.Option>
            <Select.Option value="locked">已锁定</Select.Option>
          </Select>
        </Form.Item>

        {!user && (
          <Form.Item
            label="密码"
            name="password"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码至少6个字符' },
            ]}
          >
            <Input.Password placeholder="请输入密码" />
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
};

export default UserFormModal;
