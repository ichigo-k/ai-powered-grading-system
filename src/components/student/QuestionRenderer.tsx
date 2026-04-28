"use client";

import { useEffect, useRef, useState } from "react";
import { saveAnswer } from "@/lib/assessment-actions";
import { Highlight, themes } from "prism-react-renderer";
import { FileText, Check } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type QuestionWithAnswer = {
  id: number;
  order: number;
  body: string;
  marks: number;
  answerType: string | null;
  options: unknown;
  sectionType: string;
  existingAnswer: {
    answerText: string | null;
    selectedOption: number | null;
    fileUrl: string | null;
  } | null;
};

interface QuestionRendererProps {
  question: QuestionWithAnswer;
  attemptId: number;
  shuffledOptions?: number[];
  locked?: boolean;
  onAnswerChange?: (
    questionId: number,
    payload: { answerText: string | null; selectedOption: number | null; fileUrl: string | null },
  ) => void;
}

const MAX_PDF_BYTES = 10 * 1024 * 1024;

// Poppins is loaded globally via next/font — use the CSS variable
const FONT_SANS = "var(--font-sans, 'Poppins', system-ui, sans-serif)";
// Monospace for code editor
const FONT_MONO = "'Cascadia Code', 'Fira Code', 'JetBrains Mono', 'Consolas', monospace";

const FONT_SIZE   = 13.5;   // px — single source of truth for code editor
const LINE_HEIGHT = 22;     // px — 13.5 * ~1.63, must be integer for pixel-perfect alignment
const GUTTER_W    = 44;     // px — line-number column width (padding-left of textarea)
const PAD_V       = 16;     // px — top/bottom padding inside editor

function parseOptions(raw: unknown): string[] {
  if (!raw) return [];
  try {
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (Array.isArray(parsed)) return parsed.map(String);
  } catch { /* ignore */ }
  return [];
}

// ─── PDF upload — handles fullscreen exit/re-enter around native file picker ──

function PdfUpload({
  onFile,
  error,
  locked,
}: {
  onFile: (file: File) => void
  error: string | null
  locked: boolean
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [fileName, setFileName] = useState<string | null>(null)

  function handleClick() {
    if (locked) return
    // If in fullscreen, exit first so the OS file picker can open,
    // then re-enter after the picker closes (via the change/cancel event).
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {}).finally(() => {
        inputRef.current?.click()
      })
    } else {
      inputRef.current?.click()
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    // Re-enter fullscreen regardless of whether a file was chosen
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {})
    }
    if (!file) return
    setFileName(file.name)
    onFile(file)
    e.target.value = ""
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-[13px] font-medium text-[#374151] flex items-center gap-2" style={{ fontFamily: FONT_SANS }}>
        <FileText size={14} className="text-[#9ca3af]" />
        Upload your answer as a PDF (max 10 MB)
      </p>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf"
        className="sr-only"
        onChange={handleChange}
        tabIndex={-1}
      />
      <button
        type="button"
        onClick={handleClick}
        disabled={locked}
        className="inline-flex items-center gap-2 rounded-md border border-[#e5e7eb] bg-[#f9fafb] px-4 py-2.5 text-[13px] font-medium text-[#374151] hover:bg-[#f3f4f6] transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-fit"
        style={{ fontFamily: FONT_SANS }}
      >
        <FileText size={14} className="text-[#6b7280]" />
        {fileName ? "Change file" : "Choose file"}
      </button>
      {fileName && (
        <p className="text-[12px] text-[#6b7280] flex items-center gap-1.5" style={{ fontFamily: FONT_SANS }}>
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#16a34a]" />
          {fileName}
        </p>
      )}
      {error && <p role="alert" className="text-xs text-[#dc2626]" style={{ fontFamily: FONT_SANS }}>{error}</p>}
    </div>
  )
}

// Light theme colours — GitHub-style
const EDITOR_BG        = "#f6f8fa";   // light gray background
const EDITOR_GUTTER_BG = "#eef0f3";   // slightly darker gutter
const EDITOR_GUTTER_FG = "#8c959f";   // line number colour
const EDITOR_BORDER    = "#d0d7de";   // border
const EDITOR_CARET     = "#24292f";   // dark caret

function CodeInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const MIN_LINES = 14;
  const lineCount = Math.max(MIN_LINES, value.split("\n").length + 1);

  const displayCode = value ? (value.endsWith("\n") ? value + " " : value) : " ";

  const sharedStyle: React.CSSProperties = {
    fontFamily: FONT_MONO,
    fontSize: `${FONT_SIZE}px`,
    lineHeight: `${LINE_HEIGHT}px`,
    padding: `${PAD_V}px ${PAD_V}px ${PAD_V}px ${GUTTER_W}px`,
    margin: 0,
    whiteSpace: "pre",
    wordBreak: "normal",
    overflowWrap: "normal",
    tabSize: 2,
  };

  const lineNumberStyle: React.CSSProperties = {
    display: "inline-block",
    width: `${GUTTER_W - PAD_V - 8}px`,
    marginLeft: `-${GUTTER_W - PAD_V}px`,
    marginRight: "8px",
    textAlign: "right",
    color: EDITOR_GUTTER_FG,
    userSelect: "none",
    fontVariantNumeric: "tabular-nums",
  };

  return (
    <div
      className="relative rounded-lg"
      style={{
        background: EDITOR_BG,
        border: `1px solid ${EDITOR_BORDER}`,
        backgroundImage: `linear-gradient(to right, ${EDITOR_GUTTER_BG} ${GUTTER_W}px, ${EDITOR_BG} ${GUTTER_W}px)`,
      }}
    >
      {/* ── Colour layer — sits on top of textarea, pointer-events none ── */}
      <Highlight theme={themes.github} code={displayCode} language="python">
        {({ tokens, getLineProps, getTokenProps }) => (
          <pre
            aria-hidden="true"
            className="pointer-events-none select-none absolute inset-0 overflow-hidden rounded-lg"
            style={{ ...sharedStyle, background: "transparent", margin: 0 }}
          >
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line })} style={{ display: "block" }}>
                <span style={lineNumberStyle}>{i + 1}</span>
                {line.map((token, j) => <span key={j} {...getTokenProps({ token })} />)}
              </div>
            ))}
          </pre>
        )}
      </Highlight>

      {/* ── Textarea — drives the height, transparent text so highlight shows ── */}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        autoCapitalize="none"
        autoCorrect="off"
        placeholder="Write your code here…"
        rows={lineCount}
        className="relative w-full resize-none outline-none block rounded-lg"
        style={{
          ...sharedStyle,
          background: "transparent",
          color: "transparent",
          caretColor: EDITOR_CARET,
          overflow: "hidden",
          // placeholder colour — only visible when empty
          WebkitTextFillColor: "transparent",
        }}
        onKeyDown={(e) => {
          if (e.key === "Tab") {
            e.preventDefault();
            const el = e.currentTarget;
            const s = el.selectionStart;
            const end = el.selectionEnd;
            const next = value.substring(0, s) + "  " + value.substring(end);
            onChange(next);
            requestAnimationFrame(() => { el.selectionStart = el.selectionEnd = s + 2; });
          }
        }}
      />

      {/* ── Language badge ── */}
      <div
        className="absolute top-2 right-3 text-[10px] font-semibold uppercase tracking-widest select-none pointer-events-none"
        style={{ color: EDITOR_GUTTER_FG }}
      >
        python
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function QuestionRenderer({
  question,
  attemptId,
  shuffledOptions,
  locked = false,
  onAnswerChange,
}: QuestionRendererProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [fillText, setFillText] = useState("");
  const [codeText, setCodeText] = useState("");
  const [pdfError, setPdfError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const ex = question.existingAnswer;
    setSelectedOption(ex?.selectedOption ?? null);
    setFillText(ex?.answerText ?? "");
    setCodeText(ex?.answerText ?? "");
    setPdfError(null);
  }, [question.id]);

  function scheduleDebounce(payload: { answerText: string | null; selectedOption: number | null; fileUrl: string | null }) {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => saveAnswer(attemptId, question.id, payload), 2500);
  }

  function handleOptionChange(idx: number) {
    if (locked) return;
    const payload = { answerText: null, selectedOption: idx, fileUrl: null };
    setSelectedOption(idx);
    onAnswerChange?.(question.id, payload);
    scheduleDebounce(payload);
  }

  function handleFillChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    if (locked) return;
    const payload = { answerText: e.target.value, selectedOption: null, fileUrl: null };
    setFillText(e.target.value);
    onAnswerChange?.(question.id, payload);
    scheduleDebounce(payload);
  }

  function handleCodeChange(v: string) {
    if (locked) return;
    const payload = { answerText: v, selectedOption: null, fileUrl: null };
    setCodeText(v);
    onAnswerChange?.(question.id, payload);
    scheduleDebounce(payload);
  }

  const rawOptions = parseOptions(question.options);
  const displayOptions = shuffledOptions ? shuffledOptions.map((i) => rawOptions[i] ?? "") : rawOptions;

  function renderInput() {
    if (locked) {
      return (
        <div className="rounded-lg border border-dashed border-[#e5e7eb] bg-[#fafafa] px-5 py-6 text-center">
          <p className="text-[13px] text-[#9ca3af]" style={{ fontFamily: FONT_SANS }}>
            You have already answered the required number of questions in this section.
          </p>
        </div>
      );
    }

    // ── Objective ────────────────────────────────────────────────────────────
    if (question.sectionType === "OBJECTIVE") {
      return (
        <fieldset className="flex flex-col">
          <legend className="sr-only">Select an answer</legend>
          {displayOptions.map((opt, displayIdx) => {
            const originalIdx = shuffledOptions ? shuffledOptions[displayIdx] : displayIdx;
            const checked = selectedOption === originalIdx;
            const letter = String.fromCharCode(65 + displayIdx);
            return (
              <label
                key={originalIdx}
                className={[
                  "group flex items-start gap-4 py-3.5 cursor-pointer border-b border-[#f3f4f6] last:border-0 transition-colors",
                  checked ? "" : "hover:bg-[#fafafa] -mx-2 px-2 rounded",
                ].join(" ")}
              >
                <input type="radio" name={`question-${question.id}`} value={originalIdx}
                  checked={checked} onChange={() => handleOptionChange(originalIdx)} className="sr-only" />
                <div className={[
                  "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-[12px] font-semibold transition-all",
                  checked
                    ? "border-[#002388] bg-[#002388] text-white"
                    : "border-[#e5e7eb] text-[#9ca3af] group-hover:border-[#002388] group-hover:text-[#002388]",
                ].join(" ")} style={{ fontFamily: FONT_SANS }}>
                  {checked ? <Check size={13} strokeWidth={3} /> : letter}
                </div>
                <span
                  className={["text-[15px] leading-relaxed flex-1 pt-0.5", checked ? "font-medium text-[#111827]" : "text-[#374151]"].join(" ")}
                  style={{ fontFamily: FONT_SANS }}
                >
                  {opt}
                </span>
              </label>
            );
          })}
          {displayOptions.length === 0 && (
            <p className="text-sm text-[#9ca3af] italic py-2" style={{ fontFamily: FONT_SANS }}>No options available.</p>
          )}
        </fieldset>
      );
    }

    // ── Code ─────────────────────────────────────────────────────────────────
    if (question.answerType === "CODE") {
      return <CodeInput value={codeText} onChange={handleCodeChange} />;
    }

    // ── Fill-in — notebook ruled lines, auto-grows ───────────────────────────
    if (question.answerType === "FILL_IN") {
      const RULE_HEIGHT = 32; // px per line
      return (
        <textarea
          value={fillText}
          onChange={handleFillChange}
          rows={12}
          placeholder="Write your answer here…"
          className="w-full resize-none bg-transparent outline-none text-[#1f2937] placeholder-[#d1d5db] overflow-hidden"
          style={{
            fontFamily: FONT_SANS,
            fontSize: "15px",
            lineHeight: `${RULE_HEIGHT}px`,
            backgroundImage: `repeating-linear-gradient(
              to bottom,
              transparent,
              transparent ${RULE_HEIGHT - 1}px,
              #ebebeb ${RULE_HEIGHT - 1}px,
              #ebebeb ${RULE_HEIGHT}px
            )`,
            backgroundSize: `100% ${RULE_HEIGHT}px`,
            paddingTop: "4px",
            // Height = number of lines * rule height, minimum 12 rows
            height: `${Math.max(12, fillText.split("\n").length) * RULE_HEIGHT}px`,
          }}
          onInput={(e) => {
            // Auto-grow: snap height to the nearest rule line
            const el = e.currentTarget
            el.style.height = "0px"
            const lines = Math.max(12, Math.ceil(el.scrollHeight / RULE_HEIGHT))
            el.style.height = `${lines * RULE_HEIGHT}px`
          }}
        />
      )
    }

    // ── PDF upload ────────────────────────────────────────────────────────────
    if (question.answerType === "PDF_UPLOAD") {
      return (
        <PdfUpload
          onFile={(file) => {
            if (file.size > MAX_PDF_BYTES) {
              setPdfError("File exceeds the 10 MB limit.")
              return
            }
            setPdfError(null)
            const payload = { answerText: null, selectedOption: null, fileUrl: file.name }
            onAnswerChange?.(question.id, payload)
            scheduleDebounce(payload)
          }}
          error={pdfError}
          locked={locked}
        />
      );
    }

    return <p className="text-sm text-[#9ca3af] italic" style={{ fontFamily: FONT_SANS }}>Unsupported question type.</p>;
  }

  return (
    <article className="flex flex-col gap-6" style={{ fontFamily: FONT_SANS }}>
      {/* Question header */}
      <div className="flex items-start justify-between gap-6">
        <div className="flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#9ca3af] mb-2.5">
            Question {question.order}
          </p>
          <p className="text-[16px] font-normal text-[#111827] leading-[1.75]">
            {question.body}
          </p>
        </div>
        <span className="shrink-0 text-[11px] font-semibold text-[#9ca3af] whitespace-nowrap mt-1 tabular-nums">
          {question.marks} {question.marks === 1 ? "mark" : "marks"}
        </span>
      </div>

      {/* Divider */}
      <div className="border-t border-[#f0f0f0]" />

      {/* Answer area */}
      <div>{renderInput()}</div>
    </article>
  );
}
