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