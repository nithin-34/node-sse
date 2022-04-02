const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const EventEmitter = require('events');
const { Socket } = require('socket.io');
const emitter = new EventEmitter();

var server = require('http').createServer(app);
var socketIo = require('socket.io')(server);
const orders = socketIo.of('/orders');
var mdmtUsers = [];

let globalVal = 1;
let localVal = 0;
var users = {
    "users":{
        "1":"Rakesh",
        "2":"Nikhil",
        "3":"Nithin"
    },
    "total":3
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//api routes using APP 

app.post('/adduser', function(req, resp){
    globalVal++;
    let count =  (Object.keys(users.users)).length+1;
    users.users[count] = req.body.name;
    //users.total = ++(users.total);
    users['total']++;
    emitter.emit('addeduser');
    resp.send(`Success: ${JSON.stringify(users)}`);

})

app.get('/usersDat', function(req, resp){
    let user = Object.values(users.users)
    let names = user.join(", ")
    let total = users.total
    resp.send({"names":names,"total":total});
  });

  app.get('/users', function(req, resp){
    
    resp.setHeader('Content-Type', 'text/event-stream');
    resp.setHeader('Access-Control-Allow-Origin', '*');
    resp.setHeader('Cache-Control', 'no-cache');
    resp.setHeader('Connection', 'Keep-Alive');
    console.log('+++++++++++++++++');
    emitter.on('addeduser', () => {
      //console.log("hey dude");
      console.log("client connected");
      let user1 = Object.values(users.users);
      let names1 = user1.join(", ");
      let total1 = users.total;

      resp.write(`data: {"names":"${names1}","total":${total1},"globalVal":${globalVal}}\n\n`);
    })
//     intervalid  = setInterval(function() {
//         console.log(users);
//         let user1 = Object.values(users.users);
//         let names1 = user1.join(", ");
//         let total1 = users.total;
//         if(globalVal > localVal){
//             console.log("client connected");
//             //const date = new Date().toLocaleString()
//             //resp.write(`{"names":"${names}","total":${total}}\n\n`);
//             resp.write(`data: {"names":"${names1}","total":${total1},"globalVal":${globalVal}}\n\n`);
//             localVal = globalVal;
//         }
//       }, 100);
    
    resp.on('close', () => {
        console.log("client closed connection")
       // clearInterval(intervalid)
        resp.end()
    })

  });

// SSE events when laravel updated the status
app.get('/orderStatus', (req, resp) => {
  resp.setHeader('Content-Type', 'text/event-stream');
  resp.setHeader('Access-Control-Allow-Origin', '*');
  resp.setHeader('Cache-Control', 'no-cache');
  resp.setHeader('Connection', 'Keep-Alive');
  
  console.log("client connected app");
  emitter.on('order', (orderStatus) => {
    //console.log("hey dude");
//     let user1 = Object.values(users.users);
//     let names1 = user1.join(", ");
//     let total1 = users.total;

    resp.write(`data: ${JSON.stringify(orderStatus)}\n\n`);
  })

  resp.on('close', () => {
    console.log("client closed connection app")
    resp.end()
  })

})

// Api to get data from laravel api
app.post('/statusUpdated', (req, resp) => {
  resp.send("ok")
  console.log(req.body);
  emitter.emit('statusChanged', req.body);
})

//Landing page view
app.get('/', function(req, resp){
    console.log(__dirname + '//view//index.html');
    resp.sendFile(__dirname + '//view//index.html');
  });

  socketIo.on('connection', function(socket){
    console.log("socket connected");
  
    socket.on("connected", function(userId){
      console.log("user Id received "+ userId);
        if((userId != "" || userId != null) && !(mdmtUsers.includes(userId))){
            console.log("user Id added "+ userId);
            mdmtUsers[userId] = socket.id;
        }
        console.log(JSON.stringify(mdmtUsers));
    });  
  
  })

  emitter.on('status', (orderStatus) => {
    console.log("Inside socketIO emitter status");
    //resp.write(`data: ${JSON.stringify(orderStatus)}\n\n`);
    console.log("++++++++++++++++++++++++");
    console.log(JSON.stringify(mdmtUsers));
    console.log(mdmtUsers[orderStatus.userid]);
    console.log("-------------------");
    socketIo.to(mdmtUsers[orderStatus.userid]).emit("updatedStatus", orderStatus);
  });

  orders.on('connection', function(order){
    console.log("socket connected");
  
    order.on("connected", function(userId){
      console.log(`user ${userId} added in orders`);
      //mdmtUsers[userId] = order.id;
      order.join(`order_${userId}`);
    });
  
  })
  
  emitter.on('statusChanged', (orderStatus) => {
    console.log(`statusChanged emitted for user ${orderStatus.userid}`);
    //console.log(mdmtUsers[orderStatus.userid]);
    console.log("-------------------");
    orders.to(`order_${orderStatus.userid}`).emit("updatedStatus", orderStatus);
  });

//Node host and port defined
// const hostname = '127.0.0.1';
// const port = 8081;

//listeing to port 
// app.listen(port, hostname, () => {
//     console.log(`Server running at http://${hostname}:${port}/`);
//   });

  server.listen(process.env.PORT || 3000, function () {
    var host = server.address().address
    var port = server.address().port
    console.log('App listening at http://%s:%s', host, port)
  })
