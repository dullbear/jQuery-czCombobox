czCombobox jQuery plugin
===

Introduction
---

czCombobox is a [jQuery](http://jquery.com) plugin that allows you to turn default browser dropdown list into much more attractive.
    
The plugin is usable not only for end users, but also for developers. czCombobox has a lot of configuration options so you can modify its behaviour and appearance. From this version the core CSS file is separated from the CSS that provides drop download list appearance, and now you are able to easily create new skins for the plugin.
    
Examples
---

Please view demo page to see the possibilities of *czCombobox*.
    
Installation
---

Please follow these instructions to install czCombobox:

Download and unpack the archive.
Include jQuery and plugin files to your web page:

	<script type="text/javascript" src="/js/jquery-1.4.2.min.js"></script>
	<script type="text/javascript" src="/js/jquery.czCombobox.js"></script>
	

Include core or your skin CSS files to your page:

	<link rel="stylesheet" type="text/css" href="images/style.css" />
	<link rel="stylesheet" type="text/css" href="images/skin_name.css" />
	
Done! Now make your dropdown lists look and behave sexy!
	
	$('#country-1').czCombobox({
        className : 'light-black',
        listMargin: 5,
        changeCallback: function() {
            alert('Has Changed')
        }
    });

         
Usage and configuration options
---

*czCombobox* has a number of configuration options that are passed to the plugin in the form of JavaScript object.
The full list of options is:   

**className** *String, Default: null*  
The class name of dropdown list wrap.  
**initCallback** *Funtion, Default: null*  
function that is called at the end of constrictor.  


In this version I have separated core CSS and presentational CSS, so now it's possible to create new skins for *czCombobox*. The download package contains one example skin. Feel free to create your own based on it.
    
Browser compatibility
---

*czCombobox* has been tested and works on the following browsers:

Internet Explorer 6.0 +
Chrome
Firefox
Opera

Support project
---

Every user of *czCombobox* adds some value to it, so you help me by just using it. However, if you want to help more, you can do the following:

Tell the world about *czCombobox*. You can write an atricle or a blog post about it or just tell your friends/collegues about it.
Test it on browsers that are not currently supported "officially".
Report a bug.
If you are web designer/developer, I will be glad to collaborate with you. If you have some suggestions on design/programming, feel free to email me at Kadalashvili at Vladimir at gmail dot com.

Please don't donate money, it's needless.
