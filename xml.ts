export type Tags = Record<string, XmlFn>;

export type XmlFn = {
    (...children: ElementChild[]): Element;
    (attrs: Attrs, ...children: ElementChild[]): Element;
};

export type Element = {
    tag: string;
    attrs: Record<string, string>;
    elements: Element[];
} | string;

export type ElementChild = Element | Element[];

export type Attrs = Record<string, string>;

export const tags: Tags = new Proxy({}, {
    get(_, tag: string) {
        const fn: XmlFn = (
            a: Record<string, string> | ElementChild = {},
            ...c: ElementChild[]
        ) => {
            let attrs: Attrs;
            let elements = c.flat();
            [attrs, elements] = Array.isArray(a)
                ? [{}, [...a, ...elements]]
                : typeof a === "string"
                ? [{}, [a, ...elements]]
                : typeof a.attrs === "object"
                ? [{}, [a as Element, ...elements]]
                : [a as Attrs, elements];
            return { tag, attrs, elements };
        };
        return fn;
    },
});

export function render(
    el: Element,
    format: boolean = true,
    indent: number = 0,
): string {
    const dec = indent ? "" : `<?xml version="1.0" encoding="utf8"?>\n`;
    const space = format
        ? Array.from({ length: indent }, () => " ").join("")
        : "";
    const br = format ? "\n" : "";
    if (typeof el === "string") return dec + space + el + br;
    const { tag, attrs, elements } = el;
    let a = Object.keys(attrs).map((k) => `${k}="${attrs[k]}"`).join(" ");
    a = a ? " " + a : a;
    if (elements.length === 0) return `${dec}${space}<${tag}${a}/>${br}`;
    return `${dec}${space}<${tag}${a}>${br}${
        elements.map((e) => render(e, format, indent + 2)).join("")
    }${space}</${tag}>${br}`;
}
