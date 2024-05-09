const router = require('express').Router()
const express = require('express')  //express라이브러리 사용하겠다는 것
const app = express()    
const {MongoClient, ObjectId} = require('mongodb')  // mongoDB 연결, objectID사용
const cors = require('cors')



const session = require('express-session')
const passport = require('passport')
const LocalStrategy = require('passport-local')



passport.use(new LocalStrategy(async (입력한아이디, 입력한비번, cb) => {
  let result = await db.collection('user').findOne({ username : 입력한아이디})
  if (!result) {
    return cb(null, false, { message: '존재하지 않는 아이디입니다' })
  }
  if (result.password == 입력한비번) {
    return cb(null, result)
  } else {
    return cb(null, false, { message: '비밀번호가 일치하지 않습니다' });
  }
}))

passport.serializeUser((user, done) => {
  process.nextTick(() => {   // 특정 코드를 비동기적으로 처리해줌
    done(null, { id: user._id, username: user.username })
  })
})

passport.deserializeUser(async (user, done) => {
  let result = await db.collection('user').findOne({_id : new ObjectId(user.id) })
  delete result.password
  process.nextTick(() => {
    return done(null, result)
  })
})




let db
const url = "mongodb+srv://codra:qwer1234@codra.j81aade.mongodb.net/?retryWrites=true&w=majority&appName=Codra";
new MongoClient(url).connect().then((client)=>{    // mongoclient.connet를 실행하면 mongodb에 연결
  console.log('DB연결성공')
  db = client.db('Darak')})

router.post('/login', (req, res, next) => {

    passport.authenticate('local', cors(), (error, user, info) => {
        if(error) return res.status(500).json(error)
        if(!user) return res.status(401).json(info.message)
        
        // 요청 객체에 login 함수가 없는지 확인하여, next 함수 대신 에러를 처리합니다.
        if (!req.logIn) {
            return res.status(500).json({ message: '로그인 기능을 찾을 수 없습니다' });
        }

        req.logIn(user, (err) => {
            if (err) return next(err);
            res.status(200) // next 함수를 여기서 사용

        });
    })(req, res, next);
});




router.post('/signup', async (req, res) => {
    if(await db.collection('user').findOne({username : req.body.username}))
      {
        res.status(500)
        console.error('Invalid user name!')
        res.json({ message : "이미 사용 중인 이메일입니다."})
        res.end()
        return;
      }

      if(await db.collection('user').findOne({username : req.body.nickname}))
        {
          res.status(500)
          console.error('Invalid nickname!')
          res.json({ message : "이미 사용 중인 닉네임입니다."})
          res.end()
          return;
        }
  
      
      const result = { username : req.body.username,
        name : req.body.name,
        password : req.body.password,
        nickname : req.body.nickname
      }
      await db.collection('user').insertOne({ username : req.body.username,
        name : req.body.name,
        password : req.body.password,
        nickname : req.body.nickname
      })
  
      const createdOne = await db.collection('user').findOne({username : req.body.username})
  
  
  
      res.status(200)
      res.json({ 
        uid : createdOne._id,
        message : "가입에 성공했습니다."})
      console.log(req.body.username)
      console.log(req.body.password)
      res.end()
  
  })

  module.exports = router 