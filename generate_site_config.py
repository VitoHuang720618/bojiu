
import json
import os
import shutil

# Paths
base_dir = '/Users/vitohuang/project/b9-website-recreation'
config_path = os.path.join(base_dir, 'manager/backend/data/config.json')
uploads_dir = os.path.join(base_dir, 'manager/backend/uploads')
dest_dir = os.path.join(base_dir, 'demo/public/defaults')

# Static Data to Preserve (IDs and Names)
tools_metadata = [
  {'id': 'xiaohongshu', 'name': '小紅書'},
  {'id': 'douyin', 'name': '抖音'},
  {'id': 'baidu', 'name': '百度'},
  {'id': 'youku', 'name': 'YOUKU'},
  {'id': 'iqiyi', 'name': 'iQIYI'},
  {'id': 'x', 'name': 'X'}
]

routes_metadata = [
  {'id': 'route-1', 'index': 1, 'title': '线路 1', 'href': 'https://www7106010814424300.asands099.com:7730/'},
  {'id': 'route-2', 'index': 2, 'title': '线路 2', 'href': 'https://www7106010814424300.b02999.com:7730/'},
  {'id': 'route-3', 'index': 3, 'title': '线路 3', 'href': 'https://www7106010814424300.b02999.net:8866/'},
  {'id': 'route-4', 'index': 4, 'title': '线路 4', 'href': 'https://www7106010814424300.b6668.com:7730/'},
  {'id': 'route-5', 'index': 5, 'title': '线路 5', 'href': 'https://www7106010814424300.b8855b.com:9900/'},
  {'id': 'route-6', 'index': 6, 'title': '线路 6', 'href': 'https://www7106010814424300.b8899b.com:8866/'}
]

# Read config
with open(config_path, 'r') as f:
    config = json.load(f)

# Helper to process paths
def process_path(url):
    if isinstance(url, str) and 'localhost:3002/uploads/' in url:
        return f'/defaults/{url.split("/uploads/")[-1]}'
    return url

# --- Process Data ---

# Banner
banner = {
    'pc': process_path(config['banner']['pc']),
    'tablet': process_path(config['banner']['tablet']),
    'mobile': process_path(config['banner']['mobile'])
}

# Background
background_image = process_path(config['backgroundImage'])

# Button Links (Top)
button_links = []
for i, btn in enumerate(config.get('buttonLinks', [])):
    button_links.append({
        'id': f'btn-{i}',
        'label': btn.get('text', ''),
        'href': btn.get('href', ''),
        'isExternal': btn.get('target') == '_blank',
        'default': process_path(btn.get('defaultImage')),
        'hover': process_path(btn.get('hoverImage'))
    })

# Carousel
carousel_slides = []
for i, slide in enumerate(config.get('carouselSlides', [])):
    carousel_slides.append({
        'id': f'slide-{i}',
        'image': process_path(slide.get('image')),
        'href': slide.get('href', ''),
        'alt': slide.get('alt', '')
    })

# Route Links (Images)
# Note: config.json has routeLinks as object {default, hover}
rl_config = config.get('routeLinks', {})
route_links_images = {
    'default': process_path(rl_config.get('default')),
    'hover': process_path(rl_config.get('hover'))
}

# Recommended Routes (Merge static metadata with config?)
# Actually config doesn't have route list. So just use static metadata.
# BUT we need to export routeLinksImages separately.

# Tools (Merge)
recommended_tools = []
tool_icons = config.get('toolIcons', [])
for i, meta in enumerate(tools_metadata):
    icon_data = tool_icons[i] if i < len(tool_icons) else {}
    recommended_tools.append({
        'id': meta['id'],
        'name': meta['name'],
        'href': icon_data.get('href', meta.get('href', '')),
        'default': process_path(icon_data.get('default')),
        'hover': process_path(icon_data.get('hover'))
    })

