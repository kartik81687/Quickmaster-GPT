import { useState, useEffect } from "react";
import { useAccessStore, useAppConfig } from "../store";
import { useAuthStore } from "../store/auth";
import { useWebsiteConfigStore } from "../store/website";

import Locale from "../locales";
import { Path } from "../constant";
import { ErrorBoundary } from "./error";
import { useLocation, useNavigate } from "react-router-dom";
import { showToast } from "../components/ui-lib";
import { useMobileScreen } from "../utils";

// TODO: need change currentUrl
// const currentUrl = "http://localhost:3000/#/login"
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

export function Login() {
  const config = useAppConfig();
  const navigate = useNavigate();
  const authStore = useAuthStore();
  const accessStore = useAccessStore();
  const isMobileScreen = useMobileScreen();
  const { loginPageSubTitle } = useWebsiteConfigStore();

  const [loadingUsage, setLoadingUsage] = useState(false);
  const location = useLocation();
  useEffect(() => {
    // 微信、支付宝登录（wechat or alipay login）
    const params = new URLSearchParams(location.search);
    const authResultStatus = params.get("result_status");
    const authResultMessage = params.get("result_msg");
    if (authResultStatus) {
      if (authResultStatus != "ok") {
        // showToast(String(authResultMessage));
        alert(authResultMessage);
      } else {
        const authResult = params.get("result");
        if (authResult) {
          const loginUser = JSON.parse(authResult);
          // {
          //   "id": "19",
          //   "status": "1",
          //   "user_type": null,
          //   "username": "Alan",
          //   "password": "$2y$13$MAjJ9DOkTxctAGm1IXFwHe1zpNVAXga37fIVZGuftnhVvDMwXgXLK"
          // }
          if (loginUser.id) {
            localStorage.setItem("userId", loginUser.id);
            authStore.login(loginUser.username, loginUser.password);
            navigate(Path.Chat);
          }
        }
      }
    }

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

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [modalState, setModalState] = useState(false);

  function login() {
    if (username === "") {
      showToast(Locale.LoginPage.Toast.EmptyUserName);
      return;
    }
    if (password === "") {
      showToast(Locale.LoginPage.Toast.EmptyPassword);
      return;
    }
    setLoadingUsage(true);
    showToast(Locale.LoginPage.Toast.Logining);

    const data = new FormData();
    data.append("username", username);
    data.append("password", password);
    const requestOptions = {
      method: "POST",
      body: data,
    };

    fetch("https://my.dogai.com/api/login", requestOptions)
      .then((response) => response.json())
      .then((loginResult) => {
        if (loginResult.status) {
          const subscriptionData = new FormData();
          subscriptionData.append("user_id", loginResult.data.id);
          const subsOptions = {
            method: "POST",
            body: subscriptionData,
          };

          fetch("https://my.dogai.com/api/check-subscription", subsOptions)
            .then((response) => response.json())
            .then((result) => {
              if (result.status) {
                const expiryDate = new Date(result.data["expiry date"]);
                const currentDate = new Date();
                currentDate.setHours(0, 0, 0, 0);
                console.log(
                  "qweqwe",
                  !isNaN(result.data.membership) &&
                    expiryDate >= currentDate &&
                    Number(loginResult.data.used_words) <
                      loginResult.data.ai_words_limit,
                );
                if (result.data.membership === "free") {
                  if (
                    Number(loginResult.data.used_words) <
                    loginResult.data.ai_words_limit
                  ) {
                    showToast(Locale.LoginPage.Toast.Success);
                    localStorage.setItem("userId", loginResult.data.id);
                    localStorage.setItem(
                      "ai_words_limit",
                      loginResult.data.ai_words_limit,
                    );
                    navigate(Path.Chat);
                  } else {
                    setModalState(true);
                    console.log("Subscription Expired");
                  }
                } else if (
                  result.data.membership === "trial" ||
                  result.data.membership === "paid"
                ) {
                  if (
                    expiryDate >= currentDate &&
                    Number(loginResult.data.used_words) <
                      loginResult.data.ai_words_limit
                  ) {
                    showToast(Locale.LoginPage.Toast.Success);
                    localStorage.setItem("userId", loginResult.data.id);
                    localStorage.setItem(
                      "ai_words_limit",
                      loginResult.data.ai_words_limit,
                    );
                    navigate(Path.Chat);
                  }
                } else if (
                  !isNaN(result.data.membership) &&
                  expiryDate >= currentDate &&
                  Number(loginResult.data.used_words) <
                    loginResult.data.ai_words_limit
                ) {
                  console.log("Inside else `");
                  showToast(Locale.LoginPage.Toast.Success);
                  localStorage.setItem("userId", loginResult.data.id);
                  localStorage.setItem(
                    "ai_words_limit",
                    loginResult.data.ai_words_limit,
                  );
                  navigate(Path.Chat);
                } else {
                  showToast(Locale.Store.Error);
                }
              }
            });
        } else if (loginResult && loginResult.message) {
          showToast(loginResult.message);
        }
      })
      .finally(() => {
        setLoadingUsage(false);
      });
  }
  function logout() {
    setTimeout(() => authStore.logout(), 500);
  }

  const customStyles = {
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      color: "#000",
      transform: "translate(-50%, -50%)",
      padding: "30px 40px 50px 40px",
      width: "30%",
    },
    overlay: {
      backgroundColor: "rgba(0, 0,0, .5)",
    },
  };

  return (
    <ErrorBoundary>
    <div className="flex flex-row justify-center bg-[url('/images/background.png')] w-full md:h-[1080px] sm:h-screen bg-cover">
      <div className="absolute bg-white w-[790px] h-[847px] border-[1px] top-[124px] rounded-[30px]">
        <div className="relative">
          <img src="/images/group.svg" className="top-[34px] left-[287px] w-[66.07px] h-[48.15px] relative"/>
          <span className="top-[10px] left-[317px] text-lime-600 text-[44px] font-bold font-['Inter'] tracking-tight relative">QuickAsk</span>
        </div>
        <div className="text-neutral-700 text-4xl font-extrabold font-['Mulish'] uppercase top-[37px] left-[136px] relative">LOGIN</div>
        <div className="opacity-80 text-neutral-700 text-base font-medium font-['Mulish'] leading-relaxed top-[37px] left-[136px] relative">After Logging in, you can communicate with AI</div>
        <div className="text-neutral-700 text-lg font-semibold font-['Mulish'] leading-relaxed top-[98px] left-[136px] relative">User name / Email</div>
        <div className="w-[521px] h-[60px] relative top-[98px] left-[136px] bg-[#c6c6c673] rounded-[10px] border border-solid border-[#ffffff3b] backdrop-blur-[20px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(20px)_brightness(100%)]">
          <input className="absolute h-[58px] w-[470px] bg-[#c6c6c600] left-[46px] right-[46px] [font-family:'Mulish-Regular',Helvetica] font-normal text-[#353535] text-[16px] pl-4 tracking-[0] leading-[26px] whitespace-nowrap" placeholder="Sheraz Ahmed" value={username} 
            onChange={(e) => setUsername(e.currentTarget.value)} />
          <img className="absolute w-[15px] h-[19px] top-[20px] left-[20px]" alt="Group" src="/images/user.svg" />
        </div>
        <div className="text-neutral-700 text-lg font-semibold font-['Mulish'] leading-relaxed top-[114px] left-[136px] relative">Password</div>
        <div className="w-[521px] h-[60px] relative top-[114px] left-[136px] bg-[#c6c6c673] rounded-[10px] border border-solid border-[#ffffff3b] backdrop-blur-[20px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(20px)_brightness(100%)]">
          <input className="absolute h-[58px] w-[470px] bg-[#c6c6c600] left-[46px] right-[46px] [font-family:'Mulish-Regular',Helvetica] font-normal text-[#353535] text-[16px] pl-4 tracking-[0] leading-[26px] whitespace-nowrap" placeholder="************" type="password" value={password} 
            onChange={(e) => setPassword(e.currentTarget.value)} />
          <img className="absolute w-[15px] h-[19px] top-[20px] left-[20px]" alt="Group" src="/images/lock.svg" />
          <img className="absolute w-[15px] h-[19px] top-[20px] right-[20px]" alt="Eye-Off" src="/images/eye-off.svg" />
        </div>
        <div className="top-[135px] left-[136px] h-[60px] relative">
          <input type="checkbox" id="checkbox-1" className="absolute top-2"/>
          <span className="left-5 absolute">Remember me</span> 
          <span className="left-[370px] absolute" 
            onClick={() => {
              navigate(Path.ForgetPassword);
            }}> Forgot password? </span> 
        </div>
        <button className="w-[519px] h-[60px] relative top-[160px] left-[136px] bg-[#69a506] rounded-[10px] [font-family:'Mulish-Bold',Helvetica] font-bold text-white text-[18px] text-center tracking-[0] leading-[normal]" 
          onClick={() => {
            if (authStore.token) logout();
            else login();
          }}>
          LOGIN
        </button>
        <div className="w-[519px] h-[60px] relative top-[185px] left-[136px]">
          <button className="w-[239px] h-[60px] mr-[41px] rounded-[10px] border border-solid border-[#353535] [font-family:'Mulish-Bold',Helvetica] font-bold text-[#353535] text-[18px] text-center tracking-[0] leading-[normal]" 
            onClick={() => {
              window.location.href = wechatLoginUrl;
            }} >
            WECHAT LOGIN
          </button>
          <button className="w-[239px] h-[60px] rounded-[10px] border border-solid border-[#353535] [font-family:'Mulish-Bold',Helvetica] font-bold text-[#353535] text-[18px] text-center tracking-[0] leading-[normal]" 
            onClick={() => {
              window.location.href = alipayLoginUrl;
            }} >
            ALIPAY LOGIN
          </button>
        </div>
        <div className="w-[519px] h-[60px] relative top-[245px] left-[136px] text-center">
          <span className="top-0 left-10 [font-family:'Mulish-Medium',Helvetica] font-medium text-[#353535] text-[18px] text-center tracking-[0] leading-[26px] whitespace-nowrap mr-10">
            DON’T HAVE AN ACCOUNT?
          </span>
          <span className="top-0 [font-family:'Mulish-Bold',Helvetica] font-bold text-[#69a506] text-[18px] text-center tracking-[0] leading-[26px] whitespace-nowrap" 
            onClick={() => navigate(Path.Register)}>
            REGISTER
          </span>
        </div>
      </div>
    </div>
      {/* <div className="window-header" data-tauri-drag-region>
        <div className="window-header-title">
          <div className="window-header-main-title">
            {Locale.LoginPage.Title}
          </div>
          <div className="window-header-sub-title">
            {Locale.LoginPage.SubTitle}
          </div>
          <div className="window-header-sub-title">{loginPageSubTitle}</div>
        </div>
        <div className="window-actions">
          {/* <div className="window-action-button">
            <IconButton
              icon={<CloseIcon />}
              onClick={() => navigate(Path.Home)}
              bordered
              title={Locale.LoginPage.Actions.Close}
            />
          </div> }
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
          <ListItem
            title={Locale.LoginPage.Username.Title}
            subTitle={Locale.LoginPage.Username.SubTitle}
          >
            {authStore.token ? (
              <span>{authStore.username}</span>
            ) : (
              <SingleInput
                value={username}
                placeholder={Locale.LoginPage.Username.Placeholder}
                onChange={(e) => {
                  setUsername(e.currentTarget.value);
                  //console.log(e)
                  //accessStore.updateCode(e.currentTarget.value);
                }}
              />
            )}
          </ListItem>

          {authStore.token ? (
            <></>
          ) : (
            <ListItem
              title={Locale.LoginPage.Password.Title}
              subTitle={Locale.LoginPage.Password.SubTitle}
            >
              <PasswordInput
                value={password}
                type="text"
                placeholder={Locale.LoginPage.Password.Placeholder}
                onChange={(e) => {
                  // console.log(e)
                  setPassword(e.currentTarget.value);
                  // accessStore.updateCode(e.currentTarget.value);
                }}
              />
            </ListItem>
          )}

          <ListItem>
            <IconButton
              type="primary"
              block={true}
              text={
                authStore.token
                  ? Locale.LoginPage.Actions.Logout
                  : Locale.LoginPage.Actions.Login
              }
              onClick={() => {
                if (authStore.token) {
                  logout();
                } else {
                  // console.log(username, password);
                  login();
                }
              }}
            />
          </ListItem>

          {authStore.token ? (
            <></>
          ) : (
            <>
              <ListItem>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "10px",
                  }}
                >
                  <IconButton
                    text={Locale.LoginPage.WechatLogin}
                    type="second"
                    onClick={() => {
                      window.location.href = wechatLoginUrl;
                    }}
                  />
                  <IconButton
                    text={Locale.LoginPage.AlipayLogin}
                    type="second"
                    onClick={() => {
                      window.location.href = alipayLoginUrl;
                    }}
                  />
                  <IconButton
                    text={Locale.LoginPage.ForgetPassword}
                    type="second"
                    onClick={() => {
                      navigate(Path.ForgetPassword);
                    }}
                  />
                </div>
              </ListItem>
              <ListItem>
                <IconButton
                  text={Locale.LoginPage.GoToRegister}
                  type="second"
                  onClick={() => {
                    navigate(Path.Register);
                  }}
                />
              </ListItem>
            </>
          )}
        </List>

        <SubAlertModal modalState={modalState} setModalState={setModalState} />
      </div> */}
    </ErrorBoundary>
  );
}
