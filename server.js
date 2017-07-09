const WebSocketServer = require('ws').Server
const wss = new WebSocketServer({ port: process.env.port || 8888 })

let connections = []

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
        case 'iceCandidateProposal': {
          onCandidateProposal(connection, message)
          break;
        }
      }

    } else {
      respond(connection, malformedMessage())
    }

  })

  connection.on('close', () => {
    const { roomId, userId } = connection
    onClose(connection, { roomId, userId })
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
  const { roomId, userId } = command

  // if the requested fields has been given
  if ( roomId && userId ) {

    // we keep the roomId and the userId attached to the connection
    // in case of unexpected closing
    connection.roomId = roomId
    connection.userId = userId

    // if the roomId isn't in the data structure, we setup it
    if ( !connections[roomId] ) connections[roomId] = {}

    // add the new user connection to the room
    connections[roomId][userId] = connection

    // send to all the users connected at the same
    // user is logged in room that a new
    const users = Object.keys(connections[roomId])
    Object.values(connections[roomId]).forEach( (roomUserConnection) => {
      respond(roomUserConnection, { event: 'connected', roomId, users })
    })

  // otherwise the message is malformed
  } else {
    respond(connection, malformedMessage())
  }
}

// handle the connection requests from a user to another
onRequestConnection = (connection, command) => {
  const { roomId, userId, recipientId, sessionDescription } = command

  // if the requested fields has been given
  if ( roomId && userId && recipientId && sessionDescription ) {

    // turn the connection request to the recipient connection
    const recipientConnection = connections[roomId][recipientId]
    respond(recipientConnection, { event: 'connectionRequest', user: userId, sessionDescription })

  // otherwise the message is malformed
  } else {
    respond(connection, malformedMessage())
  }
}

// handle the connection acceptance of a user to another
onAcceptConnection = (connection, command) => {
  const { roomId, userId, requesterId, sessionDescription } = command

  // if the requested fields has been given
  if ( roomId && userId && requesterId && sessionDescription ) {

    // turn the connection acceptance to the requester connection
    const requesterConnection = connections[roomId][requesterId]
    respond(requesterConnection, { event: 'connectionAccepted', user: userId, sessionDescription })

  // otherwise the message is malformed
  } else {
    respond(connection, malformedMessage())
  }
}

// handle the ice candidate proposal from a user to another
onCandidateProposal = (connection, command) => {
  const { roomId, userId, recipientId, iceCandidate } = command

  // if the requested fields has been given
  if ( roomId && userId && recipientId && iceCandidate ) {

    // turn the ice candidate proposal to the recipient connection
    const recipientConnection = connections[roomId][recipientId]
    respond(recipientConnection, { event: 'candidateProposal', user: userId, iceCandidate })

  // otherwise the message is malformed
  } else {
    respond(connection, malformedMessage())
  }
}

// handle the close connection command
onClose = (connection, command) => {
  const { roomId, userId } = command

  // if the requested fields has been given
  if ( roomId && userId ) {

    // remove the user from the room connections
    delete connections[roomId][userId]

    // send to all the users connected the signal of
    // the user disconnection
    const users = Object.keys(connections[roomId])
    Object.values(connections[roomId]).forEach( (roomUserConnection) => {
      respond(roomUserConnection, { event: 'disconnected', roomId, disconnectedUserId: userId, users })
    })

  // otherwise the message is malformed
  } else {
    respond(connection, malformedMessage())
  }
}
