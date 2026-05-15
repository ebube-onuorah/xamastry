import test from "node:test";
import assert from "node:assert/strict";
import { gradeLab } from "../src/lib/grader";
import { execute } from "../src/lib/ios/interpreter";
import { createDevice } from "../src/lib/ios/state";
import type { DeviceState } from "../src/lib/ios/state";

function runCommands(commands: string[], initial: DeviceState = createDevice()) {
  return commands.reduce((state, command) => execute(state, command).newState, initial);
}

test("grades a basic router configuration from IOS-style commands", () => {
  const state = runCommands([
    "enable",
    "configure terminal",
    "hostname R1",
    "interface GigabitEthernet0/0",
    "ip address 10.0.0.1 255.255.255.252",
    "no shutdown",
    "exit",
    "interface GigabitEthernet0/1",
    "ip address 192.168.1.1 255.255.255.0",
    "no shutdown",
  ]);

  const result = gradeLab(state, [
    { id: "hostname", check: { type: "hostname", description: "Hostname", expected: { hostname: "R1" } } },
    {
      id: "wan-ip",
      check: {
        type: "interface_ip",
        description: "WAN IP",
        expected: { interface: "GigabitEthernet0/0", ip: "10.0.0.1", mask: "255.255.255.252" },
      },
    },
    {
      id: "wan-up",
      check: {
        type: "interface_status",
        description: "WAN up",
        expected: { interface: "GigabitEthernet0/0", status: "up" },
      },
    },
    {
      id: "lan-ip",
      check: {
        type: "interface_ip",
        description: "LAN IP",
        expected: { interface: "GigabitEthernet0/1", ip: "192.168.1.1", mask: "255.255.255.0" },
      },
    },
  ]);

  assert.equal(result.allPassed, true);
  assert.equal(result.taskResults.hostname.passed, true);
  assert.equal(result.taskResults["wan-ip"].passed, true);
  assert.equal(result.taskResults["wan-up"].passed, true);
  assert.equal(result.taskResults["lan-ip"].passed, true);
});

test("fails grading when required interface state is missing", () => {
  const state = runCommands([
    "enable",
    "configure terminal",
    "hostname R1",
    "interface GigabitEthernet0/0",
    "ip address 10.0.0.1 255.255.255.252",
  ]);

  const result = gradeLab(state, [
    {
      id: "wan-up",
      check: {
        type: "interface_status",
        description: "WAN up",
        expected: { interface: "GigabitEthernet0/0", status: "up" },
      },
    },
  ]);

  assert.equal(result.allPassed, false);
  assert.equal(result.taskResults["wan-up"].passed, false);
  assert.match(result.taskResults["wan-up"].message, /expected "up"/);
});

test("tracks VLAN, switchport, and OSPF configuration state", () => {
  const state = runCommands([
    "enable",
    "configure terminal",
    "vlan 10",
    "name SALES",
    "exit",
    "interface FastEthernet0/1",
    "switchport mode access",
    "switchport access vlan 10",
    "exit",
    "router ospf 1",
    "router-id 1.1.1.1",
    "network 10.0.0.0 0.0.0.3 area 0",
  ]);

  const result = gradeLab(state, [
    { id: "vlan-name", check: { type: "vlan_name", description: "VLAN 10", expected: { id: 10, name: "SALES" } } },
    {
      id: "access-port",
      check: {
        type: "switchport_access_vlan",
        description: "Access VLAN",
        expected: { interface: "FastEthernet0/1", vlan: 10 },
      },
    },
    {
      id: "ospf-rid",
      check: {
        type: "ospf_router_id",
        description: "OSPF RID",
        expected: { pid: 1, routerId: "1.1.1.1" },
      },
    },
    {
      id: "ospf-network",
      check: {
        type: "ospf_network",
        description: "OSPF network",
        expected: { pid: 1, network: "10.0.0.0", wildcard: "0.0.0.3", area: 0 },
      },
    },
  ]);

  assert.equal(result.allPassed, true);
});

test("adds connected routes and supports basic ping reachability", () => {
  const state = runCommands([
    "enable",
    "configure terminal",
    "interface GigabitEthernet0/0",
    "ip address 10.0.0.1 255.255.255.252",
    "no shutdown",
    "end",
  ]);

  assert.ok(state.routes.some((route) => route.source === "connected" && route.network === "10.0.0.0"));

  const reachable = execute(state, "ping 10.0.0.2");
  assert.match(reachable.output, /Success rate is 100 percent/);

  const unreachable = execute(state, "ping 192.168.50.1");
  assert.match(unreachable.output, /Success rate is 0 percent/);
});
