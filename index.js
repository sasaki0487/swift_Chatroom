var portNumber = 3000;
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var socketArray = [];
var name = [];

//設定從網頁連進Server時，回傳index.html給瀏覽器 (瀏覽器端為Client，index.html裡面有client的code)
app.get('/',
        function(req, res)
        {
            res.sendFile(__dirname + '/index.html');
        });

//設定 Server 監聽 3000 這個 port
http.listen(portNumber,
            function()
            {
                console.log('listening on *:' + portNumber);
            });


//可將 io 視為 Server 上管理所有 Socket 的 Manager
io.on('connection',
      function(socket) /*[1]*/
      {
      
      //將新創造的 Socket加到 socketArray 裡
      socketArray[socketArray.length] = socket;
      //在 server 的 console 中輸出現有的 socket 數量量
      console.log('socket count: '+socketArray.length);
        socket.on('user send out message', /*[2]*/
                  function(msg)
                  {
                  
                  //only send message back to the client of this socket ( with event string 'show message on screen' )
                  //socket.emit('show message on screen', msg);
                  
                  //broadcast to everyone include the client of this socket ( with event string 'event string' ), you can define 'event string' your self
                  io.emit('show message on screen', msg);
                  
                  //broadcast to everyone except for the client of this socket ( with event string 'event string' ), you can define 'event string' your self
                  //socket.broadcast.emit('show message on screen', 'other: ' + msg);
                  
                  });
        socket.on('register', /*[2]*/
                function(msg)
                {
                    name[socketArray.length-1] = msg;
                    console.log('name: '+name[socketArray.length-1]);
                  
                    for(var i = 0 ; i < socketArray.length ; i++){
                        var temp = name[i];
                        name[i] = temp + "<-";
                        var str = name.join('\n');  
                        socketArray[i].emit('name', str);
                        name[i] = temp;
                    }
                });
      socket.on('private', /*[2]*/
                function(msg)
                {
                    var strArray = msg.split(':');
                    var rec=-1,send;
                    for(var i = 0 ; i < name.length ; i++){
                        if(name[i] == strArray[0]){
                        rec = i;
                        }
                    }
                    for(var i = 0 ; i < socketArray.length ; i++){
                        if(socketArray[i] == socket)
                            send = i;
                    }
                    var out = name[send] + ':' + strArray[1]
                    socketArray[send].emit('show message on screen', out);
                    if(rec!=-1)
                        socketArray[rec].emit('show message on screen', out);
                });
        socket.on('disconnect',
                  function()
                  {
                    var socketIndex;
                    for(var i = 0 ; i < socketArray.length ; i++){
                        if(socketArray[i] == socket)
                            socketIndex = i;
                    }
                    socketArray.splice(socketIndex,1);
                    name.splice(socketIndex,1);
                    console.log('socket count: '+socketArray.length);
                      for(var i = 0 ; i < socketArray.length ; i++){
                          var temp = name[i];
                          name[i] = temp + "<-";
                          var str = name.join('\n');  
                          socketArray[i].emit('name', str);
                          name[i] = temp;
                      }
                  });
      });

/*
[1] when a new clinet connect to server, server will deploy a new socket to handle the connection to this client and call this function with the new created socket as parameter.

[2] tells socket to handle 'chat message from clinet' event. when socket get 'chat message frome clinet' event, server will call following function and the event message as the parameter
 
*/
