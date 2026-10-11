/**
 * Charlie Creator Hub - Private Owner Authentication
 * Secures the private creator workspace with owner PIN session management.
 */

import { db } from './db';

// Simple in-memory session token registry
const activeSessions = new Set<string>();

export function verifyOwnerPin(pin: string): { success: boolean; token?: string; error?: string } {
  const database = db.getDatabase();
  const configuredPin = process.env.OWNER_PIN || database.channel.ownerPinHash || '2026';

  if (pin === configuredPin) {
    const token = `cch_${Date.now()}_${Math.random().toString(36).substring(2, 12)}`;
    activeSessions.add(token);
    db.logAudit('OWNER_SIGN_IN', 'Creator Charlie Hughes authenticated into private dashboard.');
    return { success: true, token };
  }

  db.logAudit('SIGN_IN_FAILED', 'Failed owner sign-in attempt.');
  return { success: false, error: 'Incorrect creator access PIN. Please try again.' };
}

export function validateSessionToken(token?: string): boolean {
  if (!token) return false;
  return activeSessions.has(token);
}

export function revokeSessionToken(token?: string) {
  if (token) {
    activeSessions.delete(token);
    db.logAudit('OWNER_SIGN_OUT', 'Owner signed out of dashboard session.');
  }
}

export function updateOwnerPin(currentPin: string, newPin: string): { success: boolean; error?: string } {
  const database = db.getDatabase();
  const configuredPin = process.env.OWNER_PIN || database.channel.ownerPinHash || '2026';

  if (currentPin !== configuredPin) {
    return { success: false, error: 'Current PIN does not match.' };
  }

  if (newPin.length < 4) {
    return { success: false, error: 'New PIN must be at least 4 digits.' };
  }

  database.channel.ownerPinHash = newPin;
  db.save();
  db.logAudit('OWNER_PIN_UPDATED', 'Creator access PIN successfully changed.');
  return { success: true };
}
