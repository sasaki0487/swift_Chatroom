var portNumber = 3000;
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var socketArray = [];
var name = []; //儲存各個client名字的array

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
        socket.on('user send out message', /*接收到要傳給其他client的訊息*/
            function(msg)
            {   
                //broadcast to everyone include the client of this socket ( with event string 'event string' ), you can define 'event string' your self
                io.emit('show message on screen', msg);
            });
        socket.on('register', /*有新的socket連上時登錄到name array裡*/
            function(msg)
            {
                name[socketArray.length-1] = msg;
                console.log('name: '+name[socketArray.length-1]);
                /*把傳送對象的名字後面加上 "<-" 後用/n串成一串emit給該socket，並在傳送後改回原本的名字*/
                for(var i = 0 ; i < socketArray.length ; i++)
                {
                    var temp = name[i];
                    name[i] = temp + "<-";
                    var str = name.join('\n');
                    socketArray[i].emit('name', str);
                    name[i] = temp;
                }
            });
        socket.on('disconnect', /* client按斷線時會接收到此訊息 */
            function()
            {
                /* 尋找斷開的socketindex */
                var socketIndex;
                for(var i = 0 ; i < socketArray.length ; i++)
                {
                    if(socketArray[i] == socket)
                        socketIndex = i;
                }
                /*更新socket array跟name array*/
                socketArray.splice(socketIndex,1);
                name.splice(socketIndex,1);
                console.log('socket count: '+socketArray.length);
                /*把更新後的name list傳送給各個client*/
                for(var i = 0 ; i < socketArray.length ; i++)
                {
                    var temp = name[i];
                    name[i] = temp + "<-";
                    var str = name.join('\n');
                    socketArray[i].emit('name', str);
                    name[i] = temp;
                }
              });
    
         socket.on('private', /*私訊功能*/
            function(msg)
            {
                /*接收到的msg格式為 "$name:$message" ，先split分開*/
                var strArray = msg.split(':');
                /*預設接收者的index為-1，以免使用者輸入錯誤造成server出現error*/
                var rec=-1,send;
                /*從接收到的傳送對象名字搜尋其index*/
                for(var i = 0 ; i < name.length ; i++)
                {
                    if(name[i] == strArray[0])
                        rec = i;
                }
                /*同一份訊息也要顯示在sender自己的message裡面，因此搜尋自己的index*/
                for(var i = 0 ; i < socketArray.length ; i++){
                    if(socketArray[i] == socket)
                        send = i;
                }
                /*輸出訊息為 "$sender_name:" */
                var out = name[send] + ':' + strArray[1]
                socketArray[send].emit('show message on screen', out);
                /*如果有找到傳送對象的話就emit，否則不emit*/
                if(rec!=-1)
                   socketArray[rec].emit('show message on screen', out);
            });
      });
