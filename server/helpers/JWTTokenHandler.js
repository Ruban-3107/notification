const jwt = require("jsonwebtoken");
const  config  = require("../../config/config");
const resfreshtokenmodel = require("../refreshtoken/refresh.model");
const { resolve, reject } = require("bluebird");
let expiration;
let SECRET;
let options;
let userToken;
class JwtToken{
    constructor(){
        expiration = process.env.NODE_ENV === "development" ? 1000000 : 604800000;
        SECRET = config.jwtSecret
        options = { expiresIn: expiration, issuer: 'onetoonehelp' };
    }

    getJWTToken(userid){
        const payload = { user: userid };
        const token = jwt.sign(payload, SECRET, options) 
        return token;
    }

    getRefreshToken(userid){
        return new Promise((resolve,reject) =>{
            const payload = { user: userid };
            const reftoken = jwt.sign(payload, SECRET, { expiresIn: '30d' });
            const refreshtoken = new resfreshtokenmodel({
                refresh_token : reftoken,
                acc_id: userid,
                status: "ACTIVE"
            })
            refreshtoken.save()
            .then(() => {resolve(reftoken)})
            .catch((err) => {reject(err)})
        })
      
        
    }

    verifyTokenExistenceJWT(req){
        userToken = req.cookies.catalogtoken || req.headers.authorization;
        if(userToken){
            return true;
        }else{
            return false;
        }
    }

    decryptJWT(){
        userToken = userToken.split(" ")[1]
        const userJWTPayload = jwt.verify(userToken, SECRET);
        return userJWTPayload;
    }

    checkRefreshToken(token){
        return new Promise((resolve,reject) =>{
        userToken = token;
        resfreshtokenmodel.get(userToken)
        .then((refresh) => {
            if(refresh.status === "ACTIVE"){
                resolve(refresh.acc_id);
            }else{
                reject(false);
            }   
        })
        .catch((error => {
            reject(error);
        }))
        })
    }
    decryptRefreshToken(accIDFromRefreshToken){
        const acc_id = jwt.verify(userToken, SECRET);
        if(accIDFromRefreshToken === acc_id.user){
            return acc_id;
        }else{
            return false;
        }
        
    }


}

module.exports = JwtToken;