import { useState, useEffect, useMemo, HTMLProps, useRef } from "react";

import styles from "./settings.module.scss";

import ResetIcon from "../icons/reload.svg";
import AddIcon from "../icons/add.svg";
import CloseIcon from "../icons/close.svg";
import CopyIcon from "../icons/copy.svg";
import ClearIcon from "../icons/clear.svg";
import LoadingIcon from "../icons/three-dots.svg";
import EditIcon from "../icons/edit.svg";
import EyeIcon from "../icons/eye.svg";
import {
  Input,
  List,
  ListItem,
  Modal,
  PasswordInput,
  Popover,
  Select,
} from "./ui-lib";
import { ModelConfigList } from "./model-config";

import { IconButton } from "./button";
import {
  SubmitKey,
  useChatStore,
  Theme,
  useUpdateStore,
  useAccessStore,
  useAppConfig,
} from "../store";

import Locale, {
  AllLangs,
  ALL_LANG_OPTIONS,
  changeLang,
  getLang,
} from "../locales";
import { copyToClipboard } from "../utils";
import Link from "next/link";
import { Path, UPDATE_URL } from "../constant";
import { Prompt, SearchService, usePromptStore } from "../store/prompt";
import { ErrorBoundary } from "./error";
import { InputRange } from "./input-range";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarPicker } from "./emoji";
import { SideBar } from "./sidebar";

