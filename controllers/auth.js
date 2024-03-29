const bcrypt = require('bcrypt');
const passport = require('passport');
const User = require('../models/user');
const jwt = require('jsonwebtoken');

exports.join = async (req, res, next) => {
  const { email, nick, password } = req.body;
  try {
    const exUser = await User.findOne({ where: { email } });
    if (exUser) {
      throw new Error('이미 가입된 회원입니다.')
    }
    const hash = await bcrypt.hash(password, 12);
    await User.create({
      email,
      nick,
      password: hash,
    });
    return res.send('회원가입에 성공하였습니다.');
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      message: error.message,
    });
  }
}

exports.login = (req, res, next) => {
  passport.authenticate('local', (authError, user, info) => {
    if (authError) {
      console.error(authError);
      return next(authError);
    }
    if (!user) {
      return res.status(500).json(info.message)
    }
    return req.login(user, async (loginError) => {
      if (loginError) {
        console.error(loginError);
        return next(loginError);
      }
      const token = jwt.sign({
        id: user.id,
        nick: user.nick
      }, process.env.JWT_SECRET, {
        expiresIn: '30m',
        issuer: 'nodebird',
      })
      return res
        .status(200)
        .json({
          code: 200,
          message: '토큰이 발급되었습니다.',
          token
        });
    });
  })(req, res, next); // 미들웨어 내의 미들웨어에는 (req, res, next)를 붙입니다.
};

exports.logout = (req, res) => {
  req.logout(() => {
    res.send("로그아웃 되었습니다.").end();
  })
};
