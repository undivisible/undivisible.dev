import type { PendingChallenge } from "./gateway";
import { certificateFromJson, certificateToJson } from "./wire";

/** Single-use sign-in challenges must survive object hibernation too. */
export class Challenges extends Map<string, PendingChallenge> {
  constructor(private storage: DurableObjectStorage) {
    super();
    storage.sql.exec(
      "CREATE TABLE IF NOT EXISTS challenges (id TEXT PRIMARY KEY, value TEXT NOT NULL)",
    );
    for (const row of storage.sql.exec<{ id: string; value: string }>(
      "SELECT id,value FROM challenges",
    )) {
      const value = JSON.parse(row.value);
      const challenge = {
        ...value,
        certificate: certificateFromJson(value.certificate),
      } as PendingChallenge;
      if (challenge.expiresAt > Date.now()) super.set(row.id, challenge);
      else storage.sql.exec("DELETE FROM challenges WHERE id = ?", row.id);
    }
  }
  override set(id: string, value: PendingChallenge): this {
    const serialized = JSON.stringify({
      ...value,
      certificate: certificateToJson(value.certificate),
    });
    this.storage.sql.exec(
      "INSERT INTO challenges (id,value) VALUES (?,?) ON CONFLICT(id) DO UPDATE SET value=excluded.value",
      id,
      serialized,
    );
    return super.set(id, value);
  }
  override delete(id: string): boolean {
    this.storage.sql.exec("DELETE FROM challenges WHERE id=?", id);
    return super.delete(id);
  }
}
