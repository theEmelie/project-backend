const bodyParser = require("body-parser");
const express = require("express");
const cors = require('cors');
const morgan = require('morgan');
const app = express();
const port = 8888;
const servers = require('http').createServer(app);
const io = require('socket.io')(servers);

const index = require('./routes/index');
const auth = require('./routes/auth');
const objects = require('./routes/objects');
const depots = require('./routes/depots');
const objectsModel = require('./models/objects');

const socketPort = 9595;

app.use(cors());
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

io.origins(['https://proj-react.emelieaslund.me:443']);

// Routes
app.use('/', index);
app.use('/auth', auth);
app.use('/objects', objects);
app.use('/depots', depots);

// Socket for simulate price
io.on('connection', function(socket) {
    console.log('a user connected');
    socket.on('disconnect', function() {
        console.log('user disconnected');
    });
});

function pricesUpdated(items) {
    io.emit("newPrices", items);
    // console.log(items);
}

setInterval(function () {
    // Update prices, providing callback
    let items = objectsModel.updatePrices(pricesUpdated);
}, 5000);


// Add routes for 404 and error handling
// Catch 404 and forward to error handler
// Put this last
app.use((req, res, next) => {
    var err = new Error("Not Found");

    err.status = 404;
    next(err);
});

// don't show the log when it is test
if (process.env.NODE_ENV !== 'test') {
    // use morgan to log at command line
    app.use(morgan('combined')); // 'combined' outputs the Apache style LOGs
}

// Start up server
const server = app.listen(port, () => console.log(`Backend is listening to ${port}!`));

servers.listen(socketPort);

module.exports = server;
