# WellCheck's git flow rules

## 1. One edit = one issue

If you plan to make an edit or create a new functionality, please first check if there's any issue opened about it. If not, open an issue and describe it.
  
This helps keeping track of all tasks.
  
## 2. One issue = one branch

Any issue must have its own branch, **including its issue number**.
  
- For a new **functionality** developed, start your branch name by `f/`
- For an **edit**, start your branch name by `e/`
  
Example for issue `1` named `Create statistics dashboard` : `f/#1-statistics-dashboard`
  
Example for issue `2` named `Edit logo on landing page` : `e/#2-change-logo-landing-page`
  
## 3. One commit = at least one issue referenced

For each commit you make, you must reference the issue(s) related to it. You can do so by entering `#` followed by the number of the issue in your commit message.
  
For example : `git commit -m "#2 : Imported WellCheck's logo"`

## 4. Your branch > develop > master (merge requests and code reviews)

You shouldn't commit to master directly. It might break the edits of other developers working on your project.

You should always develop on your own branch as explained in point 2 of this guide. When you are sure your functionality work, please create a **merge request** to `develop`.

Once merged to develop, please create a **merge request** to `master`. At this point, your code will be reviewed by _maintainers_ of the project (@SCcagg5 and @flavienbwk) that will make you code don't break the production build.
