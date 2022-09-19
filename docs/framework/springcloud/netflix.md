# Netflix

## Eureka

服务注册与发现组件

- `Eureka Server`: 服务注册中心, 微服务启动时将自己注册到`Eureka Server`, `Eureka Server`维护可用服务列表
- `Eureka Client`: 客户端, 即各微服务, 注册后会向`Eureka Server`发送心跳, 如果没有接收到心跳将从可用服务列表中移除该服务
  - `服务提供者`: 提供服务, 将自己的服务注册到`Eureka Server`
  - `服务消费者`: 消费服务, 从`Eureka Server`获取服务列表

### 集群

单个`Eureka Server`可能无法承担所有的注册任务, 此时需部署`Eureka Server`集群, 集群内`Eureka Server`互相注册, 使得一台`Eureka Server`接收到注册时会转发到集群中, 防止注册中心崩溃问题

### 自我保护机制

默认情况下, `Eureka Server`一段时间内没有接收到`Eureka Clinet`的心跳会将其从服务列表移除, 但为了防止因网络故障导致的短暂失去连接, 自我保护机制开启时价将不会移除没有心跳的服务直至关闭自我保护机制

- `自我保护机制的触发`: 当最后一分钟续约数(接收到心跳数总和, `Renews(last min)`)低于续约阈值(期望收到心跳数的85%, `Renews threshold`)时触发, 否则终止

## Ribbon

- 负载均衡与服务调用组件
- 基于HTTP和TCP的客户端负载均衡器, 先从`Eureka Server`获取服务端列表, 然后负载均衡

### 服务端负载均衡 VS 客户端负载均衡

1. 服务端负载均衡需在服务端与客户端之间建立一个独立的负载均衡服务器, 客户端负载均衡以代码形式封装到客户端
2. 客户端负载均衡需要从注册中心获取服务清单
3. 服务端先发送请求后负载均衡, 客户端先负载均衡后发送请求
4. 客户端负载均衡知道具体哪个服务端提供的服务

### 负载均衡实现

`IRule`接口定义负载均衡策略, 有7个默认实现类, 每一个类是一种负载均衡策略

1. `RoundRobinRule`: 线性轮询, 默认
2. `RandomRule`: 随机选择
3. `RetryRule`: 线性轮训的基础上添加失败机制, 在指定时间内获取失败则重试, 超出时间则返回null
4. `WeightedResponseTimeRule`: 平均响应时间越短选中概率越大, 统计信息不足时使用`RoundRobinRule`
5. `BestAvailableRule`: 过滤故障服务, 选择并发量最小的服务
6. `AvailabilityFilteringRule`: 过滤故障服务, 过滤并发量大于阈值的服务, 剩下服务轮训选择
7. `ZoneAvoidanceRule`: 综合判断服务所在区域的性能和服务可用性来选择, 没有区域下雨`RandomRule`类似

## OpenFeign

- 声明式服务调用组件
- Feign对Ribbon集成, 通过声明接口并注解进行配置, 不支持Spring MVC注解
- OpenFeign对Feign进行封装, 支持Spring MVC注解

### 注解

1. `@FeignClient`: 通知OpenFeign组件对`@RequestMapping`注解下的接口解析, 动态代理生成实现类
2. `@EnableFeignClients`: 开启OpenFeign

## Hystrix

服务熔断与降级组件

### 作用

- `保护线程资源`: 防止单个服务消耗所有线程资源
- `快速失败机制`: 发生故障的服务返回请求失败
- `降级方案`: 请求失败后使用的降级方案(程序运行异常, 服务超时, 熔断器打开, 线程资源耗尽等时降级)
- `防止故障扩散`: 熔断机制防止扩散到其他服务
- `监控功能`: 故障监控组件

### 降级

- `服务端降级`: `@HystrixCommand`注解, 指定降级方法以及降级相关参数, `@EnableCircuitBreaker`开启
- `客户端降级`: `@HystrixCommand`注解, `@EnableHystrix`开启
- `全局降级`: 在Controller类上用`@DefaultProperties`注解指定全局降级方法(仅对同一个类生效), 之后使用`@HystrixCommand`无需配置参数
- `解耦降级`: `@FeignClient`注解添加参数fallback, 指定为`@FeignClient`注解的接口的一个实现类

### 熔断

- 熔断关闭状态: 服务正常访问
- 熔断开启状态: 一定时间内出错率达到阈值, 进入熔断开启状态, 对服务的调用均降级, 一段时间后进入半熔断状态
- 半熔断状态: 熔断器允许部分请求调用服务, 一段时间内, 若成功率达到阈值则进入熔断关闭状态, 否则重新进入熔断开启状态

### 故障监控

持续记录所有通过Hystrix发送的请求

## Gateyway

- API网关组件
- 客户端与微服务之间的服务
- 基于WebFlux实现, WebFlux底层采用Netty

### 核心概念

- `Route`路由: 基本模块, 由ID, URI, 断言, 过滤器组成
- `Predicate`断言: 路由转发的判断条件, 对HTTP请求进行匹配
- `Filter`过滤器: 对请求拦截和修改, 可做参数校验, 权限校验

### 动态路由

以服务名为路径创建动态路由转发`lb://service-name`, 使用`lb`协议开启负载均衡, `service-name`表示服务名

### 过滤器

- `GatewayFilter`网关过滤器: 在配置中完成过滤器的描述
- `GlobalFilter`全局过滤器: 自定义全局过滤器

## Config

分布式配置文件

- `Config Server`: 分布式配置中心, 连接配置仓库为客户端提供获取配置信息等
- `Config Client`: 各微服务通过`Config Server`获取配置

### 配置刷新

一般情况下只有重启`Config Client`才能更新配置

- `手动刷新配置`: 在`actuator`监控下, 使用`@RefreshScope`注解到动态更新的配置, 然后调用`POST /actuator/fresh`刷新配置
- `Config + Bus动态刷新`: `Spring Cloud Bus`利用消息代理构建一个公共消息主题, 让所有服务在这一主题下消费
  1. 配置发生改变, 向`Config`中一个客户端或一个服务端发送`fresh`请求(修改请求可以使得定点刷新)
  2. 收到更新请求的端将请求转发给`Bus`
  3. `Bus`通知所有`Config Client`
