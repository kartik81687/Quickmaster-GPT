import { useDebouncedCallback } from "use-debounce";
import {
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  useCallback,
} from "react";
import toast, { Toaster } from "react-hot-toast";

import {
  speechRecognition,
  setSpeechRecognition,
} from "../speech-recognition-types";

import SendWhiteIcon from "../../public/images/send.svg";
import BrainIcon from "../icons/brain.svg";
import RenameIcon from "../icons/rename.svg";
import ExportIcon from "../icons/share.svg";
import ReturnIcon from "../icons/return.svg";
import CopyIcon from "../icons/copy.svg";
import LoadingIcon from "../icons/three-dots.svg";
import PromptIconDark from "../icons/prompt.svg";
import PromptIconLight from "../icons/prompt-light.svg";
import MaskIconDark from "../icons/mask.svg";
import MaskIconLight from "../icons/mask-light.svg";
import MaxIcon from "../icons/max.svg";
import MinIcon from "../icons/min.svg";
import ResetIcon from "../icons/reload.svg";
import BreakIconDark from "../icons/break.svg";
import BreakIconLight from "../icons/break-light.svg";
import SettingsIcon from "../icons/chat-settings.svg";
import MicrophoneIconDark from "../icons/microphone.svg";
import MicrophoneIconLight from "../icons/microphone-light.svg";
import MicrophoneOffIconDark from "../icons/microphone_off.svg";
import MicrophoneOffIconLight from "../icons/microphone_off-light.svg";
import GoogleBardIconDark from "../icons/google-bard-on.svg";
import GoogleBardOffIconDark from "../icons/google-bard-off.svg";
import GoogleBardIconLight from "../icons/google-bard-on-light.svg";
import GoogleBardOffIconLight from "../icons/google-bard-off-light.svg";
import ChineseIcon from "../icons/chinese.svg";
import EnglishIcon from "../icons/english.svg";
import PlayerIcon from "../icons/player-play.svg";
import PlayerStopIcon from "../icons/player-stop.svg";
import ClaudeIcon from "../icons/anthropic.svg";
import ClaudeOffIcon from "../icons/anthropic-disable.svg";
import DuckDuckGoIcon from "../icons/duckduckgo.svg";
import DuckDuckGoOffIcon from "../icons/duckduckgo-off.svg";
import LightIcon from "../icons/light.svg";
import DarkIcon from "../icons/dark.svg";
import AutoIcon from "../icons/auto.svg";
import BottomIcon from "../icons/bottom.svg";
import StopIcon from "../icons/pause.svg";
import {
  doSpeechSynthesis,
  stopSpeechSysthesis,
} from "../utils/speechSynthesis";
import { SideBar } from "./sidebar";
import { ModelConfigList } from "./model-config";

import {
  ChatMessage,
  SubmitKey,
  useChatStore,
  BOT_HELLO,
  createMessage,
  useAccessStore,
  Theme,
  useAppConfig,
  DEFAULT_TOPIC,
  DEFAULT_CONFIG,
  ModelConfig,
  ModalConfigValidator,
  ALL_MODELS,
} from "../store";

import {
  copyToClipboard,
  selectOrCopy,
  autoGrowTextArea,
  useMobileScreen,
} from "../utils";

import dynamic from "next/dynamic";

import { ChatControllerPool } from "../client/controller";
import { Prompt, usePromptStore } from "../store/prompt";
import Locale from "../locales";

import { IconButton } from "./button";
import styles from "./home.module.scss";
import chatStyle from "./chat.module.scss";

import { ListItem, Modal, showToast } from "./ui-lib";
import { useLocation, useNavigate } from "react-router-dom";
import { LAST_INPUT_KEY, Path, REQUEST_TIMEOUT_MS } from "../constant";
import { Avatar } from "./emoji";
import { MaskAvatar, MaskConfig } from "./mask";
import { useMaskStore } from "../store/mask";
import { useCommand } from "../command";
import { prettyObject } from "../utils/format";
import { ExportMessageModal } from "./exporter";
import SubAlertModal from "./subAlertModal";
import { BUILTIN_MASK_STORE } from "../masks";
import { useTheme } from "next-themes";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Markdown = dynamic(async () => (await import("./markdown")).Markdown, {
  loading: () => <LoadingIcon />,
});

