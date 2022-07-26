# Alibaba

[[TOC]]

## Nacos

服务注册与配置中心

- `Nacos Server`: 服务注册中心和配置中心, 直接下载并运行即可
- `Nacos Client`: 客户端, 可以使用多种语言

### 特性

- `服务发现`: 基于DNS和RPC的服务发现
- `服务健康监测`: 对服务的实时健康检查
- `动态配置服务`
- `动态DNS服务`
- `服务及其元数据管理`

## Sentinel

高可用流量控制组件

- `Sentinel核心库`: 不依赖任何框架或库, 运行在JAVA8及以上的环境
- `Sentinel控制台`: 可视化地操作`Sentinel`的核心函数

**核心概念**:

- `资源`: 任何想要被保护的内容
- `规则`: 围绕资源设定的规则

### 定义资源方式

- `SphU类`: 使用类`SphU`以及try-catch代码块
- `SphO类`: 使用类`SphO`以及if-else代码块
- `@SentinelResource`: 使用注解`@SentinelResource`

### 流量控制规则

- 控制台操作
- 初始化代码`FlowRuleManager.loadRules(List<DegradeRule>)`定义

## Seata

分布式事务组件

**核心概念**:

- `本地事务`: 由本地资源管理器管理, 严格支持ACID
- `分支事务`: 受全局事务管理和协调的本地事务
- `全局事务`: 一次操作多个资源管理器完成的事务

### 核心组件

- `TC(Transaction Coordinator)`: 事务协调器, Seata服务器, 维护全局事务和分支事务状态, 驱动事务提交或回滚
- `TM(Transaction Manager)`: 事务管理器, 事务发起者, 定义全局事务范围, 做事务操作的决定
- `RM(Resource Manager)`: 资源管理器, 管理分支事务上的资源, 驱动分支事务
- `XID`: 全局事务的唯一标识

**工作流程**:

1. TM向TC申请一个全局事务, 获得XID
2. XID通过服务调用链传给其他RM
3. RM向TC注册一个分支事务, 纳入到XID对应的全局事务
4. TM根据TC收集的分支事务执行结果, 向TC发出全局事务操作的决议
5. TC调度XID下的所有分支事务提交或回滚

### AT模式

1. 使用关系型数据库, 且为使用JDBC连接数据库的JAVA应用
2. 获取SQL信息, 生成修改前后数据信息, 插入到回滚日志中
3. 注册分支事务, 生成行锁, 提交本地事务并向TC提供结果
4. 若所有分支事务成功, 则删除回滚日志相关信息
5. 若有分支事务失败, 通过回滚日志回滚, 若修改后数据信息与当前数据不同, 则需人工处理, 否则生成回滚数据还原
