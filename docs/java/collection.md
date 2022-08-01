# 集合框架

> 容器包含Collection(存储对象的集合)和Map(存储键值对映射表)

## Collection两组语义

| | 抛出异常 | 返回特定值(如null) |
| - | - | - |
| 插入 | add | offer |
| 删除 | remove | poll |
| 获取 | element | peek |

## Set

- TreeSet: 红黑树实现, 支持有序操作, 效率低于HashSet, 查找复杂度O(log n)
- HashSet: 哈希表实现, 不支持有序操作, 查找复杂度O(1), 哈希冲突少时用链表, 多时用红黑树
- LinkedHashSet: HashSet基础上用双向链表维护元素插入顺序

## List

- ArrayList: 动态数组, 随机访问, 允许null元素
- Vector: 线程安全的ArrayList
- LinkedList: 双向链表, 顺序访问, 允许null元素

### ArrayList

- 初始容量默认10
- 每次扩容为1.5倍
- 底层为数组
- 使用modCount记录修改次数, 使得并发时迭代器使用会抛出异常

## Queue

- LinkedList: 链表的双向队列
- PriorityQueue: 堆实现, 优先队列
- ArrayDeque: 数组的循环队列, 不允许null元素

### ArrayDeque

- 循环队列, 队列满时double容量
- double扩容时, 重新按head到tail的顺序编排

## Map

- TreeMap: 红黑树实现
- HashMap: 哈希表实现, 允许key, value为null
- HashTable: 线程安全的HashTable, 但已被抛弃
- LinkedHashMap: 双向链表维护元素顺序, 顺序为插入顺序或最少使用顺序
- WeakHashMap: 元素可能被GC自动删除, 适用于缓存场景

### HashMap

- HashSet内的实现为使用HashMap
- HashMap元素需实现`hashCode()`和`equals()`
- 哈希表大小为2的幂方, 当元素数大于阈值(容量 * 加载因子)时扩容, java8扩容时优化扩容过程, 基于扩容时哈希结果只有最高位不同
- java7用冲突链表, java8当冲突链表长度到达8时转为红黑树

### TreeMap

- 红黑树
- 每个节点为红色或黑色, 根节点为黑色
- 红色节点不能连续
- 每个节点到所有叶子节点路径有相同黑色节点数量
