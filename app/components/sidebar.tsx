import { useEffect, useRef } from "react";

import styles from "./home.module.scss";

import { IconButton } from "./button";
import SettingsIcon from "../icons/settings.svg";
import GithubIcon from "../icons/github.svg";
import ChatGptIcon from "../icons/chatgpt.svg";
import AddIcon from "../icons/add.svg";
import CloseIcon from "../icons/close.svg";
import MaskIcon from "../icons/mask.svg";
import PluginIcon from "../icons/plugin.svg";

import Locale from "../locales";

import { useAppConfig, useChatStore } from "../store";

import {
  MAX_SIDEBAR_WIDTH,
  MIN_SIDEBAR_WIDTH,
  NARROW_SIDEBAR_WIDTH,
  Path,
  REPO_URL,
} from "../constant";

import { Link, useNavigate } from "react-router-dom";
import { useMobileScreen } from "../utils";
import dynamic from "next/dynamic";
import { showToast } from "./ui-lib";
import { useAuthStore } from "../store/auth";
import { useTheme } from "next-themes";

const ChatList = dynamic(async () => (await import("./chat-list")).ChatList, {
  loading: () => null,
});

function useHotKey() {
  const chatStore = useChatStore();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.altKey || e.ctrlKey) {
        const n = chatStore.sessions.length;
        const limit = (x: number) => (x + n) % n;
        const i = chatStore.currentSessionIndex;
        if (e.key === "ArrowUp") {
          chatStore.selectSession(limit(i - 1));
        } else if (e.key === "ArrowDown") {
          chatStore.selectSession(limit(i + 1));
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });
}

function useDragSideBar() {
  const limit = (x: number) => Math.min(MAX_SIDEBAR_WIDTH, x);

  const config = useAppConfig();
  const startX = useRef(0);
  const startDragWidth = useRef(config.sidebarWidth ?? 300);
  const lastUpdateTime = useRef(Date.now());

  const handleMouseMove = useRef((e: MouseEvent) => {
    if (Date.now() < lastUpdateTime.current + 50) {
      return;
    }
    lastUpdateTime.current = Date.now();
    const d = e.clientX - startX.current;
    const nextWidth = limit(startDragWidth.current + d);
    config.update((config) => (config.sidebarWidth = nextWidth));
  });

  const handleMouseUp = useRef(() => {
    startDragWidth.current = config.sidebarWidth ?? 300;
    window.removeEventListener("mousemove", handleMouseMove.current);
    window.removeEventListener("mouseup", handleMouseUp.current);
  });

  const onDragMouseDown = (e: MouseEvent) => {
    startX.current = e.clientX;

    window.addEventListener("mousemove", handleMouseMove.current);
    window.addEventListener("mouseup", handleMouseUp.current);
  };
  const isMobileScreen = useMobileScreen();
  const shouldNarrow =
    !isMobileScreen && config.sidebarWidth < MIN_SIDEBAR_WIDTH;

  useEffect(() => {
    const barWidth = shouldNarrow
      ? NARROW_SIDEBAR_WIDTH
      : limit(config.sidebarWidth ?? 300);
    const sideBarWidth = isMobileScreen ? "100vw" : `${barWidth}px`;
    document.documentElement.style.setProperty("--sidebar-width", sideBarWidth);
  }, [config.sidebarWidth, isMobileScreen, shouldNarrow]);

  return {
    onDragMouseDown,
    shouldNarrow,
  };
}

