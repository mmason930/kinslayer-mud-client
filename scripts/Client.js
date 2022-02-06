if(!isDev()) {
	window.onbeforeunload = function()
	{ 
		return "The MUD client is still running!";
	}
}

var socket;
var client = {};
var keyboardManager = null;
var signInManager = null;
var gameConsole = null;
var commandHistory = [];
var commandHistoryPosition = 0;
var onlineTimeInterval = setInterval(updateOnlineTime, 1000);
var wsProtocol = location.protocol === 'https:' ? 'wss://' : 'ws://';

String.prototype.trim = function() {
	return this.replace(/^\s+|\s+$/g,"");
};
String.prototype.ltrim = function() {
	return this.replace(/^\s+/,"");
};
String.prototype.rtrim = function() {
	return this.replace(/\s+$/,"");
};

function isDev() {
	return document.location.href.indexOf("kinslayermud.org") == -1;
}

function zeroFill( number, width )
{
	width -= number.toString().length;
	if ( width > 0 )
		return new Array( width + (/\./.test( number ) ? 2 : 1) ).join( '0' ) + number;
	return number + "";
}

function updateOnlineTime() {

	if(!client.connected || client.connectedDatetime == null)
		return;

	var secondsDifference = parseInt(((new Date()).getTime() - client.connectedDatetime.getTime()) / 1000);

	var seconds = zeroFill(parseInt(secondsDifference % 60), 2);
	var minutes = zeroFill(parseInt((secondsDifference / 60) % 60), 2);
	var hours  = zeroFill(parseInt(secondsDifference / 60 / 60), 2);

	$("#connectionBox").text(hours + ":" + minutes + ":" + seconds);
}

function setSelectionRange(input, selectionStart, selectionEnd) {
	if (input.setSelectionRange) {
		input.focus();
		input.setSelectionRange(selectionStart, selectionEnd);
	}
	else if (input.createTextRange) {
		var range = input.createTextRange();
		range.collapse(true);
		range.moveEnd('character', selectionEnd);
		range.moveStart('character', selectionStart);
		range.select();
	}
}

function setCaretToPos (input, pos) {
	setSelectionRange(input, pos, pos);
}

