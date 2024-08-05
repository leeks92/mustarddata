---
title: notion
layout: archive
permalink: categories/notion/
author_profile: true
sidebar_main: true
# sidebar:
#     nav: "docs"
---

{% assign posts = site.categories.notion %}
{% for post in posts %} {% include archive-single.html type=page.entries_layout %} {% endfor %}
