$(function() {
    $("#browse").button().click(toggleThumbs);
   
    initToolbar();
    scaleImage();

    $('img.thumb').each(gotoSlide);

    $(window).resize(scaleImage);

});

function gotoSlide(index) {
    $(this).click(function() { $("#container").cycle(index); });
}

function initToolbar() {
    $( "#prev" ).button({
        text: false,
        icons: {
            primary: "ui-icon-seek-start"
        }
    });
    $( "#play" ).button({
        text: false,
        icons: {
            primary: "ui-icon-pause"
        }
    })
        .click(function() {
            var options;
	    var slideCommand;
            if ( $( this ).text() === "Play" ) {
                options = {
                    label: "Pause",
                    icons: {
                        primary: "ui-icon-pause"
                    }
                };
		slideCommand = 'resume';
            } else {
                options = {
                    label: "Play",
                    icons: {
                        primary: "ui-icon-play"
                    }
                };
		slideCommand = 'pause';
            }
            $( this ).button( "option", options );
	    $("#container").cycle(slideCommand);
        });
    $( "#next" ).button({
        text: false,
        icons: {
            primary: "ui-icon-seek-end"
        }
    });
}

function scaleImage() {
    var h = getViewPortHeight();
    var w = getViewPortWidth();

    $("#container div").height(h);
    $("#container div").width(w);

    $("#container").cycle('destroy');

    $("#container").cycle({ 
    	fx:     'fade', 
    	speed:  500, 
    	next:   '#next',
	prev:   '#prev',
    	timeout: 2000
    });

    // position controls
    $('#tb-container').position({
	my: "center bottom",
	at: "center bottom",
	of: "#container"
    });
}

function toggleThumbs() {
    $("#thumbs").toggle("slide", "slow");
    var curLabel = $("#browse").text();
    if (curLabel == "Browse")
	$("#browse").text("Close");
    else
	$("#browse").text("Browse");
    $("#browse").css({ "padding": "0px 11px 0px 11px", "font-size": "14px"});
    return false;
}

function getViewPortWidth()
{
    var viewportwidth;
    var viewportheight;

    //Standards compliant browsers (mozilla/netscape/opera/IE7)
    if (typeof window.innerWidth != 'undefined')
    {
        viewportwidth = window.innerWidth,
        viewportheight = window.innerHeight
    }

    // IE6
    else if (typeof document.documentElement != 'undefined'
    && typeof document.documentElement.clientWidth !=
    'undefined' && document.documentElement.clientWidth != 0)
    {
        viewportwidth = document.documentElement.clientWidth,
        viewportheight = document.documentElement.clientHeight
    }

    //Older IE
    else
    {
        viewportwidth = document.getElementsByTagName('body')[0].clientWidth,
        viewportheight = document.getElementsByTagName('body')[0].clientHeight
    }

    return viewportwidth;
}

function getViewPortHeight()
{
    var viewportwidth;
    var viewportheight;

    //Standards compliant browsers (mozilla/netscape/opera/IE7)
    if (typeof window.innerWidth != 'undefined')
    {
        viewportwidth = window.innerWidth,
        viewportheight = window.innerHeight
    }

    // IE6
    else if (typeof document.documentElement != 'undefined'
    && typeof document.documentElement.clientWidth !=
    'undefined' && document.documentElement.clientWidth != 0)
    {
        viewportwidth = document.documentElement.clientWidth,
        viewportheight = document.documentElement.clientHeight
    }

    //Older IE
    else
    {
        viewportwidth = document.getElementsByTagName('body')[0].clientWidth,
        viewportheight = document.getElementsByTagName('body')[0].clientHeight
    }

    return viewportheight;
}

