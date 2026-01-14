# 将 shot-detector 项目迁移到 uv 依赖管理

## 项目现状分析

- 当前使用 `requirements.txt` 管理依赖
- 包含对象检测和 API 相关的依赖包
- 使用 Docker 容器化部署，通过 `pip install -r requirements.txt` 安装依赖

## 迁移计划

### 1. 安装 uv

- 确保系统中已安装 uv 包管理器
- 如果未安装，使用官方推荐的安装方式安装

### 2. 初始化 uv 项目

- 在 `apps/shot-detector` 目录中运行 `uv init` 初始化项目
- 这将创建 `pyproject.toml` 文件

### 3. 迁移依赖

- 将 `requirements.txt` 中的依赖迁移到 `pyproject.toml` 文件中
- 保持依赖版本与原文件一致
- 按照依赖类型（对象检测、API）进行合理分组

### 4. 更新 Dockerfile

- 修改 Dockerfile 以使用 uv 安装依赖
- 替换 `pip install --no-cache-dir -r requirements.txt` 为 uv 安装命令
- 确保 Docker 构建过程正常工作

### 5. 测试验证

- 运行 `uv install` 验证依赖安装成功
- 启动项目验证功能正常
- 构建 Docker 镜像验证容器化部署正常

### 6. 清理

- 保留 `requirements.txt` 文件作为备份
- 确保所有配置文件都已正确更新

## 预期结果

- 项目成功迁移到 uv 依赖管理
- 依赖安装速度显著提升
- 项目功能保持不变
- Docker 部署流程正常
