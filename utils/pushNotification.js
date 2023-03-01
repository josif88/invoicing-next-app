import prisma from "./db";
const admin = require("firebase-admin");
let serviceAccount = require("../fustuqa-firebase-adminsdk.json");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export const notifyAdmin = async (order) => {
  let registeredTokens = await prisma.notificationTokens.findMany();

  if (registeredTokens.length === 0) return;

  registeredTokens = registeredTokens.map((item) => {
    return item.notificationToken;
  });

  const message = {
    data: {
      desc: "طلبية جديدة",
      dest: "غير محدد",
      taskId: `15`,
    },
    tokens: registeredTokens,
  };

  try {
    await admin.messaging().sendMulticast(message);
  } catch (e) {
    console.log(e);
  }
};
