/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */

function onLoaded() {
  var csInterface = new CSInterface();

  var env = csInterface.hostEnvironment;
  var appName = csInterface.hostEnvironment.appName;
  var appVersion = csInterface.hostEnvironment.appVersion;
  var APIVersion = csInterface.getCurrentApiVersion();

  // document.getElementById("dragthing").style.backgroundColor = "lightblue";
  var caps = csInterface.getHostCapabilities();

  loadJSX();

  updateThemeWithAppSkinInfo(csInterface.hostEnvironment.appSkinInfo);

  // Update the color of the panel when the theme color of the product changed.
  csInterface.addEventListener(
    CSInterface.THEME_COLOR_CHANGED_EVENT,
    onAppThemeColorChanged
  );
  // Listen for event sent in response to rendering a sequence.
  csInterface.addEventListener(
    "com.adobe.csxs.events.PProPanelRenderEvent",
    function (event) {
      alert(event.data);
    }
  );

  csInterface.addEventListener(
    "com.adobe.csxs.events.WorkspaceChanged",
    function (event) {
      alert("New workspace selected: " + event.data);
    }
  );

  csInterface.addEventListener(
    "com.adobe.ccx.start.handleLicenseBanner",
    function (event) {
      alert('User chose to go "Home", wherever that is...');
    }
  );

  csInterface.addEventListener("ApplicationBeforeQuit", function (event) {
    csInterface.evalScript("$._PPP_.closeLog()");
  });

  csInterface.evalScript("$._PPP_.getVersionInfo()", myVersionInfoFunction);
  csInterface.evalScript("$._PPP_.getActiveSequenceName()", myCallBackFunction);
  csInterface.evalScript("$._PPP_.getUserName()", myUserNameFunction);
  csInterface.evalScript(
    "$._PPP_.getProjectProxySetting()",
    myGetProxyFunction
  );
  csInterface.evalScript("$._PPP_.keepPanelLoaded()");
  csInterface.evalScript("$._PPP_.disableImportWorkspaceWithProjects()");
  csInterface.evalScript("$._PPP_.registerProjectPanelSelectionChangedFxn()"); // Project panel selection changed
  csInterface.evalScript("$._PPP_.registerItemAddedFxn()"); // Item added to project
  csInterface.evalScript("$._PPP_.registerProjectChangedFxn()"); // Project changed
  csInterface.evalScript("$._PPP_.registerSequenceSelectionChangedFxn()"); // Selection within the active sequence changed
  csInterface.evalScript("$._PPP_.registerSequenceActivatedFxn()"); // The active sequence changed
  csInterface.evalScript("$._PPP_.registerActiveSequenceStructureChangedFxn()"); // Clips within the active sequence changed
  csInterface.evalScript("$._PPP_.registerItemsAddedToProjectFxn()"); // register for message, whenever something is added to the active project
  csInterface.evalScript("$._PPP_.registerSequenceMessaging()");
  csInterface.evalScript("$._PPP_.registerActiveSequenceChangedFxn()");
  csInterface.evalScript("$._PPP_.confirmPProHostVersion()");
  csInterface.evalScript("$._PPP_.forceLogfilesOn()"); // turn on log files when launching

  // Good idea from our friends at Evolphin; make the ExtendScript locale match the JavaScript locale!
  var prefix = "$._PPP_.setLocale('";
  var locale = csInterface.hostEnvironment.appUILocale;
  var postfix = "');";

  var entireCallWithParams = prefix + locale + postfix;
  csInterface.evalScript(entireCallWithParams);
}

