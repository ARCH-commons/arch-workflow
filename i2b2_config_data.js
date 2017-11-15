{
  urlProxy: "/shrine-proxy/request",
//      urlProxy: "index.php",
    urlFramework: "js-i2b2/",
	loginTimeout: 15, // in seconds
	//JIRA|SHRINE-519:Charles McGow
	username_label:"test username:", //Username Label
	password_label:"test password:", //Password Label
	//JIRA|SHRINE-519:Charles McGow
	// -------------------------------------------------------------------------------------------
	// THESE ARE ALL THE DOMAINS A USER CAN LOGIN TO
	lstDomains: [
		{
		    domain: "i2b2demo",
		    name: "Hub",
		    isSHRINE: true,
		    debug: true,
		    allowAnalysis: true,
		    urlCellPM: "http://i2b2-pm-ont:9090/i2b2/services/PMService/"
		}
	]
	// -------------------------------------------------------------------------------------------
}
