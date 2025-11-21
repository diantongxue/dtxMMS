import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import './styles/index.css';

function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <div className="app">
        <h1>滇同学·智慧系统</h1>
        <p>项目初始化完成，UI-001 模块开发中...</p>
      </div>
    </ConfigProvider>
  );
}

export default App;

