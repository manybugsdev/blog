import { Command } from "jsr:@cliffy/command@1.0.0-rc.7";

const command = new Command();
await command.name("blog")
    .action(() => command.showHelp())
    .command(
        "new",
        "Create a new blog",
    )
    .arguments("<title:string>")
    .action(async (_, title) => {
        const filename = title.trim().toLowerCase().split(/\s+/).join("_") +
            ".md";
        await Deno.writeTextFile(
            `./posts/${filename}`,
            `---
title: ${title}
publish_date: ${new Date().toISOString()}
---`,
        );
    })
    .parse(Deno.args);
