
loginmgr: 管理多个 login 服务的调度者，根据 login 负载通知客户端应该连接哪个login服务。即负载均衡。
    
    1，接收多个客户端连接，
    2，接收多个 login 连接，login 会上传自己的负载，
    3，loginmgr 根据各个 login 服务的负载，通知客户端连接哪个 login 服务，
    4，loginmgr 属于必需服务，

login：负责实现登录的服务。

    1，主动连接 loginmgr 调度者，上报负载，
    2，接收客户端连接，处理登录功能，
    
启动方式：

    启动 loginmgr：node wala/loginmgr/app.js
    启动 login: node wala/login/app.js

测试方式：

    启动测试：node wala/test_loginmgr/test.js
  
        > connect           // 连接 loginmgr
        > test client       // 告诉 loginmgr，本次连接是 client，并且会打印 login 服务列表
        > test get          // 向 loginmgr 获得可供连接的 login 服务
        > close             // 关闭连接

后续工作：

    1，login 实现配置，配置 loginmgr 的ip和端口，配置单个 login 的端口；
    2，login 实现接收 client 的连接，实现简单的 登录认证 服务。
    
