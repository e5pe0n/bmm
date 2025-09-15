import CreatableSelect from "react-select/creatable";
import type { CreatableProps } from "react-select/creatable";
import type { Tag } from "../features/tag";
import type { GroupBase, StylesConfig } from "react-select";
import chroma from "chroma-js";

type Option = {
  value: Tag["id"];
  label: Tag["name"];
  color: Tag["color"];
};

export type TagCreatableSelectProps = CreatableProps<
  Option,
  true,
  GroupBase<Option>
>;

const styles: StylesConfig<Option, true> = {
  option: (base, { data, isDisabled, isFocused, isSelected }) => {
    const color = chroma(data.color);
    return {
      ...base,
      marginBottom: "2px",
      borderLeft: `4px solid ${data.color}`,
      backgroundColor: isDisabled
        ? undefined
        : isSelected
          ? data.color
          : isFocused
            ? color.alpha(0.1).css()
            : undefined,
      cursor: isDisabled ? "not-allowed" : "default",
      ":active": {
        ...base[":active"],
        backgroundColor: !isDisabled
          ? isSelected
            ? data.color
            : color.alpha(0.3).css()
          : undefined,
      },
    };
  },
  multiValue: (base, { data }) => {
    const color = chroma(data.color);
    return {
      ...base,
      borderLeft: `4px solid ${data.color}`,
      backgroundColor: color.alpha(0.1).css(),
    };
  },
  multiValueRemove(base, { data }) {
    return {
      ...base,
      ":hover": {
        backgroundColor: data.color,
        color: "white",
      },
    };
  },
};

export default function TagCreatableSelect({
  ...props
}: TagCreatableSelectProps) {
  return <CreatableSelect isClearable isMulti styles={styles} {...props} />;
}
