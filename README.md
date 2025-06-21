# What is `schoology-export`?

`schoology-export` automates collecting resources, assignments, and files from your Schoology courses. With a few clicks, save an entire course’s content to your device as an organized ZIP file for offline access, backup, or migration.

**Key features:**
- Exports all files, folders, and resources from a Schoology course
- Keeps downloaded content organized to match the course layout
- Runs entirely in your browser—no installation or server needed
- Simple, intuitive interface
- Fast and efficient downloads

Whether you’re wrapping up a semester or want a backup, `schoology-export` makes it quick and easy (which is why I created it).

* [How to Use](#how-to-use)
* [Setup & Running the Script](#setup--running-the-script)
* [Troubleshooting](#troubleshooting)

# How to Use
After running the tool, three buttons appear above the course materials list:

![ui](/images/ui.png)

Only files visible on the main list, folders, and subfolders _(you’ve opened at least once)_ can be downloaded. To download everything, open every folder once, which can be done easily with the first button (leftside). To include files from a specific folder _alone_, open just that folder once.

Next, click the **scrape** button to load all material pages. When it finishes (the button returns to normal), click **export** to download a fully packaged and organized ZIP file.

# Setup & Running the Script

## Bookmarklet
Create a bookmark and paste this into the URL/address field:
```js
javascript: fetch("https://raw.githubusercontent.com/mrhotmadm/schoology-export/refs/heads/main/src/dist/master.js").then(t=>t.text()).then(eval);
```
Use this bookmark on any Schoology course page to activate the tool with one click.

**GIF Example:**

![bookmarklet](/images/bookmarklet.gif)

## Userscript (Tampermonkey)
To be created and documented.

## Manual Paste
Copy the code from src/master.js and paste it into the browser’s DevTools console on a Schoology course page.

# Troubleshooting
To be documented. Use the "Issues" tab for questions and suggestions.
