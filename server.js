const express = require('express')  //express라이브러리 사용하겠다는 것
const app = express()    
const {MongoClient, ObjectId} = require('mongodb')  // mongoDB 연결, objectID사용
const cors = require('cors')
const MongoStore = require('connect-mongo')
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken')
const SECRET_KEY = 'Darak'
const auth = require('./authMiddleware.js')


app.use(express.static(__dirname + '/public'))  // 퍼블릭 폴더 내부의 파일을 사용할 수 있음!
//app.set('view engine', 'ejs')  // 우린 ejs를 view engine으로 쓴다
app.use(express.json())
app.use(express.urlencoded({extended:true})) // 이게 있어야 요청.body 사용 편해짐!
app.use(cors({
  origin: '*', // 출처 허용 옵션
  credential: 'true' // 사용자 인증이 필요한 리소스(쿠키 ..등) 접근
}));






let db
const url = "mongodb+srv://codra:qwer1234@codra.j81aade.mongodb.net/?retryWrites=true&w=majority&appName=Codra";
new MongoClient(url).connect().then((client)=>{    // mongoclient.connet를 실행하면 mongodb에 연결
  console.log('DB연결성공')
  db = client.db('Darak')
  
app.listen(5173, () => {    //포트번호 5173

    /*포트란? 컴퓨터는 외부컴퓨터들과 통신할 수 있게 설계되어있다.
    이 때, 웹서비스를 이용하는 행위는 다른 사람의 컴퓨터에 접속하는 행위와 다를바가 없다.
    네이버 웹서비스를 이용하는건 네이버 컴퓨터에 접속하는것일뿐...
    평상시는 마음대로 접속 불가능하지만 그 컴퓨터가 구멍이 뚫려져 있으면 접속가능
    그걸 포트라고 함. 포트가 6만개 정도 있음 */

    console.log('http://localhost:5173에서 서버 실행중')   //서버 띄우는 코드
})
}).catch((err)=>{
  console.log(err)
})



app.post('/signin', async (req, res) => {
  
const userGivenUsername = req.body.username
const userGivenPassword = req.body.password

const result = await db.collection('user').findOne({username : userGivenUsername, password : userGivenPassword})
if(result)
  {
    token = jwt.sign({
      type : "JWT",
      UID : result._id
    }, SECRET_KEY, {
      expiresIn : '60m',
      issuer : 'codra',
    });



    return res.status(200).json({
      code : 200,
      message : '로그인 성공! 토큰이 발급되었어요.',
      token : token
    })
    res.end()

  }

else{
  return res.status(401).json({
    code : 401,
    message : '계정이 존재하지 않아요. 이메일과 비밀번호를 확인해주세요.'
  })
}






})

app.get('/signin', async(req, res) =>{
  res.status(200).end()

}


)

app.post('/signup', async (req, res, next) => {
      if(await db.collection('user').findOne({username : req.body.username}))
        {
          res.status(500)
          console.error('Invalid user name!')
          res.json({ message : "이미 사용 중인 이메일이 있어요."})
          res.end()
          return;
        }
  
        else if(await db.collection('user').findOne({nickname : req.body.nickname}))
          {
            res.status(500)
            console.error('Invalid nickname!')
            res.json({ message : "이미 사용 중인 닉네임이 있어요."})
            res.end()
            return;
          }
    
        
        const result = { username : req.body.username,
          name : req.body.name,
          password : req.body.password,
          nickname : req.body.nickname
        }
        await db.collection('user').insertOne(result)
    
        const createdOne = await db.collection('user').findOne({username : req.body.username})

        const token =jwt.sign({
          type : 'JWT',
          UID : createdOne._id,
          nickname : createdOne.nickname,
        }, SECRET_KEY, {
          expiresIn : '1d',
          issuer: 'codra'
        })


        console.log(`회원가입 발생 : 
        username : ${createdOne.username}
        password : ${createdOne.password}`)

        return res.status(200).json({
          
          code : 200,
          message : "회원가입 완료! 환영해요!",
          token : token

        }).end()
        


  
  
    

    })




    function loggedin(req, res, next) {
      if (req.user) {
        console.log('not expired!')
          next();
      }
      else{
          res.status(500)
          throw new Error('Session expired!')
  
      }
    } 


app.get('/main', (req, res) => {
  console.log(req.user._id)

  res.json({




  })
  res.status(200)
  res.end();
})
  

app.get('/giveme', (req, res) => {

  console.log(req.session);
  res.end()})

///////////////////////////////비밀번호 난수 생성 ///////////////////
var variable = "0,1,2,3,4,5,6,7,8,9,a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z".split(",");

      //비밀번호 랜덤 함수
function createRandomPassword(variable, passwordLength) {
var randomString = "";
for (var j=0; j<passwordLength; j++) 
randomString += variable[Math.floor(Math.random()*variable.length)];
return randomString}



const sendMail = async() =>{
const transporter = nodemailer.createTransport({
  service: 'gmail',
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: { // 이메일을 보낼 계정 데이터 입력
    user: 'wjdgotn0920@gmail.com',
    pass: 'kqxk toes ulov kwsj',
  },
});



const emailOptions = { // 옵션값 설정
    from: 'wjdgotn0920@gmail.com',
    to: k/**/,
    subject: '다락에서 임시비밀번호를 알려드립니다.',
    html: 
    "<h1 >다락에서 새로운 비밀번호를 알려드립니다.</h1> <h2> 비밀번호 : " + targetPassword + "</h2>"
    +'<h3 style="color: crimson;">임시 비밀번호로 로그인 하신 후, 반드시 비밀번호를 수정해 주세요.</h3>'}
  
  
  await transporter.sendMail(emailOptions)
  
  }




app.post('/new_password', async (req, res) =>{

  targetAccount = req.body.username
  targetPassword = createRandomPassword(variable, 8)

  realInfo = await db.collection('user').findOne({username : req.body.username})
  if(realInfo){
    await db.collection('post').updateOne({username : req.body.username}), {$set : {password : targetPassword}}
    sendMail()
    res.status(200).end()
  
  }})


