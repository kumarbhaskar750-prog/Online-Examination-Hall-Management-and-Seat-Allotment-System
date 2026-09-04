require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const validator = require("validator");
const cookieParser = require("cookie-parser");
require("./db/conn");
const { SRegister, Clogin, FRegister, ExamHall } = require("./model/model");
const Cauth = require("./middleware/Cauth");
const Sauth = require("./middleware/Sauth");
const Fauth = require("./middleware/Fauth");
const hbs = require("handlebars");

const port = process.env.PORT;

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

// Setting path
const staticPath = path.join(__dirname, "../public");

// Serving static files
app.set("view engine", "hbs");
app.use(express.static(staticPath));

// template routing
app.get("/", (req, res) => {
  res.render("home");
});
app.get("/home", (req, res) => {
  res.render("home");
});
app.get("/about", (req, res) => {
  res.render("about");
});
// coordinator get/post request
app.get("/login", (req, res) => {
  res.render("login");
});
app.post("/login", async (req, res) => {
  // user login from database
  try {
    const cid = req.body.cid;

    const data = await Clogin.findOne();

    if (validator.equals(cid, data.Cid)) {
      // generating the token for authorization
      const token = await data.generateAuth();
      console.log(token);

      // setting cookie for the token to respond the client
      res.cookie("CTO", token, {
        expires: new Date(Date.now() + 60000),
        httpOnly: true,
      });

      res.render("addFac");
    } else {
      res.render("sorry", {
        message: "Invalid Details",
        hreflink: "/login",
      });
    }
  } catch (e) {
    res.status(400).render("sorry", {
      message: "Something went wrong.",
      hreflink: "/home",
    });
  }
});

app.get("/Cologin", (req, res) => {
  res.render("Cologin");
});
app.post("/Cologin", async (req, res) => {
  // user login from database
  try {
    const cid = req.body.cid;

    const data = await Clogin.findOne();

    if (validator.equals(cid, data.Cid)) {
      // generating the token for authorization
      const token = await data.generateAuth();
      console.log(token);

      // setting cookie for the token to respond the client
      res.cookie("CTO", token, {
        expires: new Date(Date.now() + 300000),
        httpOnly: true,
      });

      res.render("addFac");
    } else {
      res.render("sorry", {
        message: "Invalid Details",
        hreflink: "/Cologin",
      });
    }
  } catch (e) {
    res.status(400).render("sorry", {
      message: "Something went wrong.",
      hreflink: "/home",
    });
  }
});
app.get("/addFac", Cauth, (req, res) => {
  res.render("addFac");
});
app.post("/addFac", Cauth, async (req, res) => {
  try {

    const phone = req.body.fphno;
    const email = req.body.femail;


    if (validator.isMobilePhone(phone) && validator.isEmail(email)) {
      const registerFac = new FRegister({
        Fid: req.body.fid,
        Name: req.body.fname,
        Email: req.body.femail,
        Phone: req.body.fphno,
        DOB: req.body.fdob,
        Department: req.body.fdept
      });
      const data = await registerFac.save();

      res.redirect("/facDetails");
    } else {
      res.render("sorry", {
        message: "Invalid Details",
        hreflink: "/addfa",
      });
    }
  } catch (e) {
    res.status(400).render("sorry", {
      message: "Something went wrong",
      hreflink: "/addfa",
    });
  }
});

app.get("/facDetails", Cauth, async (req, res) => {

  try {
    const displayFac = await FRegister.find({}).sort({ Fid: 1 });
    // console.log(displayFac);
    res.render("facDetails", {
      regFac: displayFac
    });
    // });
  } catch (e) {
    res.status(400).render("sorry", {
      message: "Something went wrong",
      hreflink: "/home",
    });
  }
});

app.post("/facDetails", Cauth, async (req, res) => {

  try {

    const fid = req.body.fid;

    const displayFac = await FRegister.find({ Fid: fid }).sort({ Fid: 1 });

    // console.log(displayFac);
    res.render("facDetails", {
      regFac: displayFac
    });
    // });
  } catch (e) {
    res.status(400).render("sorry", {
      message: "Something went wrong",
      hreflink: "/facDetails",
    });
  }
});

