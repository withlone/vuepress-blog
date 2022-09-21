# 网络

[[TOC]]

## HTTP 状态码

| 分类 | 分类描述 |
| - | - |
| 1** | 信息, 服务器收到请求, 请求者继续操作 |
| 2** | 成功 |
| 3** | 重定向 |
| 4** | 客户端错误, 请求有误 |
| 5** | 服务器错误, 服务器处理过程中发生异常 |

**常见状态码**:

| 状态码 | 英文名 | 中文描述 |
| - | - | - |
| 101 | Switching Protocals | 切换协议 |
| 200 | OK | 请求成功 |
| 300 | Multiple Choices | 请求的资源有多个URI可供选择 |
| 301 | Moved Permanently | 永久移动到新URI |
| 400 | Bad Request | 客户端请求语法错误 |
| 401 | Unauthoirzed | 要求客户端身份验证 |
| 403 | Forbidden | 拒绝客户端请求 |
| 404 | Not Found | 无法找到资源 |
| 500 | Internal Server Error | 服务器内部错误 |
| 502 | Bad Gateway | 网关错误 |

## HTTP 头部

**通用首部字段**:

| 首部字段名 | 说明 |
| - | - |
| Cache-Control | 控制缓存 |
| Connection | 控制不再转发代理, 管理持久连接 |
| Date | 创建报文的时间 |
| Pragma | 报文指令 |
| Trailer | 报文末端的首部一览 |
| Transfer-Encoding | 报文主体传输编码方式 |
| Upgrade | 升级为其他协议 |
| Via | 代理服务器信息 |
| Warning | 错误通知 |

**请求首部字段**:

| 首部字段名 | 说明 |
| - | - |
| Accept | 用户代理可处理的媒体类型 |
| Accept-Charset | 优先的字符集 |
| Accept-Encoding | 优先的内容编码 |
| Accept-Language | 优先的语言(自然语言) |
| Authorization Web | 认证信息 |
| Expect | 期待服务器的特定行为 |
| From | 用户的电子邮箱地址 |
| Host | 请求资源所在服务器 |
| If-Match | 比较实体标记(ETag) |
| If-Modified-Since | 比较资源的更新时间 |
| If-None-Match | 比较实体标记(与 If-Match 相反) |
| If-Range | 资源未更新时发送实体Byte的范围请求 |
| If-Unmodified-Since | 比较资源的更新时间(与 If-Modified-Since 相反) |
| Max-Forwards | 最大传输逐跳数 |
| Proxy-Authorization | 代理服务器要求客户端的认证信息 |
| Range | 实体的字节范围请求 |
| Referer | 对请求中URI的原始获取方 |
| TE | 传输编码的优先级 |
| User-Agent | HTTP客户端程序的信息 |

**响应首部字段**:

| 首部字段名 | 说明 |
| - | - |
| Accept-Ranges | 是否接受字节范围请求 |
| Age | 推算资源创建经过时间 |
| ETag | 资源的匹配信息 |
| Location | 令客户端重定向至指定URI |
| Proxy-Authenticate | 代理服务器对客户端的认证信息 |
| Retry-After | 对再次发起请求的时机要求 |
| Server | HTTP服务器的安装信息 |
| Vary | 代理服务器缓存的管理信息 |
| WWW-Authenticate | 服务器对客户端的认证信息 |

**实体首部字段**:

| 首部字段名 | 说明 |
| - | - |
| Allow | 资源可支持的HTTP方法 |
| Content-Encoding | 实体主体适用的编码方式 |
| Content-Language | 实体主体的自然语言 |
| Content-Length | 实体主体的大小 |
| Content-Location | 替代对应资源的URI |
| Content-MD5 | 实体主体的报文摘要 |
| Content-Range | 实体主体的位置范围 |
| Content-Type | 实体主体的媒体类型 |
| Expires | 实体主体过期的日期时间 |
| Last-Modified | 资源的最后修改日期时间 |
