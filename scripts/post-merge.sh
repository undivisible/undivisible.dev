#!/bin/bash
set -e
bun install --frozen-lockfile
bun run --cwd lib/db push
