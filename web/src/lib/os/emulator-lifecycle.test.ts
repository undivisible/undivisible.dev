import { expect, test } from "bun:test";
import { emulatorLifecycle } from "./emulator-lifecycle";

function fake() {
  let ready = () => {};
  let runs = 0;
  let destroys = 0;
  const emulator = {
    add_listener: (_: string, listener: () => void) => {
      ready = listener;
    },
    run: async () => {
      runs++;
    },
    destroy: async () => {
      destroys++;
    },
  };
  return {
    emulator,
    ready: () => ready(),
    runs: () => runs,
    destroys: () => destroys,
  };
}

test("stop during initialization never starts and destroys only after readiness", async () => {
  const vm = fake();
  const dispose = emulatorLifecycle(vm.emulator, {
    current: () => true,
    ready: () => {},
    failed: () => {},
  });
  dispose();
  expect(vm.destroys()).toBe(0);
  vm.ready();
  await Promise.resolve();
  expect(vm.runs()).toBe(0);
  expect(vm.destroys()).toBe(1);
  dispose();
  expect(vm.destroys()).toBe(1);
});

test("only a current initialized emulator runs", () => {
  const vm = fake();
  emulatorLifecycle(vm.emulator, {
    current: () => false,
    ready: () => {
      throw new Error("stale readiness");
    },
    failed: () => {},
  });
  vm.ready();
  expect(vm.runs()).toBe(0);
  expect(vm.destroys()).toBe(1);
});

test("asynchronous destruction rejection is handled", async () => {
  const vm = fake();
  const failure = new Error("cleanup failed");
  vm.emulator.destroy = async () => {
    throw failure;
  };
  let caught: unknown;
  const dispose = emulatorLifecycle(vm.emulator, {
    current: () => true,
    ready: () => {},
    failed: (error) => {
      caught = error;
    },
  });
  vm.ready();
  dispose();
  await Promise.resolve();
  expect(vm.runs()).toBe(1);
  expect(caught).toBe(failure);
});
