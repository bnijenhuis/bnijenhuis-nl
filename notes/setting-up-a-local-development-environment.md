---
pageTitle: 'Setting up a local development environment'
date: 2022-10-17
tags:
 - notes
---
_Full disclosure: I'm writing this mainly because I keep having to look up how I've set up my development environment. I'm happy with how it's set up, but because I use it for some hobby projects and the occasional client work, I keep forgetting how I have to set up a new project. Time to document it for my own reference (in case the reference articles disappear for some reason) and while I'm at it I might as well share it with the rest of you._

There are two detailed posts by [Tania Rascia](https://twitter.com/taniarascia) that I've used for my setup:

- <https://www.taniarascia.com/local-environment/>
- <https://www.taniarascia.com/setting-up-virtual-hosts/>

I recommend you read these articles for more background information and/or how to set up the development environment on Windows. I'll go over the parts I've used to set it up on my Mac. Again, to set it up on Windows, check out the articles of Tania.

## Local server environment

There are different ways to set up a local server environment, but I find the easiest way to do this is by using [MAMP](https://www.mamp.info/). This allows you to run Apache, MySQL and PHP with ease. You can even choose if you want to run Apache or Nginx, and you can choose which PHP version you want to run on your local server. Install it, open it, click on Start and you're good to go. If you want to run one project on `http://localhost:8888` that is.

## Virtual hosts

If you only want to run one project at once on `localhost`, you can stick with the setup MAMP has provided. You only have to change the `Document root` to your project and restart the server. I, however, prefer to run multiple projects on their own urls. Here's what you have to do to achieve this.

### Enable virtual hosts in Apache

You only need to do this once. Open the apache config file located at `/Applications/MAMP/conf/apache/httpd.conf` and enable the following line (it's hashed out by default): 

``` apacheconf
Include /Applications/MAMP/conf/apache/extra/httpd-vhosts.conf
```

### Allow symlink override

This too has to be done only once. In the same apache config file, located at `/Applications/MAMP/conf/apache/httpd.conf`, change this:

``` apacheconf
<Directory />
    Options Indexes FollowSymLinks
    AllowOverride None
</Directory>
```

to this:

``` apacheconf
<Directory />
  Options Indexes FollowSymLinks
  AllowOverride All
</Directory>
```

### Add virtual host config

Next up, you need to add the actual virtual host config. You need to do this for every project you want to run on a different url. Open the Apache vhost config file, located at `/Applications/MAMP/conf/apache/extra/httpd-vhosts.conf`. At the end of the file add the following for each project:

``` apacheconf
<VirtualHost *:80>
  ServerName myproject.test
  DocumentRoot "/Users/bnijenhuis/Sites/myproject"
</VirtualHost>
```

Enter the url you want to use for `ServerName` (do not use `.dev` however, because that's not supported anymore), and enter the location of the project for `DocumentRoot`.

## Add project url to the `hosts` file

MAMP will now serve the projects at the urls you've provided in the virtual host config, but the browser won't recognize these urls yet. You have to add the project urls to the `hosts` file. Open your hosts file, located at `/etc/hosts`, and add your projects at the end of the file (each project on a new line) like this:

``` apacheconf
127.0.0.1   myproject.test
```

## Remove the port from the url

We're almost there. The project is on the right url, served from the right folder, but it has a port number in the url. In this example it's `myproject.test:8888`, so we have to change that (this also has to be done once). Open the apache config file again, located at `/Applications/MAMP/conf/apache/httpd.conf`, and change the following lines:

``` apacheconf
Listen 8888
ServerName localhost:8888
```

to:

``` apacheconf
Listen 80
ServerName localhost:80
```

To make sure MAMP also listen to these ports, you need to change it's ports in `Preferences`:

``` apacheconf
Apache Port: 80
Nginx Port: 8888
MySQL Port: 3306
```

Now restart MAMP and we're done. You can now use multiple projects on their own urls on your computer. 