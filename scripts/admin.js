$(function() {
    // Perform initializations
    init();

    // Initially, start with all albums view
    showAlbums();
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

function dialog(title, bodyText) {
    var modelObj = { body: bodyText };
    var template = $("#alertTemplate").html();

    var output = Mustache.render(template, modelObj);

    $("#alerts").html(output);
    $("#alerts").attr("title", title);

    $("#alerts").dialog({
	height: 300,
	width: 350,
	modal: true,
	buttons: {
	    Ok: function() {
		$( this ).dialog( "close" );
	    }
	}
    });
}

/////////////// Album View Functions //////////////


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
		    showAlbumPics(albumName);
		});

	} else {
	    // show error
	    dialog("Error!", "Couldn't fetch albums");
	}
    });

    showAlbumSidebar();
}

function createAlbum(a_name) {

    performRPC("createAlbum", { name: a_name }, function(createAlbumRO) {

	if (createAlbumRO.success) {
	    showAlbums();
	} else {
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
	} else {
	    // show error
	}
    });
    
}

/////////////// Photo View Functions //////////////

function showAlbumPics(albumName) {
    publicLink(albumName);
}

function publicLink(a_name) {

    performRPC("publicLink", { name: a_name }, function(publicLinkRO) {

	if (publicLinkRO.success) {
	    var cur_url = window.location.href;
	    var final_url = cur_url.replace("admin.php", publicLinkRO.url);
	    
	    dialog("Public Link", final_url);
	} else { 
	    // show error
	}
    });
}

