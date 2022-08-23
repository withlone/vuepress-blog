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

### ThreadLocal

在不同的线程中创建独立的成员变量

- 如果希望ThreadLocal把某个类与线程关联起来, 则需用`private static`修饰ThreadLocal
- 实现原理为利用ThreadLocalMap记录线程对应的变量值, ThreadLocalMap用数组模拟map, 且Entry使用弱引用
- 线程池操作ThreadLocal时, 由于线程池不会销毁线程, ThreadLocal对应的对象不会被释放, 导致内存泄漏, 在线程结束前调用`ThreadLocal::remove`可以解决问题

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

## 线程池

### 线程池作用

- 降低资源消耗, 线程的创建与销毁
- 提高响应速度, 无需创建线程
- 提高线程的可管理性

### Future接口

- `cancel(boolean)`: 取消异步任务执行, 返回此次取消是否成功. 若任务正在执行, 参数为true时立刻中断任务且返回true, 参数为false时不会中断任务且返回true
- `isCanceled()`: 判断任务是否取消
- `isDone()`: 判断任务是否完成, 正常结束或发生异常均为完成
- `get()`: 阻塞式获取任务结果
- `get(long, Timeunit)`: `get()`限时版

### FutureTask

- 实现`Future`和`Runnable`
- 将任务分为7个状态, 其中最终态有`NORMAL, EXCEPTIONAL, CANCELLED, INTERRUPTED`

  0. `NEW`: 新任务
  1. `COMPLETING`: 执行完成但未保存结果或异常结果
  2. `NORMAL`: 执行完成且保存结果
  3. `EXCEPTIONAL`: 执行完成且保存异常结果
  4. `CANCELLED`: 被用户调用`cancel()`而取消
  5. `INTERRUPTING`: 正在中断任务
  6. `INTERRUPTED`: 任务已中断

### ThreadPoolExecutor

线程集合workerSet和阻塞队列workQueue, 用户向线程池提交任务时先放入workQueue, 然后workerSet从workQueue中获取任务然后执行, 若workQueue中没有任务, worker阻塞

**构造函数**:

``` java
public ThreadPoolExecutor(int corePoolSize,
                            int maximumPoolSize,
                            long keepAliveTime,
                            TimeUnit unit,
                            BlockingQueue<Runnable> workQueue,
                            ThreadFactory threadFactory,
                            RejectedExecutionHandler handler) {}
```

- `corePoolSize`: 线程池核心线程数, 允许最大并行数
- `maximumPoolSize`: 线程池允许的最多线程数, 只有当阻塞队列时有界队列时有效
- `workQueue`: 等待被执行任务的阻塞队列, 使用`BlockingQueue`子类
- `keepAliveTime`: 非核心线程的存活时间
- `unit`: `keepAliveTime`单位
- `threadFactory`: 可选, 创建线程的工厂, 默认DefaultThreadFactory
- `handler`: 线程池饱和策略, 阻塞队列满时如何处理新任务, 可使用已有策略, 或自定义策略
  - `AbortPolicy`: 默认, 抛出异常
  - `CallerRunsPolicy`: 使用调用者所在线程执行任务
  - `DiscardOldestPolicy`: 丢弃阻塞队列中最靠前任务
  - `DiscardPolicy`: 丢弃任务

**线程数说明**:

- `任务数<=corePoolSize`: 由核心线程处理任务
- `corePoolSize<任务数<=(corePoolSize+workQueue.size())`: 所有核心线程处理任务, 剩下任务放入阻塞队列
- `(corePoolSize+workQueue.size())<任务数<=(maximumPoolSize+workQueue.size())`: 先给满核心线程, 再给满阻塞队列, 剩下的由非核心线程直接执行
- `任务数>(maximumPoolSize+workQueue.size())`: 处理完`(maximumPoolSize+workQueue.size())`个线程, 剩下任务根据`handler`处理

#### Executors创建

- `newFixedThreadPool(int nThreads)`: 核心线程和最大线程设为nThreads, 阻塞队列为无界队列
- `newSingleThreadExecutor()`: `newFixedThreadPool(1)`
- `newCachedThreadPool()`: 无核心线程, 线程池大小INT_MAX, 有空闲线程则取任务执行, 否则新建, 执行完任务的线程有60秒存活时间, 使用`SynchronousQueue`为阻塞队列
- `newScheduledThreadPoolExecutor(int corePoolSize)`: 为任务提供延迟或周期执行, 用`ScheduledFutureTask`实现可延迟的异步计算任务, 用`DelayedWorkQueue`实现存放周期或延时任务的延迟优先队列

**不推荐原因**:

- `newFixedThreadPool`和`newSingleThreadExecutor`: 阻塞队列无上限可能导致OOM
- `newCachedThreadPool`和`newScheduledThreadPool`: 线程池线程数最大为INT_MAX, 可能导致OOM

#### 关闭线程池

