# java库

[[TOC]]

## 关键字

### synchronized

- 指定锁定对象: this, 某一对象, .class
- 修饰方法: 普通方法等价于this, 静态方法等价于.class
- 加锁原理: 用monitor计数器表示被执行线程重入次数, 当monitor为0表示未锁, 大于0表示被重入次数
- 缺点: 效率低, 不灵活, 无法得知是否成功获取锁

### volatile

- 作用: 防止重排(有序性), 共享变量修改可见(可见性)
- 可见性实现: 使用lock前缀的指令, 使得线程缓存数据会写回主存, 且写回后其他线程缓存的该地址数据失效(缓存一致性协议, 嗅探协议)
- 有序性实现: happens-before原则, 编译volatile变量的指令时, JMM提供内存屏障防止特定类型的重排方式

### final

- final修饰的方法不可被重写, private方法默认为final
- final修饰的变量运算时不会自动转换类型
- static final: 必须在声明时赋值
- blank final: 声明为final的参数可在构造器中赋值
- 重排规则: 禁止final域写重排到构造方法外, 禁止先读对象的final域再读对象的引用, 禁止先将final对象的引用赋值给引用变量再写入该对象

## 基本类

### Unsafe

- 作用: 访问管理底层资源

![java-thread-x-atomicinteger-unsafe](/java/java-thread-x-atomicinteger-unsafe.png)

### 原子类

- `AtomicInteger, AtomicBoolean, AtomicLong, ...`: 用volatile的变量以及Unsafe类的CAS修改数据
- `AtomicReference`: 原子更新引用类型, 即用于自定义类的原子操作, 但仅对类中volatile修饰的字段有用
- `AtomicStampedReference`: AtomicReference基础上使用Pair存储元素和版本号, 解决ABA问题
- `AtomicMarkableReference`: 维护boolean标记, 解决ABA问题
- `AtomicIntegerFieldUpdater`(Boolean, Stamped, Reference): 利用反射的方法, 指定类中的字段, 进行原子的更新操作, 该类可以对同类下不同的实例操作, 但非updater的只能对一个实例操作

### LockSuppport

用于创建锁和其他同步类的基本线程阻塞原语, 直接使用LockSupport的静态函数, 无法实例化LockSupport

#### 函数

- `(Unsafe) unsafe.park(boolean isAbsolute, long time)`: 阻塞线程, time = 0表示无穷长, isAbsolute表示是否为绝对时间(即时间戳还是时间长度)
- `(Unsafe) unsafe.unpark(Thread thread)`: 释放线程许可
- `LockSupport.park()`: 阻塞当前线程
- `LockSupport.park(Object blocker)`: 阻塞当前线程, 标识blocker为等待对象, 该函数的实现中有两次`setBlocker`, 其中第二次`setBlocker`因`unsafe.park()`而阻塞, 只有当线程再次运行时才会进行第二次`setBlocker`
- `LockSupport.parkNanos(Object blocker, long nanos)`: 阻塞当前线程至多nanos毫秒
- `LockSupport.parkUntil(Object blocker, long deadline)`: 阻塞当前线程至多到deadline时间
- `LockSupport.unpark(Thread thread)`: 给线程thread许可, 即解除thread阻塞, 若线程`unpark`, 后一次的`park`将直接跳过阻塞, 对指定线程执行`interrupt()`可以达到同样的效果

#### 比较

- `Thread.sleep(), LockSupport.park()`: 不会释放占有锁
- `Object.wait(), Condition.await()`: 均释放锁, 前者需要在synchronized块中使用, 后者底层调用LockSupport.park()实现阻塞

## 基本接口

### Condition

锁的条件加锁与释放

- `await()`: 等待对应条件唤醒, 释放持有的锁资源
- `awaitUninterruptibly()`: 即使线程被interrupted也要继续等待到条件唤醒
- `awaitNanos(long), await(long, TimeUnit), awaitUntil(Date)`: `await()`限时版
- `signal()`: 公平地唤醒一个等待线程, 将该线程加入AQS同步队列
- `signalAll()`: 唤醒所有等待线程, 将所有线程加入AQS同步队列

### Lock

JUC的锁接口

- `lock()`: 获取锁
- `lockInterruptibly()`: 获取锁, 但当线程interrupted时不再获取锁
- `tryLock()`: 锁一旦空闲就尝试获取, 即非公平锁
- `tryLock(long, TimeUnit)`: `tryLock()`限时版
- `unlock()`: 释放锁
- `newCondition()`: 获取一个绑定当前锁的Condition实例

## 源码细读

