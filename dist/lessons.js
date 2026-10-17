'use strict';
const GROUPS = [
  {name:'数据结构',en:'DATA STRUCTURES',icon:'◇'},
  {name:'计算机组成原理',en:'COMPUTER ORGANIZATION',icon:'▦'},
  {name:'操作系统',en:'OPERATING SYSTEMS',icon:'◉'},
  {name:'计算机网络',en:'COMPUTER NETWORKS',icon:'⌁'}
];
const field = (key,label,value,extra={}) => ({key,label,value,...extra});
const LESSONS = [
 {id:'seq',group:0,title:'顺序表',en:'Sequential List',subtitle:'移动一个元素，理解连续存储下的插入与删除。',facts:['O(n)','O(1)','连续存储','线性表'],labels:['操作时间','辅助空间','存储方式','所属章节'],
 fields:[field('data','初始元素 · 逗号分隔','12, 28, 35, 47, 63',{wide:true}),field('op','操作','insert',{options:[['insert','插入'],['delete','删除']]}),field('pos','位置 · 从 1 开始','3',{type:'number'}),field('value','插入值','42',{type:'number'})],
 intro:'顺序表将元素存放在连续的内存空间里。按下标访问只需 O(1)，但插入或删除时，为了保持逻辑顺序，需要移动后续元素。',principles:['插入第 i 个位置：从后向前移动元素，再写入新值。','删除第 i 个位置：从前向后移动元素，最后长度减一。'],exams:['插入需移动 n−i+1 个元素；删除需移动 n−i 个。','插入位置合法范围为 1…n+1；删除为 1…n。'],note:'位置 i 从 1 开始，而数组下标从 0 开始；不要把两者混用。演示容量固定为 12。',think:'为什么插入时不能从前向后移动？',links:['stack','queue'],connection:'同一片连续空间，也能构成不同的抽象数据类型。',language:'C · 顺序表插入 / 删除',
 code:`#define CAP 12
typedef struct { int a[CAP], n; } List;
int insert(List *L, int i, int x) {
    if (i < 1 || i > L->n + 1 || L->n == CAP) return 0;
    for (int j = L->n; j >= i; --j)
        L->a[j] = L->a[j - 1];
    L->a[i - 1] = x;
    ++L->n;
    return 1;
}
int erase(List *L, int i) {
    if (i < 1 || i > L->n) return 0;
    for (int j = i; j < L->n; ++j)
        L->a[j - 1] = L->a[j];
    --L->n;
    return 1;
}`,quiz:{q:'含 8 个元素的顺序表，在第 3 个位置插入一个元素，需要移动多少个元素？',options:['5 个','6 个','7 个'],answer:1,why:'原第 3 到第 8 个元素都要后移，共 8−3+1 = 6 个。'}},
 {id:'stack',group:0,title:'栈的入栈与出栈',en:'Stack',subtitle:'从栈顶观察后进先出，理解 top 指针的每一次变化。',facts:['O(1)','O(n)','LIFO','栈与队列'],labels:['单次操作','存储空间','访问规则','所属章节'],
 fields:[field('data','入栈序列 · 最多 8 个','8, 16, 24, 32',{wide:true}),field('count','出栈个数','2',{type:'number'})],intro:'栈只允许在一端进行插入和删除，这一端称为栈顶。最后入栈的元素最先出栈，因此栈也被称为后进先出表。',principles:['空栈 top = −1；入栈先增加 top，再写入元素。','出栈先读取栈顶，再减小 top。'],exams:['出栈序列是否合法，取决于是否始终从栈顶取出。','函数调用、括号匹配、深度优先搜索都可以使用栈。'],note:'本实验先按输入序列全部入栈，再连续出栈；不包含入栈与出栈交错的所有情况。',think:'栈顶指针为 −1 时，如果仍然出栈会发生什么？',links:['seq','quick'],connection:'递归调用的现场也保存在栈中。',language:'C · 顺序栈',code:`#define CAP 8
typedef struct { int a[CAP], top; } Stack;
void init(Stack *s) { s->top = -1; }
int push(Stack *s, int x) {
    if (s->top == CAP - 1) return 0;
    s->a[++s->top] = x;
    return 1;
}
int pop(Stack *s, int *x) {
    if (s->top == -1) return 0;
    *x = s->a[s->top--];
    return 1;
}`,quiz:{q:'依次将 1、2、3 全部入栈，再全部出栈，输出是什么？',options:['1、2、3','3、2、1','2、3、1'],answer:1,why:'栈是后进先出，3 最后入栈，因此最先被取出。'}},
 {id:'queue',group:0,title:'循环队列',en:'Circular Queue',subtitle:'跟踪 front 与 rear，看指针如何绕回数组的起点。',facts:['O(1)','O(n)','FIFO','栈与队列'],labels:['单次操作','存储空间','访问规则','所属章节'],fields:[field('data','入队序列 · 4～8 个元素','10, 20, 30, 40, 50, 60',{wide:true})],intro:'循环队列使用取模运算让数组首尾相接。front 指向队头元素，rear 指向下一次插入的位置。本实验使用 5 个槽位并牺牲一个槽位区分队空与队满。',principles:['队空：front == rear；队满：(rear+1)%CAP == front。','当队满时，本实验先出队一次，再插入下一个元素。'],exams:['元素个数：(rear−front+CAP)%CAP。','这里数组大小为 5，但最多只能保存 4 个元素。'],note:'有些教材采用额外计数或标志位区分空满，不需要牺牲槽位；请先确认题目约定。',think:'rear 回到 0 是否就表示队列为空？',links:['seq','bfs'],connection:'队列既是存储结构，也是广度优先搜索的驱动力。',language:'C · 牺牲一个槽位的循环队列',code:`#define CAP 5
typedef struct { int a[CAP], front, rear; } Queue;
void init(Queue *q) { q->front = q->rear = 0; }
int enqueue(Queue *q, int x) {
    if ((q->rear + 1) % CAP == q->front) return 0;
    q->a[q->rear] = x;
    q->rear = (q->rear + 1) % CAP;
    return 1;
}
int dequeue(Queue *q, int *x) {
    if (q->front == q->rear) return 0;
    *x = q->a[q->front];
    q->front = (q->front + 1) % CAP;
    return 1;
}`,quiz:{q:'CAP = 5，front = 3，rear = 1，此时队列有几个元素？',options:['2 个','3 个','4 个'],answer:1,why:'(1−3+5)%5 = 3，队列中的有效下标为 3、4、0。'}},
 {id:'quick',group:0,title:'快速排序',en:'Quick Sort',subtitle:'选定基准，划分区间。在每一次交换中，看见分治的力量。',facts:['O(n log n)','O(log n)','不稳定','排序算法'],labels:['平均时间复杂度','平均递归空间','算法稳定性','所属章节'],fields:[field('data','待排序数组 · 2～12 个整数','38, 27, 43, 3, 9, 82, 10',{wide:true})],intro:'快速排序采用分治策略：选择一个基准元素，将较小的元素放到左侧，较大的元素放到右侧，再递归处理两个子区间。本实验使用 Lomuto 划分，以区间最后一个元素为基准。',principles:['扫描指针 j 从左向右移动，i 记录小于基准区域的末端。','当 A[j] < pivot，将 A[j] 与 A[++i] 交换；扫描结束后归位基准。'],exams:['平均时间 O(n log n)，最坏时间 O(n²)。','平均递归空间 O(log n)，最坏 O(n)；不稳定。'],note:'固定选择末尾基准时，有序或全部相等的数据会退化。教材也常使用双向扫描法，划分步骤不同，但分治思想相同。',think:'如果输入已经有序，每次划分会得到两个多大的子区间？',links:['stack','binary'],connection:'一个算法拆分区间，另一个算法缩小区间。',language:'C · Lomuto 划分（末元素为基准）',code:`void swap(int *a, int *b) {
    int t = *a; *a = *b; *b = t;
}
int partition(int a[], int lo, int hi) {
    int pivot = a[hi], i = lo - 1;
    for (int j = lo; j < hi; ++j) {
        if (a[j] < pivot) {
            ++i;
            swap(&a[i], &a[j]);
        }
    }
    swap(&a[i + 1], &a[hi]);
    return i + 1;
}
void quickSort(int a[], int lo, int hi) {
    if (lo >= hi) return;
    int p = partition(a, lo, hi);
    quickSort(a, lo, p - 1);
    quickSort(a, p + 1, hi);
}`,quiz:{q:'固定选末尾元素为基准时，哪种输入容易使快速排序退化到 O(n²)？',options:['已经升序的数组','随机且互不相同的数组','每次恰好等分的数组'],answer:0,why:'升序数组的末尾元素总是最大值，划分规模反复成为 n−1 和 0，递归深度达到 O(n)。'}},
 {id:'binary',group:0,title:'二分查找',en:'Binary Search',subtitle:'每次排除一半区间，让搜索范围逐步收敛。',facts:['O(log n)','O(1)','有序数组','查找算法'],labels:['最坏时间','辅助空间','必要前提','所属章节'],fields:[field('data','有序数组 · 将自动升序排列','5, 12, 18, 26, 37, 49, 63, 80',{wide:true}),field('target','目标值','37',{type:'number'})],intro:'二分查找要求顺序存储且按关键字有序。比较目标与中间元素，每次都能排除一半候选区间。演示使用左右端点均包含的闭区间 [lo, hi]。',principles:['mid = lo + (hi−lo)/2，比较 a[mid] 与目标。','较小时更新 lo = mid+1；较大时更新 hi = mid−1。'],exams:['循环条件为 lo <= hi，退出时区间为空。','存在重复值时，本实现返回其中一个匹配位置，不保证最左。'],note:'输入会先排序，再开始查找；这里展示的复杂度只计查找过程，不计预排序。',think:'为什么更新边界时要越过 mid，而不是仍然保留 mid？',links:['quick','seq'],connection:'先建立有序性，才能用更少的比较找到目标。',language:'C · 闭区间二分查找',code:`int binarySearch(const int a[], int n, int target) {
    int lo = 0, hi = n - 1;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        if (a[mid] == target) return mid;
        if (a[mid] < target)
            lo = mid + 1;
        else
            hi = mid - 1;
    }
    return -1;
}`,quiz:{q:'在闭区间二分中，a[mid] < target 时下一步如何更新？',options:['hi = mid−1','lo = mid','lo = mid+1'],answer:2,why:'mid 已经比较过且不匹配，应把它与更小的左半部分一起排除。'}},
 {id:'bfs',group:0,title:'广度优先搜索',en:'Breadth-First Search',subtitle:'用一个队列，逐层发现图中的每个顶点。',facts:['O(V + E)','O(V)','队列','图的遍历'],labels:['邻接表时间','辅助空间','辅助结构','所属章节'],fields:[field('start','起始顶点','A',{options:'ABCDEF'.split('').map(x=>[x,x])})],intro:'广度优先搜索从起点出发，先访问距离为 1 的顶点，再访问距离为 2 的顶点，逐层扩展。本实验使用固定无向图，同层邻接点按字母顺序处理。',principles:['顶点首次入队时立即标记，避免重复入队。','每次取出队头，再把未发现的邻接点加入队尾。'],exams:['无权图中，BFS 首次到达顶点的层数就是最短距离。','邻接表 O(V+E)，邻接矩阵 O(V²)。'],note:'从一个起点出发只能遍历其可达部分；遍历非连通图需要对未访问顶点再次调用 BFS。',think:'如果等到出队才标记，多个前驱会不会让同一顶点重复入队？',links:['queue','dijkstra'],connection:'从无权图的层序扩展，走向带权图的最短路径。',language:'C · 固定 6 顶点图的邻接表 BFS',code:`// adj[u][0..degree[u]-1] 为 u 的邻接点
void bfs(int start, int adj[6][6], int degree[6], int order[6]) {
    int visited[6] = {0}, q[6], front = 0, rear = 0, k = 0;
    visited[start] = 1;
    q[rear++] = start;
    while (front < rear) {
        int u = q[front++];
        order[k++] = u;
        for (int j = 0; j < degree[u]; ++j) {
            int v = adj[u][j];
            if (!visited[v]) {
                visited[v] = 1;
                q[rear++] = v;
            }
        }
    }
}`,quiz:{q:'BFS 为什么通常在入队时标记顶点？',options:['防止同一顶点重复入队','使队列变成栈','使图成为有向图'],answer:0,why:'不同顶点可能都邻接同一个尚未出队的顶点，入队即标记可以避免重复发现。'}},
 {id:'cache',group:1,title:'Cache 直接映射',en:'Direct-Mapped Cache',subtitle:'把块号映射到 Cache 行，观察命中与冲突替换。',facts:['块号 mod 4','4 行','直接映射','存储系统'],labels:['行号计算','Cache 容量','映射方式','所属章节'],fields:[field('data','主存块号访问序列 · 0～99','0, 1, 4, 0, 1, 5, 1, 2',{wide:true})],intro:'直接映射中，每个主存块只能放入特定的 Cache 行。对于本实验的 4 行 Cache，行号 = 块号 mod 4，标记 = ⌊块号 / 4⌋。有效位和标记都匹配才算命中。',principles:['根据块号取模找到唯一候选行，再比较有效位和标记。','不命中时从主存装入目标块，覆盖该行原来的内容。'],exams:['地址通常划分为标记、行号、块内偏移。','映射到同一行的不同块会产生冲突，即使其他行空闲。'],note:'输入是主存块号，不是字节地址；演示省略块内偏移、写策略和存取延迟。初始 Cache 全空。',think:'块 0 与块 4 交替访问时，即使其他行空闲，能否避免冲突？',links:['lru','pipeline'],connection:'不同层级的存储，都需要应对容量与速度的差异。',language:'流程伪代码 · 直接映射读访问',code:`初始化：valid[0..3] = false
对每个访问的主存块 b：
    line = b mod 4
    tag = floor(b / 4)
    if valid[line] and tags[line] == tag:
        hits = hits + 1
    else:
        misses = misses + 1
        data[line] = 主存块 b
        tags[line] = tag
        valid[line] = true`,quiz:{q:'4 行直接映射 Cache 中，哪个块与主存块 2 映射到同一行？',options:['块 5','块 6','块 7'],answer:1,why:'2 mod 4 = 2，6 mod 4 = 2，因此二者竞争同一行。'}},
 {id:'pipeline',group:1,title:'指令流水线',en:'Instruction Pipeline',subtitle:'把执行过程分成五级，观察指令如何重叠推进。',facts:['5 级','n + 4','1 条 / 周期','指令执行'],labels:['流水线深度','理想总周期','稳态吞吐率','所属章节'],fields:[field('count','指令条数 · 2～8','5',{type:'number'})],intro:'流水线把指令执行分为取指 IF、译码 ID、执行 EX、访存 MEM 和写回 WB。不同指令可以在同一周期占用不同阶段，从而提高吞吐率。',principles:['第一条指令需要 5 个周期完成；之后理想情况下每周期完成一条。','n 条指令总耗时为 n+4 个周期，串行执行为 5n 个周期。'],exams:['流水线提高吞吐率，不等于降低单条指令的延迟。','实际系统存在结构冒险、数据冒险、控制冒险。'],note:'这是无冒险、各级耗时相等且无额外开销的理想五级流水线；不模拟转发、停顿或分支预测。',think:'指令数量很少时，为什么加速比远小于 5？',links:['cache','rr'],connection:'观察硬件级重叠执行，再比较操作系统的时间片轮转。',language:'流程伪代码 · 理想五级流水线',code:`stages = [IF, ID, EX, MEM, WB]
for cycle = 1 to n + 4:
    for instruction = 1 to n:
        stage = cycle - instruction
        if 0 <= stage < 5:
            执行 instruction 的 stages[stage] 阶段
        if stage == 4:
            完成该指令`,quiz:{q:'理想五级流水线执行 8 条指令需要多少周期？',options:['8','12','40'],answer:1,why:'总周期 = 流水线级数 + 指令条数 − 1 = 5+8−1 = 12。'}},
 {id:'lru',group:2,title:'LRU 页面置换',en:'Least Recently Used',subtitle:'跟随访问序列，找出最久没有被使用的那一页。',facts:['3 个页框','LRU','缺页 / 命中','虚拟内存'],labels:['默认物理页框','置换策略','观察重点','所属章节'],fields:[field('data','页面访问序列 · 0～99','7, 0, 1, 2, 0, 3, 0, 4',{wide:true}),field('frames','页框个数','3',{options:[['2','2'],['3','3'],['4','4']]})],intro:'LRU（最近最久未使用）在发生缺页且没有空闲页框时，淘汰上次访问时间最早的页面。命中同样会更新最近使用时间。',principles:['页面已在内存：命中，更新使用时间。','页面不在内存：缺页，优先使用空页框，否则替换最久未使用页。'],exams:['LRU 依据过去使用情况；OPT 依据未来访问序列。','LRU 属于栈算法，不会产生 Belady 异常。'],note:'页框初始为空，首次装入也计一次缺页。本实验只演示置换，不模拟脏页写回、TLB 或地址转换。',think:'为什么命中一个页面也会改变下一次要被淘汰的页面？',links:['cache','rr'],connection:'先理解页的驻留，再理解进程的运行。',language:'流程伪代码 · 时间戳实现 LRU',code:`frames = 空页框数组
lastUsed = 空时间戳数组
for time, page in 引用序列:
    if page 已在 frames 中:
        hits++
        lastUsed[page 所在页框] = time
    else:
        faults++
        slot = 空页框（若存在）
        if 不存在空页框:
            slot = lastUsed 最小的页框
        frames[slot] = page
        lastUsed[slot] = time`,quiz:{q:'3 个空页框，访问 1、2、3、1、4，最后淘汰哪一页？',options:['页 1','页 2','页 3'],answer:1,why:'访问页 4 前，最近使用顺序为 2、3、1，所以页 2 最久未使用。'}},
 {id:'rr',group:2,title:'时间片轮转调度',en:'Round Robin',subtitle:'在就绪队列与 CPU 之间，追踪每个进程的运行时间。',facts:['抢占式','时间片','循环队列','进程调度'],labels:['调度性质','分配单位','组织形式','所属章节'],fields:[field('data','各进程服务时间 · 同时到达','5, 3, 6',{wide:true}),field('quantum','时间片 · 1～5','2',{type:'number'})],intro:'时间片轮转为每个就绪进程分配一个固定的运行时长。时间片到期且进程尚未完成，就把它放回就绪队列尾部，让后续进程获得 CPU。',principles:['实际运行时长 = min(时间片, 剩余服务时间)。','完成的进程退出队列；未完成的进程回到队尾。'],exams:['时间片过大时接近先来先服务；过小时切换开销较大。','周转时间 = 完成时间−到达时间；等待时间 = 周转时间−服务时间。'],note:'所有进程在 t=0 同时到达，按 P1、P2… 排队；忽略切换开销、I/O 阻塞和优先级。',think:'相同服务时间下，缩短时间片一定能降低平均周转时间吗？',links:['queue','pipeline'],connection:'一个队列把公平分配变成了可执行的调度规则。',language:'流程伪代码 · 所有进程在零时刻到达',code:`ready = [P1, P2, ...]
clock = 0
while ready 非空:
    p = ready.pop_front()
    run = min(quantum, remaining[p])
    clock += run
    remaining[p] -= run
    if remaining[p] > 0:
        ready.push_back(p)
    else:
        finish[p] = clock
        waiting[p] = finish[p] - burst[p]`,quiz:{q:'一个进程剩余时间为 1，时间片为 3，本轮运行多少时间？',options:['1','3','4'],answer:0,why:'运行到进程完成即可，不必占满整个时间片。'}},
 {id:'tcp',group:3,title:'TCP 三次握手',en:'TCP Handshake',subtitle:'沿报文的方向，理解序号、确认号与连接状态变化。',facts:['3 次','可靠传输','SYN 占 1 位','传输层'],labels:['握手报文数','协议目标','序号规则','所属章节'],fields:[field('x','客户端初始序号 x','100',{type:'number'}),field('y','服务端初始序号 y','300',{type:'number'})],intro:'TCP 使用三次握手同步双方初始序号并建立连接。客户端主动打开，服务端处于监听状态；双方通过 SYN、SYN+ACK、ACK 完成协商。',principles:['客户端发送 SYN，服务端确认 x+1 并发送自己的 SYN。','客户端确认 y+1，服务端收到确认后进入 ESTABLISHED。'],exams:['SYN 和 FIN 各消耗一个序号；不携带数据的纯 ACK 不消耗序号。','确认号表示期望接收的下一个字节的序号。'],note:'演示无丢包、无数据负载的基本握手，不模拟重传、同时打开或 TCP 选项协商。序号按模 2³² 回绕。',think:'第三次握手为什么不需要再消耗一个序号？',links:['dijkstra','queue'],connection:'建立端到端连接之前，分组还需要经过网络中的路由。',language:'流程伪代码 · 无负载三次握手',code:`客户端：CLOSED；服务端：LISTEN
客户端发送 SYN(seq=x)，进入 SYN-SENT
服务端收到 SYN：
    发送 SYN+ACK(seq=y, ack=x+1)
    进入 SYN-RECEIVED
客户端收到 SYN+ACK：
    发送 ACK(seq=x+1, ack=y+1)
    进入 ESTABLISHED
服务端收到 ACK：
    进入 ESTABLISHED`,quiz:{q:'客户端发送 SYN，seq=100；服务端应确认哪个序号？',options:['100','101','102'],answer:1,why:'SYN 消耗一个序号，所以服务端期望的下一个序号为 101。'}},
 {id:'dijkstra',group:3,title:'Dijkstra 最短路径',en:'Shortest Path',subtitle:'从源点逐步确定最短距离，看懂链路状态路由的核心思想。',facts:['O(V²)','非负边权','贪心策略','网络层 / 图'],labels:['朴素实现时间','使用前提','算法思想','所属章节'],fields:[field('start','源点','A',{options:'ABCDEF'.split('').map(x=>[x,x])})],intro:'Dijkstra 算法每次确定一个距离源点最近的未确定顶点，并通过它尝试改善其他顶点的距离。这种“松弛”操作逐步构建最短路径树。图算法本身属于数据结构，也是链路状态路由的基础。',principles:['源点距离为 0，其他顶点为 ∞；选择未确定顶点中的最小距离。','若 dist[u]+w(u,v) < dist[v]，更新 dist[v] 和前驱。'],exams:['边权必须非负，负权可能破坏已确定距离的正确性。','这里采用邻接矩阵的 O(V²) 实现。'],note:'固定无向带权图；绿色边表示当前的前驱关系，算法完成时构成从源点出发的最短路径树。',think:'为什么选中的最小距离在非负权图中不会再被改善？',links:['bfs','tcp'],connection:'比较无权最短路与带权最短路，再看连接如何使用路由。',language:'C · 邻接矩阵 Dijkstra',code:`#define N 6
#define INF 1000000
void dijkstra(int w[N][N], int s, int dist[N], int prev[N]) {
    int used[N] = {0};
    for (int i = 0; i < N; ++i) { dist[i] = INF; prev[i] = -1; }
    dist[s] = 0;
    for (int k = 0; k < N; ++k) {
        int u = -1;
        for (int v = 0; v < N; ++v)
            if (!used[v] && (u == -1 || dist[v] < dist[u])) u = v;
        if (u == -1 || dist[u] == INF) break;
        used[u] = 1;
        for (int v = 0; v < N; ++v)
            if (!used[v] && w[u][v] < INF && dist[u] + w[u][v] < dist[v]) {
                dist[v] = dist[u] + w[u][v];
                prev[v] = u;
            }
    }
}`,quiz:{q:'Dijkstra 算法允许以下哪种边权？',options:['任意负权','非负权','必须全部为 1'],answer:1,why:'非负权保证已确定的最小距离不会经由尚未处理的顶点变得更小。'}}
];
if(typeof module!=='undefined')module.exports={LESSONS,GROUPS};
