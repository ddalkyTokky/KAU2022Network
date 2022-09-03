const express = require('express')
const app = express();
const http = require('http')
const { disconnect } = require('process')
const socketio = require('socket.io')
const mysql = require('mysql');
// const bodyParser = require('body-parser');
// app.use(bodyParser.urlencoded({ extended : false }))

const client = mysql.createConnection ( {
    user : 'root',
    password : '9809',
    database : 'roomchat',
})

const port = 52273

const server = http.createServer(app)
const io = new socketio.Server(server)

app.use(express.static('public'));
app.use(express.json());
const nameList = new Array();


var rooms = {};
io.on('connection', (socket) => {
    console.log('a user connected')
    
    socket.on('makeRoom', (socketInfo) => {
        socket.join(socketInfo.roomNumber);
        // 이름, 방번호 저장
        const name = socketInfo.name;
        const roomNumber = socketInfo.roomNumber;
        socket.room = roomNumber;
        socket.name = name;
        if(!rooms[roomNumber]) {
            rooms[roomNumber] = new Array();
        }
        rooms[roomNumber].push(socket.name);
        // 접속자 현황
        io.sockets.in(socketInfo.roomNumber).emit('connectToRoom', {
            message : socket.name + ' now come in room ',
            id : socket.id,
            roomInfo : rooms[socket.room]
        });
    })
    
    socket.on('disconnect', (reason) => {
        io.sockets.in(socket.room).emit('close', socket.name);
        if(rooms[socket.room]) {
            const roomNumber = socket.room;
            const name = socket.name;
            const idx = rooms[roomNumber].indexOf(1);
            rooms[roomNumber].splice(idx, 1);
            console.log(rooms[socket.room]);
        }
    });

    socket.on('send msg', (msg) => {
        io.sockets.in(socket.room).emit('send msg', {
            message : msg.message,
            name : socket.name,
            id : socket.id,
        })
    })
})

// server.listen( port,'210.119.31.35', () => {
//     console.log('Server running at 210.119.31.35:52273')
// })

server.listen( port,'0.0.0.0', () => {
    console.log('Server is running')
})
