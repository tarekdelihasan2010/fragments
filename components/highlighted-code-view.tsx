import { Copy, MessageSquarePlus, Pencil } from "lucide-react";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";

import { Button } from "./ui/button";
import { CodeView } from "./code-view";

export function HighlightedCodeView({
  code,
  lang,
  setChatInput,
}: {
  code: string;
  lang: string;
  setChatInput: Dispatch<SetStateAction<string>>;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const [selection, setSelection] = useState<string>("");
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(
    null
  );

  // 🔥 Calculate selection position
  const updateTooltipPosition = () => {
    const sel = window.getSelection();
    const text = sel?.toString() || "";

    if (!sel || !text || sel.rangeCount === 0) {
      setSelection("");
      setTooltipPos(null);
      return;
    }

    const range = sel.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    setSelection(text);

    setTooltipPos({
      x: rect.right,
      y: rect.top,
    });
  };

  const handleMouseUp = () => {
    updateTooltipPosition();
  };

  const handleMouseDown = () => {
    setTooltipPos(null);
  };

  useEffect(() => {
    const current = ref.current;
    current?.addEventListener("mouseup", handleMouseUp);
    current?.addEventListener("mousedown", handleMouseDown);

    window.addEventListener("scroll", updateTooltipPosition);

    return () => {
      current?.removeEventListener("mouseup", handleMouseUp);
      current?.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("scroll", updateTooltipPosition);
    };
  }, []);

  const handleAddToChat = () => {
    if (!selection) return;
    setChatInput((prev) => prev + selection);
    setTooltipPos(null);
  };

  const handleCopy = async () => {
    if (!selection) return;
    await navigator.clipboard.writeText(selection);
    setTooltipPos(null);
  };

  const handleEdit = () => {
    if (!selection) return;
    setChatInput(selection);
    setTooltipPos(null);
  };

  return (
    <div className="relative">
      <div ref={ref}>
        <CodeView code={code} lang={lang} />
      </div>

      {selection && tooltipPos && (
        <div
          style={{
            position: "fixed",
            top: tooltipPos.y,
            left: tooltipPos.x,
            zIndex: 1000,
          }}
          className="bg-popover border rounded-md shadow-lg p-2 animate-in fade-in"
        >
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleCopy}>
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>

            <Button variant="ghost" size="sm" onClick={handleAddToChat}>
              <MessageSquarePlus className="h-4 w-4 mr-2" />
              Add to Chat
            </Button>

            <Button variant="ghost" size="sm" onClick={handleEdit}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
