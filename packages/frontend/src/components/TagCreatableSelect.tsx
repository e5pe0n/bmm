import chroma from "chroma-js";
import type { GroupBase, StylesConfig } from "react-select";
import type { CreatableProps } from "react-select/creatable";
import CreatableSelect from "react-select/creatable";
import type { Tag } from "../features/tag";

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
    // @ts-expect-error
    if (data.__isNew__) {
      return base;
    }

    const color = chroma(data.color);
    return {
      ...base,
      marginBottom: "2px",
      borderLeft: `2px solid ${data.color}`,
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
      borderLeft: `2px solid ${data.color}`,
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
