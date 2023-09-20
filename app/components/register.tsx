import { useState, useEffect } from "react";
import styles from "./register.module.scss";
import { IconButton } from "./button";
import NextImage from "next/image";
import MaxIcon from "../icons/max.svg";
import MinIcon from "../icons/min.svg";
import { useAccessStore, useAppConfig } from "../store";
import { useAuthStore } from "../store/auth";
import ChatGptIcon from "../icons/chatgpt.png";
import { useWebsiteConfigStore } from "../store/website";
import { SingleInput, Input, List, ListItem, PasswordInput } from "./ui-lib";

import Locale from "../locales";
import { Path } from "../constant";
import { ErrorBoundary } from "./error";
import { useNavigate } from "react-router-dom";
import { showToast } from "../components/ui-lib";
import { useMobileScreen } from "../utils";

export function Register() {
  const config = useAppConfig();
  const navigate = useNavigate();
  const authStore = useAuthStore();
  const accessStore = useAccessStore();
  const isMobileScreen = useMobileScreen();
  const { registerPageSubTitle, registerTypes } = useWebsiteConfigStore();
  const registerType = registerTypes[0];
  const REG_TYPE_ONLY_USERNAME = "OnlyUsername";
  const REG_TYPE_USERNAME_WITH_CAPTCHA = "OnlyUsernameWithCaptcha";
  const REG_TYPE_USERNAME_AND_EMAIL_WITH_CAPTCHA_AND_CODE =
    "UsernameAndEmailWithCaptchaAndCode";

  const [loadingUsage, setLoadingUsage] = useState(false);
  const [captcha, setCaptcha] = useState("");

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

  function generateUUID() {
    var d = new Date().getTime();
    var uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == "x" ? r : (r & 0x3) | 0x8).toString(16);
      },
    );
    return uuid;
  }

  const [captchaId] = useState("register-" + generateUUID());
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [emailCode, setEmailCode] = useState("");
  const [emailCodeSending, setEmailCodeSending] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [comfirmedPassword, setComfirmedPassword] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const authRegister = useAuthStore().register;
  const authGoogle = useAuthStore().loginWithGoogle;
  const currentUrl = "http://chat.dogai.com/#/login";
  const serverUrl = "http://my.dogai.com";
  const wechatRedirectUrl = encodeURIComponent(
    serverUrl + "/3rd-login?client_url=" + encodeURIComponent(currentUrl),
  );
  const alipayRedirectUrl = encodeURIComponent(
    serverUrl +
      "/login?login_mode=alipay_client_login&client_url=" +
      encodeURIComponent(currentUrl),
  );
  // 微信登录页面定义
  const wechatLoginUrl =
    "https://open.weixin.qq.com/connect/qrconnect?appid=wxdb863356ad5f645e&redirect_uri=" +
    wechatRedirectUrl +
    "&response_type=code&scope=snsapi_login&state=wechat|chat";
  // 支付宝登录页面定义
  const alipayLoginUrl =
    "https://openauth.alipay.com/oauth2/publicAppAuthorize.htm?app_id=2021003197615228&scope=auth_user&redirect_uri=" +
    alipayRedirectUrl +
    "&state=alipay|chat";
  function handleClickSendEmailCode() {
    if (email === null || email == "") {
      showToast(Locale.RegisterPage.Toast.EmailIsEmpty);
      return;
    }
    setEmailCodeSending(true);
    authStore
      .sendEmailCode(email)
      .then((resp: any) => {
        if (resp.code == 0) {
          showToast(Locale.RegisterPage.Toast.EmailCodeSent);
          return;
        }
        if (resp.code == 10121) {
          showToast(Locale.RegisterPage.Toast.EmailFormatError);
          return;
        } else if (resp.code == 10122) {
          showToast(Locale.RegisterPage.Toast.EmailCodeSentFrequently);
          return;
        }
        showToast(resp.message);
      })
      .finally(() => {
        setEmailCodeSending(false);
      });
  }

  async function googleAuth() {
    const data = await authGoogle();
  }
  async function register() {
    if (name === null || name === "") {
      showToast(Locale.RegisterPage.Toast.NameEmpty);
      return;
    }
    if (email === null || email == "") {
      showToast(Locale.RegisterPage.Toast.EmailIsEmpty);
      return;
    }
    if (password == null || password.length == 0) {
      showToast(Locale.RegisterPage.Toast.PasswordEmpty);
      return;
    }
    const data = await authRegister(name, email, password);
    if (data.res) navigate(Path.Login);
    else showToast(data.msg);
  }
  function getRegisterCaptcha(captchaId: string) {
    // console.log('getRegisterCaptcha', captchaId)
    fetch("/api/getRegisterCaptcha?captchaId=" + captchaId, {
      method: "get",
    }).then(async (resp) => {
      const result = await resp.json();
      if (result.code != 0) {
        showToast(result.message);
      } else {
        setCaptcha("data:image/jpg;base64," + result.data);
      }
    });
  }
  useEffect(() => {
    getRegisterCaptcha(captchaId);
  }, [captchaId]);

  return (
    <ErrorBoundary>
      <div className="flex flex-row justify-center bg-[url('/images/background.png')] w-full md:h-[1080px] sm:h-screen bg-cover">
        <div className="absolute bg-white dark:bg-neutral-950 w-[790px] h-[966px] border-[1px] top-[55px] rounded-[30px]">
          <div className="relative">
            <img
              src="/images/group.svg"
              className="top-[34px] left-[287px] w-[66.07px] h-[48.15px] relative"
            />
            <span className="top-[10px] left-[317px] text-lime-600 text-[44px] font-bold font-['Inter'] tracking-tight relative">
              QuickAsk
            </span>
          </div>
          <div className="text-neutral-700 text-4xl font-extrabold font-['Mulish'] uppercase top-[37px] left-[136px] relative">
            REGISTER
          </div>
          <div className="opacity-80 text-neutral-700 text-base font-medium font-['Mulish'] leading-relaxed top-[37px] left-[136px] relative">
            Free quota after registeration
          </div>
          <div className="text-neutral-700 text-lg font-semibold font-['Mulish'] leading-relaxed top-[67px] left-[136px] relative">
            Full Name
          </div>
          <div className="w-[521px] h-[60px] relative top-[67px] left-[136px] bg-[#c6c6c673] rounded-[10px] border border-solid border-[#ffffff3b] backdrop-blur-[20px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(20px)_brightness(100%)]">
            <input
              className="absolute h-[58px] w-[470px] bg-[#c6c6c600] left-[46px] right-[46px] [font-family:'Mulish-Regular',Helvetica] font-normal dark:text-white text-[16px] pl-4 tracking-[0] leading-[26px] whitespace-nowrap"
              placeholder="Please enter your full name"
              value={name}
              onChange={(e) => setName(e.currentTarget.value)}
            />
            <img
              className="absolute w-[15px] h-[19px] top-[20px] left-[20px]"
              alt="Group"
              src="/images/user.svg"
            />
          </div>
          <div className="text-neutral-700 text-lg font-semibold font-['Mulish'] leading-relaxed top-[87px] left-[136px] relative">
            Email Address
          </div>
          <div className="w-[521px] h-[60px] relative top-[87px] left-[136px] bg-[#c6c6c673] rounded-[10px] border border-solid border-[#ffffff3b] backdrop-blur-[20px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(20px)_brightness(100%)]">
            <input
              className="absolute h-[58px] w-[470px] bg-[#c6c6c600] left-[46px] right-[46px] [font-family:'Mulish-Regular',Helvetica] font-normal dark:text-white text-[16px] pl-4 tracking-[0] leading-[26px] whitespace-nowrap"
              placeholder="Please enter your email address"
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
            />
            <img
              className="absolute w-[15px] h-[19px] top-[20px] left-[20px]"
              alt="Group"
              src="/images/user.svg"
            />
          </div>
          <div className="text-neutral-700 text-lg font-semibold font-['Mulish'] leading-relaxed top-[107px] left-[136px] relative">
            Password
          </div>
          <div className="w-[521px] h-[60px] relative top-[107px] left-[136px] bg-[#c6c6c673] rounded-[10px] border border-solid border-[#ffffff3b] backdrop-blur-[20px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(20px)_brightness(100%)]">
            <input
              className="absolute h-[58px] w-[470px] bg-[#c6c6c600] left-[46px] right-[46px] [font-family:'Mulish-Regular',Helvetica] font-normal dark:text-white text-[16px] pl-4 tracking-[0] leading-[26px] whitespace-nowrap"
              placeholder="Please enter your password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
            />
            <img
              className="absolute w-[15px] h-[19px] top-[20px] left-[20px]"
              alt="Group"
              src="/images/lock.svg"
            />
            <img
              className="absolute w-[15px] h-[19px] top-[20px] right-[20px]"
              alt="Eye-Off"
              src="/images/eye-off.svg"
            />
          </div>
          <button
            className="w-[519px] h-[60px] relative top-[147px] left-[136px] bg-[#69a506] rounded-[10px] [font-family:'Mulish-Bold',Helvetica] font-bold text-white text-[18px] text-center tracking-[0] leading-[normal]"
            onClick={() => register()}
          >
            REGISTER
          </button>
          <div className="w-[519px] h-[60px] relative top-[172px] left-[136px]">
            <button
              className="w-[519px] h-[60px] mr-[41px] rounded-[10px] border border-solid border-[#353535] [font-family:'Mulish-Bold',Helvetica] font-bold dark:text-white text-[18px] text-center tracking-[0] leading-[normal]"
              onClick={() => {
                googleAuth();
              }}
            >
              GOOGLE LOGIN
            </button>
          </div>
          <div
            className="w-[519px] h-[60px] relative top-[232px] left-[136px] text-center"
            onClick={() => {
              window.location.href = alipayLoginUrl;
            }}
          >
            <span className="top-0 left-10 [font-family:'Mulish-Medium',Helvetica] font-medium dark:text-white text-[18px] text-center tracking-[0] leading-[26px] whitespace-nowrap mr-10">
              ALREADY HAVE AN ACCOUNT?
            </span>
            <span
              className="top-0 [font-family:'Mulish-Bold',Helvetica] font-bold text-[#69a506] text-[18px] text-center tracking-[0] leading-[26px] whitespace-nowrap"
              onClick={() => navigate(Path.Login)}
            >
              LOGIN
            </span>
          </div>
        </div>
      </div>
      {/* <div className="window-header" data-tauri-drag-region>
        <div className="window-header-title">
          <div className="window-header-main-title">
            {Locale.RegisterPage.Title}
          </div>
          <div className="window-header-sub-title">
            {Locale.RegisterPage.SubTitle}
          </div>
          <div className="window-header-sub-title">{registerPageSubTitle}</div>
        </div>
        <div className="window-actions">
          {/* <div className="window-action-button">
            <IconButton
              icon={<CloseIcon />}
              onClick={() => navigate(Path.Home)}
              bordered
              title={Locale.RegisterPage.Actions.Close}
            />
          </div> 
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
      <div className={styles["register"]}>
        <div className={styles["logo"] + " no-dark"}>
          <NextImage src={ChatGptIcon.src} alt="logo" width={50} height={50} />
          <h4 className={styles["logo-title"]}>AI Chat</h4>
        </div>

        <List>
          {/* <ListItem
            title={Locale.RegisterPage.Name.Title}
            subTitle={Locale.RegisterPage.Name.SubTitle}
          >
            <SingleInput
              value={name}
              placeholder={Locale.RegisterPage.Name.Placeholder}
              onChange={(e) => {
                setName(e.currentTarget.value);
              }}
            />
          </ListItem> 

          {registerType ===
          REG_TYPE_USERNAME_AND_EMAIL_WITH_CAPTCHA_AND_CODE ? (
            <>
              <ListItem
                title={Locale.RegisterPage.Username.Title}
                subTitle={Locale.RegisterPage.Username.SubTitle}
              >
                <SingleInput
                  value={email}
                  placeholder={Locale.RegisterPage.Username.Placeholder}
                  onChange={(e) => {
                    setEmail(e.currentTarget.value);
                  }}
                />
              </ListItem>

              <ListItem>
                <IconButton
                  text={
                    emailCodeSending
                      ? Locale.RegisterPage.Toast.EmailCodeSending
                      : Locale.RegisterPage.Toast.SendEmailCode
                  }
                  disabled={emailCodeSending}
                  onClick={() => {
                    handleClickSendEmailCode();
                  }}
                />
              </ListItem>

              <ListItem
                title={Locale.RegisterPage.EmailCode.Title}
                subTitle={Locale.RegisterPage.EmailCode.SubTitle}
              >
                <SingleInput
                  value={emailCode}
                  placeholder={Locale.RegisterPage.EmailCode.Placeholder}
                  onChange={(e) => {
                    setEmailCode(e.currentTarget.value);
                  }}
                />
              </ListItem>
            </>
          ) : (
            <></>
          )}

          <ListItem
            title={Locale.RegisterPage.FullName.Title}
            subTitle={Locale.RegisterPage.FullName.SubTitle}
          >
            <SingleInput
              value={name}
              placeholder={Locale.RegisterPage.FullName.Placeholder}
              onChange={(e) => {
                setName(e.currentTarget.value);
              }}
            />
          </ListItem>

          <ListItem
            title={Locale.RegisterPage.Username.Title}
            subTitle={Locale.RegisterPage.Username.SubTitle}
          >
            <SingleInput
              value={username}
              placeholder={Locale.RegisterPage.Username.Placeholder}
              onChange={(e) => {
                setUsername(e.currentTarget.value);
              }}
            />
          </ListItem>

          <ListItem
            title={Locale.RegisterPage.Email.Title}
            subTitle={Locale.RegisterPage.Email.SubTitle}
          >
            <SingleInput
              value={email}
              placeholder={Locale.RegisterPage.Email.Placeholder}
              onChange={(e) => {
                setEmail(e.currentTarget.value);
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

          {registerType == REG_TYPE_ONLY_USERNAME ||
          registerType == REG_TYPE_USERNAME_WITH_CAPTCHA ? (
            <>
              <ListItem
                title={Locale.RegisterPage.ConfirmedPassword.Title}
                subTitle={Locale.RegisterPage.ConfirmedPassword.SubTitle}
              >
                <PasswordInput
                  value={comfirmedPassword}
                  type="text"
                  placeholder={
                    Locale.RegisterPage.ConfirmedPassword.Placeholder
                  }
                  onChange={(e) => {
                    setComfirmedPassword(e.currentTarget.value);
                  }}
                />
              </ListItem>
            </>
          ) : (
            <></>
          )}

          {registerType == REG_TYPE_USERNAME_WITH_CAPTCHA ? (
            <>
              <ListItem title={Locale.RegisterPage.Captcha}>
                <div>
                  {captcha ? (
                    <img
                      alt={Locale.RegisterPage.Captcha}
                      src={captcha}
                      width="100"
                      height="40"
                      title={Locale.RegisterPage.CaptchaTitle}
                      style={{ cursor: "pointer" }}
                      onClick={(e) => getRegisterCaptcha(captchaId)}
                    />
                  ) : (
                    <></>
                  )}
                </div>
              </ListItem>
              <ListItem
                title={Locale.RegisterPage.CaptchaInput.Title}
                subTitle={Locale.RegisterPage.CaptchaInput.SubTitle}
              >
                <SingleInput
                  value={captchaInput}
                  placeholder={Locale.RegisterPage.CaptchaInput.Placeholder}
                  onChange={(e) => {
                    setCaptchaInput(e.currentTarget.value);
                  }}
                />
              </ListItem>
            </>
          ) : (
            <></>
          )}

          <ListItem>
            <IconButton
              type="primary"
              text={Locale.RegisterPage.Title}
              block={true}
              disabled={loadingUsage}
              onClick={() => {
                console.log(username, password);
                register();
              }}
            />
          </ListItem>

          <ListItem>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
              }}
            >
              <IconButton
                text="手机号注册"
                type="second"
                onClick={() => {
                  navigate(Path.RegisterPhone);
                }}
              />
              <IconButton
                text={Locale.RegisterPage.GoToLogin}
                type="second"
                onClick={() => {
                  navigate(Path.Login);
                }}
              />
            </div>
          </ListItem>
        </List>
      </div> */}
    </ErrorBoundary>
  );
}
