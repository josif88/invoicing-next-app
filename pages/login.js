import { Button, Card, Input, message, Space, Typography, Image } from "antd";
import { useEffect, useRef, useState } from "react";
import Countdown, { zeroPad } from "react-countdown";
import Fade from "react-reveal/Fade";
import cookie from "js-cookie";
import { useRouter } from "next/dist/client/router";
import { verifyAuth } from "../utils/valdations";

const Login = (props) => {
  const [phone, setPhone] = useState("");
  const [showPhone, setShowPhone] = useState(true);
  const [resend, setResend] = useState(false);
  const countDownRef = useRef(null);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdownInterval, setCountdownInterval] = useState(120000);
  const router = useRouter();

  const handleLogin = () => {
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phoneNumber: phone,
      }),
    };

    setLoading(true);

    fetch("/api/login/otp", options)
      .then((response) => response.json())
      .then((result) => {
        console.log(result);

        if (result.status === "error") {
          result.message.map((m) => message.error(m));
          setPhone("");
          setLoading(false);
        }

        if (result.status === "ok") {
          setShowPhone(false);
          setResend(false);
          countDownRef.current.start();
          localStorage.setItem("reference", result.data.reference);
          setLoading(false);
        }
      })
      .catch(console.log);
  };

  const submitOtp = () => {
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        reference: localStorage.getItem("reference"),
        otp: password,
      }),
    };

    fetch("/api/login/otpSubmit", options)
      .then((response) => response.json())
      .then((result) => {
        if (result.status === "error") {
          result.message.map((m) => message.error(m));
          setLoading(false);
          if (result.redirect) {
            router.replace(result.redirect);
          }
        }

        if (result.status === "ok") {
          setLoading(false);
          cookie.set("token", result.data.token, { expires: 30 });
          router.push("/");
        }
      });
  };

  const renderer = ({ minutes, seconds }) => (
    <span>
      يمكنك اعادة ارسال الرمز بعد {zeroPad(minutes)}:{zeroPad(seconds)}
    </span>
  );

  return (
    <div className="container rtl">
      <div className="center">
        {showPhone && (
          <Card style={{ minWidth: 325 }}>
            <Space size="large" style={{ width: "100%" }} direction="vertical">
              <Space className="center-element" align="center">
                <Image src="assets/logo.png" width={25} preview={false} />
                <Typography.Title level={3}>مخزن فستقة</Typography.Title>
              </Space>

              <Input
                type="tel"
                placeholder={props.t.login.phone_number}
                onChange={(e) => setPhone(e.target.value)}
                value={phone}
              />

              <Button
                loading={loading}
                type="primary"
                onClick={handleLogin}
                block
              >
                ارسل كلمة السر
              </Button>
            </Space>
          </Card>
        )}
        {!showPhone && (
          <Fade left>
            <Card style={{ minWidth: 325 }}>
              <Space
                size="large"
                style={{ width: "100%" }}
                direction="vertical"
              >
                <div className="center-element">
                  <Typography.Paragraph>{`تم ارسال رسالة نصية تتضمن كلمة سر مؤقته الى رقم الهاتف: ${phone}`}</Typography.Paragraph>
                </div>

                <Input
                  type="number"
                  pattern="\d*"
                  autocomplete="one-time-code"
                  placeholder={props.t.login.password}
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                />
                <Countdown
                  ref={countDownRef}
                  renderer={renderer}
                  date={Date.now() + countdownInterval}
                  onComplete={() => {
                    setResend(true);
                  }}
                  onTick={(tick) => {
                    setCountdownInterval(tick.total);
                  }}
                />
                <Space
                  align="center"
                  wrap={true}
                  style={{ width: "100%" }}
                  className="space-between"
                >
                  <Button type="primary" onClick={submitOtp}>
                    دخول
                  </Button>
                  <Button
                    disabled={!resend}
                    onClick={() => {
                      handleLogin();
                    }}
                  >
                    اعادة ارسال
                  </Button>
                </Space>

                <Button
                  block
                  onClick={() => {
                    setShowPhone(true);
                    setResend(false);
                  }}
                >
                  تغيير رقم الهاتف
                </Button>
              </Space>
            </Card>
          </Fade>
        )}
      </div>
    </div>
  );
};

export const getServerSideProps = async ({ req, res }) => {
  let payload = verifyAuth(req.cookies.token);
  if (payload) {
    res.writeHead(302, {
      Location: "/",
    });
    res.end();
  }

  return { props: { token: req.cookies.token || null } };
};

export default Login;
