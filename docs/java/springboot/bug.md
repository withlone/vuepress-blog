---
sidebar: auto
---

# BUG

[[TOC]]

## Maven

- 使用默认的仓库配置下载速度慢, 能正常下载
- 使用阿里云的仓库配置无法正常下载版本较大的包

## Validator

在`pom.xml`中引入以下依赖并结合`@Valid`使用

``` xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-validation</artifactId>
</dependency>
```

且不能同时引入以下依赖, 否则会导致验证失效

``` xml
<dependency>
  <groupId>org.hibernate</groupId>
  <artifactId>hibernate-validator</artifactId>
</dependency>
```

## Log4j2

**使用**:

要导入`log4j2`需要导入

```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-log4j2</artifactId>
</dependency>
```

并在两个依赖中排除相关包

``` xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter</artifactId>
  <exclusions>
    <!-- exclusive loggger -->
    <exclusion>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-logging</artifactId>
    </exclusion>
  </exclusions>
</dependency>

<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-web</artifactId>
  <exclusions>
    <!-- exclusive loggger -->
    <exclusion>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-logging</artifactId>
    </exclusion>
  </exclusions>
</dependency>
```

**颜色**:

在`<Patternlayout>`中使用`%highlight`格式化颜色时, 对于`windows`环境需要加上额外属性`disableAnsi="false"`
