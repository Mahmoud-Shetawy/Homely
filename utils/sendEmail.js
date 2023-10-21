// const nodemailer = require( 'nodemailer' );

// // const sgMail = require( '@sendgrid/mail' );

// // sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// // Nodemailer
// const sendEmail = async ( options ) => {
//   // 1) Create transporter ( service that will send email like "gmail","Mailgun", "mialtrap", sendGrid)
//   const transporter = nodemailer.createTransport( {
//     host: process.env.EMAIL_HOST,
//     port: process.env.EMAIL_PORT, // if secure false port = 587, if true port= 465
//     secure: true,
//     auth: {
//       // api_key:process.env.SENDGRID_API_KEY,
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASSWORD,
//     },
//   } );

//   // 2) Define email options (like from, to, subject, email content)
//   // console.log( options.email )
//   const mailOpts = {
//     from: 'E-shop App <mahmoudshetawy791@gmail.com>',
//     to: options.email,
//     subject: options.subject,
//     text: options.message,
//   };

//   // 3) Send email
//   //  await transporter.sendMail( mailOpts );
//   await transporter.sendMail( mailOpts,( err ) => {
//   if ( err ) {
//     console.log( err );
//   } else {
//     console.log( 'Works' )
//   }
// } )
// };

// module.exports = sendEmail;




const nodemailer = require( 'nodemailer' );
const sendGridTransport = require( 'nodemailer-sendgrid-transport' );

const sgMail = require( '@sendgrid/mail' );

const sendEmail = async options => {
  // 1) Create a transporter
  const transporter = nodemailer.createTransport( sendGridTransport( {
    auth: {
      api_key: process.env.SENDGRID_API_KEY
    }
  } )

  );

  // 2) Define the email options
  const mailOptions = {
    from: 'Ecommerce<mahmoudshetawy231@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message
    // html:
  };

  // 3) Actually send the email
  await transporter.sendMail( mailOptions, ( err ,info) => {
  if ( err ) {
    console.log( err );
  } else {
    console.log( 'Works' )
  }
});
};

module.exports = sendEmail;


