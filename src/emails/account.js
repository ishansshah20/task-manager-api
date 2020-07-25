const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'ishansshah2020@gmail.com',
        subject: 'Welcome to the application',
        text: `Welcome to the app, ${name}. Let me know if you need any help.`
    }).catch((e) => {
        console.log(e.message)
    })
}

const sendCancelEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'ishansshah2020@gmail.com',
        subject: 'Goodbye!',
        text: `Sorry to see you go, ${name}. Let me know if you need any help.`
    }).catch((e) => {
        console.log(e.message)
    })
}

module.exports = {
    sendWelcomeEmail,
    sendCancelEmail
}