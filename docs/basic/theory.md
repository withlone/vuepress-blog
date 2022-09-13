# 理论

[[TOC]]

## 软件开发原则 SOLID

- `S单一职责SRP`: 一个对象包含单一职责, 只有一个引起它的变化
- `O开放封闭OCP`: 模块对扩展开放, 对修改关闭
- `L里氏替换LSP`: 任何基类可以出现的地方, 子类也可以出现
- `I接口隔离ISL`: 客户端不依赖它不需要的接口
- `D依赖倒置DIP`: 依赖抽象而不是具体的实现

---

`合成/聚合复用原则`: 尽量使用对象组合而不是继承关系

`迪米特法则`: 尽量不与其他类交互

## 分布式理论

`CAP`: C一致性, A可用性, P分区容错性, 三者不能同时满足

- `C 一致性`: 一个写操作成功后, 所有读请求均读取到新数据
- `A 可用性`: 请求能够及时处理, 不会一直等待
- `P 分区容错性`: 网络分区部分断开的情况下, 被分隔节点仍能正常提供服务

`BASE`: BA基本可用, S软状态, E最终一致性

- `BA 基本可用`: 允许不可预知故障时损失部分可用性
- `S 软状态`: 允许不同节点的数据副本同步存在延时
- `E 最终一致性`: 所有数据副本在一段时间同步后能到达一致状态

## 事务理论 ACID

- `A 原子性`: 事务内操作要么全部成功要么全部失败
- `C 一致性`: 事务执行前后, 数据状态保持一致
- `I 隔离性`: 并发事务间隔离, 不互相干扰
- `D 持久性`: 事务完成后不能回滚

## 微服务基础: 康威定律

- `第一定律`: 组织沟通方式通过系统设计表达
- `第二定律`: 时间再多事情无法做的完美, 但是一定能做完
- `第三定律`: 线型系统与线型组织架构异质同态
- `第四定律`: 大系统组织比小系统组织更倾向于分解

## 设计模式

### 创建型

- `单例模式`: 一个类只有一个实例
- `简单工厂`: 一个类负责实例化操作
- `工厂方法`: 定义一个创建对象的接口, 子类决定实例化哪个类
- `抽象工厂`: 定义多个创建不同对象的接口, 子类决定实例化哪个类
- `生成器`: 封装对象的构造过程, 允许按步骤构造
- `原型模式`: 复制原型实例创建新实例

### 结构型

- `外观`: 提供一个接口用于访问子系统一群接口
- `适配器`: 将一个接口转换成另一个期望的接口
- `桥接`: 分离实现和抽象, 实现调用抽象的接口
- `组合`: 允许将对象组合成树形结构
- `装饰`: 动态扩展对象的功能
- `享元`: 在一个对象中添加共享变量
- `代理`: 一个对象代替另一个对象完成任务

### 行为型

- `责任链`: 处理者排成链, 请求者沿链发送请求, 减少发送与请求的耦合
- `策略`: 将一系列算法封装, 使得可以更换算法
- `模板方法`: 一个方法定义算法步骤, 其中某些步骤可由子类重写
- `命令模式`: 命令封装为对象, 命令对象放入队列, 可执行或撤销
- `观察者`: 一对多映射, `一`发生内部变化时向`多`发出通知
- `访问者`: 为一个对象的组合添加新的能力
- `状态`: 允许对象内部改变行为
- `解释器`: 由语法为语言创建解释器
- `迭代器`: 提供顺序访问聚合对象中各元素
- `中介者`: 集中相关对象之间的沟通
- `备忘录`: 允许对象回到之前的状态

### 单例模式实现补充

#### 懒汉式-线程不安全

``` java
public class Singleton {
  private static Signleton instance;

  public static Singleton getInstance() {
    if (instance == null) {
      instance = new Signleton();
    }
    return instance;
  }
}
```

#### 饿汉式-线程安全

提前实例化, 消耗资源

``` java
public class Singleton {
  private static Signleton instance = new Singleton();
}
```

#### 懒汉式-线程安全

锁范围较大, 损失性能

``` java
public class Singleton {
  private static Signleton instance;

  public static synchronized Singleton getInstance() {
    if (instance == null) {
      instance = new Signleton();
    }
    return instance;
  }
}
```

#### 双重校验锁

延迟初始化, 减小锁范围, `volatile`用于防止初始化过程指令重排, 导致获取到未初始化但已初始化指针的实例

``` java
public class Singleton {
  private volatile static Signleton instance;

  public static Singleton getInstance() {
    if (instance == null) {
      synchronized (Singleton.class) {
        if (instance == null) {
          instance = new Singleton();
        }
      }
    }
    return instance;
  }
}
```

#### 静态内部类

延迟初始化

``` java
public class Singleton {
  private static class SingletonHolder {
    private static final Singleton INSTANCE = new Singleton();
  }

  public static Singleton getInstance() {
    return SingletonHolder.INSTANCE;
  }
}
```
