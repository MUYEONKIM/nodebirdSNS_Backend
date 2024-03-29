const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const morgan = require('morgan');
const session = require('express-session');
const dotenv = require('dotenv');
const cors = require('cors')
dotenv.config();
const board = require('./routes/board');
const postRouter = require('./routes/post');
const authRouter = require('./routes/auth');
const userRouter = require('./routes/user')
const { sequelize } = require('./models');
const passportConfig = require('./passport');

const app = express();
app.set('port', process.env.PORT || 8001);

sequelize.sync({ force: false })
  .then(() => {
    console.log('데이터베이스 연결 성공');
  })
  .catch((err) => {
    console.error(err);
  });
passportConfig();
app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

app.use(morgan('dev'));
app.use('/img', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(session({
  resave: false,
  saveUninitialized: false,
  secret: process.env.COOKIE_SECRET,
  cookie: {
    httpOnly: true,
    secure: false,
  },
}));
app.use(passport.initialize()); // req.user, req.login, .req.isAuth... 등 생김
app.use(passport.session());
app.use('/board', board);
app.use('/auth', authRouter);
app.use('/post', postRouter);
app.use('/user', userRouter);

app.use((req, res, next) => {
  const error = new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
  error.status = 404;
  next(error);
});

app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = process.env.NODE_ENV !== 'production' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

app.listen(app.get('port'), () => {
  console.log(app.get('port'), '번 포트에서 대기중');
});

