// this file contains a list of all files that need to be loaded dynamically for this i2b2 Cell
// every file in this list will be loaded after the cell's Init function is called
{
	files: [
		"PatientSetViewer_ctrlr.js",
		"workingFolder.js",
		"PatientSetViewer_ShrineConnector.js",
        "PatientSetViewer_ShrineMapping_demo.js",
        "PatientSetViewer_ShrineMapping_PCORI.js",
		"PatientSetViewer_modLabRange.js",
		"PatientSetViewer_dateConstraintDialog.js",
		"jquery-confirm.min.js",
		"jstree.min.js",
		"jquery-ui.min.js"
	],
		css:[
			"vwPatientSetViewer.css",
			"jquery-confirm.min.css",
			"style.min.css",
			"jquery-ui.min.css",
			"jquery-ui.structure.min.css",
			"jquery-ui.theme.min.css"
		],
			config: {
		// additional configuration variables that are set by the system
		short_name: "ARCH Data Set Handler",
			name: "ARCH Data Set Handler",
				description: "Creates an aggregated data set from <strong> ARCH Data Set </strong> requests",
					//icons: { size32x32: "Datafile_icon_32x32.gif" },
					category: ["ARCH"],
						plugin: {
			isolateHtml: false,  // this means do not use an IFRAME
				isolateComm: false,  // this means to expect the plugin to use AJAX communications provided by the framework
					standardTabs: true, // this means the plugin uses standard tabs at top
						html: {
				source: 'injected_screens.html',
					mainDivId: 'PatientSetViewer-mainDiv'
			}
		}
	}
}