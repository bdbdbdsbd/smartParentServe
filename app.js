const koa = require('koa');
const app = new koa();
const cors = require('@koa/cors')
const bodyParser = require("koa-bodyparser");
const staticResource = require('koa-static');
const path = require('path')
const enforceHttps = require('koa-sslify').default;
const https=require("https");//https服务
const fs = require('fs')


app.use(cors())
app.use(bodyParser())
app.use(staticResource(path.join(__dirname,'html')))
app.use(enforceHttps());

require('./video.js')(app)
require('./login.js')(app)
require('./form.js')(app)
require('./chapter.js')(app)
require('./friend.js')(app)
require('./like.js')(app)

const options = {
    key: fs.readFileSync('./https/9101105_www.bdbdbdsbd.asia.key'),
    cert: fs.readFileSync('./https/9101105_www.bdbdbdsbd.asia.pem')
}


https.createServer(options, app.callback()).listen(443);