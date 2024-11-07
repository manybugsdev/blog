---
title: Ready for providing Atom feeds
publish_date: 2024-11-07
---

## What is Atom?

[RFC4287](https://datatracker.ietf.org/doc/html/rfc4287)

Atom is an XML-based document format to notify users that web contents as blog articles are updated.

[The Atom format was developed as an alternative to RSS.](<https://en.wikipedia.org/wiki/Atom_(web_standard)#:~:text=The%20Atom%20format%20was%20developed%20as%20an%20alternative%20to%20RSS.>) You can receive notification of blogs which provide Atom if you use RSS reader like [Feedly](https://feedly.com/) supporting Atom format.

RSS reader work by simple mechanism same as web browser. RSS reader repeatly send HTTP GET to the server providing Atom feeds to get information about new articles. RSS reader tends to send signals more than web browser so Atom feeds are required to be shorter than HTML.

![](/posts/img/rss.drawio.svg)

## Atom data structure

There is a good example in the RFC. As you can see, Atom is like HTML.

```xml
<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Example Feed</title>
  <link href="http://example.org/"/>
  <updated>2003-12-13T18:30:02Z</updated>
  <author>
    <name>John Doe</name>
  </author>
  <id>urn:uuid:60a76c80-d399-11d9-b93C-0003939e0af6</id>
  <entry>
    <title>Atom-Powered Robots Run Amok</title>
    <link href="http://example.org/2003/12/13/atom03"/>
    <id>urn:uuid:1225c695-cfb8-4ebb-aaaa-80da344efa6a</id>
    <updated>2003-12-13T18:30:02Z</updated>
    <summary>Some text.</summary>
  </entry>
</feed>
```

The first tag is XML declaration. [You should write it in xml documents.](https://www.w3.org/TR/xml/#sec-prolog-dtd:~:text=%3A%20XML%20documents-,should,-begin%20with%20an)

```xml
<?xml version="1.0" encoding="utf-8"?>
```

### atom:feed

The "atom:feed" element is the document (i.e., top-level) element of an Atom Feed Document.

```xml
<feed xmlns="http://www.w3.org/2005/Atom">
</feed>
```

atom:feed elements MUST contain one or more atom:author elements,
unless all of the atom:feed element's child atom:entry elements
contain at least one atom:author element.

```xml
<author>
    <name>Manybugs</name>
</author>
```

atom:feed elements MUST contain exactly one atom:id element.

Its content MUST be an IRI, as defined by [RFC3987](https://datatracker.ietf.org/doc/html/rfc3987). Note that the
definition of "IRI" excludes relative references.

```xml
<id>https://manybugs.dev</id>
```

atom:feed elements SHOULD contain one atom:link element with a rel
attribute value of "self". This is the preferred URI for
retrieving Atom Feed Documents representing this Atom feed.

```xml
<link rel="self" href="https://manybugs.dev/feed"/>
```

atom:feed elements MUST contain exactly one atom:title element.

```xml
<title>Manybugs Blog</title>
```

atom:feed elements MUST contain exactly one atom:updated element describing latest date adding or updating an article.
The date whose content MUST conform to the
"date-time" production in [RFC3339](https://datatracker.ietf.org/doc/html/rfc3339).

```xml
<updated>2024-11-07T08:25:02Z</updated>
```

### atom:entry

The "atom:entry" element represents an individual entry.This
element can appear as a child of the atom:feed element.

```xml
<entry></entry>
```

atom:entry elements MUST contain exactly one atom:id element.

```xml
<id>https://manybugs.dev/posts/my_first_post</id>
```

atom:entry elements that contain no child atom:content element
MUST contain at least one atom:link element with a rel attribute
value of "alternate".

```xml
<link ref="alternate" href="https://manybugs.dev/posts/my_first_post" />
```

atom:entry elements MUST contain exactly one atom:title element.

```xml
<title>My First Post</title>
```

atom:entry elements MUST contain exactly one atom:updated element.

```xml
<updated>2024-05-05T00:00:00Z</updated>
```

## feed link

<https://manybugs.dev/feed>
