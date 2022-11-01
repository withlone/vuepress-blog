---
sidebar: auto
---

# 工具

[[TOC]]

## docker

### 位置

- docker在Windows上运行时需要`WSL`(Windows Susbsytem for Linux), 对应文件管理器左侧`Linux`
- 使用`wsl -l -v`查看使用的哪一个文件夹(一般为`docker-desktop-data`)
- docker一般在`docker-desktop-data/data/docker`中, 该路径下`containers`为容器信息, `volumes`为持久卷, 可以使用`docker inspect`查看容器与持久卷的对应关系
- 在`docker-desktop-data/data/docker/overlay2`中存储了每个容器对应生成的linux系统, 对应关系在`docker inspect`中的`GraphDriver.Data.WorkDir`

### 基本命令

**镜像**:

- `docker images`查看本机镜像
- `docker pull IMAGE[:TAG]`拉取镜像`IMAGE`, 可选版本`TAG`
- `docker rmi IMAGE`删除镜像`IMAGE`

**容器**:

- `docker ps -a`: 查看本机所有容器
- `docker start/stop/restart CONTAINER`: 启动/停止/重启容器`CONTAINER`(名称或ID)
- `docker rm CONTAINER`: 删除容器
- `docker exec -it CONTAINER COMMAND`: 打开容器`CONTAINER`的终端, `-i`交互式, `-t`分配一个终端, `COMMAND`指定第一个命令, 一般为`bash`
- `docker inspect CONTAINER`: 检视容器`CONTAINER`
- `docker port CONTAINER`: 查看容器`CONTAINER`端口转换信息

**构建**:

- `docker build [-t NAME[:TAG]] [-f dockerfile_path] path`: 构建容器, `-t`指定名称, `-f`指定`Dockerfile`路径, `path`上下文路径

### 常用容器

**mysql**:

- `docker pull mysql`
- `docker run -itd --name CONTAINER -p PORT1:3306 -e MYSQL_ROOT_PASSWORD=PASSWORD mysql`: 本机`PORT1`端口映射容器3306端口(mysql默认端口号), `PASSWORD`mysql密码, 开启容器`CONTAINER`
- `docker exec -it CONTAINER mysql -u root -pPASSWORD`: 终端访问mysql, 密码`PASSWORD`
- `mysql -uroot -pPASSWORD`: 访问数据库, `root`用户, `PASSWORD`密码

**mongo**:

- `docker pull mongo`
- `docker run -itd -name CONTAINER -p PORT1:27017 mongo [--auth]`: 本机`PORT1`端口映射容器27017端口(mongo默认端口号), 开启容器`CONTAINER`, `--auth`开启密码访问
- `docker exec -it CONTAINER mongosh`: 访问数据库

**redis**:

- `docker pull redis`
- `docker run -itd --name CONTAINER -p PORT1:6379 redis [--requirecpass PASS]`: 本机`PORT1`端口映射容器6379端口(redis默认端口号), 开启容器`CONTAINER`, 密码访问`PASS`
- `docker exec -it CONTAINER redis-cli`: 访问数据库

### 常用Dockerfile

**go**:

``` Dockerfile
# 构建第一步 build基本文件
FROM golang:alpine AS build

ENV GIN_MODE=release
ENV PORT=9000

WORKDIR /usr/src/app

COPY go.mod go.sum ./
RUN go env -w GOPROXY=https://goproxy.cn,direct
RUN go mod download && go mod verify

# 拷贝使用的相关文件, 如配置文件
COPY . .
RUN go build -v -o app ./main.go

# 构建第二步 仅拷贝必要文件
# alpine为包含基本功能的最小单位
FROM alpine

COPY --from=build /usr/src/app /

EXPOSE $PORT

ENTRYPOINT ["/app"]
```

## Linux

### 创建新用户

``` sh
useradd <user> # 创建新用户
passwd <passwd> # 设置密码
# 拷贝基本环境
mkdir /home/<user>
cp /etc/skel/.b* /home/<user>
cp /etc/skel/.p* /home/<user>
chown -R <user> /home/<user>
chmod 770 /home/<user>
usermod -s /bin/bash <user>
```

### ssh

**客户端添加ssh**:

1. `ssh-keygen -t ed25519 -C "title"`, `ed25519`为生成算法, `title`最好为邮箱
2. 提示`Enter file in ...`, 输入名字`name`区分不同ssh, 密码设置可以回车跳过
3. 在`~/.ssh`文件夹下有对应的`name`秘钥和`name.pub`公钥

**客户端管理多个ssh**:

1. `ssh-add -l`查看是否有代理, 若为`Could not open a connection to your authentication agent.`, 则`exec ssh-agent bash`
2. `ssh-add ~/.ssh/id_ed25519`添加代理, 参数为添加的文件路径
3. 配置`~/.ssh/config`如下

``` Config
Host <name> # 用于区分的名字
  HostName <ip> # 仓库地址
  PreferredAuthentications publickey
  User <user> # 登录用户
  IdentityFile <file> # 使用的密钥对
```

**服务端添加ssh**:

1. `chmod 700 /home/<user>/.ssh`, `chmod 600 /home/<user>/.ssh/authorized_keys`
2. 在`/home/<user>/.ssh/authorized_keys`中添加客户端公钥

### 环境变量

1. 在`/etc/profile`中使用`export a=b`语法配置
2. 在`~/.bashrc`中加入`source /etc/profile`, 每次终端启动都会加载