export function SessionConfigModel(props: { onClose: () => void }) {
  const chatStore = useChatStore();
  const session = chatStore.currentSession();
  const maskStore = useMaskStore();
  const navigate = useNavigate();

  return (
    <div className="fixed top-0 left-0 h-screen w-screen bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="fixed bg-white dark:bg-neutral-950 h-[800px] w-[800px] rounded-[10px]">
        <Modal
          title={Locale.Context.Edit}
          onClose={() => props.onClose()}
          actions={[
            <IconButton
              key="reset"
              icon={<ResetIcon />}
              bordered
              text={Locale.Chat.Config.Reset}
              onClick={() => {
                if (confirm(Locale.Memory.ResetConfirm)) {
                  chatStore.updateCurrentSession(
                    (session) => (session.memoryPrompt = ""),
                  );
                }
              }}
            />,
            <IconButton
              key="copy"
              icon={<CopyIcon />}
              bordered
              text={Locale.Chat.Config.SaveAs}
              onClick={() => {
                navigate(Path.Masks);
                setTimeout(() => {
                  maskStore.create(session.mask);
                }, 500);
              }}
            />,
          ]}
        >
          <MaskConfig
            mask={session.mask}
            updateMask={(updater) => {
              const mask = { ...session.mask };
              updater(mask);
              chatStore.updateCurrentSession(
                (session) => (session.mask = mask),
              );
            }}
            shouldSyncFromGlobal
            extraListItems={
              session.mask.modelConfig.sendMemory ? (
                <ListItem
                  title={`${Locale.Memory.Title} (${session.lastSummarizeIndex} of ${session.messages.length})`}
                  subTitle={session.memoryPrompt || Locale.Memory.EmptyContent}
                ></ListItem>
              ) : (
                <></>
              )
            }
          ></MaskConfig>
        </Modal>
      </div>
    </div>
  );
}

function PromptToast(props: {
  showToast?: boolean;
  showModal?: boolean;
  setShowModal: (_: boolean) => void;
}) {
  const chatStore = useChatStore();
  const session = chatStore.currentSession();
  const context = session.mask.context;

  return (
    <div className={chatStyle["prompt-toast"]} key="prompt-toast">
      {props.showToast && (
        <div
          className={chatStyle["prompt-toast-inner"] + " clickable"}
          role="button"
          onClick={() => props.setShowModal(true)}
        >
          <BrainIcon />
          <span className={chatStyle["prompt-toast-content"]}>
            {Locale.Context.Toast(context.length)}
          </span>
        </div>
      )}
      {props.showModal && (
        <SessionConfigModel onClose={() => props.setShowModal(false)} />
      )}
    </div>
  );
}

function useSubmitHandler() {
  const config = useAppConfig();
  const submitKey = config.submitKey;

  const shouldSubmit = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== "Enter") return false;
    if (e.key === "Enter" && e.nativeEvent.isComposing) return false;
    return (
      (config.submitKey === SubmitKey.AltEnter && e.altKey) ||
      (config.submitKey === SubmitKey.CtrlEnter && e.ctrlKey) ||
      (config.submitKey === SubmitKey.ShiftEnter && e.shiftKey) ||
      (config.submitKey === SubmitKey.MetaEnter && e.metaKey) ||
      (config.submitKey === SubmitKey.Enter &&
        !e.altKey &&
        !e.ctrlKey &&
        !e.shiftKey &&
        !e.metaKey)
    );
  };

  return {
    submitKey,
    shouldSubmit,
  };
}

export function PromptHints(props: {
  prompts: Prompt[];
  onPromptSelect: (prompt: Prompt) => void;
}) {
  const noPrompts = props.prompts.length === 0;
  const [selectIndex, setSelectIndex] = useState(0);
  const selectedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelectIndex(0);
  }, [props.prompts.length]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        return props.onPromptSelect(null as any);
      }
      if (noPrompts) return;
      if (e.metaKey || e.altKey || e.ctrlKey) {
        return;
      }
      // arrow up / down to select prompt
      const changeIndex = (delta: number) => {
        e.stopPropagation();
        e.preventDefault();
        const nextIndex = Math.max(
          0,
          Math.min(props.prompts.length - 1, selectIndex + delta),
        );
        setSelectIndex(nextIndex);
        selectedRef.current?.scrollIntoView({
          block: "center",
        });
      };

      if (e.key === "ArrowUp") {
        changeIndex(1);
      } else if (e.key === "ArrowDown") {
        changeIndex(-1);
      } else if (e.key === "Enter") {
        const selectedPrompt = props.prompts.at(selectIndex);
        if (selectedPrompt) {
          props.onPromptSelect(selectedPrompt);
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.prompts.length, selectIndex]);

  if (noPrompts) return null;
  return (
    <div
      onClick={() => props.onPromptSelect(null as any)}
      className="fixed inset-0 z-[99999] bg-[#000000]/50 flex items-center justify-center"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[1520px] bg-[#ffffff] dark:bg-[#303C4B30] backdrop-blur-lg px-10 pt-10 rounded-2xl ring-1 ring-[#18BB4E] relative"
      >
        <div className={styles["prompt-hints"]}>
          {props.prompts.map((prompt, i) => (
            <div
              ref={i === selectIndex ? selectedRef : null}
              className={
                styles["prompt-hint"] +
                ` ${i === selectIndex ? styles["prompt-hint-selected"] : ""}` +
                "bg-[#7d7d7d30] hover:!bg-[#7d7d7d4d] !py-5 !px-8 !space-y-1"
              }
              key={prompt.title + i.toString()}
              onClick={() => props.onPromptSelect(prompt)}
              onMouseEnter={() => setSelectIndex(i)}
            >
              <div className={styles["hint-title"] + "text-[#fff]"}>
                {prompt.title}
              </div>
              <div className={styles["hint-content"] + "text-[#ffffffb3]"}>
                {prompt.content}
              </div>
            </div>
          ))}
        </div>
        <div className="h-14 absolute bottom-0 left-0 right-0 w-full bg-gradient-to-b from-transparent via-white/70 to-white dark:via-[#12171bf6] dark:to-[#12171b] z-[1] rounded-2xl"></div>
        <div className="h-20 absolute bottom-0 left-0 right-0 w-full bg-gradient-to-b from-transparent via-white/70 to-white dark:via-[#12171bf6] dark:to-[#12171b] z-[1] rounded-2xl"></div>
      </div>
    </div>
  );
}

