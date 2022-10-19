---
sidebar: auto
---

# 安装指南

[[TOC]]

## Windows11

[下载地址](https://www.microsoft.com/zh-cn/software-download/windows11)

**安装步骤**:

1. 备份文件
2. 在[microsoft官网](https://www.microsoft.com/zh-cn/software-download/windows11)选择`创建Windows11安装`, 根据提示安装到U盘中
3. 启动电脑, 按下启动选择键F12(或ESC等), 选择`EFI USB DEVICE ...`U盘启动
4. 选择`自定义安装`, 删除所有分区, 从未分配分区中直接新建分区, 选中固态硬盘对应的主分区(一般为容量相对小的), 点击下一步
5. 在设置中找到`Windows 更新`, 进行更新
6. 使用激活工具激活, 清华激活工具需校园网连接

**配置**:

- `显示系统桌面图标`: `个性化` $\rightarrow$ `主题` $\rightarrow$ `桌面图标设置`
- `Windows11 右键调整`:
  1. `win+R`输入`cmd`
  2. 输入`reg add HKCU\Software\Classes\CLSID\{86ca1aa0-34aa-4e8b-a509-50c905bae2a2}\InprocServer32 /f /ve`
  3. 打开文件资源管理器, 在任务管理器中`重新启动`文件资源管理器
- `Windows11 右键恢复`: 将上述操作中的指令换为`reg delete HKCU\Software\Classes\CLSID\{86ca1aa0-34aa-4e8b-a509-50c905bae2a2}\InprocServer32 /va /f`
- `Windows 右键添加以管理员身份打开命令行`:
  1. `win+R`输入`regedit`
  2. 在`\HKEY_CLASSES_ROOT\Directory\Background\shell`新增项`runas`，设置默认值为`以管理员身份打开(&C)`
  3. 在`runas`下新增`DWORD32`，名称为`ShowBasedOnVelocityld`，值为十六进制`639bc8`
  4. 在`runas`下新增字符串名称`Icon`，值为`C:\Windows\system32\cmd.exe`
  5. 在`runas`下新增项`command`，设置默认值为`cmd.exe /s /k pushd "%V"`
  6. 如何希望能够按某个字母快速定位到此位置可以在`runas`的值后面加上`&C`使得按`C`快速定位

## 搜狗输入法

[下载地址](https://pinyin.sogou.com/)

**配置**:

- `英文输入`: `时间和语言` $\rightarrow$ `语言和区域` $\rightarrow$ `添加语言` $\rightarrow$ 安装英文
- `输入法切换`: `时间和语言` $\rightarrow$ `输入` $\rightarrow$ `高级键盘设置` $\rightarrow$ `语言栏选项` $\rightarrow$ `高级键设置` $\rightarrow$ `在输入语言之间` 设置按键 `ctrl+shift`

## VSCode

[下载地址](https://code.visualstudio.com/)

**插件**:

- `汉化`: `MS-CEINTL.vscode-language-pack-zh-hans`
- `Markdown`: `yzhang.markdown-all-in-one`, `yzane.markdown-pdf`(pdf导出), `DavidAnson.vscode-markdownlint`(代码检查)
- `Go`: `golang.go`
- `Docker`: `ms-azuretools.vscode-docker`
- `Java`: `vscjava.vscode-java-pack`
- `SSH`: `ms-vscode-remote.remote-ssh`
- `Git`: `eamodio.gitlens`
- `代码格式化`: `jbockle.jbockle-format-files`

**Markdown导出pdf支持数学公式**:

在`C:\Users\63005\.vscode\extensions\yzane.markdown-pdf-1.4.4\template`下`template.html`添加

```html
<script type="text/javascript" src="http://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML"></script>
<script type="text/x-mathjax-config"> MathJax.Hub.Config({ tex2jax: {inlineMath: [['$', '$']]}, messageStyle: "none" });</script>
```

**快捷键**:

`ctrl+shift+P`输入`open keyboard shortcuts(JSON)`

```JSON
// 将键绑定放在此文件中以覆盖默认值auto[]
[
    {
        "key": "ctrl+d",
        "command": "editor.action.deleteLines",
        "when": "textInputFocus && !editorReadonly"
    }
]
```

**User Settings**:

`ctrl+shift+P`输入`user settings(JSON)`

```JSON
{
  "workbench.colorTheme": "Quiet Light",
  "editor.tabSize": 2,
  "terminal.integrated.cursorStyle": "line",
  "git.path": "D:\\tool\\Git",
  "terminal.integrated.profiles.windows": {
    "Git-Bash": {
      "path": "D:\\tool\\Git\\bin\\bash.exe"
    }
  },
  "java.jdt.ls.java.home": "d:\\env\\Java\\jdk-17.0.4.1",
  "terminal.integrated.defaultProfile.windows": "Git-Bash"
}
```

## Seafile清华云盘

[下载地址](https://www.seafile.com/download/)

**配置**:

1. 本地仓库选择时注意, 会自动在选定文件夹下再建立一个`Seafile`文件夹
2. 选择`单点登录`, 输入`https://cloud.tsinghua.edu.cn`, 验证登录

## 通讯

- [微信](https://weixin.qq.com/)
- [飞书](https://www.feishu.cn/download)

## 开发

### Git

[下载地址](https://git-scm.com/downloads)

**配置**:

- `git config --global user.name "刘才煜"`
- `git config --global user.email "630057070@qq.com"`

**VSCode GitBash配置**:

VSCode中`ctrl+shift+P`, 输入`open user settings(json)`

``` json
"terminal.integrated.profiles.windows": {
  "Git-Bash": {
    "path": "D:\\tool\\Git\\bin\\bash.exe"
  }
},
"terminal.integrated.defaultProfile.windows": "Git-Bash"
```

### jdk11

[下载地址](https://www.oracle.com/cn/java/technologies/javase/jdk11-archive-downloads.html)

### Golang

[下载地址](https://golang.google.cn/dl/)

**配置**:

- `go env -w GOPROXY=https://goproxy.cn,direct`
- VSCode中`ctrl+shift+P`, 输入`Go:Install/Update Tools`, 安装所有

### Docker

[下载地址](https://www.docker.com/get-started/)

**配置**:

- 下载[wsl](https://wslstorestorage.blob.core.windows.net/wslblob/wsl_update_x64.msi), 为windows安装linux子系统, 用于运行docker

### NodeJS

[下载地址](http://nodejs.cn/download/)

**提示**:

- 若遇到`npm install失败`, 删除`package-lock.json, node_modules`后重新`npm install`

### python

[下载地址](https://www.python.org/downloads/windows/)

### VMware

[下载地址](https://customerconnect.vmware.com/cn/downloads/info/slug/desktop_end_user_computing/vmware_workstation_pro/15_0)

### Postman

[下载地址](https://www.postman.com/downloads/?utm_source=postman-home)

### ApiPost

[下载地址](https://www.apipost.cn/)

### Xshell

- [Xshell](https://www.xshell.com/zh/xshell/)
- [Xftp](https://www.xshell.com/zh/xftp/)

## 腾讯会议

[下载地址](https://meeting.tencent.com/download/)

## WinRAR

[下载地址](http://www.winrar.com.cn/)

## WPS

[下载地址](https://platform.wps.cn/)

## Navicat

本地破解资源

## 有道词典

[下载地址](http://cidian.youdao.com/multi.html#pcAll)
