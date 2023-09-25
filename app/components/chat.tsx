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
import PromptIcon from "../icons/prompt.svg";
import MaskIcon from "../icons/mask.svg";
import MaxIcon from "../icons/max.svg";
import MinIcon from "../icons/min.svg";
import ResetIcon from "../icons/reload.svg";
import BreakIcon from "../icons/break.svg";
import SettingsIcon from "../icons/chat-settings.svg";
import MicrophoneIcon from "../icons/microphone.svg";
import MicrophoneOffIcon from "../icons/microphone_off.svg";
import GoogleBardIcon from "../icons/google-bard-on.svg";
import GoogleBardOffIcon from "../icons/google-bard-off.svg";
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

import { ListItem, Modal, Select, showToast } from "./ui-lib";
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
    <div className={styles["prompt-hints"]}>
      {props.prompts.map((prompt, i) => (
        <div
          ref={i === selectIndex ? selectedRef : null}
          className={
            styles["prompt-hint"] +
            ` ${i === selectIndex ? styles["prompt-hint-selected"] : ""}`
          }
          key={prompt.title + i.toString()}
          onClick={() => props.onPromptSelect(prompt)}
          onMouseEnter={() => setSelectIndex(i)}
        >
          <div className={styles["hint-title"]}>{prompt.title}</div>
          <div className={styles["hint-content"]}>{prompt.content}</div>
        </div>
      ))}
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

  return (
    <div className="flex flex-wrap">
      <Toaster />
      {couldStop && (
        <div
          className="p-3 mb-3 items-center font-[12px] rounded-[20px] bg-white inline-flex shadow-slate-500 shadow mr-1 cursor-pointer dark:bg-neutral-800 dark:shadow-slate-200"
          onClick={stopAll}
        >
          <StopIcon />
        </div>
      )}
      {!props.hitBottom && (
        <div
          className="p-3 mb-3 items-center font-[12px] rounded-[20px] bg-white inline-flex shadow-slate-500 shadow mr-1 cursor-pointer dark:bg-neutral-800 dark:shadow-slate-200"
          onClick={props.scrollToBottom}
        >
          <BottomIcon />
        </div>
      )}
      {/* {props.hitBottom && (
        <div
          className="p-3 mb-3 items-center font-[12px] rounded-[20px] bg-white inline-flex shadow-slate-500 shadow mr-1 cursor-pointer dark:bg-neutral-800 dark:shadow-slate-200"
          onClick={props.showPromptModal}
        >
          <SettingsIcon />
        </div>
      )} */}

      {/* <div
        className="p-3 mb-3 items-center font-[12px] rounded-[20px] bg-white inline-flex shadow-slate-500 shadow mr-1 cursor-pointer dark:bg-neutral-800 dark:shadow-slate-200"
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
        className="p-3 mb-3 items-center font-[12px] rounded-[20px] bg-white inline-flex shadow-slate-500 shadow mr-1 cursor-pointer dark:bg-neutral-800 dark:shadow-slate-200"
        onClick={props.showPromptHints}
      >
        <PromptIcon />
      </div>

      <div
        className="p-3 mb-3 items-center font-[12px] rounded-[20px] bg-white inline-flex shadow-slate-500 shadow mr-1 cursor-pointer dark:bg-neutral-800 dark:shadow-slate-200"
        onClick={() => {
          navigate(Path.Masks);
        }}
      >
        <MaskIcon />
      </div>

      <div
        className="p-3 mb-3 items-center font-[12px] rounded-[20px] bg-white inline-flex shadow-slate-500 shadow mr-1 cursor-pointer dark:bg-neutral-800 dark:shadow-slate-200"
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
        <BreakIcon />
      </div>

      <div
        className="p-3 mb-3 items-center font-[12px] rounded-[20px] bg-white inline-flex shadow-slate-500 shadow mr-1 cursor-pointer dark:bg-neutral-800 dark:shadow-slate-200"
        onClick={props.onSpeechStart}
      >
        {props.recording ? <MicrophoneIcon /> : <MicrophoneOffIcon />}
      </div>

      <div
        className="p-3 mb-3 items-center font-[12px] rounded-[20px] bg-white inline-flex shadow-slate-500 shadow mr-1 cursor-pointer dark:bg-neutral-800 dark:shadow-slate-200"
        onClick={props.onBarding}
      >
        {props.barding ? <GoogleBardIcon /> : <GoogleBardOffIcon />}
      </div>

      <div
        className="p-3 mb-3 items-center font-[12px] rounded-[20px] bg-white inline-flex shadow-slate-500 shadow mr-1 cursor-pointer dark:bg-neutral-800 dark:shadow-slate-200"
        onClick={props.onClauding}
      >
        {props.clauding ? (
          <ClaudeIcon className="w-[16px]" />
        ) : (
          <ClaudeOffIcon className="w-[16px]" />
        )}
      </div>

      <div
        className="p-3 mb-3 items-center font-[12px] rounded-[20px] bg-white inline-flex shadow-slate-500 shadow mr-1 cursor-pointer dark:bg-neutral-800 dark:shadow-slate-200"
        onClick={props.onDuckDuckGo}
      >
        {props.duckduckgoing ? <DuckDuckGoIcon /> : <DuckDuckGoOffIcon />}
      </div>

      <div>
        <ListItem className="h-3 dark:text-slate-700 text-black">
          <Select
            value={editingMask?.modelConfig.model}
            onChange={(e) => {
              updateConfig(
                (config) =>
                  (config.model = ModalConfigValidator.model(
                    e.currentTarget.value,
                  )),
              );
            }}
          >
            {ALL_MODELS.map((v) => (
              <option value={v.name} key={v.name} disabled={!v.available}>
                {v.name}
              </option>
            ))}
          </Select>
        </ListItem>
      </div>

      {/* <div
        className="p-3 mb-3 items-center font-[12px] rounded-[20px] bg-white inline-flex shadow-slate-500 shadow mr-1 cursor-pointer dark:bg-neutral-800 dark:shadow-slate-200"
        onClick={props.onChinese}
      >
        {props.chinese ? <ChineseIcon /> : <EnglishIcon />}
      </div> */}

      {/* <div className="p-3 mb-3 items-center font-[12px] rounded-[20px] bg-white inline-flex shadow-slate-500 shadow mr-1 cursor-pointer dark:bg-neutral-800 dark:shadow-slate-200">
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
  const [inputRows, setInputRows] = useState(2);
  const measure = useDebouncedCallback(
    () => {
      const rows = inputRef.current ? autoGrowTextArea(inputRef.current) : 1;
      const inputRows = Math.min(
        20,
        Math.max(2 + Number(!isMobileScreen), rows),
      );
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
    <div className="bg-[#ebebeb] dark:bg-neutral-800 flex-row justify-center w-full h-full flex items-center">
      <SideBar />
      <div className="w-4/5 p-3 h-[95%]">
        <div className="rounded-[10px] bg-white dark:bg-neutral-950">
          <SubAlertModal
            modalState={modalState}
            setModalState={setModalState}
          />
          <div className="pt-5 pl-3">
            <div
              className="top-0 left-0 [font-family:'Mulish-ExtraBold',Helvetica] font-extrabold dark:text-white text-[28px] tracking-[0] leading-[normal]"
              onClickCapture={renameSession}
            >
              {!session.topic ? DEFAULT_TOPIC : session.topic}
            </div>
            <div className="left-0 [font-family:'Mulish-Medium',Helvetica] font-medium dark:text-white text-[16px] tracking-[0] leading-[26px] whitespace-nowrap">
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

          <div
            className={styles["chat-body"] + " h-[400px]"}
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
                    <div className="flex items-start">
                      <div className="mt-5">
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
                            ? "max-w-3xl ml-10 mt-3 mb-3 dark:text-white dark:bg-neutral-900 p-2 rounded-2xl"
                            : "w-full max-w-6xl ml-3 dark:text-white dark:bg-[#1A1D15] p-2 rounded-2xl"
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
                            (message.preview || message.content.length === 0) &&
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
                      {!isUser && !message.preview && (
                        <div className="flex flex-row-reverse w-1/3 pt-1 box-border font-[12px]">
                          <div className="text-[#aaa] text-[8px]">
                            {message.date.toLocaleString()}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  {shouldShowClearContextDivider && <ClearContextDivider />}
                </>
              );
            })}
          </div>

          <div className={styles["chat-input-panel"]}>
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
            <div className={styles["chat-input-panel-inner"] + "absolute"}>
              {/* <IconButton
                icon={<SendWhiteIcon className="w-10 h-9" />}
                className="bg-slate-400 text-black fixed right-16 bottom-10 w-12"
                onClick={() => doSubmit(userInput, false)}
              /> */}
              <textarea
                ref={inputRef}
                className="border-1 h-full w-full rounded-[10px] border-neutral-500 bg-white dark:bg-neutral-950 shadow dark:shadow-slate-300 pl-3 pr-24 pb-4 pt-3"
                placeholder={Locale.Chat.Input(submitKey)}
                onInput={(e) => onInput(e.currentTarget.value)}
                value={userInput}
                onKeyDown={onInputKeyDown}
                onFocus={() => setAutoScroll(true)}
                onBlur={() => setAutoScroll(false)}
                rows={inputRows}
                autoFocus={autoFocus}
              />
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
