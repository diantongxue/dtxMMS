import { useState, useEffect, useRef, useCallback } from 'react';
import * as echarts from 'echarts/core';
import { LineChart, BarChart, PieChart, ScatterChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  ToolboxComponent,
  DataZoomComponent,
  VisualMapComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import {
  Card,
  Tabs,
  Button,
  Space,
  Select,
  DatePicker,
  Spin,
  message,
} from 'antd';
import {
  ReloadOutlined,
  DownloadOutlined,
  FullscreenOutlined,
} from '@ant-design/icons';
import Skeleton from '../../components/Skeleton';
import styles from './styles.module.css';
import dayjs, { Dayjs } from 'dayjs';

// 注册 ECharts 组件
echarts.use([
  LineChart,
  BarChart,
  PieChart,
  ScatterChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  ToolboxComponent,
  DataZoomComponent,
  VisualMapComponent,
  CanvasRenderer,
]);

const { RangePicker } = DatePicker;
const { Option } = Select;

// 图表类型
type ChartType = 'line' | 'bar' | 'pie' | 'scatter';

// 对比类型
type CompareType = 'none' | 'yoy' | 'mom' | 'qoq';

interface ChartData {
  date: string;
  value: number;
  category?: string;
}

interface ChartComponentProps {
  chartRef: React.RefObject<HTMLDivElement>;
  type: ChartType;
  data: ChartData[];
  compareData?: ChartData[];
  compareType?: CompareType;
  title?: string;
  isLoading?: boolean;
  // 遵循宪法.md第13.1.1节TypeScript规范：禁止使用any类型
  onChartClick?: (params: { name?: string; value?: unknown; data?: unknown; seriesName?: string }) => void;
}

// 图表组件
const ChartComponent: React.FC<ChartComponentProps> = ({
  chartRef,
  type,
  data,
  compareData = [],
  compareType = 'none',
  title,
  isLoading = false,
  onChartClick,
}) => {
  const chartInstanceRef = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current || isLoading) return;

    // 初始化图表
    if (!chartInstanceRef.current) {
      chartInstanceRef.current = echarts.init(chartRef.current);
    }

    const chart = chartInstanceRef.current;

    // 根据图表类型生成配置
    let option: echarts.EChartsCoreOption = {};

    switch (type) {
      case 'line': {
        // 遵循宪法.md第13.1.1节TypeScript规范：禁止使用any类型
        interface LineSeriesItem {
          name: string;
          type: string;
          data: number[];
          smooth?: boolean;
          itemStyle?: { color: string };
          areaStyle?: unknown;
          lineStyle?: { type: string };
        }
        const lineSeries: LineSeriesItem[] = [
          {
            name: '销售额',
            type: 'line',
            data: data.map(item => item.value),
            smooth: true,
            itemStyle: { color: '#3964fe' },
            areaStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0, color: 'rgba(57, 100, 254, 0.3)' },
                  { offset: 1, color: 'rgba(57, 100, 254, 0.1)' },
                ],
              },
            },
          },
        ];

        // 添加对比数据
        if (compareType !== 'none' && compareData.length > 0) {
          const compareLabel =
            compareType === 'yoy'
              ? '去年同期'
              : compareType === 'mom'
                ? '上月同期'
                : '上季度同期';
          lineSeries.push({
            name: compareLabel,
            type: 'line',
            data: compareData.map(item => item.value),
            smooth: true,
            itemStyle: { color: '#ff4d4f' },
            lineStyle: { type: 'dashed' },
          });
        }

        option = {
          title: title
            ? { text: title, left: 'center', textStyle: { fontSize: 16 } }
            : undefined,
          tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'cross' },
          },
          legend: { top: 30, data: lineSeries.map(s => s.name) },
          grid: { top: 80, bottom: 60, left: 60, right: 40 },
          xAxis: {
            type: 'category',
            data: data.map(item => item.date),
            boundaryGap: false,
          },
          yAxis: { type: 'value' },
          dataZoom: [
            { type: 'slider', start: 0, end: 100 },
            { type: 'inside', start: 0, end: 100 },
          ],
          series: lineSeries,
        };
        break;
      }

      case 'bar': {
        // 遵循宪法.md第13.1.1节TypeScript规范：禁止使用any类型
        interface BarSeriesItem {
          name: string;
          type: string;
          data: number[];
          itemStyle?: unknown;
        }
        const barSeries: BarSeriesItem[] = [
          {
            name: '销售额',
            type: 'bar',
            data: data.map(item => item.value),
            itemStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0, color: '#3964fe' },
                  { offset: 1, color: '#5b7cfe' },
                ],
              },
            },
          },
        ];

        // 添加对比数据
        if (compareType !== 'none' && compareData.length > 0) {
          const compareLabel =
            compareType === 'yoy'
              ? '去年同期'
              : compareType === 'mom'
                ? '上月同期'
                : '上季度同期';
          barSeries.push({
            name: compareLabel,
            type: 'bar',
            data: compareData.map(item => item.value),
            itemStyle: { color: '#ff4d4f' },
          });
        }

        option = {
          title: title
            ? { text: title, left: 'center', textStyle: { fontSize: 16 } }
            : undefined,
          tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' },
          },
          legend: { top: 30, data: barSeries.map(s => s.name) },
          grid: { top: 80, bottom: 60, left: 60, right: 40 },
          xAxis: {
            type: 'category',
            data: data.map(item => item.date),
          },
          yAxis: { type: 'value' },
          dataZoom: [
            { type: 'slider', start: 0, end: 100 },
            { type: 'inside', start: 0, end: 100 },
          ],
          series: barSeries,
        };
        break;
      }

      case 'pie': {
        const pieData = data.map(item => ({
          value: item.value,
          name: item.date,
        }));
        option = {
          title: title
            ? { text: title, left: 'center', textStyle: { fontSize: 16 } }
            : undefined,
          tooltip: {
            trigger: 'item',
            formatter: '{b}: {c} ({d}%)',
          },
          legend: { top: 30, orient: 'horizontal' },
          series: [
            {
              type: 'pie',
              radius: ['40%', '70%'],
              avoidLabelOverlap: false,
              itemStyle: {
                borderRadius: 8,
                borderColor: '#fff',
                borderWidth: 2,
              },
              label: {
                show: true,
                formatter: '{b}\n{d}%',
              },
              emphasis: {
                label: {
                  show: true,
                  fontSize: 16,
                  fontWeight: 'bold',
                },
              },
              data: pieData,
            },
          ],
        };
        break;
      }

      case 'scatter': {
        option = {
          title: title
            ? { text: title, left: 'center', textStyle: { fontSize: 16 } }
            : undefined,
          tooltip: {
            trigger: 'item',
            // 遵循宪法.md第13.1.1节TypeScript规范：禁止使用any类型
            formatter: (params: { seriesName?: string; data?: [string, number] }) => {
              const data = params.data ?? ['', 0];
              return `${params.seriesName ?? ''}<br/>日期: ${data[0]}<br/>数值: ${data[1]}`;
            },
          },
          grid: { top: 80, bottom: 60, left: 60, right: 40 },
          xAxis: {
            type: 'category',
            data: data.map(item => item.date),
          },
          yAxis: { type: 'value' },
          series: [
            {
              name: '数据点',
              type: 'scatter',
              data: data.map(item => [item.date, item.value]),
              symbolSize: (value: number) => Math.sqrt(value) * 2,
              itemStyle: {
                color: '#3964fe',
                opacity: 0.7,
              },
            },
          ],
        };
        break;
      }
    }

    // 设置配置
    chart.setOption(option, true);

    // 图表点击事件
    if (onChartClick) {
      chart.off('click');
      // 遵循宪法.md第13.1.1节TypeScript规范：禁止使用any类型
      chart.on('click', (params: { name?: string; value?: unknown; data?: unknown; seriesName?: string }) => {
        onChartClick(params);
      });
    }

    // 响应式
    const handleResize = () => {
      chart.resize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.off('click');
    };
  }, [
    chartRef,
    type,
    data,
    compareData,
    compareType,
    title,
    isLoading,
    onChartClick,
  ]);

  // 组件卸载时清理图表实例
  useEffect(() => {
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.dispose();
        chartInstanceRef.current = null;
      }
    };
  }, []);

  return <div ref={chartRef} className={styles.chartContainer} />;
};

