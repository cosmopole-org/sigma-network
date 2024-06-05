
const express = require('express')
const app = express()
const port = 3000

app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.post('/api/hello', (req, res) => {
  res.send('Hello ' + req.body.name)
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
