// Copyright 2021 Adam K Dean. Use of this source code is
// governed by an MIT-style license that can be found at
// https://opensource.org/licenses/MIT.

const { createWriteStream } = require('fs')
const { createCanvas } = require('canvas')

class CanvasStream {
  constructor(options) {
    this.options = options
    this.ball = {
      diameter: 10,
      speed: 100 / this.options.fps,
      direction: { x: 1, y: 1 },
      position: { x: 10, y: 10 }
    }
  }

  start(cb) {
    this.canvas = createCanvas(this.options.width, this.options.height)
    this.ctx = this.canvas.getContext('2d')
    this.startTime = Date.now()
    this.lastTime = Date.now()

    setInterval(() => {
      this.update()
      this.draw()
    }, 1000 / this.options.fps)

    cb()
  }

  async update() {
    this.ball.position.x += this.ball.speed * this.ball.direction.x
    this.ball.position.y += this.ball.speed * this.ball.direction.y

    if (this.ball.position.x + this.ball.diameter >= this.canvas.width) {
      this.ball.direction.x = -1
    }

    if (this.ball.position.x - this.ball.diameter <= 0) {
      this.ball.direction.x = 1
    }

    if (this.ball.position.y + this.ball.diameter >= this.canvas.height) {
      this.ball.direction.y = -1
    }

    if (this.ball.position.y - this.ball.diameter <= 0) {
      this.ball.direction.y = 1
    }
  }

  async draw() {
    const elapsed = this.lastTime - this.startTime
    const elapsedString = `${elapsed.toLocaleString()} ms`

    const elapsedSinceLast = Date.now() - this.lastTime
    const elapsedSinceLastString = `${elapsedSinceLast.toLocaleString()} ms`

    this.ctx.fillStyle = 'black'
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

    this.ctx.beginPath()
    this.ctx.arc(this.ball.position.x, this.ball.position.y, this.ball.diameter, 0, 2 * Math.PI)
    this.ctx.fillStyle = 'red'
    this.ctx.fill()

    this.ctx.fillStyle = 'white'
    this.ctx.font = '24px Hack'

    const metrics = this.ctx.measureText(elapsedString)
    const x = this.canvas.width / 2 - metrics.width / 2
    const y = this.canvas.height / 2 + metrics.actualBoundingBoxAscent / 2
    this.ctx.fillText(elapsedString, x, y - 10)

    const metrics2 = this.ctx.measureText(elapsedSinceLastString)
    const x2 = this.canvas.width / 2 - metrics2.width / 2
    const y2 = y + metrics.actualBoundingBoxAscent
    this.ctx.fillText(elapsedSinceLastString, x2, y2 + 10)

    const out = createWriteStream(this.options.outputFile)
    const stream = this.canvas.createPNGStream()
    stream.pipe(out)

    this.lastTime = Date.now()
  }
}

module.exports = CanvasStream
