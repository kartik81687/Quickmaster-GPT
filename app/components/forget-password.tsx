import { useState, useEffect } from "react";
import { IconButton } from "./button";
import MaxIcon from "../icons/max.svg";
import MinIcon from "../icons/min.svg";
import NextImage from "next/image";
import { useAccessStore, useAppConfig } from "../store";
import ChatGptIcon from "../icons/chatgpt.png";
import { SingleInput, List, ListItem, PasswordInput } from "./ui-lib";

import Locale from "../locales";
import { Path } from "../constant";
import { ErrorBoundary } from "./error";
import { useLocation, useNavigate } from "react-router-dom";
import { showToast } from "../components/ui-lib";
import { useMobileScreen } from "../utils";

export function ForgetPassword() {
  const config = useAppConfig();
  const navigate = useNavigate();
  const isMobileScreen = useMobileScreen();

  const [loadingUsage, setLoadingUsage] = useState(false);
  const [captchaInput, setCaptchaInput] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [phoneCodeCountDown, setPhoneCodeCountDown] = useState(60);
  const [phoneCodeBtnText, setPhoneCodeBtnText] = useState("发送验证码");
  const [emailCodeSending, setEmailCodeSending] = useState(false);

  useEffect(() => {
    const keydownEvent = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        navigate(Path.Home);
      }
    };
    document.addEventListener("keydown", keydownEvent);
    return () => {
      document.removeEventListener("keydown", keydownEvent);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 发送验证码
  function handleClickSendPhoneCode() {
    if (phone === null || phone == "") {
      showToast("请输入手机号");
      return;
    }

    const pattern = /^1[3-9]\d{9}$/;
    if (!pattern.test(phone)) {
      showToast("手机号格式不正确");
      return;
    }

    setEmailCodeSending(true);

    // 发送请求
    const data = new FormData();
    data.append("mobile", phone);
    data.append("type", "2");
    const requestOptions = {
      method: "POST",
      body: data,
    };
    fetch("//my.dogai.com/api/sendSms", requestOptions)
      .then((response) => response.json())
      .then((result: any) => {
        if (result.code != 200) {
          showToast(result.msg);
          setEmailCodeSending(false);
        } else {
          let _phoneCodeCountDown = 60;
          var codeSendTimer = setInterval(() => {
            if (_phoneCodeCountDown > 1) {
              _phoneCodeCountDown -= 1;
              console.log("减", _phoneCodeCountDown);
              setPhoneCodeBtnText(_phoneCodeCountDown + "秒后重试");
            } else {
              setEmailCodeSending(false);
              setPhoneCodeBtnText("发送验证码");
              clearInterval(codeSendTimer);
            }
            setPhoneCodeCountDown(_phoneCodeCountDown);
          }, 1000);
        }
      })
      .catch(() => {
        showToast("发送失败");
        setEmailCodeSending(false);
      });
  }

  function submit() {
    if (phone === null || phone == "") {
      showToast("请输入手机号");
      return;
    }
    const pattern = /^1[3-9]\d{9}$/;
    if (!pattern.test(phone)) {
      showToast("手机号格式不正确");
      return;
    }
    if (captchaInput === null || captchaInput == "") {
      showToast("请输入验证码");
      return;
    }
    if (password === "") {
      showToast(Locale.LoginPage.Toast.EmptyPassword);
      return;
    }
    setLoadingUsage(true);
    showToast("修改中");

    const data = new FormData();
    data.append("phone", phone);
    data.append("captcha", captchaInput);
    data.append("password", password);
    const requestOptions = {
      method: "POST",
      body: data,
    };
    fetch("//my.dogai.com/api/reset-phone-password", requestOptions)
      .then((response) => response.json())
      .then((result) => {
        if (result.status) {
          showToast("修改成功");
          navigate(Path.Login);
        } else if (result && result.message) {
          showToast(result.message);
        }
      })
      .finally(() => {
        setLoadingUsage(false);
      });
  }

  return (
    <ErrorBoundary>
      <div className="window-header" data-tauri-drag-region>
        <div className="window-header-title">
          <div className="window-header-main-title">
            {Locale.ForgetPasswordPage.Title}
          </div>
          <div className="window-header-sub-title">
            {Locale.ForgetPasswordPage.SubTitle}
          </div>
        </div>
        <div className="window-actions">
          {!isMobileScreen && (
            <div className="window-action-button">
              <IconButton
                icon={config.tightBorder ? <MinIcon /> : <MaxIcon />}
                bordered
                onClick={() => {
                  config.update(
                    (config) => (config.tightBorder = !config.tightBorder),
                  );
                }}
              />
            </div>
          )}
        </div>
      </div>
      <div className={styles["login"]}>
        <div className={styles["logo"] + " no-dark"}>
          <NextImage src={ChatGptIcon.src} alt="logo" width={50} height={50} />
          <h4 className={styles["logo-title"]}>AI Chat</h4>
        </div>

        <List>
          <ListItem title="手机号">
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <SingleInput
                value={phone}
                placeholder="请输入中国手机号"
                onChange={(e) => {
                  setPhone(e.currentTarget.value);
                }}
              />
              <IconButton
                disabled={emailCodeSending}
                text={phoneCodeBtnText}
                onClick={() => {
                  handleClickSendPhoneCode();
                }}
              />
            </div>
          </ListItem>

          <ListItem title="验证码">
            <SingleInput
              value={captchaInput}
              placeholder="请输入短信验证码"
              onChange={(e) => {
                setCaptchaInput(e.currentTarget.value);
              }}
            />
          </ListItem>

          <ListItem
            title={Locale.RegisterPage.Password.Title}
            subTitle={Locale.RegisterPage.Password.SubTitle}
          >
            <PasswordInput
              value={password}
              type="text"
              placeholder={Locale.RegisterPage.Password.Placeholder}
              onChange={(e) => {
                setPassword(e.currentTarget.value);
              }}
            />
          </ListItem>

          <ListItem>
            <IconButton
              type="primary"
              block={true}
              text="重置"
              onClick={() => {
                submit();
              }}
            />
          </ListItem>
        </List>
      </div>
    </ErrorBoundary>
  );
}
