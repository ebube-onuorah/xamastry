export type IosMode =
  | "user"
  | "privileged"
  | "config"
  | "interface"
  | "vlan-config"
  | "line";

export interface IosInterface {
  name: string;
  ip?: string;
  mask?: string;
  /** "up" = manually enabled, "down" = shutdown (admin down) */
  status: "up" | "down";
  description?: string;
  switchportMode?: "access" | "trunk";
  accessVlan?: number;
  trunkAllowedVlans?: number[];
  encapsulationDot1q?: number; // for subinterfaces
}

export interface IosRoute {
  network: string;
  mask: string;
  nextHop?: string;
  exitInterface?: string;
  metric: number;
  source: "static" | "connected" | "ospf";
}

export interface IosVlan {
  id: number;
  name: string;
  active: boolean;
}

export interface AclEntry {
  seq: number;
  action: "permit" | "deny";
  protocol: string;
  src: string;
  dst: string;
  dstPort?: number;
}

export interface DeviceState {
  hostname: string;
  mode: IosMode;
  currentInterface?: string;
  currentLine?: string;
  enableSecret?: string;
  enablePassword?: string;
  servicePasswordEncryption: boolean;
  bannerMotd?: string;
  interfaces: Record<string, IosInterface>;
  routes: IosRoute[];
  vlans: Record<number, IosVlan>;
  users: Array<{ username: string; secret: string }>;
  acls: Record<string, AclEntry[]>;
  sshVersion?: number;
  linePasswords: Record<string, string>;
  lineLoginMethod: Record<string, "local" | "password" | "none">;
  lineTransportInput: Record<string, string[]>;
  ospfProcesses: Record<number, { routerId?: string; networks: Array<{ network: string; wildcard: string; area: number }> }>;
}

export function createDevice(hostname = "Router"): DeviceState {
  return {
    hostname,
    mode: "user",
    servicePasswordEncryption: false,
    interfaces: {},
    routes: [],
    vlans: { 1: { id: 1, name: "default", active: true } },
    users: [],
    acls: {},
    linePasswords: {},
    lineLoginMethod: {},
    lineTransportInput: {},
    ospfProcesses: {},
  };
}

export function getPrompt(state: DeviceState): string {
  const h = state.hostname;
  switch (state.mode) {
    case "user":
      return `${h}>`;
    case "privileged":
      return `${h}#`;
    case "config":
      return `${h}(config)#`;
    case "interface":
      return `${h}(config-if)#`;
    case "vlan-config":
      return `${h}(config-vlan)#`;
    case "line":
      return `${h}(config-line)#`;
  }
}
