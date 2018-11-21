{
    urlProxy: "index.php",
	urlFramework: "js-i2b2/",
	loginTimeout: 15, // in seconds
	//JIRA|SHRINE-519:Charles McGow
	username_label:"username:", //Username Label
	password_label:"password:", //Password Label
    clientHelpUrl:'help/help.pdf',
    networkHelpUrl:'http://www.google.com',
	//JIRA|SHRINE-519:Charles McGow
	// -------------------------------------------------------------------------------------------
	// THESE ARE ALL THE DOMAINS A USER CAN LOGIN TO
	lstDomains: [
		{ 
		  domain: "shrinescilhs",
		  name: "SHRINE",
		  isSHRINE: true,
		  debug: true,
		  urlCellPM: "http://127.0.0.1:9090/i2b2/services/PMService/",
		  ///urlCellPM: "http://192.168.169.129/i2b2/services/PMService/",
		  allowAnalysis: true
		}
	],
	// -------------------------------------------------------------------------------------------
	ui: { 'topWidth':840,'topHeight':517,'bottomHeight':344,'bottomSpacer':396,'bottomPQHeight':144,'bottomPQSpacer':196,'minEverythingHeight':634 }
	// topWidth/Height refers to the query tool panels. This is not fully implemented at this time; some are hardcoded.
}