- `shutdown`: 将线程池状态设为SHUTDOWN, 中断所有没有执行任务的线程
- `shutdownNow`: 将线程池状态设为STOP, 停止所有正在执行或暂停任务的线程
- `isShutDown`: 表示是否调用过关闭函数
- `isTerminated`: 表示所有任务是否都关闭

#### 源码分析

- `ctl: AtomicInteger`: 高3位存放线程池状态, 其余存放运行的worker数量
  - `RUNNING: 111`: 接受新任务, 处理阻塞队列任务
  - `SHUTDOWN: 000`: 不接受新任务, 处理阻塞队列任务
  - `STOP: 001`: 不接受新任务, 不处理阻塞队列任务, 中断正在运行任务
  - `TIDYING: 010`: 所有任务已终止
  - `TERMINATED: 011`: `terminated()`方法完成
- 任务执行: `execute`决定拒绝任务或接受任务, `addWorker`创建线程并执行任务, `getTask`从阻塞队列获取任务
- 任务提交: 使用`submit()`提交任务, 拿到返回的`Future`来获得线程结果

### ForkJoinPool

- 将大任务拆成多个小任务来异步执行的工具, 从java7开始
- 两大思想: 分治, 工作窃取(work-stealing, 工作线程优先处理自身队列任务, 然后随机窃取其他队列任务)
- 概要: `ForkJoinPool`通过池中的`ForkJoinWorkerThread`处理`ForkJoinTask<T>`任务(包括子类`RecursiveTask`, `RecursiveAction`和`CountedCompleter`)
  - `RecursiveTask`: 可递归执行的有返回值的`RecursiveTask`
  - `RecursiveAction`: 无返回值的`RecursiveTask`
  - `CountedCompleter`: 任务完成后或发生异常后触发自定义函数

**构造函数**:

``` java
public ForkJoinPool(int parallelism, // 并行度, 默认CPU数
                    ForkJoinWorkerThreadFactory factory, // 工作线程工厂
                    UncaughtExceptionHandler handler, // 异常处理类
                    boolean asyncMode){} // 是否异步, 默认false
```

- `invoke(ForkJoinTask)`: 等待任务计算完毕并返回结果
- `execute(ForkJoinTask)`: 提交异步任务, 无返回值
- `submit(ForkJoinTask)`: 异步执行, 之后通过`ForkJoinTask.get()`阻塞等待结果
- `ForkJoinTask.fork()`: 提交子任务, 分割任务
- `ForkJoinTask.join()`: 获取子任务结果, 合并任务
- `ForkJoinTask.invoke()`: 执行任务并等待结果

### CountDownLatch

- 内部有实现AQS的成员
- 用于协调多线程之间的同步, 起到线程间简单通信作用, 部分线程调用`countDown()`使得计数器减1, 部分线程调用`await()`等待计数器为0结束时结束阻塞
- `public CountDownLatch(int count)`: 构造给定计数初始化为count
- 2种典型用法
  1. 某一线程运行前需要等待n个线程完成, 初始化`CountDownLatch(int n)`, n个线程执行`countDown()`, 唯一线程执行`await()`
  2. 实行多线程开始执行任务的最大并行度, 初始化`CountDownLatch(1)`, 一个线程执行`countDown()`, 多个线程执行`await()`

### CyclicBarrier

- 内部有实现AQS的成员
- 让所有线程均完成后(执行到`CyclicBarrier.await()`), 所有线程才能够进行下一步操作
- `public CyclicBarrier(int parties, Runnable barrieraction)`: `parties`表示参与的线程数, `barrieraction`表示最后一个完成的线程要做的操作
- `await()`: 表示已经完成一部分, 需等待其他线程完成, 内部使用`doWait()`实现, 所有任务均完成后使用`nextGeneration()`重置屏障

### Semaphore

- 信号量
- `public Semaphore(int permits, boolean fair)`: `permits`初始许可数, `fair`是否公平
- `acquire()`: 阻塞式获取一个许可
- `tryAcquire()`: 尝试获取一个许可, 返回是否成功
- `release()`: 释放一个许可

### Phaser

- `CyclicBarrier`可以动态修改`party`且能控制是否阻塞版
- `register()`: 注册一个新的`party`
- `bulkRegister(int parties)`: 批量注册`party`
- `arrive()`: 到达且不等待其他任务到达, 返回`phase number`
- `arriveAndDeregister()`: 到达并取消注册, 返回`phase number`
- `arriveAndAwaitAdvance()`: 到达且等待其他任务到达, 返回`phase number`
- `awaitAdvance(int phase)`: 阻塞到当前`phaser`变为`phase`
- `state`: 低16位表示未到达`parties`数, 中16-31位表示等待的`parties`数, 中32-62位表示`phase number`当前代(每到达1次加1), 63位表示当前`phaser`的终止状态

### Exchanger

- 两个线程之间交换数据, 第一个到达的线程在slot中放入数据, 阻塞等待, 第二个线程到达后读取存入数据, 交换数据, 唤醒第一个线程
- `V exchange(V x)`: `x`为要交换的数据, 返回值为交换得到的数据
- 内部使用`arena`数组降低竞争