---
title: SEO
layout: archive
permalink: categories/seo/
author_profile: true
sidebar_main: true
# sidebar:
#     nav: "docs"
---

{% assign posts = site.categories.seo %}
{% for post in posts %} {% include archive-single.html type=page.entries_layout %} {% endfor %}