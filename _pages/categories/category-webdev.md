---
title: Web Development
layout: archive
permalink: categories/webdev/
author_profile: true
sidebar_main: true
# sidebar:
#     nav: "docs"
---

{% assign posts = site.categories.webdev %}
{% for post in posts %} {% include archive-single.html type=page.entries_layout %} {% endfor %}

