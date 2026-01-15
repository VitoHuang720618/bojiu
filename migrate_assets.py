
import json
import os
import shutil

# Paths
base_dir = '/Users/vitohuang/project/b9-website-recreation'
config_path = os.path.join(base_dir, 'manager/backend/data/config.json')
uploads_dir = os.path.join(base_dir, 'manager/backend/uploads')
dest_dir = os.path.join(base_dir, 'demo/public/defaults')

# Ensure dest dir
os.makedirs(dest_dir, exist_ok=True)

# Read config
try:
    with open(config_path, 'r') as f:
        data = json.load(f)
except FileNotFoundError:
    print(f"Error: Config file not found at {config_path}")
    exit(1)

def process_node(node):
    if isinstance(node, str):
        # Check if it's a localhost upload URL
        if 'localhost:3002/uploads/' in node:
            filename = node.split('/uploads/')[-1]
            src_file = os.path.join(uploads_dir, filename)
            dest_file = os.path.join(dest_dir, filename)
            
            # Copy file
            if os.path.exists(src_file):
                shutil.copy2(src_file, dest_file)
                # Return path relative to public root
                return f'/defaults/{filename}'
            else:
                print(f"Warning: File not found {src_file}")
                return node 
        return node
    elif isinstance(node, dict):
        return {k: process_node(v) for k, v in node.items()}
    elif isinstance(node, list):
        return [process_node(i) for i in node]
    else:
        return node

new_data = process_node(data)

# Print as JSON
print("__JSON_START__")
print(json.dumps(new_data, indent=2, ensure_ascii=False))
print("__JSON_END__")
