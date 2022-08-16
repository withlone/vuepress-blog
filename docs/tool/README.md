# 工具

## git

### 常见问题

- 如何添加ssh?
  1. `ssh-keygen -t ed25519 -C "title"`, `ed25519`为生成算法, `title`最好为邮箱
  2. 提示`Enter file in ...`, 输入名字`name`区分不同ssh, 密码设置可以回车跳过
  3. 在`~/.ssh`文件夹下有对应的`name`秘钥和`name.pub`公钥

- 如何管理多个ssh?
  1. `ssh-add -l`查看是否有代理, 若为`Could not open a connection to your authentication agent.`, 则`exec ssh-agent bash`
  2. `ssh-add ~/.ssh/id_ed25519`添加代理, 参数为添加的文件路径
  3. 配置`~/.ssh/config`如下

``` txt
Host title # 用于区分的名字
  HostName codeup.aliyun.com # 仓库地址
  PreferredAuthentications publickey
```
