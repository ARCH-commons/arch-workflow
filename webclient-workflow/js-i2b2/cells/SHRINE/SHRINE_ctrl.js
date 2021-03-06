/**
 * @projectDescription	SHRINE cell controller object
 * @inherits 	i2b2
 * @namespace	i2b2.SHRINE
 * @author		Nick Benik, Griffin Weber MD PhD
 * @version 	1.0
 * ----------------------------------------------------------------------------------------
 */

// Override the default help display to open a new window pointed at the centrally-hosted SHRINE help

/*
i2b2.events.afterLogin.subscribe((function(type,args) {
	i2b2.hive.HelpViewer = {
	show: function() {
		try {
			window.open('/shrine-webclient/Help/index.htm'
					,'SHRINE_help_viewer'
					, 'width=650,height=450,toolbar=0,resizable=1,location=0,status=0,menubar=0,scrollbars=1');
		} catch (e) {}
		} 
	};
}));
*/
//Charles McGow - Add previous queries and workplace[if avaiable]
//i2b2.events.afterLogin.subscribe((function(en,co) { i2b2.hive.MasterView.addZoomWindow("ONT"); }), "", i2b2 );
//Charles McGow - Add previous queries and workplace[if avaiable]
/*
i2b2.events.afterLogin.subscribe((function(type,args) {
	// all cells have been loaded.  Set the viewMode, resize, etc
	try {
		if (i2b2.hive.cfg.lstCells.SHRINE.serverLoaded) {
			i2b2.PM.model.shrine_domain = true;
		}
	} catch (e) {}
	if (i2b2.h.isSHRINE()) {
		i2b2.SHRINE.afterLogin(type,args);
	}
}));


i2b2.SHRINE.afterLogin = function(type,args) {
	var msg = i2b2.SHRINE.ajax.readApprovedEntries("SHRINE");
	msg.parse();
	if (msg.error) {
		console.error("Could not get approved topic list from SHRINE");
		console.dir(msg);
		alert('Could not get approved topics list from SHRINE.');
	} else {
		i2b2.SHRINE.model.topics = {};
		var l = msg.model.length;
		for (var i=0; i<l; i++) {
			var rec = msg.model[i];
			if (rec.TopicID != undefined) {
				i2b2.SHRINE.model.topics[rec.TopicID] = rec;
			}
		}
	}
	i2b2.SHRINE.renderTopics();
	$$('#crcDlgResultOutputPRC input')[0].disabled=true;
	$('crcDlgResultOutputPRS').hide();
};

i2b2.SHRINE.renderTopics = function() {
	// deal with the Query Tool's topic drop
	try {
		var dropdown = $('queryTopicSelect');
		while (dropdown.hasChildNodes()) { dropdown.removeChild(dropdown.firstChild); }
		// create the "Select Topic" option
		var sno = document.createElement('OPTION');
		sno.setAttribute('value', null);
		var snt = document.createTextNode(" ------ Select an Approved Query Topic ------ ");
		sno.appendChild(snt);
		dropdown.appendChild(sno);
		// populate with topics
		for (var i in i2b2.SHRINE.model.topics) {
			var rec = i2b2.SHRINE.model.topics[i];
			if (rec.TopicID != undefined && rec.approval == "Approved") {
				// ONT options dropdown
				var sno = document.createElement('OPTION');
				sno.setAttribute('value', rec.TopicID);
				var snt = document.createTextNode(rec.Name);
				sno.appendChild(snt);
				dropdown.appendChild(sno);
			}
		}
	} catch(e) {
		console.error("could not populate QueryTool's topic panel");
	}
};

i2b2.SHRINE.RequestTopic = function() {
	// Change this value in the config file [\i2b2\cells\SHRINE\cell_config_data.js]
	window.open(i2b2.SHRINE.cfg.config.newTopicURL, 'RequestTopic', 'toolbar=1,scrollbars=1,location=1,statusbar=1,menubar=1,resizable=1,width=800,height=600');
};

i2b2.SHRINE.TopicInfo = function() {
	var s = $('queryTopicSelect');
	if (s.selectedIndex == null || s.selectedIndex == 0) { return true; }
	var topicID = s.options[s.selectedIndex].value;
	if (topicID == "") { return; }
	i2b2.SHRINE.view.modal.topicInfoDialog.showInfo(topicID);
};

i2b2.SHRINE.view.modal.topicInfoDialog = {
	showInfo: function(id) {
		var thisRef = i2b2.SHRINE.view.modal.topicInfoDialog;
		if (!thisRef.yuiDialog) {
			thisRef.yuiDialog = new YAHOO.widget.SimpleDialog("SHRINE-info-panel", {
				zindex: 700,
				width: "400px",
				fixedcenter: true,
				constraintoviewport: true
			});
			thisRef.yuiDialog.render(document.body);
			// show the form
			thisRef.yuiDialog.show();
		}
		// show the form
		$('SHRINE-info-panel').show();
		thisRef.yuiDialog.show();
		thisRef.yuiDialog.center();
		// display the topic info
		var rec = i2b2.SHRINE.model.topics[id];
		if (undefined == rec) {	thisRef.yuiDialog.hide(); }	// bad id == bail out here
		$('SHRINE-info-title').innerHTML = rec.Name;
		$('SHRINE-info-body').innerHTML = rec.Intent;
	}
};
*/