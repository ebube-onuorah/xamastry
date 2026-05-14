import type { DeviceState } from "./ios/state";

export type TaskCheckType =
  | "hostname"
  | "interface_ip"
  | "interface_status"
  | "interface_description"
  | "static_route"
  | "ospf_network"
  | "ospf_router_id"
  | "vlan_exists"
  | "vlan_name"
  | "switchport_mode"
  | "switchport_access_vlan"
  | "switchport_trunk_allowed_vlans"
  | "switchport_trunk_native_vlan"
  | "enable_secret"
  | "username_exists"
  | "service_password_encryption"
  | "ssh_version"
  | "line_password"
  | "line_login"
  | "line_transport_input"
  | "encapsulation_dot1q"
  | "banner_motd_contains";

export interface TaskCheck {
  type: TaskCheckType;
  /** human-readable description shown in task list */
  description: string;
  /** expected value(s) depend on check type */
  expected: Record<string, unknown>;
}

export interface GradeResult {
  passed: boolean;
  message: string;
}

export function gradeTask(state: DeviceState, check: TaskCheck): GradeResult {
  const fail = (msg: string): GradeResult => ({ passed: false, message: msg });
  const pass = (msg: string): GradeResult => ({ passed: true, message: msg });

  switch (check.type) {
    case "hostname": {
      const expected = check.expected.hostname as string;
      if (state.hostname !== expected)
        return fail(`Hostname is "${state.hostname}", expected "${expected}"`);
      return pass(`Hostname is correctly set to "${expected}"`);
    }

    case "interface_ip": {
      const ifName = check.expected.interface as string;
      const expectedIp = check.expected.ip as string;
      const expectedMask = check.expected.mask as string;
      const iface = findInterface(state, ifName);
      if (!iface) return fail(`Interface ${ifName} does not exist`);
      if (iface.ip !== expectedIp || iface.mask !== expectedMask)
        return fail(
          `${ifName} IP is ${iface.ip ?? "not set"}/${iface.mask ?? "not set"}, expected ${expectedIp}/${expectedMask}`,
        );
      return pass(`${ifName} has correct IP address ${expectedIp}/${expectedMask}`);
    }

    case "interface_status": {
      const ifName = check.expected.interface as string;
      const expectedStatus = check.expected.status as string;
      const iface = findInterface(state, ifName);
      if (!iface) return fail(`Interface ${ifName} does not exist`);
      if (iface.status !== expectedStatus)
        return fail(`${ifName} is "${iface.status}", expected "${expectedStatus}"`);
      return pass(`${ifName} status is correctly "${expectedStatus}"`);
    }

    case "interface_description": {
      const ifName = check.expected.interface as string;
      const expectedDesc = check.expected.description as string;
      const iface = findInterface(state, ifName);
      if (!iface) return fail(`Interface ${ifName} does not exist`);
      if (iface.description !== expectedDesc)
        return fail(`${ifName} description is "${iface.description ?? ""}", expected "${expectedDesc}"`);
      return pass(`${ifName} description is correctly set`);
    }

    case "static_route": {
      const network = check.expected.network as string;
      const mask = check.expected.mask as string;
      const nextHop = check.expected.nextHop as string | undefined;
      const route = state.routes.find(
        (r) => r.network === network && r.mask === mask && r.source === "static",
      );
      if (!route) return fail(`No static route to ${network}/${mask}`);
      if (nextHop && route.nextHop !== nextHop)
        return fail(`Static route to ${network} uses next-hop ${route.nextHop ?? "unknown"}, expected ${nextHop}`);
      return pass(`Static route to ${network} is correctly configured`);
    }

    case "ospf_network": {
      const pid = (check.expected.pid as number) ?? 1;
      const network = check.expected.network as string;
      const wildcard = check.expected.wildcard as string | undefined;
      const area = check.expected.area as number;
      const proc = state.ospfProcesses[pid];
      if (!proc) return fail(`OSPF process ${pid} is not configured`);
      const entry = proc.networks.find((n) => n.network === network && n.area === area);
      if (!entry)
        return fail(`OSPF network ${network} area ${area} not found in process ${pid}`);
      if (wildcard && entry.wildcard !== wildcard)
        return fail(`OSPF network ${network} wildcard is "${entry.wildcard}", expected "${wildcard}"`);
      return pass(`OSPF network ${network} area ${area} is correctly configured`);
    }

    case "ospf_router_id": {
      const pid = (check.expected.pid as number) ?? 1;
      const expectedRid = check.expected.routerId as string;
      const proc = state.ospfProcesses[pid];
      if (!proc) return fail(`OSPF process ${pid} is not configured`);
      if (proc.routerId !== expectedRid)
        return fail(`OSPF router-id is "${proc.routerId ?? "not set"}", expected "${expectedRid}"`);
      return pass(`OSPF router-id is correctly set to ${expectedRid}`);
    }

    case "vlan_exists": {
      const id = check.expected.id as number;
      if (!state.vlans[id]) return fail(`VLAN ${id} does not exist`);
      return pass(`VLAN ${id} exists`);
    }

    case "vlan_name": {
      const id = check.expected.id as number;
      const expectedName = check.expected.name as string;
      const vlan = state.vlans[id];
      if (!vlan) return fail(`VLAN ${id} does not exist`);
      if (vlan.name !== expectedName)
        return fail(`VLAN ${id} name is "${vlan.name}", expected "${expectedName}"`);
      return pass(`VLAN ${id} name is correctly set to "${expectedName}"`);
    }

    case "switchport_mode": {
      const ifName = check.expected.interface as string;
      const expectedMode = check.expected.mode as string;
      const iface = findInterface(state, ifName);
      if (!iface) return fail(`Interface ${ifName} does not exist`);
      if (iface.switchportMode !== expectedMode)
        return fail(`${ifName} switchport mode is "${iface.switchportMode ?? "not set"}", expected "${expectedMode}"`);
      return pass(`${ifName} switchport mode is correctly set to ${expectedMode}`);
    }

    case "switchport_access_vlan": {
      const ifName = check.expected.interface as string;
      const expectedVlan = check.expected.vlan as number;
      const iface = findInterface(state, ifName);
      if (!iface) return fail(`Interface ${ifName} does not exist`);
      if (iface.accessVlan !== expectedVlan)
        return fail(`${ifName} access VLAN is ${iface.accessVlan ?? "not set"}, expected ${expectedVlan}`);
      return pass(`${ifName} is correctly assigned to VLAN ${expectedVlan}`);
    }

    case "switchport_trunk_native_vlan": {
      const ifName = check.expected.interface as string;
      const expectedVlan = check.expected.vlan as number;
      const iface = findInterface(state, ifName);
      if (!iface) return fail(`Interface ${ifName} does not exist`);
      if (iface.trunkNativeVlan !== expectedVlan)
        return fail(`${ifName} native VLAN is ${iface.trunkNativeVlan ?? "not set"}, expected ${expectedVlan}`);
      return pass(`${ifName} native VLAN is correctly set to ${expectedVlan}`);
    }

    case "switchport_trunk_allowed_vlans": {
      const ifName = check.expected.interface as string;
      const expectedVlans = check.expected.vlans as number[];
      const iface = findInterface(state, ifName);
      if (!iface) return fail(`Interface ${ifName} does not exist`);
      const actual = iface.trunkAllowedVlans ?? [];
      const missing = expectedVlans.filter((vlan) => !actual.includes(vlan));
      if (missing.length)
        return fail(`${ifName} allowed VLANs missing: ${missing.join(", ")}`);
      return pass(`${ifName} allows VLANs ${expectedVlans.join(", ")}`);
    }

    case "enable_secret": {
      if (!state.enableSecret) return fail("Enable secret is not set");
      return pass("Enable secret is configured");
    }

    case "username_exists": {
      const name = check.expected.username as string;
      const found = state.users.some((u) => u.username === name);
      if (!found) return fail(`Username "${name}" does not exist`);
      return pass(`Username "${name}" is configured`);
    }

    case "service_password_encryption": {
      if (!state.servicePasswordEncryption)
        return fail("Service password-encryption is not enabled");
      return pass("Service password-encryption is enabled");
    }

    case "ssh_version": {
      const expectedVer = check.expected.version as number;
      if (state.sshVersion !== expectedVer)
        return fail(`SSH version is ${state.sshVersion ?? "not set"}, expected ${expectedVer}`);
      return pass(`SSH version ${expectedVer} is correctly configured`);
    }

    case "line_password": {
      const line = check.expected.line as string;
      const pass_ = state.linePasswords[line];
      if (!pass_) return fail(`No password configured on line ${line}`);
      return pass(`Password is configured on line ${line}`);
    }

    case "line_login": {
      const line = check.expected.line as string;
      const expectedMethod = check.expected.method as string;
      const method = state.lineLoginMethod[line];
      if (method !== expectedMethod)
        return fail(`Line ${line} login method is "${method ?? "not set"}", expected "${expectedMethod}"`);
      return pass(`Line ${line} login method is correctly set to "${expectedMethod}"`);
    }

    case "line_transport_input": {
      const line = check.expected.line as string;
      const expected = check.expected.protocol as string;
      const actual = state.lineTransportInput[line] ?? [];
      if (!actual.includes(expected))
        return fail(`Line ${line} transport input is "${actual.join(" ") || "not set"}", expected "${expected}"`);
      return pass(`Line ${line} transport input includes "${expected}"`);
    }

    case "encapsulation_dot1q": {
      const ifName = check.expected.interface as string;
      const expectedVlan = check.expected.vlan as number;
      const iface = findInterface(state, ifName);
      if (!iface) return fail(`Interface ${ifName} does not exist`);
      if (iface.encapsulationDot1q !== expectedVlan)
        return fail(`${ifName} encapsulation dot1q VLAN is ${iface.encapsulationDot1q ?? "not set"}, expected ${expectedVlan}`);
      return pass(`${ifName} encapsulation dot1q VLAN ${expectedVlan} is correctly configured`);
    }

    case "banner_motd_contains": {
      const text = check.expected.contains as string;
      if (!state.bannerMotd?.includes(text))
        return fail(`Banner MOTD does not contain "${text}"`);
      return pass(`Banner MOTD is correctly configured`);
    }

    default:
      return fail(`Unknown check type: ${(check as TaskCheck).type}`);
  }
}

/** Grade all tasks for a lab, returns per-task results and overall pass */
export function gradeLab(
  state: DeviceState,
  tasks: Array<{ id: string; check: TaskCheck }>,
): { taskResults: Record<string, GradeResult>; allPassed: boolean } {
  const taskResults: Record<string, GradeResult> = {};
  let allPassed = true;
  for (const task of tasks) {
    const result = gradeTask(state, task.check);
    taskResults[task.id] = result;
    if (!result.passed) allPassed = false;
  }
  return { taskResults, allPassed };
}

function findInterface(state: DeviceState, name: string): DeviceState["interfaces"][string] | undefined {
  // Try exact match first, then case-insensitive
  if (state.interfaces[name]) return state.interfaces[name];
  const lower = name.toLowerCase();
  for (const [key, val] of Object.entries(state.interfaces)) {
    if (key.toLowerCase() === lower) return val;
  }
  return undefined;
}
