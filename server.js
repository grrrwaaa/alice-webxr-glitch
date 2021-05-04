const express = require('express');
const app = express();
const https = require('https');
const http = require('http');
const WebSocket = require('ws');

// Make sure to put this directly after you define your app
// dont change if you want http -> https
// if you want https -> http change !req.secure to req.secure and https to http
app.set('trust proxy', true); // <- required
app.use((req, res, next) => {
  if(!req.secure) return res.redirect('https://' + req.get('host') + req.url);
  next();
});

app.use(express.static(__dirname + '/public'));

const server = http.createServer(app) // glitch doesn't need https to run wss ???



// var listener = app.listen(process.env.PORT, function () {
//   console.log('Demo app listening on ' + listener.address().port);
// });

const wss = new WebSocket.Server({ server });
var msg;

wss.on('connection', function connection(ws) 
{
  ws.on('close', function () {
		console.log("disconnected")
	})
  
  ws.on('message', function incoming(message) 
  {
    msg = message;
    console.log('received: %s', msg);
    wss.clients.forEach(function (client) 
    {
       if (client.readyState == WebSocket.OPEN) 
       {
          client.send( msg );
       }
    });
  });

  ws.send('Chat room is working!');
});

server.listen(3000, function(){
  console.log('listening on *:3000');
})