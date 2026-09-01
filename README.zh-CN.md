# Rosco 色片建议

Rosco 色片建议是一个用于灯光测试、摄影和影视灯具色温校正的换算工具。用户只需要设置原始光源和目标光源的色温，应用会自动计算 Mired Shift，并从内置 Rosco 色温校正色片数据中推荐接近目标偏移量的色片。

项目是独立的 React + Vite PWA 应用，支持安装到桌面或移动设备。首次成功打开后，应用会缓存界面资源和本地色片数据，在临时离线的现场环境中也可以继续使用。

## 适合用来做什么

- 快速判断从一个色温转换到另一个色温所需的 Mired Shift
- 在 Rosco 色温校正色片中寻找接近目标偏移量的型号
- 比较单张色片和叠加色片方案
- 在中英文界面、多套主题之间切换，并保留个人偏好

## 功能

- 通过 Original Source 与 Converted Source 两个滑块计算 Mired Shift
- 根据正负偏移推荐暖化或冷却方向的 Rosco 色片
- 可选开启叠加色片建议，展示多张色片相加后的 Mired Shift
- 显示色片颜色、型号和偏移匹配程度
- 支持中文 / English 界面切换
- 支持多套主题切换
- 使用本机浏览器保存语言和主题偏好，下次打开仍会保留
- 支持 PWA 安装和离线使用

## 数据来源

色片数据来自 `doc/rosco色温片参数.xlsx`，已提取到 `src/data/roscoFilters.js`。Excel 文件仅作为原始资料随仓库保存，项目运行时不会读取它；应用直接使用本地 JS 数据，不依赖远程接口。

## 启动

```bash
cd /Volumes/Marisa_Data_A/color-tools/rosco-filter-advisor
npm install
npm run dev
```

开发服务器地址通常为：

```text
http://127.0.0.1:5174/
```

## 构建和预览 PWA

```bash
npm run build
npm run preview
```

PWA 的安装和 service worker 通常需要通过 localhost 或 HTTPS 访问。打开预览地址后，在浏览器地址栏或菜单中选择“安装应用 / Install app”即可安装到桌面。

首次打开并等待页面加载完成后，应用会缓存 HTML、JavaScript、CSS、图标和本地色片数据。之后即使暂时断网，也可以继续进行 Mired Shift 计算和色片推荐。
