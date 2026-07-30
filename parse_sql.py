import re
import json
import html

def unescape_mysql_string(s):
    """Unescape a MySQL string literal."""
    s = s.replace("\\'", "'")
    s = s.replace('\\\\', '\\')
    s = s.replace("''", "'")
    s = html.unescape(s)
    return s

def tokenize_mysql_values(row_inner):
    """Tokenize values inside a MySQL row (without outer parentheses)."""
    tokens = []
    current = ''
    in_quote = False
    i = 0
    while i < len(row_inner):
        ch = row_inner[i]
        if ch == "'":
            if in_quote:
                # Check for escaped quote \' or doubled quote ''
                if i + 1 < len(row_inner) and row_inner[i+1] == "'":
                    current += "''"
                    i += 2
                    continue
                elif i > 0 and row_inner[i-1] == '\\':
                    # Already added as \', keep it
                    current += ch
                    i += 1
                    continue
                else:
                    in_quote = False
                    current += ch
            else:
                in_quote = True
                current += ch
        elif ch == ',' and not in_quote:
            tokens.append(current.strip())
            current = ''
        else:
            current += ch
        i += 1
    if current.strip():
        tokens.append(current.strip())
    return tokens

def parse_value(val):
    val = val.strip()
    if val == 'NULL':
        return None
    if val.startswith("'") and val.endswith("'"):
        val = val[1:-1]
        return unescape_mysql_string(val)
    try:
        return int(val)
    except ValueError:
        try:
            return float(val)
        except ValueError:
            return val

def parse_insert_block(lines, table_name):
    """Parse all INSERT blocks for a given table name."""
    results = []
    in_insert = False
    insert_lines = []
    
    for line in lines:
        if f'INSERT INTO `{table_name}`' in line:
            in_insert = True
            insert_lines = [line]
        elif in_insert:
            insert_lines.append(line)
            if line.strip().endswith(';'):
                in_insert = False
                results.append(''.join(insert_lines))
                insert_lines = []
    return results

def extract_rows_from_insert(insert_text):
    """Extract individual row strings from an INSERT INTO ... VALUES statement."""
    # Remove the INSERT INTO ... VALUES part
    m = re.search(r'VALUES\s*', insert_text, re.IGNORECASE)
    if not m:
        return []
    rest = insert_text[m.end():]
    # Remove trailing semicolon and whitespace
    rest = rest.strip().rstrip(';').strip()
    
    rows = []
    depth = 0
    current = ''
    for ch in rest:
        if ch == '(' and depth == 0:
            depth = 1
            current = ''
        elif ch == '(':
            depth += 1
            current += ch
        elif ch == ')':
            depth -= 1
            if depth == 0:
                rows.append(current)
            else:
                current += ch
        elif depth > 0:
            current += ch
    return rows


# Read SQL file
with open(r'C:\Users\chair\OneDrive\Desktop\voicecall\voicecall\avisaexperts (1).sql', 'r', encoding='utf-8', errors='ignore') as f:
    lines = f.readlines()

# Parse blog_posts
blog_posts_inserts = parse_insert_block(lines, 'blog_posts')
blog_posts = []
for ins in blog_posts_inserts:
    rows = extract_rows_from_insert(ins)
    for row in rows:
        parts = tokenize_mysql_values(row)
        if len(parts) >= 9:
            blog_posts.append({
                'id': parse_value(parts[0]),
                'title': parse_value(parts[1]),
                'content': parse_value(parts[2]),
                'excerpt': parse_value(parts[3]),
                'featured_image': parse_value(parts[4]),
                'category': parse_value(parts[5]),
                'status': parse_value(parts[6]),
                'created_at': parse_value(parts[7]),
                'image_alt': parse_value(parts[8]),
            })

# Parse posts
posts_inserts = parse_insert_block(lines, 'posts')
posts = []
for ins in posts_inserts:
    rows = extract_rows_from_insert(ins)
    for row in rows:
        parts = tokenize_mysql_values(row)
        if len(parts) >= 10:
            posts.append({
                'id': parse_value(parts[0]),
                'title': parse_value(parts[1]),
                'content': parse_value(parts[2]),
                'image': parse_value(parts[3]),
                'created_at': parse_value(parts[4]),
                'updated_at': parse_value(parts[5]),
                'category_id': parse_value(parts[6]),
                'post_time': parse_value(parts[7]),
                'clicks': parse_value(parts[8]),
                'image_alt': parse_value(parts[9]),
            })

print(f'blog_posts: {len(blog_posts)} rows')
print(f'posts: {len(posts)} rows')

# Verify parsing quality
print('\n=== blog_posts verification ===')
for bp in blog_posts[:3]:
    print(f"ID {bp['id']}: title={bp['title'][:50]}")
    print(f"  excerpt={str(bp['excerpt'])[:60]}")
    print(f"  image={str(bp['featured_image'])[:80]}")
    print(f"  created_at={bp['created_at']}")
    print()

print('\n=== posts verification ===')
for p in posts[:3]:
    print(f"ID {p['id']}: title={p['title'][:50]}")
    print(f"  image={str(p['image'])[:80]}")
    print(f"  created_at={p['created_at']}")
    print()

# Save JSON
with open(r'C:\Users\chair\OneDrive\Desktop\voicecall\voicecall\blog_posts_data.json', 'w', encoding='utf-8') as f:
    json.dump(blog_posts, f, indent=2, ensure_ascii=False)

with open(r'C:\Users\chair\OneDrive\Desktop\voicecall\voicecall\posts_data.json', 'w', encoding='utf-8') as f:
    json.dump(posts, f, indent=2, ensure_ascii=False)

print('Saved JSON files')
