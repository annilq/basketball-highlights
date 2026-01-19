# 为投篮检测结果创建数据库schema

## 设计思路

1. 根据`detect_shots`方法返回的结果结构，设计两个表：
   - `shotDetection`：存储每次投篮检测的主结果

   - `shotEvent`：存储投篮事件详情（一对多关系）

2. 表结构设计：
   - `shotDetection`表：
     - id: 主键

     - videoUrl: 可选，视频URL

     - videoName: 可选，视频名称

     - attempts:尝试次数

     - makes: 命中次数

     - createdAt: 创建时间

     - updatedAt: 更新时间

   - `shotEvent`表：
     - id: 主键

     - shotDetectionId: 外键，关联到shotDetection表

     - frame: 帧号

     - isMake: 是否命中

     - createdAt: 创建时间

3. 实现步骤：
   - 创建`/db/schema/shotDetection.ts`文件

   - 定义`shotDetection`和`shotEvent`表结构

   - 定义表之间的关系

   - 在`/db/schema/index.ts`中导出新创建的schema

4. 遵循现有代码风格和设计模式

## 预期结果

- 新增两个数据库表，用于持久化投篮检测结果

- 与现有schema设计保持一致

- 支持从API接收检测结果并存储到数据库
