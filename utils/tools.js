const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const phoneNumber = process.env.TWILIO_PHONE_NUMBER;

const client = require("twilio")(accountSid, authToken);

export const sendOtp = async (to, otp, from = phoneNumber) => {
  try {
    let message = await client.messages.create({
      body: `رمز الدخول الى لوحة تحكم مخزن فستقة هو: ${otp}`,
      from,
      to,
    });

    return message;
  } catch (err) {
    return err.message;
  }
};

export const sendLink = async (to, url, from = phoneNumber) => {
  try {
    let message = await client.messages.create({
      body: `قم بانشاء طلبياتك من مخزن فستقة عبر اتباع الرابط: http://${url}`,
      from,
      to,
    });

    return message;
  } catch (err) {
    return err.message;
  }
};

export function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
