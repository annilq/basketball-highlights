# 重构方案

## 1. 代码分析

### 现有结构

- **app.py**: 包含 `ShotDetectorAPI` 类，负责处理视频中的投篮检测，返回统计数据（尝试次数、命中次数、投篮命中率等）。
- **shot_detector.py**: 包含 `ShotDetector` 类，是第三方代码，实现了类似的投篮检测功能，但侧重于实时显示视频和结果。

### 问题分析

- 两个类存在代码冗余，特别是投篮检测逻辑。
- `app.py` 同时处理API请求和核心检测逻辑，职责不够单一。
- `ShotDetector` 类在初始化时会自动启动视频处理，不适合API的按需处理模式。

## 2. 重构步骤

### 步骤1: 抽取ShotDetectorAPI到独立文件

- 创建新文件 `shot_detector_api.py`，将 `ShotDetectorAPI` 类从 `app.py` 移至该文件。

### 步骤2: 最小化修改ShotDetector类

- 修改 `shot_detector.py` 中的 `ShotDetector` 类：
  - 添加 `model_path` 参数到 `__init__` 方法，默认值为 "best.pt"，保持向后兼容。
  - 添加 `video_path` 参数到 `__init__` 方法，默认值为 "video_test_5.mp4"，保持向后兼容。
  - 移除 `__init__` 方法中的 `self.run()` 调用，避免自动启动处理。

### 步骤3: 实现ShotDetectorAPI继承ShotDetector

- 在 `shot_detector_api.py` 中，使 `ShotDetectorAPI` 继承自 `ShotDetector`。
- 在 `ShotDetectorAPI` 的 `__init__` 方法中，调用父类的 `__init__` 方法并传入 `model_path`。

### 步骤4: 优化detect_shots方法

- 重写 `detect_shots` 方法，利用父类的属性和方法：
  - 打开指定的视频文件。
  - 循环处理每一帧，收集篮球和篮筐位置。
  - 复用父类的 `clean_motion` 逻辑（但移除显示部分）。
  - 复用父类的投篮检测逻辑，记录投篮事件。
  - 返回API所需的统计数据和投篮事件列表。

### 步骤5: 更新app.py

- 修改 `app.py`，从 `shot_detector_api.py` 导入 `ShotDetectorAPI`。
- 保持API端点逻辑不变，仅更新导入路径。

## 3. 预期效果

- **代码复用**: `ShotDetectorAPI` 通过继承 `ShotDetector` 复用核心检测逻辑，减少代码冗余。
- **职责分离**: `app.py` 仅处理API请求，核心检测逻辑由 `ShotDetectorAPI` 负责。
- **最小修改**: 对 `ShotDetector` 的修改最小化，保持其作为第三方代码的完整性。
- **功能完整**: 重构后的代码应保持原有功能，同时提高可维护性。
