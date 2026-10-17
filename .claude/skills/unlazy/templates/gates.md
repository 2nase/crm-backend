# Gates: <task name>

Scope: <one sentence describing the complete deliverable>

- [ ] G1: <observable outcome measured directly from the artifact>
  CHECK: <shell command that reads the actual artifact, e.g. a package.json script>
  EXPECT: <success-only marker or /regex/>
  EVIDENCE: pending

- [ ] G2: <type-level / build outcome>
  CHECK: npm run typecheck && echo TYPECHECK_OK
  EXPECT: TYPECHECK_OK
  EVIDENCE: pending

- [ ] G3: <manual outcome no command can decide>
  EVIDENCE: pending