function EditPromptModal(props: { id: number; onClose: () => void }) {
  const promptStore = usePromptStore();
  const prompt = promptStore.get(props.id);
  return prompt ? (
    <div className="fixed top-0 left-0 h-screen w-screen bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="fixed bg-white dark:bg-[#7d7d7d30] h-[400px] w-[800px] rounded-[10px]">
        <Modal
          title={Locale.Settings.Prompt.EditModal.Title}
          onClose={props.onClose}
          actions={[
            <IconButton
              key=""
              onClick={props.onClose}
              text={Locale.UI.Confirm}
              bordered
            />,
          ]}
        >
          <div className={styles["edit-prompt-modal"]}>
            <input
              type="text"
              value={prompt.title}
              readOnly={!prompt.isUser}
              className={styles["edit-prompt-title"]}
              onInput={(e) =>
                promptStore.update(
                  props.id,
                  (prompt) => (prompt.title = e.currentTarget.value),
                )
              }
            ></input>
            <Input
              value={prompt.content}
              readOnly={!prompt.isUser}
              className={styles["edit-prompt-content"]}
              rows={10}
              onInput={(e) =>
                promptStore.update(
                  props.id,
                  (prompt) => (prompt.content = e.currentTarget.value),
                )
              }
            ></Input>
          </div>
        </Modal>
      </div>
    </div>
  ) : null;
}

function UserPromptModal(props: { onClose?: () => void }) {
  const promptStore = usePromptStore();
  const userPrompts = promptStore.getUserPrompts();
  const builtinPrompts = SearchService.builtinPrompts;
  const allPrompts = userPrompts.concat(builtinPrompts);
  const [searchInput, setSearchInput] = useState("");
  const [searchPrompts, setSearchPrompts] = useState<Prompt[]>([]);
  const prompts = searchInput.length > 0 ? searchPrompts : allPrompts;

  const [editingPromptId, setEditingPromptId] = useState<number>();

  useEffect(() => {
    if (searchInput.length > 0) {
      const searchResult = SearchService.search(searchInput);
      setSearchPrompts(searchResult);
    } else {
      setSearchPrompts([]);
    }
  }, [searchInput]);

  return (
    <div className="fixed top-0 left-0 h-screen w-screen bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="fixed bg-white dark:bg-[#7d7d7d30] h-[400px] w-[800px] rounded-[10px]">
        <Modal
          title={Locale.Settings.Prompt.Modal.Title}
          onClose={() => props.onClose?.()}
          actions={[
            <IconButton
              key="add"
              onClick={() =>
                promptStore.add({
                  title: "Empty Prompt",
                  content: "Empty Prompt Content",
                })
              }
              icon={<AddIcon />}
              bordered
              text={Locale.Settings.Prompt.Modal.Add}
            />,
          ]}
        >
          <div className={styles["user-prompt-modal"]}>
            <input
              type="text"
              className={styles["user-prompt-search"]}
              placeholder={Locale.Settings.Prompt.Modal.Search}
              value={searchInput}
              onInput={(e) => setSearchInput(e.currentTarget.value)}
            ></input>

            <div className={styles["user-prompt-list"]}>
              {prompts.map((v, _) => (
                <div
                  className={styles["user-prompt-item"]}
                  key={v.id ?? v.title}
                >
                  <div className={styles["user-prompt-header"]}>
                    <div className={styles["user-prompt-title"]}>{v.title}</div>
                    <div
                      className={styles["user-prompt-content"] + " one-line"}
                    >
                      {v.content}
                    </div>
                  </div>

                  <div className={styles["user-prompt-buttons"]}>
                    {v.isUser && (
                      <IconButton
                        icon={<ClearIcon />}
                        className={styles["user-prompt-button"]}
                        onClick={() => promptStore.remove(v.id!)}
                      />
                    )}
                    {v.isUser ? (
                      <IconButton
                        icon={<EditIcon />}
                        className={styles["user-prompt-button"]}
                        onClick={() => setEditingPromptId(v.id)}
                      />
                    ) : (
                      <IconButton
                        icon={<EyeIcon />}
                        className={styles["user-prompt-button"]}
                        onClick={() => setEditingPromptId(v.id)}
                      />
                    )}
                    <IconButton
                      icon={<CopyIcon />}
                      className={styles["user-prompt-button"]}
                      onClick={() => copyToClipboard(v.content)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Modal>
      </div>

      {editingPromptId !== undefined && (
        <EditPromptModal
          id={editingPromptId!}
          onClose={() => setEditingPromptId(undefined)}
        />
      )}
    </div>
  );
}

function formatVersionDate(t: string) {
  const d = new Date(+t);
  const year = d.getUTCFullYear();
  const month = d.getUTCMonth() + 1;
  const day = d.getUTCDate();

  return [
    year.toString(),
    month.toString().padStart(2, "0"),
    day.toString().padStart(2, "0"),
  ].join("");
}

export function Settings() {
  const navigate = useNavigate();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const config = useAppConfig();
  const updateConfig = config.update;
  const resetConfig = config.reset;
  const chatStore = useChatStore();

  const updateStore = useUpdateStore();
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const currentVersion = formatVersionDate(updateStore.version);
  const remoteId = formatVersionDate(updateStore.remoteVersion);
  const hasNewVersion = currentVersion !== remoteId;

  function checkUpdate(force = false) {
    setCheckingUpdate(true);
    updateStore.getLatestVersion(force).then(() => {
      setCheckingUpdate(false);
    });

    console.log(
      "[Update] local version ",
      new Date(+updateStore.version).toLocaleString(),
    );
    console.log(
      "[Update] remote version ",
      new Date(+updateStore.remoteVersion).toLocaleString(),
    );
  }

  const usage = {
    used: updateStore.used,
    subscription: updateStore.subscription,
  };
  const [loadingUsage, setLoadingUsage] = useState(false);
  function checkUsage(force = false) {
    setLoadingUsage(true);
    updateStore.updateUsage(force).finally(() => {
      setLoadingUsage(false);
    });
  }

  const accessStore = useAccessStore();
  const enabledAccessControl = useMemo(
    () => accessStore.enabledAccessControl(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const promptStore = usePromptStore();
  const builtinCount = SearchService.count.builtin;
  const customCount = promptStore.getUserPrompts().length ?? 0;
  const [shouldShowPromptModal, setShowPromptModal] = useState(false);

  const showUsage = accessStore.isAuthorized();
  useEffect(() => {
    // checks per minutes
    checkUpdate();
    showUsage && checkUsage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  return (
    <ErrorBoundary>
      <div className="bg-[#ebebeb] dark:bg-[#202227] flex flex-row items-start justify-center w-full p-5 gap-6 h-screen">
        <SideBar />
        <div className="w-full">
          <div className="rounded-[10px] bg-white dark:bg-[#0E0F13] p-8 height-container overflow-y-auto">
            <div className="window-header">
              <div className="pt-5 pl-3">
                <div className="flex justify-between mb-3">
                  <div>
                    <div className="top-0 left-0 font-extrabold dark:text-white text-[28px] tracking-[0] leading-[normal]">
                      {Locale.Settings.Title}
                    </div>
                    <div className="left-0 font-medium dark:text-white text-[16px] tracking-[0] leading-[26px] whitespace-nowrap">
                      {Locale.Settings.SubTitle}
                    </div>
                  </div>
                  <div className="flex p-4">
                    <button
                      className="bg-transparent text-[#353535] dark:text-white text-[16px] pr-4 opacity-90"
                      onClick={() => {
                        if (confirm(Locale.Settings.Actions.ConfirmResetAll)) {
                          resetConfig();
                        }
                      }}
                    >
                      Reset All Settings
                    </button>
                    <button
                      className="bg-[#ececec] dark:bg-[#303c4b30] p-2 rounded-[10px]"
                      onClick={() => {
                        if (confirm(Locale.Settings.Actions.ConfirmClearAll)) {
                          chatStore.clearAllData();
                        }
                      }}
                    >
                      <img src="/images/delete.svg" className="w-7" />
                    </button>
                  </div>
                </div>
              </div>
              {/*<div className="window-actions">
                <div className="window-action-button">
                  <IconButton
                    icon={<ClearIcon />}
                    onClick={() => {
                      if (confirm(Locale.Settings.Actions.ConfirmClearAll)) {
                        chatStore.clearAllData();
                      }
                    }}
                    bordered
                    title={Locale.Settings.Actions.ClearAll}
                  />
                </div>
                <div className="window-action-button">
                  <IconButton
                    icon={<ResetIcon />}
                    onClick={() => {
                      if (confirm(Locale.Settings.Actions.ConfirmResetAll)) {
                        resetConfig();
                      }
                    }}
                    bordered
                    title={Locale.Settings.Actions.ResetAll}
                  />
                </div>
                <div className="window-action-button">
                  <IconButton
                    icon={<CloseIcon />}
                    onClick={() => navigate(Path.Home)}
                    bordered
                    title={Locale.Settings.Actions.Close}
                  />
                </div>
              </div> */}
            </div>
            <div className="p-6 bg-[#afafaf30] dark:bg-[#303c4b30] rounded-xl">
              <List>
                <ListItem
                  title={Locale.Settings.Avatar}
                  className="bg-white dark:bg-[#7d7d7d30] !px-10 !py-5 rounded-[10px] mt-2"
                >
                  <Popover
                    onClose={() => setShowEmojiPicker(false)}
                    content={
                      <AvatarPicker
                        onEmojiClick={(avatar: string) => {
                          updateConfig((config) => (config.avatar = avatar));
                          setShowEmojiPicker(false);
                        }}
                      />
                    }
                    open={showEmojiPicker}
                  >
                    <div
                      className={styles.avatar}
                      onClick={() => setShowEmojiPicker(true)}
                    >
                      <Avatar avatar={config.avatar} />
                    </div>
                  </Popover>
                </ListItem>

                <ListItem
                  title={Locale.Settings.SendKey}
                  className="bg-white dark:bg-[#7d7d7d30] !px-10 !py-5 rounded-[10px] mt-2"
                >
                  <Select
                    value={config.submitKey}
                    onChange={(e) => {
                      updateConfig(
                        (config) =>
                          (config.submitKey = e.target
                            .value as any as SubmitKey),
                      );
                    }}
                  >
                    {Object.values(SubmitKey).map((v) => (
                      <option value={v} key={v}>
                        {v}
                      </option>
                    ))}
                  </Select>
                </ListItem>

                <ListItem
                  title={Locale.Settings.Theme}
                  className="bg-white dark:bg-[#7d7d7d30] !px-10 !py-5 rounded-[10px] mt-2"
                >
                  <Select
                    value={config.theme}
                    onChange={(e) => {
                      updateConfig(
                        (config) =>
                          (config.theme = e.target.value as any as Theme),
                      );
                    }}
                  >
                    {Object.values(Theme).map((v) => (
                      <option value={v} key={v}>
                        {v}
                      </option>
                    ))}
                  </Select>
                </ListItem>

                <ListItem
                  title={Locale.Settings.Lang.Name}
                  className="bg-white dark:bg-[#7d7d7d30] !px-10 !py-5 rounded-[10px] mt-2"
                >
                  <Select
                    value={getLang()}
                    onChange={(e) => {
                      changeLang(e.target.value as any);
                    }}
                  >
                    {AllLangs.map((lang) => (
                      <option value={lang} key={lang}>
                        {ALL_LANG_OPTIONS[lang]}
                      </option>
                    ))}
                  </Select>
                </ListItem>

                <ListItem
                  title={Locale.Settings.FontSize.Title}
                  subTitle={Locale.Settings.FontSize.SubTitle}
                  className="bg-white dark:bg-[#7d7d7d30] !px-10 !py-5 rounded-[10px] mt-2"
                >
                  <InputRange
                    title={`${config.fontSize ?? 16}px`}
                    value={config.fontSize}
                    min="1"
                    max="18"
                    step="1"
                    onChange={(e) =>
                      updateConfig(
                        (config) =>
                          (config.fontSize = Number.parseInt(
                            e.currentTarget.value,
                          )),
                      )
                    }
                  ></InputRange>
                </ListItem>

                <ListItem
                  title={Locale.Settings.SendPreviewBubble.Title}
                  subTitle={Locale.Settings.SendPreviewBubble.SubTitle}
                  className="bg-white dark:bg-[#7d7d7d30] !px-10 !py-5 rounded-[10px] mt-2"
                >
                  <input
                    type="checkbox"
                    checked={config.sendPreviewBubble}
                    onChange={(e) =>
                      updateConfig(
                        (config) =>
                          (config.sendPreviewBubble = e.currentTarget.checked),
                      )
                    }
                  ></input>
                </ListItem>

                <ListItem
                  title={Locale.Settings.Mask.Title}
                  subTitle={Locale.Settings.Mask.SubTitle}
                  className="bg-white dark:bg-[#7d7d7d30] !px-10 !py-5 rounded-[10px] mt-2"
                >
                  <input
                    type="checkbox"
                    checked={!config.dontShowMaskSplashScreen}
                    onChange={(e) =>
                      updateConfig(
                        (config) =>
                          (config.dontShowMaskSplashScreen =
                            !e.currentTarget.checked),
                      )
                    }
                  ></input>
                </ListItem>
              </List>

              <List>
                {enabledAccessControl ? (
                  <ListItem
                    title={Locale.Settings.AccessCode.Title}
                    subTitle={Locale.Settings.AccessCode.SubTitle}
                    className="bg-white dark:bg-[#7d7d7d30] !px-10 !py-5 rounded-[10px] mt-2"
                  >
                    <PasswordInput
                      value={accessStore.accessCode}
                      type="text"
                      placeholder={Locale.Settings.AccessCode.Placeholder}
                      onChange={(e) => {
                        accessStore.updateCode(e.currentTarget.value);
                      }}
                    />
                  </ListItem>
                ) : (
                  <></>
                )}

                {!accessStore.hideUserApiKey ? (
                  <ListItem
                    title={Locale.Settings.Token.Title}
                    subTitle={Locale.Settings.Token.SubTitle}
                    className="bg-white dark:bg-[#7d7d7d30] !px-10 !py-5 rounded-[10px] mt-2"
                  >
                    <PasswordInput
                      value={accessStore.token}
                      type="text"
                      placeholder={Locale.Settings.Token.Placeholder}
                      onChange={(e) => {
                        accessStore.updateToken(e.currentTarget.value);
                      }}
                    />
                  </ListItem>
                ) : null}

                <ListItem
                  title={Locale.Settings.Usage.Title}
                  subTitle={
                    showUsage
                      ? loadingUsage
                        ? Locale.Settings.Usage.IsChecking
                        : Locale.Settings.Usage.SubTitle(
                            usage?.used ?? "[?]",
                            usage?.subscription ?? "[?]",
                          )
                      : Locale.Settings.Usage.NoAccess
                  }
                  className="bg-white dark:bg-[#7d7d7d30] !px-10 !py-5 rounded-[10px] mt-2"
                >
                  {!showUsage || loadingUsage ? (
                    <div />
                  ) : (
                    <IconButton
                      icon={<ResetIcon></ResetIcon>}
                      text={Locale.Settings.Usage.Check}
                      onClick={() => checkUsage(true)}
                    />
                  )}
                </ListItem>
              </List>

              <List>
                <ListItem
                  title={Locale.Settings.Prompt.Disable.Title}
                  subTitle={Locale.Settings.Prompt.Disable.SubTitle}
                  className="bg-white dark:bg-[#7d7d7d30] !px-10 !py-5 rounded-[10px] mt-2"
                >
                  <input
                    type="checkbox"
                    checked={config.disablePromptHint}
                    onChange={(e) =>
                      updateConfig(
                        (config) =>
                          (config.disablePromptHint = e.currentTarget.checked),
                      )
                    }
                  ></input>
                </ListItem>

                <ListItem
                  title={Locale.Settings.Prompt.List}
                  subTitle={Locale.Settings.Prompt.ListCount(
                    builtinCount,
                    customCount,
                  )}
                  className="bg-white dark:bg-[#7d7d7d30] !px-10 !py-5 rounded-[10px] mt-2"
                >
                  <IconButton
                    icon={<EditIcon />}
                    text={Locale.Settings.Prompt.Edit}
                    onClick={() => setShowPromptModal(true)}
                  />
                </ListItem>
              </List>
            </div>
            <div className="p-6 bg-[#afafaf30] dark:bg-[#303c4b30] mt-10 rounded-xl">
              <List>
                <ModelConfigList
                  modelConfig={config.modelConfig}
                  updateConfig={(updater) => {
                    const modelConfig = { ...config.modelConfig };
                    updater(modelConfig);
                    config.update(
                      (config) => (config.modelConfig = modelConfig),
                    );
                  }}
                />
              </List>

              {shouldShowPromptModal && (
                <UserPromptModal onClose={() => setShowPromptModal(false)} />
              )}
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
