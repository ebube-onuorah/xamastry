import { type DeviceState, getPrompt } from "./state";
import { showInterfacesTrunk, showIpInterfaceBrief, showRunningConfig, showVlanBrief, showIpRoute } from "./commands/show";
import {
  enterInterface,
  setIpAddress,
  noShutdown,
  shutdown,
  setDescription,
  setSwitchportMode,
  setSwitchportAccessVlan,
  setSwitchportTrunkAllowedVlans,
  setSwitchportTrunkNativeVlan,
  setEncapsulationDot1q,
} from "./commands/interface";
import { addStaticRoute, removeStaticRoute, addOspfNetwork } from "./commands/routing";
import {
  setEnableSecret,
  setHostname,
  setServicePasswordEncryption,
  addUsername,
  setBannerMotd,
  enterLine,
  setLinePassword,
  setLineLogin,
  setTransportInput,
  setSshVersion,
} from "./commands/security";
import { enterVlan, setVlanName } from "./commands/vlan";

export interface CommandResult {
  output: string;
  newState: DeviceState;
  prompt: string;
}

/** Track which ospf process we're inside (hack: store in currentLine with prefix) */
function activeOspfPid(state: DeviceState): number {
  const raw = state.currentLine ?? "";
  const m = raw.match(/^ospf:(\d+)$/);
  return m ? parseInt(m[1]) : 1;
}

