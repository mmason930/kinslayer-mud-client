function MacroManager(client)
{
	var self = this;
	this.client = client;
	this.macroSaveId = null;
	this.$macroNewButton = $("#macroNewButton");
	this.$macroDeleteButton = $("#macroDeleteButton");
	this.$macroSaveButton = $("#macroSaveButton");
	this.$macroContainer = $("#macroContainer");
	this.$macroKey = $("#macroKey");
	this.$macroReplacement = $("#macroReplacement");
	this.$macroId = $("#macroId");
	this.macros = {};
	
	this.$macroNewButton.on("click", function(e) {

		e.preventDefault();
		
		var $newMacroAnchor = self.getMacroAnchorByKeyCode(null);
		if($newMacroAnchor.length == 0)
			self.addUserMacroHtml(null, null, null, true);
		else
			$newMacroAnchor.click();
		
		self.$macroKey.focus();
	});

	this.$macroDeleteButton.on("click", function(e) {

		e.preventDefault();
		var keyCode = parseInt(self.$macroKey.val());

		if(keyCode >= 0 && !isNaN(keyCode))
		{
			var $anchor = self.$macroContainer.find("a.active");

			var command = {
				method:		"Delete User Macro",
				keyCode:	keyCode
			};
			
			self.client.sendCommand(command);
			$anchor.parent().hide("slow").remove();
			delete self.macros[keyCode];
			self.clearMacroEditForm();
			self.disableEditForm();
		}
	});
	
	this.$macroContainer.on("click", "a", function(e) {

		e.preventDefault();
		var $this = $(this);

		self.removeFocusFromActiveMacroAnchor();
		$this.addClass("active");
		self.enableEditForm();

		self.$macroKey.val($this.data("key-code"));
		self.$macroReplacement.val($this.data("replacement"));
		self.$macroId.val($this.data("id"));
	});

	this.$macroSaveButton.on("click", function(e) {

		e.preventDefault();
		if(!self.canSave())
			return;

		var $macroAnchorWithKeyCode = self.getMacroAnchorByKeyCode(parseInt(self.$macroKey.val()));
		if($macroAnchorWithKeyCode.length != 0 && !$macroAnchorWithKeyCode.hasClass("active"))
		{
			alert("There is another macro with this key code already.");
			return;
		}

		var keyCodeValue = self.$macroKey.val();
		var replacementValue = self.$macroReplacement.val();
		var idValue = self.$macroId.val();

		if(keyCodeValue == undefined || keyCodeValue == "" || isNaN(keyCodeValue)) {
			alert("The macro you are trying to save does not have a valid key set.");
			return;
		}

		if(replacementValue == undefined || replacementValue == "") {
			alert("The macro you are trying to save does not have any replacement text set.");
			return;
		}

		var command = {
			method:			"Save User Macro",
			keyCode:		parseInt(keyCodeValue),
			replacement:	replacementValue,
			id:				idValue != null && idValue != "" ? parseInt(idValue) : null
		};

		self.macroSavingId = command.id;
		self.client.sendCommand(command);
		self.disableEditForm();
	});

	$("#macroTopNavButton").fancybox({
		padding: 0,
		margin: 0,
		onCleanup: function() {
		
			self.removeFocusFromActiveMacroAnchor();
			self.clearMacroEditForm();
		},
		onComplete: function() {
		
			var $anchor = self.$macroContainer.find("a.active");
			if($anchor.length == 0)
				self.disableEditForm();
			else
				self.enableEditForm();
		}
	});
}

MacroManager.prototype.addUserMacroHtml = function(keyCode, replacement, id, select) {

	var $a = $("<a></a>");
	$a.text(keyCode == null ? "<NEW MACRO>" : ("KEY" + keyCode));
	$a.attr("href", "#");

	if(replacement != null) {
		$a.data("replacement", replacement);
	}
	if(keyCode != null) {
		$a.data("key-code", keyCode);
	}
	if(id != null) {
		$a.data("id", id);
	}

	$div = $("<div></div>");

	$div.append($a);
	this.$macroContainer.append($div);
	
	if(select)
		$a.click();
};

MacroManager.prototype.removeFocusFromActiveMacroAnchor = function() {
	
	var $activeAnchor = this.$macroContainer.find("a.active");

	if($activeAnchor.data("id") == undefined)
		$activeAnchor.remove();
	else
		$activeAnchor.removeClass("active");
};

MacroManager.prototype.clearMacroEditForm = function() {

	this.$macroKey.val("");
	this.$macroReplacement.val("");
	this.$macroId.val("");
};

MacroManager.prototype.getMacroAnchorById = function(id) {
	return this.$macroContainer.find("a").filter(function(index, anchor) { return $(anchor).data("id") == id; })
};

MacroManager.prototype.getMacroAnchorByKeyCode = function(keyCode) {
	return this.$macroContainer.find("a").filter(function(index, anchor) { return $(anchor).data("key-code") == keyCode; })
};

MacroManager.prototype.removeMacroHtml = function(keyCode) {
	this.getMacroAnchorByKeyCode(keyCode).parent().remove();
};

MacroManager.prototype.processMacro = function(keyCode) {
	
	if(this.client.fancyboxIsVisible())
		return false;
	
	var macro = this.macros[String(keyCode)];
	if(macro != undefined)
	{
		this.client.submitInputCommand(macro);
		return true;
	}
	
	return false;
};

MacroManager.prototype.processSaveMacroResponse = function(id, keyCode, replacement, wasSuccessful) {

	this.enableEditForm();
	if(wasSuccessful == false) {
		alert("There was an error while saving your macro.");
		return;
	}
	
	var $userMacroAnchor = this.getMacroAnchorById(this.macroSavingId);

	if($userMacroAnchor.length == 0)
	{
		this.addUserMacroHtml(keyCode, replacement, userMacroId, true);
	}
	else
	{
		delete this.macros[$userMacroAnchor.data("key-code")];
		$userMacroAnchor.text("KEY" + keyCode);
		if($userMacroAnchor.hasClass("active"))
		{
			this.$macroKey.val(keyCode);
			this.$macroReplacement.val(replacement);
			this.$macroId.val(id);
		}

		$userMacroAnchor.data("id", id);
		$userMacroAnchor.data("key-code", keyCode);
		$userMacroAnchor.data("replacement", replacement);
	}

	this.macros[keyCode] = replacement;
	this.macroSavingId = null;
};

MacroManager.prototype.loadMacros = function(macroArray)
{
	this.$macroContainer.html("");
	this.macros = {};
	var self = this;
	
	macroArray.forEach(function(macro) {
	
		self.macros[ macro.keyCode ] = macro.replacement;
		self.addUserMacroHtml(macro.keyCode, macro.replacement, macro.id);
	});
};

MacroManager.prototype.getMacro = function(keyCode)
{
	return this.macros[ String(keyCode) ];
};

MacroManager.prototype.disableEditForm = function()
{
	this.$macroKey.attr("disabled", "disabled");
	this.$macroReplacement.attr("disabled", "disabled");
};

MacroManager.prototype.enableEditForm = function()
{
	this.$macroKey.removeAttr("disabled");
	this.$macroReplacement.removeAttr("disabled");
};

MacroManager.prototype.canSave = function()
{
	return this.macroSaveId == null && this.$macroContainer.find("a.active").length != 0;
};