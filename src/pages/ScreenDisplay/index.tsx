import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import * as echarts from 'echarts/core';
import { LineChart, BarChart, PieChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { Button, message } from 'antd';
import {
  FullscreenOutlined,
  FullscreenExitOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import Loading from '../../components/Loading';
import styles from './styles.module.css';

// 注册 ECharts 组件
echarts.use([
  LineChart,
  BarChart,
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  CanvasRenderer,
]);

// 数据卡片数据类型
interface DataCard {
  id: string;
  title: string;
  value: number;
  unit?: string;
  change?: string;
  trend?: 'up' | 'down';
}

// 图表数据类型
interface ChartData {
  date: string;
  value: number;
  category?: string;
}

// 布局项类型
interface LayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  type: 'card' | 'chart';
  chartType?: 'line' | 'bar' | 'pie';
}

// 数据卡片组件
interface DataCardProps {
  card: DataCard;
  isLoading?: boolean;
}

const DataCardComponent: React.FC<DataCardProps> = ({ card, isLoading }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const previousValueRef = useRef(0);

  useEffect(() => {
    if (isLoading) {
      setDisplayValue(0);
      previousValueRef.current = 0;
      return;
    }

    // 数字滚动动画
    const duration = 1000;
    const startValue = previousValueRef.current;
    const endValue = card.value;
    const startTime = Date.now();

    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      const currentValue = Math.floor(
        startValue + (endValue - startValue) * progress
      );
      setDisplayValue(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(endValue);
        previousValueRef.current = endValue;
      }
    };

    animate();
  }, [card.value, isLoading]);

  return (
    <div className={styles.dataCard}>
      <div className={styles.cardHeader}>
        <div className={styles.cardTitle}>{card.title}</div>
        {card.change && (
          <div
            className={`${styles.cardChange} ${
              card.trend === 'up' ? styles.trendUp : styles.trendDown
            }`}
          >
            {card.change}
          </div>
        )}
      </div>
      <div className={styles.cardValue}>
        {displayValue.toLocaleString()}
        {card.unit && <span className={styles.cardUnit}>{card.unit}</span>}
      </div>
      {isLoading && <div className={styles.cardLoading}>加载中...</div>}
    </div>
  );
};

// 图表组件
interface ChartComponentProps {
  chartRef: React.RefObject<HTMLDivElement>;
  type: 'line' | 'bar' | 'pie';
  data: ChartData[];
  title?: string;
  isLoading?: boolean;
}

