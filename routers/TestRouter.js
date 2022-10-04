const express = require('express');
const routers = express.Router();

const {db, genid} = require("../db/DbUtils")

routers.get('/test', async (req, res) => {
    /*db.all("select * from `admin`", [], (err, rows) => {
        console.log(rows)
    })
    db.async.all("select * from `admin`", []).then((res) => {
            console.log(res)
        }
    )*/
    let out=await db.async.all("select * from `admin`", [])

    res.send({
        id: genid.NextId(),
        out: out // 后面这个out可以不写
    })
})


module.exports = routers