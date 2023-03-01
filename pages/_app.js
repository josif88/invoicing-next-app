import "antd/dist/antd.css";
import "../styles/globals.css";
import "../styles/style.scss";
import "../styles/override.css";
import { SWRConfig } from "swr";
import arEG from "antd/lib/locale/ar_EG";
import ar from "../language/ar";
import en from "../language/en";

import { useRouter } from "next/router";

import { ConfigProvider } from "antd";

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  let { locale } = router;

  const t = locale === "en" ? en : ar;
  const rtl = locale === "ar";

  pageProps.rtl = rtl;
  pageProps.t = t;
  pageProps.locale = locale;

  return (
    <ConfigProvider direction={rtl ? "rtl" : "ltr"} locale={arEG}>
      <SWRConfig
        value={{
          refreshInterval: 3000,
          fetcher: (resource, init) =>
            fetch(resource, init).then((res) => res.json()),
        }}
      >
        <Component {...pageProps} />;
      </SWRConfig>
    </ConfigProvider>
  );
}

export default MyApp;