### 锁核心类AQS(AbstractQueuedSynchronizer)

用来构建锁和同步器的框架, 基于CLH队列锁(虚拟的双向队列, 仅存在节点关联关系)

``` java
// AbstractOwnableSynchronizer(AOS) 实现独占线程的保存和获取
abstract class AbstractQueuedSynchronizer extends AbstractOwnableSynchronizer {
  // Node为同步队列或条件队列的节点
  static final class Node {
    // 标记为共享模式节点
    static final Node SHARED = new Node();
    // 标记为独占模式节点
    static final Node EXCLUSIVE = null;
    
    // 节点状态
    volatile int waitStatus;
    /*
    CANCELLED,  1, 线程已取消
    SIGNAL,    -1, 线程释放锁后需唤醒后一线程
    CONDITION, -2, 线程在条件队列中
    PROPAGATE, -3, 线程后续的acquireShared可以执行
             ,  0, 默认状态
    非负状态表示节点不需要被signal, 负装填表示处于等待状态
    */

    // 前驱后继节点
    volatile Node prev, next;
    // 当前节点对应线程
    volatile Thread thread;
    // 条件队列中的下一节点
    Node nextWaiter;

    // 空构造函数表示节点为标记节点(SHARED)或头节点
    Node() {}
    // 其余非空构造函数除了构造相应参数, 还会将当前线程设置到thread
  }

  // 同步队列头尾节点
  private transient volatile Node head, tail;

  // 同步状态, 0表示未被锁, 大于0表示被线程重入次数
  private volatile int state;

  // 同步队列为空时添加节点需要先添加一个头节点(即头节点不包含线程)
  // CAS将node加入同步队列, 失败后继续尝试, 返回前驱节点
  private Node enq(Node node) {/*...*/}
  // 以给定模式新建节点以及当前线程加入同步队列, 返回新建节点
  private Node addWaiter(Node node) {/*...*/}
  // 将node状态修改为0(除非已取消), 并LockSupport.unpark后继中第一个状态非取消的节点
  private void unparkSuccessor(Node node) {/*...*/}

  // 待子类实现的方法
  // 独占方式尝试能否获取资源
  protected boolean tryAcquire(int arg) {}
  // 独占方式尝试能否释放资源
  protected boolean tryRelease(int arg) {}
  // 共享方式尝试能否获取资源, 返回值为剩余可用资源数
  protected int tryAcquireShared(int arg) {}
  // 共享方式尝试能否释放资源
  protected boolean tryReleaseShared(int arg) {}
  // 线程是否正在独占资源, 只有用到condition才需要实现
  protected boolean isHeldExclusively() {}

  // 先tryAcquire获取资源, 失败后使用以独占形式加入同步队列并尝试用acquireQueued获取资源
  public final void acquire(int arg) {/*...*/}

  // 先tryRelease尝试能否释放资源, 成功后若节点不是0状态则unparkSucessor(node)
  public final boolean release(int arg) {/*...*/} 

  // 尝试在同步队列中获取资源, 尝试失败后用shouldParkAfterFailedAcquire判断是否需要暂停线程
  // 若发生异常则cancelAcquire(node)取消对资源的获取请求并暂停线程
  final boolean acquireQueued(final Node node, int arg) {/*...*/}
  // 下面的函数与acquireQueued实现基本相同
  // 区别为允许中途线程暂停时停止获取资源
  private void doAcquireInterruptibly(int arg) {/*...*/}
  // 获取资源有时间限制
  private boolean doAcquireNanos(int arg, long nanosTimeout) {/*...*/}

  // 获取共享资源有类似的函数*Shared* 但是具体实现为节点状态修改为PROPAGATE, 以及做一些共享模式下的传播

  // 判断后去资源失败后是否需要暂停线程
  // 如果前驱节点为头节点, 说明至多有一个线程正在占有资源
  // 如果获取资源失败, 若前驱节点状态为SIGNAL, 则应当暂停线程待前驱节点唤醒
  // 若前驱结点状态为取消, 则找到最近非取消前驱更新为新前驱, 继续尝试获取资源
  // 若前驱结点状态为其他状态, 则更新前驱状态为SIGNAL, 因为添加了一个独占线程, 继续尝试获取资源
  private static boolean shouldParkAfterFailedAcquire(Node pred, Node node) {/*...*/}

  // 取消node获取资源的请求
  // 将node状态改为CANCELLED, 若node为队尾则直接更新队列
  // 否则如果node未被取消的最近前驱能修改为SIGNAL状态且不是头节点, 如果失败则说明可以让后续线程获取资源, unparkSucessor(node)
  private void cancelAcquire(Node node) {/*...*/}

  // 将条件队列中的节点退队(清除nextWaiter), 以默认状态添加到同步队列中, 返回是否操作成功
  // 如果同步队列原末尾节点为已取消或修改为SIGNAL状态失败, 则唤醒node的线程, 是对await的优化
  final boolean transferForSignal(Node node) {/*...*/}

  // 条件队列 仅对独占模式有效
  public class ConditionObject implements Condition {
    // 条件队列头尾节点
    private transient Node firstWaiter, lastWaiter;
    
    // 条件队列中添加新节点, 添加前若lastWaiter已取消则unlinkCancelledWaiters()
    private Node addConditionWaiter() {}

    // 将条件队列中所有已取消的节点删除, 节点的状态非CONDITION即为已取消
    private void unlinkCancelledWaiters() {}

    // 唤醒条件队列第一个节点
    private void doSignal(Node first) {}
    public final void signal() {}

    // 依次唤醒条件队列所有
    private void doSignalAll(Node first) {}
    public final void signalAll() {}

    // 加入条件队列, 暂存state值, 释放锁资源, 当节点不在同步队列时阻塞
    // 进入同步队列后acquireQueued尝试获取资源, 并且做线程中断的处理措施
    public final void await() {}
    // 不中断的await()
    public final void awaitUninterruptibly() {}
    // await()限时版
    public final long awaitNanos(long nanosTimeout) {}
    public final boolean awaitUntil(Date deadline) {}
    public final boolean await(long time, TimeUnit unit) {}
  }
}
```

