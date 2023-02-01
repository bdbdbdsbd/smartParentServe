const mysql = require('mysql')
const db = mysql.createPool({
    host:'127.0.0.1',
    user:'root',
    password:'meiziziya123A',
    database:'xinli',
})
module.exports= {
    sql: (sqlLine,parameter)=>{
        return new Promise((resolve,reject)=>{
            db.query(sqlLine,parameter,(err,results)=>{
                if(err){
                    resolve({
                        status:"fail",
                        data:err
                    })
                }
                if(results.length!=0){
                    resolve({
                        status:"success",
                        data:results
                    })
                }else{
                    resolve({
                        status:"blank"
                    })
                }
            })
        }) 
    }
}