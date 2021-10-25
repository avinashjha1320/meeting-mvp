const nodemailer = require('nodemailer');
// const  {google }= require('')

// const CLIENT_ID='862720543749-dpdhr7rl4sbhn35qo6ddfnq0csrsq579.apps.googleusercontent.com';
// const CLIENT_SECRET = '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';
// const REFRESH_TOKEN = "1//04Nhy9N9yHe_NCgYIARAAGAQSNwF-L9IrVJslkvuXgWGaaS7BEmlUs6rudJCRomlMabnziPsAiqYkj1VIsRPSI-d7Y-2HImuq6M4"
// const ACCESS_TOKEN = "ya29.a0ARrdaM-7ANEnDifW8JNEuZsqjeOHIyhuNtRhWOL7HTZBw2O0YWJtpkaBdIL2rxcNWJHlYyflyJhhrOvE5dM6FHPsRz2TR6v8vxxUITsniwzYdBYvoZElHYSk_omQu-el909zscuVIgM43jKcGpuveVwsLOGc"

// const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//         type: 'OAuth2',
//         user: 'matchermeet@gmail.com',
//         pass: 'Elephantus@468',
//         clientId: CLIENT_ID,
//         clientSecret: CLIENT_SECRET,
//         refreshToken: REFRESH_TOKEN
//     }
// })

const sendBothMails = (senderName, receiverMail, topic, payload) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user:'matchermeet@gmail.com',
            pass: 'Elephantus@468'
        }
    })
    let mailPayload = {
        from: 'matchermeet@gmail.com',
        to: receiverMail,
        subject: 'A meet link for random talk',
        html: `<p>User <strong>${senderName}</strong> wants to know more about <strong>${topic}</strong><br/>Join through following link:<br/>${payload}</p>`
    }
    
    transporter.sendMail(mailPayload, function(error, data) {
        if (error)
            throw Error(error)
        console.log('Email sent successfully');
        console.log(data);
    })
}

module.exports.sendBothMails = sendBothMails

