import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const questionDir = path.join(root, "src", "content", "questions");
const labDir = path.join(root, "src", "content", "labs");

const validTaskChecks = new Set([
  "hostname",
  "interface_ip",
  "interface_status",
  "interface_description",
  "static_route",
  "ospf_network",
  "ospf_router_id",
  "vlan_exists",
  "vlan_name",
  "switchport_mode",
  "switchport_access_vlan",
  "switchport_trunk_allowed_vlans",
  "switchport_trunk_native_vlan",
  "enable_secret",
  "username_exists",
  "service_password_encryption",
  "ssh_version",
  "line_password",
  "line_login",
  "line_transport_input",
  "encapsulation_dot1q",
  "banner_motd_contains",
]);

const issues = [];

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function auditQuestions() {
  for (const fileName of fs.readdirSync(questionDir).filter((file) => file.endsWith(".json"))) {
    const questions = readJson(path.join(questionDir, fileName));
    questions.forEach((question, index) => {
      const loc = `${fileName}#${question.id || index}`;
      const correct = Array.isArray(question.correct) ? question.correct : [question.correct];
      if (!question.id) issues.push(`${loc}: missing id`);
      if (!question.text || typeof question.text !== "string") issues.push(`${loc}: missing text`);
      if (!Array.isArray(question.options) || question.options.length !== 4) {
        issues.push(`${loc}: must have exactly 4 options`);
      }
      if (!question.explanation || String(question.explanation).length < 40) {
        issues.push(`${loc}: explanation is missing or too short`);
      }
      if (!question.domain) issues.push(`${loc}: missing domain`);
      if (!question.objective) issues.push(`${loc}: missing objective`);
      const choose = String(question.text || "").match(/choose\s+(two|three|four|\d+)/i);
      const expected = choose
        ? { two: 2, three: 3, four: 4 }[choose[1].toLowerCase()] || Number(choose[1])
        : 1;

      if (choose && correct.length !== expected) {
        issues.push(`${loc}: says choose ${choose[1]} but has ${correct.length} correct answer(s)`);
      }
      if (!choose && correct.length > 1) {
        issues.push(`${loc}: has multiple correct answers but text does not say choose multiple`);
      }
      for (const letter of correct) {
        if (!/^[A-D]$/.test(letter)) issues.push(`${loc}: invalid correct letter ${letter}`);
        if (!question.options?.some((option) => typeof option === "string" && option.startsWith(`${letter}.`))) {
          issues.push(`${loc}: correct letter ${letter} has no matching option`);
        }
      }
    });
  }
}

function collectLabFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return collectLabFiles(fullPath);
    return entry.name.endsWith(".json") ? [fullPath] : [];
  });
}

function auditLabs() {
  for (const file of collectLabFiles(labDir)) {
    const lab = readJson(file);
    const rel = path.relative(root, file);
    if (!lab.id) issues.push(`${rel}: missing id`);
    if (!lab.title) issues.push(`${rel}: missing title`);
    if (!lab.scenario || String(lab.scenario).length < 40) issues.push(`${rel}: scenario is missing or too short`);
    if (!Array.isArray(lab.tasks) || lab.tasks.length === 0) issues.push(`${rel}: missing tasks`);
    for (const task of lab.tasks || []) {
      const type = task.check?.type;
      if (!task.id) issues.push(`${rel}: task missing id`);
      if (!task.description) issues.push(`${rel}#${task.id}: missing description`);
      if (!validTaskChecks.has(type)) {
        issues.push(`${rel}#${task.id}: unsupported check type "${type}"`);
      }
      if (!task.check?.expected || typeof task.check.expected !== "object") {
        issues.push(`${rel}#${task.id}: missing check.expected object`);
      }
    }
  }
}

auditQuestions();
auditLabs();

if (issues.length) {
  console.error(issues.join("\n"));
  process.exit(1);
}

console.log("Content audit passed.");
