import firebase from "./firebaseInit";

export async function registerUserDevice(user, result) {
  if (!firebase.messaging.isSupported()) return;

  if (user) {
    if (typeof window === "undefined") {
      return;
    } else if (window.Notification.permission != "granted") {
      return;
    }

    const fcmToken = await firebase.messaging().getToken({
      vapidKey:
        "BPxnFA4vSQL3oiVfS5ixhSbGOQIdTZRHAnZIsxpyYfu6UDqp-ecjQ2pY-sjWyZPm0UmjbnZWzDrDpJVnwpv4NrM",
    });

    if (fcmToken) {
      console.log(fcmToken);
      fetch(`/api/admin/registerNotificationToken`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          notificationToken: fcmToken,
        }),
      });
    } else {
      console.log(`
        fcmToken not found
        registering user device failed`);
    }
  } else {
    console.log("user not registered yet");
  }
}
