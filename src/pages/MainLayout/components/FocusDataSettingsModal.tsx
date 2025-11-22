import { useState, useEffect } from 'react';
import {
  Modal,
  Checkbox,
  Input,
  // InputNumber, // 保留用于未来扩展
  Space,
  Button,
  message,
} from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import styles from '../styles.module.css';

export interface FocusDataItem {
  id: string;
  label: string;
  value: string | number;
  unit?: string;
}

interface FocusDataSettingsModalProps {
  visible: boolean;
  focusData: FocusDataItem[];
  onSave: (data: FocusDataItem[]) => void;
  onCancel: () => void;
}

// 可选的关注数据类型（后期可以扩展）
const availableDataTypes = [
  { id: 'sales', label: '今日销售额', unit: '元' },
  { id: 'orders', label: '待处理订单', unit: '单' },
  { id: 'customers', label: '新增客户', unit: '人' },
  { id: 'products', label: '库存预警', unit: '件' },
  { id: 'tasks', label: '待办任务', unit: '项' },
];

const FocusDataSettingsModal: React.FC<FocusDataSettingsModalProps> = ({
  visible,
  focusData,
  onSave,
  onCancel,
}) => {
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [customData, setCustomData] = useState<
    Array<{ id: string; label: string; unit: string }>
  >([]);

  useEffect(() => {
    if (visible) {
      // 初始化已选择的数据类型
      const selected = focusData.map(item => {
        const found = availableDataTypes.find(
          type => type.label === item.label
        );
        return found ? found.id : 'custom';
      });
      setSelectedTypes(selected.filter(id => id !== 'custom'));

      // 初始化自定义数据
      const custom = focusData
        .filter(
          item => !availableDataTypes.find(type => type.label === item.label)
        )
        .map(item => ({
          id: item.id,
          label: item.label,
          unit: item.unit || '',
        }));
      setCustomData(custom);
    }
  }, [visible, focusData]);

  const handleTypeChange = (typeId: string, checked: boolean) => {
    if (checked) {
      setSelectedTypes([...selectedTypes, typeId]);
    } else {
      setSelectedTypes(selectedTypes.filter(id => id !== typeId));
    }
  };

  const handleAddCustom = () => {
    const newId = `custom-${Date.now()}`;
    setCustomData([...customData, { id: newId, label: '', unit: '' }]);
  };

  const handleRemoveCustom = (id: string) => {
    setCustomData(customData.filter(item => item.id !== id));
  };

  const handleCustomChange = (
    id: string,
    field: 'label' | 'unit',
    value: string
  ) => {
    setCustomData(
      customData.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const handleSave = () => {
    const result: FocusDataItem[] = [];

    // 添加选中的预设数据类型
    selectedTypes.forEach(typeId => {
      const type = availableDataTypes.find(t => t.id === typeId);
      if (type) {
        result.push({
          id: type.id,
          label: type.label,
          value: 0, // 默认值，后期从API获取
          unit: type.unit,
        });
      }
    });

    // 添加自定义数据
    customData.forEach(item => {
      if (item.label.trim()) {
        result.push({
          id: item.id,
          label: item.label,
          value: 0, // 默认值，后期从API获取
          unit: item.unit || '',
        });
      }
    });

    if (result.length === 0) {
      message.warning('请至少选择一项关注数据');
      return;
    }

    onSave(result);
    message.success('设置保存成功');
  };

  return (
    <Modal
      title="设置关注数据"
      open={visible}
      onOk={handleSave}
      onCancel={onCancel}
      okText="保存"
      cancelText="取消"
      width={600}
      className={styles.focusDataModal}
    >
      <div className={styles.focusDataSettings}>
        <div className={styles.settingsSection}>
          <h4 className={styles.settingsTitle}>预设数据类型</h4>
          <div className={styles.checkboxGroup}>
            {availableDataTypes.map(type => (
              <Checkbox
                key={type.id}
                checked={selectedTypes.includes(type.id)}
                onChange={e => handleTypeChange(type.id, e.target.checked)}
              >
                {type.label} ({type.unit})
              </Checkbox>
            ))}
          </div>
        </div>

        <div className={styles.settingsSection}>
          <div className={styles.settingsHeader}>
            <h4 className={styles.settingsTitle}>自定义数据</h4>
            <Button
              type="dashed"
              icon={<PlusOutlined />}
              onClick={handleAddCustom}
              size="small"
            >
              添加自定义
            </Button>
          </div>
          {customData.length > 0 && (
            <div className={styles.customDataList}>
              {customData.map(item => (
                <div key={item.id} className={styles.customDataItem}>
                  <Space>
                    <Input
                      placeholder="数据名称"
                      value={item.label}
                      onChange={e =>
                        handleCustomChange(item.id, 'label', e.target.value)
                      }
                      style={{ width: 200 }}
                    />
                    <Input
                      placeholder="单位（可选）"
                      value={item.unit}
                      onChange={e =>
                        handleCustomChange(item.id, 'unit', e.target.value)
                      }
                      style={{ width: 120 }}
                    />
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleRemoveCustom(item.id)}
                    />
                  </Space>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={styles.settingsHint}>
          <p>
            提示：关注的数据将在底部栏显示，数据值将从后端API获取（后期开发）
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default FocusDataSettingsModal;
