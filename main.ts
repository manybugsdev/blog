import { serveDir } from "@std/http/file-server";

function post({ path }: Record<string, string | undefined>): Response {
    return serveDir();
}

function home(): Response {
    return new Response("home");
}

function router(
    req: Request,
    route: Record<
        string,
        (groups: Record<string, string | undefined>) => Response
    >,
): Response | null {
    for (const pathname in route) {
        const pattern = new URLPattern({ pathname });
        const match = pattern.exec(req.url);
        if (match) {
            return route[pathname](match.pathname.groups);
        }
    }
    return null;
}

if (import.meta.main) {
    Deno.serve((req) =>
        router(req, {
            "/": home,
            "/posts/:path*": post ?? serveDir(req, { fsRoot: "." }),
        }) ?? serveDir(req, { fsRoot: "./static" })
    );
}
