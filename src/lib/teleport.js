'use client';

import { useSyncExternalStore } from 'react';

/**
 * Coordinates the cinematic transition from the dice / card oracle to a
 * project card. The overlay subscribes via `useTeleportRequest()`; once its
 * animation finishes it calls `clearTeleport()`.
 *
 * A request looks like:
 *   { project, projectIndex, faceNumeral, sourceRect, accent, ghostKind }
 * where ghostKind is 'face' (triangular dice face) or 'card' (tarot card).
 */
let request = null;
const listeners = new Set();

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function summonTeleport(req) {
  request = req;
  emit();
}

export function clearTeleport() {
  request = null;
  emit();
}

export function useTeleportRequest() {
  return useSyncExternalStore(subscribe, () => request, () => null);
}