app.get("/facEdit/:id", Cauth, async (req, res) => {

  try {
    const id = req.params.id;
    const Editfac = await FRegister.findOne({ _id: id });
    // console.log(Editfac);

    res.render("editFac", {
      fid: Editfac.Fid,
      name: Editfac.Name,
      dob: Editfac.DOB,
      email: Editfac.Email,
      phone: Editfac.Phone
    });

  } catch (e) {
    res.status(400).render("sorry", {
      message: "Something went wrong",
      hreflink: "/facDetails",
    });
  }
});

app.post("/editFac", Cauth, async (req, res) => {
  try {
    const fid = req.body.fid;
    const name = req.body.fname;
    const dob = req.body.fdob;
    const email = req.body.femail;
    const phone = req.body.fphno;
    const dept = req.body.fdept;

    const updateFac = await FRegister.updateOne({ Fid: fid }, { $set: { Fid: fid, Name: name, DOB: dob, Email: email, Phone: phone, Department: dept } });

    res.redirect("/facDetails");

  } catch (e) {
    res.status(400).render("sorry", {
      message: "Something went wrong",
      hreflink: "/facDetails",
    });
  }
});

app.get("/facDelete/:id", Cauth, async (req, res) => {

  try {
    const id = req.params.id;
    const deleteFac = await FRegister.deleteOne({ _id: id });
    // console.log(deleteFac);

    res.redirect("/facDetails");

  } catch (e) {
    res.status(400).render("sorry", {
      message: "Something went wrong",
      hreflink: "/facDetails",
    });
  }
});

app.get("/stuDetails", Cauth, async (req, res) => {

  try {
    const displayStu = await SRegister.find({}).sort({ Roll: 1 });
    // console.log(displayStu);

    res.render("stuDetails", {
      regStu: displayStu
    });
    // });
  } catch (e) {
    res.status(400).render("sorry", {
      message: "Something went wrong",
      hreflink: "/stuDetails",
    });
  }
});

app.post("/stuDetails", Cauth, async (req, res) => {

  try {

    const dept = req.body.deptBy;
    const course = req.body.courseBy;
    const semester = req.body.semBy;
    const roll = req.body.rroll;

    const displayStu = await SRegister.find({ $or: [{ $and: [{ Department: dept }, { Course: course }, { Semester: semester }] }, { Roll: roll }] }).sort({ Roll: 1 });

    // console.log(displayStu);
    res.render("stuDetails", {
      regStu: displayStu
    });

  } catch (e) {
    res.status(400).render("sorry", {
      message: "Something went wrong",
      hreflink: "/stuDetails",
    });
  }
});

app.get("/stuEdit/:id", Cauth, async (req, res) => {

  try {
    const id = req.params.id;
    const Editstu = await SRegister.findOne({ _id: id });
    // console.log(Editstu);

    res.render("editStu", {
      roll: Editstu.Roll,
      name: Editstu.Name,
      semester: Editstu.Semester,
      dob: Editstu.DOB,
      phone: Editstu.Phone,
      email: Editstu.Email
    });

  } catch (e) {
    res.status(400).render("sorry", {
      message: "Something went wrong",
      hreflink: "/stuDetails",
    });
  }
});

app.post("/editStu", Cauth, async (req, res) => {
  try {
    const roll = req.body.rroll;
    const name = req.body.rname;
    const dept = req.body.rdept;
    const course = req.body.rcourse;
    const semester = req.body.rsemester;
    const dob = req.body.rdob;
    const phone = req.body.rphno;
    const email = req.body.remail;

    const updateStu = await SRegister.updateOne({ Email: email }, { $set: { Roll: roll, Name: name, Roll: roll, Department: dept, Course: course, Semester: semester, DOB: dob, Email: email, Phone: phone } });
    // console.log(updateStu);
    res.redirect("/stuDetails");

  } catch (e) {
    res.status(400).render("sorry", {
      message: "Something went wrong",
      hreflink: "/stuDetails",
    });
  }
});

