const jwt = require("jsonwebtoken");
const {SRegister , Clogin , FRegister} = require("../model/model");

const Cauth = async (req , res, next) => {
    try{
        
        // getting cookie for verifying the token 
        const Ctoken = req.cookies.CTO;
        // verifying the user cookie (token) to the secret key 
        const validUser = jwt.verify( Ctoken , process.env.SECRET_KEY);
        // console.log(validUser);

        const Cuser = await Clogin.findOne({_id:validUser._id});
        // console.log(Cuser);
        
        req.Ctoken = Ctoken;
        req.Cuser = Cuser;
        next();
        
    }catch(e){
        res.render("sorry" , {
            message: "Page Not Found",
            hreflink: "/"
        })
    }
}


module.exports = Cauth;