import type { ComponentProps } from "react";
import type { Tag as ITag } from "../features/tag";
import chroma from "chroma-js";

export type TagProps = ComponentProps<"div"> & {
  tag: ITag;
};

export default function Tag({ tag }: TagProps) {
  return (
    <div
      className="px-2"
      style={{
        borderLeft: `2px solid ${tag.color}`,
        backgroundColor: chroma(tag.color).alpha(0.1).css(),
      }}
    >
      {tag.name}
    </div>
  );
}
