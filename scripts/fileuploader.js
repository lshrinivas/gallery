function FileUploader(options) {
    options = options || {};
    this.url = options.url || 'picuploader.php';
    this.dropZone = options.dropZone;
}

FileUploader.prototype.upload = function(albumName, files) {

    var images = [];
    // pick out image files from list
    for (var i=0; i<files.length; i++) {
        if (files[i].type.match(/image.*/)) {
            images.push(files[i]);
        };
    }

    console.log('Image files:');
    console.log(images);
    this.resizeImagesAndSend(albumName, images);
}

FileUploader.prototype.resizeImagesAndSend = function(albumName, images) {

    var newCanvas = $('<canvas/>');
    newCanvas[0].height = 1000;
    newCanvas[0].width = 1000;
    var ctx = newCanvas[0].getContext('2d');

    var self = this;
    for (i=0; i<images.length; i++) {
        var img = new Image();
        var imgName = images[i].name;

        // need an IIFE to bind local vars, since we're inside a loop
        EXIF.getData(images[i], (function(imgName, albumName, img) {

            return function() {
                var orientation = EXIF.getTag(this, "Orientation");

                var reader = new FileReader();
                reader.onload = function(e) {
                    img.src = e.target.result
                }
                reader.readAsDataURL(this);

                img.onload = function() {

                    var vertical = (img.height > img.width) || (orientation !== 1);
                    var ratio = Math.min(img.height, img.width) / Math.max(img.height, img.width);

                    // exif orientation of 8 means we need to rotate the image
                    // anti-clockwise
                    var rotateLeft = (orientation === 8);

                    // orientation of 6 means we need to rotate clockwise
                    var rotateRight = (orientation === 6);

                    // the width to draw - this will always be 1000 x (1000 * ratio)
                    // unless the image has been pre-rotated to be vertical
                    var drawWidth = 1000;
                    var drawHeight = 1000 * ratio;
                    if (vertical) {
                        newCanvas[0].height = 1000;
                        newCanvas[0].width = 1000 * ratio;

                        if (rotateLeft) {
                            ctx.save();
                            ctx.translate(0, 1000);
                            ctx.rotate(-Math.PI / 2);
                        } else if (rotateRight) {
                            ctx.save();
                            ctx.translate(newCanvas[0].width, 0);
                            ctx.rotate(Math.PI / 2);
                        } else {
                            // pre-rotated image - set drawWidth and
                            // drawHeight appropriately
                            drawWidth = 1000 * ratio;
                            drawHeight = 1000;
                        }
                    } else {
                        newCanvas[0].height = 1000 * ratio;
                        newCanvas[0].width = 1000;
                    }

                    ctx.drawImage(img, 0, 0, drawWidth, drawHeight);
                    var dataURL = newCanvas[0].toDataURL('image/jpeg', 0.9);

                    if (rotateLeft || rotateRight) {
                        ctx.restore();
                    }

                    var rawData = dataURLtoBlob(dataURL);
                    self.sendFile(albumName, imgName, rawData);
                }
            }
        })(imgName, albumName, img));
    }
}

FileUploader.prototype.sendFile = function(albumName, imgName, rawData) {
    var fd = new FormData();
    fd.append('albumName', albumName);
    fd.append('fileName', imgName);
    fd.append('file', rawData);

    $.ajax({
        url: this.url,
        type: 'POST',
        xhr: function() {
            var xhr = jQuery.ajaxSettings.xhr();
            if (xhr.upload) {
                xhr.upload.addEventListener('progress', function(event) {
                    if (event.lengthComputable) {
                        var percentComplete = event.loaded / event.total;
                        console.log(percentComplete);
                    }
                }, false);
            }
            return xhr;
        },

        data: fd,
        cache: false,
        contentType: false,
        processData: false
    }).done(function(result) {
        console.log("Result of sending uploaded data is: " + JSON.stringify(result));
        //console.log("Result of sending uploaded data is: " + result);
    }).fail(function(result, textStatus) {
        console.log("Error uploading file: " + textStatus + ": " + JSON.stringify(result));
        //console.log("Error uploading file: " + textStatus + ": " + result);
    });
}

// helper functions
function dataURLtoBlob(dataURL) {
    // Decode the dataURL
    var binary = atob(dataURL.split(',')[1]);
    // Create 8-bit unsigned array
    var array = [];
    for(var i = 0; i < binary.length; i++) {
        array.push(binary.charCodeAt(i));
    }
    // Return our Blob object
    return new Blob([new Uint8Array(array)], {type: 'image/png'});
}
