const Appointment = require("../models/appointmentModel");
const Notification = require("../models/notificationModel");
const User = require("../models/userModel");
const moment=require("moment");
const Doctor=require("../models/doctorModel");
const getallappointments = async (req, res) => {
  try {
    // console.log(doctorId);
    const keyword = req.query.search
      ? {
          $or: [{ userId: req.query.search }, { doctorId: req.query.search }],
        }
      : {};

    const appointments = await Appointment.find(keyword)
  .populate("userId") 
  .populate({
    path: "doctorId",
    populate: {
      path: "userId",
      model: "User",
      select: "firstname lastname" // jo fields chahiye
    }
  });

    return res.send(appointments);
  } catch (error) {
    res.status(500).send("Unable to get apponintments");
  }
};

const bookappointment = async (req, res) => {
  try {
    const appointment = await Appointment({
      date: req.body.date,
      time: req.body.time,
      doctorId: req.body.doctorId,

      userId: req.locals,
    });

    const usernotification = Notification({
      userId: req.locals,
      content: `You booked an appointment with Dr. ${req.body.doctorname} for ${req.body.date} ${req.body.time}`,
    });

    await usernotification.save();

    const user = await User.findById(req.locals);
    const doctor=await Doctor.findById(req.body.doctorId);
    
    
   
    const doctornotification = Notification({
      userId: req.body.doctorId,
      content: `You have an appointment with ${user.firstname} ${user.lastname} on ${req.body.date} at ${req.body.time}`,
    }); 
    await doctornotification.save();
    const result = await appointment.save();
    return res.status(201).send(result);
  } catch (error) {
    console.log("error", error);
    res.status(500).send("Unable to book appointment");
  }
};  
// const bookappointment = async (req, res) => {
//   try {
//     const { doctorId, date, time } = req.body;
//     const userId = req.locals;
//     const doctor = await Doctor.findById(doctorId); 

//     if (!doctor) {
//       return res.status(404).json({ message: 'Doctor not found' });
//     }

//     const existingAppointments = await Appointment.find({
//       doctorId,
//       date,
//       status: { $ne: "Completed" },
//     }); 
//      console.log(existingAppointments);
//     let newTime = moment(`${date} ${time}`, 'YYYY-MM-DD HH:mm');
//     // console.log(newTime);
//     for (const appointment of existingAppointments) {
//       const existingAppointmentTime = moment(`${appointment.date} ${appointment.time}`, 'YYYY-MM-DD HH:mm');
//       const ex2=existingAppointmentTime;
//       // console.log(ex2);
//       const nextAppointmentTime = existingAppointmentTime.add(1, 'hour');
//       // console.log(nextAppointmentTime); 
//       if (moment(newTime).isSame(ex2, 'minute') || moment(newTime).isSame(nextAppointmentTime, 'minute') || moment(newTime).isBetween(ex2, nextAppointmentTime)) {
//         console.log("heloo");
//         return res.status(400).json({ message: 'Doctor is not available on this date and time' });
//     }
//     }

    // Create a new appointment
//     const appointment = new Appointment({
//       doctorId,
//       date,
//       time: newTime.format('HH:mm'),
//       userId,
//     });

//     const result = await appointment.save();

//     res.json({ message: 'Appointment booked successfully' });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Internal Server Error' });
//   }
// };


const completed = async (req, res) => {
  try {
    const alreadyFound = await Appointment.findOneAndUpdate(
      { _id: req.body.appointid },
      { status: "Completed" }
    );

    const usernotification = Notification({
      userId: req.locals,
      content: `Your appointment with ${req.body.doctorname} has been completed`,
    });

    await usernotification.save();

    const user = await User.findById(req.locals);

    const doctornotification = Notification({
      userId: req.body.doctorId,
      content: `Your appointment with ${user.firstname} ${user.lastname} has been completed`,
    });

    await doctornotification.save();

    return res.status(201).send("Appointment completed");
  } catch (error) {
    res.status(500).send("Unable to complete appointment");
  }
};




module.exports = {
  getallappointments,
  bookappointment,
  completed,
};
