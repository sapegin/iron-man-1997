/**
 	@class A sprite class with different image/animation sequences based upon defined 'actions'.
	@description Allows you to associate a set of animations with a particular entity. To do vector graphics, use the canvas tag methods instead.
	@param anchor selects which side of the sprite's rectangle to 'anchor' the animation to. e.g. ["center", "bottom"] will anchor the sprite to the ground (side view) whilst ["right", "center"] would anchor it to the right hand side.
	@param frames is a dictionary containing all actions and their associated set of images and the number of frames to show each image for. For instance: {"stand": [["img/stand.png", 0],], "walk": [["img/walk1.png", 3], ["img/walk2.png", 3],]} where each walk frame is shown for three frames.
	@param loadedcallback is a function that is called once all of the frames in all action animations are successfully loaded.
*/
function Sprite(anchor, frames, loadedcallback) {
	var loadcount = 0;
	var action = "";
	var framecount = -1;
	var frame = 0;
	var sprite = this;
	var numframes = 0;
	var loopcallback = null;
	this.loaded = false;
	this.width = 0;
	this.height = 0;
	this.filtered = false;

	// load up all of the images
	for (var a in frames) {
		// replace string entries with Images, unless they already are
		for (var f=0; f<frames[a].length; f++) {
			if (typeof(frames[a][f][0]) == "string") {
				loadcount += 1;
				var img = new Image();
				img.src = frames[a][f][0];
				frames[a][f][0] = img;
				img.onload = function () {
					loadcount -= 1;
					if (loadcount == 0) {
						sprite.width = parseInt(img.width);
						sprite.height = parseInt(img.height);
						sprite.loaded = true;
						if (loadedcallback) {
							loadedcallback();
						}
					}
				}
			}
		}
		if (loadcount == 0) {
			// they passed in images. set our width and height to the first image
			if (frames[a].length && frames[a][0].length) {
				sprite.width = frames[a][0][0].width;
				sprite.height = frames[a][0][0].height;
			}
			sprite.loaded = true;
			if (loadedcallback) {
				loadedcallback();
			}
		}
	}

	// calculate offsets (center, right, left, top, bottom)
	var calc_x = {
		"left": function(frame) {
			return 0;
		},
		"right": function(frame) {
			return frame.width;
		},
		"center": function(frame) {
			return frame.width / 2;
		}
	}

	var calc_y = {
		"top": function(frame) {
			return 0;
		},
		"bottom": function(frame) {
			return frame.height;
		},
		"center": function(frame) {
			return frame.height / 2;
		}
	}

	/**
		Sets which named animation/action to play.
		@param a is the name of the animation/action you defined on initialisation.
		@param reset indicates whether the frame number should be reset to the start of the animation.
		@param callback is called when the animation has completed one loop - receives parameter "action".
	**/
	this.action = function(a, reset, callback) {
		if (typeof(callback) == "undefined") {
			loopcallback = null;
		} else {
			loopcallback = callback;
		}
		action = a;
		numframes = frames[a].length;
		if (reset) {
			framecount = frames[a][0][1];
			frame = 0
		} else {
			frame = frame % frames[a].length;
		}
		sprite.update = sprite._update;
		sprite.draw = sprite._draw;
		sprite.aabb = sprite._aabb;
		return this;
	}

	/** Returns the current action being played. **/
	this.get_action = function() {
		return action;
	}

	/** Returns the current frame number being played. **/
	this.get_frame = function() {
		return frame;
	}

	/** Returns the total number of frames. **/
	this.get_num_frames = function() {
		return numframes;
	}

	/** Sets the animation frame to play **/
	this.set_frame = function(newframe) {
		frame = newframe;
	}

	this.filter = function(func) {
		if (this.filtered) return;
		this.filtered = true;
		this.filterFunc = func;
		this.filterFrame = 1;
	}

	// increment frame counter etc.
	this._update = function() {
		framecount -= 1;
		if (framecount <= 0) {
			if (loopcallback && (frame + 1 >= frames[action].length)) {
				loopcallback(action);
			}
			frame = (frame + 1) % frames[action].length;
			var fimg = frames[action][frame]
			framecount = fimg[1];
			this.width = fimg[0].width;
			this.height = fimg[0].height;
		}

		if (this.filtered) {
			this._filterSprite();
			this.filterFrame++;
		}
	}

	// draw this sprite on canvas c at position with respect to the anchor specified
	this._draw = function(c, pos) {
		var currentImage = frames[action][frame][0],
			x = pos[0] - calc_x[anchor[0]](currentImage),
			y = pos[1] - calc_y[anchor[1]](currentImage);
		if (this.filtered) {
			try {
				c.putImageData(this.filteredImageData, x, y);
			}
			catch (e) {
			}
		}
		else {
			c.drawImage(currentImage, x, y);
		}
	}

	// returns the axis-aligned bounding-box of this sprite	for the current frame
	this._aabb = function(pos) {
		var i = frames[action][frame][0];
		return [pos[0] - calc_x[anchor[0]](i), pos[1] - calc_y[anchor[1]](i), i.width, i.height];
	}

	this._filterSprite = function() {
		var w = this.width,
			h = this.height;
		var spriteCanvas = document.createElement('canvas');
		spriteCanvas.width = w;
		spriteCanvas.height = h;
		var ctx = spriteCanvas.getContext('2d');

		ctx.fillStyle = '#000';  // @todo
		ctx.fillRect(0, 0, w, h);
		ctx.drawImage(frames[action][frame][0], 0, 0);

		var imageData = ctx.getImageData(0, 0, w, h);
		var data = this.filterFunc(imageData.data, this.filterFrame);
		if (data) {
			imageData.data = data;
			this.filteredImageData = imageData;
		}
		else {
			this.filtered = false;
		}
	}

	/** Call this method from inside the owner entity's update() method. */
	this.update = function() {};

	/**
		Draw the sprite. Call this method from inside the owner entity's draw() method.
		@param c is the canvas to draw on (passed to the entity's draw(c) method)
		@param pos is the position to draw at relative to the anchor point.
	 **/
	this.draw = function() {};

	/**
		Returns the axis aligned bounding box of this sprite at its current frame.
		@param pos is the position to get the aabb relative to (factors the anchor point in too).
	**/
	this.aabb = function() { return [0, 0, 0, 0]; };
}

/**
	@method preload
	@description Pre-loads a whole array of images. Provides feedback on which images are loaded via the progresscallback, which returns the number of images left to load each time one is loaded, and 0 when the final image is loaded.
	@param images is an array of strings containing the URLs of images to load.
	@param completedcallback is a function which is called when all images are loaded
	@param progresscallback is a function accepting an integer, which is the count of images left to load
*/
Sprite.preload = function(images, completedcallback, progresscallback) {
	var loadcount = images.length;
	var img = [];
	for (var i=0; i<images.length; i++) {
		img[i] = new Image();
		img[i].onload = function () {
			loadcount -= 1;
			if (progresscallback)
				progresscallback(loadcount);
			if (loadcount == 0 && completedcallback) {
				completedcallback();
			}
		}
		img[i].src = images[i];
	}
}
