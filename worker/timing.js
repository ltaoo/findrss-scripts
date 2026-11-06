export function create_execution_timing(started_at = Date.now()) {
  const stages = [];
  const operations = [];
  let current;
  const offset = () => Date.now() - started_at;
  return {
    offset,
    mark(name) {
      if (current?.name === name) return;
      const now = offset();
      if (current) current.duration_ms = now - current.started_ms;
      current = { name, started_ms: stages.length ? now : 0, duration_ms: 0 };
      stages.push(current);
    },
    span(name) {
      const operation = { name, started_ms: offset(), duration_ms: 0 };
      operations.push(operation);
      return () => { operation.duration_ms = offset() - operation.started_ms; };
    },
    snapshot() {
      const elapsed_ms = offset();
      if (current) current.duration_ms = elapsed_ms - current.started_ms;
      return { elapsed_ms, stages, operations };
    },
  };
}
