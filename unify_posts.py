import re
import json
import html
from bs4 import BeautifulSoup

def strip_html(html_text):
    if not html_text:
        return ''
    soup = BeautifulSoup(html_text, 'html.parser')
    text = soup.get_text(separator=' ')
    return re.sub(r'\s+', ' ', text).strip()

def generate_excerpt(content, max_length=160):
    text = strip_html(content)
    if len(text) <= max_length:
        return text
    return text[:max_length].rsplit(' ', 1)[0] + '...'

# Load parsed data
with open(r'C:\Users\chair\OneDrive\Desktop\voicecall\voicecall\posts_data.json', 'r', encoding='utf-8') as f:
    posts = json.load(f)

with open(r'C:\Users\chair\OneDrive\Desktop\voicecall\voicecall\blog_posts_data.json', 'r', encoding='utf-8') as f:
    blog_posts = json.load(f)

unified = []

# Add posts table entries
for p in posts:
    unified.append({
        'legacyId': p['id'],
        'title': p['title'],
        'content': p['content'] or '',
        'excerpt': generate_excerpt(p['content']),
        'featuredImage': p['image'] or '',
        'category': 'General',
        'status': 'published',
        'createdAt': p['created_at'],
        'imageAlt': p['image_alt'] or '',
        'source': 'posts',
    })

# Add blog_posts entries (avoid duplicates by title)
existing_titles = {p['title'].lower().strip() for p in unified}
for bp in blog_posts:
    title = bp['title']
    if title.lower().strip() in existing_titles:
        continue
    unified.append({
        'legacyId': bp['id'],
        'title': title,
        'content': bp['content'] or '',
        'excerpt': generate_excerpt(bp['content']),
        'featuredImage': bp['featured_image'] or '',
        'category': bp['category'] or 'General',
        'status': bp['status'] or 'published',
        'createdAt': bp['created_at'],
        'imageAlt': bp['image_alt'] or '',
        'source': 'blog_posts',
    })

print(f'Unified posts: {len(unified)}')

# Save unified JSON for MongoDB import
with open(r'C:\Users\chair\OneDrive\Desktop\voicecall\voicecall\unified_posts.json', 'w', encoding='utf-8') as f:
    json.dump(unified, f, indent=2, ensure_ascii=False)

print('Saved unified_posts.json')

# Show samples
for p in unified[:3]:
    print(f"Title: {p['title'][:50]}")
    print(f"  Excerpt: {p['excerpt'][:80]}")
    print(f"  Image: {p['featuredImage'][:60]}")
    print(f"  Date: {p['createdAt']}")
    print()
