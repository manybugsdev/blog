import { serveDir } from "jsr:@std/http/file-server";
import van, { type Element } from "npm:mini-van-plate/van-plate";

const t = van.tags;

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
const template = {
    _default: ({ title, body }: { title: string; body: Element }) =>
        van.html(
            { lang: "en" },
            t.head(
                t.meta({ charset: "utf8" }),
                t.meta({
                    name: "viewport",
                    content: "width=device-width, initial-scale=1.0",
                }),
                t.title(title),
                t.link({ rel: "icon", href: "favicon.ico" }),
                t.link({ rel: "stylesheet", href: "style.css" }),
            ),
            t.body(body),
        ),
    home: (posts: Post[]) =>
        template._default({
            title: "Home | manybugs.dev",
            body: t.div(
                t.header(
                    { class: "mv" },
                    t.h1("manybugs.dev"),
                    t.p("Too many bugs, what should I do?"),
                ),
                t.main(),
            ),
        }),
};

const response = {
    notFound: () => new Response("404 not found.", { status: 404 }),
    html: (body: string) =>
        new Response(body, {
            status: 200,
            headers: { "content-type": "text/html;charset=utf8" },
        }),
};

const pipe = (...handlers: Handler[]) => async (req: Request) => {
    for (const handler of handlers) {
        const res = await handler(req);
        if (res.status !== 404) return res;
    }
    return response.notFound();
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
        return response.notFound();
    };

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
                    response.html(
                        template.home(),
                    ),
            }),
            (req) => serveDir(req, { fsRoot: "./static" }),
        ),
    );
}
