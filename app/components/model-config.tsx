import { ALL_MODELS, ModalConfigValidator, ModelConfig } from "../store";

import Locale from "../locales";
import { InputRange } from "./input-range";
import { List, ListItem, Select } from "./ui-lib";

export function ModelConfigList(props: {
  modelConfig: ModelConfig;
  updateConfig: (updater: (config: ModelConfig) => void) => void;
}) {
  return (
    <>
      <ListItem title={Locale.Settings.Model} className="bg-white p-3 rounded-[10px] mt-2">
        <Select
          value={props.modelConfig.model}
          onChange={(e) => {
            props.updateConfig(
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
      <ListItem
        title={Locale.Settings.Temperature.Title}
        subTitle={Locale.Settings.Temperature.SubTitle}
        className="bg-white p-3 rounded-[10px] mt-2"
      >
        <InputRange
          value={props.modelConfig.temperature?.toFixed(1)}
          min="0"
          max="1" // lets limit it to 0-1
          step="0.1"
          onChange={(e) => {
            props.updateConfig(
              (config) =>
                (config.temperature = ModalConfigValidator.temperature(
                  e.currentTarget.valueAsNumber,
                )),
            );
          }}
        ></InputRange>
      </ListItem>
      <ListItem
        title={Locale.Settings.MaxTokens.Title}
        subTitle={Locale.Settings.MaxTokens.SubTitle}
        className="bg-white p-3 rounded-[10px] mt-2"
      >
        <input
          type="number"
          min={100}
          max={32000}
          value={props.modelConfig.max_tokens}
          onChange={(e) =>
            props.updateConfig(
              (config) =>
                (config.max_tokens = ModalConfigValidator.max_tokens(
                  e.currentTarget.valueAsNumber,
                )),
            )
          }
        ></input>
      </ListItem>
      <ListItem
        title={Locale.Settings.PresencePenalty.Title}
        subTitle={Locale.Settings.PresencePenalty.SubTitle}
        className="bg-white p-3 rounded-[10px] mt-2"
      >
        <InputRange
          value={props.modelConfig.presence_penalty?.toFixed(1)}
          min="-2"
          max="2"
          step="0.1"
          onChange={(e) => {
            props.updateConfig(
              (config) =>
                (config.presence_penalty =
                  ModalConfigValidator.presence_penalty(
                    e.currentTarget.valueAsNumber,
                  )),
            );
          }}
        ></InputRange>
      </ListItem>

      <ListItem
        title={Locale.Settings.HistoryCount.Title}
        subTitle={Locale.Settings.HistoryCount.SubTitle}
        className="bg-white p-3 rounded-[10px] mt-2"
      >
        <InputRange
          title={props.modelConfig.historyMessageCount.toString()}
          value={props.modelConfig.historyMessageCount}
          min="0"
          max="32"
          step="1"
          onChange={(e) =>
            props.updateConfig(
              (config) => (config.historyMessageCount = e.target.valueAsNumber),
            )
          }
        ></InputRange>
      </ListItem>

      <ListItem
        title={Locale.Settings.CompressThreshold.Title}
        subTitle={Locale.Settings.CompressThreshold.SubTitle}
        className="bg-white p-3 rounded-[10px] mt-2"
      >
        <input
          type="number"
          min={500}
          max={4000}
          value={props.modelConfig.compressMessageLengthThreshold}
          onChange={(e) =>
            props.updateConfig(
              (config) =>
                (config.compressMessageLengthThreshold =
                  e.currentTarget.valueAsNumber),
            )
          }
        ></input>
      </ListItem>
      <ListItem title={Locale.Memory.Title} subTitle={Locale.Memory.Send} className="bg-white p-3 rounded-[10px] mt-2">
        <input
          type="checkbox"
          checked={props.modelConfig.sendMemory}
          onChange={(e) =>
            props.updateConfig(
              (config) => (config.sendMemory = e.currentTarget.checked),
            )
          }
        ></input>
      </ListItem>
    </>
  );
}
