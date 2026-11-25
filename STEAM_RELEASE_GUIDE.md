# 《桌面修仙录》Steam 正式上架配置清单

## 1. 替换正式 Steam AppID
拿到 Steamworks 后台分配的正式 AppID 后，修改项目根目录的 `steam_appid.txt`（当前为本地调试用的 `480`）：
```txt
你的正式AppID
```
> 打包时 `steam_appid.txt` 会自动随 `extraResources` 打入安装包；上传 SteamPipe 正式版时可按 Steam 建议保留或由 Steam 客户端注入。

## 2. Steamworks 后台配置 12 个成就（API 名称必须完全一致）
在 Steamworks → 统计与成就 → 成就 中新建以下 12 条：

| API 名称 | 中文显示名 | 触发条件 |
| --- | --- | --- |
| `first_kill` | 初试青锋 | 首次御剑斩杀妖兽 |
| `kill_50` | 除妖卫道 | 累计斩杀 50 只妖兽 |
| `kill_300` | 百战剑尊 | 累计斩杀 300 只妖兽 |
| `realm_zhuji` | 筑基大道 | 突破至筑基初期 |
| `realm_jindan` | 金丹初成 | 突破至金丹初期 |
| `first_immortal` | 仙品出世 | 获得一件仙品法宝 |
| `first_boss` | 妖王克星 | 击败任意一位秘境镇守妖王 |
| `tower_5` | 锁妖新秀 | 通关无尽锁妖塔第 5 层 |
| `tower_15` | 镇塔大能 | 通关无尽锁妖塔第 15 层 |
| `first_pet` | 灵宠相伴 | 契约第一只随行灵宠 |
| `fish_5` | 宗门钓鱼佬 | 点亮 5 种垂钓图鉴 |
| `sweeper_master` | 扫地老仙 | 觉醒后山扫地僧隐藏传承 |

## 3. Steam 云存档（Steam Cloud）配置
游戏已同时接入：
1. **Steam Cloud API**：在连接 Steam 时自动读写云端 `save.json`。
2. **Auto-Cloud 本地目录兜底**：
   - **macOS**：`~/Library/Application Support/desktop-xiuxian/saves/save.json`
   - **Windows**：`%APPDATA%/desktop-xiuxian/saves/save.json`

## 4. 打包命令
```bash
# macOS 安装包（生成 release/桌面修仙录-1.0.0-arm64.dmg 等）
npm run dist:mac

# Windows 安装包（建议在 Windows 机器或 GitHub Actions 上执行，生成 .exe 安装版 + 免安装便携版）
npm run dist:win
```
