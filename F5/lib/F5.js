var emitter, path, io, server, Emitter, watchTree, config, log

path = require('path')
io = require('socket.io')
server = require('./server')
Emitter = require('events').EventEmitter
watchTree = require('watch-tree-maintained').watchTree

log = console.log
config = {
  'port' : 80,
  'path' : '',
  'proxy' : ''
}

exports.start = function(params){
  var instance

  params = extend(config, params)

  if(!params.path){
    oops()
    return
  }

  instance = server.createServer(params)
  io = io.listen(instance)
  instance.listen(params.port)
  instance.setMaxListeners(0)
  io.setMaxListeners(0)
  watchFilesModified(params)
  webSocketInitialization()
}

function watchFilesModified(params){
  emitter = new Emitter
  emitter.setMaxListeners(0)
  params.path.forEach(function(val){
    watchTree(val, {
      'ignore' : /(.*\/\.\w+|.*~$)/
    }).on('fileModified', function(file){
      emitter.emit('refresh')
    })
  })
}

function webSocketInitialization(){
  io.sockets.on('connection', function(socket){
    emitter.once('refresh', function(){
      socket.emit('refresh', {})
    })
  })

  //close socket.io debug message for console
  io.set('log level', 1)
}

function oops(){
  log('Please enter the path params')
  log('example : f5 --path [path]')
  log('example : f5 --port [port] --path [path]')
  log('example : f5 --port [port] --path [path] --proxy [proxy]')
}

//helpers

function extend(receiver, supplier){
  var key

  for(key in supplier){
    if(supplier.hasOwnProperty(key)){
      receiver[key] = supplier[key]
    }
  }

  return receiver
}