import { serveDir } from "jsr:@std/http/file-server";

type Handler = (req: Request) => Response | Promise<Response>;

type RouterHandler = (
    groups: Record<string, string | undefined>,
    req: Request,
) => Response | Promise<Response>;

type Post = {
    md: string;
    html: string;
    headers: Record<string, string>;
};

const $ = (
    tag: string,
    attrs?: Record<string, string>,
    ...children: string[]
) => `<${tag} ${
    attrs
        ? Object.keys(attrs).map((key) => `${key}="${attrs[key]}"`).join(" ")
        : ""
}${children.length ? `>${children.join("")}</${tag}>` : "/>"}`;

const $layout = ({ title, body }: { title: string; body: string }) =>
    $(
        "html",
        { lang: "ja" },
        $(
            "head",
            {},
            $("meta", { charset: "utf8" }),
            $("meta", {
                name: "viewport",
                content: "width=device-width, initial-scale=1.0",
            }),
            $("title", {}, title),
            $("link", { rel: "stylesheet", href: "style.css" }),
        ),
        $("body", {}, body),
    );

const notFound = () => new Response("404 not found.", { status: 404 });

const pipe = (...handlers: Handler[]) => async (req: Request) => {
    for (const handler of handlers) {
        const res = await handler(req);
        if (res.status !== 404) return res;
    }
    return notFound();
};

const router =
    (route: Record<string, RouterHandler>) => async (req: Request) => {
        for (const pathname in route) {
            const handler = route[pathname];
            const pattern = new URLPattern({ pathname });
            const match = pattern.exec(req.url);
            if (match) {
                return await handler(match.pathname.groups, req);
            }
        }
        return notFound();
    };

const html = (body: string) =>
    new Response(body, {
        status: 200,
        headers: { "content-type": "text/html;charset=utf8" },
    });

const collectPosts = async (path: string) => {
    let posts: Record<string, Post> = {};
    for await (const ent of Deno.readDir(path)) {
        if (ent.isDirectory) {
            posts = {
                ...posts,
                ...(await collectPosts(`${path}/${ent.name}`)),
            };
        }
        if (ent.isFile && ent.name.endsWith(".md")) {
            const basename = ent.name.split(".").slice(0, -1).join(".");
            posts[`${path}/${basename}/`] = { md: "", html: "", headers: {} };
        }
    }
    return posts;
};

if (import.meta.main) {
    const posts = await collectPosts("posts");
    Deno.serve(
        pipe(
            router({
                "/": () =>
                    html(
                        $layout({
                            title: "Home | manybugs.dev",
                            body: "<h1>hi</h1>",
                        }),
                    ),
            }),
            (req) => serveDir(req, { fsRoot: "./static" }),
        ),
    );
}
