import CreatableSelect from "react-select/creatable";
import type { CreatableProps } from "react-select/creatable";
import type { Tag } from "../features/tag";
import type { GroupBase } from "react-select";

type Option = {
  value: Tag["id"];
  label: Tag["name"];
  color: Tag["color"];
};

type Props = CreatableProps<Option, true, GroupBase<Option>>;

export default function TagCreatableSelect({ ...props }: Props) {
  return <CreatableSelect isClearable {...props} />;
}
