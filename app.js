const express = require('express')
const postRouter = require('./routes/post')
const { sequelize } = require('./models')
const app = express()

sequelize.sync()
    .then(()=>{
        console.log("Successfully connect db!")
    })
    .catch(err=>console.error(err))
 
app.get('/', (req,res)=>{
    res.send('hello express')
})

// prefix 처럼 post가 자동으로 붙는다.
app.use('post', postRouter)


app.listen(3065, () => {
    console.log("서버열림")
})