import type { DeviceState } from "../state";

function padRight(s: string, n: number) {
  return s.padEnd(n, " ").slice(0, n);
}

export function showIpInterfaceBrief(state: DeviceState): string {
  const header =
    "Interface              IP-Address      OK? Method Status                Protocol";
  const lines = Object.values(state.interfaces).map((iface) => {
    const ip = iface.ip ?? "unassigned";
    const ok = iface.ip ? "YES" : "YES";
    const method = iface.ip ? "manual" : "unset";
    const status = iface.status === "up" ? "up" : "administratively down";
    const protocol = iface.status === "up" && iface.ip ? "up" : "down";
    return (
      padRight(iface.name, 23) +
      padRight(ip, 16) +
      padRight(ok, 5) +
      padRight(method, 7) +
      padRight(status, 22) +
      protocol
    );
  });

  if (lines.length === 0) {
    return header + "\n(no interfaces configured)";
  }
  return [header, ...lines].join("\n");
}

export function showRunningConfig(state: DeviceState): string {
  const lines: string[] = [
    "Building configuration...",
    "",
    "Current configuration:",
    "!",
    `hostname ${state.hostname}`,
    "!",
  ];

  if (state.enableSecret) {
    lines.push(`enable secret ${state.servicePasswordEncryption ? "5 <encrypted>" : state.enableSecret}`);
    lines.push("!");
  }

  if (state.servicePasswordEncryption) {
    lines.push("service password-encryption");
    lines.push("!");
  }

  if (state.bannerMotd) {
    lines.push(`banner motd ^${state.bannerMotd}^`);
    lines.push("!");
  }

  for (const user of state.users) {
    lines.push(`username ${user.username} secret ${state.servicePasswordEncryption ? "5 <encrypted>" : user.secret}`);
  }
  if (state.users.length) lines.push("!");

  // Interfaces
  for (const iface of Object.values(state.interfaces)) {
    lines.push(`interface ${iface.name}`);
    if (iface.description) lines.push(` description ${iface.description}`);
    if (iface.encapsulationDot1q) lines.push(` encapsulation dot1Q ${iface.encapsulationDot1q}`);
    if (iface.ip && iface.mask) lines.push(` ip address ${iface.ip} ${iface.mask}`);
    if (iface.switchportMode) {
      lines.push(` switchport mode ${iface.switchportMode}`);
      if (iface.switchportMode === "access" && iface.accessVlan) {
        lines.push(` switchport access vlan ${iface.accessVlan}`);
      }
    }
    if (iface.status === "down") lines.push(" shutdown");
    lines.push("!");
  }

  // Static routes
  for (const route of state.routes.filter((r) => r.source === "static")) {
    const via = route.nextHop ?? route.exitInterface ?? "";
    lines.push(`ip route ${route.network} ${route.mask} ${via}`);
  }
  if (state.routes.some((r) => r.source === "static")) lines.push("!");

  // OSPF
  for (const [pid, ospf] of Object.entries(state.ospfProcesses)) {
    lines.push(`router ospf ${pid}`);
    if (ospf.routerId) lines.push(` router-id ${ospf.routerId}`);
    for (const net of ospf.networks) {
      lines.push(` network ${net.network} ${net.wildcard} area ${net.area}`);
    }
    lines.push("!");
  }

  // VTY lines
  for (const [line, method] of Object.entries(state.lineLoginMethod)) {
    lines.push(`line ${line}`);
    const pass = state.linePasswords[line];
    if (pass) lines.push(` password ${state.servicePasswordEncryption ? "<encrypted>" : pass}`);
    lines.push(` login ${method === "local" ? "local" : method === "password" ? "" : "none"}`);
    const transport = state.lineTransportInput[line];
    if (transport) lines.push(` transport input ${transport.join(" ")}`);
    lines.push("!");
  }

  lines.push("end");
  return lines.join("\n");
}

export function showVlanBrief(state: DeviceState): string {
  const header = "VLAN Name                             Status    Ports";
  const sep = "---- -------------------------------- --------- -------------------------------";
  const lines = Object.values(state.vlans).map((v) => {
    return (
      String(v.id).padEnd(5) +
      v.name.padEnd(33) +
      (v.active ? "active" : "act/lshut").padEnd(10)
    );
  });
  return [header, sep, ...lines].join("\n");
}

export function showIpRoute(state: DeviceState): string {
  if (state.routes.length === 0) {
    return "% No routes found";
  }
  const lines = [
    "Codes: L - local, C - connected, S - static, O - OSPF",
    "",
  ];
  for (const r of state.routes) {
    const code = r.source === "static" ? "S" : r.source === "connected" ? "C" : "O";
    const via = r.nextHop ? `via ${r.nextHop}` : r.exitInterface ?? "";
    lines.push(`${code}    ${r.network}/${maskToCidr(r.mask)} [${r.metric === 0 ? "0/0" : `110/${r.metric}`}] ${via}`);
  }
  return lines.join("\n");
}

function maskToCidr(mask: string): number {
  return mask.split(".").reduce((acc, octet) => {
    let n = parseInt(octet);
    let bits = 0;
    while (n > 0) { bits += n & 1; n >>= 1; }
    return acc + bits;
  }, 0);
}
