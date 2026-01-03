---
title: Data
layout: archive
permalink: categories/data/
author_profile: true
sidebar_main: true
# sidebar:
#     nav: "docs"
---

{% assign posts = site.categories.data %}
{% for post in posts %} {% include archive-single.html type=page.entries_layout %} {% endfor %}

