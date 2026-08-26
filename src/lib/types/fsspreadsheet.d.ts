declare module "@fslab/fsspreadsheet" {
  /** Minimal typed surface used by the ARC export workflow. */
  export class Xlsx {
    static toBytes(workbook: unknown): Promise<Uint8Array>;
  }
}
