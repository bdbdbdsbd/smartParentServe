const {sql} = require('./sql/sql.js')
module.exports  = (app)=>{
    const router = require('koa-router')()
    const router2 = require('koa-router')()    

    const sqlSelectDianzan = 'select content_id,user_id from dianzan where content_id=? and user_id=?'
    const sqlInsertDianzan = 'INSERT INTO dianzan SET ?'
    const sqlDeleteDianzan = 'DELETE FROM dianzan where content_id=? and user_id=?'
    
    router.post('/likeIt',async ctx=>{
        const data = await sql(sqlSelectDianzan,[ctx.request.body.content_id,ctx.request.body.user_id])
        switch(data.status){
            case "fail":
                ctx.body = {status:1,msg:"获取失败",data:data.data}
                break
            case "success":
                ctx.body = {status:1,msg:"已经点赞过了"}
                break
            case "blank":
                const data1 = await sql(sqlInsertDianzan,{content_id:ctx.request.body.content_id,user_id:ctx.request.body.user_id})     
                switch(data1.status){
                    case "fail":
                        ctx.body = {status:1,msg:"点赞失败",data:data1.data}
                        break
                    case "success":
                        ctx.body = {status:0,msg:"点赞成功"}
                        break
                    case "blank":
                        ctx.body = {status:1,msg:"点赞失败"}
                        break
                }
                break
        }
    })
    
    router.post('/dislikeIt',async ctx=>{
        const data = await sql(sqlDeleteDianzan,[ctx.request.body.content_id,ctx.request.body.user_id])
        switch(data.status){
            case "fail":
                ctx.body = {status:1,msg:"删除失败",data:data.data}
                break
            case "success":
                ctx.body = {status:0,msg:"删除成功"}
                break
            case "blank":
                ctx.body = {status:1,msg:"删除失败"}
                break
        }
    })
    
    router2.use('/like',router.routes())
    app.use(router2.routes())
}
