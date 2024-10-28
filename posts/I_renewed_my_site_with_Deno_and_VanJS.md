---
title: I renewed my site with Deno and VanJS
publish_date: 2024-10-28
---

I renewed my site and deployed it on Deno Deploy.

- [My Blog](https://manybugs.dev)
- [Source](https://github.com/manybugsdev/blog)

The structure of my site became simpler because of [Deno](https://deno.com/) and [VanJS](https://vanjs.org/). Deno motivate me to use web standard APIs and VanJS is easy to understand because it's a really tiny framework.

> Deno implements web standard APIs on the server. Deno actively participates in TC39 and WinterCG to help move the web forward.

> VanJS: A 1.0kB Grab 'n Go Reactive UI Framework without React/JSX

I used the [Mini-Van](https://vanjs.org/minivan) which is a minimum template engine like VanJS style. As a result, `main.ts` is entire server-side code that has about 220 lines. Thank you both of them.

```ts
// top page template
{
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
            })
          ),
          t.h1("Manybugs Blog"),
          t.p("Too many bugs, what should I do?")
        ),
        t.main(
          posts.map(({ headers: { title, publish_date }, id }) =>
            t.a(
              { href: `/${id}`, style: "text-decoration: none" },
              t.article(t.h2(title), t.p(publish_date.slice(0, 10)))
            )
          )
        )
      ),
    });
}
```

```ts
// routing
Deno.serve(
  pipe(
    router({
      "/": () => response.html(template.home(posts)),
      "/posts/:path*": ({ path }) => {
        if (!path) return response.notFound();
        const post = posts.find((p) => p.id === `posts/${path}`);
        if (!post) return response.notFound();
        return response.html(template.post(post));
      },
    }),
    (req) => serveDir(req, { fsRoot: "./static" })
  )
);
```
