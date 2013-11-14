function FileUploader(options) {    
    this.url = options.url;
    this.dropZone = options.dropZone;
}

FileUploader.prototype.upload = function(files) {

    var images = [];
    // pick out image files from list
    for (var i=0; i<files.length; i++) {
	if (files[i].type.match(/image.*/)) {
	    images.push(files[i]);
	};
    }
    console.log(images);
}