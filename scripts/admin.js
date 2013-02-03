$(function() {
    // Perform initializations
    init();

    // Initially, start with all albums view
    albumView();
});

function init() {
    // Initialize new album dialog
    $( "#newalbum-dialog" ).dialog({
	autoOpen: false,
	height: 300,
	width: 350,
	modal: true,
	buttons: {
	    "Create": function() {
		var bValid = true;
		var name = $( "#name" );
		name.removeClass( "ui-state-error" );
		bValid = bValid && checkLength( name, "username", 1, 100 );
		if (bValid) {
		    createAlbum(name.val());
		    $( this ).dialog( "close" );
		}
	    },
	    Cancel: function() {
		$( this ).dialog( "close" );
	    }
	},
	close: function() {
	    $( "#name" ).val( "" ).removeClass( "ui-state-error" );
	}
    });

    // Init toolbar buttons
    $( "#logout" )
        .button()
        .click(function() {
            $.post("admin.php", { logout : "true" }, function() {
		$(location).attr('href',"index.html");
            });
        });

    $("#newalbum")
	.button()
	.click(function() {
	    $( "#newalbum-dialog" ).dialog( "open" );
	});

    // Position progress indicator animation
    $("#progress").position({
    	my: "center middle",
    	at: "center middle",
    	of: "#container"
    });

    // Initialize tooltips
    $(document).tooltip();

}

//////////// Utility Functions ///////////////

function performRPC(methodName, argsObj, callback) {

    $("#progress").show();
    $.post("bsgallery.php", { method : methodName, args: argsObj }, function(data) {
	var bsRO = $.parseJSON(data);
	
	$("#progress").hide();
	callback(bsRO);
    });


}

function checkLength( o, n, min, max ) {
    if ( o.val().length > max || o.val().length < min ) {
	o.addClass( "ui-state-error" );
	updateTips( "Length of " + n + " must be between " +
		    min + " and " + max + "." );
	return false;
    } else {
	return true;
    }
}

function updateTips( t ) {
    var tips = $( ".validateTips" );
    tips.text( t )
	.addClass( "ui-state-highlight" );
    setTimeout(function() {
	tips.removeClass( "ui-state-highlight", 1000 );
    }, 500 );
}

function dialog(titleText, bodyText) {
    var template = $("#alertTemplate").html();

    var output = Mustache.render(template, { body: bodyText });

    $("#alerts").html(output);

    $("#alerts").dialog({
	height: 300,
	width: 350,
	modal: true,
	title: titleText,
	buttons: {
	    Ok: function() {
		$( this ).dialog( "close" );
	    }
	}
    });
}

function sessionExpired() {
    dialog("Session Expired", "Your session has expired. Please click Ok to login again");
    $( "#alerts" ).bind( "dialogclose", function() {
	$(location).attr('href',"index.html");
    });
}

/////////////// Album View Functions //////////////

function albumView() {
    $("#oneAlbumPanel").hide();

    showAlbums();
    showAlbumSidebar();
}

function showAlbums() {

    performRPC("getAlbums", "", function(getAlbumsRO) {
	if (getAlbumsRO.success) {
    	    var template = $("#albumTemplate").html();

    	    var output = Mustache.render(template, getAlbumsRO);

    	    $("#allAlbumsPanel").html(output);
    	    $("#allAlbumsPanel").show();

	    // Init album events
	    $(".album-cover")
		.click(function() {
		    var albumName = $(this).children("p:first").html();
		    photoView(albumName);
		});

	} else {
	    // handle session expired
	    if (getAlbumsRO.retcode == 1) 
		sessionExpired();
	    else
		// show error
		dialog("Error!", "Couldn't fetch albums");
	}
    });
}

function createAlbum(a_name) {

    performRPC("createAlbum", { name: a_name }, function(createAlbumRO) {

	if (createAlbumRO.success) {
	    showAlbums();
	} else {
	    // handle session expired
	    if (createAlbumRO.retcode == 1) 
		sessionExpired();
	    else
		// show error
		dialog("Error!", "Couldn't create album");
	}
    });
}

function showAlbumSidebar() {
    performRPC("albumSummary", "", function(albumSummaryRO) {
	if (albumSummaryRO.success) {
    	    var template = $("#infoTemplate").html();

    	    var output = Mustache.render(template, albumSummaryRO);

    	    $("#info").html(output);

	    // show graphic of used space
	    var spaceUsedPercent = albumSummaryRO.usedSpace * 100 / albumSummaryRO.totalSpace;

	    // To see how the progress bar looks, uncomment the following:
	    spaceUsedPercent = 34;

	    $("#spaceusedbar").progressbar({ value: spaceUsedPercent });
	} else {
	    // handle session expired
	    if (albumSummaryRO.retcode == 1) 
		sessionExpired();
	    else
		// show error
		dialog("Error!", "Couldn't fetch album summary");
	}
    });
    
}

/////////////// Photo View Functions //////////////

function photoView(albumName) {
    $("#allAlbumsPanel").hide();

    showPhotos(albumName);
    showPhotosSidebar(albumName);
}

function showPhotos(albumName) {

    performRPC("getPhotos", { name: albumName }, function(getPhotosRO) {
	if (getPhotosRO.success) {
    	    var template = $("#photoTemplate").html();
    	    var output = Mustache.render(template, getPhotosRO);

    	    $("#oneAlbumPanel").html(output);

	    // Set up breadcrumbs Home link
	    $("#albumview").click(albumView);

    	    $("#oneAlbumPanel").show();


	} else {
	    // handle session expired
	    if (getPhotosRO.retcode == 1) 
		sessionExpired();
	    else
		// show error
		dialog("Error!", "Couldn't fetch photos in album");
	}
    });
}

function showPhotosSidebar(albumName) {

    performRPC("photoSummary", { name: albumName }, function(photoSummaryRO) {
	if (photoSummaryRO.success) {

	    var cur_url = window.location.href;
	    photoSummaryRO.albumPublicUrl = cur_url.replace("admin.php", photoSummaryRO.albumPublicUrl);

    	    var template = $("#oneAlbumTemplate").html();
    	    var output = Mustache.render(template, photoSummaryRO);

    	    $("#info").html(output);
	} else {
	    // handle session expired
	    if (photoSummaryRO.retcode == 1) 
		sessionExpired();
	    else
		// show error
		dialog("Error!", "Couldn't fetch photos in album");
	}
    });

}

function publicLink(a_name) {

    performRPC("publicLink", { name: a_name }, function(publicLinkRO) {

	if (publicLinkRO.success) {
	    var cur_url = window.location.href;
	    var final_url = cur_url.replace("admin.php", publicLinkRO.url);
	    
	    dialog("Public Link", final_url);
	} else { 
	    // handle session expired
	    if (publicLinkRO.retcode == 1) 
		sessionExpired();
	    else
		// show error
		dialog("Error!", "Couldn't get public link for album");
	}
    });
}

