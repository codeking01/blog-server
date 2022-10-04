const express = require('express');
const routers = express.Router();
const {db, genid} = require("../db/DbUtils")
// 引入uuid
const {v4: uuidv4} = require("uuid"); // mode uuid 教程

// 登录
routers.post('/login', async (req, res) => {
    let {account, password} = req.body;
    let {err,rows} = await db.async.all("select * from `admin` where `account`=? and `password`=?", [account, password]);
    if (err == null && rows.length > 0) {
        // 生成uuid
        let login_token = uuidv4();
        let update_token_sql = "update `admin` set `token`=? where `id`=?"
        await db.async.run(update_token_sql, [login_token, rows[0].id])
        let admin_info = rows[0]
        admin_info.token = login_token;
        admin_info.password = ""
        res.send({
            code: 200,
            msg: "登陆成功！",
            data: admin_info
        })
    } else {
        res.send({
            code: 500,
            msg: err
        })
    }
})

// 注册
routers.post('/register', async (req, res) => {
    let {account, password} = req.body;
    let id =genid.NextId()
    let {err} = await db.async.run("insert into `admin` (`id`,`account`,`password`) values (?,?,?)", [id,account, password]);
    if (err == null ) {
        res.send({
            code: 200,
            msg: "注册成功！",
        })
    } else {
        res.send({
            code: 500,
            msg: err
        })
    }
})
module.exports = routers