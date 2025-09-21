import type { Meta, StoryObj } from "@storybook/react-vite";

import { tagSchema } from "../features/tag";
import TagCreatableSelect, {
  type TagCreatableSelectProps,
} from "./TagCreatableSelect";

const meta = {
  title: "components/TagCreatableSelect",
  component: TagCreatableSelect,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: {
    className: "w-lg",
  },
} satisfies Meta<typeof TagCreatableSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

const options: TagCreatableSelectProps["options"] = [
  {
    value: tagSchema.shape.id.parse(1),
    label: "Linux",
    color: tagSchema.shape.color.parse("#0000ff"),
  },
  {
    value: tagSchema.shape.id.parse(2),
    label: "Rust",
    color: tagSchema.shape.color.parse("#00ff00"),
  },
  {
    value: tagSchema.shape.id.parse(3),
    label: "TypeScript",
    color: tagSchema.shape.color.parse("#ff0000"),
  },
];

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Default: Story = {
  args: {
    options,
    // @ts-expect-error
    defaultValue: [options[0], options[1]],
  },
};