export function SideBar() {
  const chatStore = useChatStore();

  // drag side bar
  const { onDragMouseDown, shouldNarrow } = useDragSideBar();
  const navigate = useNavigate();
  const config = useAppConfig();
  const authStore = useAuthStore();
  const { systemTheme, theme, setTheme } = useTheme();

  useHotKey();

  return (
    <div className="w-1/5">
      <img src="/images/group.svg" className="top-[24px] left-[25px] w-[37px] relative" />
      <span className="relative top-[14px] left-[35px] text-lime-600 text-[24.89px] font-bold font-['Inter'] tracking-tight">QuikAsk</span>
      <div className="w-full">
        <div className="items-center mx-6 my-6 px-[16.83px] py-[12.02px] relative bg-[#69a506] rounded-[10px] overflow-hidden">
          <button className="relative w-full mt-[-0.28px] [font-family:'Mulish-Bold',Helvetica] font-bold text-white text-[16.8px] tracking-[0] leading-[normal]"
            onClick={() => {
              if (config.dontShowMaskSplashScreen) {
                chatStore.newSession();
                navigate(Path.Chat);
              } else {
                navigate(Path.NewChat);
              }
            }}>
            New Chat
          </button>
        </div>
      </div>
      <div className="w-full">
        <div className="top-1/4 w-full pl-6 pr-6 pt-6">
          <span className="text-[14.4px]">Today</span>
          <div className="w-full pl-1 pr-1 pt-3">
            <ChatList narrow={shouldNarrow} today={true}/>
          </div>
        </div>
        <div className="w-full p-4">
          <div className="border-b border-b-neutral-700"></div>
        </div>
      </div>
      <div className="w-full">
        <div className="top-1/4 w-full pl-6 pr-6 pt-6">
          <span className="text-[14.4px]">Chat List</span>
          <div className="w-full pl-1 pr-1 pt-3">
            <ChatList narrow={shouldNarrow} today={false}/>
          </div>
        </div>
        <div className="w-full p-4">
          <div className="border-b border-b-neutral-700"></div>
        </div>
      </div>
      <div className="w-full p-5">
        <div className="inline-flex items-center gap-[7.21px] relative">
          <img className="relative w-[28.86px] h-[28.86px]" alt="Trash" src="/images/trash.svg" />
          <button className="relative w-fit [font-family:'Mulish-Regular',Helvetica] font-normal text-[#353535] text-[16.8px] tracking-[0] leading-[normal]" 
            onClick={() => {
              if (confirm(Locale.Home.DeleteChat)) {
                chatStore.deleteSession(chatStore.currentSessionIndex);
              }
            }}>
            Clear Conversation
          </button>
        </div>
        <div className="flex items-center gap-[7.21px] relative mt-5">
          <img className="relative w-[28.86px] h-[28.86px]" alt="Trash" src="/images/settings.svg" />
          <Link to={Path.Settings} className="relative w-fit [font-family:'Mulish-Regular',Helvetica] font-normal text-[#353535] text-[16.8px] tracking-[0] leading-[normal]">
            Settings
          </Link>
        </div>
        <div className="flex items-center gap-[7.21px] relative mt-5">
          <img className="relative w-[28.86px] h-[28.86px]" alt="Trash" src="/images/logout.svg" />
          <button className="relative w-fit [font-family:'Mulish-Regular',Helvetica] font-normal text-[#353535] text-[16.8px] tracking-[0] leading-[normal]" 
            onClick={() => {
              localStorage.clear();
              navigate(Path.Login);
            }}>
            Log Out
          </button>
        </div>
      </div>
      <div className="w-full bottom-3">
        <div className="top-1/4 w-full pl-6 pr-6">
          <button className="bg-[#d3d3d3] rounded-[10px] w-full h-[34px] flex items-center justify-center" 
          onClick={() => navigate(Path.NewChat, { state: { fromHome: true } })}>
            <img className="w-[20px] h-[20px] mr-2" alt="Mask" src="/images/mask.svg" />
            Mask
          </button>
        </div>
        <div className="top-1/4 w-full pl-6 pr-6 pt-2">
          <div className="bg-[#d3d3d3] rounded-[10px] flex p-1">
            <button className="bg-[#69A606] text-white rounded-[10px] w-full h-[34px] flex items-center justify-center mr-2"
              onClick={() => theme}>
              <img className="w-[20px] h-[20px] mr-2" alt="Mask" src="/images/light.svg" />
              Light
            </button>
            
            <button className="bg-[#d3d3d3] rounded-[10px] w-full h-[34px] flex items-center justify-center">
              <img className="w-[20px] h-[20px] mr-2" alt="Mask" src="/images/dark.svg" />
              Dark
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
