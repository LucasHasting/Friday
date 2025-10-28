import { Router } from 'express';

// Setup router variable
const router = Router();

//Send an email with a code
router.post('/', (req, res) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
        user: process.env.GOOGLE_EMAIL,
        pass: process.env.GOOGLE_PASSWORD,
        },
        tls: {
            ciphers:'SSLv3'
        }
    });

    try {   
        const mailOptions = {
        from: process.env.GOOGLE_EMAIL,
        to: email,
        subject: 'Login Code',
        text: 'Hello! Your code to login to fridayoclock is: ' + code
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
});

export default router;