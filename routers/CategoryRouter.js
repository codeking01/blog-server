const express = require('express');
const category_routers = express.Router();
const {db, genid} = require("../db/DbUtils")

// 列表接口 增加 删除 修改

// 查找 列表接口
category_routers.get('/list', async (req, res) => {
    let {err, rows} = await db.async.all("select * from `category`", []);
    // console.log(rows)
    if (err == null) {
        res.send({
            code: 200,
            data: rows,
        })
    } else {
        res.send({
            code: 500,
            msg: err
        })
    }
})

// 增加
category_routers.post('/_token/add', async (req, res) => {
    let {name} = req.body;
    // console.log(name);
    let {err} = await db.async.run("insert into `category` (`id`,`name`) values (?,?) ", [genid.NextId(), name]);
    if (err == null) {
        res.send({
            code: 200,
            msg: "添加成功！",
        })
    } else {
        res.send({
            code: 500,
            msg: err
        })
    }
})

// 删除
category_routers.delete('/_token/delete', async (req, res) => {
    let {err} = await db.async.run("delete from `category` where `id`=?", [req.query.id]);
    if (err == null) {
        res.send({
            code: 200,
            msg: "删除成功！",
        })
    } else {
        res.send({
            code: 500,
            msg: err
        })
    }
})

// 修改
category_routers.put('/_token/update', async (req, res) => {
    let {name, id} = req.body;
    let {err} = await db.async.run("update `category` set `name`=? where `id`=?", [name, id]);
    if (err == null) {
        res.send({
            code: 200,
            msg: "修改成功！",
        })
    } else {
        res.send({
            code: 500,
            msg: err
        })
    }
})

module.exports = category_routers