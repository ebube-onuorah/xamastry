import type { DeviceState } from "../state";

export function enterVlan(state: DeviceState, args: string[]): { output: string; state: DeviceState } {
  const id = parseInt(args[0] ?? "");
  if (isNaN(id) || id < 1 || id > 4094) return { output: "% Invalid VLAN id.", state };
  const vlans = { ...state.vlans };
  if (!vlans[id]) vlans[id] = { id, name: `VLAN${String(id).padStart(4, "0")}`, active: true };
  return { output: "", state: { ...state, mode: "vlan-config" as const, vlans, currentInterface: String(id) } };
}

export function setVlanName(state: DeviceState, args: string[]): { output: string; state: DeviceState } {
  const id = parseInt(state.currentInterface ?? "");
  if (isNaN(id) || !state.vlans[id]) return { output: "% Not in VLAN config mode.", state };
  const name = args.join(" ");
  return {
    output: "",
    state: { ...state, vlans: { ...state.vlans, [id]: { ...state.vlans[id]!, name } } },
  };
}
