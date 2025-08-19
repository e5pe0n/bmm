import { type ComponentPropsWithRef, useState } from "react";
import { useDebounce } from "react-use";

type Props = Omit<ComponentPropsWithRef<"input">, "type" | "onChange"> & {
  type: "text" | "search";
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  debounce?: number;
};

export default function DebouncedInputString(props: Props) {
  const [value, setValue] = useState<string>(props.defaultValue ?? "");

  const [,] = useDebounce(
    () => {
      props.onChange?.(value);
    },
    props.debounce ?? 500,
    [value],
  );

  return (
    <input
      {...props}
      value={value}
      onChange={({ currentTarget }) => {
        setValue(currentTarget.value);
      }}
    />
  );
}
