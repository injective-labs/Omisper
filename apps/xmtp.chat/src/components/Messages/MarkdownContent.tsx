import { Markdown } from "@/components/Markdown";
import classes from "./MarkdownContent.module.css";

export type MarkdownContentProps = {
  content: string;
};

export const MarkdownContent: React.FC<MarkdownContentProps> = ({
  content,
}) => {
  return (
    <div
      className={classes.root}
      onClick={(event) => {
        event.stopPropagation();
      }}>
      <Markdown markdown={content} />
    </div>
  );
};
