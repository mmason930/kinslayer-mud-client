function KeyboardManager()
{
	var self = this;
	this.keysDown = {};
	var $document = $(document);
	
	$document.on("keydown", function(e) {
		self.keysDown[ e.which ] = new Date().getTime();
	});
	
	$document.on("keyup", function(e) {
		delete self.keysDown[ e.which ];
	});
}

KeyboardManager.prototype.isKeyDown = function(keyCode)
{
	return this.keysDown[ keyCode ] != null;
};
