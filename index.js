const WebSocketServer = require('ws').Server
const wss = new WebSocketServer({ port: 8888 })

let lessons = []

wss.on('connection', (connection) => {

  connection.on('message', (message) => {

    message = parseMessage(message)

    if ( message ) {

      switch (message.command) {
        case 'connect': {
          onConnect(connection, message)
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
      respond(connection, malformedMessage())
    }

  })

  connection.on('close', () => {

  })

})

parseMessage = (message) => {
  try { return JSON.parse(message) }
  catch (exception) { return undefined }
}

respond = (connection, message) => {
  connection.send(JSON.stringify(message))
}

malformedMessage = () => {
  return { error: "Malformed message" }
}

onConnect = (connection, command) => {
  const { lid, uid } = command
  if ( lid && uid ) {
    if ( !lessons[lid] ) lessons[lid] = {}
    lessons[lid][uid] = connection
    respond(connection, { event: 'connected', users: Object.keys(lessons[lid]) })
  } else {
    respond(connection, malformedMessage())
  }
}