const Charts: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ChartType>('line');
  const [compareType, setCompareType] = useState<CompareType>('none');
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [compareData, setCompareData] = useState<ChartData[]>([]);

  // 图表引用
  const lineChartRef = useRef<HTMLDivElement>(null);
  const barChartRef = useRef<HTMLDivElement>(null);
  const pieChartRef = useRef<HTMLDivElement>(null);
  const scatterChartRef = useRef<HTMLDivElement>(null);

  // 获取当前图表引用
  const getCurrentChartRef = useCallback(() => {
    switch (activeTab) {
      case 'line':
        return lineChartRef;
      case 'bar':
        return barChartRef;
      case 'pie':
        return pieChartRef;
      case 'scatter':
        return scatterChartRef;
      default:
        return lineChartRef;
    }
  }, [activeTab]);

  // 加载数据
  const loadData = useCallback(async (type: CompareType = 'none') => {
    setLoading(true);
    try {
      // 模拟API请求
      await new Promise(resolve => setTimeout(resolve, 800));

      // 生成模拟数据
      const dates: string[] = [];
      const now = dayjs();
      for (let i = 29; i >= 0; i--) {
        dates.push(now.subtract(i, 'day').format('YYYY-MM-DD'));
      }

      const data: ChartData[] = dates.map(date => ({
        date,
        value: Math.floor(Math.random() * 10000) + 5000,
      }));

      setChartData(data);

      // 对比数据
      if (type !== 'none') {
        const compareDates: string[] = [];
        let compareStart = now;
        if (type === 'yoy') {
          compareStart = now.subtract(365, 'day');
        } else if (type === 'mom') {
          compareStart = now.subtract(60, 'day');
        } else if (type === 'qoq') {
          compareStart = now.subtract(90, 'day');
        }

        for (let i = 29; i >= 0; i--) {
          compareDates.push(
            compareStart.subtract(i, 'day').format('YYYY-MM-DD')
          );
        }

        const compare: ChartData[] = compareDates.map(date => ({
          date,
          value: Math.floor(Math.random() * 10000) + 5000,
        }));

        setCompareData(compare);
      } else {
        setCompareData([]);
      }
    } catch (error) {
      message.error('数据加载失败');
    } finally {
      setLoading(false);
    }
  }, []);

  // 初始化加载和对比类型变化时重新加载数据
  useEffect(() => {
    loadData(compareType);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [compareType]);

  // 处理图表点击（数据钻取）（遵循宪法.md第13.1.1节TypeScript规范：禁止使用any类型）
  const handleChartClick = useCallback((params: { name?: string; value?: unknown; data?: unknown }) => {
    const name = params.name ?? '未知';
    const value = params.value ?? params.data ?? '未知';
    message.info(`点击了 ${name}，数值: ${value}`);
    // TODO: 实现数据钻取，跳转到明细页面
  }, []);

  // 刷新数据
  const handleRefresh = useCallback(() => {
    loadData(compareType);
  }, [loadData, compareType]);

  // 导出数据
  const handleExport = useCallback(() => {
    message.success('导出功能开发中...');
    // TODO: 实现数据导出功能
  }, []);

  // 全屏
  const handleFullscreen = useCallback(() => {
    const chartRef = getCurrentChartRef();
    if (chartRef.current) {
      if (chartRef.current.requestFullscreen) {
        chartRef.current.requestFullscreen();
      // 遵循宪法.md第13.1.1节TypeScript规范：正确处理可选属性
      } else if ((chartRef.current as unknown as HTMLElement & { webkitRequestFullscreen?: () => void }).webkitRequestFullscreen) {
        const element = chartRef.current as unknown as HTMLElement & { webkitRequestFullscreen: () => void };
        element.webkitRequestFullscreen();
      // 遵循宪法.md第13.1.1节TypeScript规范：正确处理可选属性
      } else if ((chartRef.current as unknown as HTMLElement & { mozRequestFullScreen?: () => void }).mozRequestFullScreen) {
        const element = chartRef.current as unknown as HTMLElement & { mozRequestFullScreen: () => void };
        element.mozRequestFullScreen();
      } else if ((chartRef.current as unknown as HTMLElement & { msRequestFullscreen?: () => void }).msRequestFullscreen) {
        const element = chartRef.current as unknown as HTMLElement & { msRequestFullscreen: () => void };
        element.msRequestFullscreen();
      }
    }
  }, [getCurrentChartRef]);

  // 日期范围变化
  const handleDateRangeChange = useCallback(
    (
      dates: [Dayjs | null, Dayjs | null] | null,
      _dateStrings: [string, string]
    ) => {
      if (dates && dates[0] && dates[1]) {
        setDateRange([dates[0], dates[1]]);
        // TODO: 根据日期范围筛选数据
      } else {
        setDateRange(null);
      }
    },
    []
  );

  if (loading && chartData.length === 0) {
    return (
      <div className={styles.chartsPage}>
        <div className={styles.contentHeader}>
          <Skeleton title rows={1} />
        </div>
        <div className={styles.chartWrapper}>
          <Skeleton rows={10} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.chartsPage}>
      <div className={styles.contentHeader}>
        <div>
          <h1 className={styles.contentTitle}>图表展示</h1>
          <p className={styles.contentSubtitle}>多维度数据可视化分析</p>
        </div>
        <Space>
          <RangePicker
            value={dateRange}
            onChange={handleDateRangeChange}
            format="YYYY-MM-DD"
            placeholder={['开始日期', '结束日期']}
          />
          <Select
            value={compareType}
            onChange={setCompareType}
            style={{ width: 120 }}
          >
            <Option value="none">无对比</Option>
            <Option value="yoy">同比</Option>
            <Option value="mom">环比</Option>
            <Option value="qoq">季度比</Option>
          </Select>
          <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
            刷新
          </Button>
          <Button icon={<DownloadOutlined />} onClick={handleExport}>
            导出
          </Button>
          <Button icon={<FullscreenOutlined />} onClick={handleFullscreen}>
            全屏
          </Button>
        </Space>
      </div>

      <Card className={styles.chartCard}>
        <Tabs
          activeKey={activeTab}
          onChange={key => setActiveTab(key as ChartType)}
          items={[
            {
              key: 'line',
              label: '折线图',
              children: (
                <Spin spinning={loading}>
                  <ChartComponent
                    chartRef={lineChartRef}
                    type="line"
                    data={chartData}
                    compareData={compareData}
                    compareType={compareType}
                    title="销售趋势"
                    isLoading={loading}
                    onChartClick={handleChartClick}
                  />
                </Spin>
              ),
            },
            {
              key: 'bar',
              label: '柱状图',
              children: (
                <Spin spinning={loading}>
                  <ChartComponent
                    chartRef={barChartRef}
                    type="bar"
                    data={chartData}
                    compareData={compareData}
                    compareType={compareType}
                    title="销售对比"
                    isLoading={loading}
                    onChartClick={handleChartClick}
                  />
                </Spin>
              ),
            },
            {
              key: 'pie',
              label: '饼图',
              children: (
                <Spin spinning={loading}>
                  <ChartComponent
                    chartRef={pieChartRef}
                    type="pie"
                    data={chartData}
                    compareData={compareData}
                    compareType={compareType}
                    title="销售占比"
                    isLoading={loading}
                    onChartClick={handleChartClick}
                  />
                </Spin>
              ),
            },
            {
              key: 'scatter',
              label: '散点图',
              children: (
                <Spin spinning={loading}>
                  <ChartComponent
                    chartRef={scatterChartRef}
                    type="scatter"
                    data={chartData}
                    compareData={compareData}
                    compareType={compareType}
                    title="数据分布"
                    isLoading={loading}
                    onChartClick={handleChartClick}
                  />
                </Spin>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
};

export default Charts;
