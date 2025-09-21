import { range } from "@e5pe0n/ts-lib";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { bookmarkSchema } from "../../features/bookmark";
import BookmarkTable from "./BookmarkTable";

const meta = {
  title: "routes/-components/BookmarkTable",
  component: BookmarkTable,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof BookmarkTable>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Default: Story = {
  args: {
    bookmarks: range(20).map((i) => ({
      id: bookmarkSchema.shape.id.parse(i + 1),
      title: `bookmark${i.toString().padStart(2, "0")}`,
      url: `https://example.com/${i.toString().padStart(2, "0")}`,
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    })),
    tags: [],
    values: [],
    onChange: fn(),
  },
};

export const Pages100: Story = {
  args: {
    bookmarks: range(100).map((i) => ({
      id: bookmarkSchema.shape.id.parse(i + 1),
      title: `bookmark${i.toString().padStart(2, "0")}`,
      url: `https://example.com/${i.toString().padStart(2, "0")}`,
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    })),
    tags: [],
    values: [],
    onChange: fn(),
  },
};

export const Pages1: Story = {
  args: {
    bookmarks: range(5).map((i) => ({
      id: bookmarkSchema.shape.id.parse(i + 1),
      title: `bookmark${i.toString().padStart(2, "0")}`,
      url: `https://example.com/${i.toString().padStart(2, "0")}`,
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    })),
    tags: [],
    values: [],
    onChange: fn(),
  },
};
