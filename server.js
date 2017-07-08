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
          onAcceptConnection(connection, message)
          break;
        }
        case 'closeConnection': {
          onClose(connection, message)
          break;
        }
        case 'candidateProposal': {
          onCandidateProposal(connection, message)
          break;
        }
      }

    } else {
      respond(connection, malformedMessage())
    }

  })

  connection.on('close', () => {
    const { lessonId, userId } = connection
    onClose(connection, { lessonId, userId })
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

    // we keep the lessonId and the userId attached to the connection
    // in case of unexpected closing
    connection.lessonId = lessonId
    connection.userId = userId

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

// handle the connection requests from a user to another
onRequestConnection = (connection, command) => {
  const { lessonId, userId, recipientId } = command

  // if the requested fields has been given
  if ( lessonId && userId && recipientId ) {

    // turn the connection request to the recipient connection
    const recipientConnection = lessons[lessonId][recipientId]
    respond(recipientConnection, { event: 'connectionRequest', user: userId })

  // otherwise the message is malformed
  } else {
    respond(connection, malformedMessage())
  }
}

// handle the connection acceptance of a user to another
onAcceptConnection = (connection, command) => {
  const { lessonId, userId, requesterId } = command

  // if the requested fields has been given
  if ( lessonId && userId && requesterId ) {

    // turn the connection acceptance to the requester connection
    const requesterConnection = lessons[lessonId][requesterId]
    respond(requesterConnection, { event: 'connectionAccepted', user: userId })

  // otherwise the message is malformed
  } else {
    respond(connection, malformedMessage())
  }
}

// handle the ice candidate proposal from a user to another
onCandidateProposal = (connection, command) => {
  const { lessonId, userId, recipientId, iceCandidate } = command

  // if the requested fields has been given
  if ( lessonId && userId && recipientId && iceCandidate ) {

    // turn the ice candidate proposal to the recipient connection
    const recipientConnection = lessons[lessonId][recipientId]
    respond(recipientConnection, { event: 'candidateProposal', user: userId, iceCandidate })

  // otherwise the message is malformed
  } else {
    respond(connection, malformedMessage())
  }
}

// handle the close connection command
onClose = (connection, command) => {
  const { lessonId, userId } = command

  // if the requested fields has been given
  if ( lessonId && userId ) {

    // remove the user from the lesson connections
    delete lessons[lessonId][userId]

    // send to all the users connected the signal of
    // the user disconnection
    const users = Object.keys(lessons[lessonId])
    Object.values(lessons[lessonId]).forEach( (lessonUserConnection) => {
      respond(lessonUserConnection, { event: 'disconnected', lessonId, disconnectedUserId: userId, users })
    })

  // otherwise the message is malformed
  } else {
    respond(connection, malformedMessage())
  }
}
