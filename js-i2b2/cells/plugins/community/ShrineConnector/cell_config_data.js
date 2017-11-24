// this file contains a list of all files that need to be loaded dynamically for this i2b2 Cell
// every file in this list will be loaded after the cell's Init function is called
{
	files:[
	    "ShrineConnector_demoQuery.js",
		"ShrineConnector_ctrlr.js",
		"ShrineConnector_modLabRange.js",
		"ShrineConnector_dateConstraintDialog.js",
	    "jquery-confirm.min.js"
	],
	css:[ 
//		"vwShrineConnector.css",
		"vwDatafile.css",
		"jquery-confirm.min.css"
	],
	config: {
		// additional configuration variables that are set by the system
		short_name: "SHRINE to i2b2 Connector",
	        name: "SHRINE to i2b2 Connector",
	        description: "This plugin enables a local site admin to view and create local queries from a SHRINE query",		
		category: ["ARCH"],
		plugin: {
			isolateHtml: false,  // this means do not use an IFRAME
			isolateComm: false,  // this means to expect the plugin to use AJAX communications provided by the framework
			standardTabs: true, // this means the plugin uses standard tabs at top
			html: {
				source: 'injected_screens.html',
				mainDivId: 'Datafile-mainDiv'
//            mainDivId: 'ShrineConnector-mainDiv'
			}
		}
	}
}