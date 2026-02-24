# Global Changes
The following text fields in the UI need to be given a highlight to bold UI element via click (similar to modern text editors) and Add line breaks for paragraphs via click (similar to modern text editors):
1. Introductory Section - "Content (use line breaks for paragraphs)"
2. Chart of the Week - "Insight"
3. Broad Market View - "Content"
4. Theme of the Week - "Content"
5. Deals under Watch - Both the text fields
6. Weekly Reading List - "Description" fields

# Section-specific changes
## 1. Market Watch
Trend section needs a UI element to add down arrow (color: #5cb85c and icon: ▲) and down arrow (color: #d9534f and icon: ▼) via one click, following with the text. "Up Arrow" is by default as #5cb85c and "Down Arrow" is by default as #d9534f.
## 2. Commodity Corner
1. Value Section: Currently the value present in uploaded html is capturing both the value and the change (eg. of an extracted cell form the uploaded html - $4652.6 (-9.17                                                                    %)). We need display the change value (-9.17%) in the change section and the value ($4652.6) in the value section.
2. Change Section: The color of the "change" value will be either #d9534f or #5cb85c based on the value present in the "Change" cell. If it is written as (-9.17%) then it will be #d9534f. Else if it is written as (+2.34%) then it will be #5cb85c.
## 3. Weekly Reading List
1. Title Section: The icon "➤" shall be auto appended, followed by a whitespace, in front of the text that the user fills in the section. Currently, the icon is auto added in the UI, which is leading to the final html capturing the icon "2 times".

