# Ajax统一请求

## 封装axios实现ajax的请求

### 功能

- 封装了axios
- 自动提取了 Token 与 HeaderKey 注入在Post请求中
- 增加重试请求，降低错误率，间隔1000ms
- 请求超时提示
- 自定义登录超时回调
- 自定义请求错误回调

### 安装

```
npm install @Sing/axios
```

### 使用

```
import 'element-ui/lib/theme-chalk/index.css'
import ajax from '@Sing/axios'

Vue.use(ajax,{
    baseUrl:URL, // 默认URL
    retry:0, // 重试次数
    loginCode:301, // 登录状态码
    loginCall:(res)=>{ // 登录回调
        console.log(res)
    },
    errCall:(res)=>{ // 请求错误回调
        console.log(res)
    }
})
// 实例中使用 this.$ajax 来使用 axios
this.$ajax.post()
this.$ajax.get()
```

### 开发环境与测试环境

```
// 判断process.env.NODE_ENV设置baseUrl

var env = process.env.NODE_ENV
const URL = env === 'development'
    ? 'http://10.255.255.14:8003/'
    : env === 'production'
        ? 'http://adminapi.wx.shoujiazhihui.com/'
        : 'http://localadminapi.web.shoujiazhihui.com/';

```
