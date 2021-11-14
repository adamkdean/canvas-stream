// Copyright 2021 Adam K Dean. Use of this source code is
// governed by an MIT-style license that can be found at
// https://opensource.org/licenses/MIT.

const express = require('express')
const fs = require('fs')
const path = require('path')
const CanvasStream = require('./canvas')

const streamOptions = {
  width: 400,
  height: 300,
  fps: 5,
  outputFile: path.join(__dirname, '../stream/output.png')
}

const app = express()
const canvasStream = new CanvasStream(streamOptions)

app.use((req, res, next) => {
  console.log(req.method, req.url)
  next()
})

app.get('/', (req, res) => {
  const fileContents = fs.readFileSync(path.join(__dirname, '../static/html/index.html'))
  res.status(200).send(fileContents.toString())
})

app.get('/config', (req, res) => {
  res.status(200).json({
    streamInterval: 1000 / streamOptions.fps,
    stream: '/stream'
  })
})

app.get('/stream', (req, res) => {
  const stream = fs.createReadStream(streamOptions.outputFile)
  stream.on('open', () => stream.pipe(res))
})

app.use((req, res) => {
  res.status(404).send('404')
})

app.listen(8000, () => console.log('HTTP Server listening on port 8000'))
canvasStream.start(() => console.log('Canvas Stream started'))