function SignInManager(client)
{
	var self = this;
	this.client = client;
	this.$signIn = $("#signIn");
	this.$signInPanel = $("#signInPanel");
	this.$signInForm = $("#signInForm");
	this.$signInLightboxAnchor = $("#signInLightboxAnchor");
	this.$signInError = this.$signInForm.find(".error");
	this.$signInUsernameInput = this.$signInForm.find(":input[name='Username']");
	this.$signInPasswordInput = this.$signInForm.find(":input[name='Password']");
	this.$createNewCharacterButton = this.$signInPanel.find(".createNewCharacter button");
	this.$classGroups = $(".classGroup");
	//this.$createCharacterCreation = $("#createCharacterCompletion");
	this.$createNewCharacterForm = $("#createNewCharacter");

	this.$raceOptions = $("#createNewCharacter input[name='Race']");
	this.$genderOptions = $("#createNewCharacter input[name='Gender']");
	this.$classOptions = $("#createNewCharacter input[name='Class']");
	this.$createNewCharacterUsernameInput = this.$createNewCharacterForm.find("input[name='Username']");
	this.$createNewCharacterPasswordInput = this.$createNewCharacterForm.find("input[name='Password']");
	this.$createNewCharacterPasswordConfirmationInput = this.$createNewCharacterForm.find("input[name='PasswordConfirmation']");
	this.$createNewCharacterEmailAddressInput = this.$createNewCharacterForm.find("input[name='Email']");
	this.$createNewCharacterEmailConfirmationInput = this.$createNewCharacterForm.find("input[name='EmailConfirmation']");
	this.$createNewCharacterErrors = $("#createNewCharacterErrors");
	this.$backToSignInButton = $("#backToSignInButton");

	this.hasUserCreationDetails = false;
	this.maxUsernameLength = null;
	this.minUsernameLength = null;

	this.maxPasswordLength = null;
	this.minPasswordLength = null;

	this.$backToSignInButton.on("click", function(e) {

		e.preventDefault();
		self.clearRegistrationForm();

		self.displayPanel("signInPanel");
	});

	this.$createNewCharacterForm.on("submit", function(e) {

		e.preventDefault();
		var errors = [];

		if(self.$createNewCharacterUsernameInput.val() == "") {
			errors.push("Username is empty.");
		}
		else if(self.$createNewCharacterUsernameInput.val().length < self.minUsernameLength) {
			errors.push("Username must be at least " + self.minUsernameLength + " characters long.");
		}
		else if(self.$createNewCharacterUsernameInput.val().length > self.maxUsernameLength) {
			errors.push("Username can be no longer than " + self.maxUsernameLength + " characters long.");
		}

		if(self.$createNewCharacterPasswordInput.val() == "") {
			errors.push("Password is empty.");
		}
		else if(self.$createNewCharacterPasswordInput.val().length > self.maxPasswordLength) {
			errors.push("Password can be no longer than " + self.maxPasswordLength + " characters long.");
		}
		else if(self.$createNewCharacterPasswordInput.val().length < self.minPasswordLength) {
			errors.push("Password must be at least " + self.minPasswordLength + " characters long.");
		}
		else if(self.$createNewCharacterPasswordInput.val() != self.$createNewCharacterPasswordConfirmationInput.val()) {
			errors.push("Password fields do not match.");
		}

		if(self.$createNewCharacterUsernameInput.val() != "" && self.$createNewCharacterPasswordInput.val() != "" && self.$createNewCharacterUsernameInput.val().toLowerCase() == self.$createNewCharacterPasswordInput.val().toLowerCase()) {
			errors.push("Your password must not be the same as your username.");
		}

		if(self.$createNewCharacterEmailAddressInput.val() == "") {
			errors.push("Email address is empty.");
		}

		if(self.$createNewCharacterEmailAddressInput.val() != self.$createNewCharacterEmailConfirmationInput.val()) {
			errors.push("Email address fields do not match.");
		}

		var $selectedGenderOption = self.$genderOptions.filter(":checked");
		if($selectedGenderOption.length == 0) {
			errors.push("Please select a gender.");
		}

		var $selectedRaceOption = self.$raceOptions.filter(":checked");
		if($selectedRaceOption.length == 0) {
			errors.push("Please select a race.");
		}

		var $selectedClassOption = self.$classOptions.filter(":checked");
		if($selectedClassOption.length == 0) {
			errors.push("Please select a class.");
		}

		if(errors.length > 0) {
			self.showCreateNewCharacterErrors(errors);
		}
		else {

			var command = {

				method: "User Creation",
				username: self.$createNewCharacterUsernameInput.val(),
				password: self.$createNewCharacterPasswordInput.val(),
				emailAddress: self.$createNewCharacterEmailAddressInput.val(),
				genderValue: parseInt($selectedGenderOption.val()),
				raceValue: parseInt($selectedRaceOption.val()),
				classValue: parseInt($selectedClassOption.val())
			};

			client.sendCommand(command);
		}
	});

	this.$raceOptions.on("change", function(e) {

		self.$classGroups.addClass("hidden");
		self.$classGroups.filter("[data-race='" + $(this).val() + "']").removeClass("hidden");

		self.$classOptions.filter(":checked").prop("checked", false);
	});

	this.$createNewCharacterButton.on("click", function(e) {

		if(self.hasUserCreationDetails)
			self.showRegistrationPanel();
		else
		{
			var command = {
				method: "User Creation Details"
			};

			self.client.sendCommand(command);
		}
	});

	this.$signInLightboxAnchor.fancybox({
		padding: 0,
		margin: 0,
		onComplete: function()
		{
			self.$signInUsernameInput.val("");
			self.$signInPasswordInput.val("");

			self.$signInUsernameInput.focus();

			self.clearRegistrationForm();
			self.displayPanel("signInPanel");

		},
		onCleanup: function()
		{
			$("#inputWindow").focus();
		}
	});

	this.$signInForm.on("submit", function(e) {

		e.preventDefault();
		var username = self.$signInUsernameInput.val();
		var password = self.$signInPasswordInput.val();

		if(username == null || username.length == 0) {
			self.showSignInError("You did not enter a username.");
			return;
		}

		if(password == null || password.length == 0) {
			self.showSignInError("You did not enter a password.");
			return;
		}

		self.hideSignInError();

		var message = {
			method: "Sign In",
			username: username,
			password: password
		};

		self.client.sendCommand(message);
	});
}

