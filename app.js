const express = require('express');
const path = require("path");
const app = express();
const port = 8080

// 使用路由处理 设置允许跨域访问该服务
app.use(function (req, res, next) {
    //设置允许的域名 *代表 所有
    res.header("Access-Control-Allow-Origin", "*");
    // 跨域允许的请求方式
    res.header("Access-Control-Allow-Methods", "PUT,GET,POST,DELETE,OPTIONS");
    // 允许的header类型 可以定制 ，也可以全部放开 写成 *
    res.header("Access-Control-Allow-Headers", "*");
    // 让 options的尝试请求快速结束
    if (res.method == "OPTIONS") res.sendStatus(200)
    else next();
});

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

//使用 multer 文件上传功能
const multer = require('multer')
const {db} = require("./db/DbUtils");
const upload = multer({
    dest: __dirname + '/public/upload/temp',
})
// 允许所有的接口可以使用上传功能
app.use(upload.any())

// 配置中间件
const ADMIN_TOKEN_PATH = "/_token"
app.all('*', async (req, res, next) => {
    if (req.path.indexOf(ADMIN_TOKEN_PATH) > -1) {
        let {token} = req.headers;
        let admin_token_sql = "select * from `admin` where `token` = ? ";
        let admin_result = await db.async.all(admin_token_sql, [token]);
        if (admin_result.err != null || admin_result.rows.length === 0) {
            res.send({
                code: 403,
                msg: "请先登录！"
            })
        } else next();
    } else next();
})

// 注册路由
app.use('/testRouters', require('./routers/TestRouter'))
app.use('/AdminRouter', require('./routers/AdminRouter'))
app.use('/categoryRouters', require('./routers/CategoryRouter'))
app.use('/blogRouters', require('./routers/BlogRouter'))
app.use('/UploadRouters', require('./routers/UploadRouter'))


// 首页路由
app.get('/', (req, res) => {
    res.send("Welcome !")
})

// 监听接口
app.listen(port, () => {
    console.log(`服务器启动成功,listening on port: ${port} `)
})