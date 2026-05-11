import type { DeviceState, IosInterface } from "../state";

/** Normalise interface names: fa0/0 → FastEthernet0/0, gi0/1 → GigabitEthernet0/1 */
export function normaliseIfaceName(raw: string): string {
  const s = raw.toLowerCase().trim();
  if (s.startsWith("fastethernet") || s.startsWith("fa")) {
    const num = s.replace(/^(fastethernet|fa)/, "");
    return `FastEthernet${num}`;
  }
  if (s.startsWith("gigabitethernet") || s.startsWith("gi") || s.startsWith("g")) {
    const num = s.replace(/^(gigabitethernet|gi|g)/, "");
    return `GigabitEthernet${num}`;
  }
  if (s.startsWith("serial") || s.startsWith("se") || s.startsWith("s")) {
    const num = s.replace(/^(serial|se|s)/, "");
    return `Serial${num}`;
  }
  if (s.startsWith("loopback") || s.startsWith("lo")) {
    const num = s.replace(/^(loopback|lo)/, "");
    return `Loopback${num}`;
  }
  if (s.startsWith("vlan")) {
    const num = s.replace(/^vlan/, "");
    return `Vlan${num}`;
  }
  return raw;
}

export function enterInterface(state: DeviceState, args: string[]): { output: string; state: DeviceState } {
  if (args.length === 0) return { output: "% Incomplete command.", state };
  const name = normaliseIfaceName(args.join(""));
  const newState = { ...state, mode: "interface" as const, currentInterface: name };
  if (!newState.interfaces[name]) {
    newState.interfaces = {
      ...newState.interfaces,
      [name]: { name, status: "down" },
    };
  }
  return { output: "", state: newState };
}

export function setIpAddress(state: DeviceState, args: string[]): { output: string; state: DeviceState } {
  if (state.mode !== "interface" || !state.currentInterface) {
    return { output: "% Not in interface config mode.", state };
  }
  if (args.length < 2) return { output: "% Incomplete command.", state };
  const [ip, mask] = args;
  if (!isValidIp(ip) || !isValidIp(mask)) {
    return { output: "% Invalid IP address.", state };
  }
  const iface: IosInterface = { ...state.interfaces[state.currentInterface]!, ip, mask };
  return {
    output: "",
    state: {
      ...state,
      interfaces: { ...state.interfaces, [state.currentInterface]: iface },
    },
  };
}

export function noShutdown(state: DeviceState): { output: string; state: DeviceState } {
  if (state.mode !== "interface" || !state.currentInterface) {
    return { output: "% Not in interface config mode.", state };
  }
  const iface: IosInterface = { ...state.interfaces[state.currentInterface]!, status: "up" };
  return {
    output: `%LINK-5-CHANGED: Interface ${state.currentInterface}, changed state to up`,
    state: { ...state, interfaces: { ...state.interfaces, [state.currentInterface]: iface } },
  };
}

export function shutdown(state: DeviceState): { output: string; state: DeviceState } {
  if (state.mode !== "interface" || !state.currentInterface) {
    return { output: "% Not in interface config mode.", state };
  }
  const iface: IosInterface = { ...state.interfaces[state.currentInterface]!, status: "down" };
  return {
    output: `%LINK-5-CHANGED: Interface ${state.currentInterface}, changed state to administratively down`,
    state: { ...state, interfaces: { ...state.interfaces, [state.currentInterface]: iface } },
  };
}

export function setDescription(state: DeviceState, args: string[]): { output: string; state: DeviceState } {
  if (state.mode !== "interface" || !state.currentInterface) {
    return { output: "% Not in interface config mode.", state };
  }
  const desc = args.join(" ");
  const iface: IosInterface = { ...state.interfaces[state.currentInterface]!, description: desc };
  return {
    output: "",
    state: { ...state, interfaces: { ...state.interfaces, [state.currentInterface]: iface } },
  };
}

export function setSwitchportMode(state: DeviceState, args: string[]): { output: string; state: DeviceState } {
  if (state.mode !== "interface" || !state.currentInterface) {
    return { output: "% Not in interface config mode.", state };
  }
  const mode = args[0]?.toLowerCase();
  if (mode !== "access" && mode !== "trunk") {
    return { output: "% Invalid switchport mode.", state };
  }
  const iface: IosInterface = { ...state.interfaces[state.currentInterface]!, switchportMode: mode };
  return {
    output: "",
    state: { ...state, interfaces: { ...state.interfaces, [state.currentInterface]: iface } },
  };
}

export function setSwitchportAccessVlan(state: DeviceState, args: string[]): { output: string; state: DeviceState } {
  if (state.mode !== "interface" || !state.currentInterface) {
    return { output: "% Not in interface config mode.", state };
  }
  const vlanId = parseInt(args[0] ?? "");
  if (isNaN(vlanId) || vlanId < 1 || vlanId > 4094) {
    return { output: "% Invalid VLAN id.", state };
  }
  const iface: IosInterface = { ...state.interfaces[state.currentInterface]!, accessVlan: vlanId };
  return {
    output: "",
    state: { ...state, interfaces: { ...state.interfaces, [state.currentInterface]: iface } },
  };
}

export function setEncapsulationDot1q(state: DeviceState, args: string[]): { output: string; state: DeviceState } {
  if (state.mode !== "interface" || !state.currentInterface) {
    return { output: "% Not in interface config mode.", state };
  }
  const vlanId = parseInt(args[0] ?? "");
  if (isNaN(vlanId)) return { output: "% Invalid VLAN id.", state };
  const iface: IosInterface = { ...state.interfaces[state.currentInterface]!, encapsulationDot1q: vlanId };
  return {
    output: "",
    state: { ...state, interfaces: { ...state.interfaces, [state.currentInterface]: iface } },
  };
}

function isValidIp(s: string): boolean {
  return /^\d{1,3}(\.\d{1,3}){3}$/.test(s);
}
