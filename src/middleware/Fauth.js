const jwt = require("jsonwebtoken");
const {SRegister , Clogin , FRegister}= require("../model/model");

const Fauth = async (req , res, next) => {
    try{
        
        // getting cookie for verifying the token 
        const Ftoken = req.cookies.FTO;
        // verifying the user cookie (token) to the secret key 
        const validUser = jwt.verify( Ftoken , process.env.SECRET_KEY);
        // console.log(validUser);

        const Facuser = await FRegister.findOne({_id:validUser._id});
        // console.log(Facuser);
        
        req.Ftoken = Ftoken;
        req.Fuser = Facuser;        
        next();
        
    }catch(e){
        res.render("sorry" , {
            message: "Page Not Found",
            hreflink: "/"
        })
    }
}

module.exports = Fauth;