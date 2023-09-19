import { useEffect, useRef, useState } from "react";
import { Path, SlotID } from "../constant";
import { IconButton } from "./button";

import LeftIcon from "../icons/left.svg";
import LightningIcon from "../icons/lightning.svg";
import EyeIcon from "../icons/eye.svg";

import { useLocation, useNavigate } from "react-router-dom";
import { Mask, useMaskStore } from "../store/mask";
import Locale from "../locales";
import { useAppConfig, useChatStore } from "../store";
import { MaskAvatar } from "./mask";
import { useCommand } from "../command";
import { SideBar } from "./sidebar";

function getIntersectionArea(aRect: DOMRect, bRect: DOMRect) {
  const xmin = Math.max(aRect.x, bRect.x);
  const xmax = Math.min(aRect.x + aRect.width, bRect.x + bRect.width);
  const ymin = Math.max(aRect.y, bRect.y);
  const ymax = Math.min(aRect.y + aRect.height, bRect.y + bRect.height);
  const width = xmax - xmin;
  const height = ymax - ymin;
  const intersectionArea = width < 0 || height < 0 ? 0 : width * height;
  return intersectionArea;
}

function MaskItem(props: { mask: Mask; onClick?: () => void }) {
  return (
    <div onClick={props.onClick}>
      <MaskAvatar mask={props.mask} />
      <div>{props.mask.name}</div>
    </div>
  );
}

function useMaskGroup(masks: Mask[]) {
  const [groups, setGroups] = useState<Mask[][]>([]);

  useEffect(() => {
    const computeGroup = () => {
      const appBody = document.getElementById(SlotID.AppBody);
      if (!appBody || masks.length === 0) return;

      const rect = appBody.getBoundingClientRect();
      const maxWidth = rect.width;

      const maxHeight = rect.height * 0.6;
      const maskItemWidth = 120;
      const maskItemHeight = 50;

      const randomMask = () => masks[Math.floor(Math.random() * masks.length)];
      let maskIndex = 0;
      const nextMask = () => masks[maskIndex++ % masks.length];

      const rows = Math.ceil(maxHeight / maskItemHeight);
      const cols = Math.ceil(maxWidth / maskItemWidth);

      const newGroups = new Array(rows)
        .fill(0)
        .map((_, _i) =>
          new Array(cols)
            .fill(0)
            .map((_, j) => (j < 1 || j > cols - 2 ? randomMask() : nextMask())),
        );

      setGroups(newGroups);
    };

    computeGroup();

    window.addEventListener("resize", computeGroup);
    return () => window.removeEventListener("resize", computeGroup);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return groups;
}

export function NewChat() {
  const chatStore = useChatStore();
  const maskStore = useMaskStore();

  const masks = maskStore.getAll();
  const groups = useMaskGroup(masks);

  const navigate = useNavigate();
  const config = useAppConfig();

  const maskRef = useRef<HTMLDivElement>(null);

  const { state } = useLocation();

  const startChat = (mask?: Mask) => {
    chatStore.newSession(mask);
    setTimeout(() => navigate(Path.Chat), 1);
  };

  useCommand({
    mask: (id) => {
      try {
        const mask = maskStore.get(parseInt(id));
        startChat(mask ?? undefined);
      } catch {
        console.error("[New Chat] failed to create chat from mask id=", id);
      }
    },
  });

  useEffect(() => {
    if (maskRef.current) {
      maskRef.current.scrollLeft =
        (maskRef.current.scrollWidth - maskRef.current.clientWidth) / 2;
    }
  }, [groups]);

  return (
    <div className="bg-[#ebebeb] flex flex-row justify-center w-full">
      <SideBar />
      <div className="w-4/5 p-[30px]">
        <div className="rounded-[10px] bg-white flex flex-col items-center h-[600px]">
          <div className="flex items-start w-full">
            <IconButton
              icon={<LeftIcon />}
              text={"Back"}
              onClick={() => navigate(Path.Home)}
            ></IconButton>
          </div>
          <div>
            <div className="w-[269px] h-[288px] pt-[100px]">
              <div className="w-[269px] h-[148px] top-0 left-0">
                <div className="relative h-[148px]">
                  <div className="absolute w-[269px] h-[148px] top-0 left-0">
                    <div className="relative h-[148px]">
                      <div className="w-[84px] h-[110px] top-[29px] left-[13px] rotate-[-15.00deg] absolute bg-white rounded-[10px] border border-solid border-[#18bb4e78]" />
                      <div className="w-[84px] h-[110px] top-[29px] left-[172px] rotate-[15.00deg] absolute bg-white rounded-[10px] border border-solid border-[#18bb4e78]" />
                      <div className="w-[108px] h-[142px] top-0 left-[81px] absolute bg-white rounded-[10px] border border-solid border-[#18bb4e78]" />
                    </div>
                  </div>
                  <img
                    className="w-[64px] h-[64px] top-[39px] left-[103px] absolute object-cover"
                    alt="Image"
                    src="/images/mask (2).png"
                  />
                  <img
                    className="w-[43px] h-[43px] top-[60px] left-[193px] absolute object-cover"
                    alt="Image"
                    src="/images/mask (3).png"
                  />
                  <img
                    className="w-[40px] h-[40px] top-[60px] left-[35px] absolute object-cover"
                    alt="Image"
                    src="/images/mask (1).png"
                  />
                </div>
              </div>
            </div>

            <div className="[font-family:'Mulish-ExtraBold',Helvetica] font-extrabold text-[#353535] text-[38px] tracking-[0] leading-[normal]">
              {Locale.NewChat.Title}
            </div>
            <div className=" [font-family:'Mulish-ExtraBold',Helvetica] text-[#353535] tracking-[0] leading-[normal]">
              {Locale.NewChat.SubTitle}
            </div>

            <div className="flex pt-5">
              <IconButton
                text={Locale.NewChat.More}
                onClick={() => navigate(Path.Masks)}
                icon={<EyeIcon />}
                bordered
                shadow
              />

              <button
                onClick={() => startChat()}
                className="bg-[#69A606] text-white flex items-center p-2 rounded-[8px] pl-4 pr-4"
              >
                {<LightningIcon />}
                {Locale.NewChat.Skip}
              </button>
            </div>

            <div ref={maskRef}>
              {groups.map((masks, i) => (
                <div key={i}>
                  {masks.map((mask, index) => (
                    <MaskItem
                      key={index}
                      mask={mask}
                      onClick={() => startChat(mask)}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
