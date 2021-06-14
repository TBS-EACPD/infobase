# Some command line basics

You'll be using the command line for many InfoBase development tasks (running builds, installing node modules, etc). We also strongly recommend you use git from the command line; standard git workflow is well integrated in to VScode but if you get in to a git mess then a) we'll only be able to advise you from a command line git perspective and b) you'll probablly need to use less common git commands that I don't think are available in VScode.

This is a grab-bag introduction to many basic and useful (unix) command line tools. Supplement this with plenty of googling! It's a bit scatter shot since it's had multiple authors contribute to it years apart, so feel free to ask questions from whoever's around!

When you see something between angle brackets in a code example, do not type the angle brackets, they're just placeholders for your own arguments.

## Clarifying some terminology

Command line is a generic term, it just means any interface where you type commands and then execute them, what we're specifically talking about here are the terminal and your unix shell.

The interface of a command line is a terminal (on a Mac, the default terminal program is called Terminal). Historically a terminal was the hardware combo of a keyboard and screen (or a teletype and a sheet of paper), but now it generally means the window and text engine your command line is displayed inside of.

The shell is the engine that writes to the terminal and interprets the commands you execute within it (on a Mac, the default shell is bash). Functionality within the terminal such as prompt information/command history/autocomplete/etc. are all provided by the shell you're running. The main function of the shell is to launch and manage additional programs (which I mostly refer to as commands in this document to keep the language simple). All of the commands covered below are standard unix utilities (available on Mac/any Linux/in Windows bash).

## Table of Contents

- [Some command line basics](#some-command-line-basics)
  - [Clarifying some terminology](#clarifying-some-terminology)
  - [Table of Contents](#table-of-contents)
  - [General intro](#general-intro)
  - [Finding files](#finding-files)
  - [Finding content](#finding-content)
  - [Pipelines and redirects](#pipelines-and-redirects)
  - [Other tips](#other-tips)

## General intro

"Everything in JavaScript is an object, everything in a unix system is a file. This doesn't really deserve to be a quote" - Stephen

Your shell is always looking at a directory (its "working directory"), and the commands you run are run in the context of this directory. Running the same command from a different directory will almost always have a different result.

To see your current working directory, use **pwd** (print working directory), to see its contents use **ls** (list) or **ls -al** (list, with the all and longform details option flags). From the perspective of your working directory, **.** and **..** refer to the working directory and its parent directory respectively. **../..** refers to the parent of the parent directory, **../<file>** refers to a file in the directory above the working directory, etc.

Some other basic utilities: file creation (`touch` for file creation), directory creation (`mkdir`), deletion (`rm`), moving (`mv`) and copying (`cp`). You can check the documentation for any program with `man <command>` (short for manual), or by calling the command with the help option, `<command> --help` or `<command> -h`.

Here is how they are used

`mkdir <new_dir>`

`touch <new_file>`

`cp <file1> <new_file>`

`cp -R <dir> <new_dir>`

`mv <file1> <new_file>`

note: to the underlying file system, the name of a file (meaning its long `/Users/Alex/documents/..`. name) and its location are the same. so renaming files and moving files are the same.

To move a file to a new directory, simply do

`mv <file1> <dir>/ `

`rm <file>`

note: removing is dangerous, the file is gone forever, there is no trash can. to remove an empty directory, use `rmdir`. To remove a directory and everything it contains, you can use the recursive option (-R)

`rm -R <dir>/`

be very careful with rm

## Finding files

`find <dir> -name <name>`

`<dir>` is usually `./` or `src/` , I recommend searching only `src/` _name_ can be the name of the file, but it can also contain `*` this is called a wildcard character and can match text you don't know when typing the command. For example,

`find home* -name src/` will print out

`src/home/

src/home/home.css

src/home/home.js

src/home/home.yaml `

similarly, `find *.js -name src/` will print out every single javascript file in **src/**/

## Finding content

Want to search for specific text inside of files? The command for searching inside actual files is **grep**.

to search for a particular string of text in src, use `grep string -r src/`

to search for text in a specific file, use `grep <string> -r <file>`

usually, you only care about what is in `src/` , don't mind search results in build/

note: grep and find have different signatures. In `grep`, the search term comes first. In `find`, the directory comes first.

Grep tips:

- `grep <pattern>` will recursively search the current directory's files for that string. You can use basic patterns/ regular expressions but there are weird escaping rules.
- `grep <pattern> -- "*.js"` will only look in files ending in `.js`
- `grep <pattern> <sub-dir-path>` will only look in the sub directory
- show surrounding lines : `grep -C 3 <pattern> <place>` will show the 3 upper and lower lines next to your match.
- regular expressions
  - regular expressions can get complicated quick, but using . and \* can go a long way.
    - e.g. `grep "require.*underscore" src/` will match `require('underscore')
    - if you want to match \* and . directly, you may need to double escape them
      - e.g. `grep obj\\.name` matches `obj.name` but not `obj_name`

## Pipelines and redirects

You can send the output of any shell command to another shell command (`|`, pipeline) or to a file (`>`, redirect). Note that redirecting to a file will overwrite that file's contents. If you want to append to the end of an existing file use `>>` instead. To read a file in to the command line, use `<`.

## Other tips

- Both Terminal and bash can be heavily customized for appearance and functionality! Tweaking your bash profile is a time honoured programmer tradition (and its generally accepted that it pays off in long term productivity)
- Want a better experience than dealing with multiple terminal tabs all day? Ask someone about tmux (a terminal multiplexer)!
- The default Mac command line text editor is vim, you'll occasionally get dumped in there (e.g. if you make a commit without providing a message using -m then it will ask you to write a commit message through vim). You don't need to learn vim, but you'll at least need to know how to exit vim. Most of the time, you'll just need to hit escape and then enter :q or q (if you made edits that you need to save, use :w to write them to disk, or :wq to write then quit).
