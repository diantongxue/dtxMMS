import { useMemo, useCallback } from 'react';
import { Table as AntTable, Button, Space, Tooltip } from 'antd';
import type { TableProps, ColumnType } from 'antd/es/table';
import { DownloadOutlined, ReloadOutlined } from '@ant-design/icons';
import Skeleton from '../Skeleton';
import styles from './styles.module.css';

// 导出文件类型
export type ExportType = 'excel' | 'csv' | 'json';

// 表格列配置扩展（遵循宪法.md第13.1.1节TypeScript规范：禁止使用any类型）
export interface TableColumnType<T extends Record<string, unknown> = Record<string, unknown>> extends ColumnType<T> {
  // 是否支持导出（默认true）
  exportable?: boolean;
  // 导出时的列名（默认使用title）
  exportTitle?: string;
}

// 表格组件Props（遵循宪法.md第13.1.1节TypeScript规范：禁止使用any类型）
export interface CommonTableProps<T extends Record<string, unknown> = Record<string, unknown>>
  extends Omit<TableProps<T>, 'columns'> {
  // 列配置
  columns: TableColumnType<T>[];
  // 数据源
  dataSource?: T[];
  // 加载状态
  loading?: boolean;
  // 是否显示导出按钮
  showExport?: boolean;
  // 导出功能回调
  onExport?: (type: ExportType) => void;
  // 是否启用虚拟滚动（数据量大于100时自动启用）
  enableVirtualScroll?: boolean;
  // 虚拟滚动行高（默认32px）
  virtualRowHeight?: number;
  // 刷新回调
  onRefresh?: () => void;
  // 空状态自定义文本
  emptyText?: string;
  // 空状态自定义描述
  emptyDescription?: string;
}

/**
 * 通用表格组件
 * 支持排序、筛选、分页、虚拟滚动、导出等功能
 * 遵循宪法.md第13.1.6节React规范：函数式组件、类型安全
 */
