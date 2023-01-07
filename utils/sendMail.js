import { createTransport } from "nodemailer";
import nodeoutlook from "nodejs-nodemailer-outlook";

// export const sendMail = async(email,subject,text)=>{
//     const transport = createTransport({
//         host: process.env.MAIL_HOST,
//         port : process.env.MAIL_PORT,
//         auth : {
//             user: process.env.MAIL_USER,
//             pass: process.env.MAIL_PASS,
//         }
//     });

//     await transport.sendMail({
//         from: process.env.MAIL_USER,
//         to : email,
//         subject,
//         text
//     })
// }

export const sendMail = (email, subject, text) => {
  nodeoutlook.sendEmail({
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    },
    from: process.env.MAIL_USER,
    to : email,
    subject: subject,
    text: text,
    replyTo: process.env.MAIL_USER,
    onError: (e) => console.log(e),
    onSuccess: (i) => console.log(i),
  });
};
