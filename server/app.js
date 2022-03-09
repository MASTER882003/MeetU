const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const port = 42069;

app.get('/login', (req, res) => {
    res.json({message: 'test'});
});

io.on("connection", (socket) => {
    console.log("Incomming connection");
});

http.listen(port, () => console.log('Server started on port ' + port));