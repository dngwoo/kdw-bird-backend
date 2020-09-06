const express = require('express')
const app = express()
const postRouter = require('./routes/post')

app.get('/', (req,res)=>{
    res.send('hello express')
})

// prefix 처럼 post가 자동으로 붙는다.
app.use('post', postRouter)


app.listen(3065, () => {
    console.log("서버열림")
})