export function execute(state: DeviceState, rawInput: string): CommandResult {
  const input = rawInput.trim();
  const tokens = input.split(/\s+/).filter(Boolean);
  const cmd = tokens[0]?.toLowerCase() ?? "";
  const args = tokens.slice(1);

  let output = "";
  let newState = state;

  // ── Universal commands ──────────────────────────────────────────────────────
  if (cmd === "" || input === "") {
    // no-op
  } else if (cmd === "enable") {
    if (state.mode === "user") newState = { ...state, mode: "privileged" };
    else output = "% Already in privileged mode.";
  } else if (cmd === "disable") {
    if (state.mode === "privileged") newState = { ...state, mode: "user" };
  } else if (cmd === "exit") {
    newState = handleExit(state);
  } else if (cmd === "end") {
    newState = { ...state, mode: "privileged", currentInterface: undefined, currentLine: undefined };
  } else if ((cmd === "configure" && args[0]?.toLowerCase() === "terminal") || cmd === "conf") {
    if (state.mode !== "privileged") output = "% Must be in privileged mode.";
    else newState = { ...state, mode: "config" };
  }

  // ── Show commands ────────────────────────────────────────────────────────────
  else if (cmd === "show") {
    const sub = args[0]?.toLowerCase();
    const sub2 = args[1]?.toLowerCase();
    if (sub === "ip" && sub2 === "interface" && args[2]?.toLowerCase() === "brief") {
      output = showIpInterfaceBrief(state);
    } else if (sub === "running-config" || (sub === "run")) {
      output = showRunningConfig(state);
    } else if (sub === "vlan" && sub2 === "brief") {
      output = showVlanBrief(state);
    } else if (sub === "ip" && sub2 === "route") {
      output = showIpRoute(state);
    } else if (sub === "interfaces" && sub2 === "trunk") {
      output = showInterfacesTrunk(state);
    } else if (sub === "version") {
      output = `Cisco IOS Software, Version 15.2 (Xamastry Simulator)\nHostname: ${state.hostname}`;
    } else {
      output = `% Unknown show subcommand: ${args.join(" ")}`;
    }
  }

  // ── Config-mode commands ─────────────────────────────────────────────────────
  else if (state.mode === "config" || state.mode === "interface" || state.mode === "router-ospf" || state.mode === "vlan-config" || state.mode === "line") {

    if (cmd === "interface") {
      const r = enterInterface(state, args);
      output = r.output; newState = r.state;
    } else if (cmd === "ip" && args[0]?.toLowerCase() === "address") {
      const r = setIpAddress(state, args.slice(1));
      output = r.output; newState = r.state;
    } else if (cmd === "no" && args[0]?.toLowerCase() === "shutdown") {
      const r = noShutdown(state);
      output = r.output; newState = r.state;
    } else if (cmd === "shutdown") {
      const r = shutdown(state);
      output = r.output; newState = r.state;
    } else if (cmd === "description") {
      const r = setDescription(state, args);
      output = r.output; newState = r.state;
    } else if (cmd === "switchport" && args[0]?.toLowerCase() === "mode") {
      const r = setSwitchportMode(state, args.slice(1));
      output = r.output; newState = r.state;
    } else if (cmd === "switchport" && args[0]?.toLowerCase() === "access" && args[1]?.toLowerCase() === "vlan") {
      const r = setSwitchportAccessVlan(state, args.slice(2));
      output = r.output; newState = r.state;
    } else if (cmd === "switchport" && args[0]?.toLowerCase() === "trunk" && args[1]?.toLowerCase() === "native" && args[2]?.toLowerCase() === "vlan") {
      const r = setSwitchportTrunkNativeVlan(state, args.slice(3));
      output = r.output; newState = r.state;
    } else if (cmd === "switchport" && args[0]?.toLowerCase() === "trunk" && args[1]?.toLowerCase() === "allowed" && args[2]?.toLowerCase() === "vlan") {
      const r = setSwitchportTrunkAllowedVlans(state, args.slice(3));
      output = r.output; newState = r.state;
    } else if (cmd === "encapsulation" && args[0]?.toLowerCase().startsWith("dot1q")) {
      const r = setEncapsulationDot1q(state, args.slice(1));
      output = r.output; newState = r.state;
    } else if (cmd === "ip" && args[0]?.toLowerCase() === "route") {
      const r = addStaticRoute(state, args.slice(1));
      output = r.output; newState = r.state;
    } else if (cmd === "no" && args[0]?.toLowerCase() === "ip" && args[1]?.toLowerCase() === "route") {
      const r = removeStaticRoute(state, args.slice(2));
      output = r.output; newState = r.state;
    } else if (cmd === "router" && args[0]?.toLowerCase() === "ospf") {
      const pid = parseInt(args[1] ?? "1");
      newState = { ...state, mode: "router-ospf", currentLine: `ospf:${pid}` };
    } else if (cmd === "network" && state.mode === "router-ospf" && state.currentLine?.startsWith("ospf:")) {
      const pid = activeOspfPid(state);
      const r = addOspfNetwork(state, args, pid);
      output = r.output; newState = r.state;
    } else if (cmd === "router-id" && state.mode === "router-ospf" && state.currentLine?.startsWith("ospf:")) {
      const pid = activeOspfPid(state);
      const ospfProcesses = { ...state.ospfProcesses };
      ospfProcesses[pid] = { ...ospfProcesses[pid], routerId: args[0] };
      newState = { ...state, ospfProcesses };
    } else if (cmd === "enable" && args[0]?.toLowerCase() === "secret") {
      const r = setEnableSecret(state, args.slice(1));
      output = r.output; newState = r.state;
    } else if (cmd === "hostname") {
      const r = setHostname(state, args);
      output = r.output; newState = r.state;
    } else if (cmd === "service" && args[0]?.toLowerCase() === "password-encryption") {
      const r = setServicePasswordEncryption(state);
      output = r.output; newState = r.state;
    } else if (cmd === "username") {
      const r = addUsername(state, args);
      output = r.output; newState = r.state;
    } else if (cmd === "banner" && args[0]?.toLowerCase() === "motd") {
      const r = setBannerMotd(state, args.slice(1));
      output = r.output; newState = r.state;
    } else if (cmd === "line") {
      const r = enterLine(state, args);
      output = r.output; newState = r.state;
    } else if (cmd === "password" && state.mode === "line") {
      const r = setLinePassword(state, args);
      output = r.output; newState = r.state;
    } else if (cmd === "login" && state.mode === "line") {
      const r = setLineLogin(state, args);
      output = r.output; newState = r.state;
    } else if (cmd === "transport" && args[0]?.toLowerCase() === "input") {
      const r = setTransportInput(state, args.slice(1));
      output = r.output; newState = r.state;
    } else if (cmd === "ip" && args[0]?.toLowerCase() === "ssh" && args[1]?.toLowerCase() === "version") {
      const r = setSshVersion(state, args.slice(2));
      output = r.output; newState = r.state;
    } else if (cmd === "vlan") {
      const r = enterVlan(state, args);
      output = r.output; newState = r.state;
    } else if (cmd === "name" && state.mode === "vlan-config") {
      const r = setVlanName(state, args);
      output = r.output; newState = r.state;
    } else if (cmd === "do") {
      // "do show ..." from config mode
      const doResult = execute({ ...state, mode: "privileged" }, args.join(" "));
      output = doResult.output;
    } else {
      output = `% Unknown command: ${input}`;
    }
  } else {
    output = `% Command not available in current mode (${state.mode}). Type 'enable' then 'configure terminal'.`;
  }

  return { output, newState, prompt: getPrompt(newState) };
}

function handleExit(state: DeviceState): DeviceState {
  switch (state.mode) {
    case "interface":
      return { ...state, mode: "config", currentInterface: undefined };
    case "router-ospf":
      return { ...state, mode: "config", currentLine: undefined };
    case "vlan-config":
      return { ...state, mode: "config", currentInterface: undefined };
    case "line":
      return { ...state, mode: "config", currentLine: undefined };
    case "config":
      // If inside router ospf sub-mode, go back to config
      if (state.currentLine?.startsWith("ospf:")) {
        return { ...state, currentLine: undefined };
      }
      return { ...state, mode: "privileged" };
    case "privileged":
      return { ...state, mode: "user" };
    default:
      return state;
  }
}
