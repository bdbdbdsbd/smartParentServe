module.exports = (app)=>{
    const router = require('koa-router')()
    const router2 = require('koa-router')()
    const mysql = require('mysql')
    const db = mysql.createPool({
        host:'127.0.0.1',
        user:'root',
        password:'meiziziya123A',
        database:'xinli',
    })
    const sqlSelectUser = 'select forminit from user where user_id=?'
    const sqlUpdateUser = 'update user SET forminit=? where user_id=?'

    router.post('/getform',ctx=>{
        return new Promise((res)=>{
            db.query(sqlSelectUser,ctx.request.body.user_id,(err, results)=>{
                if(results[0].forminit==null){
                    ctx.body = {
                        status:0,
                        msg:"尚未填写量表",
                        data:[
                            "你是否会感觉得到孤独",
                            "你是否会感觉得到寂寞"
                        ]
                    }
                    res()
                }else{
                    ctx.body = {
                        status:1,
                        msg:"已经填写量表",
                        data:{
                            problem:[
                                "你是否会感觉得到孤独",
                                "你是否会感觉得到寂寞"
                                ],
                            answer:Array.from(results[0].forminit.replace(',',''))
                        }
                    }
                    res()
                }
            })
        })
    })

    router.post('/setform',ctx=>{
        return new Promise((res)=>{
            db.query(sqlSelectUser,(err, results)=>{
                if(results==undefined){
                    db.query(sqlUpdateUser,[ctx.request.body.answerArray.toString(),ctx.request.body.user_id],(err, results)=>{
                        if(results.length!=0){
                            ctx.body = {
                                "status":0,
                                "msg":"存储成功",
                            }
                            res()
                        }
                        else{
                            ctx.body = {
                                "status":1,
                                "msg":"存储失败",
                            }
                            res()                            
                        }
                    })
                }else{
                    ctx.body = {
                        "status":1,
                        "msg":"存储失败",
                    }
                    res()       
                }
            })

        })
    })
    router2.use('/form',router.routes())
    app.use(router2.routes())
}