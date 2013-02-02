function dologin() {
    // generate hash of password and submit
    var pw = $("#password").val();
    var coarsets = Math.floor((new Date()).getTime() / 100000);

    var hash = Sha1.hash(pw + coarsets);

    var target = $(this).attr("target");

    $.post("login.php", { password : hash }, function(data) {
        if (data == "Success") {
	    // redirect to success page
	    $(location).attr('href',target);
        } else {
	    $("#message").text("Login failed - please check your password and try again");
	    $("#error").show();
	}
    }).error(function() { 
	$("#message").text("Couldn't contact server - please try again later");
	$("#error").show();
    });
    return false;
}

$(function() {
    $("#login").button();
    $("form").submit(dologin);
    $("#password").focus();
});
