module.exports = (app)=>{
    const router = require('koa-router')()
    const router2 = require('koa-router')()
    const mysql = require('mysql')
    const request = require('request')
    const db = mysql.createPool({
        host:'127.0.0.1',
        user:'root',
        password:'meiziziya123A',
        database:'xinli',
    })

    const sqlSelectUser = 'select user_name,avatar from user where user_id=?'
    const sqlInsertUser = 'INSERT INTO user SET ?'

    router.post('/register',ctx=>{
        return new Promise((res)=>{
            request('https://api.weixin.qq.com/sns/jscode2session?appid=wxe6b60f6711fb5a28&secret=87b06d51ef1d179d71504ed9d2b68955&js_code='+ctx.request.body.code,(error, response, body)=>{
                body = JSON.parse(body)

                db.query(sqlSelectUser,body["openid"],(err, results)=>{
                    if(results.length==0){
                        const cryptoMessage = {
                            user_id:body["openid"],
                            user_name:ctx.request.body.user_name,
                            avatar:ctx.request.body.user_avator
                        }
                        db.query(sqlInsertUser,cryptoMessage,(err, results)=>{
                            if(results.length!=0){
                                ctx.body={'status':0,msg:'注册成功',data:body}
                                res()
                            }else{
                                ctx.body={'status':1,msg:'注册失败'}
                                res()
                            }
                        })
                    }else{
                        ctx.body={'status':1,msg:`用户已经存在，姓名 ${results[0].user_name}`,data:body}
                        res()
                    }
                })
            })
        })
    })

    router.post('/login',ctx=>{
        return new Promise((res)=>{
            if(ctx.request.body.code=="the code is a mock one"){
                ctx.body={'status':1,msg:`测试模式`}
                res()               
                return
            }
            request('https://api.weixin.qq.com/sns/jscode2session?appid=wxe6b60f6711fb5a28&secret=87b06d51ef1d179d71504ed9d2b68955&js_code='+ctx.request.body.code,(error, response, body)=>{
                body = JSON.parse(body)
                db.query(sqlSelectUser,body["openid"],(err, results)=>{
                    if(results.length==0){
                        ctx.body={'status':0,msg:`用户不存在`}
                        res()
                    }else{
                        // 如果有用户
                        // console.log({...results[0],...body})
                        ctx.body={'status':1,msg:`用户已经存在，姓名 ${results[0].user_name}`,data:{...results[0],...body}}
                        res()
                    }
                })
            })
        })
    })



    
    router2.use('/user',router.routes())
    app.use(router2.routes())
    // app.use((err,req,res,next)=>{
    //     if(err.name=='UnauthorizedError'){
    //         return res.send({
    //             status:401,
    //             message:'无效的token'
    //         })
    //     }
    //     next()
    // })
    


}