<html>
<head>
	<meta name="ROBOTS" content="NOINDEX, FOLLOW" />
	<link rel="stylesheet" media="screen" type="text/css" href="styles/mudclient-styles.css" />
	<link rel="stylesheet" media="screen" type="text/css" href="fancybox/jquery.fancybox-1.3.4.css" />

	<script type="text/javascript" src="scripts/jquery-1.7.2.mini.js"></script>
	<script type="text/javascript" src="fancybox/jquery.fancybox-1.3.4.pack.js"></script>
	<script type="text/javascript" src="fancybox/jquery.fancybox-1.3.4.js"></script>
	<script type="text/javascript" src="fancybox/jquery.easing-1.3.pack.js"></script>
	<script type="text/javascript" src="scripts/MacroManager.js"></script>
	<script type="text/javascript" src="scripts/KeyboardManager.js"></script>
	<script type="text/javascript" src="scripts/Client.js"></script>
	<script type="text/javascript" src="scripts/SignInManager.js"></script>
</head>
<body>

	<script type="text/javascript">
		var _gaq = _gaq || [];
		_gaq.push(['_setAccount', 'UA-30177893-1']);
		_gaq.push(['_trackPageview']);

		(function() {
			var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
			ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
			var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
		})();
	</script>

	<!-- AdWords "Play Now!" conversion -->
	<script type="text/javascript">
		/* <![CDATA[ */
		goog_snippet_vars = function() {
			var w = window;
			w.google_conversion_id = 994631997;
			w.google_conversion_label = "izCqCOPKpQcQvcKj2gM";
			w.google_conversion_value = 0;
			w.google_remarketing_only = false;
		}
		// DO NOT CHANGE THE CODE BELOW.
		goog_report_conversion = function(url) {
			goog_snippet_vars();
			window.google_conversion_format = "3";
			window.google_is_call = true;
			var opt = new Object();
			opt.onload_callback = function() {
				if (typeof(url) != 'undefined') {
					window.location = url;
				}
			}
			var conv_handler = window['google_trackConversion'];
			if (typeof(conv_handler) == 'function') {
				conv_handler(opt);
			}
		}
		/* ]]> */
	</script>

	<!--
		<script type="text/javascript" src="//www.googleadservices.com/pagead/conversion_async.js"></script>
	-->

	<div id="mainContentWrapper">
		<div id="topNav">
      
			<ul>
				<li><a href="http://www.kinslayermud.org/" target="_blank">Home</a></li>
				<li><a href="#" id="connectDisconnectButton">Connect</a></li>
				<li><a href="http://www.kinslayermud.org/player-portal" id="connectDisconnectButton" target="_blank">My Account</a></li>
				<li><a href="#macros" id="macroTopNavButton" target="_blank">Macros</a></li>
			</ul>
     
			<div id="featuredMud">
				<a href="#" target="_blank" rel="nofollow"><img src="#"></img></a>
			</div>
			<div style="clear:left;"></div>
		</div>

		<div id="mainContentInner">
			<div id="outputWindowWrapper">
				<div id="outputWindowMargin">
					<div id="outputWindow"></div>
				</div>

				<div id="outputWindowBottom">

					<div id="outputWindowBorderTopMargin">
						<div id="outputWindowBottomSeparator"></div>
						<div id="outputWindowBottomInner"></div>
					</div>
				</div>
			</div>
			<div id="inputPanel">
				<input id="inputWindow" type="text" />
				<div id="connectionBox"></div>
			</div>
		</div>
	</div>

	<div id="rightPanelWrapper" class="clearFix">
		<div id="rightPanel">

			<div class="usernameRow">
				<span id="usernameLabel" class="rightPanelLabel">Username:</span>
				<span id="usernameValue" class="rightPanelValue"></span>
			</div>
			<div class="usernameRow">
				<span id="levelLabel" class="rightPanelLabel">Level:</span>
				<span id="levelValue" class="rightPanelValue"></span>
			</div>
			<div class="usernameRow">
				<span id="expToLevelLabe;" class="rightPanelLabel">EXP To Level:</span>
				<span id="expToLevelValue" class="rightPanelValue"></span>
			</div>
			<div class="usernameRow">
				<span id="weavePointsLabel" class="rightPanelLabel">Weave Points:</span>
				<span id="weavePointsValue" class="rightPanelValue"></span>
			</div>
			<div class="usernameRow">
				<span id="hitPointsLabel" class="rightPanelLabel">HP:</span>
				<span id="hitPointsValue" class="rightPanelValue"></span>
			</div>
			<div class="usernameRow">
				<span id="movePointsLabel" class="rightPanelLabel">MV:</span>
				<span id="movePointsValue" class="rightPanelValue"></span>
			</div>
			<div class="usernameRow">
				<span id="spellPointsLabel" class="rightPanelLabel">SP:</span>
				<span id="spellPointsValue" class="rightPanelValue"></span>
			</div>
			<div class="usernameRow">
				<span id="offensiveLabel" class="rightPanelLabel">Offensive:</span>
				<span id="offensiveValue" class="rightPanelValue"></span>
			</div>
			<div class="usernameRow">
				<span id="dodgeLabel" class="rightPanelLabel">Dodge:</span>
				<span id="dodgeValue" class="rightPanelValue"></span>
			</div>
			<div class="usernameRow">
				<span id="parryLabel" class="rightPanelLabel">Parry:</span>
				<span id="parryValue" class="rightPanelValue"></span>
			</div>
			<div class="usernameRow">
				<span id="absorbLabel" class="rightPanelLabel">Absorb:</span>
				<span id="absorbValue" class="rightPanelValue"></span>
			</div>
		</div>
  	</div>

	<div id="macroWrapper" class="hidden">
		<div id="macros">
			<div id="macroButtons">
				<ul class="clearFix">
					<li><a href="#" id="macroNewButton">New</a></li>
					<li><a href="#" id="macroSaveButton">Save</a></li>
					<li><a href="#" id="macroDeleteButton">Delete</a></li>
				</ul>
			</div>
	
			<div id="macroContainer">
			</div>

			<div id="macroEditor">
				KEY:<br>
				<input type="text" id="macroKey"><br>
				
				<br>
				REPLACEMENT:<br>
				<textarea id="macroReplacement"></textarea><br>
				<input type="hidden" id="macroId" value="">
			</div>
	
		</div>
	</div>

	<a href="#signIn" id="signInLightboxAnchor" class="hidden">Sign In</a>
	<div id="signInLightbox" class="hidden">
		<div id="signIn" class="clearFix">

			<div id="signInPanel">
				<div class="header">Sign In or Register</div>
			
				<form id="signInForm">
					<span class="error hidden">You did not enter a password.</span>
					Username:<br>
					<input class="fancyInput" type="text" name="Username"/>
					Password:<br>
					<input class="fancyInput" type="password" name="Password"/><br>
					<button type="submit">Sign In</button>
				</form>

				<div id="signInOr">OR</div>

				<div class="createNewCharacter">
					<button>Create New Character</button>
				</div>

			</div>


			<div id="registrationPanel" class="hidden">
				<div class="header">Create New Character</div>

				<form id="createNewCharacter">

					<button type="button" id="backToSignInButton">Back to Sign In</button><br>
					<ul id="createNewCharacterErrors" class="hidden"></ul>
					<span class="label">Character's Name:</span><input class="fancyInput" type="text" name="Username"/><br/><br/>
					<span class="label">Password:</span><input class="fancyInput" type="password" name="Password"/><br/><br/>
					<span class="label">Confirm Password:</span><input class="fancyInput" type="password" name="PasswordConfirmation"/><br/><br/>
					<span class="label">Email Address:</span><input class="fancyInput" type="text" name="Email"/><br/><br/>
					<span class="label">Confirm Email:</span><input class="fancyInput" type="text" name="EmailConfirmation"/><br/><br/>


					<span class="label">Select Your Gender:</span>
					<input type="radio" name="Gender" value="1"> Male
					<input type="radio" name="Gender" value="2"> Female<br/><br/>

					<span class="label">Select Your Race:</span><br/>
					<div class="race clearFix">
						<div class="raceOption">
							<input type="radio" name="Race" value="0"/> Human
						</div>
						<span class="raceDescription">
							<span class="strong">** RECOMMENDED FOR NEW PLAYERS **</span><br/>
							Mainly located in the Wetlands, the 'humans' maintain control of all land from the Borderlands to the north, to the Sea of
							Storms to the south. They are also the most numerous, containing a great number of clans and nations across the world."
						</span>
					</div>

					<div class="race clearFix">
						<div class="raceOption">
							<input type="radio" name="Race" value="1"/> Trolloc
						</div>
						<span class="raceDescription">
							<span class="strong">** EXPERIENCED PLAYERS **</span><br/>
							The beastly servants of the Great Lord of the Dark, Shai'tan, the Trollocs live in the cruel land of the Blight north of the
    						Borderlands. Using their night-vision, keen hearing and smelling, and immense endurance, they set out to conquer the land of the
							humans according to the Great Lord's will while satisfying their bloodlust.
						</span>
					</div>

					<div id="classesHuman" class="classGroup hidden" data-race="0">
						<span class="label">Select Your Class</span><br/>

						<div class="class clearFix">
							<div class="classOption">
								<input type="radio" name="Class" value="0"/> Warrior
							</div>
							<span class="classDescription">
								The warriors are the tanks of battle, specializing in the use of heavy weapons and armor.
							</span>
						</div>

						<div class="class clearFix">
							<div class="classOption">
								<input type="radio" name="Class" value="1"/> Thief
							</div>
							<span class="classDescription">
								The surreptitious thieves use their keen skills of deceit, striking most painfully when least expected.
							</span>
						</div>

						<div class="class clearFix">
							<div class="classOption">
								<input type="radio" name="Class" value="2"/> Ranger
							</div>
							<span class="classDescription">
								Roaming most comfortably in the countryside and forests, the rangers are most proficient in their ability to track their foe
								while surviving in the uncivilized land.
							</span>
						</div>

						<div class="class clearFix">
							<div class="classOption">
								<input type="radio" name="Class" value="3"/> Channeler
							</div>
							<span class="classDescription">
								Although gifted with the ability to wield the One Power, the channeler is physically the weakest. Their power, however, is
								both unique and crucial for the success of the Light.
							</span>
						</div>
					</div>

					<div id="classesTrolloc" class="classGroup hidden" data-race="1">
						<span class="label">Select Your Class</span><br/>

						<div class="class clearFix">
							<div class="classOption">
								<input type="radio" name="Class" value="0"/> Warrior
							</div>
							<span class="classDescription">
								The warriors are the tanks of battle, specializing in the use of heavy weapons and armor.
							</span>
						</div>

						<div class="class clearFix">
							<div class="classOption">
								<input type="radio" name="Class" value="1"/> Thief
							</div>
							<span class="classDescription">
								The surreptitious thieves use their keen skills of deceit, striking most painfully when least expected.
							</span>
						</div>

						<div class="class clearFix">
							<div class="classOption">
								<input type="radio" name="Class" value="2"/> Ranger
							</div>
							<span class="classDescription">
								Roaming most comfortably in the countryside and forests, the rangers are most proficient in their ability to track their foe
								while surviving in the uncivilized land.
							</span>
						</div>

						<div class="class clearFix">
							<div class="classOption">
								<input type="radio" name="Class" value="9"/> Dreadguard
							</div>
							<span class="classDescription">
								Fearsome users of the One Power, these humans gave their souls to the Dark One in exchange for eternal life. Their ability to
								channel is invaluable to the efforts of the Shadow.
							</span>
						</div>
					</div>

					<button type="submit" id="createCharacterSubmission" class="floatRight">Create Character</button>
					<div class="clearBoth"> </div>
				</form>
			</div>

		</div>
	</div>

 </body>
</html>
