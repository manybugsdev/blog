---
title: Biweekly Contest 131
publish_date: 2024-05-25T23:58:49.674Z
---

Q1: OK, Q2: OK, Q3: OK, O4: TLE.　 Almost completed.

https://leetcode.com/problems/find-the-xor-of-numbers-which-appear-twice/

```js
var duplicateNumbersXOR = function (nums) {
  return nums
    .reduce(
      ({ s, a }, v) => (s.has(v) ? { s, a: [...a, v] } : { s: s.add(v), a }),
      { s: new Set(), a: [] }
    )
    .a.reduce((a, v) => a ^ v, 0);
};
```

https://leetcode.com/problems/find-occurrences-of-an-element-in-an-array/

```js
var occurrencesOfElement = function (nums, queries, x) {
  let indexes = nums
    .map((v, i) => [v, i])
    .filter(([v, i]) => v === x)
    .map(([v, i]) => i);
  return queries.map((q) => indexes[q - 1] ?? -1);
};
```

https://leetcode.com/problems/find-the-number-of-distinct-colors-among-the-balls/

```js
var queryResults = function (limit, queries) {
  let ballMap = new Map();
  let colorMap = new Map();
  return queries.map(([ball, color]) => {
    let oldcolor = ballMap.get(ball);
    if (oldcolor) {
      let ballset = colorMap.get(oldcolor);
      ballset.delete(ball);
      if (ballset.size === 0) {
        colorMap.delete(oldcolor);
      }
    }
    ballMap.set(ball, color);
    colorMap.has(color)
      ? colorMap.get(color).add(ball)
      : colorMap.set(color, new Set([ball]));
    return colorMap.size;
  });
};
```

https://leetcode.com/problems/block-placement-queries/

```js
var getResults = function (queries) {
  let xs = [0];
  return queries
    .map(([type, x, s]) => {
      if (type === 1) {
        xs.push(x);
        xs.sort((a, b) => a - b);
        return null;
      }
      let minxs = xs.filter((v) => v < x).concat([x]);
      let spans = minxs.slice(1).map((v, i) => v - minxs[i]);
      return spans.findIndex((v) => v >= s) >= 0;
    })
    .filter((a) => a !== null);
};
```