app.get("/stuDelete/:id", Cauth, async (req, res) => {

  try {
    const id = req.params.id;
    const deleteStu = await SRegister.deleteOne({ _id: id });
    // console.log(deleteStu);
    res.redirect("/stuDetails");

  } catch (e) {
    res.status(400).render("sorry", {
      message: "Something went wrong",
      hreflink: "/stuDetails",
    });
  }
});

app.get("/examHall00", Cauth, async (req, res) => {

  const getFac = await FRegister.find({}, { Name: 1, _id: 0 }).sort({ Fid: 1 });
  // console.log(getFac);

  res.render('examHall00', {
    facList: getFac
  });
});

app.post("/examHall00", Cauth, async (req, res) => {

  try {

    const room = req.body.eroom;
    const seat = req.body.eseat;
    const date = req.body.edate;
    const time = req.body.etime;
    const name = req.body.ename;
    const dept1 = req.body.dept1;
    const sem1 = req.body.sem1;
    const roll1 = req.body.roll1;
    const roll2 = req.body.roll2;
    const dept2 = req.body.dept2;
    const sem2 = req.body.sem2;
    const roll3 = req.body.roll3;
    const roll4 = req.body.roll4;
    const fac = req.body.efac;

    const getSeat = await ExamHall.findOne({ $or: [{ $and: [{ Room: room }, { Date: date }] }, { $and: [{ Room: room }, { Time: time }] }] });
    // console.log(getSeat);

    if ((getSeat === null)) {
      const hallDetail = new ExamHall({
        Room: room,
        Seats: seat,
        Date: date,
        Time: time,
        Exam: name,
        Faculty: fac
      });
      const data = await hallDetail.save();

      const obj = {};
      const rolldept1 = [];
      const rolldept2 = [];

      for (let i = roll1; i <= roll2; i++) {

        rolldept1.push(i);
      }
      // console.log(rolldept1);

      for (let j = roll3; j <= roll4; j++) {

        rolldept2.push(j);
      }
      // console.log(rolldept2);

      let flag = 0;
      for (let k = 0; k < seat; k++) {

        if (k % 2 == 0) {

          if (rolldept1[k / 2] === undefined) {
            flag = flag + 1;
          } else {

            obj.roll = rolldept1[k / 2];
            obj.dept = dept1;
            obj.sem = sem1;
            obj.seat = k + 1;

            hallDetail.Hall = hallDetail.Hall.concat({ Roll: obj.roll, Department: obj.dept, Semester: obj.sem, SeatNo: obj.seat })
            // console.log(obj);
            const data = await hallDetail.save();
          }
        } else {

          let e = k - 1;
          if (rolldept1[e / 2] === undefined) {
            flag = flag + 1;
          } else {
            obj.roll = rolldept2[e / 2]
            obj.dept = dept2;
            obj.sem = sem2;
            obj.seat = k + 1;

            hallDetail.Hall = hallDetail.Hall.concat({ Roll: obj.roll, Department: obj.dept, Semester: obj.sem, SeatNo: obj.seat })
            // console.log(obj);
            const data = await hallDetail.save();
          }
        }
      }
      if (flag) {
        hallDetail.Status = `${flag} Seats are vacant`;
        const data = await hallDetail.save();
        // console.log(`${flag} seats are vacant`);
        // console.log(" *Please kindly continue the next roll no. from other rooms , if left out. ");
      } else {
        hallDetail.Status = 'Seats are all filled';
        const data = await hallDetail.save();
      }
      res.redirect('/allotList');

    } else if ((room === getSeat.Room && date !== getSeat.Date) || (room === getSeat.Room && time !== getSeat.Time)) {

      const hallDetail = new ExamHall({
        Room: room,
        Seats: seat,
        Date: date,
        Time: time,
        Exam: name
      });
      const data = await hallDetail.save();

      const obj = {};
      const rolldept1 = [];
      const rolldept2 = [];

      for (let i = roll1; i <= roll2; i++) {

        rolldept1.push(i);
      }
      // console.log(rolldept1);

      for (let j = roll3; j <= roll4; j++) {

        rolldept2.push(j);
      }
      // console.log(rolldept2);

      let flag = 0;
      for (let k = 0; k < seat; k++) {

        if (k % 2 == 0) {

          if (rolldept1[k / 2] === undefined) {
            flag = flag + 1;
          } else {

            obj.roll = rolldept1[k / 2];
            obj.dept = dept1;
            obj.sem = sem1;
            obj.seat = k + 1;

            hallDetail.Hall = hallDetail.Hall.concat({ Roll: obj.roll, Department: obj.dept, Semester: obj.sem, SeatNo: obj.seat })
            // console.log(obj);
            const data = await hallDetail.save();
          }
        } else {

          let e = k - 1;
          if (rolldept1[e / 2] === undefined) {
            flag = flag + 1;
          } else {
            obj.roll = rolldept2[e / 2]
            obj.dept = dept2;
            obj.sem = sem2;
            obj.seat = k + 1;

            hallDetail.Hall = hallDetail.Hall.concat({ Roll: obj.roll, Department: obj.dept, Semester: obj.sem, SeatNo: obj.seat })
            // console.log(obj);
            const data = await hallDetail.save();
          }
        }
      }
      if (flag) {
        hallDetail.Status = `${flag} Seats are vacant`;
        const data = await hallDetail.save();
        // console.log(`${flag} seats are vacant`);
        // console.log(" *Please kindly continue the next roll no. from other rooms , if left out. ");
      } else {
        hallDetail.Status = 'Seats are all filled';
        const data = await hallDetail.save();
      }
      res.redirect('/allotList');
    } else {
      res.status(400).render("sorry", {
        message: "Invalid details",
        hreflink: "/examhall00",
      });
    }

  } catch (e) {
    res.status(400).render("sorry", {
      message: "Something went wrong",
      hreflink: "/examhall00",
    });
    // console.log(e);
  }
});