function ClearContextDivider() {
  const chatStore = useChatStore();

  return (
    <div
      className={chatStyle["clear-context"]}
      onClick={() =>
        chatStore.updateCurrentSession(
          (session) => (session.clearContextIndex = -1),
        )
      }
    >
      <div className={chatStyle["clear-context-tips"]}>
        {Locale.Context.Clear}
      </div>
      <div className={chatStyle["clear-context-revert-btn"]}>
        {Locale.Context.Revert}
      </div>
    </div>
  );
}

function useScrollToBottom() {
  // for auto-scroll
  const scrollRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const scrollToBottom = () => {
    const dom = scrollRef.current;
    if (dom) {
      setTimeout(() => (dom.scrollTop = dom.scrollHeight), 1);
    }
  };

  // auto scroll
  useLayoutEffect(() => {
    autoScroll && scrollToBottom();
  });

  return {
    scrollRef,
    autoScroll,
    setAutoScroll,
    scrollToBottom,
  };
}

export function ChatActions(props: {
  showPromptModal: () => void;
  scrollToBottom: () => void;
  showPromptHints: () => void;
  onSpeechStart: () => void;
  onBarding: () => void;
  onClauding: () => void;
  onChinese: () => void;
  onDuckDuckGo: () => void;
  setSpeaking: (param: boolean) => void;
  hitBottom: boolean;
  recording: boolean;
  barding: boolean;
  clauding: boolean;
  chinese: boolean;
  speaking: boolean;
  duckduckgoing: boolean;
}) {
  const config = useAppConfig();
  const navigate = useNavigate();
  const chatStore = useChatStore();

  // switch themes
  const theme = config.theme;
  function nextTheme() {
    const themes = [Theme.Auto, Theme.Light, Theme.Dark];
    const themeIndex = themes.indexOf(theme);
    const nextIndex = (themeIndex + 1) % themes.length;
    const nextTheme = themes[nextIndex];
    config.update((config) => (config.theme = nextTheme));
  }

  // stop all responses
  const couldStop = ChatControllerPool.hasPending();
  const stopAll = () => ChatControllerPool.stopAll();
  const maskStore = useMaskStore();

  const playVoiceOfAnswer = () => {
    if ("speechSynthesis" in window) {
      props.setSpeaking(true);
      doSpeechSynthesis(
        chatStore.currentSession().messages[
          chatStore.currentSession().messages.length - 1
        ].content,
        () => {
          props.setSpeaking(false);
        },
      );
    } else {
      toast.error("Does not support speechSynthesis");
    }
  };

  const stopVoiceOfAnswer = () => {
    stopSpeechSysthesis();
    props.setSpeaking(false);
  };

  const [editingMaskId, setEditingMaskId] = useState<number | undefined>();
  const editingMask =
    maskStore.get(editingMaskId) ?? BUILTIN_MASK_STORE.get(editingMaskId);

  const updateConfig = (updater: (config: ModelConfig) => void) => {
    const config = { ...editingMask?.modelConfig };
    if (config) updater(config as ModelConfig);
    maskStore.update(editingMaskId!, (mask: any) => {
      mask.modelConfig = config;
      // if user changed current session mask, it will disable auto sync
      mask.syncGlobalConfig = false;
    });
  };

  const themeData = useTheme();
  const currentTheme = themeData.theme;

  return (
    <div className="flex flex-wrap gap-3 mb-4">
      <Toaster />
      {couldStop && (
        <div
          className="w-[58px] h-[50px] flex justify-center items-center font-[12px] rounded-xl bg-transparent ring-1 ring-[#b6b6b6] dark:ring-[#585858] cursor-pointer"
          onClick={stopAll}
        >
          <StopIcon />
        </div>
      )}
      {!props.hitBottom && (
        <div
          className="w-[58px] h-[50px] flex justify-center items-center font-[12px] rounded-xl bg-transparent ring-1 ring-[#b6b6b6] dark:ring-[#585858] cursor-pointer"
          onClick={props.scrollToBottom}
        >
          <BottomIcon />
        </div>
      )}
      {/* {props.hitBottom && (
        <div
          className="w-[58px] h-[50px] p-3 mb-3 items-center font-[12px] rounded-[20px] bg-white inline-flex shadow-slate-500 shadow cursor-pointer dark:bg-neutral-800 dark:shadow-slate-200"
          onClick={props.showPromptModal}
        >
          <SettingsIcon />
        </div>
      )} */}

      {/* <div
        className="w-[58px] h-[50px] p-3 mb-3 items-center font-[12px] rounded-[20px] bg-white inline-flex shadow-slate-500 shadow cursor-pointer dark:bg-neutral-800 dark:shadow-slate-200"
        onClick={nextTheme}
      >
        {theme === Theme.Auto ? (
          <AutoIcon />
        ) : theme === Theme.Light ? (
          <LightIcon />
        ) : theme === Theme.Dark ? (
          <DarkIcon />
        ) : null}
      </div> */}

      <div
        className="w-[58px] h-[50px] flex justify-center items-center font-[12px] rounded-xl bg-transparent ring-1 ring-[#b6b6b6] dark:ring-[#585858] cursor-pointer"
        onClick={props.showPromptHints}
      >
        {currentTheme === Theme.Dark ? <PromptIconDark /> : <PromptIconLight />}
      </div>

      <div
        className="w-[58px] h-[50px] flex justify-center items-center font-[12px] rounded-xl bg-transparent ring-1 ring-[#b6b6b6] dark:ring-[#585858] cursor-pointer"
        onClick={() => {
          navigate(Path.Masks);
        }}
      >
        {currentTheme === Theme.Dark ? <MaskIconDark /> : <MaskIconLight />}
      </div>

      <div
        className="w-[58px] h-[50px] flex justify-center items-center font-[12px] rounded-xl bg-transparent ring-1 ring-[#b6b6b6] dark:ring-[#585858] cursor-pointer"
        onClick={() => {
          chatStore.updateCurrentSession((session) => {
            if (session.clearContextIndex === session.messages.length) {
              session.clearContextIndex = -1;
            } else {
              session.clearContextIndex = session.messages.length;
              session.memoryPrompt = ""; // will clear memory
            }
          });
        }}
      >
        {currentTheme === Theme.Dark ? <BreakIconDark /> : <BreakIconLight />}
      </div>

      <div
        className="w-[58px] h-[50px] flex justify-center items-center font-[12px] rounded-xl bg-transparent ring-1 ring-[#b6b6b6] dark:ring-[#585858] cursor-pointer"
        onClick={props.onSpeechStart}
      >
        {currentTheme === Theme.Dark ? (
          props.recording ? (
            <MicrophoneIconDark />
          ) : (
            <MicrophoneOffIconDark />
          )
        ) : props.recording ? (
          <MicrophoneIconLight />
        ) : (
          <MicrophoneOffIconLight />
        )}
      </div>

      <div
        className="w-[58px] h-[50px] flex justify-center items-center font-[12px] rounded-xl bg-transparent ring-1 ring-[#b6b6b6] dark:ring-[#585858] cursor-pointer"
        onClick={props.onBarding}
      >
        {currentTheme === Theme.Dark ? (
          props.barding ? (
            <GoogleBardIconDark />
          ) : (
            <GoogleBardOffIconDark />
          )
        ) : props.barding ? (
          <GoogleBardIconLight />
        ) : (
          <GoogleBardOffIconLight />
        )}
      </div>

      <div
        className="w-[58px] h-[50px] flex justify-center items-center font-[12px] rounded-xl bg-transparent ring-1 ring-[#b6b6b6] dark:ring-[#585858] cursor-pointer"
        onClick={props.onClauding}
      >
        {props.clauding ? (
          <ClaudeIcon className="w-[16px]" />
        ) : (
          <ClaudeOffIcon className="w-[16px]" />
        )}
      </div>

      <div
        className="w-[58px] h-[50px] flex justify-center items-center font-[12px] rounded-xl bg-transparent ring-1 ring-[#b6b6b6] dark:ring-[#585858] cursor-pointer"
        onClick={props.onDuckDuckGo}
      >
        {props.duckduckgoing ? <DuckDuckGoIcon /> : <DuckDuckGoOffIcon />}
      </div>

      <div className="">
        <ListItem className="dark:text-[#B6B7B8] text-[#353535] !p-0 h-[50px]">
          <Select
            defaultValue={editingMask?.modelConfig.model}
            onValueChange={(e) => {
              updateConfig(
                (config) => (config.model = ModalConfigValidator.model(e)),
              );
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Submit Key" />
            </SelectTrigger>
            <SelectContent>
              {ALL_MODELS.map((v) => (
                <SelectItem value={v.name} key={v.name} disabled={!v.available}>
                  {v.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </ListItem>
      </div>

      {/* <div
        className="w-[58px] h-[50px] flex justify-center items-center font-[12px] rounded-xl bg-transparent ring-1 ring-[#b6b6b6] dark:ring-[#585858] cursor-pointer"
        onClick={props.onChinese}
      >
        {props.chinese ? <ChineseIcon /> : <EnglishIcon />}
      </div> */}

      {/* <div className="w-[58px] h-[50px] flex justify-center items-center font-[12px] rounded-xl bg-transparent ring-1 ring-[#b6b6b6] dark:ring-[#585858] cursor-pointer">
        {props.speaking ? (
          <PlayerStopIcon onClick={stopVoiceOfAnswer} />
        ) : (
          <PlayerIcon onClick={playVoiceOfAnswer} />
        )}
      </div> */}
    </div>
  );
}

export function Chat() {
  type RenderMessage = ChatMessage & { preview?: boolean };

  const chatStore = useChatStore();
  const [session, sessionIndex] = useChatStore((state) => [
    state.currentSession(),
    state.currentSessionIndex,
  ]);
  const config = useAppConfig();
  const fontSize = config.fontSize;

  const [showExport, setShowExport] = useState(false);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [modalState, setModalState] = useState(false);
  const { submitKey, shouldSubmit } = useSubmitHandler();
  const { scrollRef, setAutoScroll, scrollToBottom } = useScrollToBottom();
  const [hitBottom, setHitBottom] = useState(true);
  const isMobileScreen = useMobileScreen();
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId") as string;

  const onChatBodyScroll = (e: HTMLElement) => {
    const isTouchBottom = e.scrollTop + e.clientHeight >= e.scrollHeight - 100;
    setHitBottom(isTouchBottom);
  };

  // prompt hints
  const promptStore = usePromptStore();
  const [promptHints, setPromptHints] = useState<Prompt[]>([]);
  const [remainingWords, setRemainingWords] = useState<any>({
    ai_words_limit: 0,
    used_words: "0",
  });
  const [showPromptModal, setShowPromptModal] = useState(false);
  const onSearch = useDebouncedCallback(
    (text: string) => {
      setPromptHints(promptStore.search(text));
    },
    100,
    { leading: true, trailing: true },
  );

  const onPromptSelect = (prompt: Prompt) => {
    setPromptHints([]);
    inputRef.current?.focus();
    setTimeout(() => setUserInput(prompt.content), 60);
  };

  useEffect(() => {
    const payload = new FormData();
    payload.append("user_id", userId);
    const subsOptions = {
      method: "POST",
      body: payload,
    };

    fetch("https://my.dogai.com/api/used-words", subsOptions)
      .then((response) => response.json())
      .then((result) => {
        if (result.status) {
          setRemainingWords({
            ai_words_limit: result.data.ai_words_limit,
            used_words: result.data.used_words,
          });
        }
      });
  }, []);

  // auto grow input
  const [inputRows, setInputRows] = useState(1);
  const measure = useDebouncedCallback(
    () => {
      const rows = inputRef.current ? autoGrowTextArea(inputRef.current) : 1;
      const inputRows = Math.min(20, Math.max(Number(!isMobileScreen), rows));
      setInputRows(inputRows);
    },
    100,
    {
      leading: true,
      trailing: true,
    },
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(measure, [userInput]);

  // only search prompts when user input is short
  const SEARCH_TEXT_LIMIT = 30;
  const onInput = (text: string) => {
    setUserInput(text);
    const n = text.trim().length;

    // clear search results
    if (n === 0) {
      setPromptHints([]);
    } else if (!config.disablePromptHint && n < SEARCH_TEXT_LIMIT) {
      // check if need to trigger auto completion
      if (text.startsWith("/")) {
        let searchText = text.slice(1);
        onSearch(searchText);
      }
    }
  };

  const doSubmit = (userInput: string, voiceMode: boolean) => {
    if (userInput.trim() === "") return;
    // setIsLoading(true);

    const payload = new FormData();
    payload.append("user_id", userId);
    payload.append("words_count", String(userInput.length));
    const subsOptions = {
      method: "POST",
      body: payload,
    };

    fetch("https://my.dogai.com/api/store-words", subsOptions)
      .then((response) => response.json())
      .then((result) => {
        if (result.status) {
          const wordsUsedUpdated =
            Number(remainingWords.used_words) + userInput.length;
          setRemainingWords({
            ...remainingWords,
            used_words: wordsUsedUpdated,
          });

          chatStore
            .onUserInput(
              userInput,
              voiceMode,
              barding,
              clauding,
              duckduckgo,
              onSpeechStart,
            )
            .then(() => {
              setIsLoading(false);
              if (speechRecognition) {
                setRecording(false);
                speechRecognition.stop();
              } else {
                setRecording(false);
                onSpeechError(new Error("not supported"));
              }
            });
          localStorage.setItem(LAST_INPUT_KEY, userInput);
          setUserInput("");
          setPromptHints([]);
          if (!isMobileScreen) inputRef.current?.focus();
          setAutoScroll(true);
        }
      });
  };

  // stop response
  const onUserStop = (messageId: number) => {
    ChatControllerPool.stop(sessionIndex, messageId);
  };

  useEffect(() => {
    chatStore.updateCurrentSession((session) => {
      const stopTiming = Date.now() - REQUEST_TIMEOUT_MS;
      session.messages.forEach((m) => {
        // check if should stop all stale messages
        if (m.isError || new Date(m.date).getTime() < stopTiming) {
          if (m.streaming) {
            m.streaming = false;
          }

          if (m.content.length === 0) {
            m.isError = true;
            m.content = prettyObject({
              error: true,
              message: "empty response",
            });
          }
        }
      });

      // auto sync mask config from global config
      if (session.mask.syncGlobalConfig) {
        session.mask.modelConfig = { ...config.modelConfig };
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // check if should send message
  const onInputKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // if ArrowUp and no userInput, fill with last input
    if (
      e.key === "ArrowUp" &&
      userInput.length <= 0 &&
      !(e.metaKey || e.altKey || e.ctrlKey)
    ) {
      setUserInput(localStorage.getItem(LAST_INPUT_KEY) ?? "");
      e.preventDefault();
      return;
    }
    if (shouldSubmit(e) && promptHints.length === 0) {
      doSubmit(userInput, false);
      e.preventDefault();
    }
  };
  const onRightClick = (e: any, message: ChatMessage) => {
    // copy to clipboard
    if (selectOrCopy(e.currentTarget, message.content)) {
      e.preventDefault();
    }
  };

  //recording

  const [recording, setRecording] = useState(false);
  const [barding, setBarding] = useState(false);
  const [clauding, setClauding] = useState(false);
  const [chinese, setChinese] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [duckduckgo, setDuckDuckGo] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [speechLog, setSpeechLog] = useState<string | null>(null);

  const onSpeechError = useCallback((e: any) => {
    setSpeechError(e.message);
    try {
      speechRecognition?.stop();
    } catch (e) {}
    setRecording(false);
  }, []);

  const onSpeechStart = useCallback(async () => {
    let granted = false;
    let denied = false;

    try {
      const result = await navigator.permissions.query({
        name: "microphone" as any,
      });
      if (result.state == "granted") {
        granted = true;
      } else if (result.state == "denied") {
        denied = true;
      }
    } catch (e) {
      console.log(e);
    }

    if (!granted && !denied) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: false,
          audio: true,
        });
        stream.getTracks().forEach((track) => track.stop());
        granted = true;
      } catch (e) {
        denied = true;
      }
    }

    if (denied) {
      onSpeechError(new Error("speech permission was not granted"));
      return;
    }

    try {
      if (!recording) {
        setSpeechRecognition();
        if (speechRecognition) {
          speechRecognition.interimResults = false;
          speechRecognition.continuous = false;
          speechRecognition.maxAlternatives = 1;
          speechRecognition.lang = chinese ? "zh-CN" : "en-US";
          speechRecognition.onresult = (event) => {
            let transcript = "";
            if (
              event.results[event.results.length - 1].isFinal &&
              event.results[event.results.length - 1][0].confidence
            ) {
              transcript +=
                event.results[event.results.length - 1][0].transcript;
            }
            if (/*transcript != ""*/ 1) {
              doSubmit(transcript, true);
            }
          };
          speechRecognition.onstart = () => {
            setRecording(true);
          };
          speechRecognition.onend = () => {
            setRecording(false);
            if (speechRecognition) speechRecognition.stop();
          };
          speechRecognition.start();
        } else {
          onSpeechError(new Error("1not supported"));
        }
      } else {
        if (speechRecognition) {
          speechRecognition.stop();
          setRecording(false);
        } else {
          setRecording(false);
          onSpeechError(new Error("2not supported"));
        }
      }
    } catch (e) {
      setRecording(false);
      onSpeechError(e);
    }
  }, [recording, onSpeechError]);

  useEffect(() => {
    if (speechError) toast(speechError);
  }, [speechError]);
  useEffect(() => {
    if (speechLog) toast(speechLog);
  }, [speechLog]);

  const findLastUserIndex = (messageId: number) => {
    // find last user input message and resend
    let lastUserMessageIndex: number | null = null;
    for (let i = 0; i < session.messages.length; i += 1) {
      const message = session.messages[i];
      if (message.id === messageId) {
        break;
      }
      if (message.role === "user") {
        lastUserMessageIndex = i;
      }
    }

    return lastUserMessageIndex;
  };

  const deleteMessage = (userIndex: number) => {
    chatStore.updateCurrentSession((session) =>
      session.messages.splice(userIndex, 2),
    );
  };

  const onDelete = (botMessageId: number) => {
    const userIndex = findLastUserIndex(botMessageId);
    if (userIndex === null) return;
    deleteMessage(userIndex);
  };

  const onResend = (botMessageId: number) => {
    // find last user input message and resend
    const userIndex = findLastUserIndex(botMessageId);
    if (userIndex === null) return;

    setIsLoading(true);
    const content = session.messages[userIndex].content;
    deleteMessage(userIndex);
    chatStore
      .onUserInput(content, false, barding, clauding, duckduckgo, onSpeechStart)
      .then(() => setIsLoading(false));
    inputRef.current?.focus();
  };

  const context: RenderMessage[] = session.mask.hideContext
    ? []
    : session.mask.context.slice();

  const accessStore = useAccessStore();

  if (
    context.length === 0 &&
    session.messages.at(0)?.content !== BOT_HELLO.content
  ) {
    const copiedHello = Object.assign({}, BOT_HELLO);
    if (!accessStore.isAuthorized()) {
      copiedHello.content = Locale.Error.Unauthorized;
    }
    context.push(copiedHello);
  }

  // clear context index = context length + index in messages
  const clearContextIndex =
    (session.clearContextIndex ?? -1) >= 0
      ? session.clearContextIndex! + context.length
      : -1;

  // preview messages
  const messages = context
    .concat(session.messages as RenderMessage[])
    .concat(
      isLoading
        ? [
            {
              ...createMessage({
                role: "assistant",
                content: "……",
              }),
              preview: true,
            },
          ]
        : [],
    )
    .concat(
      userInput.length > 0 && config.sendPreviewBubble
        ? [
            {
              ...createMessage({
                role: "user",
                content: userInput,
              }),
              preview: true,
            },
          ]
        : [],
    );

  const renameSession = () => {
    const newTopic = prompt(Locale.Chat.Rename, session.topic);
    if (newTopic && newTopic !== session.topic) {
      chatStore.updateCurrentSession((session) => (session.topic = newTopic!));
    }
  };

  const location = useLocation();
  const isChat = location.pathname === Path.Chat;
  const autoFocus = !isMobileScreen || isChat; // only focus in chat page

  useCommand({
    fill: setUserInput,
    submit: (text) => {
      doSubmit(text, false);
    },
  });

  return (
    <div className="bg-[#ebebeb] dark:bg-[#202227] flex justify-center w-full h-screen min-h-fit p-3 md:p-6 lg:gap-6">
      <SideBar />
      <div className="w-full flex-1 h-full">
        <div className="rounded-[10px] bg-white dark:bg-[#0E0F13] p-3 md:p-4 h-full flex flex-col overflow-auto">
          <SubAlertModal
            modalState={modalState}
            setModalState={setModalState}
          />
          <div className="pt-8 px-3 md:p-4">
            <div
              className="font-bold dark:text-white text-[28px] tracking-[0] leading-[normal]"
              onClickCapture={renameSession}
            >
              {!session.topic ? DEFAULT_TOPIC : session.topic}
            </div>
            <div className="left-0  font-medium text-[#808080] dark:text-white text-sm tracking-[0] leading-[26px] whitespace-nowrap">
              {Locale.Chat.SubTitle(session.messages.length)}
            </div>
          </div>
          {/* <div className="window-header">
            <div className="window-header-title">
              <div
                className={`window-header-main-title " ${styles["chat-body-title"]}`}
                onClickCapture={renameSession}
              >
                {!session.topic ? DEFAULT_TOPIC : session.topic}
              </div>
            </div>
            <div className="window-actions">
              <div className={"window-action-button" + " " + styles.mobile}>
                <IconButton
                  icon={<ReturnIcon />}
                  bordered
                  title={Locale.Chat.Actions.ChatList}
                  onClick={() => navigate(Path.Home)}
                />
              </div>
              <div className="window-action-button">
                <IconButton
                  icon={<RenameIcon />}
                  bordered
                  onClick={renameSession}
                />
              </div>
              <div className="window-action-button">
                <IconButton
                  icon={<ExportIcon />}
                  bordered
                  title={Locale.Chat.Actions.Export}
                  onClick={() => {
                    setShowExport(true);
                  }}
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
              <IconButton
                text={Locale.Chat.Actions.Logout}
                onClick={() => {
                  localStorage.clear();
                  navigate(Path.Login);
                }}
              />
            </div>

            <PromptToast
              showToast={!hitBottom}
              showModal={showPromptModal}
              setShowModal={setShowPromptModal}
            />
          </div> */}
          <div className="flex-1 w-full overflow-auto">
            <div
              className="h-full"
              ref={scrollRef}
              onScroll={(e) => onChatBodyScroll(e.currentTarget)}
              onMouseDown={() => inputRef.current?.blur()}
              onWheel={(e) => setAutoScroll(hitBottom && e.deltaY > 0)}
              onTouchStart={() => {
                inputRef.current?.blur();
                setAutoScroll(false);
              }}
            >
              {messages.map((message, i) => {
                const isUser = message.role === "user";
                const showActions =
                  !isUser &&
                  i > 0 &&
                  !(message.preview || message.content.length === 0);
                const showTyping = message.preview || message.streaming;

                const shouldShowClearContextDivider: boolean =
                  i === clearContextIndex - 1;

                return (
                  <>
                    <div key={i}>
                      <div className="flex items-start w-full mt-4 gap-4">
                        <div>
                          {message.role === "user" ? (
                            <Avatar avatar={config.avatar} />
                          ) : (
                            <MaskAvatar mask={session.mask} />
                          )}
                        </div>
                        {showTyping && (
                          <div className="font-[12px] mt-[5px]">
                            {Locale.Chat.Typing}
                          </div>
                        )}
                        <div
                          className={
                            message.role === "user"
                              ? "w-full max-w-6xl dark:text-white bg-[#EEEEEE] dark:bg-[#202227] py-3 px-4 rounded-lg"
                              : "w-full max-w-6xl dark:text-white bg-[#EEEEEE] dark:bg-[#1A1D15] py-3 px-4 rounded-lg"
                          }
                        >
                          {showActions && (
                            <div className="flex flex-row-reverse w-full pt-[5px] box-border">
                              {message.streaming ? (
                                <div
                                  className="flex flex-wrap mt-3 mb-0"
                                  onClick={() => onUserStop(message.id ?? i)}
                                >
                                  {Locale.Chat.Actions.Stop}
                                </div>
                              ) : (
                                <>
                                  {/* <div
                                  className=""
                                  onClick={() => onDelete(message.id ?? i)}
                                >
                                  {Locale.Chat.Actions.Delete}
                                </div> */}
                                  {/* <div
                                  className=""
                                  onClick={() => onResend(message.id ?? i)}
                                >
                                  {Locale.Chat.Actions.Retry}
                                </div> */}
                                </>
                              )}

                              <div
                                className=""
                                onClick={() => copyToClipboard(message.content)}
                              >
                                <img src="/images/copy.svg" />
                              </div>
                            </div>
                          )}
                          <Markdown
                            content={message.content}
                            loading={
                              (message.preview ||
                                message.content.length === 0) &&
                              !isUser
                            }
                            onContextMenu={(e: any) => onRightClick(e, message)}
                            onDoubleClickCapture={() => {
                              if (!isMobileScreen) return;
                              setUserInput(message.content);
                            }}
                            fontSize={fontSize}
                            parentRef={scrollRef}
                            color={"text-white"}
                            defaultShow={i >= messages.length - 10}
                          />
                        </div>
                      </div>
                      {!isUser && !message.preview && (
                        <div className="flex justify-end box-border font-[12px]">
                          <div className="text-[#aaa] text-sm">
                            {message.date.toLocaleString()}
                          </div>
                        </div>
                      )}
                    </div>
                    {shouldShowClearContextDivider && <ClearContextDivider />}
                  </>
                );
              })}
            </div>
          </div>
          <div className="border-t border-[#a1a1a1] dark:border-[#444444] rounded-2xl pt-4 px-2 md:p-4 ">
            <div>
              <PromptHints
                prompts={promptHints}
                onPromptSelect={onPromptSelect}
              />

              <ChatActions
                showPromptModal={() => setShowPromptModal(true)}
                scrollToBottom={scrollToBottom}
                hitBottom={hitBottom}
                recording={recording}
                barding={barding}
                clauding={clauding}
                chinese={chinese}
                speaking={speaking}
                duckduckgoing={duckduckgo}
                showPromptHints={() => {
                  // Click again to close
                  if (promptHints.length > 0) {
                    setPromptHints([]);
                    return;
                  }

                  inputRef.current?.focus();
                  setUserInput("/");
                  onSearch("");
                }}
                onSpeechStart={onSpeechStart}
                onBarding={() => {
                  setClauding(false);
                  setBarding(!barding);
                }}
                onChinese={() => setChinese(!chinese)}
                onClauding={() => {
                  setClauding(!clauding);
                  setBarding(false);
                }}
                onDuckDuckGo={() => setDuckDuckGo(!duckduckgo)}
                setSpeaking={setSpeaking}
              />
              <div className={styles["chat-input-panel-inner" + "w-full"]}>
                <div className="ring-1 ring-[#a1a1a1] dark:ring-[#33363E] flex items-start gap-3 p-2 rounded-xl">
                  <textarea
                    ref={inputRef}
                    className="h-full w-full  bg-white dark:bg-[#0E0F13] p-2 outline-none max-h-[200px] overflow-y-scroll resize-none"
                    placeholder={Locale.Chat.Input(submitKey)}
                    onInput={(e) => onInput(e.currentTarget.value)}
                    value={userInput}
                    onKeyDown={onInputKeyDown}
                    onFocus={() => setAutoScroll(true)}
                    onBlur={() => setAutoScroll(false)}
                    rows={inputRows}
                    autoFocus={autoFocus}
                  />
                  <button onClick={() => doSubmit(userInput, false)}>
                    <img
                      src="/images/send.svg"
                      className="m-2 w-[28px] h-[28px]"
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {showExport && (
            <ExportMessageModal onClose={() => setShowExport(false)} />
          )}
        </div>
      </div>
    </div>
  );
}
