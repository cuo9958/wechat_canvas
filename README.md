# 小程序上专用画板引擎

通过快速创建对象的方式实现画板内容，不需要关注底层的渲染逻辑，不需要关注兼容方法。

引擎在 2.7.1 以下使用旧的 api，2.7.1 以上使用新的 api。两种 api 的最终呈现效果是一致的。

## 使用方式

1. 初始化画板容器
2. 新建盒子、文字、圆形容器，设置参数并加入到画板容器中
3. 调用画板的 start 方法，进行一次统一渲染

详情可参考 demo
