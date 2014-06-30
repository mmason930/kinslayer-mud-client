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
var commandHistory = [];
var commandHistoryPosition = 0;
var onlineTimeInterval = setInterval(updateOnlineTime, 1000);
var outputBuffer = "";

var outputCurrentStyle =
{
	color: null,
	colorCode: 0,
	lastOutputSpanIdNumber: 0,
	lastOutputSpanTagIsOpen: false,
	bold: false
};

String.prototype.trim = function() {
	return this.replace(/^\s+|\s+$/g,"");
}
String.prototype.ltrim = function() {
	return this.replace(/^\s+/,"");
}
String.prototype.rtrim = function() {
	return this.replace(/\s+$/,"");
}

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

function getNextOutputSpanIdNumber()
{
	return ++outputCurrentStyle.lastOutputSpanIdNumber;
}

function formatMUDOutputForWindow(outputReceived)
{
	outputReceived = outputReceived.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br/>").replace(/(\r\n|\n|\r)/gm, "");
	var regex = /\x1B\[(\d+)m/g
	var matches;
	var outputFinal = "";
	var lastIndex = 0;
	var isFirst = true;
	var lastSpanIdNumber = outputCurrentStyle.lastOutputSpanIdNumber;
	var lastSpanId = "out" + lastSpanIdNumber;

	while( (matches = regex.exec(outputReceived)) != null)
	{
		var colorCode = matches[ 1 ];
		var newColorHexCode = getHexColorCodeFromTelnetColorCode(colorCode);
		var spanId = null;
		
		if(newColorHexCode == null && colorCode != 1 && colorCode != 0) {
//			console.log("Skipping unknown color code `" + colorCode + "`.");
			continue;
		}
		
		if(isFirst && lastSpanIdNumber != 0 && outputCurrentStyle.lastOutputSpanTagIsOpen)
		{
			$("." + lastSpanId).append(outputReceived.substr(lastIndex, matches.index - lastIndex));
		}
		else
		{
			outputFinal += outputReceived.substr(lastIndex, matches.index - lastIndex);
		}
		
		if(outputCurrentStyle.colorCode != 0)
		{
			outputFinal += "</span>";
			outputCurrentStyle.lastOutputSpanTagIsOpen = false;
		}

		if(outputCurrentStyle.bold)
		{
			outputFinal += "</span>";
			isBolded = false;
			outputCurrentStyle.lastOutputSpanTagIsOpen = false;
		}

		if(colorCode != 0 && colorCode != 1)
		{
			spanId = "out" + getNextOutputSpanIdNumber();
			outputFinal += "<span class='" + spanId + "' style='color: " + newColorHexCode + ";'>"
			if(outputCurrentStyle.bold)
			{
				spanId = "out" + getNextOutputSpanIdNumber();
				outputFinal += "<span class='" + spanId + "' style='font-weight:bold;'>";
			}
			outputCurrentStyle.lastOutputSpanTagIsOpen = true;
		}
		else if(colorCode == 1)
		{
			spanId = "out" + getNextOutputSpanIdNumber();
			outputFinal += "<span class='" + spanId + "' style='font-weight:bold;'>";
			outputCurrentStyle.bold = true;
			outputCurrentStyle.lastOutputSpanTagIsOpen = true;
		}
		
		outputCurrentStyle.color = newColorHexCode;
		outputCurrentStyle.colorCode = colorCode;
		lastIndex = matches.index + matches[ 0 ].length;
		isFirst = false;
	}
	
	if(isFirst && lastSpanIdNumber != 0 && outputCurrentStyle.lastOutputSpanTagIsOpen)
	{
		$("." + lastSpanId).append(outputReceived.substr(lastIndex));
	}
	else
	{
		outputFinal += outputReceived.substr(lastIndex);//Copy the remainder.
	}
	
	return outputFinal;
}

function getHexColorCodeFromTelnetColorCode(telnetColorCode)
{
//	if(telnetColorCode == '0')
//		return "#ffffff";//Normal
	if(telnetColorCode == '31')
		return "#800000";//red
	else if(telnetColorCode == '32')
		return '#00b300';//green
	else if(telnetColorCode == '33')
		return '#808000';//yellow
	else if(telnetColorCode == '34')
		return '#000080';//blue
	else if(telnetColorCode == '35')
		return '#800080';//magenta
	else if(telnetColorCode == '36')
		return '#008080';//cyan
	else if(telnetColorCode == '37')
		return '#ffffff';//white
	return null;
}

function generateOutputStyleSpan(currentColor, isBold)
{
	if(currentColor == null && !isBold)
		return "";
	
	var cssColor = null;
	var cssFontWeight = isBold ? "bold" : "normal";
	
	if(currentColor != null) {
	
		cssColor = getHexColorCodeFromTelnetColorCode(currentColor);
	}
	return "<span style='" + (cssColor != null ? ("color:" + cssColor + ";") : "") + ("font-weight:" + cssFontWeight + ";") + "'>";
}

function appendToOutputWindow(outputReceived)
{
	$('#outputWindow').append(outputReceived);
	$("#outputWindowBottomInner").append(outputReceived);

	if(!client.$outputWindowWrapper.hasClass("split")) {
		var outputWindowMargin = document.getElementById("outputWindowMargin");
		outputWindowMargin.scrollTop = outputWindow.scrollHeight;
	}
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
	client.macroManager = new MacroManager(client);
	client.currentFeaturedMudListingId = null;
	client.$outputWindowWrapper = $("#outputWindowWrapper");
	client.$outputWindowMargin = $("#outputWindowMargin");
	client.$outputWindowBorderTopMargin = $("#outputWindowBorderTopMargin");
	client.$outputWindowBottom = $("#outputWindowBottom");

	client.$outputWindowWrapper.on("mousedown", function(e) {

		var $this = $(this);
		if($this.hasClass("split")) {

			if(e.which == 2) {
				e.preventDefault();
				$this.removeClass("split");
				client.$outputWindowMargin[0].scrollTop = client.$outputWindowMargin[0].scrollHeight;
			}
		}
	});

	client.$outputWindowWrapper.on("mousewheel", function(e) {

		if(client.$outputWindowMargin.prop("scrollTop") + client.$outputWindowMargin.prop("offsetHeight") + 10 >= client.$outputWindowMargin.prop("scrollHeight")) {
			client.$outputWindowWrapper.removeClass("split");
		}
	});

	client.$outputWindowMargin.on("scroll", function(e) {

		var $this = $(this);
		var scrollDifference = Math.abs(this.scrollTop - (this.scrollHeight - this.offsetHeight));
		
		if(!client.$outputWindowWrapper.hasClass("split")) {

			if(scrollDifference != 0) {
				client.$outputWindowWrapper.addClass("split");
			}
		}
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
					var $anchor = $("#featuredMud a");
					var $img = $("#featuredMud a img");
					
					$anchor.attr('href', response.websiteUrl);
					$img.attr('src', response.imageUrl);
					$anchor.show();
				}
			}
		});
	}

	client.featuredMudListingIntervalId = setInterval("client.getNextFeaturedMudListing()", 60000);
	client.getNextFeaturedMudListing();

	$("#inputWindow").select();
	if(typeof WebSocket == "undefined") {
	
		alert("This client is not supported by your browser. Please update to a modern browser.");
		return;
	}
	
	$("body").on("keydown", function(event) {
		
		if($("#macroKey").is(':focus')) {
		
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

		if(!$("#inputWindow").is(":focus") && event.which != 17 && !keyboardManager.isKeyDown(17)) {
			$("#inputWindow").focus();
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
	}

	client.createWebSocket = function()
	{
		var protocol = "mud-protocol";

		if(!isDev()) {
			socket = new WebSocket("ws://kinslayermud.org:4001", protocol);
		}
		else {
			socket = new WebSocket("ws://kinslayermud.org:5001", protocol);
		}

		socket.onopen = function()
		{
			client.connected = true;
			client.connectedDatetime = new Date();
			client.reconnectOnClose = false;
			client.inputBuffer = "";
			$("#connectionBox").css("background", "#00FF00");
			
			$("#connectDisconnectButton").text("Disconnect");
		}
		socket.onclose = function()
		{
			client.connected = false;
			client.connectedDatetime = null;
			$("#connectionBox").text("Not Connected");
			$("#connectionBox").css("background", "#FF0000");
			
			if(client.reconnectOnClose)
			{
				client.createWebSocket();
			}
			
			$("#connectDisconnectButton").text("Connect");
		}
		socket.onmessage = function(msg)
		{
			client.inputBuffer += msg.data;

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
	}
	
	client.createWebSocket();
	
	client.processCommand = function(commandObject)
	{
		if(!commandObject.method)
			return;
		
		if(commandObject.method == "Output")
		{
			appendToOutputWindow(formatMUDOutputForWindow(commandObject.data));
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
			signInManager.display();
		}
	}
	
	client.sendCommand = function(commandObject)
	{
		socket.send(JSON.stringify(commandObject) + String.fromCharCode(0x06));
	}

	client.submitInputCommand = function(command) {
	
		var inputCommandObject = new Object();
		inputCommandObject.method = "Input";
		inputCommandObject.data = command;
		this.sendCommand(inputCommandObject);
		
		appendToOutputWindow("<span class=\"inputCommand\">" + command + "</span><br/>");
	}

	$("#inputWindow").on("keypress", function(event) {
	
		if(event.which == 13)
		{//Enter key pressed
			
			var input = $('#inputWindow').val();
			$("#inputWindow").select();
			
			client.submitInputCommand(input);
			event.preventDefault();
			
			commandHistory.push( input );//TODO: Add buffer size limitation
			commandHistoryPosition = commandHistory.length;
		}
	});
	
	$("#inputWindow").on("keydown", function(event) {
	
		if(event.which == 38) {//Up
		
			if(client.macroManager.getMacro(event.which) != null)
				return;
		
			if(commandHistoryPosition != 0) {//Can we scroll up any further?
				commandHistoryPosition -= 1;
				$("#inputWindow").val( commandHistory[ commandHistoryPosition ] );
				
				setCaretToPos( $("#inputWindow").get(0), commandHistory[ commandHistoryPosition ].length );
			}
			
			return false;
		}
		else if(event.which == 40) {//Down
		
			if(client.macroManager.getMacro(event.which) != null)
				return;
				
			if(commandHistoryPosition != commandHistory.length) {//Can we scroll down any further?

				commandHistoryPosition += 1;
				$("#inputWindow").val( commandHistory[ commandHistoryPosition ] );
				setCaretToPos( $("#inputWindow").get(0), commandHistoryPosition == commandHistory.length ? "" : commandHistory[ commandHistoryPosition ].length );
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
		{
			client.createWebSocket();
		}
	});

});
