function FileUploader(options) {
    options = options || {};
    this.url = options.url || 'picuploader.php';
    this.dropZone = options.dropZone;
    this.startResize = options.startResize;
    this.endResize = options.endResize;
    this.uploadProgress = options.uploadProgress;

    this.queue = [];

    var boundProcessFile = this.processFile.bind(this);
    $(this).on('processNext', boundProcessFile);
}

FileUploader.prototype.filterImages = function(files) {

    var images = [];
    // pick out image files from list
    for (var i=0; i<files.length; i++) {
        if (files[i].type.match(/image.*/)) {
            images.push(files[i]);
        };
    }

    return images;
}

FileUploader.prototype.upload = function(albumName, images) {

    var newCanvas = $('<canvas/>');
    newCanvas[0].height = 1000;
    newCanvas[0].width = 1000;

    this.canvas = newCanvas[0];
    this.albumName = albumName;

    for (var i=0; i<images.length; i++) {
        this.queue.push({ idx: i, image: images[i]});
    }

    $(this).trigger('processNext');
}

// resizes and uploads one file from the queue
FileUploader.prototype.processFile = function() {

    if (!this.queue.length) {
        return;
    }

    var startResizeCallback = this.startResize;
    var endResizeCallback = this.endResize;

    var qItem = this.queue.shift();

    var img = new Image();

    // if start resize callback is registered, call it with the current image
    // index (i.e., i)
    if (startResizeCallback && (typeof startResizeCallback === 'function')) {
        startResizeCallback(qItem.idx);
    }

    var newCanvas = this.canvas;
    var ctx = newCanvas.getContext('2d');
    var self = this;

    // need an IIFE to bind local vars, since we're inside a loop
    EXIF.getData(qItem.image, (function(imgName, albumName, img, imgIdx) {

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
                    newCanvas.height = 1000;
                    newCanvas.width = 1000 * ratio;

                    if (rotateLeft) {
                        ctx.save();
                        ctx.translate(0, 1000);
                        ctx.rotate(-Math.PI / 2);
                    } else if (rotateRight) {
                        ctx.save();
                        ctx.translate(newCanvas.width, 0);
                        ctx.rotate(Math.PI / 2);
                    } else {
                        // pre-rotated image - set drawWidth and
                        // drawHeight appropriately
                        drawWidth = 1000 * ratio;
                        drawHeight = 1000;
                    }
                } else {
                    newCanvas.height = 1000 * ratio;
                    newCanvas.width = 1000;
                }

                ctx.drawImage(img, 0, 0, drawWidth, drawHeight);
                var dataURL = newCanvas.toDataURL('image/jpeg', 0.9);

                if (rotateLeft || rotateRight) {
                    ctx.restore();
                }

                // call end resize callback with image index
                if (endResizeCallback && (typeof endResizeCallback === 'function')) {
                    endResizeCallback(imgIdx);
                }

                var rawData = dataURLtoBlob(dataURL);
                self.sendFile(albumName, imgName, imgIdx, rawData);
            }
        }
    })(qItem.image.name, this.albumName, img, qItem.idx));

}

FileUploader.prototype.sendFile = function(albumName, imgName, imgIdx, rawData) {
    var fd = new FormData();
    fd.append('albumName', albumName);
    fd.append('fileName', imgName);
    fd.append('file', rawData);

    var progressCallback = this.uploadProgress;
    var self = this;

    $.ajax({
        url: this.url,
        type: 'POST',
        xhr: function() {
            var xhr = jQuery.ajaxSettings.xhr();
            if (xhr.upload) {
                xhr.upload.addEventListener('progress', function(event) {
                    if (event.lengthComputable) {
                        var percentComplete = 100 * (event.loaded / event.total);
                        if (progressCallback && (typeof progressCallback === 'function')) {
                            progressCallback(imgIdx, percentComplete);
                        }
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
    }).fail(function(result, textStatus) {
        console.log("Error uploading file: " + textStatus + ": " + JSON.stringify(result));
    }).always(function() {
        // after file is uploaded (or failed), send message to process next file
        $(self).trigger('processNext');
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
