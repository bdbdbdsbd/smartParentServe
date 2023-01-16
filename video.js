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
    const sqlInsertUser = 'INSERT INTO content SET ?'
    const sqlSelectUser = 'select url from content where url=?'
    const sqlSelectContent = 'select * from content'
    const sqlDeleteContent = 'DELETE FROM content where id=?'
    const sqlSelectChapter = 'select * from chapter'
    router.post('/getAll',async ctx=>{
        return new Promise((res)=>{
            db.query(sqlSelectChapter,'',(err,results)=>{
                if(err){
                    ctx.body = {status:1,msg:err};
                    res()    
                }
                const chapterData = results
                db.query(sqlSelectContent,'',(err,results)=>{
                    if(results.length!=0){

                        ctx.body = {status:0,msg:"获取成功",data:{content:results,chapter:chapterData}};
                        res()
                    }
                    else{
                        ctx.body = {status:1,msg:"获取失败"};
                        res()                   
                    }
                })
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

    router.post('/set',async ctx=>{
        return new Promise(res=>{
            db.query(sqlSelectUser,ctx.request.body.url,(err,results)=>{
                if(results.length!=0){
                    ctx.body={status:1,msg:"链接已经存在"};
                    res()                    
                }else{
                    const contentMessage = {
                        name:ctx.request.body.name,
                        url:ctx.request.body.url,
                        chapter:ctx.request.body.chapter,
                    }
                    db.query(sqlInsertUser,contentMessage,(err, results)=>{
                        // console.log(err,results)
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

    
    router2.use('/video',router.routes())
    app.use(router2.routes())
}

