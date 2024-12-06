import { serveDir } from "jsr:@std/http/file-server";
import van, { type Element } from "npm:mini-van-plate/van-plate";
import rehypeStringify from "npm:rehype-stringify";
import remarkFrontmatter from "npm:remark-frontmatter";
import remarkGfm from "npm:remark-gfm";
import remarkParse from "npm:remark-parse";
import remarkRehype from "npm:remark-rehype";
import { matter } from "npm:vfile-matter";
import { unified } from "npm:unified";
import { render, tags as x } from "./xml.ts";

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

type Feed = {
  id: string;
  author: string;
  title: string;
  updated: Date;
  entries: Entry[];
};

type Entry = {
  id: string;
  title: string;
  updated: Date;
};

const BASEURL = "https://manybugs.dev";

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
  _default: ({ title, body }: { title: string; body: Element }) => {
    return van.html(
      { lang: "en" },
      t.head(
        t.meta({ charset: "utf8" }),
        t.meta({
          name: "viewport",
          content: "width=device-width, initial-scale=1.0",
        }),
        t.meta({
          name: "description",
          content:
            "I'm a web front-end developer, Manybugs. This is my blog site. I'm interested in programming and science.",
        }),
        t.title(title),
        t.link({
          rel: "stylesheet",
          href: "/prism.css",
        }),
        t.link({ rel: "icon", href: "/favicon.ico" }),
        t.link({ rel: "stylesheet", href: "/modern-normalize.css" }),
        t.link({ rel: "stylesheet", href: "/style.css" }),
      ),
      t.body(
        body,
        t.footer(t.p(t.a({ href: "/" }, "Home"))),
        t.script({
          src: "/prism.js",
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
          // https://icons.getbootstrap.jp
          t.div(
            { style: "display: flex; gap: 0.6rem" },
            t.a(
              {
                href: "/feed",
                "aria-label": "Atom(RSS) Feed",
              },
              template._raw(
                `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-rss-fill" viewBox="0 0 16 16">
  <path d="M2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zm1.5 2.5c5.523 0 10 4.477 10 10a1 1 0 1 1-2 0 8 8 0 0 0-8-8 1 1 0 0 1 0-2m0 4a6 6 0 0 1 6 6 1 1 0 1 1-2 0 4 4 0 0 0-4-4 1 1 0 0 1 0-2m.5 7a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3"/>
</svg>`,
              ),
            ),
            t.a(
              {
                href: "https://github.com/manybugsdev",
                "aria-label": "My GitHub Account",
              },
              template._raw(
                `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8"/>
                    </svg>`,
              ),
            ),
          ),
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

const staticHeaders: Record<string, string> = {
  "cache-control": `max-age=${60 * 60 * 24 * 120}`,
};

const response = {
  notFound: () => new Response("404 not found.", { status: 404 }),
  html: (body: string) =>
    new Response(body, {
      status: 200,
      headers: {
        "content-type": "text/html;charset=utf8",
        ...staticHeaders,
      },
    }),
  atom: (feed: Feed) =>
    new Response(
      render(
        x.feed(
          { xmlns: "http://www.w3.org/2005/Atom" },
          x.author(x.name(feed.author)),
          x.id(feed.id),
          x.link({ rel: "self", href: feed.id }),
          x.title(feed.title),
          x.updated(feed.updated.toISOString()),
          feed.entries.map((ent) =>
            x.entry(
              x.id(ent.id),
              x.link({ ref: "alternate", href: ent.id }),
              x.title(ent.title),
              x.updated(ent.updated.toISOString()),
            )
          ),
        ),
      ),
      {
        status: 200,
        headers: {
          "content-type": "application/atom+xml",
        },
      },
    ),
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
const url = (path: string) => new URL(path, BASEURL).toString();
if (import.meta.main) {
  const posts = await collectPosts("posts");
  const feed: Feed = {
    id: url("/"),
    author: "Manybugs",
    title: "Manybugs Blog",
    updated: new Date(posts[0].headers.publish_date),
    entries: posts.map((p) => ({
      id: url(p.id),
      title: p.headers.title,
      updated: new Date(p.headers.publish_date),
    })),
  };
  Deno.serve(
    pipe(
      router({
        "/": () =>
          response.html(
            template.home(posts),
          ),
        "/feed": () => response.atom(feed),
        "/posts/:path*": ({ path }, req) => {
          if (!path) return response.notFound();
          const post = posts.find((p) => p.id === `posts/${path}`);
          if (!post) {
            return serveDir(req, {
              fsRoot: ".",
              headers: Object.keys(staticHeaders).map((key) =>
                `${key}:${staticHeaders[key]}`
              ),
            });
          }
          return response.html(
            template.post(post),
          );
        },
      }),
      (req) =>
        serveDir(req, {
          fsRoot: "./static",
          headers: Object.keys(staticHeaders).map((key) =>
            `${key}:${staticHeaders[key]}`
          ),
        }),
    ),
  );
}
