const express = require('express');
const blog_routers = express.Router();
const {db, genid} = require("../db/DbUtils")

// 查找单一文章的接口
blog_routers.get('/details', async (req, res) => {
    let id = req.query.id;
    let details_sql = "select `blog`.`id` as 'blog_id',* from `blog` JOIN `category` on  `category`.`id` == `blog`.`category_id` where `blog`.`id`=? "
    let {err, rows} = await db.async.all(details_sql, [id])
    if (err == null) {
        res.send({
            code: 200,
            data: {
                rows: rows
            }
        })
    } else {
        res.send({
            code: 500,
            msg: err
        })
    }
})

// 查找 列表接口
blog_routers.get('/list', async (req, res) => {
    // category_id,page,pagesize
    // 传入sql的参数汇总
    let {category_id, keyword, page, pagesize} = req.query;
    let params = [];
    category_id = category_id == null ? 0 : category_id;
    category_id=parseInt(category_id)
    keyword = keyword == null ? "" : keyword;
    page = page == null ? 1 : page;
    pagesize = pagesize == null ? 10 : pagesize;
    let whereSql = []
    // 查询种类（category_id）的sql
    if (category_id !== 0) {
        let category_id_sql = " category_id =? "
        whereSql.push(category_id_sql);
        params.push(category_id);
    }
    // 模糊查找的sql
    if (keyword !== "") {
        let content_sql = " (`title` like ? or `content` like ?) "
        whereSql.push(content_sql);
        params.push("%" + keyword + "%")
        params.push("%" + keyword + "%")
    }
    // 连接where的sql语句
    let whereSqlStr = ""
    if (whereSql.length > 0) {
        whereSqlStr = "where"+whereSql.join(" and ")
    }
    // 按照create_time 排序
    let order_sql = " order by `create_time` asc "
    // 分页sql
    let page_sql = " limit ?,? "
    let searchSqlParams = params.concat([(page - 1) * pagesize, pagesize])
    // 联立查询，从blog的表格中的category_id查询category的id，联立起来
    let join_sql = " JOIN `category` on `blog`.`category_id` == `category`.`id` "
    // 查找的sql
    let search_sql = " select `blog`.`id`, `category_id`,`title`, substr(`content`,0,50) AS `content` , `create_time` , `name`  from `blog` "+join_sql + whereSqlStr + order_sql + page_sql;
    // 查找总数的sql
    let searchCount_sql = " select count(*) as countNum from `blog` "+join_sql+ whereSqlStr;
    let searchCountParams = params

    let searchResult = await db.async.all(search_sql, searchSqlParams);
    let countResult = await db.async.all(searchCount_sql, searchCountParams);
    // console.log("searchResult",searchResult,"countResult",countResult);
    if (searchResult.err == null && countResult.err == null) {
        res.send({
            code: 200,
            data: {
                category_id,
                keyword,
                page,
                pagesize,
                rows: searchResult.rows,
                count: countResult.rows[0].countNum
            },
        })
    } else {
        res.send({
            code: 500,
            msg: searchResult.err == null ? countResult.err : searchResult.err
        })
    }
})
// 增加
blog_routers.post('/_token/add', async (req, res) => {
    let {category_id, title, content} = req.body;
    let id = genid.NextId();
    let create_time = new Date().getTime();
    let insert_sql = "insert into `blog` (`id`,`category_id`,`title`, `content`,`create_time`) values (?,?,?,?,?)"
    let {err} = await db.async.run(insert_sql, [id, category_id, title, content, create_time]);
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
blog_routers.delete('/_token/delete', async (req, res) => {
    let id = req.query.id
    let {err} = await db.async.run("delete from `blog` where `id`=?", [id]);
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
blog_routers.put('/_token/update', async (req, res) => {
    let {id, category_id, title, content} = req.body;
    let {err} = await db.async.run("update `blog` set `category_id`=? ,`title`= ? ,`content`= ?  where `id`=? ", [category_id, title, content, id]);
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


module.exports = blog_routers