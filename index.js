const WebSocketServer = require('ws').Server
const wss = new WebSocketServer({ port: 8888 })

let lessons = []

wss.on('connection', (connection) => {

  connection.on('message', (message) => {

    const message = parseMessage(message)
    if ( message ) {

      switch (message.command) {
        case 'connect': {
          break;
        }
        case 'requestConnection': {
          break;
        }
        case 'acceptConnection': {
          break;
        }
        case 'closeConnection': {
          break;
        }
        case 'exchangeCandidate': {
          break;
        }
      }

    } else {
      connection.send(JSON.stringify({ error: "Malformed message" }))
    }

  })

  connection.on('close', () => {

  })

})

parseMessage = (message) => {
  try { return JSON.parse(message) }
  catch (exception) { return undefined }
}
