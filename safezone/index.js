
const express = require('express')

const app = express()
app.use(express.static('files'))
app.listen(3001, () => {
    console.log('server started at port 3001')
})
