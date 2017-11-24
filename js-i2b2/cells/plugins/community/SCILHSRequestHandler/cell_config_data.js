// this file contains a list of all files that need to be loaded dynamically for this i2b2 Cell
// every file in this list will be loaded after the cell's Init function is called
{
	files:[
		"SCILHSRequestHandler_ctrlr.js", "SCILHSRequestHandler_modLabRange.js", "SCILHSRequestHandler_dateConstraintDialog.js"
	],
	css:[ 
		"vwSCILHSRequestHandler.css"
	],
	config: {
		// additional configuration variables that are set by the system
		short_name: "SCILHS Request",
		name: "Load SCILHS Request Data",
		description: "User creates actionable <strong>Patient Lists</strong> from a SCILHS-requested SHRINE query",
		//icons: { size32x32: "Datafile_icon_32x32.gif" },
		category: ["community"],
		plugin: {
			isolateHtml: false,  // this means do not use an IFRAME
			isolateComm: false,  // this means to expect the plugin to use AJAX communications provided by the framework
			standardTabs: true, // this means the plugin uses standard tabs at top
			html: {
				source: 'injected_screens.html',
				mainDivId: 'SCILHSRequestHandler-mainDiv'
			}
		}
	}
}