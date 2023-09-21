import { useTheme } from "next-themes";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/auth";

export function FirstPage() {
  const navigate = useNavigate();
  const authStore = useAuthStore();
  const authSign = () => {
    authStore.session ? authStore.logout() : navigate("login");
  };
  const nextTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };
  const { systemTheme, theme, setTheme } = useTheme();
  return (
    <>
      <div className="fixed h-16 bg-white flex w-full justify-between z-10 top-0 dark:bg-gradient-to-r dark:from-neutral-900 dark:to-neutral-600 dark:blur-0">
        <div>
          <img src="/images/group.svg" className="top-4 left-24 relative w-8" />
          <span className="relative top-[6px] left-[105px] text-lime-600 text-[20px] font-bold font-['Inter'] tracking-tight">
            QuikAsk
          </span>
        </div>
        <div className="flex justify-between w-1/4">
          <div className="w-14 h-9 relative top-5">
            <div className="left-0 top-0 absolute text-neutral-700 text-l font-bold font-['Mulish'] w-full text-center cursor-pointer dark:text-white">
              Home
            </div>
            <div className="w-2 h-2 left-[24.32px] top-[29.49px] absolute bg-neutral-700 rounded-full dark:bg-white"></div>
          </div>
          <div className="w-14 h-9 relative top-5">
            <div
              className="opacity-70 left-0 top-0 absolute text-neutral-700 text-l font-bold font-['Mulish'] w-full text-center cursor-pointer dark:text-white"
              onClick={() => navigate("chat")}
            >
              Chat
            </div>
          </div>
          <div className="w-16 h-9 relative top-5">
            <div
              className="left-0 top-0 absolute text-lime-600 text-l font-bold font-['Mulish'] w-full text-center cursor-pointer"
              onClick={authSign}
            >
              {authStore.session ? "Sign Out" : "Sign In"}
            </div>
          </div>
          <div className="w-14 h-9 relative top-5">
            <div
              className="left-0 top-0 absolute text-neutral-700 text-l font-bold font-['Mulish'] w-full text-center cursor-pointer"
              onClick={nextTheme}
            >
              <img
                src={
                  theme === "dark"
                    ? "images/dark-white.svg"
                    : "images/light-green.svg"
                }
              />
            </div>
          </div>
        </div>
      </div>
      <div>
        <div className="h-[400px] relative top-20">
          <div className="flex h-2/5 w-4/5 ml-28 justify-between">
            <div className="w-96 pt-14">
              <span className="text-neutral-700 text-4xl font-black font-['Mulish'] capitalize leading-10 dark:text-white">
                Use QuikAsk to
                <br />
              </span>
              <span className="text-lime-600 bg-green-600 bg-opacity-5 text-4xl font-black font-['Mulish'] capitalize leading-10">
                Simplify
              </span>
              <span className="text-zinc-300 text-4xl font-black font-['Mulish'] capitalize leading-10">
                {" "}
              </span>
              <span className="text-neutral-700 text-4xl font-black font-['Mulish'] capitalize leading-10 dark:text-white">
                Your Life
              </span>
            </div>
            <div className="w-96 relative">
              <div className="w-32 h-32 left-0 top-8 absolute bg-lime-200 rounded-full border"></div>
              <div className="w-32 h-32 left-0 top-8 absolute opacity-50 bg-lime-200 rounded-full border blur-3xl"></div>
              <div className="w-28 h-28 left-[6px] top-[38px] absolute rounded-full border border-black"></div>
              <div className="left-[12px] top-16 absolute text-center text-neutral-900 text-2xl font-extrabold font-['Mulish'] leading-7">
                Explore
                <br />
                Our Chat
              </div>
            </div>
          </div>
          <div className="flex h-2/5 pl-28 justify-between">
            <div className="w-96 pt-9">
              <div className="w-96">
                <span className="text-lime-600 font-[13px] font-['Mulish'] leading-10">
                  QuikAsk
                </span>
                <span className="text-neutral-700 font-[13px] font-['Mulish'] leading-10">
                  {" "}
                </span>
                <span className="text-neutral-700 font-[13px] font-['Mulish'] leading-10 dark:text-neutral-300">
                  , have a natural conversation with AI that feels surprisingly
                  human. Interacting with artificial intelligence used to feel
                  difficult, overwhelming, and a bit robotic.
                </span>
              </div>
            </div>
            <div className="relative w-[500px] -top-44">
              <img src="images/robot-hand.png" className="-top-60" />
            </div>
          </div>
          <div className="flex h-1/5 w-full justify-between pt-8">
            <div className="w-52 h-32 relative">
              <div className="w-52 h-20 left-0 top-0 absolute bg-gradient-to-b from-zinc-300 to-zinc-0 rounded-tl-2xl rounded-tr-2xl backdrop-blur-lg dark:from-neutral-900 dark:to-zinc-900"></div>
              <div className="w-52 h-12 left-[36.44px] top-[10px] absolute justify-start items-start gap-3.5 inline-flex">
                <div className="text-neutral-700 font-[12px] font-['Mulish'] capitalize grid grid-cols-2 content-center dark:text-white">
                  <span className="w-32 items-center flex">Chat GPT</span>{" "}
                  <img src="images/right-arrow.svg" className="w-8" />
                </div>
              </div>
            </div>
            <div className="w-52 h-20 relative">
              <div className="w-52 h-16 left-0 top-4 absolute bg-gradient-to-b from-zinc-300 to-zinc-0 rounded-tl-2xl rounded-tr-2xl backdrop-blur-lg dark:from-neutral-900 dark:to-zinc-900"></div>
              <div className="w-52 h-12 left-[36.44px] top-[26px] absolute justify-start items-start gap-3.5 inline-flex">
                <div className="text-neutral-700 font-[12px] font-['Mulish'] capitalize grid grid-cols-2 content-center dark:text-white">
                  <span className="w-32 items-center flex">Google Bard</span>{" "}
                  <img src="images/right-arrow.svg" className="w-8" />
                </div>
              </div>
            </div>
            <div className="w-52 h-16 relative">
              <div className="w-52 h-12 left-0 top-8 absolute bg-gradient-to-b from-lime-600 to-lime-0 rounded-tl-2xl rounded-tr-2xl backdrop-blur-lg dark:from-neutral-900 dark:to-zinc-900"></div>
              <div className="w-52 h-12 left-[36.44px] top-[42px] absolute justify-start items-start gap-3.5 inline-flex">
                <div className="text-neutral-700 font-[12px] font-['Mulish'] capitalize grid grid-cols-2 content-center dark:text-white">
                  <span className="w-32 items-center flex">QuikAsk Chat</span>{" "}
                  <img src="images/right-arrow.svg" className="w-8" />
                </div>
              </div>
            </div>
            <div className="w-52 h-32 relative">
              <div className="w-52 h-20 left-0 top-4 absolute bg-gradient-to-b from-zinc-300 to-zinc-0 rounded-tl-2xl rounded-tr-2xl backdrop-blur-lg dark:from-neutral-900 dark:to-zinc-900"></div>
              <div className="w-52 h-12 left-[36.44px] top-[26px] absolute justify-start items-start gap-3.5 inline-flex">
                <div className="text-neutral-700 font-[12px] font-['Mulish'] capitalize grid grid-cols-2 content-center dark:text-white">
                  <span className="w-32 items-center flex">Duck Duck Go</span>{" "}
                  <img src="images/right-arrow.svg" className="w-8" />
                </div>
              </div>
            </div>
            <div className="w-52 h-32 relative">
              <div className="w-52 h-20 left-0 top-0 absolute bg-gradient-to-b from-zinc-300 to-zinc-0 rounded-tl-2xl rounded-tr-2xl backdrop-blur-lg dark:from-neutral-900 dark:to-zinc-900"></div>
              <div className="w-40 h-12 left-[36.44px] top-[10px] absolute items-start gap-3.5 inline-flex justify-between">
                <div className="text-neutral-700 font-[12px] font-['Mulish'] capitalize grid grid-cols-2 content-center dark:text-white">
                  <span className="w-32 items-center flex">Anthropic Ai</span>{" "}
                  <img src="images/right-arrow.svg" className="w-8" />
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-center pt-20">
            <div className="w-full h-44 relative">
              <div className="w-full top-0 absolute flex justify-center text-center text-neutral-700 text-3xl font-bold font-['Mulish'] capitalize leading-10 dark:text-white">
                <img src="/images/spiral-arrow-left.svg" />
                For All Kind of Creators
                <img src="/images/spiral-arrow-right.svg" />
              </div>
              <div className="pl-80 pr-80 w-full left-0 top-[60px] absolute text-center text-neutral-700 font-[12px] font-['Mulish'] leading-7 dark:text-neutral-300">
                Introducing a revolutionary AI partner for creators across the
                globe—a groundbreaking tool designed to transform the way we
                bring our creative ideas to life. Unleash your artistic
                abilities as you explore a world of limitless possibilities. Say
                goodbye to obstacles and let this remarkable AI companion pave
                the way to a new era of boundless creation.
              </div>
            </div>
          </div>
          <div className="grid pt-20 grid-cols-2">
            <div className="col-span-1 w-96 h-96 relative">
              <div className="w-96 h-80 left-0 top-[50px] absolute">
                <div className="w-96 h-80 left-[165px] top-0 absolute bg-gradient-to-b from-gray-200 to-gray-50 rounded-2xl shadow border border-green-500 dark:from-zinc-800 dark:to-zinc-900"></div>
                <div className="w-12 h-12 left-[347.50px] top-[292.80px] absolute origin-top-left -rotate-90"></div>
                <div className="w-96 h-36 left-[165.50px] top-[85px] absolute">
                  <div className="left-[125px] top-0 absolute text-center text-neutral-700 text-3xl font-bold font-['Mulish'] capitalize leading-9 dark:text-white">
                    ChatGPT - 4
                  </div>
                  <div className="w-96 left-0 top-[60px] absolute text-center text-neutral-700 text-base font-semibold font-['Mulish'] leading-relaxed dark:text-white">
                    The next-generation AI language model with even deeper
                    understanding and more human-like conversations.
                  </div>
                </div>
              </div>
              <div className="w-24 h-24 left-[322.50px] top-0 absolute">
                <div className="w-24 h-24 left-0 top-0 absolute bg-lime-600 rounded-2xl shadow grid content-center justify-center">
                  {" "}
                  <img src="/images/openai-lime.svg" className="w-24" />{" "}
                </div>
              </div>
            </div>
            <div className="col-span-1 w-96 h-96 relative">
              <div className="w-96 h-80 left-0 top-[50px] absolute">
                <div className="w-96 h-80 left-[165px] top-0 absolute bg-gradient-to-b from-gray-200 to-gray-50 rounded-2xl shadow border border-zinc-300 dark:from-zinc-800 dark:to-zinc-900"></div>
                <div className="w-12 h-12 left-[347.50px] top-[292.80px] absolute origin-top-left -rotate-90"></div>
                <div className="w-96 h-36 left-[165.50px] top-[85px] absolute">
                  <div className="left-[125px] top-0 absolute text-center text-neutral-700 text-3xl font-bold font-['Mulish'] capitalize leading-9 dark:text-white">
                    Google Bard
                  </div>
                  <div className="w-80 left-8 top-[60px] absolute text-center text-neutral-700 text-base font-semibold font-['Mulish'] leading-relaxed dark:text-neutral-300">
                    AI-powered chatbot tool designed by Google to simulate human
                    conversations using natural language processing and machine
                    learning.
                  </div>
                </div>
              </div>
              <div className="w-24 h-24 left-[322.50px] top-0 absolute">
                <div className="w-24 h-24 left-0 top-0 absolute bg-zinc-300 rounded-2xl shadow grid content-center justify-center">
                  {" "}
                  <img src="/images/google-black.svg" className="w-10" />{" "}
                </div>
              </div>
            </div>
            <div className="col-span-1 w-96 h-96 relative">
              <div className="w-96 h-80 left-0 top-[50px] absolute">
                <div className="w-96 h-80 left-[165px] top-0 absolute bg-gradient-to-b from-gray-200 to-gray-50 rounded-2xl shadow border border-zinc-300 dark:from-zinc-800 dark:to-zinc-900"></div>
                <div className="w-12 h-12 left-[347.50px] top-[292.80px] absolute origin-top-left -rotate-90"></div>
                <div className="w-96 h-36 left-[165.50px] top-[85px] absolute">
                  <div className="left-[80px] top-0 absolute text-center text-neutral-700 text-3xl font-bold font-['Mulish'] capitalize leading-9 dark:text-white">
                    Anthropic Claude
                  </div>
                  <div className="w-80 left-8 top-[60px] absolute text-center text-neutral-700 text-base font-semibold font-['Mulish'] leading-relaxed dark:text-neutral-300">
                    QuikAsk have integrated with claude it can do things like
                    create summaries, write code, translate text, and more.
                  </div>
                </div>
              </div>
              <div className="w-24 h-24 left-[322.50px] top-0 absolute">
                <div className="w-24 h-24 left-0 top-0 absolute bg-zinc-300 rounded-2xl shadow grid content-center justify-center">
                  {" "}
                  <img
                    src="/images/anthropic-black.svg"
                    className="w-10"
                  />{" "}
                </div>
              </div>
            </div>
            <div className="col-span-1 w-96 h-96 relative">
              <div className="w-96 h-80 left-0 top-[50px] absolute">
                <div className="w-96 h-80 left-[165px] top-0 absolute bg-gradient-to-b from-gray-200 to-gray-50 rounded-2xl shadow border border-zinc-300 dark:from-zinc-800 dark:to-zinc-900"></div>
                <div className="w-12 h-12 left-[347.50px] top-[292.80px] absolute origin-top-left -rotate-90"></div>
                <div className="w-96 h-36 left-[165.50px] top-[85px] absolute">
                  <div className="left-[105px] top-0 absolute text-center text-neutral-700 text-3xl font-bold font-['Mulish'] capitalize leading-9 dark:text-white">
                    Duck Duck Go
                  </div>
                  <div className="w-80 left-8 top-[60px] absolute text-center text-neutral-700 text-base font-semibold font-['Mulish'] leading-relaxed dark:text-neutral-300">
                    A privacy-focused search engine that prioritizes user
                    anonymity by not tracking or storing personal information.
                  </div>
                </div>
              </div>
              <div className="w-24 h-24 left-[322.50px] top-0 absolute">
                <div className="w-24 h-24 left-0 top-0 absolute bg-zinc-300 rounded-2xl shadow grid content-center justify-center">
                  {" "}
                  <img src="/images/duckduckgo-black.svg" />{" "}
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-center">
            <div className="w-1/2">
              <div className="text-neutral-700 text-center text-3xl font-bold font-['Mulish'] capitalize leading-10 dark:text-white">
                AI&apos;s Innovative Potential for
                <br />
                One-Click Content Generation
              </div>
              <div className="w-full pt-4 text-neutral-700 text-center pl-10 pr-10 text-lg font-normal font-['Mulish'] leading-7 dark:text-neutral-400">
                Crafting influential content requires a deep understanding of
                your target audience. Pinpoint your ideal demographic and
                familiarise yourself with their needs, passions, and sources of
                concern.
              </div>
              <div className="pl-12 pt-4">
                <div className="w-full h-7 relative top-2">
                  <div className="w-7 h-7 left-0 top-[0.92px] absolute">
                    <div className="w-7 h-7 left-0 top-0 absolute border border-green-500"></div>
                    <div className="w-3 h-3 left-[7.39px] top-[7.39px] absolute bg-green-500 border"></div>
                  </div>
                  <div className="w-full left-[43.56px] top-0 absolute text-neutral-700 text-lg font-normal font-['Mulish'] leading-7 dark:text-neutral-400">
                    Attract your audience with captivating facts in your
                    commercials
                  </div>
                </div>
                <div className="w-full h-7 relative top-4">
                  <div className="w-7 h-7 left-0 top-[0.92px] absolute">
                    <div className="w-7 h-7 left-0 top-0 absolute border border-green-500"></div>
                    <div className="w-3 h-3 left-[7.39px] top-[7.39px] absolute bg-green-500 border"></div>
                  </div>
                  <div className="w-full left-[43.56px] top-0 absolute text-neutral-700 text-lg font-normal font-['Mulish'] leading-7 dark:text-neutral-400">
                    Let&apos;s engage with the customers effectively
                  </div>
                </div>
                <div className="w-full h-14 relative top-6">
                  <div className="w-7 h-7 left-0 top-[0.92px] absolute">
                    <div className="w-7 h-7 left-0 top-0 absolute border border-green-500"></div>
                    <div className="w-3 h-3 left-[7.39px] top-[7.39px] absolute bg-green-500 border"></div>
                  </div>
                  <div className="w-full left-[43.56px] top-0 absolute text-neutral-700 text-lg font-normal font-['Mulish'] leading-7 dark:text-neutral-400">
                    Brighten up your content with appealing graphics: pictures,
                    clips, and graphs that will fascinate your users!
                  </div>
                </div>
              </div>
            </div>
            <div className="w-1/2 grid content-center justify-center">
              <img src="/images/chatbot.png" className="w-96" />
            </div>
          </div>
          <div className="flex justify-center">
            <div className="w-1/2 grid content-center justify-center">
              <img src="/images/computerbot.png" className="w-96" />
            </div>
            <div className="w-[calc(50%-100px)]">
              <div className="text-neutral-700 text-center text-3xl font-bold font-['Mulish'] capitalize leading-10 dark:text-white">
                The key resource for First <br />
                Page Content Optimization
              </div>
              <div className="w-full pt-4 text-neutral-700 text-center pl-10 pr-10 text-lg font-normal font-['Mulish'] leading-7 dark:text-neutral-400">
                &quot;Unlock Content Magic: Tailor Your Message to Win Hearts!
                Discover Your Ideal Audience, Understand Their Desires, Tastes,
                and Challenges!&quot;
              </div>
              <div className="pl-12 pt-4">
                <div className="w-full h-7 relative top-2">
                  <div className="w-7 h-7 left-0 top-[0.92px] absolute">
                    <div className="w-7 h-7 left-0 top-0 absolute border border-green-500"></div>
                    <div className="w-3 h-3 left-[7.39px] top-[7.39px] absolute bg-green-500 border"></div>
                  </div>
                  <div className="w-full left-[43.56px] top-0 absolute text-neutral-700 text-lg font-normal font-['Mulish'] leading-7 dark:text-neutral-400">
                    Gain valuable insights into their expectations, preferences,
                    and aspirations.
                  </div>
                </div>
                <div className="w-full h-7 relative top-8">
                  <div className="w-7 h-7 left-0 top-[0.92px] absolute">
                    <div className="w-7 h-7 left-0 top-0 absolute border border-green-500"></div>
                    <div className="w-3 h-3 left-[7.39px] top-[7.39px] absolute bg-green-500 border"></div>
                  </div>
                  <div className="w-full left-[43.56px] top-0 absolute text-neutral-700 text-lg font-normal font-['Mulish'] leading-7 dark:text-neutral-400">
                    Create captivating content that speaks directly to their
                    hearts and minds.
                  </div>
                </div>
                <div className="w-full h-14 relative top-14">
                  <div className="w-7 h-7 left-0 top-[0.92px] absolute">
                    <div className="w-7 h-7 left-0 top-0 absolute border border-green-500"></div>
                    <div className="w-3 h-3 left-[7.39px] top-[7.39px] absolute bg-green-500 border"></div>
                  </div>
                  <div className="w-[calc(100%-45px)] left-[43.56px] top-0 absolute text-neutral-700 text-lg font-normal font-['Mulish'] leading-7 dark:text-neutral-400">
                    Identify the precise pain points and challenges your
                    audience faces, and provide solutions through your content.
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-center">
            <div className="w-1/2">
              <div className="text-neutral-700 text-center text-3xl font-bold font-['Mulish'] capitalize leading-10 dark:text-white">
                QuikAsk: Your Companion for
                <br />
                Hashtags, Captions, and More!
              </div>
              <div className="w-full pt-4 text-neutral-700 text-center pl-10 pr-10 text-lg font-normal font-['Mulish'] leading-7 dark:text-neutral-400">
                Experience the power of QUIKASK AI and revolutionise your social
                media presence. Say goodbye to writer&apos;s block and hello to
                compelling hashtags, captivating captions, and endless content
                possibilities.
              </div>
              <div className="pl-12 pt-4">
                <div className="w-full h-7 relative top-2">
                  <div className="w-7 h-7 left-0 top-[0.92px] absolute">
                    <div className="w-7 h-7 left-0 top-0 absolute border border-green-500"></div>
                    <div className="w-3 h-3 left-[7.39px] top-[7.39px] absolute bg-green-500 border"></div>
                  </div>
                  <div className="w-full left-[43.56px] top-0 absolute text-neutral-700 text-lg font-normal font-['Mulish'] leading-7 dark:text-neutral-400">
                    Curate endless content possibilities that make your website
                    shine.
                  </div>
                </div>
                <div className="w-full h-7 relative top-4">
                  <div className="w-7 h-7 left-0 top-[0.92px] absolute">
                    <div className="w-7 h-7 left-0 top-0 absolute border border-green-500"></div>
                    <div className="w-3 h-3 left-[7.39px] top-[7.39px] absolute bg-green-500 border"></div>
                  </div>
                  <div className="w-full left-[43.56px] top-0 absolute text-neutral-700 text-lg font-normal font-['Mulish'] leading-7 dark:text-neutral-400">
                    Generates compelling hashtags that skyrocket your reach
                  </div>
                </div>
                <div className="w-full h-14 relative top-6">
                  <div className="w-7 h-7 left-0 top-[0.92px] absolute">
                    <div className="w-7 h-7 left-0 top-0 absolute border border-green-500"></div>
                    <div className="w-3 h-3 left-[7.39px] top-[7.39px] absolute bg-green-500 border"></div>
                  </div>
                  <div className="w-full left-[43.56px] top-0 absolute text-neutral-700 text-lg font-normal font-['Mulish'] leading-7 dark:text-neutral-400">
                    Unlock a world of unlimited content ideas that keep your
                    followers hooked.
                  </div>
                </div>
              </div>
            </div>
            <div className="w-1/2 grid content-center justify-center">
              <img src="/images/littlebot.png" className="w-96" />
            </div>
          </div>
          <div className="relative">
            <div className="w-full top-0 absolute flex justify-center text-center text-neutral-700 text-3xl font-bold font-['Mulish'] capitalize leading-10 dark:text-white">
              <img src="/images/spiral-arrow-left.svg" />
              <span>
                Check Out How Much &nbsp;{" "}
                <span className="text-lime-600">QuikAsk</span>
                <br />
                Is Loved By Our Users!
              </span>
              <img src="/images/spiral-arrow-right.svg" />
            </div>
            <div className="pt-32 w-full justify-center items-center pl-[calc(50%-312px)]">
              <div className="flex">
                <img src="/images/testimonial.jpg" className="w-60" />
                <div>
                  <div className="text-2xl pl-12 pt-24 dark:text-white">
                    Cameron Williamson
                  </div>
                  <div className="text-neutral-700 text-opacity-60 pl-10 text-xl dark:text-neutral-400">
                    CEO & Owner, Vision Trust
                  </div>
                  <div className="w-96 h-52 bg-gradient-to-b from-zinc-300 to-neutral-400 flex">
                    <div className="right-0 w-28 pl-3 pt-10 dark:bg-black">
                      {" "}
                      <img src="/images/quote.svg" />{" "}
                    </div>
                    <div className="pt-12 pl-2 dark:bg-black">
                      It&apos;s like having a 24/7 virtual assistant that can
                      engage with our customers intelligently and provide
                      instant support. The chatbot&apos;s natural language
                      understanding and quick responses have improved our
                      efficiency. It&apos;s truly a valuable addition to our
                      team!
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div>
            <div className="flex justify-center pt-20">
              <div className="w-full h-44 relative">
                <div className="w-full top-0 absolute flex justify-center text-center text-neutral-700 text-3xl font-bold font-['Mulish'] capitalize leading-10 dark:text-white">
                  <img src="/images/spiral-arrow-left.svg" />
                  Frequently Asked Questions
                  <img src="/images/spiral-arrow-right.svg" />
                </div>
                <div className="pl-80 pr-80 w-full left-0 top-[60px] absolute text-center text-neutral-700 font-[12px] font-['Mulish'] leading-7 dark:text-neutral-400">
                  Here, you can find some useful information about QuikAsk
                </div>
              </div>
            </div>
            <div className="pl-24 pr-24">
              <div className="flex border border-neutral-300 border-l-0 border-r-0  items-center justify-between pl-8 pr-8">
                <div className="flex">
                  <div className="w-24 pt-3 pb-3 text-center align-middle text-5xl font-bold font-['Mulish'] capitalize leading-10 text-lime-600 bg-white dark:bg-[#121212]">
                    01
                  </div>
                  <div className="pt-3 pb-3 text-neutral-700 text-2xl font-semibold font-['Mulish'] capitalize leading-10 dark:text-white">
                    Is the content unique?
                  </div>
                </div>
                <img src="/images/plus-green.svg" />
              </div>
            </div>
            <div className="pl-24 pr-24">
              <div className="flex border border-neutral-300 border-l-0 border-r-0 border-t-0 items-center justify-between pl-8 pr-8">
                <div className="flex">
                  <div className="w-24 pt-3 pb-3 text-center align-middle text-5xl font-bold font-['Mulish'] capitalize leading-10 text-lime-600 bg-white dark:bg-[#121212]">
                    02
                  </div>
                  <div className="pt-3 pb-3 text-neutral-700 text-2xl font-semibold font-['Mulish'] capitalize leading-10 dark:text-white">
                    How can I boost traffic with Quik ASk?
                  </div>
                </div>
                <img src="/images/plus-green.svg" />
              </div>
            </div>
            <div className="pl-24 pr-24">
              <div className="flex border border-neutral-300 border-l-0 border-r-0 border-t-0 items-center justify-between pl-8 pr-8">
                <div className="flex">
                  <div className="w-24 pt-3 pb-3 text-center align-middle text-5xl font-bold font-['Mulish'] capitalize leading-10 text-lime-600 bg-white dark:bg-[#121212]">
                    03
                  </div>
                  <div className="pt-3 pb-3 text-neutral-700 text-2xl font-semibold font-['Mulish'] capitalize leading-10 dark:text-white">
                    How long will it take to write an article with AI?
                  </div>
                </div>
                <img src="/images/plus-green.svg" />
              </div>
            </div>
            <div className="pl-24 pr-24">
              <div className="flex border border-neutral-300 border-l-0 border-r-0 border-t-0 items-center justify-between pl-8 pr-8">
                <div className="flex">
                  <div className="w-24 pt-3 pb-3 text-center align-middle text-5xl font-bold font-['Mulish'] capitalize leading-10 text-lime-600 bg-white dark:bg-[#121212]">
                    04
                  </div>
                  <div className="pt-3 pb-3 text-neutral-700 text-2xl font-semibold font-['Mulish'] capitalize leading-10 dark:text-white">
                    Is there a limit to the amount of stuff that I can create?
                  </div>
                </div>
                <img src="/images/plus-green.svg" />
              </div>
            </div>
            <div className="pl-24 pr-24">
              <div className="flex border border-neutral-300 border-l-0 border-r-0 border-t-0 items-center justify-between pl-8 pr-8">
                <div className="flex">
                  <div className="w-24 pt-3 pb-3 text-center align-middle text-5xl font-bold font-['Mulish'] capitalize leading-10 text-lime-600 bg-white dark:bg-[#121212]">
                    05
                  </div>
                  <div className="pt-3 pb-3 text-neutral-700 text-2xl font-semibold font-['Mulish'] capitalize leading-10 dark:text-white">
                    What languages do you support?
                  </div>
                </div>
                <img src="/images/plus-green.svg" />
              </div>
            </div>
          </div>
          <div className="pl-24 pr-24 pt-24">
            <div className="text-neutral-700 text-4xl font-bold font-['Mulish'] capitalize pb-12 leading-10 dark:text-white">
              Trusted By
            </div>
            <div className="flex justify-between border border-neutral-300 border-l-0 border-r-0 pt-5 pb-5 dark:bg-neutral-100">
              <div className="w-36 h-10 relative">
                <img
                  className="w-36 h-10 left-0 top-0 absolute"
                  src="/images/paypal.png"
                />
              </div>
              <div className="w-36 h-10 relative">
                <img
                  className="w-36 h-10 left-0 top-0 absolute"
                  src="/images/visa.png"
                />
              </div>
              <div className="w-36 h-10 relative">
                <img
                  className="w-36 h-10 left-0 top-0 absolute"
                  src="/images/amazon.png"
                />
              </div>
              <div className="w-36 h-10 relative">
                <img
                  className="w-36 h-10 left-0 top-0 absolute"
                  src="/images/citibank.png"
                />
              </div>
              <div className="w-28 h-10 relative">
                <img
                  className="w-36 h-10 left-0 top-0 absolute"
                  src="/images/w.png"
                />
              </div>
            </div>
          </div>
          <div className="pt-24 pb-32">
            <div className="text-4xl font-bold font-['Mulish'] capitalize leading-10 text-neutral-700 text-center dark:text-white">
              Trade With Anyone
            </div>
            <div className="font-['Mulish'] capitalize leading-10 text-neutral-700 justify-center flex pt-3 dark:text-neutral-400">
              <div className="w-[700px] text-center">
                Lorem ipsum dolor sit amet consectetur. Nisi risus at ac
                vestibulum ut. Amet bibendum mi eu leo. Ut odio ipsum et quis id
                ridiculus commodo tincidunt ridiculus. Lacus ut sit vestibulum
                at.
              </div>
            </div>
            <div className="flex justify-center pt-3">
              <img src="/images/discord.svg" className="w-12 pl-2 pr-2" />
              <img src="/images/telegram.svg" className="w-12 pl-2 pr-2" />
              <img src="/images/twitter.svg" className="w-12 pl-2 pr-2" />
              <img src="/images/linkedin.svg" className="w-12 pl-2 pr-2" />
              <img src="/images/facebook.svg" className="w-12 pl-2 pr-2" />
              <img src="/images/instagram.svg" className="w-12 pl-2 pr-2" />
              <img src="/images/reddit.svg" className="w-12 pl-2 pr-2" />
            </div>
          </div>
          <div className="w-screen h-16 fixed bottom-0 bg-white dark:bg-neutral-900">
            <div className="w-screen h-8 flex justify-between pl-24 pr-24">
              <div className="text-neutral-700 text-xl font-normal font-['Mulish'] leading-loose dark:text-white">
                Contact Us: support@quikask.com
              </div>
              <div className="text-neutral-700 text-xl font-normal font-['Mulish'] leading-loose dark:text-white">
                © 2023 QuikAsk
              </div>
              <div className="text-neutral-700 text-xl font-normal font-['Mulish'] leading-loose dark:text-white">
                Privacy Policy
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
