import os

path = r'c:\Users\USER\Desktop\程式\teaching\style.css'
try:
    with open(path, 'rb') as f:
        data = f.read()
    
    # Try different encodings
    encodings = ['utf-8', 'utf-16', 'big5', 'gbk', 'utf-8-sig']
    for enc in encodings:
        try:
            content = data.decode(enc)
            print(f"Success with {enc}")
            # Try to find the target
            if ".section-content .btn {" in content:
                print("Found target string!")
            else:
                print("Target string NOT found.")
            break
        except:
            continue
except Exception as e:
    print(f"Error: {e}")
