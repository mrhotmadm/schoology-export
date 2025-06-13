# What is `schoology-export`?

`schoology-export` automates the process of collecting resources, assignments, and files from your Schoology courses. With just a few clicks, you can save an entire course's content to your local device for offline access, backup, or migration. This tool is especially useful for students (in particular, who have no way of downloading courses files efficiently) and educators who want to archive their course materials or transfer them to another platform via a ZIP file.

Key features:
- Exports all files, folders, and resources from a Schoology course
- Organizes downloaded content to match the course structure
- Runs entirely in your browser; no server or installation required
- Simple, user-friendly interface
- Efficient downloads

Whether you're preparing for the end of a semester or simply want a backup of your course materials, `schoology-export` makes the process quick and hassle-free (both were the reason I created this).

* [Usage](#Usage)
* [Download & Injection: How do I actually use this?](#download--injection-how-do-i-actually-use-this)
* [Common Issues](#Common-Issues)

# Usage
After injecting this tool, three buttons are shown above the material list of a Schoology course page:

![ui](/images/ui.png)

![bookmarklet](/images/bookmarklet.gif)

Only files that are present on the main list or from subfolders opened *atleast* once have been loaded by the Schoology website and can be downloaded. With this said, if one wishes to download all eligible materials in entire course page, every folder must be opened once, which can effortlessly be achieved with the first button. As another example, if one only wants to also export files from just one folder, that folder must be manually opened atleast once. Vice-versa for descendants and sub-folders.

To actually download files, hit the **scrape** button to allow all material pages to be fetched and read by the tool. After it's done (which is visually indicated by the button going back to its normal enabled state), simply hit the **export** button and wait for you fully packaged and organized ZIP file to download!

# Download & Injection: How do I actually use this?
## As a bookmarklet
A bookmarklet executes JavaScript code directly in the current web page when clicked. It's essentially a bookmark that, instead of opening a new page, runs a script on the existing page.

Create a new bookmark of this page (or edit an existing bookmark) and paste this into the "Address:" or "URL:" field:
```js
javascript: fetch("https://raw.githubusercontent.com/mrhotmadm/schoology-export/refs/heads/main/src/dist/master.js").then(t=>t.text()).then(eval);
```

To use the script as a bookmark (yes, with the "javascript: "); run it with a single click while on a Schoology course page.
For example, if I wanted to export my math class's course materials, I would navigate to its course page then click the bookmark(let).

## As a userscript (Tampermonkey)
To-be documented.

## As a manual paste
Navigate to the `src/master.js` file, copy all the code, and paste it into your DevTools console after clicking "Inspect Element" on the page.

# Common Issues
To-be documented. The "Issues" tab is open for discussion, questions, and suggestions.