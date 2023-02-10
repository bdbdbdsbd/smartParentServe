const {sql} = require('./sql/sql.js')
module.exports  = (app)=>{
    const router = require('koa-router')()
    const router2 = require('koa-router')()
    const mysql = require('mysql')
    const db = mysql.createPool({
        host:'127.0.0.1',
        user:'root',
        password:'meiziziya123A',
        database:'xinli',
    })

    const sqlSelectFriend = 'SELECT  * FROM friend ORDER BY time DESC limit ?,?;'
    const sqlInsertFriend = 'INSERT INTO friend SET ?'
    const sqlDeleteFriend = 'DELETE FROM friend where id=?'
    const sqlSelectUserMessage = 'SELECT user_name,avatar,user_id FROM user where FIND_IN_SET(user_id,?);'
    const sqlSelectDianzan = 'SELECT content_id,user_id FROM dianzan where FIND_IN_SET(content_id,?)'

    router.post('/get',async ctx=>{
        const data = await sql(sqlSelectFriend,[ctx.request.body.index,ctx.request.body.limit])
        let userMessage
        let user_id
        let content_array // 朋友圈id的集合
        let dianzan_array // 朋友圈id和点赞人id的对应情况  数组
        switch(data.status){
            // 失败
            case "fail":
                ctx.body = {status:1,msg:"获取失败",data:data.data}
                return 
            case "success":
                user_id = data.data.reduce((pre,cur)=>{
                    // return [...pre,cur.user_id]
                    pre.push(cur.user_id)
                    return pre
                },[])
                content_array = data.data.reduce((pre,cur)=>{
                    // return [...pre,cur.id]
                    pre.push(cur.id)
                    return pre
                },[])
                userMessage = data.data
                break
            case "blank":
                ctx.body = {status:1,msg:"朋友圈为空"}
                return
        }


        const data2 = await sql(sqlSelectDianzan,content_array.toString())
        switch(data2.status){
            case "fail":
                ctx.body = {status:1,msg:"获取失败",data:data2.data}
                return
            case "blank":
                dianzan_array = []
                break
            case "success":
                data2.data.forEach((item)=>{
                    user_id.push(item.user_id)
                })
                dianzan_array = data2.data
                break
        }
        
        const data1 = await sql(sqlSelectUserMessage,user_id.toString())
        switch(data1.status){
            case "fail":
                ctx.body = {status:1,msg:"获取失败",data:data1.data}
                return
            case "success":
                // id 头像对应关系
                const idMessage = data1.data.reduce((pre,cur)=>{
                    if(cur.user_id in pre){
                        return pre
                    }else{
                        let {user_name,avatar} = {...cur}
                        pre[""+cur.user_id] = {user_name,avatar}
                        return pre
                    }
                },{})
   

                dianzan_array.forEach(element=>{
                    element["user_name"] = idMessage[element["user_id"]]["user_name"] 
                })
                // add user_name
                const dianzanMessage = dianzan_array.reduce((pre,cur)=>{
                    if(!!pre[""+cur.content_id]){
                        pre[""+cur.content_id] = pre[""+cur.content_id]+','+cur.user_name
                    }else{
                        pre[""+cur.content_id] = cur.user_name
                    }
                    return pre
                },{})   
                // add user_name avatar信息
                userMessage.forEach(element => {
                    element["user_name"] = idMessage[element["user_id"]]["user_name"] 
                    element["avatar"] = idMessage[element["user_id"]]["avatar"]
                    if(!!dianzanMessage[element["id"]]){
                        element["dianzan"] = dianzanMessage[element["id"]]
                    } 
                });

                ctx.body = {status:1,msg:"获取成功",data:userMessage}
                break
            case "blank":
                ctx.body = {status:1,msg:"获取失败"}
                return
        }
    })

    router.post('/delete',async ctx=>{
        return new Promise((res)=>{
            db.query(sqlDeleteFriend,ctx.request.body.id,(err,results)=>{
                if (err){
                    ctx.body = {status:1,msg:"删除失败",data:err}
                    res()
                }
                if(results.length==0){
                    ctx.body = {status:1,msg:"删除失败"}
                    res()              
                }else{
                    ctx.body = {status:0,msg:"删除成功"}
                    res()      
                }
            })
        })
    })

    router.post('/set',async ctx=>{
        return new Promise((res)=>{
            const date = new Date(ctx.request.body.time);
            const Y = date.getFullYear() + '/';
            const M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '/';
            const D = date.getDate() + ' ';
            const h = date.getHours() + ':';
            const m = date.getMinutes() + ':';
            const s = date.getSeconds(); 
            const insertData = {
                content:ctx.request.body.content,
                time:Y+M+D+h+m+s,
                user_id:ctx.request.body.user_id
            }
            db.query(sqlInsertFriend,insertData,(err,results)=>{
                if (err){
                    ctx.body = {status:1,msg:"发布失败",data:err}
                    res()
                }
                if(results.length==0){
                    ctx.body = {status:1,msg:"发布失败"}
                    res()
                }else{
                    ctx.body = {status:0,msg:"发布成功"}
                    res()
                }
            })
        })
    })


    router2.use('/friend',router.routes())
    app.use(router2.routes())
}