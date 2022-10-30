const nodeMailer = require("nodemailer");
const smtpTransport = require("nodemailer-smtp-transport");

const transporterDetails = smtpTransport({
  host: "mail.mishakoosha.com",
  port: 25,
  secure: false,
  auth: {
    user: "info@mishakoosha.com",
    pass: "mishakoosha.com1!",
  },
  tls: {
    rejectUnauthorized: false,
  },
});

const transporter = nodeMailer.createTransport(transporterDetails);

const options = {
  from: "info@mishakoosha.com",
  to: "info@mehreganwork.ir",
  subject: "Nodemailer Test",
  text: "Simple Test Of Nodemailer",
};

transporter.sendMail(options, (err, info) => {
  if (err) return console.log(err);
  console.log(info);
});
