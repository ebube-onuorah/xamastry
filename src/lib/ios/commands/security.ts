import type { DeviceState } from "../state";

export function setEnableSecret(state: DeviceState, args: string[]): { output: string; state: DeviceState } {
  const secret = args.join(" ");
  return { output: "", state: { ...state, enableSecret: secret } };
}

export function setHostname(state: DeviceState, args: string[]): { output: string; state: DeviceState } {
  const hostname = args[0] ?? "Router";
  return { output: "", state: { ...state, hostname } };
}

export function setServicePasswordEncryption(state: DeviceState): { output: string; state: DeviceState } {
  return { output: "", state: { ...state, servicePasswordEncryption: true } };
}

export function addUsername(state: DeviceState, args: string[]): { output: string; state: DeviceState } {
  // username <name> secret <pass>  OR  username <name> password <pass>
  const name = args[0];
  const secretIdx = args.indexOf("secret");
  const passIdx = args.indexOf("password");
  const idx = secretIdx !== -1 ? secretIdx : passIdx;
  if (!name || idx === -1 || !args[idx + 1]) {
    return { output: "% Incomplete command.", state };
  }
  const secret = args.slice(idx + 1).join(" ");
  const users = state.users.filter((u) => u.username !== name);
  return { output: "", state: { ...state, users: [...users, { username: name, secret }] } };
}

export function setBannerMotd(state: DeviceState, args: string[]): { output: string; state: DeviceState } {
  const banner = args.join(" ");
  return { output: "", state: { ...state, bannerMotd: banner } };
}

export function enterLine(state: DeviceState, args: string[]): { output: string; state: DeviceState } {
  const line = args.join(" "); // e.g. "vty 0 4" or "console 0"
  return { output: "", state: { ...state, mode: "line" as const, currentLine: line } };
}

export function setLinePassword(state: DeviceState, args: string[]): { output: string; state: DeviceState } {
  if (!state.currentLine) return { output: "% Not in line config mode.", state };
  const pass = args.join(" ");
  return {
    output: "",
    state: { ...state, linePasswords: { ...state.linePasswords, [state.currentLine]: pass } },
  };
}

export function setLineLogin(state: DeviceState, args: string[]): { output: string; state: DeviceState } {
  if (!state.currentLine) return { output: "% Not in line config mode.", state };
  const method = args[0] === "local" ? "local" : args.length === 0 ? "password" : "none";
  return {
    output: "",
    state: { ...state, lineLoginMethod: { ...state.lineLoginMethod, [state.currentLine]: method } },
  };
}

export function setTransportInput(state: DeviceState, args: string[]): { output: string; state: DeviceState } {
  if (!state.currentLine) return { output: "% Not in line config mode.", state };
  return {
    output: "",
    state: { ...state, lineTransportInput: { ...state.lineTransportInput, [state.currentLine]: args } },
  };
}

export function setSshVersion(state: DeviceState, args: string[]): { output: string; state: DeviceState } {
  const version = parseInt(args[0] ?? "2");
  return { output: "", state: { ...state, sshVersion: version } };
}
