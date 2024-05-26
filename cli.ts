import { Command } from "https://deno.land/x/cliffy@v1.0.0-rc.4/command/mod.ts";
import { join } from "@std/path";

await new Command()
  .command(
    "new <title:string>",
    "Create a new article.",
  )
  .action(async (_, title) => {
    const today = new Date();
    const filename = title.trim().toLowerCase().split(/\s+/).join("_") + ".md";
    await Deno.writeTextFile(
      join("posts", filename),
      `---
title: ${title}
publish_date: ${today.toISOString()}
---
  `,
    );
    console.log(`create: posts/${filename}`);
  })
  .parse(Deno.args);
