Never heard of git? Want a light refresher? [Here's a random article I googled up just now](https://medium.freecodecamp.org/what-is-git-and-how-to-use-it-c341b049ae61). Hopefully though, someone from the team has given you one or two git crash-courses by now.

## Table of Contents
  - [Basic contribution workflow](#basic-contribution-workflow)
  - [Using git on the command line](#using-git-on-the-command-line)
    - [Terminology](#terminology)
    - [The staging area](#the-staging-area)
    - [Committing](#committing)
    - [Branches](#branches)
    - [Pushing and pulling](#pushing-and-pulling)
    - [Other tips](#other-tips)
      - [Branch naming](#branch-naming)
      - [Branch scope](#branch-scope)
  - [GitHub](#github)
    - [Tips for using GitHub](#tips-for-using-github)

# Basic contribution workflow

The basic workflow for making contributions to the repo. If you aren't familiar with all terms here, you skip ahead and read the rest of this wiki article first. It should fill everything in.

1. Make a new branch (`git checkout -b mycoolnewfeature`)
1. Write some sweet code
1. Commit your changes. Try to keep commits focused, doing one thing per commit. Write a meaningful commit message (`git commit -m "Did coolnewfeature stuff"`)
1. Push to GitHub (`git push origin mycoolnewfeature`)
1. Make a pull request on GitHub. Do it early for fast feedback; it's also a good place to put your todo lists. As soon as you pushed, your code got queued up to run on our CI tasks; look at the bottom of your PR for CI status, to see if you're passing all tests. If everything's green, you can visit/share a dev link for your branch at `dev.ea-ad.ca/mycoolnewfeature/index-eng.html`
1. When done, or at any point when you want comprehensive feedback, set the label `Awaiting review` on the PR and message the other devs. Someone will give code review, either approving for merge or requesting changes (they'll remove the label after that)
1. If you're making a frontend change, consider sharing your dev link to the broader team for further design feedback
1. Once finalized, passing in CI, and approved, you can go ahead and merge it into master! Click the big green button on GitHub (make sure the button's in rebase mode, we don't actually merge 'round here).
1. Delete the branch on GitHub. There will be an option to do this after you merge it.


# Using git on the command line
This is a **review** of some core concepts of git and of some of the most frequently used git commands. Supplement this with plenty of your own googling! There are also some tips and a couple best-practices in here. It's a bit scatter shot since it's had multiple authors contribute to it years apart, so feel free to ask questions/for clarification from whoever's around!

When you see something between angle brackets in a code example, do not type the angle brackets, they're just placeholders for your own arguments.

## Terminology

commit: a "patch" or record of changes to a repository's state. Each commit has one or more (but, oof, we try to avoid that) parent commit(s). A commit can also be thought of as a discrete, identified, point in your repository's history; the state of the repo at the "time" of a commit is what you would get by walking back up the commit history to the root (by following the parent pointer of each commit) and then incrementally applying the set of changes saved in each commit on to the previous, up to and including the set of changes stored in the commit you are viewing.

hash/SHA: the long string of alpha-numeric characters that define a commit. SHAs are long, but if you need to type one in for a command then the first six characters is enough.

HEAD: a short way to refer to the last commit on the current branch. When you commit to a specific branch, you change that branch's head to point to the new commit. `HEAD~1` , `HEAD~2`, ... `HEAD~n` are quick ways to refer the commit n commits before HEAD. In many commands, you can use the name of a branch to refer to its HEAD commit.


## The staging area

Changes must be 'staged' before they can be added to a commit. Git is aware of all modifications made within a repo as they happen, but it treats staged and unstaged changes very differently. 

`git status` is the command you will be using most. It will tell you what branch you are on, what files are *staged* for committing and what files are modified but not staged.

`git add <file>` adds that file or its *changes* (meaning you use `add` to update files too) to the staging area. You can also add entire directories (`git add <dir>`) or simply add all current changes (`git add -A`).

`git rm`, `git mv` do what `rm` and `mv` usually do, but also add that rename or removal to the staging area.

Staging let's you select changes file-by-file for inclusion within your next commit (or next `git stash`). As stated, staged and unstaged changes are treated very differently by git (for example, if you switch branches with unstaged changes then these changes, where applicable, will be present within the branch you change to; on the other hand you will not be permitted to change branches when your staging area has anything in it). It will all make more sense with use/googling as you encounter these discrepancies.

## Committing
To commit is to take your current staged changes and to identify them as a discrete patch on to what was the HEAD commit at the time of committing. This new commit becomes the next HEAD of whatever branch you were on, representing the new state of the repo in that branch. Alongside the changes made in them, commits contain metadata (commit author, time stamp, etc.) Commits can (and **should**) be accompanied by a commit message.

  `git commit -m "<your comment here>"`
  
  your commit message should describe (preferably in the present tense) what your changes are doing.

In practice, a commit should generally be the smallest chunk of work that can stand on its own. Good commit modularity and communication save time later on, and leave you with a more useful repo history!

This depends a lot on the nature of the work though, meaning it's a very "play it by ear" kind of best-practice. Some changes should happen in bulk, like when a module is being re-written in a way such that splitting up individual changes would leave a large range of commits where everything is broken, or when changes are being automatically made throughout the entire code base (linters, code mods, etc.).

## Branches

If you don't work with complete lunatics, your repo will have one 'main' branch; usually it is called master. This branch represents either exactly what code is running in production, or all code which is ready to go in to production in the next update. No one should be pushing directly to the master branch (but sometimes we do for priority or single-commit bug fixes). Work should happen on branches made off of an up-to-date version of master.

To see a list of your local branches, run `git branch`. Note that your local branch list may not mach the remote (GitHub) branch list; this happens when you have local branches which you haven't pushed to GitHub or when old branches are routinely deleted from GitHub. To switch to a branch, run `git checkout <branch-name>`.

To create a new branch, run `git branch -b <branch-name>`, and then switch to it with `git checkout <branch-name>`. Alternatively, you can create and switch to a new branch with the single command `git checkout -b <branch-name>`. This new branch will start from the commit you were on when you ran the commands to create it (generally, you'll want to be on the most recent commit from the master branch, but you can branch from branches or from historical commits).

## Pushing and pulling

`git pull origin <branch>` will merge in the updates from the remote branch. Always use `git pull --rebase` as it will avoid introducing useless merge commits that clutter history (although you may then need to --force your next push). By the way, rebasing is an important concept! Ask us in person, preferably when we've got a whiteboard on hand.

`git push origin <branch>` will upload your commits on your current branch to the repo on that current branch. 

make sure that the remote branch and the local branch are of the same name, and that your local branch is strictly ahead of the remote branch. Unlike `git pull`, `git push` will not attempt to merge if your local branch is behind the remote version in some way.

## Other tips 
The best way to learn more about git is Google. Stack Overflow is full of answers to specific git questions, but be cautious because some "secret git tricks", when you don't really understand them, can cause troubles in a shared repo.

* Diffs
    * Diffs are a way of displaying the difference between two snapshots (commits) of a repo. 
    * Diffs can be applied to single files as well 
    * They are a list of additions/deletions
    * Want to see all differences within the repo between two commits? 
      *  `git diff SHA1 SHA2` will show which additions/deletions need to be applied to SHA1 in order to 'become' SHA2
      *  `git diff SHA` will default to `git diff SHA HEAD
      *  `git diff` will default to `git diff HEAD <current_directory_state>` i.e. what you've changed and not committed.
      *  `git diff --name-only SHA1 SHA2` will just list affected files
    * Want to see the changes introduced by a commit ? `git show SHA` 
* `git log`
    * `git log` will display all the linear history for the commit (or branch) you're looking at
    * **2 dot log= set minus** `git log EXCLUDE..INCLUDE` will show the commits in INCLUDE's history  'set minus' the commits in EXCLUDE's history. 
    * **3 dot log= symmetric difference** `git log A...B`will show all the commits that are in (A but not in B) OR  (B but not in A).
    * `git log -p <file>` can show a specific file's history. It will show entire diffs for each commit.
    * similarly, `git log follow <file>` will list the commits modifying that file, but without the diffs
* Git troubles?
    * revert back to HEAD : `git reset --hard HEAD` will bring everything back to the original commit state
    * `git reset --soft HEAD` will unstage changes, without modifying any files.
* if a command tells you to re-run it with --force or -f, there is probably something risky going on. If you are not confident in your git skills, this is a good time to phone a friend!
* if you've deleted or modified a file that you want to revert to the current commit, **and it isn't staged**, you can use git checkout <file>.
* if you've deleted or modified a file that you want to revert to the current commit **and it's staged**, use git checkout HEAD <file>
* if you've forgotten a small thing or screwed something up on a commit you just made, **and it's not pushed to the repo**, you can use `git commit --amend` to add staged changes in to the current commit.
* be careful if you ever amend/collapse or delete commits that are already pushed to the remote repo. It will necessitate a --force push and may cause jam-ups with anyone else working from the same branch
* if you want a copy of an old file from another commit, you can use `git show <commit>:<file> > <new_temp_file>`  (the > is input redirection). Here `<commit>` is the first 6 characters of a commit's hash. To compare to the last commit, use HEAD as a shortcut to the hash. 

### Branch naming

Pick names that are short and descriptive. "budget_est_sunburst" instead of "new_graph_2" or "kate_new_graph". Pick something that's easy to type, you'll be doing it a lot. Keep it URL safe, as CI will create a dev link containing the branch name in its path.

Some organizations use slashes or parentheses with prefixes denoting the contributor or the category, e.g. "feat/improve-legends". We don't organize our branches that way, and slashes will screw up the dev links, so don't use them.

If you're working on a branch that shouldn't be public for one reason or another, start the branch name with double underscores (`__`). A pre-push git hook will prevent you from pushing a `__*`branch to the public repo and CI won't create a dev link for it.
   
### Branch scope

Generally, branches should be a single feature. If you think it might be possible that we will want to merge only part of a branch, but not the rest, that might be a good indication that it should be a separate branch. If it starts to involve large numbers of different files, either it should be multiple branches you're doing some kind of code refactor. In that case, for your own sanity it would be wise to finish and merge that branch as quickly as possible, so it doesn't get out of date and difficult to merge.

# GitHub

GitHub (the for-profit service) isn't git (the free and open source project). GitHub is just a place where your remote git repositories can live. GitHub also offers team management tools, permissions settings, issues, pull requests, wikis, and a pretty good search feature (most everything else is just a web interface for git command line tools). A endless number of other services (e.g. CircleCI) offer integrations with GitHub as well. GitHub isn't the only player in the game (see BitBucket, GitLab, etc.), and git can always be used with on-site or self-hosted remote repositories (or with no remote at all, git is still useful for solo-projects that don't leave your machine)!

## Tips for using GitHub

We use GitHub to host our repositories. You're here right now!

You can authenticate more seamlessly using an SSH key or a GitHub [Personal Access Token](https://github.com/settings/tokens)

Pull requests on GitHub allow us to organize contributions and protect our master branch.

**Rule one of InfoBase, don't make commits on the master branch.** <sub>Unless you need to. For reasons.</sub> 

If you're not sure, it's always better to make a separate branch and a pull request. Even for small changes, pull requests allow us to keep a record of what was done and for people to discuss it.
