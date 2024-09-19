---
pageTitle: 'Updating Eleventy...and more'
date: 2024-09-11
tags:
 - notes
---
As you might have noticed, I don't have a very stable streak in posting notes on here. It *only* took almost a year between my last note and the one before that, so my setup tends to get outdated. And because I take so long, I keep forgetting what and how I need to update everything. So to make it easier for my future self I decided to document it.

## Update `npm` first

Last time I already received a notice in terminal that my [npm](https://www.npmjs.com/) version has a new major version available, so let's start with updating this. The notice already gave the command to update npm, in this case it was:

``` terminal
npm install -g npm@10.8.3 
```

And as usual, this returned a bunch of permission errors, because I forgot I need to install this as the `root` user, so let's try again:

``` terminal
sudo npm install -g npm@10.8.3 
```

That command solved the permissions errors, but returned a new error:

``` terminal
npm WARN EBADENGINE Unsupported engine {
npm WARN EBADENGINE   package: 'npm@10.8.3',
npm WARN EBADENGINE   required: { node: '^18.17.0 || >=20.5.0' },
npm WARN EBADENGINE   current: { node: 'v13.7.0', npm: '7.8.0' }
npm WARN EBADENGINE }
```

## No wait, update `Node.js` first

My [Node.js](https://nodejs.org/en) version appears to be in need of an update. There are several ways of doing this, so I just go for the easiest one, which is downloading and installing it. After restarting the terminal to make sure the changes to take effect I double check the installation by seeing which Node.js version is installed now:

``` terminal
node -v 
```

This returned `v20.17.0`, so Node.js is now up to date. 

## NOW update `npm`

Node.js is updated to the right version so updating `npm` should work now, so let's try again:

``` terminal
sudo npm install -g npm@10.8.3 
```

No errors return, so could it be that `npm` is actually updated? Let's check:

``` terminal 
npm -v 
```

Success! The installed version of `npm` is now `10.8.3`.

## Next up: update Eleventy

On to the actual purpose of this exercise: updating Eleventy. First check which version is installed:

``` terminal
npx @11ty/eleventy --version 
```

Turns out I'm running version 1.0.1, which is pretty old, because Eleventy is currently on version 2.0.1 (that is the latest stable version, but 3.0.0 is already in beta at the time of writing). There's some excellent [documentation](https://www.11ty.dev/docs/plugins/upgrade-help/) on their website on how to do this and there's even an upgrade helper to check your project after the upgrade. Nothing left to do than to follow these steps.

Since I use as little dependencies as possible in my setup, I didn't run into any problems when upgrading Eleventy from v1 to v2. That means I'm done and Eleventy is now updated to 2.0.1!