app.get("/allotList", Cauth, async (req, res) => {

  try {
    const displayAllot = await ExamHall.find({}).sort({ Date: 1 });
    res.render("allotList", {
      allotlist: displayAllot
    });
  } catch (e) {
    res.status(400).render("sorry", {
      message: "Something went wrong",
      hreflink: "/allotList",
    });
  }
});

app.post("/allotList", Cauth, async (req, res) => {

  try {

    const room = req.body.sroom;
    const date = req.body.sdate;
    const time = req.body.stime;

    const displayAllot = await ExamHall.find({ $and: [{ Room: room }, { Date: date }, { Time: time }] }).sort({ Date: 1 });

    // console.log(displayAllot);
    res.render("allotList", {
      allotList: displayAllot
    });

  } catch (e) {
    res.status(400).render("sorry", {
      message: "Something went wrong",
      hreflink: "/allotList",
    });
  }

});

app.get("/allotView/:id", Cauth, async (req, res) => {

  try {

    const id = req.params.id;
    const seatView = await ExamHall.findOne({ _id: id });
    // console.log(seatView);

    res.render("ViewSeat", {
      Room: seatView.Room,
      Seat: seatView.Seats,
      Date: seatView.Date,
      Time: seatView.Time,
      Exam: seatView.Exam,
      Faculty: seatView.Faculty,
      status: seatView.Status,
      seatPlan: seatView.Hall
    });
  } catch (e) {
    res.status(400).render("sorry", {
      message: "Something went wrong",
      hreflink: "/allotList",
    });
  }
});

app.get("/allotEdit/:id", Cauth, async (req, res) => {

  try {
    const id = req.params.id;
    const Editseat = await ExamHall.findOne({ _id: id });
    // console.log(Editseat);

    const getFac = await FRegister.find({}, { Name: 1, _id: 0 }).sort({ Fid: 1 });
    // console.log(getFac);

    res.render("editSeat", {
      room: Editseat.Room,
      date: Editseat.Date,
      time: Editseat.Time,
      ename: Editseat.Exam,
      facList: getFac
    });

  } catch (e) {
    res.status(400).render("sorry", {
      message: "Something went wrong",
      hreflink: "/allotList",
    });
  }
});