SignInManager.prototype.isVisible = function() {
    return $('#fancybox-wrap').is(':visible');
};

SignInManager.prototype.showRegistrationPanel = function()
{
	this.displayPanel("registrationPanel");
};

SignInManager.prototype.handleUserCreationDetailsMessage = function(message)
{
	this.maxUsernameLength = message.maxUsernameLength;
	this.minUsernameLength = message.minUsernameLength;
	this.maxPasswordLength = message.maxPasswordLength;
	this.minPasswordLength = message.minPasswordLength;

	this.$createNewCharacterUsernameInput.attr("maxlength", this.maxUsernameLength);
	this.$createNewCharacterPasswordInput.attr("maxlength", this.maxPasswordLength);
	this.$createNewCharacterPasswordConfirmationInput.attr("maxlength", this.maxPasswordLength);

	this.hasUserCreationDetails = true;

	this.showRegistrationPanel();
};

SignInManager.prototype.showSignInError = function(message)
{

	this.$signInError.text(message).removeClass("hidden");
};

SignInManager.prototype.hideSignInError = function()
{

	this.$signInError.text("").addClass("hidden");
};

SignInManager.prototype.showCreateNewCharacterErrors = function(errors)
{
	this.$createNewCharacterErrors.html("");

	for(var index in errors)
	{
		var $li = $("<li></li>");
		$li.text(errors[ index ]);
		this.$createNewCharacterErrors.append($li);
	}

	this.$createNewCharacterErrors.removeClass("hidden");
	this.$signIn.scrollTop(0);
};

SignInManager.prototype.hideCreateNewCharacterErrors = function()
{
	this.$createNewCharacterErrors.html("").addClass("hidden");
};

SignInManager.prototype.handleSignInResponse = function(message)
{

	if(message.error != null && message.error.length != 0)
	{
		this.showSignInError(message.error);
		return;
	}

	if(!message.error)
	{
		this.close();
	}
};

SignInManager.prototype.close = function()
{
	$.fancybox.close();
};

SignInManager.prototype.display = function()
{
	$("#signInLightboxAnchor").click();
};

SignInManager.prototype.displayPanel = function(panelId)
{
	this.$signIn.children().addClass("hidden");
	$("#" + panelId).removeClass("hidden");
	$.fancybox.resize();
};

SignInManager.prototype.handleUserCreationMessage = function(message)
{
	if(message.errors)
	{
		this.showCreateNewCharacterErrors(message.errors);
		return;
	}

	this.close();
};

SignInManager.prototype.clearRegistrationForm = function()
{
	$("#createNewCharacter input[type='text'], #createNewCharacter input[type='password']").val("");
	$("#createNewCharacter input[type='radio']").prop("checked", false);

	this.hideCreateNewCharacterErrors();
};