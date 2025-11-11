import 'dotenv/config';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GOOGLE_EMAIL,
      pass: process.env.GOOGLE_APP_PASSWORD,
    },
    tls: {}
  });

try {
   
    const mailOptions = {
      from: process.env.GOOGLE_EMAIL,
      to: 'REPLACE_ME - an email address',
      subject: 'CIS 486 MEGA POP QUIZ POINTZZZZ',
      text: 'Hi Barry.'
    };

    
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.error('Error:', error);
      } else {
        console.log('Email sent:', info.response)
      }
    });
 
  } catch (error) {
    console.error('Error in /register:', error);
    res.status(500).send("Internal Server Error");
  } 