$(document).ready(function() {

	goog_report_conversion();

	signInManager = new SignInManager(client);
	keyboardManager = new KeyboardManager();
	gameConsole = new GameConsole();
	client.macroManager = new MacroManager(client);
	client.currentFeaturedMudListingId = null;
	client.inputParsingOn = true;
	client.$parseIcon = $("#parseIcon");
	client.$inputWindow = $("#inputWindow");
	client.$connectionBox = $("#connectionBox");
	client.$macroKey = $("#macroKey");
	client.$featuredMud = $("#featuredMud");
	client.INPUT_DELIMITER = ';';

	client.$parseIcon.on("click", function(e) {

		e.preventDefault();

		client.inputParsingOn = !client.inputParsingOn;

		client.$parseIcon.toggleClass("off");
	});

	client.getNextFeaturedMudListing = function() {

		if(isDev())
			return;

		$.ajax({
			type: "GET",
			url: '/get-next-featured-mud-listing/' + (client.currentFeaturedMudListingId == null ? 0 : client.currentFeaturedMudListingId),
			dataType: 'json',
			success: function( response ) {
			
				if(response != null) {
				
					client.currentFeaturedMudListingId = response.id;
					var $anchor = client.$featuredMud.find("a");
					var $img = $anchor.find("img");
					
					$anchor.attr('href', response.websiteUrl);
					$img.attr('src', response.imageUrl);
					$anchor.show();
				}
			}
		});
	};

	client.featuredMudListingIntervalId = setInterval("client.getNextFeaturedMudListing()", 60000);
	client.getNextFeaturedMudListing();

	client.$inputWindow.select();
	if(typeof WebSocket == "undefined") {
	
		alert("This client is not supported by your browser. Please update to a modern browser.");
		return;
	}
	
	$("body").on("keydown", function(event) {
		
		if(client.$macroKey.is(':focus')) {
		
			event.preventDefault();
			$("#macroKey").val(event.which);
			return;
		}

		if(client.macroManager.processMacro(event.which)) {
			event.preventDefault();
			return;
		}

		if($(document.activeElement).is(":input") || client.fancyboxIsVisible()) {
			return;
		}

		if(!client.$inputWindow.is(":focus") && event.which != 17 && !keyboardManager.isKeyDown(17)) {
			client.$inputWindow.focus();
		}

	});
	
	client.connected = false;
	client.connectedDatetime = null;
	client.reconnectOnClose = false;
	client.inputBuffer = "";
	client.cursor = { pageX: 0, pageY: 0 };

	client.fancyboxIsVisible = function()
	{
		return $("#fancybox-content").is(":visible");
	};

	client.createWebSocket = function()
	{
		var protocol = "mud-protocol";

		if(!isDev()) {
			socket = new WebSocket(wsProtocol + "kinslayermud.org/wskinslayer", protocol);
		}
		else {
			socket = new WebSocket(wsProtocol + "localhost/wskinslayer", protocol);
		}

		socket.onopen = function()
		{
			client.connected = true;
			client.connectedDatetime = new Date();
			client.reconnectOnClose = false;
			client.inputBuffer = "";
			$("#connectionBox").css("background", "#00FF00");
			
			$("#connectDisconnectButton").text("Disconnect");
		};
		socket.onclose = function()
		{
			client.connected = false;
			client.connectedDatetime = null;
			client.$connectionBox.text("Not Connected");
			$("#connectionBox").css("background", "#FF0000");
			
			if(client.reconnectOnClose)
			{
				client.createWebSocket();
			}
			
			$("#connectDisconnectButton").text("Connect");
		};
		socket.onmessage = function(msg)
		{
			client.inputBuffer += msg.data;

			//TODO: This needs reworking. Packets should begin with the number of characters at the start.
			//And proceed until that number of characters has been reached.
			while(true)
			{
				var commandEndIndex = client.inputBuffer.indexOf(String.fromCharCode(0x06));
				
				if(commandEndIndex == -1)
					break;
				
				var commandObject = JSON.parse(client.inputBuffer.substr(0, commandEndIndex));
				client.inputBuffer = client.inputBuffer.substr(commandEndIndex + 1);
				
				client.processCommand(commandObject);
			}
		}
	};
	
	client.createWebSocket();

    signInManager.display();
	
	client.processCommand = function(commandObject)
	{
		if(!commandObject.method)
			return;
		
		//TODO: Use a map here.
		if(commandObject.method == "Output")
		{
			gameConsole.processOutput(commandObject.data);
		}
		else if(commandObject.method == "Save User Macro")
		{
			client.macroManager.processSaveMacroResponse(commandObject.userMacroId, commandObject.keyCode, commandObject.replacement, commandObject.wasSuccessful);
		}
		else if(commandObject.method == "Username")
		{
			$("#usernameValue").text(commandObject.username);
			client.macroManager.loadMacros(commandObject.macros);
		}
		else if(commandObject.method == "Sign In")
		{
			signInManager.handleSignInResponse(commandObject);
		}
		else if(commandObject.method == "Players Online")
		{
			$("#totalPlayersValue").text(commandObject.numberOfPlayers);
			$("#levelValue").text(commandObject.level);
			$("#expToLevelValue").text(commandObject.expToLevel);
			
			$("#weavePointsValue").text(commandObject.weavePoints);
			$("#hitPointsValue").text(commandObject.hitPoints + "/" + commandObject.maxHitPoints);
			$("#movePointsValue").text(commandObject.movePoints + "/" + commandObject.maxMovePoints);
			$("#spellPointsValue").text(commandObject.spellPoints + "/" + commandObject.maxSpellPoints);
			$("#offensiveValue").text(commandObject.offensive);
			$("#dodgeValue").text(commandObject.dodge);
			$("#parryValue").text(commandObject.parry);
			$("#absorbValue").text(commandObject.asbsorb);
		}
		else if(commandObject.method == "User Creation Details")
		{
			signInManager.handleUserCreationDetailsMessage(commandObject);
		}
		else if(commandObject.method == "User Creation")
		{
			signInManager.handleUserCreationMessage(commandObject);
		}
		else if(commandObject.method == "Display Sign In Lightbox")
		{
            if(!signInManager.isVisible()) {
                signInManager.display();
            }
            var signInButton = document.getElementById('signInSubmitButton');
            signInButton.disabled = false;
            signInButton.innerText = "Sign In";
            var createNewCharacterButton = document.getElementById('createNewCharacterButton');
            createNewCharacterButton.disabled = false;
            createNewCharacterButton.innerText = "Create New Character";
		}
	};
	
	client.sendCommand = function(commandObject)
	{
		socket.send(JSON.stringify(commandObject) + String.fromCharCode(0x06));
	};

	client.submitInputCommand = function(command) {
	
		var inputCommandObject = {};
		inputCommandObject.method = "Input";
		inputCommandObject.data = command;
		this.sendCommand(inputCommandObject);

		var $span = $("<span class='inputCommand'></span>");
		$span.text(command);
		gameConsole.append($span, true);
	};

	client.$inputWindow.on("keypress", function(event) {
	
		if(event.which == 13)
		{//Enter key pressed
			
			var input = $('#inputWindow').val();
			$("#inputWindow").select();

			var inputUpToLeadingDelimiter = null;

			if(client.inputParsingOn && input.search(/^ *;/g) != -1)
			{//Strip off the start of the command, up to the first ';'. We will pad it on later.
				var firstSemicolonIndex = input.indexOf(client.INPUT_DELIMITER);
				inputUpToLeadingDelimiter = input.substr(0, firstSemicolonIndex + 1);
				input = input.substr(firstSemicolonIndex + 1);
			}

			(client.inputParsingOn ? input.split(client.INPUT_DELIMITER) : [input]).forEach(function(inputCommand, index, array) {

				if(index === 0 && inputUpToLeadingDelimiter !== null)
					inputCommand = inputUpToLeadingDelimiter + inputCommand;
				client.submitInputCommand(inputCommand);
			});

			event.preventDefault();
			
			//We want the raw input pushed here, not anything that came after parsing delimitors.
			commandHistory.push( input );//TODO: Add buffer size limitation
			commandHistoryPosition = commandHistory.length;
		}
	});
	
	client.$inputWindow.on("keydown", function(event) {
	
		if(event.which == 38) {//Up
		
			if(client.macroManager.getMacro(event.which) != null)
				return;
		
			if(commandHistoryPosition != 0) {//Can we scroll up any further?
				commandHistoryPosition -= 1;
				client.$inputWindow.val( commandHistory[ commandHistoryPosition ] );
				
				setCaretToPos( client.$inputWindow.get(0), commandHistory[ commandHistoryPosition ].length );
			}
			
			return false;
		}
		else if(event.which == 40) {//Down
		
			if(client.macroManager.getMacro(event.which) != null)
				return;
				
			if(commandHistoryPosition != commandHistory.length) {//Can we scroll down any further?

				commandHistoryPosition += 1;
				client.$inputWindow.val( commandHistory[ commandHistoryPosition ] );
				setCaretToPos( client.$inputWindow.get(0), commandHistoryPosition == commandHistory.length ? "" : commandHistory[ commandHistoryPosition ].length );
			}
			else {//If not, clear the prompt.
			
				$("#inputWindow").val("");
			}
			
			return false;
		}
	});
	
	$("#connectDisconnectButton").on("click", function(event) {
	
		event.preventDefault();
		if(client.connected)
		{
			//client.reconnectOnClose = true;
			socket.close();
		}
		else
			client.createWebSocket();
	});
});
