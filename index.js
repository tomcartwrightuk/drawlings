const http = require('http')
const port = 5000

const ecstatic = require('ecstatic')({
  root: `${__dirname}/public`,
  showDir: true,
  autoIndex: true,
  cache: 'max-age=0'
})

http.createServer(ecstatic).listen(port)

console.log('Listening on :', port)
