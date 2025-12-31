项目使用的技术栈：

- 前端：Astro + React + TailwindCSS
- 后端：NestJS + TypeORM + mysql
- 认证：JWT + Passport
- 支付：微信支付
  生成的代码格式化用 空格2个缩进
  写控制器的时候 不要用 @ApiOperation 用注释代替，会自动生成
  除了查询，其他的方法需要 加 @Log 装饰器, 会记录操作日志

    后端接口在编写DTO时候，如果是 数字类型的字段，需要 加 @Type(() => Number) 装饰器

- 注意数据自增Id 是 BigInt 类型，在JSON传输中被转成字符串了，需要处理处理一下
- 生成后端代码时候，尽量用中文注释。 关机步骤可以用 log库 打印一下日志
