const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

// Create Schema for the Student register page
const SSchema = new mongoose.Schema({
    Name: {
        type: String,
        required: true
    },
    Roll: {      
        type: String,
        required: true,
        unique: true
    },
    Department: {
        type: String,
        required: true,
    },
    Course: {
        type: String,
        required: true,
    },
    Semester: {
        type: String,
        required: true,
    },
    DOB: {
        type: String,
        required: true,
    },
    Phone: {
        type: String,
        required: true,
        unique: true
    },
    Email: {
        type: String,
        required: true,
        unique: true
    },
    Password: {
        type: String,
        required: true
    },
    Confirm: {
        type: String,
        required: true
    },
    tokens: [
        {
            token: {
                type: String,
                required: true
            }
        }
    ],
});

//create schema for coordinator login
const CSchema = new mongoose.Schema({
    Cid: {
        type: String,
        required: true,
        uppercase: true
    },
    tokens: [
        {
            token: {
                type: String,
                required: true
            }
        }
    ]
});

//create schema for faculty register
const FSchema = new mongoose.Schema({
    Fid: {
        type: String,
        required: true
    },
    Name: {
        type: String,
        required: true
    },
    Email: {
        type: String,
        required: true,
        unique: true
    },
    Phone: {
        type: String,
        required: true,
        unique: true
    },
    DOB: {
        type: String,
        required: true
    },
    Department: {
        type: String,
        required: true
    },
    tokens: [
        {
            token: {
                type: String,
                required: true
            }
        }
    ]
});

// create schema for exam details
const HSchema = new mongoose.Schema({
    Room :{
        type: String,
        required: true
    },
    Seats :{
        type: String,
        required: true
    },
    Date :{
        type: String,
        required: true
    },
    Time :{
        type: String,
        required: true
    },
    Exam :{
        type: String,
        required: true
    },
    Faculty :{
        type: String,
        required: true
    },
    Status :{
        type: String
    },
    Hall :[
        {
            Roll:{
                type: String,
                required: true,
            },
            Department :{
                type: String,
                required: true,
            },
            Semester :{
                type: String,
                required: true,
            },
            SeatNo:{
                type: String,
                required: true,
            },
        }
    ]
});

// Generating token for Student authentication
SSchema.methods.generateAuth = async function () {
    try {
        const token = jwt.sign({ _id: this._id.toString() }, process.env.SECRET_KEY);
        this.tokens = this.tokens.concat({ token: token });
        await this.save();
        return token;
    } catch (e) {
        res.render("sorry", {
            message: "Something went wrong",
            hreflink: "/register"
        });
    }
}
// Generating token for Faculty authentication
FSchema.methods.generateAuth = async function () {
    try {
        const token = jwt.sign({ _id: this._id.toString() }, process.env.SECRET_KEY);
        this.tokens = this.tokens.concat({ token: token });
        await this.save();
        return token;
    } catch (e) {
        res.render("sorry", {
            message: "Something went wrong",
            hreflink: "/Falogin"
        });
    }
}

// Generating token for Coordinator authentication
CSchema.methods.generateAuth = async function () {
    try {
        const token = jwt.sign({ _id: this._id.toString() }, process.env.SECRET_KEY);
        this.tokens = this.tokens.concat({ token: token });
        await this.save();
        return token;
    } catch (e) {
        res.render("sorry", {
            message: "Something went wrong",
            hreflink: "/Cologin"
        });
    }
};

// Create a collection for the register page
const SRegister = mongoose.model("Studentlogin", SSchema);
const Clogin = mongoose.model("Coordinatorlogin", CSchema);
const FRegister = mongoose.model("Facultylogin", FSchema);
const ExamHall = mongoose.model("ExamDetails" , HSchema);

module.exports = { SRegister, Clogin, FRegister, ExamHall };
