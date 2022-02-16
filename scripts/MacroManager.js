function MacroManager(client)
{
	let self = this;
	this.client = client;
	this.macroSaveId = null;
	this.$macroNewButton = $("#macroNewButton");
	this.$macroDeleteButton = $("#macroDeleteButton");
	this.$macroSaveButton = $("#macroSaveButton");
	this.$macroContainer = $("#macroContainer");
	this.$macroKey = $("#macroKey");
	this.$macroLocation = $("#macroLocation");
	this.$macroCode = $("#macroCode");
	this.$macroReplacement = $("#macroReplacement");
	this.$macroId = $("#macroId");
	this.macros = {};

	this.locationMap = {
		0: {
			constant: "DOM_KEY_LOCATION_STANDARD",
			display: "Standard"
		},

		1: {
			constant: "DOM_KEY_LOCATION_LEFT",
			display: "Left"
		},

		2: {
			constant: "DOM_KEY_LOCATION_RIGHT",
			display: "Right"
		},

		3: {
			constant: "DOM_KEY_LOCATION_NUMPAD",
			display: "Numpad"
		},

		4: {
			constant: "DOM_KEY_LOCATION_MOBILE",
			display: "Mobile"
		},

		5: {
			constant: "DOM_KEY_LOCATION_JOYSTICK",
			display: "Joystick"
		}
	};
	
	this.$macroNewButton.on("click", function(e) {

		e.preventDefault();
		
		let $newMacroAnchor = self.getMacroAnchorByKeyCode(null, null);
		if($newMacroAnchor.length == 0)
			self.addUserMacroHtml(null, null, null, null, null, true);
		else
			$newMacroAnchor.click();
		
		self.$macroKey.focus();
	});

	this.$macroDeleteButton.on("click", function(e) {

		e.preventDefault();
		let keyCode = parseInt(self.$macroKey.val());
		let location = self.$macroLocation.val() == '' ? null : parseInt(self.$macroLocation.val());

		if(keyCode >= 0 && !isNaN(keyCode))
		{
			let $anchor = self.$macroContainer.find("a.active");

			let command = {
				method:		"Delete User Macro",
				location:	location,
				keyCode:	keyCode
			};

			self.client.sendCommand(command);
			$anchor.parent().hide("slow").remove();
			delete self.macros[self.getMacroMapKey(keyCode, location)];
			self.clearMacroEditForm();
			self.disableEditForm();
		}
	});
	
	this.$macroContainer.on("click", "a", function(e) {

		e.preventDefault();
		let $this = $(this);

		self.removeFocusFromActiveMacroAnchor();
		$this.addClass("active");
		self.enableEditForm();

		self.$macroKey.val($this.data("key-code"));
		self.$macroLocation.val($this.data("location"));
		self.$macroCode.val($this.data("code"));
		self.$macroReplacement.val($this.data("replacement"));
		self.$macroId.val($this.data("id"));
	});

	this.$macroSaveButton.on("click", function(e) {

		e.preventDefault();
		if(!self.canSave())
			return;

		let $macroAnchorWithKeyCode = self.getMacroAnchorByKeyCode(
			parseInt(self.$macroKey.val()),
			self.$macroLocation.val() == '' || self.$macroLocation.val() == undefined ? null : parseInt(self.$macroLocation.val())
		);
		if($macroAnchorWithKeyCode.length != 0 && !$macroAnchorWithKeyCode.hasClass("active"))
		{
			alert("There is another macro with this key code already.");
			return;
		}

		let keyCodeValue = self.$macroKey.val();
		let locationValue = self.$macroLocation.val();
		let codeValue = self.$macroCode.val();
		let replacementValue = self.$macroReplacement.val();
		let idValue = self.$macroId.val();

		if(keyCodeValue == undefined || keyCodeValue == "" || isNaN(keyCodeValue)) {
			alert("The macro you are trying to save does not have a valid key set.");
			return;
		}

		// If location is set, it must be a valid integer.
		if(locationValue != undefined && locationValue != "" && isNaN(locationValue)) {
			alert("The macro you are trying to save does not have a valid location set.");
			return;
		}

		if(replacementValue == undefined || replacementValue == "") {
			alert("The macro you are trying to save does not have any replacement text set.");
			return;
		}

		let command = {
			method:			"Save User Macro",
			keyCode:		parseInt(keyCodeValue),
			location:		(locationValue == '' || locationValue == undefined) ? null : parseInt(locationValue),
			code:			(codeValue == undefined ? '' : codeValue),
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
		
			let $anchor = self.$macroContainer.find("a.active");
			if($anchor.length == 0)
				self.disableEditForm();
			else
				self.enableEditForm();
		}
	});
}

MacroManager.prototype.getMacroMapKey = function(keyCode, location) {
	return keyCode + "_" + location;
}

MacroManager.prototype.getLocationDisplay = function(location) {
	let locationData = this.locationMap[location];

	if(locationData == null) {
		return "All";
	}

	return locationData.display;
}

