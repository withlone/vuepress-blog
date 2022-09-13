# 机制

[[TOC]]

## 泛型

### 泛型方法

``` java
public <T> T getObject(Class<T> c) {
  T t = c.newInstance();
  return t;
}
```

### 泛型上下限

- `<?>`: 无限制通配符
- `<? extends E>`: 类型E或类型E的子类
- `<? super E>`: 类型E或类型E的父类
- `<? extends E & T>`: 同时多个限制

### 泛型说明

- 泛型擦除: 无限制通配符替换为`Object`, 使用`extends T`时替换为`T`, 使用`super T`时替换为`Object`
- 泛型类中不能使用泛型类型声明静态变量和静态方法
- 异常中不能使用泛型
- catch不能使用泛型

## 注解

### 作用

- 生成文档, 如javadoc
- 编译检查, 如@Override
- 编译时动态处理, 如动态生成代码
- 运行时动态处理, 如使用反射注入实例

### 分类

- `Java自带注解`: `@Override`, `@Deprecated`, `@SuppressWarnings`
- `元注解`: 用于定义注解的注解, `@Retention`(注解被保留的阶段), `@Target`(注解使用的范围), `@Inherited`(父类注解可被子类继承), `@Documented`(是否生成javadoc)
- `自定义注解`: 根据自己的需求定义注解

## 异常

- `Throwable`: 所有错误与异常的超类
- `Error(错误)`: 无法处理, JVM将终止进程, 如内存溢出, 栈溢出
- `Exception(异常)`: 可以捕获和处理的异常
  - RuntimeException(运行时异常): java编译器不检查(可查异常), 可不捕获
  - 非运行时异常: 必须捕获

## 反射

> 反射指将java类中各个成分映射为一个个java对象

- `Class类`: 表示一个java类
  - 获取方式: 类名.class, 对象.getClass(), Class.forName(全限定类名)
- `Constructor类`: Class对象表示的类的构造方法
- `Field类`: 提供有关类或接口的单个字段信息, 以及动态访问权限, 可为类字段或实例字段
- `Method类`: 提供有关类或接口的单独某个方法的信息, 可为类方法或实例方法

## SPI

> (Service Provider Interface), 服务提供发现机制, 为某个接口寻找服务实现

<img :src="$withBase('/java/javaSpi.jpg')" alt="javaSpi">
