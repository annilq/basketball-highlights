# 重构API网关层分离

## 1. 重构Python服务 (`app.py`)

- 修改三个端点 (`/detect-shots`, `/generate-shot-clip`, `/generate-highlights`) 从接受文件改为接受`video_url`参数
- 删除临时文件处理逻辑，直接使用URL访问视频

## 2. 重构tRPC路由 (`shotDetection.ts`)

- 修改所有三个mutation的input schema，只接收`videoUrl`参数
- 删除处理video文件的逻辑
- 优化Python服务调用，只传递`videoUrl`

## 3. 重构Hono API (`app.ts`)

- 保留并修改`/api/shot-detection/upload`接口，实现本地文件存储，返回存储路径URL
- 删除`/api/shot-detection/generate-highlights`和`/api/shot-detection/generate-clip`接口

## 4. 重构前端页面 (`shot-detection.tsx`)

- 修改文件上传逻辑：先调用Hono上传接口获取URL，再调用tRPC服务
- 修改三个mutation调用，只传递videoUrl
- 保持原有UI和用户体验不变

## 5. 测试

- 测试文件上传功能
- 测试投篮检测功能
- 测试高亮生成功能
- 测试剪辑生成功能
