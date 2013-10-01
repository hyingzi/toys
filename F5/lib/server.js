var http, path, url, fs, mime, scripts

fs = require('fs')
url = require('url')
http = require('http')
path = require('path')
mime = require('mime')

scripts = [
  '<script src="/socket.io/socket.io.js"></script>\n',
  '<script type="text/javascript">\n',
  '(function(){var socket = io.connect("http://127.0.0.1", {"connect timeout": 500,"reconnect": true,"reconnection delay": 500,"reopen delay": 500,"max reconnection attempts": 10});socket.on("refresh", function (data) {location.reload();});})();\n',
  '</script>\n',
  '</head>'
].join('')

exports.createServer = function(params){
  var pathname

  return http.createServer(function(req, res){
    pathname = url.parse(req.url).pathname

    if(params.proxy){
      proxy(res, params.proxy + pathname)
    }else{
      output(res, params.path + pathname)
    }
  })
}

function proxy(res, url){
  var file = ''

  http.get(url, function(response){
    response.setEncoding('utf8')
    response.on('data', function(data){
      file += data
    })
    .on('end', function(){
      successHandler(res, url, file)
    })
  })
  .on('error', function(e){
    console.log(e.message)
  })
}

function output(res, filepath){
  fs.exists(filepath, function(exists){
    if(exists){
      fs.readFile(filepath, 'binary', function(err, file){
        if(err){
          setHeader(res, 500)
          res.end(err)
        }else{
          successHandler(res, filepath, file)
        }
      })
    }else{
      setHeader(res, 404)
      res.end()
    }
  })
}

//helpers

function setHeader(res, statusCode, contentType){
  res.writeHead(statusCode, {
    'Content-Type' : contentType || 'text/plain'
  })
}

function successHandler(res, url, file){
  setHeader(res, 200, mime.lookup(path.extname(url) || '.html'))
  res.write(file.replace('</head>', scripts), 'binary')
  res.end()
}