function CommonTable<T extends Record<string, unknown> = Record<string, unknown>>({
  columns,
  dataSource = [],
  loading = false,
  showExport = true,
  onExport,
  enableVirtualScroll,
  // virtualRowHeight 参数保留用于未来扩展，目前未使用
  // virtualRowHeight = 32,
  onRefresh,
  emptyText = '暂无数据',
  emptyDescription,
  pagination,
  ...restProps
}: CommonTableProps<T>) {
  // 判断是否需要虚拟滚动（数据量大于100或明确启用）
  const shouldUseVirtualScroll = useMemo(() => {
    if (enableVirtualScroll !== undefined) {
      return enableVirtualScroll;
    }
    return dataSource.length > 100;
  }, [enableVirtualScroll, dataSource.length]);

  // 虚拟滚动配置
  const scrollConfig = useMemo(() => {
    if (shouldUseVirtualScroll && !restProps.scroll) {
      return {
        x: 'max-content',
        y: 400, // 默认高度400px
        scrollToFirstRowOnChange: true,
      };
    }
    return restProps.scroll;
  }, [shouldUseVirtualScroll, restProps.scroll]);

  // 处理导出
  const handleExport = useCallback(
    (type: ExportType) => {
      if (onExport) {
        onExport(type);
      } else {
        // 默认导出实现（遵循宪法.md第13.1.1节TypeScript规范：禁止使用any类型）
        const exportColumns = columns.filter(col => col.exportable !== false);
        const exportData = dataSource.map(item => {
          const row: Record<string, unknown> = {};
          exportColumns.forEach(col => {
            const key = col.dataIndex as string;
            const value = item[key];
            const exportTitle = col.exportTitle || (col.title as string) || key;
            row[exportTitle] = value;
          });
          return row;
        });

        if (type === 'json') {
          const jsonStr = JSON.stringify(exportData, null, 2);
          const blob = new Blob([jsonStr], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `table-export-${Date.now()}.json`;
          link.click();
          URL.revokeObjectURL(url);
        } else if (type === 'csv') {
          const headers = exportColumns
            .map(
              col =>
                col.exportTitle ||
                (col.title as string) ||
                (col.dataIndex as string)
            )
            .join(',');
          const rows = exportData.map(row =>
            Object.values(row)
              .map(val => `"${String(val).replace(/"/g, '""')}"`)
              .join(',')
          );
          const csvContent = [headers, ...rows].join('\n');
          const blob = new Blob(['\ufeff' + csvContent], {
            type: 'text/csv;charset=utf-8;',
          });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `table-export-${Date.now()}.csv`;
          link.click();
          URL.revokeObjectURL(url);
        }
        // Excel导出需要额外的库，这里只提供接口
      }
    },
    [onExport, columns, dataSource]
  );

  // 处理刷新（遵循宪法.md第6节错误处理规范：所有异步操作必须有错误处理）
  const handleRefresh = useCallback(() => {
    try {
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error('Failed to refresh table:', error);
    }
  }, [onRefresh]);

  // 默认分页配置
  const defaultPagination = useMemo(() => {
    if (pagination === false) {
      return false;
    }
    return {
      showSizeChanger: true,
      showQuickJumper: true,
      showTotal: (total: number) => `共 ${total} 条`,
      pageSize: 10,
      pageSizeOptions: ['10', '20', '50', '100'],
      ...pagination,
    };
  }, [pagination]);

  // 加载状态渲染
  if (loading) {
    return <Skeleton variant="table" rows={10} />;
  }

  // 空状态
  const emptyDescriptionText = emptyDescription || '请稍后再试或联系管理员';

  return (
    <div className={styles.tableContainer}>
      {/* 工具栏 */}
      {(showExport || onRefresh) && (
        <div className={styles.toolbar}>
          <Space>
            {onRefresh && (
              <Tooltip title="刷新">
                <Button
                  icon={<ReloadOutlined />}
                  onClick={handleRefresh}
                  className={styles.toolbarButton}
                >
                  刷新
                </Button>
              </Tooltip>
            )}
            {showExport && (
              <>
                <Tooltip title="导出为Excel">
                  <Button
                    icon={<DownloadOutlined />}
                    onClick={() => handleExport('excel')}
                    className={styles.toolbarButton}
                  >
                    导出Excel
                  </Button>
                </Tooltip>
                <Tooltip title="导出为CSV">
                  <Button
                    icon={<DownloadOutlined />}
                    onClick={() => handleExport('csv')}
                    className={styles.toolbarButton}
                  >
                    导出CSV
                  </Button>
                </Tooltip>
                <Tooltip title="导出为JSON">
                  <Button
                    icon={<DownloadOutlined />}
                    onClick={() => handleExport('json')}
                    className={styles.toolbarButton}
                  >
                    导出JSON
                  </Button>
                </Tooltip>
              </>
            )}
          </Space>
        </div>
      )}

      {/* 表格主体 */}
      <div className={styles.tableWrapper}>
        <AntTable<T>
          columns={columns}
          dataSource={dataSource}
          loading={false} // 使用自定义加载状态
          pagination={defaultPagination}
          scroll={scrollConfig}
          rowKey={(record, index) => {
            // 遵循宪法.md第13.1.6节React规范：列表渲染必须使用key属性，key值必须唯一且稳定
            if (restProps.rowKey) {
              if (typeof restProps.rowKey === 'function') {
                return restProps.rowKey(record, index ?? 0);
              }
              const key = restProps.rowKey as keyof T;
              return String(record[key] ?? `row-${index ?? 0}`);
            }
            return index?.toString() ?? `row-${index ?? 0}`;
          }}
          locale={{
            emptyText: (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>📊</div>
                <div className={styles.emptyText}>{emptyText}</div>
                <div className={styles.emptyDescription}>
                  {emptyDescriptionText}
                </div>
              </div>
            ),
          }}
          className={styles.table}
          {...restProps}
        />
      </div>
    </div>
  );
}

export default CommonTable;
