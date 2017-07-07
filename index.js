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
          onRequestConnection(connection, message)
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

// handle the first connection command
onConnect = (connection, command) => {
  const { lessonId, userId } = command

  // if the requested fields has been given
  if ( lessonId && userId ) {

    // if the lessonId isn't in the data structure, we setup it
    if ( !lessons[lessonId] ) lessons[lessonId] = {}

    // add the new user connection to the lesson
    lessons[lessonId][userId] = connection

    // send to all the users connected at the same
    // user is logged in lesson that a new
    const users = Object.keys(lessons[lessonId])
    Object.values(lessons[lessonId]).forEach( (lessonUserConnection) => {
      respond(lessonUserConnection, { event: 'connected', lessonId, users })
    })

  // otherwise the message is malformed
  } else {
    respond(connection, malformedMessage())
  }
}
