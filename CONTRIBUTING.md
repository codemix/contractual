# Contributing

So you want to contribute to contractual? Great! But to increase the chances of your changes being accepted quickly, please read the following guide.

## Code Conventions

We loosely follow the [Felix Style Guide](https://github.com/felixge/node-style-guide) for node.js. 2 spaces for indent, no tabs.

## Running The Tests

The tests are based on [mocha](http://visionmedia.github.io/mocha/) and [should.js](https://github.com/visionmedia/should.js/).

To run the tests:

```
make test
```

To generate the code coverage report, run:

```
make coverage
```

And have a look at `coverage/lcov-report/index.html`.



## Git Workflow For Contributors

> If you are new to git and github, you might want to first check out [github help](http://help.github.com/), [learn git](http://gitref.org/) or learn something about [git internal data model](http://nfarina.com/post/9868516270/git-is-simpler).



### 1. [Fork](http://help.github.com/fork-a-repo/) the contractual repository on github and clone your fork to your development environment
<pre>
git clone git@github.com:YOUR-GITHUB-USERNAME/contractual.git
</pre>
If you have trouble setting up GIT with GitHub in Linux, or are getting errors like "Permission Denied (publickey)", then you must [setup your GIT installation to work with GitHub](http://help.github.com/linux-set-up-git/)

### 2. Add the main contractual repository as an additional git remote called "upstream"
Change to the directory where you cloned contractual normally, "contractual". Then enter the following command:
<pre>
git remote add upstream git://github.com/codemix/contractual.git
</pre>

### 3. Make sure there is an issue created for the thing you are working on.

All new features and bug fixes should have an associated issue to provide a single point of reference for discussion and documentation. Take a few minutes to look through the existing issue list for one that matches the contribution you intend to make. If you find one already on the issue list, then please leave a comment on that issue indicating you intend to work on that item. If you do not find an existing issue matching what you intend to work on, please open a new issue for your item. This will allow the team to review your suggestion, and provide appropriate feedback along the way.

> For small changes or documentation issues, you don't need to create an issue, a pull request is enough in this case.

### 4. Fetch the latest code from the main contractual branch
<pre>
git fetch upstream
</pre>
You should start at this point for every new contribution to make sure you are working on the latest code.

### 5. Create a new branch for your feature based on the current contractual master branch

> That's very important since you will not be able to submit more than one pull request from your account if you'll use master.

Each separate bug fix or change should go in its own branch. Branch names should be descriptive and start with the number of the issue that your code relates to. If you aren't fixing any particular issue, just skip number. For example:
<pre>
git checkout upstream/master
git checkout -b 999-name-of-your-branch-goes-here
</pre>

### 6. Do your magic, write your code
Make sure it works and run the tests :)

Unit tests are always welcome. Tested and well covered code greatly simplifies the task of checking your contributions. Failing unit tests as issue description are also accepted.

### 7. Commit your changes

add the files/changes you want to commit to the [staging area](http://gitref.org/basic/#add) with
<pre>
git add path/to/my/file.js
</pre>
You can use the <code>-p</code> option to select the changes you want to have in your commit.

Commit your changes with a descriptive commit message. Make sure to mention the ticket number with #XXX so github will automatically link your commit with the ticket:
<pre>
git commit -m "A brief description of this change which fixes #42 goes here"
</pre>

### 8. Pull the latest contractual code from upstream into your branch
<pre>
git pull upstream master
</pre>
This ensures you have the latest code in your branch before you open your pull request. If there are any merge conflicts, you should fix them now and commit the changes again. This ensures that it's easy for the contractual team to merge your changes with one click.

### 9. Having resolved any conflicts, push your code to github
<pre>
git push -u origin 999-name-of-your-branch-goes-here
</pre>
The `-u` parameter ensures that your branch will now automatically push and pull from the github branch. That means if you type `git push` the next time it will know where to push to.

### 10. Open a [pull request](http://help.github.com/send-pull-requests/) against upstream.
Go to your repository on github and click "Pull Request", choose your branch on the right and enter some more details in the comment box. To link the pull request to the issue put anywhere in the pull comment `#999` where 999 is the issue number.

> Note that each pull-request should fix a single change.

### 11. Someone will review your code
Someone will review your code, and you might be asked to make some changes, if so go to step #6 (you don't need to open another pull request if your current one is still open). If your code is accepted it will be merged into the main branch and become part of the next contractual release. If not, don't be disheartened, different people need different features and contractual can't be everything to everyone, your code will still be available on github as a reference for people who need it.

### 12. Cleaning it up

After your code was either accepted or declined you can delete branches you've worked with from your local repository and `origin`.
<pre>
git checkout master
git branch -D 999-name-of-your-branch-goes-here
git push origin --delete 999-name-of-your-branch-goes-here
</pre>

### Command overview (for advanced contributors)

<pre>
git clone git@github.com:YOUR-GITHUB-USERNAME/contractual.git
git remote add upstream git://github.com/codemix/contractual.git
</pre>
<pre>
git fetch upstream
git checkout upstream/master
git checkout -b 999-name-of-your-branch-goes-here

/* do your magic, update changelog if needed */

git add path/to/my/file.js
git commit -m "A brief description of this change which fixes #42 goes here"
git pull upstream master
git push -u origin 999-name-of-your-branch-goes-here
</pre>