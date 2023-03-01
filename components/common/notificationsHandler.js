import { Alert, Button, message, Space } from "antd";
import { useEffect, useState } from "react";
import { registerUserDevice } from "../../utils/registerUserDevice";

import firebase from "../../utils/firebaseInit";

export default function NotificationsHandler(props) {
  const user = props.adminId;

  const [
    browserNotSupportNotificationAlert,
    setBrowserNotSupportNotificationAlert,
  ] = useState({ show: false });
  const [askForNotificationPermission, setAskForNotificationPermission] =
    useState(false);

  const [notificationsBlockedMsg, setNotificationsBlockedMsg] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (
        window.navigator.userAgent.match(/iPad/i) ||
        window.navigator.userAgent.match(/iPhone/i)
      ) {
        setBrowserNotSupportNotificationAlert({
          show: false,
          description: "للاسف هواتف الايفون لا تدعم وصول الاشعارت",
        });
        return;
      } else if (!firebase.messaging.isSupported()) {
        setBrowserNotSupportNotificationAlert({
          show: true,
          description: "المتصفح لديك لا يدعم وصول اشعارات",
        });
      } else if (window.Notification.permission === "default") {
        setAskForNotificationPermission(true);
      } else if (window.Notification.permission === "denied") {
        const doNotShowAgain = localStorage.getItem("hideBlockingMsg");
        if (!doNotShowAgain) setNotificationsBlockedMsg(true);
      }
      if (window.Notification.permission === "granted") {
        if (!checkFcmToken()) setFcmToken(props, (res) => console.log(res));
      }
    }
  }, []);

  return (
    <div>
      {browserNotSupportNotificationAlert.show && (
        <Alert
          message={"انتباه"}
          description={"المتصفح لا يدعم وصول الاشعارات"}
          type="warning"
          showIcon
          closable
        />
      )}
      {askForNotificationPermission && (
        <Alert
          description={
            <div>
              <div style={{ marginBottom: 10 }}>
                لتلقي اشعارات لاخر الطلبات يرجى الضغط على زر السماح
              </div>
              <div className="flex space-between">
                <Button
                  size="small"
                  type="ghost"
                  style={{ width: 75 }}
                  onClick={() => setAskForNotificationPermission(false)}
                >
                  اغلاق
                </Button>

                <Button
                  size="small"
                  type="primary"
                  style={{ width: 75 }}
                  onClick={() => {
                    window.Notification.requestPermission().then((res) => {
                      if (res === "granted") {
                        setFcmToken(props, (res) => {
                          if ((res = "done")) {
                            setAskForNotificationPermission(false);
                            if (user) registerUserDevice(user);
                          }
                        });
                      } else if (res == "default" || res === "denied") {
                        message.info("ينصح السماح بوصول التنبيهات");
                      }
                    });
                  }}
                >
                  سماح
                </Button>
              </div>
            </div>
          }
          type="info"
          action={<Space direction="vertical"></Space>}
          // showIcon
        />
      )}

      {notificationsBlockedMsg && (
        <Alert
          message="انتباه"
          description={
            <div>
              <div style={{ marginBottom: 10 }}>
                لقد تم حظر وصول الاشعارات لن يتم تنبيهك بأخر الطلبات الواصلة
              </div>
              <div className="flex space-between">
                <Button
                  type="ghost"
                  size="small"
                  onClick={() => {
                    doNotShowAgain();
                    setNotificationsBlockedMsg(false);
                  }}
                >
                  اعي ذلك
                </Button>
                <a
                  target="_blank"
                  href="https://pushassist.com/knowledgebase/how-to-enable-or-disable-push-notifications-on-chrome-firefox-safari-b/"
                >
                  <Button type="primary" size="small">
                    السماح
                  </Button>
                </a>
              </div>
            </div>
          }
          type="warning"
          showIcon
        />
      )}
    </div>
  );
}

const setFcmToken = (props, cp) => {
  //prevent safari crash
  if (firebase.messaging.isSupported()) {
    console.log("fire base supported !");
    firebase
      .messaging()
      .getToken({
        vapidKey:
          "BPxnFA4vSQL3oiVfS5ixhSbGOQIdTZRHAnZIsxpyYfu6UDqp-ecjQ2pY-sjWyZPm0UmjbnZWzDrDpJVnwpv4NrM",
      })
      .then((currentToken) => {
        if (currentToken) {
          localStorage.setItem("fcmToken", currentToken);
          message.success(
            "تم السماح بوصول الاشعارات بنجاح سيتم تنبيهك في حال وصول طلب جديد"
          );
          cp("done");
        }
      })
      .catch((err) => {
        console.log("An error occurred while retrieving token. ", err);
        cp("error");
      });
  }
};

const checkFcmToken = () => {
  const fcmToken = localStorage.getItem("fcmToken");
  if (!fcmToken || !fcmToken.length) return false;
  return true;
};

const doNotShowAgain = () => {
  localStorage.setItem("hideBlockingMsg", true);
};
