const express = require('express')
const app = express()

app.get('/', (req,res)=>{
    res.send('hello express')
})

app.post('/api/post', (req,res)=> {
    res.json([
        {id: 1, content: 'hello'},
        {id: 1, content: 'hello2'},
        {id: 1, content: 'hello3'}
    ])
})

app.listen(3065, () => {
    console.log("서버열림")
})