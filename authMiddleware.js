const jwt = require('jsonwebtoken')
const SECRET_KEY = 'Darak'
exports.auth = (req, res, next)=> {
    try{
        req.decoded = jwt.verify(req.heards.authorization, SECRET_KEY);
        return next();
    }
catch(error)
    {if(error.name === 'TokenExpiredError')
        {
            return res.status(419).json({
                code : 419,
                message : '만료된 토큰이에요.'
            })
        }
    
    else if(error.name === 'JsonWebTokenError'){

        return res.status(401).json({
            code : 401,
            message : '유효하지 않은 토큰이에요'
        });
    }
    
}
}
