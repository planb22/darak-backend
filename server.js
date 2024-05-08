const express = require('express')  //express라이브러리 사용하겠다는 것
const app = express()    
const {MongoClient, ObjectId} = require('mongodb')  // mongoDB 연결, objectID사용
const cors = require('cors')


app.use(express.static(__dirname + '/public'))  // 퍼블릭 폴더 내부의 파일을 사용할 수 있음!
app.set('view engine', 'ejs')  // 우린 ejs를 view engine으로 쓴다
app.use(express.json())
app.use(express.urlencoded({extended:true})) // 이게 있어야 요청.body 사용 편해짐!
app.use(cors());


const session = require('express-session')
const passport = require('passport')
const LocalStrategy = require('passport-local')

app.use(passport.initialize())
app.use(session({
  secret: '0920',
  resave : false,
  saveUninitialized : false
}))

app.use(passport.session()) 


let db
const url = "mongodb+srv://codra:qwer1234@codra.j81aade.mongodb.net/?retryWrites=true&w=majority&appName=Codra";
new MongoClient(url).connect().then((client)=>{    // mongoclient.connet를 실행하면 mongodb에 연결
  console.log('DB연결성공')
  db = client.db('Darak')
  
app.listen(8080, () => {    //포트번호 5173

    /*포트란? 컴퓨터는 외부컴퓨터들과 통신할 수 있게 설계되어있다.
    이 때, 웹서비스를 이용하는 행위는 다른 사람의 컴퓨터에 접속하는 행위와 다를바가 없다.
    네이버 웹서비스를 이용하는건 네이버 컴퓨터에 접속하는것일뿐...
    평상시는 마음대로 접속 불가능하지만 그 컴퓨터가 구멍이 뚫려져 있으면 접속가능
    그걸 포트라고 함. 포트가 6만개 정도 있음 */

    console.log('http://localhost:8080에서 서버 실행중')   //서버 띄우는 코드
})
}).catch((err)=>{
  console.log(err)
})



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



app.get('/login', (요청,응답) => {
    응답.render('login.ejs')
})


app.post('/login', (요청, 응답, next) => {

    passport.authenticate('local', (error, user, info) => {
        if(error) return 응답.status(500).json(error)
        if(!user) return 응답.status(401).json(info.message)
        
        // 요청 객체에 login 함수가 없는지 확인하여, next 함수 대신 에러를 처리합니다.
        if (!요청.logIn) {
            return 응답.status(500).json({ message: '로그인 기능을 찾을 수 없습니다' });
        }

        요청.logIn(user, (err) => {
            if (err) return next(err); // next 함수를 여기서 사용
            응답.redirect('/');
        });
    })(요청, 응답, next);
});





app.get('/', (요청, 응답) => {
    
})