app.post("/editSeat", Cauth, async (req, res) => {
  try {
    const room = req.body.eroom;
    const date = req.body.edate;
    const time = req.body.etime;
    const ename = req.body.ename;
    const fac = req.body.efac;

    const updateSeat = await ExamHall.updateOne({ Room: room }, { $set: { Date: date, Time: time, Exam: ename, Faculty: fac } });
    // console.log(updateSeat);
    res.redirect("/allotList");

  } catch (e) {
    res.status(400).render("sorry", {
      message: "Something went wrong",
      hreflink: "/allotList",
    });
  }
});

app.get("/allotDelete/:id", Cauth, async (req, res) => {

  try {
    const id = req.params.id;
    const deleteSeat = await ExamHall.deleteOne({ _id: id });
    // console.log(deleteSeat);
    res.redirect("/allotList");

  } catch (e) {
    res.status(400).render("sorry", {
      message: "Something went wrong",
      hreflink: "/allotList",
    });
  }
});

app.get("/Clogout", Cauth, async (req, res) => {
  try {
    // console.log("done");
    req.Cuser.tokens = req.Cuser.tokens.filter((currCookie) => {
      return currCookie.token !== req.Ctoken;
    });

    res.clearCookie("CTO");
    console.log("Logout Successfully");

    await req.Cuser.save();
    res.render("login");
  } catch (e) {
    res.render("sorry", {
      message: "Plz Kindly Login ",
      hreflink: "/login",
    });
    // res.send(e);
  }
});

// faculty get/post request
app.get("/Falogin", (req, res) => {
  res.render("Falogin");
});
app.post("/Falogin", async (req, res) => {
  try {
    const fid = req.body.fid;

    const userdata = await FRegister.findOne({ Fid: fid });


    if (validator.equals(fid, userdata.Fid)) {
      // generating the token for authorization
      const token = await userdata.generateAuth();
      console.log(token);

      // setting cookie for the token to respond the client
      res.cookie("FTO", token, {
        expires: new Date(Date.now() + 300000),
        httpOnly: true,
      });
      const examdata = await ExamHall.findOne({ Faculty: userdata.Name });
      // console.log(examdata);

      if (examdata) {
        res.render("Fapro", {
          examd: examdata,
          name: userdata.Name,
          phno: userdata.Phone,
          email: userdata.Email
        });
      } else {
        res.render("Fapro", {
          hallStatus: " ** Sorry ! Your Hall Ticket is not yet Ready ."
        });
      }
    } else {
      res.render("sorry", {
        message: "Invalid Details",
        hreflink: "/Falogin",
      });
    }
  } catch (e) {
    res.status(400).render("sorry", {
      message: "Something went wrong.",
      hreflink: "/Fapro",
    });
    // console.log(e);
  }
});
app.get("/Fapro", Fauth, (req, res) => {
  res.render("Fapro");
});

app.get("/Falogout", Fauth, async (req, res) => {
  try {
    //   console.log("done");
    req.Fuser.tokens = req.Fuser.tokens.filter((currCookie) => {
      return currCookie.token !== req.Ftoken;
    });

    res.clearCookie("FTO");
    console.log("Logout Successfully");

    await req.Fuser.save();
    res.render("login");
  } catch (e) {
    res.render("sorry", {
      message: "Plz Kindly Login ",
      hreflink: "/home",
    });
  }
});

