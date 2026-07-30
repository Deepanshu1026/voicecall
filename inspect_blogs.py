import json

with open(r'C:\Users\chair\OneDrive\Desktop\voicecall\voicecall\blog_posts_data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

print('Total blog_posts:', len(data))
empty_excerpt = [d for d in data if not d.get('excerpt')]
print('Empty excerpt:', len(empty_excerpt))

for d in data[:5]:
    excerpt = str(d.get('excerpt', ''))[:30]
    img = str(d.get('featured_image', ''))[:60]
    print(f"ID {d['id']}: title={d['title'][:50]}")
    print(f"   excerpt={excerpt}")
    print(f"   img={img}")
    print()
