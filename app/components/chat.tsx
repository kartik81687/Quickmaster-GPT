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

import { ListItem, Modal } from "./ui-lib";
import { useLocation, useNavigate } from "react-router-dom";
import { LAST_INPUT_KEY, Path, REQUEST_TIMEOUT_MS } from "../constant";
import { MaskConfig } from "./mask";
import { useMaskStore } from "../store/mask";
import { useCommand } from "../command";
import { prettyObject } from "../utils/format";

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
    <div className="bg-[#ebebeb] dark:bg-[#202227] flex justify-center w-full h-screen min-h-fit   lg:gap-6">
      <iframe
        src="https://koolgpt-replica.vercel.app/"
        className="w-full h-full border-0"
        title="Embedded Vercel Link"
      ></iframe>
      <noscript>
        <p>Unable to load the page. Please check the URL or deployment.</p>
      </noscript>
    </div>
  );
}
