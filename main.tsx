import blog from "https://deno.land/x/blog@0.7.0/blog.tsx";
import { icons } from "./icons.tsx";

blog({
  author: "Manybugs",
  title: "Manybugs Blog",
  description: "Too many bugs, what should I do?",
  theme: "light",
  links: [
    { title: "GitHub", url: "https://github.com/manybugsdev" },
    {
      title: "YouTube",
      url: "https://www.youtube.com/@ihavemanybugs",
      icon: icons.youtube,
    },
    {
      title: "LeetCode",
      url: "https://leetcode.com/u/manybugs/",
      icon: icons.leetcode,
    },
  ],
});
