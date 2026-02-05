# http-adapter Specification

## Purpose

提供基于策略模式的 HTTP 响应适配器，统一处理成功响应和错误响应，支持灵活的策略配置和部分覆盖。

## ADDED Requirements

### Requirement: 目录结构组织

packages/http SHALL 采用按技术层次切割的目录结构。

#### Scenario: 目录层次定义

- **WHEN** 查看 `packages/http/src/` 目录
- **THEN** 应包含以下层次：
  ```
  src/
  ├── adapters/          # 适配器层（核心执行逻辑）
  │   ├── success.ts     # 成功适配器
  │   ├── error.ts       # 错误适配器
  │   └── index.ts
  ├── strategies/        # 策略层（默认策略定义）
  │   ├── success.ts     # 成功策略
  │   ├── error.ts       # 错误策略
  │   └── index.ts
  ├── matchers/          # 匹配器层（辅助匹配函数）
  │   ├── success.ts     # 成功匹配器
  │   ├── error.ts       # 错误匹配器
  │   └── index.ts
  ├── common/            # 通用模块
  │   ├── types.ts       # 共享类型
  │   ├── utils.ts       # 共享工具
  │   └── index.ts
  ├── factories/         # 工厂函数
  │   ├── createStrategy.ts
  │   ├── createHandlers.ts
  │   └── index.ts
  ├── core.ts            # 统一适配函数
  └── index.ts           # 主入口
  ```

### Requirement: 成功响应适配器

系统 MUST 提供成功响应适配函数 `adaptSuccess()`。

#### Scenario: 使用默认成功策略

- **WHEN** 调用 `adaptSuccess(response)` 且 response.status === 200
- **THEN** 应返回 `response.data`

#### Scenario: 自定义策略完全覆盖

- **WHEN** 传递自定义策略对象，包含 `match` 和 `handler`
- **THEN** 应使用自定义策略替换默认策略
- **AND** 应按默认策略和自定义策略的顺序匹配

#### Scenario: 只覆盖 match 条件

- **WHEN** 传递自定义策略只包含 `match` 属性
- **THEN** 应使用自定义的 `match` 条件
- **AND** 应保留默认的 `handler` 行为

#### Scenario: 只覆盖 handler 处理器

- **WHEN** 传递自定义策略只包含 `handler` 属性
- **THEN** 应使用默认的 `match` 条件
- **AND** 应使用自定义的 `handler` 处理器

#### Scenario: 添加新策略

- **WHEN** 传递新的策略键名（不在默认策略中）
- **THEN** 应将新策略添加到策略集合中
- **AND** 新策略 MUST 同时包含 `match` 和 `handler`
- **AND** 如果新策略不完整，应抛出错误

#### Scenario: 策略执行顺序

- **WHEN** 多个策略匹配条件都满足
- **THEN** 应只执行第一个匹配的策略
- **AND** 策略按对象定义顺序执行

### Requirement: 错误响应适配器

系统 MUST 提供错误响应适配函数 `adaptError()`。

#### Scenario: HTTP 错误响应

- **WHEN** 错误对象包含 `response` 属性
- **THEN** 应匹配 `httpResponse` 策略
- **AND** 应返回包含 `error`、`status`、`data` 的对象

#### Scenario: 网络错误

- **WHEN** 错误对象包含 `request` 属性但不包含 `response`
- **THEN** 应匹配 `networkError` 策略
- **AND** 应返回包含 `error`、`code`、`message` 的对象

#### Scenario: 请求超时

- **WHEN** 错误对象的 `code` 属性为 'ECONNABORTED'
- **THEN** 应匹配 `timeout` 策略
- **AND** 应返回包含 `error`、`message` 的对象

#### Scenario: 请求被取消

- **WHEN** 错误对象被 `axios.isCancel()` 识别为取消
- **THEN** 应匹配 `canceled` 策略
- **AND** 应返回包含 `error` 的对象

#### Scenario: 兜底策略

- **WHEN** 没有其他策略匹配
- **THEN** 应匹配 `fallback` 策略
- **AND** 应返回包含 `error`、`message` 的对象

#### Scenario: 错误策略覆盖

- **WHEN** 传递自定义错误策略
- **THEN** 应支持与成功适配器相同的覆盖逻辑
- **AND** 应支持部分覆盖和完整覆盖

### Requirement: 匹配辅助函数

系统 MUST 提供匹配辅助函数简化策略创建。

#### Scenario: 成功匹配器

- **WHEN** 使用 `matchSuccess.status(200)`
- **THEN** 应返回匹配 status === 200 的谓词函数

