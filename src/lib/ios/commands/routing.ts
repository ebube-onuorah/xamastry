import type { DeviceState, IosRoute } from "../state";

export function addStaticRoute(state: DeviceState, args: string[]): { output: string; state: DeviceState } {
  if (state.mode !== "config") return { output: "% Not in global config mode.", state };
  // ip route <network> <mask> <next-hop|exit-iface> [distance]
  if (args.length < 3) return { output: "% Incomplete command.", state };
  const [network, mask, via] = args;
  const route: IosRoute = {
    network,
    mask,
    nextHop: isIp(via) ? via : undefined,
    exitInterface: isIp(via) ? undefined : via,
    metric: 0,
    source: "static",
  };
  // Remove existing route to same network/mask if any
  const routes = state.routes.filter(
    (r) => !(r.network === network && r.mask === mask && r.source === "static"),
  );
  return { output: "", state: { ...state, routes: [...routes, route] } };
}

export function removeStaticRoute(state: DeviceState, args: string[]): { output: string; state: DeviceState } {
  if (args.length < 2) return { output: "% Incomplete command.", state };
  const [network, mask] = args;
  const routes = state.routes.filter(
    (r) => !(r.network === network && r.mask === mask && r.source === "static"),
  );
  return { output: "", state: { ...state, routes } };
}

export function configureOspf(state: DeviceState, args: string[]): { output: string; state: DeviceState } {
  const pid = parseInt(args[0] ?? "1");
  if (isNaN(pid)) return { output: "% Invalid process id.", state };
  const ospfProcesses = { ...state.ospfProcesses };
  if (!ospfProcesses[pid]) ospfProcesses[pid] = { networks: [] };
  return { output: "", state: { ...state, mode: "config" as const, ospfProcesses, currentInterface: undefined } };
}

export function addOspfNetwork(
  state: DeviceState,
  args: string[],
  pid: number,
): { output: string; state: DeviceState } {
  // network <address> <wildcard> area <area-id>
  const areaIdx = args.indexOf("area");
  if (areaIdx === -1 || args.length < 4) return { output: "% Incomplete command.", state };
  const network = args[0];
  const wildcard = args[1];
  const area = parseInt(args[areaIdx + 1]);
  if (isNaN(area)) return { output: "% Invalid area id.", state };

  const ospfProcesses = { ...state.ospfProcesses };
  const proc = ospfProcesses[pid] ?? { networks: [] };
  ospfProcesses[pid] = {
    ...proc,
    networks: [...proc.networks.filter((n) => n.network !== network), { network, wildcard, area }],
  };
  return { output: "", state: { ...state, ospfProcesses } };
}

function isIp(s: string): boolean {
  return /^\d{1,3}(\.\d{1,3}){3}$/.test(s);
}
