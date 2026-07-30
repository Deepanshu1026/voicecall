import json

with open(r'C:\Users\chair\OneDrive\Desktop\voicecall\voicecall\posts_data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

print('Total posts:', len(data))

for d in data[:5]:
    img = str(d.get('image', ''))[:80]
    content_preview = str(d.get('content', ''))[:80]
    print(f"ID {d['id']}: title={d['title'][:50]}")
    print(f"   img={img}")
    print(f"   content={content_preview}")
    print()