MacroManager.prototype.getMacroDisplay = function(keyCode, location, code) {
	if(code != undefined && code != '') {
		return code;
	}
	let locationDisplay = this.getLocationDisplay(location);
	return keyCode == null ? "<NEW MACRO>" : ("KEY" + keyCode + " (" + locationDisplay + ")");
}

MacroManager.prototype.addUserMacroHtml = function(keyCode, location, code, replacement, id, select) {

	let $a = $("<a></a>");
	$a.text(this.getMacroDisplay(keyCode, location, code));
	$a.attr("href", "#");

	if(replacement != null) {
		$a.data("replacement", replacement);
	}
	if(keyCode != null) {
		$a.data("key-code", keyCode);
	}
	if(location != null) {
		$a.data("location", location);
	}
	if(code != null) {
		$a.data("code", code);
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
	
	let $activeAnchor = this.$macroContainer.find("a.active");

	if($activeAnchor.data("id") == undefined)
		$activeAnchor.remove();
	else
		$activeAnchor.removeClass("active");
};

MacroManager.prototype.clearMacroEditForm = function() {

	this.$macroKey.val("");
	this.$macroLocation.val("");
	this.$macroCode.val("");
	this.$macroReplacement.val("");
	this.$macroId.val("");
};

MacroManager.prototype.getMacroAnchorById = function(id) {
	return this.$macroContainer.find("a").filter(function(index, anchor) { return $(anchor).data("id") == id; })
};

MacroManager.prototype.getMacroAnchorByKeyCode = function(keyCode, location) {
	return this.$macroContainer.find("a").filter(function(index, anchor) {
		return $(anchor).data("key-code") == keyCode && (location == null || $(anchor).data("location") == location);
	})
};

MacroManager.prototype.removeMacroHtml = function(keyCode, location) {
	this.getMacroAnchorByKeyCode(keyCode, location).parent().remove();
};

MacroManager.prototype.processMacro = function(keyCode, location) {
	
	if(this.client.fancyboxIsVisible())
		return false;
	
	let macro = this.getMacro(keyCode, location);
	if(macro != undefined)
	{
		this.client.submitInputCommand(macro);
		return true;
	}
	
	return false;
};

MacroManager.prototype.processSaveMacroResponse = function(id, keyCode, location, code, replacement, wasSuccessful) {

	this.enableEditForm();
	if(wasSuccessful == false) {
		alert("There was an error while saving your macro.");
		return;
	}
	
	let $userMacroAnchor = this.getMacroAnchorById(this.macroSavingId);

	if($userMacroAnchor.length == 0)
	{
		this.addUserMacroHtml(keyCode, location, code, replacement, userMacroId, true);
	}
	else
	{
		delete this.macros[this.getMacroMapKey(keyCode, location)];
		$userMacroAnchor.text(this.getMacroDisplay(keyCode, location, code));
		if($userMacroAnchor.hasClass("active"))
		{
			this.$macroKey.val(keyCode);
			this.$macroLocation.val(location);
			this.$macroCode.val(code);
			this.$macroReplacement.val(replacement);
			this.$macroId.val(id);
		}

		$userMacroAnchor.data("id", id);
		$userMacroAnchor.data("key-code", keyCode);
		$userMacroAnchor.data("location", location);
		$userMacroAnchor.data("code", code);
		$userMacroAnchor.data("replacement", replacement);
	}

	this.macros[this.getMacroMapKey(keyCode, location)] = replacement;
	this.macroSavingId = null;
};

MacroManager.prototype.loadMacros = function(macroArray)
{
	this.$macroContainer.html("");
	this.macros = {};
	let self = this;
	
	macroArray.forEach(function(macro) {
	
		self.macros[ self.getMacroMapKey(macro.keyCode, macro.location) ] = macro.replacement;
		self.addUserMacroHtml(macro.keyCode, macro.location, macro.code, macro.replacement, macro.id);
	});
};

MacroManager.prototype.getMacro = function(keyCode, location)
{
	return this.macros[ this.getMacroMapKey(keyCode, location) ] || this.macros[ this.getMacroMapKey(keyCode, null) ];
};

MacroManager.prototype.disableEditForm = function()
{
	this.$macroKey.attr("disabled", "disabled");
	this.$macroLocation.attr("disabled", "disabled");
	this.$macroCode.attr("disabled", "disabled");
	this.$macroReplacement.attr("disabled", "disabled");
};

MacroManager.prototype.enableEditForm = function()
{
	this.$macroKey.removeAttr("disabled");
	this.$macroLocation.removeAttr("disabled");
	this.$macroCode.removeAttr("disabled");
	this.$macroReplacement.removeAttr("disabled");
};

MacroManager.prototype.canSave = function()
{
	return this.macroSaveId == null && this.$macroContainer.find("a.active").length != 0;
};