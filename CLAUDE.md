# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Jekyll-based blog using the Minimal Mistakes theme, hosted at mustarddata.com. The site is configured in Korean (ko-KR) and uses the "contrast" skin theme. It's a personal development blog operated by Daniel.

## Development Commands

### Local Development Setup
```bash
# Install Ruby dependencies
bundle install

# Start local development server
bundle exec jekyll serve

# If webrick error occurs
bundle add webrick
```

### Build and Preview
```bash
# Build the site
bundle exec jekyll build

# Preview with test content (using Rakefile)
bundle exec rake preview

# Watch JavaScript changes
bundle exec rake watch_js
```

### Asset Management
```bash
# Build minified JavaScript (uglify-js)
bundle exec rake js

# Update copyright files and version info
bundle exec rake default
```

## Site Architecture

### Core Configuration
- **Main config**: `_config.yml` - Contains all site settings, theme configuration, and plugin setup
- **Content locale**: Korean (ko-KR) with Seoul timezone
- **Theme**: Minimal Mistakes Jekyll theme with "contrast" skin
- **Domain**: mustarddata.com (configured in CNAME)

### Directory Structure
- `_posts/` - Blog posts in Markdown format with YAML front matter
- `_pages/` - Static pages and site navigation pages  
- `_layouts/` - Template files (single, home, default, archive, etc.)
- `_includes/` - Reusable template components and partials
- `_sass/` - SCSS stylesheets organized by theme structure
- `_data/` - YAML data files for site configuration and navigation
- `assets/` - Images, JavaScript, and other static assets
- `_site/` - Generated static site (excluded from git)

### Content Management
- **Posts**: Written in Markdown with YAML front matter, located in `_posts/`
- **Categories**: Organized with liquid-based archive pages at `/categories/`
- **Pagination**: 10 posts per page with jekyll-paginate plugin
- **Comments**: Integrated with Disqus (shortname: "danielnote")
- **Analytics**: Google Analytics with tracking ID configured

### Key Features
- Korean language support with Seoul timezone
- Disqus comments system integrated
- Google Analytics tracking
- SEO optimization with meta tags and sitemaps
- Category-based content organization
- Author profile and social links
- Responsive design with various layout options

### Plugin Configuration
Essential Jekyll plugins configured:
- `jekyll-paginate` - Post pagination
- `jekyll-sitemap` - XML sitemap generation  
- `jekyll-gist` - GitHub Gist embedding
- `jekyll-feed` - RSS/Atom feed generation
- `jekyll-include-cache` - Performance optimization

### Asset Processing
- JavaScript minification using UglifyJS via Rakefile
- SCSS compilation with compressed output style
- Automatic copyright header generation for theme files