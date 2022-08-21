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

### CopyOnWriteArrayList

- 并发安全, 适合读多写少
- 读操作直接读取数组
- 写操作加锁, 复制数组, 修改, 写回原数组
- 写操作之间互斥, 读操作发生在写操作释放锁之前均读取到旧数据
- 缺点: 实时读取不能保证数据正确, 数组较大时, 每次修改均复制数组

### Vector

- 并发安全, 效率低于CopyOnWriteArrayList
- 所有操作对整个对象加锁

## Queue

- LinkedList: 链表的双向队列
- PriorityQueue: 堆实现, 优先队列
- ArrayDeque: 数组的循环队列, 不允许null元素

### ArrayDeque

- 循环队列, 队列满时double容量
- double扩容时, 重新按head到tail的顺序编排

### ConcurrentLinkedQueue

- 无锁实现并发安全
- 采用HOPS(延迟更新)策略, tail的next不为null时才会重新定位tail, head的item为null时才会重新定位head
- 存在节点next指向自己, 为哨兵节点或出队节点

## BlockingQueue & BlockingDeque

- 接口
- 在Queue的基础上添加了阻塞操作`put(o)`和`take()`, 超时操作`offer(o, timeout, timeunit)`和`poll(timeout, timeunit)`
- 阻塞操作表示如果操作无法立即执行会阻塞线程(队列长度达到容量上线时会阻塞, 没有元素尝试获取时会阻塞)
- 超时操作表示阻塞操作的限时版
- BlockingDeque为基于Deque的类似版
- 具体实现有`Array*`和`Linked*`

### DelayQueue

- 实现BlockingQueue的线程安全的队列
- 元素为Delayed的继承类型, 队列根据过期时间做优先队列
- 取元素只能取出最先过期且已过期的元素

### SynchronousQueue

- 实现BlockingQueue且只能容纳一个元素

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

### Hashtable & ConcurrentHashMap

- 解决线程安全问题的HashMap
- Hashtable对所有操作加锁, 且锁是对整个对象加锁, 效率低, 并且快速失败
- jdk7的ConcurrentHashMap使用的是纯冲突链表, 使用固定的分段数加分段锁(ReentrantLock)分段同步, 哈希扩容对每个分段进行扩容, 且只对写操作加锁
- jdk8的ConcurrentHashMap使用了冲突链表加红黑树, 对同一个哈希值的数据结构使用synchronized加锁(源于jdk8对synchronized的优化), 支持多线程扩容, 只对写操作加锁