// Student get/post request
app.get("/register", (req, res) => {
  res.render("register");
});
app.post("/register", async (req, res) => {
  // create new user in database
  try {

    const phone = req.body.rphno;
    const email = req.body.remail;
    const password = req.body.rpass;
    const cpassword = req.body.rcpass;
    const semester = req.body.rsemester;


    if (
      validator.isMobilePhone(phone) &&
      validator.isEmail(email) &&
      validator.equals(password, cpassword)) {

      const registerData = new SRegister({
        Name: req.body.rname,
        Roll: req.body.rroll,
        Department: req.body.rdept,
        Course: req.body.rcourse,
        Semester: req.body.rsemester,
        DOB: req.body.rdob,
        Phone: req.body.rphno,
        Email: req.body.remail,
        Password: req.body.rpass,
        Confirm: req.body.rcpass
      });
      const data = await registerData.save();
      res.render("Sulogin");

    } else {
      res.render("sorry", {
        message: "Invalid Details",
        hreflink: "/register",
      });
      // res.send("invalid");
    }
  } catch (e) {
    res.status(400).render("sorry", {
      message: "Something went wrong",
      hreflink: "/home",
    });
    // res.send(e);
  }
});

app.get("/Sulogin", (req, res) => {
  res.render("Sulogin");
});
app.post("/Sulogin", async (req, res) => {
  // user login from database
  try {
    const roll = req.body.sroll;
    const password = req.body.spass;

    const userdata = await SRegister.findOne({ Roll: roll });
    // console.log(data);

    if (validator.equals(password, userdata.Password)) {
      // generating the token for authorization
      const token = await userdata.generateAuth();
      console.log(token);

      // setting cookie for the token to respond the client
      res.cookie("STO", token, {
        expires: new Date(Date.now() + 300000),
        httpOnly: true,
      });
      const examdata1 = await ExamHall.findOne({ Hall: { $elemMatch: { Roll: roll } } }, { 'Hall.$': 1 });
      // console.log(examdata1);
      const examdata2 = await ExamHall.findOne({ Hall: { $elemMatch: { Roll: roll } } });
      // console.log(examdata2);
      if (examdata2) {
        res.render("Supro", {
          name: userdata.Name,
          room: examdata2.Room,
          stuexam: examdata1.Hall,
          date: examdata2.Date,
          time: examdata2.Time,
          ename: examdata2.Exam,
          email: userdata.Email,
          phno: userdata.Phone,
        });
      } else {
        res.render("Supro", {
          hallStatus: " **Sorry ! Your Hall Ticket is not yet Ready ."
        });
      }

    } else {
      res.render("sorry", {
        message: "Invalid Login Details",
        hreflink: "/Sulogin",
      });
    }
  } catch (e) {
    res.status(400).render("sorry", {
      message: "Invalid Login Details",
      hreflink: "/home",
    });
  }
});
app.get("/Resetpass", (req, res) => {
  res.render("Resetpass");
});
app.post("/Resetpass", async (req, res) => {
  // create new password in database
  try {
    const roll = req.body.rroll;
    const password = req.body.rpass;
    const cpassword = req.body.rcpass;

    const data = await SRegister.updateOne(
      { Roll: roll },
      { $set: { Password: password, Confirm: password } }
    );

    if (validator.equals(cpassword, password)) {
      res.status(201).render("Sulogin");
    } else {
      res.render("sorry", {
        message: "Invalid Details",
        hreflink: "/Sulogin",
      });
    }
  } catch (e) {
    res.status(400).render("sorry", {
      message: "Something went wrong.",
      hreflink: "/home",
    });
  }
});

app.get("/Supro", Sauth, (req, res) => {
  res.render("Supro");
});
app.get("/SeatAllot", Sauth, (req, res) => {
  res.render("SeatAllot");
});
app.get("/Slogout", Sauth, async (req, res) => {
  try {
    // console.log("done");
    req.Suser.tokens = req.Suser.tokens.filter((currCookie) => {
      return currCookie.token !== req.Stoken;
    });

    res.clearCookie("STO");
    console.log("Logout Successfully");

    await req.Suser.save();
    res.render("login");
  } catch (e) {
    res.render("sorry", {
      message: "Plz Kindly Login ",
      hreflink: "/home",
    });
  }
});

// Invalid pages (pages not loaded except the above pages)
app.get("*", (req, res) => {
  res.render("sorry", {
    message: "Page Not Found",
    hreflink: "/",
  });
});

app.listen(port, () => {
  console.log(`Server is running in port ${port}`);
});
