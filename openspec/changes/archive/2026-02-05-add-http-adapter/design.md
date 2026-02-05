# HTTP 响应适配器设计文档

## Context

当前项目中，axios 响应处理逻辑散落在各个应用中，缺乏统一的处理机制。`packages/http` 目录已存在但为空，需要实现一个通用的 HTTP 响应适配器模块。

### 约束条件

- 必须使用 TypeScript 提供完整类型支持
- 必须兼容 axios 响应和错误对象
- 必须支持策略模式设计
- 必须遵循项目的 Monorepo 架构规范

### 利益相关者

- 应用开发者：使用适配器处理 HTTP 响应
- 平台维护者：扩展和维护适配器功能

## Goals / Non-Goals

### Goals

- 提供统一的成功响应和错误响应适配接口
- 支持灵活的策略配置和部分覆盖
- 提供默认策略集减少配置工作量
- 提供匹配辅助函数简化策略创建
- 易于扩展新的适配器类型

### Non-Goals

- 不实现具体的 HTTP 请求封装（由各应用自行决定）
- 不实现请求拦截器（后续可扩展）
- 不实现重试/缓存逻辑（作为独立适配器类型）

## Decisions

### Decision 1: 目录结构按技术层次切割

**选择**: `adapters/` → `strategies/` → `matchers/` 三层架构

**理由**:
- 关注点分离：适配器专注执行逻辑，策略定义默认行为，匹配器提供辅助函数
- 易于扩展：添加新功能时，在对应层添加模块
- 层次清晰：便于理解和维护

**目录结构**:
```
src/
├── adapters/          # 适配器层（核心执行逻辑）
│   ├── success.ts
│   ├── error.ts
│   └── index.ts
├── strategies/        # 策略层（默认策略定义）
│   ├── success.ts
│   ├── error.ts
│   └── index.ts
├── matchers/          # 匹配器层（辅助匹配函数）
│   ├── success.ts
│   ├── error.ts
│   └── index.ts
├── common/            # 通用模块
├── factories/         # 工厂函数
└── index.ts
```

**替代方案**:
- 按功能模块切割（response/、error/、timeout/）被否决，因为 timeout 是 error 的子类型

### Decision 2: 命名对齐使用 success/error

**选择**: `adaptSuccess` / `adaptError`

**理由**:
- 语义对称：Success 对应 Error，业务语义清晰
- 符合直觉：成功/失败是同一枚举的两面
- 避免混淆：`response`（数据类型）和 `error`（场景）不对齐

**替代方案**:
- `adaptResponse` / `adaptError` - 不对齐，response 是数据类型，error 是场景

### Decision 3: 支持策略的部分覆盖

**选择**: 允许只覆盖 `match` 或 `handler`

**理由**:
- 灵活性：用户可以只修改匹配条件或处理逻辑
- 简洁性：减少重复代码
- 向后兼容：传递完整策略对象仍然有效

**实现方式**:
```typescript
// 只覆盖 match
adaptSuccess(response, {
  success: {
    match: (r) => r.status >= 200 && r.status < 300
    // handler 隐式继承默认行为
  }
});

// 只覆盖 handler
adaptSuccess(response, {
  success: {
    handler: (r) => ({ data: r.data, timestamp: Date.now() })
    // match 隐式继承默认行为
  }
});
```

**替代方案**:
- 要求策略必须完整 - 过于严格，缺乏灵活性

### Decision 4: 新策略必须完整定义

**选择**: 添加新键名时，必须提供 `match` 和 `handler`

**理由**:
- 类型安全：避免运行时错误
- 明确性：强制开发者明确意图
- 可维护性：策略定义完整，易于理解

**实现方式**:
```typescript
// 运行时检查
if (!(key in defaultStrategies) && !isCompleteStrategy(customStrategy)) {
  throw new Error(`Strategy "${key}" must provide both 'match' and 'handler'`);
}
```

### Decision 5: 默认策略最小化

**选择**: 成功响应仅处理 `status === 200`，错误响应包含常见错误类型

**理由**:
- 简单性：避免过度设计
- 可覆盖：用户可以轻松覆盖默认行为
- 明确性：默认行为清晰直观

**默认成功策略**:
```typescript
success: {
  match: (r) => r.status === 200,
  handler: (r) => r.data
}
```

**默认错误策略**:
```typescript
{
  httpResponse: { /* 4xx, 5xx */ },
  networkError: { /* 网络错误 */ },
  timeout: { /* 超时 */ },
  canceled: { /* 取消 */ },
  fallback: { /* 兜底 */ }
}
```

## Risks / Trade-offs

### Risk 1: 策略顺序依赖

**风险**: 策略按顺序匹配，顺序不当可能导致意外行为

**缓解措施**:
- 文档中明确说明策略执行顺序
- 提供策略优先级配置（可选）
- 在实现中记录策略执行顺序日志（开发模式）

### Risk 2: 部分覆盖的滥用

**风险**: 过度使用部分覆盖可能导致策略不清晰

**缓解措施**:
- 文档中说明何时使用部分覆盖
- 提供完整的策略示例作为参考
- 在 TypeScript 类型中明确标注可选属性

### Trade-off 1: 运行时检查 vs 编译时检查

**选择**: 运行时检查新策略完整性

**权衡**:
- 运行时检查：灵活，但错误在运行时才发现
- 编译时检查：安全，但 TypeScript 无法区分"覆盖"和"新增"

**理由**: TypeScript 无法在编译时区分，采用运行时检查是最佳方案

## Migration Plan

### 步骤

1. 创建 `packages/http` 的 `package.json` 和 TypeScript 配置
2. 实现通用模块（`common/`）
3. 实现匹配器层（`matchers/`）
4. 实现策略层（`strategies/`）
5. 实现适配器层（`adapters/`）
6. 实现工厂函数（`factories/`）
7. 编写单元测试
8. 编写使用文档

### 回滚计划

如果实现出现问题，可以：
1. 删除 `packages/http` 目录
2. 恢复各应用中的原有 HTTP 处理逻辑

## Open Questions

无。所有设计决策已明确。