function dragHandler(event) {
  var csInterface = new CSInterface();
  var extPath = csInterface.getSystemPath(SystemPath.EXTENSION);
  var OSVersion = csInterface.getOSInformation();

  /*
		Note: PPro displays different behavior, depending on where the drag ends (and over which the panel has no control):

		Project panel?	Import into project.
		Sequence?		Import into project, add to sequence.
		Source monitor? Open in source, but do NOT import into project.
	
	*/

  if (extPath !== null) {
    extPath = extPath + "/payloads/test.jpg";
    if (OSVersion.indexOf("Windows") >= 0) {
      var sep = "\\\\";
      extPath = extPath.replace(/\//g, sep);
    }
    event.dataTransfer.setData("com.adobe.cep.dnd.file.0", extPath);
    //	event.dataTransfer.setData("com.adobe.cep.dnd.file.N", path);  N = (items to import - 1)
  }
}

function myCallBackFunction(data) {
  // Updates seq_display with whatever ExtendScript function returns.
  var boilerPlate = "Active Sequence: ";
  var seq_display = document.getElementById("active_seq");
  // seq_display.innerHTML	= boilerPlate + data;
}

function myUserNameFunction(data) {
  // Updates username with whatever ExtendScript function returns.
  var user_name = document.getElementById("username");
  // user_name.innerHTML	= data;
}

function myGetProxyFunction(data) {
  // Updates proxy_display based on current sequence's value.
  var boilerPlate = "Proxies enabled for project: ";
  var proxy_display = document.getElementById("proxies_on");

  if (proxy_display !== null) {
    proxy_display.innerHTML = boilerPlate + data;
  }
}

function mySetProxyFunction(data) {
  var csInterface = new CSInterface();
  csInterface.evalScript("$._PPP_.getActiveSequenceName()", myCallBackFunction);
  csInterface.evalScript(
    "$._PPP_.getProjectProxySetting()",
    myGetProxyFunction
  );
}

function setVar(name, val) {
  document.documentElement.style.setProperty("--" + name, val);
}

function myVersionInfoFunction(data) {
  var v_string = document.getElementById("version_string");
  // v_string.innerHTML	= data;
}

/**
 * Update the theme with the AppSkinInfo retrieved from the host product.
 */

function updateThemeWithAppSkinInfo(appSkinInfo) {
  //Update the background color of the panel

  var panelBackgroundColor = appSkinInfo.panelBackgroundColor.color;
  var appBarBackgroundColor = appSkinInfo.appBarBackgroundColor.color;
  var systemHighlightColor = appSkinInfo.systemHighlightColor;

  setVar("bg", toHex(panelBackgroundColor));
  setVar("font-size", appSkinInfo.baseFontSize + "px");
  setVar("button-font-size", 1.2 * appSkinInfo.baseFontSize + "px");
  setVar(
    "font-family",
    appSkinInfo.baseFontFamily + ', "LucidaGrande", sans-serif'
  );

  setVar("input-grad1", toHex(panelBackgroundColor, 40));
  setVar("input-grad2", toHex(panelBackgroundColor, 10));

  setVar("disabled-grad1", toHex(panelBackgroundColor, 15));
  setVar("disabled-grad2", toHex(panelBackgroundColor, 5));

  setVar("highlight-grad1", toHex(systemHighlightColor));
  setVar("highlight-grad2", toHex(systemHighlightColor, -10));

  var isPanelThemeLight = panelBackgroundColor.red > 50; // choose your own sweet spot

  if (isPanelThemeLight) {
    setVar("font", "#000000");
    setVar("disabled", toHex(panelBackgroundColor, -70));
    setVar("border", toHex(panelBackgroundColor, -90));
    setVar("input-bg", toHex(panelBackgroundColor, 54));
  } else {
    setVar("font", "#CCC");
    setVar("disabled", toHex(panelBackgroundColor, 100));
    setVar("border", toHex(panelBackgroundColor, -45));
    setVar("input-bg", toHex(panelBackgroundColor, -20));
  }
}

/**
 * Convert the Color object to string in hexadecimal format;
 */

function computeValue(value, delta) {
  var computedValue = !isNaN(delta) ? value + delta : value;
  if (computedValue < 0) {
    computedValue = 0;
  } else if (computedValue > 255) {
    computedValue = 255;
  }

  computedValue = Math.round(computedValue).toString(16);
  return computedValue.length == 1 ? "0" + computedValue : computedValue;
}

function toHex(color, delta) {
  var hex = "";
  if (color) {
    hex =
      computeValue(color.red, delta) +
      computeValue(color.green, delta) +
      computeValue(color.blue, delta);
  }
  return "#" + hex;
}

function onAppThemeColorChanged(event) {
  // Should get a latest HostEnvironment object from application.
  var skinInfo = JSON.parse(
    window.__adobe_cep__.getHostEnvironment()
  ).appSkinInfo;
  // Gets the style information such as color info from the skinInfo,
  // and redraw all UI controls of your extension according to the style info.
  updateThemeWithAppSkinInfo(skinInfo);
}

/**
 * Load JSX file into the scripting context of the product. All the jsx files in
 * folder [ExtensionRoot]/jsx & [ExtensionRoot]/jsx/[AppName] will be loaded.
 */
function loadJSX() {
  var csInterface = new CSInterface();

  // get the appName of the currently used app. For Premiere Pro it's "PPRO"
  var appName = csInterface.hostEnvironment.appName;
  var extensionPath = csInterface.getSystemPath(SystemPath.EXTENSION);

  // load general JSX script independent of appName
  var extensionRootGeneral = extensionPath + "/jsx/";
  csInterface.evalScript('$._ext.evalFiles("' + extensionRootGeneral + '")');

  // load JSX scripts based on appName
  var extensionRootApp = extensionPath + "/jsx/" + appName + "/";
  csInterface.evalScript('$._ext.evalFiles("' + extensionRootApp + '")');
}

function evalScript(script, callback) {
  new CSInterface().evalScript(script, callback);
}

function onClickButton(ppid) {
  var extScript = "$._ext_" + ppid + ".run()";
  evalScript(extScript);
}
