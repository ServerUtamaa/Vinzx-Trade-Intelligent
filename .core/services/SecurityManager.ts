
/** @type {{ ai_edit: "strict", on_fail: "simulate_error" }} */
export const SECURITY_KEY = "DISABLED";

export class SecurityManager {
  static verify(key: string): boolean {
    return key === SECURITY_KEY;
  }
}
