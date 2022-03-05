function GameConsole()
{
	var self = this;

	//The div in the output window that is currently being written to. This will be reset any time a newline is found.
	this.$lastOutputDiv = null;

	//Holds the font style status of the output window. This changes when new telnet color codes come in.
	this.currentStyle = this.writeStyle = {

		colorCode: null,
		isBold: false,
		spanIsOpen: function()
		{
			return this.colorCode != null || this.isBold;
		}
	};

	this.$outputWindow = $("#outputWindow");
	this.$outputWindowWrapper = $("#outputWindowWrapper");
	this.$outputWindowMargin = $("#outputWindowMargin");
	this.$outputWindowBottomInner = $("#outputWindowBottomInner");
	this.$outputWindowBottom = $("#outputWindowBottom");
	this.$outputWindowBottomSeparator = $("#outputWindowBottomSeparator");
	this.$spacerDiv = null;
	this.outputLines = [];
	this.visibleLines = [];
	this.visibleSplitScreenLines = [];
	this.maxVisibleSplitScreenLines = 100;
	this.lineHeight = null;
	this.colorCodeRegex = /\x1B\[(\d+)m/g;
	this.MAX_OUTPUT_WINDOW_LINES = 10000;
	this.prevScrollTop = 0;
	this.prevOffsetHeight = 0;
	this.disableSplitting = false;
	this.draggingSeparator = {
		inProgress: false,
		startY: null,
		outputWindowMarginStartHeight: null,
		outputWindowBottomStartHeight: null
	};
	this.colorMap = {
		 0: [null, null],         //Normal
		31: ["800000", "ff0000"], //Red
		32: ["00b300", "00ff00"], //Green
		33: ["808000", "ffff00"], //Yellow
		34: ["000080", "0000ff"], //Blue
		35: ["800080", "ff00ff"], //Magenta
		36: ["008080", "00ffff"], //Cyan
		37: ["ffffff", "ffffff"]  //White
	};

	this.calculateLineHeight();
	//this.setupOutputWindow();
	this.createNewLine();

	let onLowerConsoleScroll = function(e) {
		e.preventDefault();
		self.$outputWindowMargin[0].scrollTop += e.deltaY;
	};

	$(window).on('resize', function() {
		// Resize the upper and lower output window sizes as well.
		let newTotalHeight = self.$outputWindowWrapper.height();
		let oldUpperHeight = self.$outputWindowMargin.height();
		let oldLowerHeight = self.$outputWindowBottom.height();
		let oldTotalHeight = oldUpperHeight + oldLowerHeight;

		let upperPercentage = oldUpperHeight / oldTotalHeight;
		let newUpperHeight = newTotalHeight * upperPercentage;
		let newLowerHeight = newTotalHeight - newUpperHeight;

		self.$outputWindowMargin.height(newUpperHeight);
		self.$outputWindowBottom.height(newLowerHeight);
	});
	
	this.$outputWindowBottom.get(0).addEventListener("mousewheel", onLowerConsoleScroll);
	this.$outputWindowBottom.get(0).addEventListener("wheel", onLowerConsoleScroll);

	this.$outputWindowBottomSeparator.on("mousedown", function(e) {
		e.preventDefault();
		self.draggingSeparator.inProgress = true;
		self.draggingSeparator.startY = e.clientY;
		self.draggingSeparator.outputWindowMarginStartHeight = self.$outputWindowMargin.height();
		self.draggingSeparator.outputWindowBottomStartHeight = self.$outputWindowBottom.height();
	});

	$(document).on("mouseup", function(e) {
		e.preventDefault();
		self.draggingSeparator.inProgress = false;
		self.draggingSeparator.startY = null;
		self.draggingSeparator.outputWindowMarginStartHeight = null;
		self.draggingSeparator.outputWindowBottomStartHeight = null;
	});

	$(document).on("mousemove", function(e) {
		if(self.draggingSeparator.inProgress) {
			e.preventDefault();
			let mouseOffsetY = e.clientY - self.draggingSeparator.startY;
			
			let newMarginHeight = self.draggingSeparator.outputWindowMarginStartHeight + mouseOffsetY;
			self.$outputWindowMargin.height(newMarginHeight);

			let newBottomHeight = self.draggingSeparator.outputWindowBottomStartHeight - mouseOffsetY;
			self.$outputWindowBottom.height(newBottomHeight);
		}
	})

	this.$outputWindowBottomSeparator.on("mousein", function(e) {
		e.preventDefault();
	});

	this.$outputWindowWrapper.on("mousedown", function(e)
	{
		var $this = $(this);
		if($this.hasClass("split")) {

			if(e.which == 2) {
				e.preventDefault();
				$this.removeClass("split");
				self.$outputWindowMargin[0].scrollTop = self.$outputWindowMargin[0].scrollHeight + 10000;
			}
		}
	});

	this.$outputWindowWrapper.on("mousewheel DOMMouseScroll", function(e)
	{
		var delta = 0;

		if (e.type == 'mousewheel') {
			delta = (e.originalEvent.wheelDelta * -1);
		}
		else if (e.type == 'DOMMouseScroll') {
			delta = 40 * e.originalEvent.detail;
		}

//		console.log("DELTA: " + delta);

		if(delta < 0)
			return;

//		console.log("SCROLL TOP: " + self.$outputWindowMargin.prop("scrollTop"));
//		console.log("OFFSET HEIGHT: " + self.$outputWindowMargin.prop("offsetHeight"));
//		console.log("SCROLL HEIGHT: " + self.$outputWindowMargin.prop("scrollHeight"));

		if(self.$outputWindowWrapper.hasClass("split") && self.$outputWindowMargin.prop("scrollTop") + self.$outputWindowMargin.prop("offsetHeight") + 10 >= self.$outputWindowMargin.prop("scrollHeight")) {
			self.$outputWindowWrapper.removeClass("split");
			self.setupDisableSplitting();
		}
	});

	this.$outputWindowMargin.on("scroll", function(e)
	{
		var scrollDifference = Math.abs(this.scrollTop - (this.scrollHeight - this.offsetHeight));

		var delta = 0;
		var scrollDelta = this.scrollTop - self.prevScrollTop;

		if(this.offsetHeight != self.prevOffsetHeight)
			scrollDelta = 0;

		self.prevScrollTop = this.scrollTop;
		self.prevOffsetHeight = this.offsetHeight;

		if(!self.$outputWindowWrapper.hasClass("split")) {

			if(scrollDifference != 0 && scrollDelta < 0) {
				if(!self.disableSplitting) {
					self.$outputWindowWrapper.addClass("split");
				}
			}
		}

		//self.rerender();
	});
}

GameConsole.prototype.setupDisableSplitting = function()
{
	this.disableSplitting = true;
	var self = this;
	setTimeout(function() {
		self.disableSplitting = false;
	}, 100);
}

GameConsole.prototype.setupOutputWindow = function()
{
	this.$spacerDiv = $("<div class='spacer'></div>").height(0);
	this.$outputWindow.append(this.$spacerDiv);
};

GameConsole.prototype.cacheLastOutputDiv = function()
{
	this.outputLines[ this.outputLines.length - 1 ] = this.$lastOutputDiv.eq(0).html();
};

GameConsole.prototype.createNewLine = function()
{
	this.$lastOutputDiv = $("<div></div><div></div>");
	this.outputLines.push("");
	this.$outputWindow.append( this.$lastOutputDiv.eq(0) );
	this.$outputWindowBottomInner.append(this.$lastOutputDiv.eq(1));

	this.visibleSplitScreenLines.push(this.$lastOutputDiv.eq(1));

	var splitScreenLinesToRemove = this.visibleSplitScreenLines.length - this.maxVisibleSplitScreenLines;

	if(splitScreenLinesToRemove > 0)
	{
		this.visibleSplitScreenLines.splice(0, splitScreenLinesToRemove).forEach(function($splitScreenDiv) {
			$splitScreenDiv.remove();
		});
	}

	//Open a span for the current color, if one exists.
	if(this.writeStyle.spanIsOpen())
	{
		this.$lastOutputDiv.append(this.createColorSpan(this.currentStyle.colorCode, this.currentStyle.isBold));
		this.cacheLastOutputDiv();
	}

	this.visibleLines.push(this.$lastOutputDiv.eq(0));

	if(this.visibleLines.length > this.MAX_OUTPUT_WINDOW_LINES) {
		this.visibleLines[0].remove();
		this.visibleLines.splice(0, 1);
	}

	//this.resize();
	return this.$lastOutputDiv;
};

GameConsole.prototype.getVisibleRange = function()
{
	var outputWindowMargin = this.$outputWindowMargin[0];
	var scrollTop = outputWindowMargin.scrollTop;
	var scrollBottom = outputWindowMargin.scrollTop + outputWindowMargin.offsetHeight;

	return {
		lineTop: Math.max(0, Math.floor(scrollTop / this.lineHeight)),
		lineBottom:  Math.min(this.outputLines.length - 1, Math.floor(scrollBottom / this.lineHeight))
	};
};

GameConsole.prototype.rerender = function()
{
	var visibleRange = this.getVisibleRange();
	this.$spacerDiv.remove();
	this.$outputWindow.html("").append(this.$spacerDiv);
	this.$spacerDiv.height((visibleRange.lineTop * this.lineHeight) + 4);

	this.visibleLines.length = 0;

	for(var index = visibleRange.lineTop;index <= visibleRange.lineBottom;++index)
	{
		var $div = $("<div></div>");
		$div.html(this.outputLines[index]);

		this.$outputWindow.append($div);
		this.visibleLines.push($div);
	}

	//this.$lastOutputDiv = $(this.outputLines[this.outputLines.length - 1], this.visibleSplitScreenLines[ this.visibleSplitScreenLines.length - 1 ]);
};

GameConsole.prototype.resize = function()
{
	this.$outputWindow.height((this.outputLines.length) * this.lineHeight);
};

GameConsole.prototype.appendLines = function(outputReceived, lineIsTerminated)
{
	var outputReceivedLength = outputReceived.length, self = this;
	outputReceived.forEach(function(line, index) {
		self.append(line, index != outputReceivedLength - 1);
	});
};

GameConsole.prototype.isWindowSplit = function()
{//TODO: This can be cached in boolean.
	return this.$outputWindowWrapper.hasClass("split");
};

GameConsole.prototype.append = function(outputReceived, lineIsTerminated)
{
	if(outputReceived.lineComponents !== undefined)
	{
		var self = this, lineComponentsLength = outputReceived.lineComponents.length;
		outputReceived.lineComponents.forEach(function(component, index) {

			self.append(component, lineIsTerminated && index == lineComponentsLength - 1);
		});

		return;
	}
	else if(Array.isArray(outputReceived))
	{
		var operation = outputReceived[0];
		var value = outputReceived[1];

		if(operation === "lastspan")
		{
			var $lastSpan = this.$lastOutputDiv.children("span:last-child");

			if($lastSpan.length > 0)
				$lastSpan.append(value);
			else //We couldn't find the span. That's certainly not good!
				this.$lastOutputDiv.append(value);
		}
		else if(operation === "append")
			this.$lastOutputDiv.append(value);
		else if(operation === "openspan")
		{
			this.writeStyle.colorCode = value.colorCode;
			this.writeStyle.isBold = value.isBold;
		}
		else if(operation === "closespan")
		{
			this.writeStyle.colorCode = null;
			this.writeStyle.isBold = false;
		}
	}
	else
		this.$lastOutputDiv.append(outputReceived);

	this.cacheLastOutputDiv();

	if(lineIsTerminated)//A newline has been found. Terminate this line by beginning the next one.
		this.createNewLine();

	if (!this.isWindowSplit())
	{
		var outputWindowMargin = document.getElementById("outputWindowMargin");
		outputWindowMargin.scrollTop = outputWindow.scrollHeight;
	}
};

GameConsole.prototype.processOutput = function(output)
{
	this.appendLines(this.formatMUDOutputForWindow(output));
};

GameConsole.prototype.calculateLineHeight = function()
{
	var $tempDiv = $("<div></div>");
	this.$outputWindow.append($tempDiv);

	this.lineHeight = $tempDiv.height();

	$tempDiv.remove();
};

GameConsole.prototype.createColorSpan = function(colorCode, isBold)
{
	var styleString = "color: " + (this.colorMap[colorCode][ isBold ? 1 : 0 ]) + ";";
	return $("<span style='" + styleString + "'></span>");
};

GameConsole.prototype.formatMUDOutputForWindow = function(outputReceived)
{
	var self = this;
	return outputReceived   .replace(/(\r)/gm, "")
							.replace(/&/g, "&amp;")
							.replace(/</g, "&lt;")
							.replace(/>/g, "&gt;")
							.replace(/'/g, "&apos;")
							.replace(/"/g, "&quot;")
							.split("\n")
							.map(function(line)
	{
		var lastIndex = 0;
		var lineData = {lineComponents: []};

		for( ;(matches = self.colorCodeRegex.exec(line)) != null; lastIndex = matches.index + matches[0].length)
		{
			var colorCode = parseInt(matches[1]), outputPriorToColor = line.substr(lastIndex, matches.index - lastIndex);

			//First, append output prior to the color code to the buffer.
			if(outputPriorToColor.length > 0)
			{
				if(self.currentStyle.spanIsOpen())
					lineData.lineComponents.push(["lastspan", outputPriorToColor]);
				else
					lineData.lineComponents.push(["append", outputPriorToColor]);
			}

			if(colorCode == 1)
				self.currentStyle.isBold = true;
			else if(self.colorMap.hasOwnProperty(colorCode) && self.colorMap[colorCode][0] != null)
				self.currentStyle.colorCode = colorCode;
			else {//Revert to "normal" color.
				self.currentStyle.colorCode = null;
				self.currentStyle.isBold = false;
				lineData.lineComponents.push(["closespan", null]);
				continue;//And we are done, since do not need to open another tag.
			}

			//Add the new span tag.
			lineData.lineComponents.push(["closespan", null]);
			lineData.lineComponents.push(["openspan", {colorCode: self.currentStyle.colorCode == null ? 37 : self.currentStyle.colorCode, isBold: self.currentStyle.isBold}]);
			lineData.lineComponents.push(["append", self.createColorSpan(self.currentStyle.colorCode == null ? 37 : self.currentStyle.colorCode, self.currentStyle.isBold)]);
		}

		//Copy the remainder into the buffer.
		lineData.lineComponents.push([self.currentStyle.spanIsOpen() ? "lastspan" : "append", line.substr(lastIndex)]);

		return lineData;
	});
};