### ReentrantLock

可重入锁, 可选择公平锁或非公平锁的构造

``` java
public class ReentrantLock implements Lock {
  // 实现锁的具体机制
  private final Sync sync;

  abstract static class Sync extends AbstractQueuedSynchronizer {
    // 非公平尝试获取资源
    // 当前线程直接尝试获取资源, 如果失败再排入同步队列
    final boolean nonfairTryAcquire(int acquires) {}
    // 获取当前资源的独占线程
    final Thread getOwner() {}
    // 返回状态state大小
    final int getHoldCount() {}
  }

  // 非公平锁, 用Sync中的nonfairTryAcquire实现tryAcquire
  static final class NonfairSync extends Sync {}
  // 公平锁, 新线程仅当同步队列为空时可以获取资源, 否则让队首线程先获取资源
  static final class FairSync extends Sync {}
}
```

### ReentrantReadWriteLock

``` java
// 接口ReadWriteLock要求实现返回读锁和写锁
public class ReentrantReadWriteLock implements ReadWriteLock {
  abstract static class Sync extends AbstractQueuedSynchronizer {
    // 高16位为读锁, 低16位为写锁
    // 占有读锁线程数
    static int sharedCount(int c) {}
    // 占有写锁线程数
    static int exclusiveCount(int c) {}

    // 记录每一个读线程的读锁占用数
    static final class HoldCounter {}
    // 每一个线程单独的记录
    static final class ThreadLocalHoldCounter extends ThreadLocal<HoldCounter> {}
    private transient ThreadLocalHoldCounter readHolds;
    // 缓存上一线程的readHolds
    private transient HoldCounter cachedHoldCounter;
    // 第一个读线程 以及占用读锁数
    private transient Thread firstReader;
    private transient int firstReaderHoldCount;

    // 释放写锁, 返回是否完全释放写锁资源
    protected final boolean tryRelease(int releases) {}
    // 获取写锁, 若当前为读锁或非当前线程占有写锁则失败, 若当前无锁但写锁需要阻塞则失败
    protected final boolean tryAcquire(int acquires) {}
    // 释放读锁, 根据情况修改相应的变量
    protected final boolean tryReleaseShared(int unused) {}
    // 获取读锁, 若是当前线程有写锁或仅有读锁, 允许获取
    // 若是读锁需要阻塞或修改读锁数失败, 则fullTryAcquireShared(Thread)重复尝试修改读锁数
    protected final int tryAcquireShared(int unused) {}

    // 尝试获取读锁或写锁, 无需考虑公平阻塞问题的tryAcquire和tryAcquireShared
    final boolean tryReadLock() {}
    final boolean tryWriteLock() {}
  }

  // 非公平锁, 写锁无需阻塞, 读锁当同步队列中第一个有效请求为独占模式
  static final class NonfairSync extends Sync {}
  // 公平锁, 同步队列的前驱中有有效请求则读锁写锁需要阻塞
  static final class FairSync extends Sync {}
  
}
```