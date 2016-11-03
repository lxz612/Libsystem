# libsystem
`Node.js+Express+Mysql`搭建的图书馆流通管理系统

### 下载
1. 直接下载压缩包文件解压（推荐）.

2. 如果你安装了`git`，也可以使用`git clone`命令下载到本地.
 ```
 git clone https://github.com/lxz612/libsystem.git
 ```

### 环境配置
1. Node v6.2.0

2. Mysql v5.7.9 

推荐用`wamp`或`xampp`集成开发环境来安装`Mysql`.Mysql中数据表要求见项目中唯一的txt文件，

注意：因为我用到了数据库事务处理，所以Mysql的内核引擎务必设置为支持事务的innoDB.

### 运行

1. 通过npm安装本地服务第三方依赖模块(需要已安装Node.js)
 ```
 npm install
 ```

2. 启动Mysql服务

3. 启动node（http://localhost:3000）
 ```
 npm start
 ```

### 

匆忙之中写出来的项目，问题一定有很多，所以欢迎提交issue！
