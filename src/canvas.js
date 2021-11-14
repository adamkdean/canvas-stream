// Copyright 2021 Adam K Dean. Use of this source code is
// governed by an MIT-style license that can be found at
// https://opensource.org/licenses/MIT.

const { createWriteStream } = require('fs')
const { createCanvas } = require('canvas')

class CanvasStream {
  constructor(options) {
    this.options = options
  }

  start(cb) {
    this.canvas = createCanvas(this.options.width, this.options.height)
    this.ctx = this.canvas.getContext('2d')
    this.startTime = Date.now()

    setInterval(() => {
      this.process()
    }, 1000 / this.options.fps)

    cb()
  }

  async process() {
    const elapsed = Date.now() - this.startTime
    const elapsedString = `${elapsed.toLocaleString()} ms`

    this.ctx.fillStyle = 'black'
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

    this.ctx.fillStyle = 'white'
    this.ctx.font = '24px Hack'

    const metrics = this.ctx.measureText(`${elapsed} ms`)
    const x = this.canvas.width / 2 - metrics.width / 2
    const y = this.canvas.height / 2 + metrics.actualBoundingBoxAscent / 2
    this.ctx.fillText(elapsedString, x, y)

    const out = createWriteStream(this.options.outputFile)
    const stream = this.canvas.createPNGStream()
    stream.pipe(out)
  }
}

module.exports = CanvasStream