# Video Thumbnails
video_thumbnails = []
for i, vid in enumerate(config.get('videoThumbnails', [])):
    video_thumbnails.append({
        'id': f'video-{i}',
        'title': vid.get('title', ''),
        'href': vid.get('href', ''),
        'image': process_path(vid.get('image')),
        'alt': vid.get('alt', '')
    })

# Program Thumbnails
program_thumbnails = []
for i, prog in enumerate(config.get('programThumbnails', [])):
    program_thumbnails.append({
        'id': f'program-{i}',
        'title': prog.get('title', ''),
        'href': prog.get('href', ''),
        'image': process_path(prog.get('image')),
        'alt': prog.get('alt', '')
    })

# Float Ad
float_buttons = []
for i, btn in enumerate(config.get('floatAdButtons', [])):
    # Try to guess ID/Name if possible, or just use generic
    # Config keys off index usually.
    # Provide 'name' if we can map it? 
    # Current siteConfig has names: 在线客服, 女孩抖音, 体育抖音
    # config.json list has 3 items. I'll assume order.
    names = ['在线客服', '女孩抖音', '体育抖音']
    ids = ['customer-service', 'girl-douyin', 'sports-douyin']
    
    name = names[i] if i < len(names) else f'Button {i}'
    id_val = ids[i] if i < len(ids) else f'float-{i}'
    
    float_buttons.append({
        'id': id_val,
        'name': name,
        'href': btn.get('href', ''),
        'default': process_path(btn.get('default')),
        'hover': process_path(btn.get('hover'))
    })


# --- Generate TS Content ---
ts_content = f"""import type {{ SiteConfig }} from '../types'

// Get base URL from environment or use relative path for container deployment
const getBaseUrl = () => {{
  if (typeof window !== 'undefined') {{
    return window.location.origin
  }}
  return import.meta.env.VITE_BASE_URL || ''
}}

// Site configuration (Migrated from Manager)
export const siteConfig: SiteConfig = {{
  title: '博九娱乐网',
  description: 'B9 Entertainment Website',
  baseUrl: getBaseUrl(),
  useApi: false,

  navigation: {json.dumps(button_links, indent=4, ensure_ascii=False)},

  footer: {{
    links: [],
    socialMedia: [],
    copyright: 'Copyright © 博九娱乐网 Reserved'
  }},

  theme: {{
    colors: {{
      primary: '#ba081f',
      secondary: '#8b0012',
      background: '#16181b',
      text: '#ffd08c',
      accent: '#dfb082'
    }},
    fonts: {{
      heading: 'Arial, Microsoft Yahei, PingFangSC, sans-serif',
      body: 'Arial, Microsoft Yahei, PingFangSC, sans-serif'
    }},
    breakpoints: {{
      mobile: 480,
      tablet: 768,
      desktop: 1024
    }}
  }}
}}

// --- Migrated Assets & Content ---

export const banner = {json.dumps(banner, indent=2, ensure_ascii=False)}

export const backgroundImage = "{background_image}"

export const routeLinksImages = {json.dumps(route_links_images, indent=2, ensure_ascii=False)}

export const recommendedRoutes = {json.dumps(routes_metadata, indent=2, ensure_ascii=False)}

export const recommendedTools = {json.dumps(recommended_tools, indent=2, ensure_ascii=False)}

export const videoThumbnails = {json.dumps(video_thumbnails, indent=2, ensure_ascii=False)}

export const programThumbnails = {json.dumps(program_thumbnails, indent=2, ensure_ascii=False)}

export const carouselSlides = {json.dumps(carousel_slides, indent=2, ensure_ascii=False)}

export const floatAdButtons = {json.dumps(float_buttons, indent=2, ensure_ascii=False)}

// Export aliased names for compatibility if needed
export const videoContent = videoThumbnails
export const programContent = programThumbnails
export const buttonLinks = siteConfig.navigation
"""

print(ts_content)
