const fs = await import("node:fs/promises");

const input = await new Promise((resolve) => {
  let data = "";
  process.stdin.setEncoding("utf8");
  process.stdin.on("data", (chunk) => {
    data += chunk;
  });
  process.stdin.on("end", () => resolve(data));
});

const helperBlock = `

// ------------------------------------------------------------
// Helpers (append-only; regenerated safely)
// ------------------------------------------------------------
export type Tables<
  T extends keyof Database["public"]["Tables"]
> = Database["public"]["Tables"][T]["Row"];

export type TablesInsert<
  T extends keyof Database["public"]["Tables"]
> = Database["public"]["Tables"][T]["Insert"];

export type TablesUpdate<
  T extends keyof Database["public"]["Tables"]
> = Database["public"]["Tables"][T]["Update"];

export type Enums<
  T extends keyof Database["public"]["Enums"]
> = Database["public"]["Enums"][T];
`;

const output = input.includes("export type Tables<")
  ? input
  : `${input.trimEnd()}\n${helperBlock.trimStart()}`;

process.stdout.write(output);

// Quietly ensure directory exists when run in a fresh repo.
// (No-op if already present; does not affect stdout)
await fs.mkdir(new URL("../lib/supabase/", import.meta.url), { recursive: true });
