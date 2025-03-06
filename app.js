/*const logger = require('morgan');
const cookieParser = require('cookie-parser');
const createError = require('http-errors');*/
const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const path = require('path');
const lessMiddleware = require('less-middleware');
const indexRouter = require('./routes/index');

const users = [];

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

/*app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());*/
app.use(lessMiddleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

// catch 404 and forward to error handler
/*app.use(function (req, res, next) {
  next(createError(404));
});*/

// error handler
/*app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error pagtie
  res.status(err.status || 500);
  res.render('error');
});*/

io.on('connection', (socket) => {

  socket.on('login', (nickname) => {
    if (users.includes(nickname)) {
      io.sockets.emit('loginResponse', {
        status: 'failed',
        nickname
      });
    } else {
      users.push(nickname);
      socket.nickname = nickname;
      io.sockets.emit('loginResponse', {
        status: 'ok',
        nickname
      });
      io.sockets.emit('users', { users });
    }
  });

  socket.on('message', (message) => {
    io.sockets.emit('new message', {
      message,
      date: new Date(),
      nickname: socket.nickname
    });
  });

  socket.on('disconnect', () => {
    if (socket.nickname) {
      const userIndex = users.findIndex(userName => userName === socket.nickname);

      if (userIndex > -1) {
        users.splice(userIndex, 1);
        io.sockets.emit('users', { users });
      }

      socket.nickname = undefined;
    }
  });
});

// module.exports = app;

server.listen(3000, () => {
  // tslint:disable-next-line:no-console
  console.log(`Server works on 3000`);
});
