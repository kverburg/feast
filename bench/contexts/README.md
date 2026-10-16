# Contexts

A context file is text added to every request of a benchmark run as the system instruction: house style, a glossary,
rules learned from earlier mistakes, worked examples. Each file is a prompt version:

    npm run bench -- --task translate --provider mistral --context bench/contexts/v1.md

The file name is the label shown in Settings > AI benchmark, so runs of the same context can be compared over time
and against the baseline (no context). When a context wins it can be switched on in production.
