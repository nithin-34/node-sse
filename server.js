const express = require('express');
const app = express();
const bodyParser = require('body-parser');

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
    console.log("-------------");
    console.log(users);
    let count =  (Object.keys(users.users)).length+1;
    users.users[count] = req.body.name;
    //users.total = ++(users.total);
    users['total']++;
    console.log(users);
    console.log("-------------");
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
    intervalid  = setInterval(function() {
        console.log(users);
        let user1 = Object.values(users.users);
        let names1 = user1.join(", ");
        let total1 = users.total;
        if(globalVal > localVal){
            console.log("client connected");
            //const date = new Date().toLocaleString()
            //resp.write(`{"names":"${names}","total":${total}}\n\n`);
            resp.write(`data: {"names":"${names1}","total":${total1},"globalVal":${globalVal}}\n\n`);
            localVal = globalVal;
        }
      }, 100);
    
    resp.on('close', () => {
        console.log("client closed connection")
        clearInterval(intervalid)
        resp.end()
    })

  });

//Landing page view
app.get('/', function(req, resp){
    //console.log(__dirname + '\\views\\index.html');
    resp.sendFile(__dirname + '\\views\\index.html');
  });

//Node host and port defined
// const hostname = '127.0.0.1';
// const port = 8081;

//listeing to port 
// app.listen(port, hostname, () => {
//     console.log(`Server running at http://${hostname}:${port}/`);
//   });

  var server = app.listen(process.env.PORT || 3000, function () {
    var host = server.address().address
    var port = server.address().port
    console.log('App listening at http://%s:%s', host, port)
  })