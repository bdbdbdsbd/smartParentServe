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

    router.post('/get',async ctx=>{
        return new Promise((res)=>{
            db.query(sqlSelectFriend,[ctx.request.body.index,ctx.request.body.limit],(err,results)=>{
                if (err){
                    ctx.body = {status:1,msg:"获取失败",data:err}
                    res()
                }
                if(results.length==0){
                    ctx.body = {status:1,msg:"朋友圈为空"}
                    res()              
                }else{
                    const user_id = results.reduce((pre,cur)=>{
                        return [...pre,cur.user_id]
                    },[])
                    let userMessage = results
                    db.query(sqlSelectUserMessage,user_id.toString(),(err,results)=>{
                        if(err){
                            ctx.body = {status:1,msg:"获取失败",data:err}
                            res() 
                        }
                        if(results.length!=0){
                            const idMessage = results.reduce((pre,cur)=>{

                                if(cur.user_id in pre){
                                    return pre
                                }else{
                                    let {user_name,avatar} = {...cur}
                                    pre[""+cur.user_id] = {user_name,avatar}
                                    return pre
                                }
                            },{})

                            userMessage.forEach(element => {
                                element["user_name"] = idMessage[element["user_id"]]["user_name"] 
                                element["avatar"] = idMessage[element["user_id"]]["avatar"] 
                            });

                            ctx.body = {status:0,msg:"获取成功",data:userMessage}
                            res() 
                        }else{
                            ctx.body = {status:1,msg:"获取失败"}
                            res() 
                        }

                    })
     
                }
            })
        })
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