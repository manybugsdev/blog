import { serveDir } from "jsr:@std/http/file-server";
import van, { type Element } from "npm:mini-van-plate/van-plate";
import rehypeStringify from "npm:rehype-stringify";
import remarkFrontmatter from "npm:remark-frontmatter";
import remarkGfm from "npm:remark-gfm";
import remarkParse from "npm:remark-parse";
import remarkRehype from "npm:remark-rehype";
import { matter } from "npm:vfile-matter";
import { unified } from "npm:unified";

const t = van.tags;

type Handler = (req: Request) => Response | Promise<Response>;

type RouterHandler = (
    groups: Record<string, string | undefined>,
    req: Request,
) => Response | Promise<Response>;

type Post = {
    id: string;
    md: string;
    html: string;
    headers: Record<string, string>;
};

const template = {
    _default: ({ title, body }: { title: string; body: string }) => {
        return van.html(
            { lang: "en" },
            t.head(
                t.meta({ charset: "utf8" }),
                t.meta({
                    name: "viewport",
                    content: "width=device-width, initial-scale=1.0",
                }),
                t.title(title),
                t.link({ rel: "icon", href: "/favicon.ico" }),
                t.link({ rel: "stylesheet", href: "/style.css" }),
            ),
            t.body(t.footer(t.p(t.a({ href: "/" }, "Home")))),
        );
    },
    home: (posts: Post[]) =>
        template._default({
            title: "Home | Manybugs Blog",
            body: t.div(
                t.header(
                    { class: "mv" },
                    t.div(
                        { style: "width: 72px; height: 72px" },
                        t.img({
                            src: "logo.svg",
                            alt: "logo",
                            width: "72px",
                            height: "72px",
                        }),
                    ),
                    t.h1("Manybugs Blog"),
                    t.p("Too many bugs, what should I do?"),
                ),
                t.main(
                    posts.map(({ headers: { title, publish_date }, id }) =>
                        t.a(
                            { href: `/${id}`, style: "text-decoration: none" },
                            t.article(
                                t.h2(title),
                                t.p(publish_date.slice(0, 10)),
                            ),
                        )
                    ),
                ),
            ),
        }),
    post: ({ headers: { title }, html }: Post) => {
        const dom = t.div();
        return template._default({
            title: `${title} | Manybugs Blog`,
            body: html,
        });
    },
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
            console.log(match);
            if (match) {
                return await handler(match.pathname.groups, req);
            }
        }
        return response.notFound();
    };

const collectPosts = async (path: string) => {
    let posts: Post[] = [];
    for await (const ent of Deno.readDir(path)) {
        if (ent.isDirectory) {
            posts = [
                ...posts,
                ...(await collectPosts(`${path}/${ent.name}`)),
            ];
        }
        if (ent.isFile && ent.name.endsWith(".md")) {
            const basename = ent.name.split(".").slice(0, -1).join(".");
            const md = await Deno.readTextFile(`${path}/${ent.name}`);
            const file = await unified()
                .use(remarkParse)
                .use(remarkFrontmatter)
                .use(() => (_, file) => {
                    matter(file);
                })
                .use(remarkGfm)
                .use(remarkRehype)
                .use(rehypeStringify)
                .process(md);
            const html = String(file);
            posts.push({
                id: `${path}/${basename}`,
                md,
                html,
                headers: file.data.matter as any,
            });
        }
    }
    return posts.toSorted((b, a) =>
        new Date(a.headers.publish_date).getTime() -
        new Date(b.headers.publish_date).getTime()
    );
};

if (import.meta.main) {
    const posts = await collectPosts("posts");
    Deno.serve(
        pipe(
            router({
                "/": () =>
                    response.html(
                        template.home(posts),
                    ),
                "/posts/:path*": ({ path }) => {
                    if (!path) return response.notFound();
                    const post = posts.find((p) => p.id === `posts/${path}`);
                    if (!post) return response.notFound();
                    return response.html(
                        template.post(post),
                    );
                },
            }),
            (req) => serveDir(req, { fsRoot: "./static" }),
        ),
    );
}
