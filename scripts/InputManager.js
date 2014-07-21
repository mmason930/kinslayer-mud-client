function InputManager(client)
{
	var self = this;
	this.client = client;
	this.$inputCursor = $("#inputCursor");
	this.$inputBox = $("#inputBox");
	this.$inputTextarea = $("#inputTextarea");
	this.cursorBlinkCallback = function() {	self.$inputCursor.css("opacity", self.$inputCursor.css("opacity") == "1" ? "0" : "1");	};
	this.cursorInterval = null;
	this.buffer = "Test Test Test";
	
	this.fontWidth = null;
	this.xInitialPosition = parseInt(this.$inputBox.css("padding-left"));
	this.cursorOffset = 0;
	
	this.measureFontWidth();
	this.setupTextArea();
	
	this.moveCursor(2);
	this.resetCursorBlink();
	
	/***
	$(document).on("copy", function(e) {

		var $previousFocusedElement = $(":focus");
		var textarea = $("textarea");

		textarea.focus();
		setSelectionRange(textarea[0], 0, textarea.val().length);

		previousFocusedElement.focus();
	});
	***/
}

InputManager.prototype.moveCursor = function(offset)
{
	this.$inputCursor.css("left", this.xInitialPosition + (offset * this.fontWidth));
	this.cursorOffset = offset;
	
	this.$inputTextarea.css("left", this.$inputCursor.css("left"));
	this.resetCursorBlink();
};

InputManager.prototype.moveCursorForward = function()
{
	this.moveCursor(this.cursorOffset + 1);
};

InputManager.prototype.moveCursorBackward = function()
{
	this.moveCursor(this.cursorOffset - 1);
};

InputManager.prototype.resetCursorBlink = function()
{
	this.$inputCursor.css("opacity", "1");
	
	if(this.cursorInterval)
		clearInterval(this.cursorInterval);
	
	this.cursorInterval = setInterval(this.cursorBlinkCallback, 500);
};

InputManager.prototype.processBackspace = function() {

	
};

InputManager.prototype.getBuffer = function()
{
	return this.buffer;
};

InputManager.prototype.setBuffer = function(buffer)
{
	this.buffer = buffer;
	this.$inputBox.text(buffer);
};

InputManager.prototype.setupTextArea = function() {

	this.$inputTextarea	.css("width", this.fontWidth)
						.css("height", this.$inputBox.css("height"))
						.css("left", this.xInitialPosition)
						.css("top", "0");
};

InputManager.prototype.measureFontWidth = function() {

	var $div = $("<div>O</div>");
	$div	.css("display", "inline")
			.css("font-size", this.$inputBox.css("font-size"))
			.css("font-weight", this.$inputBox.css("font-weight"))
			.css("font-family", this.$inputBox.css("font-family"))
			.css("text-decoration", this.$inputBox.css("text-decoration"))
			.css("opacity", "0")
			.css("position", "absolute")
			.css("padding", "0px")
			.css("color", "#FFF")
			.css("margin", "0px")
			.css("letter-spacing", this.$inputBox.css("letter-spacing"));
	
	$("body").append($div);
	
	this.fontWidth = $div.width();
	
	console.log("Font Width Measured As: " + this.fontWidth);
	
	$div.remove();
};