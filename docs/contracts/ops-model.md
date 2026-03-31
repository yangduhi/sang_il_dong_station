# Task / Run / Event / Evidence model

This repository uses a lightweight operational model for auditability and evidence, not a generic orchestration platform.

## Task
- planning or execution unit
- current allowed states: `planned`, `ready`, `running`, `succeeded`, `failed`, `blocked`

## Run
- concrete execution of a task stage
- stores summary and numeric metrics

## Event
- structured record of something that happened during a run
- file-backed in `runtime/events/`

## Evidence
- raw sample, processed output, quality report, or snapshot
- stored separately from user-facing docs and UI

The current implementation is file-backed and can be projected into Postgres later if needed.
