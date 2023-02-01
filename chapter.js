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

    const sqlSelectChapter = 'select * from chapter'
    const sqlSelectChapterByRef = 'select ref from chapter where ref=?'
    const sqlInsertUser = 'INSERT INTO chapter SET ?'
    const sqlDeleteContent = 'DELETE FROM chapter where id=?'


    router.post('/getAll',async ctx=>{
        return new Promise((res)=>{
            db.query(sqlSelectChapter,'',(err,results)=>{
                if(results.length!=0){
                    ctx.body = {status:0,msg:"获取成功",data:results};
                    res()
                }
                else{
                    ctx.body = {status:1,msg:"获取失败"};
                    res()                   
                }
            })
        })
    })


    router.post('/set',async ctx=>{
        return new Promise(res=>{
            db.query(sqlSelectChapterByRef,ctx.request.body.ref,(err,results)=>{
                if(results.length!=0){
                    ctx.body={status:1,msg:"链接已经存在"};
                    res()                    
                }else{
                    const contentMessage = {
                        ref:ctx.request.body.ref,
                        title:ctx.request.body.title,
                    }
                    db.query(sqlInsertUser,contentMessage,(err, results)=>{
                        if(results.length!=0){
                            ctx.body={status:0,msg:"添加成功"};
                            res()
                        }else{
                            ctx.body={status:1,msg:"数据库连接失败"};
                            res()
                        }
                    })          
                }
            })
        })
    })

    router.post('/delete',async ctx=>{
        return new Promise((res)=>{
            db.query(sqlDeleteContent,ctx.request.body.id,(err,results)=>{
                if(results.length!=0){
                    ctx.body = {status:0,msg:"删除成功"};
                    res()
                }
                else{
                    ctx.body = {status:1,msg:"删除失败"};
                    res()                   
                }
            })
        })
    })

    router2.use('/chapter',router.routes())
    app.use(router2.routes())
}