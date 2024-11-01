import { serveDir } from "jsr:@std/http/file-server";
import van, { type Element } from "npm:mini-van-plate/van-plate";
import rehypeStringify from "npm:rehype-stringify";
import remarkFrontmatter from "npm:remark-frontmatter";
import remarkGfm from "npm:remark-gfm";
import remarkParse from "npm:remark-parse";
import remarkRehype from "npm:remark-rehype";
import { matter } from "npm:vfile-matter";
import { unified } from "npm:unified";

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

const GA = Deno.env.get("GA");

const t = van.tags;

const template = {
    _raw: (html: string) => {
        /**
         * hack vanjs
         */
        const el = {
            __proto__: Object.getPrototypeOf(t.a()),
            renderToBuf(buf: string[]) {
                buf.push(html);
            },
            render() {
                const buf: string[] = [];
                this.renderToBuf(buf);
                return buf.join("");
            },
        };
        return el;
    },
    _ga: (GA: string) => [
        t.script({
            async: true,
            src: `https://www.googletagmanager.com/gtag/js?id=${GA}`,
        }),
        t.script(`
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA}');
    `),
    ],
    _default: ({ title, body }: { title: string; body: Element }) => {
        return van.html(
            { lang: "en" },
            t.head(
                GA && template._ga(GA),
                t.meta({ charset: "utf8" }),
                t.meta({
                    name: "viewport",
                    content: "width=device-width, initial-scale=1.0",
                }),
                t.title(title),
                t.link({
                    rel: "stylesheet",
                    href:
                        "https://unpkg.com/prismjs@1.29.0/themes/prism.min.css",
                }),
                t.link({ rel: "icon", href: "/favicon.ico" }),
                t.link({ rel: "stylesheet", href: "/style.css" }),
            ),
            t.body(
                body,
                t.footer(t.p(t.a({ href: "/" }, "Home"))),
                t.script({
                    src: "https://unpkg.com/prismjs@1.29.0/prism.js",
                }),
                t.script({
                    src: "https://unpkg.com/prismjs@1.29.0/plugins/autoloader/prism-autoloader.min.js",
                }),
            ),
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
                        template._raw(`
<svg xmlns="http://www.w3.org/2000/svg" width="72px" height="72px" viewBox="0,0,128,128">
    <g stroke="#111" stroke-width="6" fill="none" stroke-linecap="round">
        <path d="M48,28a16,16,0,0,0,32,0"></path>
        <path d="M26,68a72,32,0,0,1,74,0"></path>
        <path d="M28,78a48,32,0,0,1,70,0"></path>
        <path d="M40,96a48,64,0,0,1,48,0"></path>
        <circle cx="64" cy="64" r="32" fill="white"></circle>
        <path d="M46,68a12,2,0,0,0,24,0"></path>
    </g>
    <g fill="#111">
        <circle cx="48" cy="52" r="3" />
        <circle cx="70" cy="52" r="3" />
    </g>
</svg>`),
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
    post: ({ headers: { title, publish_date }, html }: Post) =>
        template._default({
            title: `${title} | Manybugs Blog`,
            body: t.div(
                t.header(
                    { class: "mv" },
                    t.h1(title),
                    t.p(t.time(publish_date.slice(0, 10))),
                ),
                t.main(template._raw(html)),
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
                headers: file.data.matter as Record<string, string>,
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
                "/posts/:path*": ({ path }, req) => {
                    if (!path) return response.notFound();
                    const post = posts.find((p) => p.id === `posts/${path}`);
                    if (!post) {
                        return serveDir(req, {
                            fsRoot: ".",
                        });
                    }
                    return response.html(
                        template.post(post),
                    );
                },
            }),
            (req) => serveDir(req, { fsRoot: "./static" }),
        ),
    );
}