- **WHEN** 使用 `matchSuccess.statusRange(200, 299)`
- **THEN** 应返回匹配 status 在范围内的谓词函数

- **WHEN** 使用 `matchSuccess.header('content-type', 'application/json')`
- **THEN** 应返回匹配指定响应头的谓词函数

#### Scenario: 错误匹配器

- **WHEN** 使用 `matchError.status(404)`
- **THEN** 应返回匹配 response.status === 404 的谓词函数

- **WHEN** 使用 `matchError.code('ECONNREFUSED')`
- **THEN** 应返回匹配 error.code === 'ECONNREFUSED' 的谓词函数

- **WHEN** 使用 `matchError.isNetworkError()`
- **THEN** 应返回匹配网络错误的谓词函数

- **WHEN** 使用 `matchError.isTimeout()`
- **THEN** 应返回匹配超时错误的谓词函数

- **WHEN** 使用 `matchError.isCanceled()`
- **THEN** 应返回匹配取消错误的谓词函数

### Requirement: 工厂函数

系统 MUST 提供工厂函数创建策略和处理器。

#### Scenario: 创建策略

- **WHEN** 调用 `createStrategy(predicate, handler)`
- **THEN** 应返回包含 `match` 和 `handler` 的策略对象

- **WHEN** 调用 `createSuccessStrategy(predicate, handler)`
- **THEN** 应返回类型正确的成功策略对象

- **WHEN** 调用 `createErrorStrategy(predicate, handler)`
- **THEN** 应返回类型正确的错误策略对象

#### Scenario: 创建 Promise 处理器

- **WHEN** 调用 `createHandlers(responseStrategies, errorStrategies)`
- **THEN** 应返回包含 `onSuccess` 和 `onError` 的对象
- **AND** `onSuccess` 应调用 `adaptSuccess`
- **AND** `onError` 应调用 `adaptError`

### Requirement: 统一适配函数

系统 MUST 提供统一适配函数 `adapt()`。

#### Scenario: 自动判断响应类型

- **WHEN** 传递 AxiosResponse 对象
- **THEN** 应调用 `adaptSuccess` 处理

- **WHEN** 传递 AxiosError 对象
- **THEN** 应调用 `adaptError` 处理

- **WHEN** 传递的对象包含 `isAxiosError === true`
- **THEN** 应识别为错误对象

### Requirement: TypeScript 类型支持

系统 MUST 提供完整的 TypeScript 类型定义。

#### Scenario: 策略类型定义

- **WHEN** 定义策略对象
- **THEN** 应包含 `match` 和 `handler` 属性
- **AND** `match` 应为谓词函数类型
- **AND** `handler` 应为处理函数类型
- **AND** 应支持泛型参数

#### Scenario: 部分策略类型定义

- **WHEN** 定义部分策略对象
- **THEN** `match` 和 `handler` 应为可选属性
- **AND** 应至少包含其中一个属性

#### Scenario: 类型推断

- **WHEN** 使用策略对象
- **THEN** TypeScript 应正确推断输入和输出类型
- **AND** 应提供类型检查和自动补全

### Requirement: 命名规范

系统 MUST 使用对齐的命名规范。

#### Scenario: 函数命名

- **WHEN** 导出适配函数
- **THEN** 成功适配函数应命名为 `adaptSuccess`
- **AND** 错误适配函数应命名为 `adaptError`
- **AND** 匹配器对象应命名为 `matchSuccess` 和 `matchError`

#### Scenario: 策略命名

- **WHEN** 导出默认策略
- **THEN** 成功策略应命名为 `defaultSuccessStrategies`
- **AND** 错误策略应命名为 `defaultErrorStrategies`

#### Scenario: 别名支持（可选）

- **WHEN** 提供向后兼容
- **THEN** 可导出 `adaptResponse` 作为 `adaptSuccess` 的别名
- **AND** 应在文档中标注推荐使用的命名

### Requirement: 导出结构

主入口 MUST 统一导出所有公共 API。

#### Scenario: 主入口导出

- **WHEN** 从 `@/packages/http` 导入
- **THEN** 应可导入所有适配器函数
- **AND** 应可导入所有匹配器
- **AND** 应可导入所有默认策略
- **AND** 应可导入所有工厂函数
- **AND** 应可导入所有类型定义

#### Scenario: 按层导入

- **WHEN** 从 `@/packages/http/adapters` 导入
- **THEN** 应只包含适配器层导出

- **WHEN** 从 `@/packages/http/matchers` 导入
- **THEN** 应只包含匹配器层导出

- **WHEN** 从 `@/packages/http/strategies` 导入
- **THEN** 应只包含策略层导出
