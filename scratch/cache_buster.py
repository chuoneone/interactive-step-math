import os
import re

def update_html_files():
    try:
        # Get all html files in the current directory
        files = [f for f in os.listdir('.') if f.endswith('.html')]
        version = "20260425"
        
        for filename in files:
            print(f"Checking {filename}...")
            with open(filename, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Replace style.css with style.css?v=...
            new_content = re.sub(r'href="style\.css(\?v=[\d]+)?"', f'href="style.css?v={version}"', content)
            new_content = re.sub(r'href="responsive\.css(\?v=[\d]+)?"', f'href="responsive.css?v={version}"', new_content)
            
            if content != new_content:
                with open(filename, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f"Updated {filename}")
            else:
                print(f"No change needed for {filename}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    update_html_files()
