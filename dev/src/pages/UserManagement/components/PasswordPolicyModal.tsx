import { useState, useEffect } from 'react';
import { Modal, Form, InputNumber, Switch, Button, message } from 'antd';
import styles from './PasswordPolicyModal.module.css';

interface PasswordPolicyModalProps {
  visible: boolean;
  onCancel: () => void;
}

// 模拟密码策略配置
const defaultPolicy = {
  minLength: 6,
  maxLength: 20,
  requireUppercase: false,
  requireLowercase: false,
  requireNumber: true,
  requireSpecialChar: false,
  passwordExpireDays: 90,
  maxLoginAttempts: 5,
  lockoutDuration: 30,
};

const PasswordPolicyModal: React.FC<PasswordPolicyModalProps> = ({
  visible,
  onCancel,
}) => {
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);

  const loadPolicy = async () => {
    setIsLoading(true);
    // 模拟API请求延迟
    await new Promise(resolve => setTimeout(resolve, 300));
    form.setFieldsValue(defaultPolicy);
    setIsLoading(false);
  };

  useEffect(() => {
    if (visible) {
      // 加载当前密码策略配置
      loadPolicy();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  // 处理保存
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setIsLoading(true);
      // 模拟API请求延迟
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log('保存密码策略:', values);
      message.success('密码策略保存成功');
      setIsLoading(false);
      onCancel();
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  return (
    <Modal
      title="密码策略配置"
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          取消
        </Button>,
        <Button
          key="save"
          type="primary"
          loading={isLoading}
          onClick={handleSave}
        >
          保存
        </Button>,
      ]}
      width={600}
    >
      <Form form={form} layout="vertical" className={styles.form}>
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>密码复杂度要求</h3>
          <Form.Item
            label="最小长度"
            name="minLength"
            rules={[{ required: true, message: '请输入最小长度' }]}
          >
            <InputNumber min={6} max={20} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            label="最大长度"
            name="maxLength"
            rules={[{ required: true, message: '请输入最大长度' }]}
          >
            <InputNumber min={6} max={50} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            label="必须包含大写字母"
            name="requireUppercase"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
          <Form.Item
            label="必须包含小写字母"
            name="requireLowercase"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
          <Form.Item
            label="必须包含数字"
            name="requireNumber"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
          <Form.Item
            label="必须包含特殊字符"
            name="requireSpecialChar"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>密码有效期</h3>
          <Form.Item
            label="密码过期天数（0表示永不过期）"
            name="passwordExpireDays"
            rules={[{ required: true, message: '请输入密码过期天数' }]}
          >
            <InputNumber min={0} max={365} style={{ width: '100%' }} />
          </Form.Item>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>登录安全</h3>
          <Form.Item
            label="最大登录尝试次数"
            name="maxLoginAttempts"
            rules={[{ required: true, message: '请输入最大登录尝试次数' }]}
          >
            <InputNumber min={3} max={10} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            label="账户锁定时长（分钟）"
            name="lockoutDuration"
            rules={[{ required: true, message: '请输入账户锁定时长' }]}
          >
            <InputNumber min={5} max={1440} style={{ width: '100%' }} />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
};

export default PasswordPolicyModal;





