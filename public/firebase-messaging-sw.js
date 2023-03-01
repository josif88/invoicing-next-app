importScripts("https://www.gstatic.com/firebasejs/8.4.1/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/8.4.1/firebase-messaging.js");

firebase.initializeApp({
  apiKey: "AIzaSyBTOmwITsmDzfetwcoUhLNEWk_Qp2s88GU",
  authDomain: "fustuqa-erp.firebaseapp.com",
  projectId: "fustuqa-erp",
  storageBucket: "fustuqa-erp.appspot.com",
  messagingSenderId: "514166688110",
  appId: "1:514166688110:web:2846bc8b6ba5f2ba56197f",
  measurementId: "G-SFNGZTQNML",
});

self.addEventListener("notificationclick", function (event) {
  let redirectUrl = "http://fustuqa.com/orders/";
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window" }).then((windowClients) => {
      // Check if there is already a window/tab open with the target URL
      for (var i = 0; i < windowClients.length; i++) {
        var client = windowClients[i];
        // If so, just focus it.
        if (client.url === redirectUrl && "focus" in client) {
          return client.focus();
        }
      }
      // If not, then open the target URL in a new window/tab.
      if (clients.openWindow) {
        return clients.openWindow(redirectUrl);
      }
    })
  );
});

// add this checkup to prevent safari crash
if (firebase.messaging.isSupported()) {
  console.log("Push notifications supported");
  const messaging = firebase.messaging();

  messaging.onBackgroundMessage(function (payload) {
    // Customize notification here
    const notificationTitle = "مخزن فستقة";
    const notificationOptions = {
      body: `تم وصول طلب جديد`,
      icon: "/assets/logo.png",
      data: { ...payload.data },
      actions: [{ action: "open_url", title: "View" }],
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
  });

  self.addEventListener("install", (event) => {
    console.log("SW installed successfully");
  });
}
