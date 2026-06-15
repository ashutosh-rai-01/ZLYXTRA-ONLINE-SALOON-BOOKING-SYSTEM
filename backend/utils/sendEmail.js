const nodemailer = require('nodemailer');

/**
 * Send an email using Nodemailer. 
 * Supports dynamic SMTP configurations from environment variables, 
 * with a beautiful console mockup logger fallback in development.
 */
const sendEmail = async (options) => {
    // Check if SMTP environment variables are fully configured
    const isConfigured = 
        process.env.SMTP_HOST && 
        process.env.SMTP_PORT && 
        process.env.SMTP_USER && 
        process.env.SMTP_PASS;

    if (!isConfigured) {
        console.log('\n============================================================');
        console.log('✉️  MOCK EMAIL DISPATCHED (SMTP NOT CONFIGURABLE YET)');
        console.log(`To:      ${options.email}`);
        console.log(`Subject: ${options.subject}`);
        console.log('------------------------------------------------------------');
        // Strip out HTML tags for clear console log readability
        const plainText = options.html ? options.html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() : options.message;
        console.log(plainText);
        console.log('============================================================\n');
        return { success: true, mock: true };
    }

    const port = parseInt(process.env.SMTP_PORT, 10);
    // Create SMTP transporter
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: port,
        secure: port === 465, // true for 465, false for other ports (e.g., 587)
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    const mailOptions = {
        from: `"${process.env.FROM_NAME || 'ZLYXTRA Salon'}" <${process.env.FROM_EMAIL || 'no-reply@zlyxtra.com'}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✉️ Email successfully sent to ${options.email}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
};

module.exports = sendEmail;
