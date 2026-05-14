"use client";

import { useEffect, useRef, useCallback } from "react";
import type { DeviceState } from "@/lib/ios/state";
import { execute } from "@/lib/ios/interpreter";
import { createDevice, getPrompt } from "@/lib/ios/state";

interface CiscoTerminalProps {
  initialState?: Partial<DeviceState>;
  onStateChange?: (state: DeviceState) => void;
  className?: string;
}

export default function CiscoTerminal({ initialState, onStateChange, className }: CiscoTerminalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<import("xterm").Terminal | null>(null);
  const fitRef = useRef<import("xterm-addon-fit").FitAddon | null>(null);
  const stateRef = useRef<DeviceState>(createDevice(initialState?.hostname ?? "Router"));
  const inputRef = useRef<string>("");
  const historyRef = useRef<string[]>([]);
  const historyIdxRef = useRef<number>(-1);

  // Apply initialState overrides
  useEffect(() => {
    if (initialState) {
      stateRef.current = { ...stateRef.current, ...initialState };
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const writePrompt = useCallback((term: import("xterm").Terminal, state: DeviceState) => {
    term.write("\r\n" + getPrompt(state));
  }, []);

  const handleKey = useCallback(
    (term: import("xterm").Terminal, key: string, domEvent: KeyboardEvent) => {
      const state = stateRef.current;

      if (domEvent.keyCode === 13) {
        // Enter
        const cmd = inputRef.current.trim();
        term.write("\r\n");
        if (cmd) {
          historyRef.current.unshift(cmd);
          if (historyRef.current.length > 50) historyRef.current.pop();
          historyIdxRef.current = -1;

          const result = execute(state, cmd);
          stateRef.current = result.newState;
          onStateChange?.(result.newState);

          if (result.output) {
            // Split lines and write each
            const lines = result.output.split("\n");
            for (const line of lines) {
              term.write(line + "\r\n");
            }
          }
        }
        inputRef.current = "";
        writePrompt(term, stateRef.current);
      } else if (domEvent.keyCode === 8) {
        // Backspace
        if (inputRef.current.length > 0) {
          inputRef.current = inputRef.current.slice(0, -1);
          term.write("\b \b");
        }
      } else if (domEvent.keyCode === 38) {
        // Arrow up — history
        const newIdx = Math.min(historyIdxRef.current + 1, historyRef.current.length - 1);
        historyIdxRef.current = newIdx;
        const cmd = historyRef.current[newIdx] ?? "";
        // Clear current input
        term.write("\b \b".repeat(inputRef.current.length));
        inputRef.current = cmd;
        term.write(cmd);
      } else if (domEvent.keyCode === 40) {
        // Arrow down — history
        const newIdx = Math.max(historyIdxRef.current - 1, -1);
        historyIdxRef.current = newIdx;
        const cmd = newIdx === -1 ? "" : (historyRef.current[newIdx] ?? "");
        term.write("\b \b".repeat(inputRef.current.length));
        inputRef.current = cmd;
        term.write(cmd);
      } else if (domEvent.ctrlKey && key === "c") {
        // Ctrl+C — cancel input
        term.write("^C");
        inputRef.current = "";
        writePrompt(term, stateRef.current);
      } else if (domEvent.ctrlKey && key === "l") {
        // Ctrl+L — clear screen
        term.clear();
        writePrompt(term, stateRef.current);
      } else if (key.length === 1) {
        inputRef.current += key;
        term.write(key);
      }
    },
    [onStateChange, writePrompt],
  );

  useEffect(() => {
    if (!containerRef.current) return;

    let term: import("xterm").Terminal;
    let fitAddon: import("xterm-addon-fit").FitAddon;

    async function init() {
      const { Terminal } = await import("xterm");
      const { FitAddon } = await import("xterm-addon-fit");

      term = new Terminal({
        cursorBlink: true,
        fontSize: 14,
        fontFamily: "'Cascadia Code', 'Fira Code', 'Courier New', monospace",
        theme: {
          background: "#0d1117",
          foreground: "#00e5a0",
          cursor: "#00e5a0",
          cursorAccent: "#0d1117",
          selectionBackground: "#00e5a020",
          black: "#0d1117",
          brightBlack: "#484f58",
          red: "#ff7b72",
          brightRed: "#ffa198",
          green: "#3fb950",
          brightGreen: "#56d364",
          yellow: "#d29922",
          brightYellow: "#e3b341",
          blue: "#58a6ff",
          brightBlue: "#79c0ff",
          magenta: "#bc8cff",
          brightMagenta: "#d2a8ff",
          cyan: "#39c5cf",
          brightCyan: "#56d4dd",
          white: "#b1bac4",
          brightWhite: "#f0f6fc",
        },
        scrollback: 500,
        allowTransparency: false,
        cols: 100,
        rows: 30,
      });

      fitAddon = new FitAddon();
      term.loadAddon(fitAddon);
      term.open(containerRef.current!);
      fitAddon.fit();

      termRef.current = term;
      fitRef.current = fitAddon;

      // Keep the banner short so it stays readable in narrow mobile terminals.
      term.writeln("\x1b[1;32mXamastry Cisco IOS CLI Simulator\x1b[0m");
      term.writeln("\x1b[32mType IOS-style commands below.\x1b[0m");
      term.writeln("\x1b[32mCtrl+L clears. Arrows browse history.\x1b[0m");
      term.writeln("");

      writePrompt(term, stateRef.current);

      term.onKey(({ key, domEvent }) => handleKey(term, key, domEvent));

      const resizeObserver = new ResizeObserver(() => {
        fitAddon.fit();
      });
      if (containerRef.current) {
        resizeObserver.observe(containerRef.current);
      }

      return () => {
        resizeObserver.disconnect();
        term.dispose();
      };
    }

    const cleanup = init();
    return () => {
      cleanup.then((fn) => fn?.());
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ background: "#0d1117", padding: "8px", borderRadius: "8px", minHeight: "400px" }}
    />
  );
}
