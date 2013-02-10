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
		var name = $("#name");
		name.removeClass("ui-state-error");
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

    // Initialize the jQuery File Upload widget:
    $('#fileupload').fileupload({
        url: 'picuploader.php',
	dropZone: $("#dropbox")
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
	    $("#newalbum-dialog").dialog("open");
	});

    $("#upload")
	.button()
	.click(function() {
	    uploadView($("#albumname").html());
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
    $("div.panel").hide();
    $("#upload").hide();

    $("#newalbum").show();
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
    $("div.panel").hide();
    $("#newalbum").hide();

    $("#upload").show();
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
	    $("#photoContainer").selectable({
		stop: function() { 
		    // show delete button if there are any selected
		    // photos, hide otherwise
		    if ($(".ui-selected").length > 0)
			$("#delete-photos").show();
		    else
			$("#delete-photos").hide();
		}
	    });

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

	    // Init delete button (hidden initially)
	    $("#delete-photos")
		.button()
		.click(deletePhotos)
		.hide();
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

function deletePhotos() {
    var album = $("#albumname").html();

    var picURLs = [];
    $("div.ui-selected").find("img").each(function() {
	picURLs.push($(this).attr("src"));
    });

    $.post("picuploader.php", 
	   { _method : "DELETE", albumName: album, picurls: picURLs }, 
	   function() {
	       photoView(album);
	   });
    
}

/////////////// Upload View Functions //////////////

function uploadView(albumName) {
    $("div.panel").hide();
    $("#newalbum").hide();

    // set the album name on the upload widget
    $('#fileupload').fileupload(
    	'option',
    	'formData',
    	[ { name: 'albumName', value: albumName } ]
    );

    $("#upload").show();
    showUpload(albumName);
    showUploadSidebar(albumName);
}

function showUpload(albumName) {

    var template = $("#uploadTemplate").html();
    var output = Mustache.render(template, { albumName: albumName });

    $("#bc-container").html(output);

    // Set up breadcrumbs Home link
    $("#albumview2").click(albumView);
    $("#albumname2").click(function() { photoView(albumName); });

    $("#uploadPanel").show();
}

function showUploadSidebar(albumName) {

}
