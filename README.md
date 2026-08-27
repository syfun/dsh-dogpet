# 🐕 中华田园犬桌面宠物 (DSH Desktop Pet)

一只基于 **DeepSeek Harness (Cordis)** 的中华田园犬卡通桌面宠物插件。

## 特性

- 🎨 **可爱卡通形象**：橘黄+米白配色、卷曲尾巴、粉色项圈、豆豆眼
- 🔄 **状态自动切换**：根据 DSH Agent 工作状态自动切换三种动画
- 🖱️ **自由拖动**：鼠标拖动到屏幕任意位置
- 💬 **汪汪大叫**：DSH 停止工作时面向左上角大喊，5个"汪"字飘出

## 三种状态

| DSH 状态 | 宠物表现 |
|---|---|
| `idle`（空闲） | 🐕 正面坐姿，吐粉色舌头哈气，头轻微摆动，尾巴摇摆 |
| `running`（工作中） | 🐕 侧躺肚子朝上，4条腿摆动画圈，红白皮球在脚上快速旋转 |
| `running → idle`（停止工作） | 🐕 整体转向左上角，张嘴汪汪叫，5个"汪"字从小到大飘向左上方 |

## 安装

1. 确保你已安装 [DeepSeek Harness](https://github.com/deepseek-ai/dsh)
2. 将本插件挂载到你的 DSH 配置中
3. 启动 DSH，右下角就会出现你的小土狗 🐕

## 使用

启动后宠物默认出现在屏幕右下角，可以用鼠标拖动到任意位置。

## 技术架构

- **Host 端**：监听 `agent/status` 事件，记录 `idle` ↔ `running` 状态变化
- **Client 端**：注册在 `shell.overlay` 槽位，每 1 秒轮询 Host 获取状态
- **通信**：通过 `harness.handle` + `host.call` 实现 Client→Host JSON RPC

## 许可证

MIT
