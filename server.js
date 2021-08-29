const path = require('path')
const compression = require('compression')
const express = require('express')

const app = express()

const PORT = process.env.PORT || 8080

app.use(compression())
app.use(express.static(path.join(__dirname, 'dist')))

app.get(['*'], (req, res) => {
  res.sendFile(path.join(__dirname, '/dist/index.html'))
})

app.listen(PORT, () => console.log(`App is listening on port ${PORT}`))
