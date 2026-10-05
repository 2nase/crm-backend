# Gates: <task name>

Scope: <one sentence describing the complete deliverable>

- [ ] G1: <observable outcome measured directly from the artifact>
  CHECK: <command, e.g. npx jest src/foo --silent>
  EXPECT: <success-only marker, e.g. /Tests:\s+\d+ passed/>
  EVIDENCE: pending

- [ ] G2: <type-level / build outcome>
  CHECK: npx tsc --noEmit && echo TYPECHECK_OK
  EXPECT: TYPECHECK_OK
  EVIDENCE: pending

- [ ] G3: <manual outcome no command can decide>
  EVIDENCE: pending
