const jwt = require("jsonwebtoken");
const {SRegister , Clogin , FRegister}= require("../model/model");

const Sauth = async (req , res, next) => {
    try{
        
        // getting cookie for verifying the token 
        const Stoken = req.cookies.STO;
        // verifying the user cookie (token) to the secret key 
        const validUser = jwt.verify( Stoken , process.env.SECRET_KEY);
        // console.log(validUser);

        const Stduser = await SRegister.findOne({_id:validUser._id});
        // console.log(Stduser);
        
        req.Stoken = Stoken;
        req.Suser = Stduser;        
        next();
        
    }catch(e){
        res.render("sorry" , {
            message: "Page Not Found",
            hreflink: "/"
        })
    }
}

module.exports = Sauth;