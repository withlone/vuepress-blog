# 基础

## 三大特性

- 封装: 将数据和数据方法封装到一个类中
- 继承
- 多态
  - 编译时多态: 方法重载
  - 运行时多态: 对象引用在运行时确定(继承 + 重写 + 向上转型)

## 类图

| 泛化关系 | 实现关系 | 聚合关系 |
| - | - | - |
| ![泛化关系](/java/泛化.svg) | ![实现关系](/java/实现.svg) | ![聚合关系](/java/聚合.svg) |
| 组合关系 | 关联关系 | 依赖关系 |
| ![组合关系](/java/组合.svg) | ![关联关系](/java/关联.svg) | ![依赖关系](/java/依赖.svg) |

## 访问权限控制

| | 类内部 | 本包 | 子类 | 外部包 |
| - | - | - | - | - |
| public | √ | √ | √ | √ |
| protect | √ | √ | √ | × |
| default | √ | √ | × | × |
| private | √ | × | × | × |

## 基本类型

| type | boolean | byte | char | short | int | float | long | double |
| - | - | - | - | - | - | - | - | - |
| bytes/bit | 1 | 8 | 16 | 16 | 32 | 32 | 64 | 64 |

**缓冲池**:

| type | Boolean | Byte | Short | Integer | Character |
| - | - | - | - | - | - |
| range | false, true | all | [-128, 127] | [-128, 127] | [0, 127] |

> Integer占用空间16字节 = Header(标记头4 + 对象指针4) + int(4) + 对齐(4)

## Object

- `toString()`
- `clone()`: protected方法, 本地方法(C实现), 重写后使用
- `equals()`, `hashCode()`: 使用某些Collection时需重写

## static

**初始化顺序**:

> 同层级初始化取决于在代码中的顺序

1. 父类(静态变量、静态语句块)
2. 子类(静态变量、静态语句块)
3. 父类(实例变量、普通语句块)
4. 父类(构造函数)
5. 子类(实例变量、普通语句块)
6. 子类(构造函数)

**静态语句块**:

``` java
static {
  System.out.println("静态语句块");
}
```

**普通语句块**:

``` java
{
  System.out.println("普通语句块");
}
```

## String, StringBuilder, StringBuffer

- String: 不可变, 线程安全
- StringBuilder: 可变, 线程不安全
- StringBuffer: 可变, 线程安全, synchronized