const ChartComponent: React.FC<ChartComponentProps> = ({
  chartRef,
  type,
  data,
  title,
  isLoading = false,
}) => {
  const chartInstanceRef = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current || isLoading) return;

    // 初始化图表
    if (!chartInstanceRef.current) {
      chartInstanceRef.current = echarts.init(chartRef.current, null, {
        renderer: 'canvas',
      });
    }

    const chart = chartInstanceRef.current;
    // 遵循宪法.md第13.1.1节TypeScript规范：使用正确的类型名称
    let option: echarts.EChartsCoreOption = {};

    switch (type) {
      case 'line':
        option = {
          title: title
            ? {
                text: title,
                left: 'center',
                textStyle: { fontSize: 16, color: '#fff' },
              }
            : undefined,
          tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'cross' },
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            borderColor: '#3964fe',
            textStyle: { color: '#fff' },
          },
          legend: {
            top: 30,
            data: ['销售额'],
            textStyle: { color: '#fff' },
          },
          grid: { top: 80, bottom: 60, left: 60, right: 40 },
          xAxis: {
            type: 'category',
            data: data.map(item => item.date),
            boundaryGap: false,
            axisLine: { lineStyle: { color: '#3964fe' } },
            axisLabel: { color: '#fff' },
          },
          yAxis: {
            type: 'value',
            axisLine: { lineStyle: { color: '#3964fe' } },
            axisLabel: { color: '#fff' },
            splitLine: { lineStyle: { color: 'rgba(57, 100, 254, 0.2)' } },
          },
          series: [
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
          ],
        };
        break;

      case 'bar':
        option = {
          title: title
            ? {
                text: title,
                left: 'center',
                textStyle: { fontSize: 16, color: '#fff' },
              }
            : undefined,
          tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' },
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            borderColor: '#3964fe',
            textStyle: { color: '#fff' },
          },
          legend: {
            top: 30,
            data: ['销售额'],
            textStyle: { color: '#fff' },
          },
          grid: { top: 80, bottom: 60, left: 60, right: 40 },
          xAxis: {
            type: 'category',
            data: data.map(item => item.date),
            axisLine: { lineStyle: { color: '#3964fe' } },
            axisLabel: { color: '#fff' },
          },
          yAxis: {
            type: 'value',
            axisLine: { lineStyle: { color: '#3964fe' } },
            axisLabel: { color: '#fff' },
            splitLine: { lineStyle: { color: 'rgba(57, 100, 254, 0.2)' } },
          },
          series: [
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
          ],
        };
        break;

      case 'pie': {
        // 遵循宪法.md第13.1.1节TypeScript规范：case块中的词法声明必须用大括号包裹
        const pieData = data.map(item => ({
          value: item.value,
          name: item.date,
        }));
        option = {
          title: title
            ? {
                text: title,
                left: 'center',
                textStyle: { fontSize: 16, color: '#fff' },
              }
            : undefined,
          tooltip: {
            trigger: 'item',
            formatter: '{b}: {c} ({d}%)',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            borderColor: '#3964fe',
            textStyle: { color: '#fff' },
          },
          legend: {
            top: 30,
            orient: 'horizontal',
            textStyle: { color: '#fff' },
          },
          series: [
            {
              type: 'pie',
              radius: ['40%', '70%'],
              avoidLabelOverlap: false,
              itemStyle: {
                borderRadius: 8,
                borderColor: '#0a0e27',
                borderWidth: 2,
              },
              label: {
                show: true,
                formatter: '{b}\n{d}%',
                color: '#fff',
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
    }

    chart.setOption(option, true);

    // 响应式
    const handleResize = () => {
      chart.resize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [chartRef, type, data, title, isLoading]);

  return <div ref={chartRef} className={styles.chartContainer} />;
};

const ScreenDisplay: React.FC = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dataCards, setDataCards] = useState<DataCard[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);

  // 图表引用
  const lineChartRef = useRef<HTMLDivElement>(null);
  const barChartRef = useRef<HTMLDivElement>(null);
  const pieChartRef = useRef<HTMLDivElement>(null);

  // 默认布局（固定布局模板）
  const defaultLayout: LayoutItem[] = useMemo(
    () => [
      { i: 'card-1', x: 0, y: 0, w: 3, h: 2, type: 'card' },
      { i: 'card-2', x: 3, y: 0, w: 3, h: 2, type: 'card' },
      { i: 'card-3', x: 6, y: 0, w: 3, h: 2, type: 'card' },
      { i: 'card-4', x: 9, y: 0, w: 3, h: 2, type: 'card' },
      {
        i: 'chart-1',
        x: 0,
        y: 2,
        w: 6,
        h: 4,
        type: 'chart',
        chartType: 'line',
      },
      { i: 'chart-2', x: 6, y: 2, w: 6, h: 4, type: 'chart', chartType: 'bar' },
      { i: 'chart-3', x: 0, y: 6, w: 6, h: 4, type: 'chart', chartType: 'pie' },
      {
        i: 'chart-4',
        x: 6,
        y: 6,
        w: 6,
        h: 4,
        type: 'chart',
        chartType: 'line',
      },
    ],
    []
  );

  const [layout] = useState<LayoutItem[]>(defaultLayout);
  // setLayout 保留用于未来扩展（拖拽布局功能）

  // 加载数据
  const loadData = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }

    try {
      // 模拟API请求
      await new Promise(resolve => setTimeout(resolve, 800));

      // 生成模拟数据卡片
      const cards: DataCard[] = [
        {
          id: 'card-1',
          title: '今日销售额',
          value: Math.floor(Math.random() * 100000) + 50000,
          unit: '元',
          change: '↑ 12.5%',
          trend: 'up',
        },
        {
          id: 'card-2',
          title: '订单总数',
          value: Math.floor(Math.random() * 10000) + 5000,
          unit: '单',
          change: '↑ 8.3%',
          trend: 'up',
        },
        {
          id: 'card-3',
          title: '在线设备',
          value: Math.floor(Math.random() * 50) + 30,
          unit: '台',
          change: '↑ 3台',
          trend: 'up',
        },
        {
          id: 'card-4',
          title: '数据采集率',
          value: Math.floor(Math.random() * 10) + 90,
          unit: '%',
          change: '↑ 2.3%',
          trend: 'up',
        },
      ];

      // 生成模拟图表数据
      const dates: string[] = [];
      const now = new Date();
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        dates.push(
          date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
        );
      }

      const chart: ChartData[] = dates.map(date => ({
        date,
        value: Math.floor(Math.random() * 10000) + 5000,
      }));

      setDataCards(cards);
      setChartData(chart);
    } catch (error) {
      message.error('数据加载失败');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // 初始化加载
  useEffect(() => {
    loadData();
  }, [loadData]);

  // 实时刷新（每30秒自动刷新一次）
  useEffect(() => {
    const interval = setInterval(() => {
      loadData(false);
    }, 30000);

    return () => clearInterval(interval);
  }, [loadData]);

  // 全屏功能
  const handleFullscreen = useCallback(() => {
    const screenElement = document.getElementById('screen-display-container');

    if (!screenElement) return;

    if (!isFullscreen) {
      if (screenElement.requestFullscreen) {
        screenElement.requestFullscreen();
      // 遵循宪法.md第13.1.1节TypeScript规范：禁止使用any类型
      } else if ((screenElement as HTMLElement & { webkitRequestFullscreen?: () => void }).webkitRequestFullscreen) {
        (screenElement as HTMLElement & { webkitRequestFullscreen: () => void }).webkitRequestFullscreen();
      // 遵循宪法.md第13.1.1节TypeScript规范：正确处理可选属性
      } else if ((screenElement as unknown as HTMLElement & { mozRequestFullScreen?: () => void }).mozRequestFullScreen) {
        const element = screenElement as unknown as HTMLElement & { mozRequestFullScreen: () => void };
        element.mozRequestFullScreen();
      } else if ((screenElement as unknown as HTMLElement & { msRequestFullscreen?: () => void }).msRequestFullscreen) {
        const element = screenElement as unknown as HTMLElement & { msRequestFullscreen: () => void };
        element.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      // 遵循宪法.md第13.1.1节TypeScript规范：禁止使用any类型
      } else if ((document as Document & { webkitExitFullscreen?: () => void }).webkitExitFullscreen) {
        (document as Document & { webkitExitFullscreen: () => void }).webkitExitFullscreen();
      } else if ((document as Document & { mozCancelFullScreen?: () => void }).mozCancelFullScreen) {
        (document as Document & { mozCancelFullScreen: () => void }).mozCancelFullScreen();
      } else if ((document as Document & { msExitFullscreen?: () => void }).msExitFullscreen) {
        (document as Document & { msExitFullscreen: () => void }).msExitFullscreen();
      }
    }
  }, [isFullscreen]);

  // 监听全屏状态变化
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(
          !!(
          document.fullscreenElement ||
          // 遵循宪法.md第13.1.1节TypeScript规范：禁止使用any类型
          (document as Document & { webkitFullscreenElement?: Element }).webkitFullscreenElement ||
          (document as Document & { mozFullScreenElement?: Element }).mozFullScreenElement ||
          (document as Document & { msFullscreenElement?: Element }).msFullscreenElement
        )
      );
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener(
        'webkitfullscreenchange',
        handleFullscreenChange
      );
      document.removeEventListener(
        'mozfullscreenchange',
        handleFullscreenChange
      );
      document.removeEventListener(
        'MSFullscreenChange',
        handleFullscreenChange
      );
    };
  }, []);

  // 刷新数据
  const handleRefresh = useCallback(() => {
    loadData(false);
    message.success('数据已刷新');
  }, [loadData]);

  // 渲染布局项
  const renderLayoutItem = (item: LayoutItem) => {
    if (item.type === 'card') {
      const card = dataCards.find(c => c.id === item.i);
      if (!card) return null;
      return (
        <div key={item.i} className={styles.layoutItem}>
          <DataCardComponent card={card} isLoading={isLoading} />
        </div>
      );
    } else if (item.type === 'chart') {
      let chartRef: React.RefObject<HTMLDivElement>;
      switch (item.i) {
        case 'chart-1':
          chartRef = lineChartRef;
          break;
        case 'chart-2':
          chartRef = barChartRef;
          break;
        case 'chart-3':
          chartRef = pieChartRef;
          break;
        default:
          chartRef = lineChartRef;
      }
      return (
        <div key={item.i} className={styles.layoutItem}>
          <div className={styles.chartWrapper}>
            <ChartComponent
              chartRef={chartRef}
              type={item.chartType || 'line'}
              data={chartData}
              isLoading={isLoading || isRefreshing}
            />
          </div>
        </div>
      );
    }
    return null;
  };

  if (isLoading && dataCards.length === 0) {
    return (
      <div className={styles.screenDisplay}>
        <Loading fullScreen tip="数据大屏加载中..." />
      </div>
    );
  }

  return (
    <div
      id="screen-display-container"
      className={`${styles.screenDisplay} ${isFullscreen ? styles.fullscreen : ''}`}
    >
      {/* 工具栏 */}
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <div className={styles.screenTitle}>数据大屏</div>
          {isRefreshing && (
            <div className={styles.refreshIndicator}>
              <ReloadOutlined spin />
              <span>刷新中...</span>
            </div>
          )}
        </div>
        <div className={styles.toolbarRight}>
          <Button
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            loading={isRefreshing}
            className={styles.toolbarButton}
          >
            刷新
          </Button>
          <Button
            icon={
              isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />
            }
            onClick={handleFullscreen}
            className={styles.toolbarButton}
          >
            {isFullscreen ? '退出全屏' : '全屏'}
          </Button>
        </div>
      </div>

      {/* 布局容器 */}
      <div className={styles.layoutContainer}>
        {layout.map(item => renderLayoutItem(item))}
      </div>
    </div>
  );
};

export default ScreenDisplay;
