---
sidebar: auto
---

# Dubbo

RPC服务开发框架, 解决微服务架构下的服务治理与通信问题

## 服务发现

<img :src="$withBase('/DubboArchitecture.png')" alt="Dubbo框架">

**与Dubbo2区别**:

- Dubbo2接口级服务发现, 以接口粒度组织地址数据
- Dubbo3应用级服务发现, 以应用粒度组织地址数据
  - 优势: 适配云原生微服务变革, 提高性能与可伸缩性(降低Dubbo2中注册服务过多的问题)

## RPC通信协议

### HTTP/1.1

- 优势: 通用性, 大部分设备支持HTTP协议
- 劣势:
  - 一个链路上只能有一个请求, 会产生HOL(队首阻塞)
  - 头部传输协议性能差

### gRPC

- 基于HTTP2与Protobuf
- RPC功能偏基础, 强绑定protobuf序列化方式

### Triple协议

- Dubbo3的主推协议, 由Dubbo1.0/Dubbo2.0演进而来
- 兼容gRPC以及增强和补充

#### 特点

- 支持跨语言互通
- 提供Request/Response模型以及Streaming和Bidirectional
- 易扩展, 穿透性高
- 支持多种序列化方式

## 流量控制

- 根据制定好的路由规则分发到应用服务上
- 支持mesh方式流量管理, 实现A/B测试, 金丝雀发布, 蓝绿发布等

## 配置管理

- `启动阶段配置项`: Dubbo启动时读取的配置
- `配置方式`: API配置, XML配置, Annotation配置, 属性配置
- `服务治理规则`: 改变运行时服务的行为和选址逻辑, 从而限流, 配置权重

## 部署架构

三大中心化组件: 注册中心, 配置中心, 元数据中心

- `注册中心`: 服务注册和服务发现, 可作为配置中心和元数据中心
- `元数据中心`: 兼容老版本Dubbo搭建的服务, 承载服务元数据, 接口方法级别配置信息的存储, 减轻注册中心压力
- `配置中心`: 配置数据与服务治理规则