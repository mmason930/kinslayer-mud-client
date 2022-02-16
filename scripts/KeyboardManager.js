function KeyboardManager()
{
	var self = this;
	this.keysDown = {};
	this.metaKeyDown = false;
	this.ctrlKeyDown = false;
	var $document = $(document);
	
	$document.on("keydown", function(e) {
		self.keysDown[ e.which ] = new Date().getTime();
		self.metaKeyDown = e.metaKey;
		self.ctrlKeyDown = e.ctrlKey;
	});
	
	$document.on("keyup", function(e) {
		delete self.keysDown[ e.which ];
		self.metaKeyDown = e.metaKey;
		self.ctrlKeyDown = e.ctrlKey;
	});
}

KeyboardManager.prototype.isKeyDown = function(keyCode)
{
	return this.keysDown[ keyCode ] != null;
};
KeyboardManager.prototype.isMetaKeyDown = function()
{
	return this.metaKeyDown;
}
KeyboardManager.prototype.isCtrlKeyDown = function()
{
	return this.ctrlKeyDown;
}