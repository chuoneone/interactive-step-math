import os

path = r'c:\Users\USER\Desktop\程式\teaching\style.css'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Target block
target_btn = """.section-content .btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 120px;
    height: 120px;
    font-size: 1.2rem;
    font-weight: 900;
    text-align: center;
    padding: 0;
    border-radius: 18px;
    border: 2px solid #005959;
    border-left: 2px solid #005959;
    margin-bottom: 0;
    box-shadow: 0 6px 0 #005959;
}"""

replacement_btn = """.section-content .btn {
    display: block;
    width: 100%;
    height: auto;
    font-size: 1.2rem;
    font-weight: 900;
    text-align: left;
    padding: 15px 20px;
    border-radius: 15px;
    border: 2px solid #005959;
    border-left: 8px solid #f4c542;
    margin-bottom: 15px;
    box-shadow: 0 4px 10px rgba(0, 89, 89, 0.05);
}"""

target_group = """.section-content .btn-group {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    gap: 20px;
}"""

replacement_group = """.section-content .btn-group {
    flex-direction: column;
    width: 100%;
    gap: 10px;
}"""

# Try replacing with normalized newlines
content = content.replace(target_btn.replace('\n', '\r\n'), replacement_btn.replace('\n', '\r\n'))
content = content.replace(target_btn.replace('\n', '\n'), replacement_btn.replace('\n', '\n'))
content = content.replace(target_group.replace('\n', '\r\n'), replacement_group.replace('\n', '\r\n'))
content = content.replace(target_group.replace('\n', '\n'), replacement_group.replace('\n', '\n'))

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Replacement attempted.")
