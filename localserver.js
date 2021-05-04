/* 
# run server with:
.\node_modules\ngrok\bin\ngrok http 3000
*/
const https = require('https');
const http = require('http');
const {performance} = require('perf_hooks');
const WebSocket = require('ws');
const proxy = require('express-http-proxy');
const express = require("express")

const app = express();

let port = 4040

//fix ssl localhost
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
// Make sure to put this directly after you define your app
// dont change if you want http -> https
// if you want https -> http change !req.secure to req.secure and https to http
app.set('trust proxy', true); // <- required
app.use((req, res, next) => {
  if(!req.secure) return res.redirect('https://' + req.get('host') + req.url);
  next();
});

app.use(express.static(__dirname + '/public'));
const server = http.createServer(app)
app.use('/', proxy('https://localhost:4040'));


const wss = new WebSocket.Server({ server });
let msg;

let clients = {}


wss.on('connection', function connection(ws) {

  let id = 0
  while (clients[id]) id++;
  let client = {
    id: id,
    pose: {
      position: {x: 0, y: 0, z:0},
      quaternion: {_x: 0, _y: 0, _z:0, _w:1}
    }
  }
  clients[id] = client

  console.log(clients)

  ws.on('close', function () {
		delete clients[id]
	})

  ws.on('message', function incoming(message) 
  {
    if (message[0]=="{") {
      let msg = JSON.parse(message);
      if (msg.cmd == "pose") {
        client.pose = msg.pose;
      }
    }

    // send all poses back:
    // ws.send(JSON.stringify({
    //   cmd: "clients",
    //   clients: clients
    // }))
    
    // msg = message;
    // //console.log('received: %s', typeof msg);
    // wss.clients.forEach(function (c) 
    // {
    //     if (c.readyState == WebSocket.OPEN) 
    //     {
    //       //client.send( msg );
    //     }
    // });
  });

  ws.send(JSON.stringify({cmd:"hello", id:id}));
});

let t = performance.now()
let dt = 1000/30
function update() {

  let msg = JSON.stringify({
    cmd: "clients",
    clients: clients
  })

  wss.clients.forEach(function (client) {
      if (client.readyState == WebSocket.OPEN) {
          client.send( msg );
      }
  });

	// timing:
	let t1 = performance.now()
	let dt = t1-t;
	if (Math.floor(t1/1000) > Math.floor(t/1000)) {
		//console.log(`dt ${Math.ceil(dt)}ms @${Math.floor(t1)}`)
		//console.log(msg)
    
	}
	t = t1;
	setTimeout(update, 1000/30)
}
update()

server.listen(3000, function(){
  console.log('listening on *:3000');
})

console.log("run server with:")
console.log(".\\node_modules\\ngrok\\bin\\ngrok http 3000")