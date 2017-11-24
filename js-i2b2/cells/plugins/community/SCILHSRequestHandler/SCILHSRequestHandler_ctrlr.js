/**
 * @projectDescription	Produces data file based on previous query
 * @inherits	i2b2
 * @namespace	i2b2.SCILHSRequestHandler
 * @author	Nich Wattanasin
 * @version 	2.0
 * ----------------------------------------------------------------------------------------
 * updated 05-06-15: 	Bhaswati Ghosh
 * 2.0 : 03-03-16:		Nich Wattanasin
 */
// values used for table data select
i2b2.SCILHSRequestHandler.cellDataOption = {};
i2b2.SCILHSRequestHandler.cellDataOption.DEFAULT 	= "Existence (Yes/No)";
i2b2.SCILHSRequestHandler.cellDataOption.MIN 		= "Minimum Value";  // To-do
i2b2.SCILHSRequestHandler.cellDataOption.MAX 		= "Maximum Value";  // To-do
i2b2.SCILHSRequestHandler.cellDataOption.AVERAGE    	= "Average Value";  // To-do
i2b2.SCILHSRequestHandler.cellDataOption.MEDIAN     	= "Median Value";  // To-do
i2b2.SCILHSRequestHandler.cellDataOption.FIRST 		= "Date (First)";
i2b2.SCILHSRequestHandler.cellDataOption.LAST 		= "Date (Most Recent)";
i2b2.SCILHSRequestHandler.cellDataOption.COUNT 		= "Count";
i2b2.SCILHSRequestHandler.cellDataOption.ALLVALUES  	= "List of All Values";  // To-do
i2b2.SCILHSRequestHandler.cellDataOption.MODE       	= "Mode (Most Frequent Value)"; // To-do
i2b2.SCILHSRequestHandler.cellDataOption.ALLCONCEPTTEXT 	= "All Concepts (Names/Text)";
i2b2.SCILHSRequestHandler.cellDataOption.MODECONCEPTTEXT = "Most Frequent Concept (Names/Text)";
i2b2.SCILHSRequestHandler.cellDataOption.ALLCONCEPTCODE 	= "All Concepts (Codes)";
i2b2.SCILHSRequestHandler.cellDataOption.MODECONCEPTCODE = "Most Frequent Concept (Codes)";

i2b2.SCILHSRequestHandler.previewRequested = false;
i2b2.SCILHSRequestHandler.dataRequested = false;
i2b2.SCILHSRequestHandler.queryMasterId = "";
i2b2.SCILHSRequestHandler.downloadID = "";
i2b2.SCILHSRequestHandler.lastDroppedTerm = null;

i2b2.SCILHSRequestHandler.UI = {};

i2b2.SCILHSRequestHandler.user = {};

i2b2.SCILHSRequestHandler.viewResultsTableOption = false;


// Value types gathered from value metadata in concepts and modifiers. Used to differentiate different types of value restrictions. Combines posInteger, Integer, PosFloat, and Float as NUMERIC Data
i2b2.SCILHSRequestHandler.valueType         = {};
i2b2.SCILHSRequestHandler.valueType.NUMERIC = {id:1, text:"numeric"};       // NUMERIC_DATA: PosInteger, Integer, PosFloat, Float
i2b2.SCILHSRequestHandler.valueType.ENUM    = {id:2, text:"enumerated"};    // ENUM
i2b2.SCILHSRequestHandler.valueType.BLOB    = {id:3, text:"blob"};          // LARGESTRING (BLOB)
i2b2.SCILHSRequestHandler.valueType.MIXED   = {id:4, text:"mixed"};         // This is used to describe a Group containing concepts of mixed value types
i2b2.SCILHSRequestHandler.valueType.UNKNOWN = {id:0, text:"unknown"};       // Unknown (sanity check)

var zygosityValues = ["Heterozygous", "Homozygous", "missing_zygosity"];
var consequenceValues = ["3'UTR", "5'UTR", "downstream","exon","Frameshift","In-frame","intron","missense","nonsense","start_loss","stop_loss","synonymous","upstream","missing_consequence"];
var alleleValues = ["A_to_C", "A_to_G", "A_to_T","C_to_A","C_to_G","C_to_T","G_to_A","G_to_C","G_to_T","T_to_A","T_to_C","T_to_G","._."];

//Change BG for new value box architecture
i2b2.SCILHSRequestHandler.currentTerm = null;

// SHRINE ontology prefix
i2b2.SCILHSRequestHandler.ontology = {};
i2b2.SCILHSRequestHandler.ontology.DEFAULT_PREFIX = 'PCORI';
i2b2.SCILHSRequestHandler.ontology.shrinePrefix = 'SHRINE';

i2b2.SCILHSRequestHandler.Init = function(loadedDiv) {

	// 1. check DATA_LDS role
	// 2. if no DATA_LDS role, show form + populate drop down with faculty sponsors
	// 3. if yes DATA_LDS role, continue as is

	
		// register DIV as valid DragDrop target for Patient Record Sets (PRS) objects
		var op_trgt = {dropTarget:true};
		i2b2.sdx.Master.AttachType("SCILHSRequestHandler-CONCPTDROP", "CONCPT", op_trgt);
		i2b2.sdx.Master.AttachType("SCILHSRequestHandler-CONCPTDROP", "QM", op_trgt);
		i2b2.sdx.Master.AttachType("SCILHSRequestHandler-PRSDROP", "PRS", op_trgt);
		i2b2.sdx.Master.AttachType("SCILHSRequestHandler-PRSDROP", "QM", op_trgt);

		// drop event handlers used by this plugin
		i2b2.sdx.Master.setHandlerCustom("SCILHSRequestHandler-CONCPTDROP", "CONCPT", "DropHandler", i2b2.SCILHSRequestHandler.conceptDropped);
		i2b2.sdx.Master.setHandlerCustom("SCILHSRequestHandler-CONCPTDROP", "QM", "DropHandler", i2b2.SCILHSRequestHandler.queryConceptDropped);
		i2b2.sdx.Master.setHandlerCustom("SCILHSRequestHandler-PRSDROP", "PRS", "DropHandler", i2b2.SCILHSRequestHandler.prsDropped);
		i2b2.sdx.Master.setHandlerCustom("SCILHSRequestHandler-PRSDROP", "QM", "DropHandler", i2b2.SCILHSRequestHandler.queryDropped);

		i2b2.SCILHSRequestHandler.debug.useReviewWindow = false;             // enable/disable live debug message output to external window

		i2b2.SCILHSRequestHandler.active = new Object();

		i2b2.SCILHSRequestHandler.model.prsRecord = false;
		i2b2.SCILHSRequestHandler.model.conceptRecord = false;
		i2b2.SCILHSRequestHandler.model.dirtyResultsData = true;
		
		i2b2.SCILHSRequestHandler.columnDisplaySelectID = "columnDisplaySelectID";
		i2b2.SCILHSRequestHandler.model.pageSize = 50;
		i2b2.SCILHSRequestHandler.model.processed = 0;
		i2b2.SCILHSRequestHandler.msgCounter        = 0;
		// array to store concepts
		i2b2.SCILHSRequestHandler.model.concepts = [];

		// set initial pagination values
		i2b2.SCILHSRequestHandler.model.pgstart = 1;
		i2b2.SCILHSRequestHandler.model.pgsize = 10;
		// set initial zoom values
		i2b2.SCILHSRequestHandler.model.zoomScale = 1.0;
		i2b2.SCILHSRequestHandler.model.zoomPan = 1.0;

		i2b2.SCILHSRequestHandler.model.required = {
			'id' : {
				'name' : 'Patient Number',
				'display' : false
			},
			'gender' : {
				'name' : 'Gender',
				'display' : true
			},
			'age' : {
				'name' : 'Age',
				'display' : true
			},
			'race' : {
				'name' : 'Race',
				'display' : true
			}
		};

		i2b2.SCILHSRequestHandler.model.showMetadataDialog = true;

		i2b2.SCILHSRequestHandler.model.csv = '';
		
		i2b2.SCILHSRequestHandler.model.firstVisit = true;
		i2b2.SCILHSRequestHandler.model.readyToPreview = false;
		i2b2.SCILHSRequestHandler.model.readyToProcess = false;
		i2b2.SCILHSRequestHandler.model.processLocked = false;
		// manage YUI tabs
		this.yuiTabs = new YAHOO.widget.TabView("SCILHSRequestHandler-TABS");
		
		this.yuiTabs.on('activeTabChange', function(ev) { 
			//Tabs have changed 
			if (ev.newValue.get('id')=="SCILHSRequestHandler-TAB2"){ // Preview Tab
				i2b2.SCILHSRequestHandler.processJob(1);
				/*if(i2b2.SCILHSRequestHandler.model.firstVisit){
					jQuery('#no-results-section-prev').show();
					jQuery('#results-section').hide();
				}
				else{
					jQuery('#no-results-section-prev').hide();
					jQuery('#results-section').show();
					
					//if(i2b2.SCILHSRequestHandler.model.readyToPreview){
					i2b2.SCILHSRequestHandler.processJob(1);
//						i2b2.SCILHSRequestHandler.newResults();
					//}
				}*/
			}
			if (ev.newValue.get('id')=="SCILHSRequestHandler-TAB3") { // Download Tab
				if(i2b2.SCILHSRequestHandler.model.firstVisit){
					jQuery('#no-results-section-file').show();
					jQuery('#results-section-file').hide();
				}
				else{
					jQuery('#no-results-section-file').hide();
					jQuery('#results-section-file').show();
				}
				i2b2.SCILHSRequestHandler.processJob(0);
/*				
					if(i2b2.SCILHSRequestHandler.model.readyToProcess && !i2b2.SCILHSRequestHandler.model.readyToPreview){
						i2b2.SCILHSRequestHandler.viewResults();
					} else if(i2b2.SCILHSRequestHandler.model.readyToPreview){
						jQuery('#no-results-section-file').show();
						jQuery('#results-section-file').hide();
					}
				}
*/
			}
			if (ev.newValue.get('id')=="SCILHSRequestHandler-TAB4") { // History Tab
				i2b2.SCILHSRequestHandler.getHistory();
			}
		});
	z = $('anaPluginViewFrame').getHeight() - 40;//- 34;  //BG vertical scrollbar display issues
        $$('DIV#SCILHSRequestHandler-TABS DIV.SCILHSRequestHandler-MainContent')[0].style.height = z;
        $$('DIV#SCILHSRequestHandler-TABS DIV.SCILHSRequestHandler-MainContent')[1].style.height = z;

	if( i2b2.PM.model.userRoles.indexOf("DATA_LDS") == -1 ){  // user does not have DATA_LDS role
			content =  "<div id='SCILHSRequestHandler-TABS' class='yui-navset'>\n";
			content += "<ul class='yui-nav'>\n";
			content += "<li id='SCILHSRequestHandler-TAB1' class='selected'><a href='#SCILHSRequestHandler-TAB1'><em>Notice</em></a></li>\n";
			content += "</ul>\n";
			content += "<div class='yui-content' id='SCILHSRequestHandler-CONTENT'>\n";
			content += "<div class='tab-body'>\n";
			content += "<div class='SCILHSRequestHandler-MainContent' style='color:#000;font-size:14px;'>\n";
			content += "<h1 style='padding-bottom:10px;'><img src='js-i2b2/cells/plugins/community/SCILHSRequestHandler/assets/csv_icon.png' align='absbottom'/> Biobank Portal Download Data</h1>\n";
			content += "<div style='padding: 10px; border-radius: 10px; border: 1px solid rgb(86, 158, 231); color: rgb(86, 158, 231); background: rgb(236, 251, 255);'><img style='margin-top:2px;margin-bottom:2px;' src='js-i2b2/cells/ONT/assets/info_icon.png' align='absmiddle'> Note: In order to download data from the Biobank Portal, you must either be a faculty sponsor in the RPDR, or you must be in the RPDR workgroup of a faculty sponsor.</div><br/>\n";
			content += "All downloads are audited closely. If you are not a faculty sponsor, your faculty sponsor will be notified and must approve your request for access. The faculty sponsor will also be notified of all download requests that you make.<br/><br/><br/>\n";
			content += "<strong>Please select your RPDR faculty sponsor:&nbsp;</strong>\n";
			content += "<select id='SCILHSRequestHandler-faculty'>\n";
			content += "</select><br/><br/><br/>\n";
			content += "If you do not see your faculty sponsor in the dropdown above, or have any other questions, please <a href='mailto:sduey@partners.org' target='_blank'>contact us</a>.<br/><br/><br/>\n";
			content += "<span id='SCILHSRequestHandler-facultysubmitted'><input style='font-size:16px;' type='button' value='Request Access Now' onclick='javascript:i2b2.SCILHSRequestHandler.submitRequest();return false;'/></a>\n";
			content += "</div></div></div></div>";
			
		jQuery('#SCILHSRequestHandler-mainDiv').html(content);
		jQuery('#SCILHSRequestHandler-MainContent').css("height",z+40);
		
		var url = "/CheckRpdrUserProxy.php?id=" + i2b2.PM.model.login_username;
		var rpdrUserCallback = {
		  success: function(o) {
			var rpdrUser = JSON.parse(o.responseText);
			i2b2.SCILHSRequestHandler.user = rpdrUser;
			for(var i=0; i<rpdrUser.sponsors.length; i++){
				jQuery('#SCILHSRequestHandler-faculty').append(jQuery("<option></option>").attr("value",rpdrUser.sponsors[i].surrogatename + " ("+rpdrUser.sponsors[i].surrogateid+")").text(rpdrUser.sponsors[i].surrogatename));
			}
		  },
		  failure: function(o) { alert('Unable to retrieve your list of faculty sponsors.'); }
		};
		var transaction = YAHOO.util.Connect.asyncRequest('GET', url, rpdrUserCallback);
		
	}

//	i2b2.SCILHSRequestHandler.conceptsRender();
	i2b2.SCILHSRequestHandler.initializeOntologyPrefix();
};

i2b2.SCILHSRequestHandler.initializeOntologyPrefix = function() {
	jQuery('#SCILHSRequestHandler-prefixText').val(i2b2.SCILHSRequestHandler.ontology.DEFAULT_PREFIX);
};

i2b2.SCILHSRequestHandler.submitRequest = function(){
		var url = "js-i2b2/cells/plugins/community/SCILHSRequestHandler/SCILHSRequestHandlerRequestProcess.php";
		var rpdrUserCallback = {
		  success: function(o) {
			if(o.responseText == "Done"){
				//$("GenomicsRequest-mainContent").style.display = "none";
				//$("GenomicsRequest-successContent").style.display = "block";
				jQuery('#SCILHSRequestHandler-facultysubmitted').html('Thank you, your access request has been submitted. You will receive an e-mail when your access has been approved.');
			} else if(o.responseText == "Pending"){
				jQuery('#SCILHSRequestHandler-facultysubmitted').html('There is another access request already pending for you. You will receive an e-mail when your access has been approved.');
			}
		  },
		  failure: function(o) {
			alert('There was an error with submitting the request.');
		  }
		};
		var postData = 'projectid='+i2b2.PM.model.login_project+'&SCILHSRequestHandler-faculty='+$("SCILHSRequestHandler-faculty").value+'&SCILHSRequestHandler-fullname='+ i2b2.SCILHSRequestHandler.user.fullname +'&SCILHSRequestHandler-email='+ i2b2.SCILHSRequestHandler.user.email +'&SCILHSRequestHandler-id='+ i2b2.SCILHSRequestHandler.user.id;
		var transaction = YAHOO.util.Connect.asyncRequest('POST', url, rpdrUserCallback, postData);

};

// 2.0: Download CSV for job_id
i2b2.SCILHSRequestHandler.downloadJob = function(job_id){

	jQuery('#downloadForm [name="user_id"]').val(i2b2.PM.model.login_username);
	jQuery('#downloadForm [name="session"]').val(i2b2.PM.model.login_password);
	jQuery('#downloadForm [name="job_id"]').val(job_id);
        jQuery('#downloadForm [name="domain"]').val(i2b2.PM.model.login_domain);
        jQuery('#downloadForm [name="pm_uri"]').val(i2b2.PM.model.url);
	jQuery('#downloadForm').submit();
	
};

// 2.0: User has selected previous query (patients) and concepts (aggregations)
i2b2.SCILHSRequestHandler.processJob = function(preview){

	var job = {};
	if(preview){
		if(i2b2.SCILHSRequestHandler.model.dirtyResultsData && !i2b2.SCILHSRequestHandler.model.previewLocked){
			if(i2b2.SCILHSRequestHandler.model.prsRecord){
				i2b2.SCILHSRequestHandler.setLocalUniqueNumber();
				job = {
					event_type_id: i2b2.SCILHSRequestHandler.downloadID,
					query_master_id: i2b2.SCILHSRequestHandler.queryMasterId,
					model: i2b2.SCILHSRequestHandler.model,
					filterlist: i2b2.SCILHSRequestHandler._getPDOFilterList(),
					patient_set_size: parseInt(i2b2.SCILHSRequestHandler.active.size),
					patient_set_coll_id: i2b2.SCILHSRequestHandler.model.prsRecord.sdxInfo.sdxKeyValue,
					userid: i2b2.PM.model.login_username,
					project: i2b2.PM.model.login_project,
					login_password: i2b2.PM.model.login_password,
					status: "NEW",
					payload: "New Job"
				};

				jQuery.post('js-i2b2/cells/plugins/community/SCILHSRequestHandler/helper.php',{
					job: JSON.stringify(job),
					preview: 1
				})
				.success(function(job_id){
					i2b2.SCILHSRequestHandler.activeJobID = job_id;
					i2b2.SCILHSRequestHandler.newResults(job_id);
					i2b2.SCILHSRequestHandler.model.readyToProcess = false;
				})
				.error(function(){
					alert('Preview Error');
				});
			} else {
				alert('In order to continue, you must first select a valid patient set.');
			}
		} else {
			$('SCILHSRequestHandler-TAB2').click();
		}
	} else {
		if(i2b2.SCILHSRequestHandler.model.readyToProcess){
			if(!i2b2.SCILHSRequestHandler.model.processLocked){
				job = {
					id: i2b2.SCILHSRequestHandler.activeJobID
				};
				jQuery.post('js-i2b2/cells/plugins/community/SCILHSRequestHandler/helper.php',{
					job: JSON.stringify(job),
					preview: 0
				})
				.success(function(job_id){
					i2b2.SCILHSRequestHandler.downloadResults(job_id);
				})
				.error(function(){
					alert('Download Error');
				});
			} else {
				$('SCILHSRequestHandler-TAB3').click();
			}
		} else {
			alert('In order to continue, you must first preview your data file.');
			
		}
	}

	
};

// 2.0: Get History

i2b2.SCILHSRequestHandler.getHistory = function(){
	$('SCILHSRequestHandler-HistoryProject').innerHTML = 'for ' + i2b2.PM.model.login_projectname;
	$('SCILHSRequestHandler-History').innerHTML = 'Loading...';
	jQuery.ajax({
		type: 'POST',
		url: "js-i2b2/cells/plugins/community/SCILHSRequestHandler/history.php",
		data: {
		    pm_uri : i2b2.PM.model.url,
			domain : i2b2.PM.model.login_domain,
			user_id : i2b2.PM.model.login_username,
			session: i2b2.PM.model.login_password,
			project: i2b2.PM.model.login_project
			  },
		success: function(history){
			$('SCILHSRequestHandler-History').innerHTML = history;
		},
		error: function(history){
			$('SCILHSRequestHandler-History').innerHTML = 'Unable to fetch history at this time. Please try again later.';
		}
	});
	return false;
};

// 2.0: Cancel job
i2b2.SCILHSRequestHandler.cancelJob = function(job_id){

	if(!job_id){
		job_id = i2b2.SCILHSRequestHandler.activeJobID;
	}

	jQuery.post('js-i2b2/cells/plugins/community/SCILHSRequestHandler/cancel.php',{
		job_id: job_id
	})
	.success(function(result){
		alert(result);
		i2b2.SCILHSRequestHandler.getHistory();
		// get job id
		// show results 
	})
	.error(function(){
		alert('The cancelling of this job has failed.');
	});
	
};

// 2.0: Re-run job
i2b2.SCILHSRequestHandler.rerunJob = function(job_id){

	jQuery.post('js-i2b2/cells/plugins/community/SCILHSRequestHandler/rerun.php',{
		job_id: job_id,
		user_id : i2b2.PM.model.login_username,
		session: i2b2.PM.model.login_password
	})
	.success(function(result){
		alert(result);
		i2b2.SCILHSRequestHandler.getHistory();
		// get job id
		// show results 
	})
	.error(function(){
		alert('The re-running of this job has failed.');
	});
	
};


// 2.0: Date Constraints
i2b2.SCILHSRequestHandler.constructDateRangeConstraintXML = function( conceptIndex ){
    var fromMoment   = null;
    var toMoment     = null;
    if ( i2b2.SCILHSRequestHandler.model.concepts[conceptIndex].dateFrom )
        fromMoment = new moment(i2b2.SCILHSRequestHandler.model.concepts[conceptIndex].dateFrom.Year + "-" + padNumber(i2b2.SCILHSRequestHandler.model.concepts[conceptIndex].dateFrom.Month, 2) + "-" + padNumber(i2b2.SCILHSRequestHandler.model.concepts[conceptIndex].dateFrom.Day, 2));
    if (i2b2.SCILHSRequestHandler.model.concepts[conceptIndex].dateTo)
        var toMoment = new moment(i2b2.SCILHSRequestHandler.model.concepts[conceptIndex].dateTo.Year + "-" + padNumber(i2b2.SCILHSRequestHandler.model.concepts[conceptIndex].dateTo.Month, 2) + "-" + padNumber(i2b2.SCILHSRequestHandler.model.concepts[conceptIndex].dateTo.Day, 2));

    var xml = '';
    if (!i2b2.SCILHSRequestHandler.model.concepts[conceptIndex].dateFrom && !i2b2.SCILHSRequestHandler.model.concepts[conceptIndex].dateTo)
        return '';
    else if (i2b2.SCILHSRequestHandler.model.concepts[conceptIndex].dateFrom && !i2b2.SCILHSRequestHandler.model.concepts[conceptIndex].dateTo)
        xml = '\t\t\t<constrain_by_date>\n' +
              '\t\t\t\t<date_from time="start_date" inclusive= "yes">' + fromMoment.format() + '</date_from>\n' +
              '\t\t\t</constrain_by_date>\n';
    else if (!i2b2.SCILHSRequestHandler.model.concepts[conceptIndex].dateFrom && i2b2.SCILHSRequestHandler.model.concepts[conceptIndex].dateTo)
        xml = '\t\t\t<constrain_by_date>\n' +
              '\t\t\t\t<date_to time="start_date" inclusive= "yes">' + toMoment.format() + '</date_to>\n' +
              '\t\t\t</constrain_by_date>\n';
    else
        xml = '\t\t\t<constrain_by_date>\n' +
              '\t\t\t\t<date_from time="start_date" inclusive= "yes">' + fromMoment.format() + '</date_from>\n' +
              '\t\t\t\t<date_to time="start_date" inclusive= "yes">' + toMoment.format() + '</date_to>\n' +
              '\t\t\t</constrain_by_date>\n';
    return xml;
}

// 2.0: Value Constraints

/* returns the XML ValueMetaData*/
i2b2.SCILHSRequestHandler.retrieveValueConstraint = function( conceptIndex )
{
    var values = undefined;
    // if the current concept is the last dropped concept and if its sdx comes with lab values (as in the case where the concept is part of a prev query), use it.
    /*if (i2b2.SCILHSRequestHandler.lastDroppedTerm &&
        (Object.is(i2b2.SCILHSRequestHandler.lastDroppedTerm, i2b2.SCILHSRequestHandler.model.concepts[conceptIndex])) &&
        i2b2.SCILHSRequestHandler.model.concepts[conceptIndex].sdxData.LabValues) */
    if (i2b2.SCILHSRequestHandler.lastDroppedTerm &&
        i2b2.SCILHSRequestHandler.lastDroppedTerm === i2b2.SCILHSRequestHandler.model.concepts[conceptIndex] &&
        i2b2.SCILHSRequestHandler.model.concepts[conceptIndex].sdxData.LabValues)
    {
        values = i2b2.SCILHSRequestHandler.model.concepts[conceptIndex].sdxData.LabValues;
        delete i2b2.SCILHSRequestHandler.model.concepts[conceptIndex].sdxData.LabValues;  // delete LabValues because we have saved it
    }
    else
        values = i2b2.SCILHSRequestHandler.model.concepts[conceptIndex].valueRestriction; // read from the constraint saved in the concept object
    return values;
};

// 2.0: Internal function to get PDO filter list
i2b2.SCILHSRequestHandler._getPDOFilterList = function(){

	var filterList = '';
	for (var i1 = 0; i1 < i2b2.SCILHSRequestHandler.model.concepts.length; i1++) {
		var sdxData = i2b2.SCILHSRequestHandler.model.concepts[i1].sdxData;
		if (sdxData.origData.isModifier){ // deal with modifiers
			var modParent = sdxData.origData.parent;
			var level = sdxData.origData.level;
			var key = sdxData.origData.parent.key;
			var name = (sdxData.origData.parent.name != null ? i2b2.h.Escape(sdxData.origData.parent.name) : i2b2.h.Escape(sdxData.origData.name));
			var tooltip = sdxData.origData.tooltip;
			var itemicon = sdxData.origData.hasChildren;
			while (modParent != null){ // find the first ancestor that is not a modifer
				if (modParent.isModifier)
					modParent = modParent.parent;
				else {
					level = modParent.level;
					key = modParent.key;
					name = modParent.name;
					tooltip = modParent.tooltip;
					itemicon = modParent.hasChildren;
					break;
				}
			}

			// get XML representation of the modifier's value restrictions
			var modifierConstraints = (i2b2.SCILHSRequestHandler.model.concepts[i1].valueRestriction != null) ? i2b2.CRC.view.modLabvaluesCtlr.getModLabValuesForXML(i2b2.SCILHSRequestHandler.model.concepts[i1].valueRestriction) : "";
			filterList +=
				'	<panel name="' + i2b2.SCILHSRequestHandler.model.concepts[i1].panel + '">\n' +
				'		<panel_number>0</panel_number>\n' +
				'		<panel_accuracy_scale>0</panel_accuracy_scale>\n' +
				'		<invert>0</invert>\n' +
				'		<item>\n' +
				'			<hlevel>1</hlevel>\n'+
				'           <item_key>' + key + '</item_key>\n'+
				'           <item_name>' + name + '</item_name>\n' +
				'           <tooltip>' + tooltip + '</tooltip>\n' +
				'           <item_icon>' + itemicon + '</item_icon>\n' +
				'           <class>ENC</class>\n' +
				'           <item_is_synonym>false</item_is_synonym>\n' +

				'           <constrain_by_modifier>\n' +
				'              <modifier_name>' + sdxData.origData.name  + '</modifier_name>\n' +
				'              <applied_path>' + sdxData.origData.applied_path + '</applied_path>\n' + 
				'              <modifier_key>' + sdxData.origData.key +  '</modifier_key>\n' +
							   modifierConstraints +
				'           </constrain_by_modifier>\n';
			filterList += '		</item>\n' + '	</panel>\n';
		}
		else { // deal with normal concepts
			// get XML representation of the concept's value restrictions
			var valueConstraints = (i2b2.SCILHSRequestHandler.model.concepts[i1].valueRestriction != null) ? i2b2.CRC.view.modLabvaluesCtlr.getModLabValuesForXML(i2b2.SCILHSRequestHandler.model.concepts[i1].valueRestriction) : "";
			var dateConstraints = i2b2.SCILHSRequestHandler.constructDateRangeConstraintXML(i1);
			var t = sdxData.origData.xmlOrig;
			var cdata = {};
			cdata.level = i2b2.h.getXNodeVal(t, "level");
			cdata.key = i2b2.h.getXNodeVal(t, "key");
			cdata.tablename = i2b2.h.getXNodeVal(t, "tablename");
			cdata.dimcode = i2b2.h.getXNodeVal(t, "dimcode");
			cdata.synonym = i2b2.h.getXNodeVal(t, "synonym_cd");
				filterList +=
				'	<panel name="'+i2b2.SCILHSRequestHandler.model.concepts[i1].panel+'">\n'+
				'		<panel_number>' + i1 + '</panel_number>\n'+
				'		<panel_accuracy_scale>0</panel_accuracy_scale>\n'+
				'		<invert>0</invert>\n'+
				'		<item>\n'+
				'			<hlevel>'+cdata.level+'</hlevel>\n'+
				'			<item_key>'+cdata.key+'</item_key>\n'+
				'			<dim_tablename>'+cdata.tablename+'</dim_tablename>\n'+
				'			<dim_dimcode>'+cdata.dimcode+'</dim_dimcode>\n'+
				'			<item_is_synonym>'+cdata.synonym+'</item_is_synonym>\n' +
				'          ' + valueConstraints + '\n' +
				'          ' + dateConstraints;
				filterList +='		</item>\n' + '	</panel>\n';
		}		
	}

	return filterList;
		
};

// 2.0
i2b2.SCILHSRequestHandler._getJobStatus = function(job_id){
    jQuery.ajax({
		type: 'GET',
		url: "js-i2b2/cells/plugins/community/SCILHSRequestHandler/status.php",
		data: { job_id : job_id },
		dataType: 'json',
		cache: false,
		success: function(job){
			if(job.status == 'NEW'){
				i2b2.SCILHSRequestHandler.model.readyToProcess = false;
				setTimeout(function(){
					i2b2.SCILHSRequestHandler._getJobStatus(job_id);
				}, 2000);
			}
			else if(job.status == 'PREVIEW'){
				jQuery('#SCILHSRequestHandler-PreviewResults tr:gt(1)').remove();
				jQuery('#SCILHSRequestHandler-PreviewResults tr:last').after(job.payload);
				var currentdate = new Date();
				var datetime = (currentdate.getMonth() + 1) + "/"
			                                                + currentdate.getDate() + "/"
			                                                + currentdate.getFullYear() + " @ "
			                                                + currentdate.getHours() + ":"
			                                                + currentdate.getMinutes() + ":"
			                                                + currentdate.getSeconds();
				var processTime = document.getElementById('SCILHSRequestHandler-ProcessTime');
				var previewText = document.getElementById('SCILHSRequestHandler-PreviewText');
				$('SCILHSRequestHandler-Status').hide();
				//processTime.innerHTML = processTime.innerHTML + " | Finished: " + datetime;
				var previewNumber = 5;
				if(parseInt(i2b2.SCILHSRequestHandler.active.size) < 5){
					previewNumber = parseInt(i2b2.SCILHSRequestHandler.active.size);
				}
				previewText.innerHTML = "Below is a preview of the first "+previewNumber+" out of "+i2b2.SCILHSRequestHandler.active.size+" records from the requested data. If you are satisfied, click on <strong>Proceed to Download</strong> to start processing the entire file.";
				processTime.innerHTML = "<img src='js-i2b2/cells/plugins/community/SCILHSRequestHandler/assets/file.png' align='absbottom'/> Your data file will contain <span style='font-size: 19px;color: #399ae7;'>"+i2b2.SCILHSRequestHandler.active.size+"</span> rows, one row per patient (plus a header row) and <span style='font-size: 19px;color: #399ae7;'>"+i2b2.SCILHSRequestHandler.model.columns+"</span> columns as specified, delimited by commas.";
				//var statusText = document.getElementById('SCILHSRequestHandler-Status');
				//statusText.innerHTML = "<a href='javascript:i2b2.SCILHSRequestHandler.processJob(0)'>Proceed to Download</a>";
				$('SCILHSRequestHandler-PreviewButton').innerHTML = '<input onclick="i2b2.SCILHSRequestHandler.processJob(1);" type="button" class="SCILHSRequestHandler-button" value="Next ( Preview Data File )" /><br/><br/><br/>';
				$('SCILHSRequestHandler-ProceedButton').show();
				i2b2.SCILHSRequestHandler.model.processLocked = false;
				i2b2.SCILHSRequestHandler.model.previewLocked = false;
				i2b2.SCILHSRequestHandler.model.dirtyResultsData = false;
				i2b2.SCILHSRequestHandler.model.readyToProcess = true;
			}
			else if(job.status == 'PROCESSING'){
				i2b2.SCILHSRequestHandler.model.processLocked = true;
				$('SCILHSRequestHandler-Processed').innerHTML = job.payload;
				
				setTimeout(function(){
					i2b2.SCILHSRequestHandler._getJobStatus(job_id);
				}, 2000);
			
			}
			else if(job.status == 'CANCELLED'){
				i2b2.SCILHSRequestHandler.model.processLocked = true;
				$('SCILHSRequestHandler-StatusView').innerHTML = job.payload;
			}
			else if(job.status == 'FINISHED'){
				i2b2.SCILHSRequestHandler.model.processLocked = true;
				$('SCILHSRequestHandler-StatusView').innerHTML = "<a class=\"SCILHSRequestHandler-button\" style=\"text-decoration:none;font-size:15px;\" href=\"#\" onclick=\"javascript:i2b2.SCILHSRequestHandler.downloadJob('"+job_id+"');return false;\">Download Data File</a>";
			}
			
			
		},
		error: function(job){
			i2b2.SCILHSRequestHandler.model.previewLocked = false;
			alert('There was an error processing your request.');
		}
	});
};


//This method generates and displays the patient dataset from previous query
i2b2.SCILHSRequestHandler.newResults = function(job_id){

	//if ((i2b2.SCILHSRequestHandler.model.concepts.length > 0) && i2b2.SCILHSRequestHandler.model.prsRecord)
    if (i2b2.SCILHSRequestHandler.model.prsRecord)
    {
        i2b2.SCILHSRequestHandler.setLocalUniqueNumber(); //Set the uniqueid for the download operation
		i2b2.SCILHSRequestHandler.previewRequested = true;
		i2b2.SCILHSRequestHandler.previewResults(job_id);
	    $('SCILHSRequestHandler-TAB2').click();
    }
};

// 2.0: Download Results

i2b2.SCILHSRequestHandler.downloadResults = function(job_id){
	try{
		$('SCILHSRequestHandler-TAB3').click();
	}
	catch(e)
	{
		//console.log(e);
	}
	jQuery('#SCILHSRequestHandler-Status').hide();

    $('SCILHSRequestHandler-StatusView').innerHTML = '<img src="js-i2b2/cells/plugins/community/SCILHSRequestHandler/assets/ajax.gif" align="absmiddle"/> Processed <span id="SCILHSRequestHandler-Processed" style="font-weight:bold;"></span> [<a href="#" onclick="javascript:i2b2.SCILHSRequestHandler.cancelJob();return false;">Cancel</a>]';
    $('SCILHSRequestHandler-StatusView').show();
    
    i2b2.SCILHSRequestHandler.model.processed = 0;

    $('SCILHSRequestHandler-Processed').innerHTML = '0 of '+i2b2.SCILHSRequestHandler.active.size+' patients';
    var currentdate = new Date();
    var datetime =    (currentdate.getMonth() + 1)  + "-"
                                                    + currentdate.getDate() + "-"
                                                    + currentdate.getFullYear() + " @ "
                                                    + currentdate.getHours() + ":"
                                                    + currentdate.getMinutes() + ":"
                                                    + currentdate.getSeconds();

    //$('SCILHSRequestHandler-DownloadLink').hide();
    $('SCILHSRequestHandler-ProcessTime').innerHTML = "Process Started: " + datetime;

	setTimeout(function(){
		i2b2.SCILHSRequestHandler._getJobStatus(job_id);
	}, 2000);

};

//This method starts creating the result table and the headers.
i2b2.SCILHSRequestHandler.previewResults = function (job_id){
	
	i2b2.SCILHSRequestHandler.model.previewLocked = true;
	$('SCILHSRequestHandler-ProcessTime').innerHTML = '';
	$('no-results-section-prev').hide();

	// While preview is going on, hide the "Preview" and "Proceed to Download" buttons
	$('SCILHSRequestHandler-PreviewButton').innerHTML = '<img src="js-i2b2/cells/plugins/community/SCILHSRequestHandler/assets/ajax.gif" align="absmiddle"/> Generating Preview...<br/><br/><br/>';
	$('SCILHSRequestHandler-ProceedButton').hide();

	$('results-section').show();
    $('SCILHSRequestHandler-Status').show(); // AJAX icon
	var previewNumber = 5;
	if(parseInt(i2b2.SCILHSRequestHandler.active.size) < 5){
		previewNumber = parseInt(i2b2.SCILHSRequestHandler.active.size);
	}
	$('SCILHSRequestHandler-PreviewText').innerHTML = 'Generating a preview of the first '+ previewNumber +' out of ' + i2b2.SCILHSRequestHandler.active.size + ' records...';
    
    i2b2.SCILHSRequestHandler.model.processed = 0;
	i2b2.SCILHSRequestHandler.model.columns = 0;
    var viewResults = $('SCILHSRequestHandler-PreResults');
    var patientSetSize = i2b2.SCILHSRequestHandler.active.size;
    var processTime = $('SCILHSRequestHandler-ProcessTime');
    var currentdate = new Date();
    var datetime =    (currentdate.getMonth() + 1)  + "-"
                                                    + currentdate.getDate() + "-"
                                                    + currentdate.getFullYear() + " @ "
                                                    + currentdate.getHours() + ":"
                                                    + currentdate.getMinutes() + ":"
                                                    + currentdate.getSeconds();

    //processTime.innerHTML = "Process Started: " + datetime;

	var tableHTML = "<table id='SCILHSRequestHandler-PreviewResults' cellspacing='0'><tr><th style='width:20px;'> </th>\n";
	var columnKeys = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','AA','AB','AC','AD','AE','AF','AG','AH','AI','AJ','AK','AL','AM','AN','AO','AP','AQ','AR','AS','AT','AU','AV','AW','AX','AY','AZ'];
	var headerHTML = "<tr><td style='background: #ebebeb;'>1</td>\n";
	
        for (var key in i2b2.SCILHSRequestHandler.model.required) {
	    if (i2b2.SCILHSRequestHandler.model.required.hasOwnProperty(key)) {
		if(i2b2.SCILHSRequestHandler.model.required[key].display){
		    tableHTML += "<th>"+columnKeys[i2b2.SCILHSRequestHandler.model.columns]+"</th>";
		    headerHTML += "<td style='border-bottom: 1px solid #e0e0e0;'>"+i2b2.SCILHSRequestHandler.model.required[key].name+"</td>";
		    i2b2.SCILHSRequestHandler.model.columns++;
		}
	    }
        }

	for (var j = 0; j < i2b2.SCILHSRequestHandler.model.concepts.length; j++){
	    tableHTML += "<th>"+columnKeys[i2b2.SCILHSRequestHandler.model.columns]+"</th>";
	    headerHTML += "<td style='border-bottom: 1px solid #e0e0e0;'>" + i2b2.SCILHSRequestHandler.model.concepts[j].textDisplay + "<br/>[" + i2b2.SCILHSRequestHandler.model.concepts[j].dataOption + "]"+i2b2.SCILHSRequestHandler.makeDateRangeConstraintText(j)+"</td>";
	    i2b2.SCILHSRequestHandler.model.columns++;
	}

	tableHTML += headerHTML;
	tableHTML += "</tr></table>";
	viewResults.innerHTML = tableHTML;

	setTimeout(function(){
		i2b2.SCILHSRequestHandler._getJobStatus(job_id);
	}, 2000);
	
	i2b2.SCILHSRequestHandler.model.readyToPreview = false;
	//i2b2.SCILHSRequestHandler.model.readyToProcess = true;
};

//This method starts creating the result table and the headers.
i2b2.SCILHSRequestHandler.viewResults = function ()
{
	i2b2.SCILHSRequestHandler.model.readyToProcess = false;
	i2b2.SCILHSRequestHandler.dataRequested = true;
	try{
		$('SCILHSRequestHandler-TAB3').click();
	}
	catch(e)
	{
		//console.log(e);
	}
	jQuery('#SCILHSRequestHandler-Status').hide();

    $('SCILHSRequestHandler-StatusView').innerHTML = '<img src="js-i2b2/cells/plugins/community/SCILHSRequestHandler/assets/ajax.gif" align="absmiddle"/> Processed <span id="SCILHSRequestHandler-Processed" style="font-weight:bold;">0</span> of <span id="SCILHSRequestHandler-PatientSetSize" style="font-weight:bold;">0</span> patients...';
    $('SCILHSRequestHandler-StatusView').show();
    
    i2b2.SCILHSRequestHandler.model.processed = 0;

    var viewResults = $('SCILHSRequestHandler-ViewResults');
    var processedText = $('SCILHSRequestHandler-Processed');
    var patientSetSizeText = document.getElementById('SCILHSRequestHandler-PatientSetSize');
    var patientSetSize = i2b2.SCILHSRequestHandler.active.size;
    var processTime = $('SCILHSRequestHandler-ProcessTime');
    var currentdate = new Date();
    var datetime =    (currentdate.getMonth() + 1)  + "-"
                                                    + currentdate.getDate() + "-"
                                                    + currentdate.getFullYear() + " @ "
                                                    + currentdate.getHours() + ":"
                                                    + currentdate.getMinutes() + ":"
                                                    + currentdate.getSeconds();

    //$('SCILHSRequestHandler-DownloadLink').hide();
    processTime.innerHTML = "Process Started: " + datetime;
    //processedText.innerHTML = 0;
    patientSetSizeText.innerHTML = patientSetSize;

	if(i2b2.SCILHSRequestHandler.viewResultsTableOption)
		var tableHTML = "<table id='SCILHSRequestHandler-Results' cellspacing='0'><tr>\n";
	i2b2.SCILHSRequestHandler.model.csv = '';
	var requiredfound = false;
	for (var key in i2b2.SCILHSRequestHandler.model.required) {
		if (i2b2.SCILHSRequestHandler.model.required.hasOwnProperty(key)) {
			if(i2b2.SCILHSRequestHandler.model.required[key].display){
				requiredfound = true;
				i2b2.SCILHSRequestHandler.model.csv += i2b2.SCILHSRequestHandler.model.required[key].name + ",";
				if(i2b2.SCILHSRequestHandler.viewResultsTableOption)
					tableHTML += "<th>"+i2b2.SCILHSRequestHandler.model.required[key].name+"</th>";
			}
		}	
	}

    //tableHTML += "<tr><th>Subject ID</th><th>i2b2 Number</th><th>Gender</th><th>Age</th><th>Race</th><th>DNA</th><th>Plasma</th><th>Serum</th>";
    //i2b2.SCILHSRequestHandler.model.csv = "subject_id,i2b2_patient_num,gender,age,race,dna,plasma,serum";
	
    for (var j = 0; j < i2b2.SCILHSRequestHandler.model.concepts.length; j++){
		//tableHTML += "<th>" + i2b2.SCILHSRequestHandler.model.concepts[j].sdxData.origData.name + " ("+i2b2.SCILHSRequestHandler.model.concepts[j].sdxData.origData.basecode+")</th>";
		//tableHTML += "<th>" + i2b2.SCILHSRequestHandler.model.concepts[j].sdxData.origData.name + "</th>";
		if(i2b2.SCILHSRequestHandler.viewResultsTableOption)
			tableHTML += "<th>" + i2b2.SCILHSRequestHandler.model.concepts[j].textDisplay + "<br/>[" + i2b2.SCILHSRequestHandler.model.concepts[j].dataOption + "]"+i2b2.SCILHSRequestHandler.makeDateRangeConstraintText(j)+"</th>";
		
		i2b2.SCILHSRequestHandler.model.csv += i2b2.SCILHSRequestHandler.model.concepts[j].textDisplay + " (" + i2b2.SCILHSRequestHandler.model.concepts[j].dataOption + ")";
		i2b2.SCILHSRequestHandler.model.csv += ",";
		i2b2.SCILHSRequestHandler.model.csv = i2b2.SCILHSRequestHandler.model.csv.replace('&lt;','<');
		i2b2.SCILHSRequestHandler.model.csv = i2b2.SCILHSRequestHandler.model.csv.replace('&gt;','>');
		i2b2.SCILHSRequestHandler.model.csv = i2b2.SCILHSRequestHandler.model.csv.replace('&le;','<=');
		i2b2.SCILHSRequestHandler.model.csv = i2b2.SCILHSRequestHandler.model.csv.replace('&ge;','>=');
    }
    if(i2b2.SCILHSRequestHandler.viewResultsTableOption)
		tableHTML += "</tr></table>";
	i2b2.SCILHSRequestHandler.model.csv = i2b2.SCILHSRequestHandler.model.csv.substring(0, i2b2.SCILHSRequestHandler.model.csv.length - 1);  // trim last comma
    i2b2.SCILHSRequestHandler.model.csv += "\n";
    if(i2b2.SCILHSRequestHandler.viewResultsTableOption)
		viewResults.innerHTML = tableHTML;

    i2b2.SCILHSRequestHandler.getResults(1, i2b2.SCILHSRequestHandler.model.pageSize, false);
};


/* ==================================================================================================================
 * Debug methods to output debug message to external window. Can be disabled by setting i2b2.SCILHSRequestHandler.debug to false.
 * ================================================================================================================== */
var reviewWindow = undefined;           // external window used for debugging
i2b2.SCILHSRequestHandler.debug = {};               // declare the debug namespaces;
i2b2.SCILHSRequestHandler.debug.externalWindow = {};
i2b2.SCILHSRequestHandler.debug.externalWindow.startViewResults= function()
{
    var cd = new Date();
    var dt = (cd.getMonth() + 1) + "/"
                    + cd.getDate() + "/"
                    + cd.getFullYear() + " @ "
                    + cd.getHours() + ":"
                    + cd.getMinutes() + ":"
                    + cd.getSeconds();
    reviewWindow.document.write("<p>[START GETTING NEW PATIENTS(" + i2b2.SCILHSRequestHandler.active.size + ")] (" + dt + ")</p>\n");
};

i2b2.SCILHSRequestHandler.debug.externalWindow.startGetResults = function(minValue, maxValue)
{
    var cd = new Date();
    var dt = (cd.getMonth() + 1) + "/"
                    + cd.getDate() + "/"
                    + cd.getFullYear() + " @ "
                    + cd.getHours() + ":"
                    + cd.getMinutes() + ":"
                    + cd.getSeconds();
    reviewWindow.document.write("<p>[Sending for " + minValue + "-" + maxValue + "] (" + dt + ")</p>\n");
};

i2b2.SCILHSRequestHandler.debug.externalWindow.endGetResults = function (minValue, maxValue)
{
    var cd2 = new Date();
    var dt2 = (cd2.getMonth() + 1) + "/"
                    + cd2.getDate() + "/"
                    + cd2.getFullYear() + " @ "
                    + cd2.getHours() + ":"
                    + cd2.getMinutes() + ":"
                    + cd2.getSeconds();
    reviewWindow.document.write("<p>[Received " + minValue + "-" + maxValue + "] (" + dt2 + ")</p>\n");
};

i2b2.SCILHSRequestHandler.debug.externalWindow.out = function (message)
{ reviewWindow.document.write(message); };
/* end of Debug methods to output debug message to external window. */

i2b2.SCILHSRequestHandler.getResults = function ( minValue, maxValue, preview )
{
    if (i2b2.SCILHSRequestHandler.model.dirtyResultsData )
    {
		jQuery("#iframeHolder").hide()
		// translate the concept XML for injection as PDO item XML
		var filterList = '';
		for (var i1 = 0; i1 < i2b2.SCILHSRequestHandler.model.concepts.length; i1++)
		{
		    var sdxData = i2b2.SCILHSRequestHandler.model.concepts[i1].sdxData;
		    if (sdxData.origData.isModifier) // deal with modifiers
            {
		        var modParent = sdxData.origData.parent;
		        var level = sdxData.origData.level;
		        var key = sdxData.origData.parent.key;
		        var name = (sdxData.origData.parent.name != null ? i2b2.h.Escape(sdxData.origData.parent.name) : i2b2.h.Escape(sdxData.origData.name));
		        var tooltip = sdxData.origData.tooltip;
		        var itemicon = sdxData.origData.hasChildren;
		        while (modParent != null) // find the first ancestor that is not a modifer
                {
		            if (modParent.isModifier)
		                modParent = modParent.parent;
		            else 
                    {
		                level = modParent.level;
		                key = modParent.key;
		                name = modParent.name;
		                tooltip = modParent.tooltip;
		                itemicon = modParent.hasChildren;
		                break;
		            }
		        }

		        // get XML representation of the modifier's value restrictions
		        var modifierConstraints = (i2b2.SCILHSRequestHandler.model.concepts[i1].valueRestriction != null) ? i2b2.CRC.view.modLabvaluesCtlr.getModLabValuesForXML(i2b2.SCILHSRequestHandler.model.concepts[i1].valueRestriction) : "";
		        filterList +=
                    '	<panel name="' + sdxData.origData.key + '">\n' +
                    '		<panel_number>0</panel_number>\n' +
                    '		<panel_accuracy_scale>0</panel_accuracy_scale>\n' +
                    '		<invert>0</invert>\n' +
                    '		<item>\n' +
                    '			<hlevel>1</hlevel>\n'+
                    '           <item_key>' + key + '</item_key>\n'+
                    '           <item_name>' + name + '</item_name>\n' +
                    '           <tooltip>' + tooltip + '</tooltip>\n' +
                    '           <item_icon>' + itemicon + '</item_icon>\n' +
                    '           <class>ENC</class>\n' +
                    '           <item_is_synonym>false</item_is_synonym>\n' +

                    '           <constrain_by_modifier>\n' +
                    '              <modifier_name>' + sdxData.origData.name  + '</modifier_name>\n' +
                    '              <applied_path>' + sdxData.origData.applied_path + '</applied_path>\n' + 
                    '              <modifier_key>' + sdxData.origData.key +  '</modifier_key>\n' +
                                   modifierConstraints +
                    '           </constrain_by_modifier>\n';
                filterList += '		</item>\n' + '	</panel>\n';
            }
            else // deal with normal concepts
            {
		        // get XML representation of the concept's value restrictions
		        var valueConstraints = (i2b2.SCILHSRequestHandler.model.concepts[i1].valueRestriction != null) ? i2b2.CRC.view.modLabvaluesCtlr.getModLabValuesForXML(i2b2.SCILHSRequestHandler.model.concepts[i1].valueRestriction) : "";

		        var t = sdxData.origData.xmlOrig;
		        var cdata = {};
		        cdata.level = i2b2.h.getXNodeVal(t, "level");
		        cdata.key = i2b2.h.getXNodeVal(t, "key");
		        cdata.tablename = i2b2.h.getXNodeVal(t, "tablename");
		        cdata.dimcode = i2b2.h.getXNodeVal(t, "dimcode");
		        cdata.synonym = i2b2.h.getXNodeVal(t, "synonym_cd");
			        filterList +=
			        '	<panel name="'+cdata.key+'">\n'+
			        '		<panel_number>' + i1 + '</panel_number>\n'+
			        '		<panel_accuracy_scale>0</panel_accuracy_scale>\n'+
			        '		<invert>0</invert>\n'+
			        '		<item>\n'+
			        '			<hlevel>'+cdata.level+'</hlevel>\n'+
			        '			<item_key>'+cdata.key+'</item_key>\n'+
			        '			<dim_tablename>'+cdata.tablename+'</dim_tablename>\n'+
			        '			<dim_dimcode>'+cdata.dimcode+'</dim_dimcode>\n'+
			        '			<item_is_synonym>'+cdata.synonym+'</item_is_synonym>\n' +
                    '          ' + valueConstraints;
			        filterList +='		</item>\n' + '	</panel>\n';
            }
			
			
		}

		var pgstart = i2b2.SCILHSRequestHandler.model.pgstart;
		var pgend = pgstart + i2b2.SCILHSRequestHandler.model.pgsize - 1;
		var msg_filter = '<input_list>\n' +
			'	<patient_list max="' + maxValue + '" min="' + minValue + '">\n'+
			'		<patient_set_coll_id>' + i2b2.SCILHSRequestHandler.model.prsRecord.sdxInfo.sdxKeyValue + '</patient_set_coll_id>\n' +
			'	</patient_list>\n'+
			'</input_list>\n'+
			'<filter_list>\n'+
				filterList+
			'</filter_list>\n'+
			'<output_option names="asattributes">\n'+
            '	<observation_set blob="false" onlykeys="false"/>\n'+
			/*'	<observation_set selectionFilter="first_value" blob="false" onlykeys="false"/>\n'+ */
			'	<patient_set select="using_input_list" onlykeys="false"/>\n'+
			'</output_option>\n';


		// callback processor
		var scopedCallback = new i2b2_scopedCallback();
		scopedCallback.scope = this;
		scopedCallback.callback = function (results)
		{
			// THIS function is used to process the AJAX results of the getChild call
			//		results data object contains the following attributes:
			//			refXML: xmlDomObject <--- for data processing
			//			msgRequest: xml (string)
			//			msgResponse: xml (string)
			//			error: boolean
			//			errorStatus: string [only with error=true]
			//			errorMsg: string [only with error=true]			
			// check for errors
			if (results.error)
			{
			    //Retry the call
			    //console.log('Error during getResults for minValue: ' + minValue + ', maxValue: ' + maxValue + '. Retrying...');
			    if (i2b2.SCILHSRequestHandler.debug.useReviewWindow)
			        i2b2.SCILHSRequestHandler.debug.externalWindow.out("<p>[Failed " + minValue + "-" + maxValue + ". Retry.] </p>");
			    i2b2.SCILHSRequestHandler.getResults(minValue, maxValue, false);
			    return false;
			}
			var s = '';
			var patients = {};
			// get all the patient records
			var pData = i2b2.h.XPath(results.refXML, '//patient');
			for (var i = 0; i < pData.length; i++)
			{                
				var patientID = i2b2.h.getXNodeVal(pData[i], "patient_id");
				var subjectID = i2b2.h.XPath(pData[i], 'descendant-or-self::param[@column="subject_id"]/text()');
				var subject = "";
				if (subjectID.length)
					subject = subjectID[0].nodeValue;
				var sex_cd = i2b2.h.XPath(pData[i], 'descendant-or-self::param[@column="sex_cd"]/text()');
				var gender = "";
				if (sex_cd.length)
				{
					var sex_cd_val = sex_cd[0].nodeValue;
					if (sex_cd_val == 'M') {gender = 'Male';}
					if (sex_cd_val == 'F') {gender = 'Female';}
					if (sex_cd_val == 'U') {gender = 'Unknown';}
				}
				var age_in_years = i2b2.h.XPath(pData[i], 'descendant-or-self::param[@column="age_in_years_num"]/text()');
				var age = "";
				if (age_in_years.length) 
					age = age_in_years[0].nodeValue;
				var race_cd = i2b2.h.XPath(pData[i], 'descendant-or-self::param[@column="race_cd"]/text()');
				var race = "";
				if (race_cd.length)
				    race = race_cd[0].nodeValue;//.substring(0,1).toUpperCase() + race_cd[0].nodeValue.substring(1);
				patients[patientID]         = {};
				patients[patientID].id      = patientID;    // id is a required unique value for each row in slickgrid (like a primary key) 
				patients[patientID].subject_id      = subject;
				patients[patientID].gender  = gender;
				patients[patientID].age     = age;
				patients[patientID].race    = race;
				patients[patientID].conceptCounts = [];

			}
			            
		    // initialize concept counts for all patients
			for (var p in patients)
			{
			    for (var k = 0; k < i2b2.SCILHSRequestHandler.model.concepts.length; k++)
			    {
			        patients[p].conceptCounts[k] = false;
			    }
			}

		    // get all the observations (Observation (oData) are guaranteed to be orderd (in osData) in the same order as SCILHSRequestHandler.model.concepts. The following code relies on that assumption.)
			var osData = i2b2.h.XPath(results.refXML, '//*[local-name() = "observation_set"]');
			var osCurIndex = 0;
			for (var i = 0; i < i2b2.SCILHSRequestHandler.model.concepts.length; i++)
			{
			    if (i2b2.SCILHSRequestHandler.model.concepts[i].sdxData.origData.table_name.toLowerCase() == 'concept_dimension' ||     // handle normal concepts
                    i2b2.SCILHSRequestHandler.model.concepts[i].sdxData.origData.table_name.toLowerCase() == "modifier_dimension" )     // handle modifers
			    {
			        var oData = i2b2.h.XPath(osData[osCurIndex], 'descendant::observation');
			        for (var j = 0; j < oData.length; j++)
			        {
						if(j < oData.length){ // there are still more observations
							if( (i2b2.h.getXNodeVal(oData[j], "event_id") == i2b2.h.getXNodeVal(oData[j+1], "event_id")) &&
							(i2b2.h.getXNodeVal(oData[j], "patient_id") == i2b2.h.getXNodeVal(oData[j+1], "patient_id")) &&
							(i2b2.h.getXNodeVal(oData[j], "concept_cd") == i2b2.h.getXNodeVal(oData[j+1], "concept_cd")) &&
							(i2b2.h.getXNodeVal(oData[j], "observer_cd") == i2b2.h.getXNodeVal(oData[j+1], "observer_cd")) &&
							(i2b2.h.getXNodeVal(oData[j], "start_date") == i2b2.h.getXNodeVal(oData[j+1], "start_date")) &&
							(i2b2.h.getXNodeVal(oData[j], "modifier_cd") == i2b2.h.getXNodeVal(oData[j+1], "modifier_cd")) &&
							(i2b2.h.getXNodeVal(oData[j], "instance_num") == i2b2.h.getXNodeVal(oData[j+1], "instance_num")) ){
								continue;
							}
						}
						
			            var patientID = i2b2.h.getXNodeVal(oData[j], "patient_id");

                        // depending on each column's cellDataOption, we filter for First, Last, Min, Max, or compute for Count
			            if (i2b2.SCILHSRequestHandler.model.concepts[i].dataOption === i2b2.SCILHSRequestHandler.cellDataOption.DEFAULT) // Existence: whether a patient has an observation of this type
                        {
			                if (patients[patientID].conceptCounts[i] == false)
			                    patients[patientID].conceptCounts[i] = true;
                        }
			            else if (i2b2.SCILHSRequestHandler.model.concepts[i].dataOption === i2b2.SCILHSRequestHandler.cellDataOption.FIRST) // Date: the FIRST time a patient has an observation of this type
                        {
			                var newMoment = new moment(i2b2.h.getXNodeVal(oData[j], "start_date")); // parse the date/time String to build a moment object
			                if (!patients[patientID].conceptCounts[i]){ // no existing value, use newMoment directly
			                    patients[patientID].conceptCounts[i] = newMoment; //Original
								// patients[patientID].conceptCounts[i] = moment(i2b2.h.getXNodeVal(oData[j], "start_date")).format("YYYY-MM-DD HH:mm:ss");
							}
                            else
                            {
			                    if ( newMoment.isBefore( patients[patientID].conceptCounts[i] ) ){ // compare existing moment with the new one and use the minimum (first)
			                        patients[patientID].conceptCounts[i] = newMoment;
								}
                            }
                        }
			            else if (i2b2.SCILHSRequestHandler.model.concepts[i].dataOption === i2b2.SCILHSRequestHandler.cellDataOption.LAST) // Date: the LAST time a patient has an observation of this type
                        {
			                var newMoment = new moment(i2b2.h.getXNodeVal(oData[j], "start_date")); // parse the date/time String to build a moment object
			                if (!patients[patientID].conceptCounts[i]) // no existing value, use newMoment directly
			                    patients[patientID].conceptCounts[i] = newMoment;
			                else 
                            {
			                    if (newMoment.isAfter(patients[patientID].conceptCounts[i])) // compare existing moment with the new one and use the maximum (last)
			                        patients[patientID].conceptCounts[i] = newMoment;
			                }
                        }
			            else if (i2b2.SCILHSRequestHandler.model.concepts[i].dataOption === i2b2.SCILHSRequestHandler.cellDataOption.MIN) // Minimum Value: the MIN value (if applicable) of all observations of this type
                        {
    			            var val  = parseFloat(i2b2.h.getXNodeVal(oData[j], "nval_num"));
			                if (!patients[patientID].conceptCounts[i] || patients[patientID].conceptCounts[i] > val )
			                    patients[patientID].conceptCounts[i] = val;
                        }
			            else if (i2b2.SCILHSRequestHandler.model.concepts[i].dataOption === i2b2.SCILHSRequestHandler.cellDataOption.MAX) // Maximum Value: the MAX value (if applicable) of all observations of this type
                        {
			                var val = parseFloat(i2b2.h.getXNodeVal(oData[j], "nval_num"));
			                if (!patients[patientID].conceptCounts[i] || patients[patientID].conceptCounts[i] < val)
			                    patients[patientID].conceptCounts[i] = val;
                        }
			            else if (i2b2.SCILHSRequestHandler.model.concepts[i].dataOption === i2b2.SCILHSRequestHandler.cellDataOption.COUNT) // Number of times of the observation of this type the patient has.
                        {
							if(patients[patientID].conceptCounts[i] == false){ patients[patientID].conceptCounts[i] = 0; }
			                if (!patients[patientID].conceptCounts[i]) // no existing value, so the count should now be 1
			                    patients[patientID].conceptCounts[i] = 1;
                            else
			                    patients[patientID].conceptCounts[i] = patients[patientID].conceptCounts[i] + 1; // increment count by 1
                        }
			        }
			        osCurIndex++;
			    }
			    else if (i2b2.SCILHSRequestHandler.model.concepts[i].sdxData.origData.table_name.toLowerCase() == 'patient_dimension') // handle concepts from Demographics (e.g. Age, Gender, Race, etc.)
			    {
			        var colName = i2b2.SCILHSRequestHandler.model.concepts[i].sdxData.origData.column_name.toLowerCase();
			        var dimCode = i2b2.SCILHSRequestHandler.model.concepts[i].sdxData.origData.dim_code;
			        var operator = i2b2.SCILHSRequestHandler.model.concepts[i].sdxData.origData.operator;
			        for (var p in patients)
			        {
			            var value = i2b2.h.XPath(results.refXML, '//patient[patient_id=' + p + ']/descendant-or-self::param[@column="' + colName + '"]/text()');
			            var type = i2b2.h.XPath(results.refXML, '//patient[patient_id=' + p + ']/descendant-or-self::param[@column="' + colName + '"]/@type');
			            if (operator == "IN" || operator == "=")
			            {
			                if ((dimCode.indexOf("'" + value[0].nodeValue + "'") >= 0) || (dimCode == value[0].nodeValue) || (dimCode.indexOf(value[0].nodeValue) >= 0))
			                {
			                    if (i2b2.SCILHSRequestHandler.model.concepts[i].dataOption === i2b2.SCILHSRequestHandler.cellDataOption.DEFAULT) // Existence: whether a patient has an observation of this type
			                    {
			                        if (patients[p].conceptCounts[i] == false)
			                            patients[p].conceptCounts[i] = true;
                                }
			                    else if (i2b2.SCILHSRequestHandler.model.concepts[i].dataOption === i2b2.SCILHSRequestHandler.cellDataOption.FIRST) // Date: the FIRST time a patient has an observation of this type
			                    {
			                        var newMoment = new moment(i2b2.h.getXNodeVal(oData[j], "start_date")); // parse the date/time String to build a moment object
			                        if (!patients[p].conceptCounts[i]) // no existing value, use newMoment directly
			                            patients[p].conceptCounts[i] = newMoment;
			                        else {
			                            if (newMoment.isBefore(patients[p].conceptCounts[i])) // compare existing moment with the new one and use the minimum (first)
			                                patients[p].conceptCounts[i] = newMoment;
			                        }
			                    }
			                    else if (i2b2.SCILHSRequestHandler.model.concepts[i].dataOption === i2b2.SCILHSRequestHandler.cellDataOption.LAST) // Date: the LAST time a patient has an observation of this type
			                    {
			                        var newMoment = new moment(i2b2.h.getXNodeVal(oData[j], "start_date")); // parse the date/time String to build a moment object
			                        if (!patients[p].conceptCounts[i]) // no existing value, use newMoment directly
			                            patients[p].conceptCounts[i] = newMoment;
			                        else {
			                            if (newMoment.isAfter(patients[p].conceptCounts[i])) // compare existing moment with the new one and use the maximum (last)
			                                patients[p].conceptCounts[i] = newMoment;
			                        }
			                    }
			                    else if (i2b2.SCILHSRequestHandler.model.concepts[i].dataOption === i2b2.SCILHSRequestHandler.cellDataOption.MIN) // Minimum Value: the MIN value (if applicable) of all observations of this type
			                    {
			                        var val = parseFloat(i2b2.h.getXNodeVal(oData[j], "nval_num"));
			                        if (!patients[p].conceptCounts[i] || patients[p].conceptCounts[i] > val)
			                            patients[p].conceptCounts[i] = val;
			                    }
			                    else if (i2b2.SCILHSRequestHandler.model.concepts[i].dataOption === i2b2.SCILHSRequestHandler.cellDataOption.MAX) // Maximum Value: the MAX value (if applicable) of all observations of this type
			                    {
			                        var val = parseFloat(i2b2.h.getXNodeVal(oData[j], "nval_num"));
			                        if (!patients[p].conceptCounts[i] || patients[p].conceptCounts[i] < val)
			                            patients[p].conceptCounts[i] = val;
			                    }
			                    else if (i2b2.SCILHSRequestHandler.model.concepts[i].dataOption === i2b2.SCILHSRequestHandler.cellDataOption.COUNT) // Number of times of the observation of this type the patient has.
			                    {
			                        if (!patients[p].conceptCounts[i]) // no existing value, so the count should now be 1
			                            patients[p].conceptCounts[i] = 1;
			                        else
			                            patients[p].conceptCounts[i] = patients[p].conceptCounts[i] + 1; // increment count by 1
			                    }
                                
			                }
			            }
			        }
			    }// end of patient dimension handling
				
				
				if(i == i2b2.SCILHSRequestHandler.model.concepts.length - 1){ // last concept
					var oData = i2b2.h.XPath(osData[osCurIndex], 'descendant::observation');
			        for (var j = 0; j < oData.length; j++)
					{
			            var patientID = i2b2.h.getXNodeVal(oData[j], "patient_id");

			        }
					var oData = i2b2.h.XPath(osData[osCurIndex+1], 'descendant::observation');
			        for (var j = 0; j < oData.length; j++)
			        {
			            var patientID = i2b2.h.getXNodeVal(oData[j], "patient_id");

			            if (patients[patientID].plasma == false)
			                    patients[patientID].plasma = true;
			        }
					var oData = i2b2.h.XPath(osData[osCurIndex+2], 'descendant::observation');
			        for (var j = 0; j < oData.length; j++)
			        {
			            var patientID = i2b2.h.getXNodeVal(oData[j], "patient_id");

			            if (patients[patientID].serum == false)
			                    patients[patientID].serum = true;
			        }
					
				}
			}

			var tableResults = document.getElementById('SCILHSRequestHandler-Results');
			if(preview){
				tableResults = document.getElementById('SCILHSRequestHandler-PreviewResults');
			}
		    for (var p in patients)
		    {
				if(i2b2.SCILHSRequestHandler.viewResultsTableOption || preview)
					var newRow = tableResults.insertRow(-1);
				var cellCount = 0;
				var requiredfound = false;
				for (var key in i2b2.SCILHSRequestHandler.model.required) {
					if (i2b2.SCILHSRequestHandler.model.required.hasOwnProperty(key)) {
						if(i2b2.SCILHSRequestHandler.model.required[key].display){
							requiredfound = true;
							if(i2b2.SCILHSRequestHandler.viewResultsTableOption || preview)
								var cell = newRow.insertCell(cellCount);
							if(key == "dna" || key == "serum" || key == "plasma"){
								if(patients[p][key] == false){
									if(i2b2.SCILHSRequestHandler.viewResultsTableOption || preview)
										cell.innerHTML = "No";
								} else {
									if(i2b2.SCILHSRequestHandler.viewResultsTableOption || preview)
										cell.innerHTML = "Yes";
								}
							} else {
								if(i2b2.SCILHSRequestHandler.viewResultsTableOption || preview)
									cell.innerHTML = patients[p][key];
							}
							
							if(cellCount == 0){
								if(!preview){
									if(key == "dna" || key == "serum" || key == "plasma"){
										if(patients[p][key] == false){
											i2b2.SCILHSRequestHandler.model.csv += "No";
										} else {
											i2b2.SCILHSRequestHandler.model.csv += "Yes";
										}
									} else {
										i2b2.SCILHSRequestHandler.model.csv += patients[p][key];
									}
								}
							} else {
								if(!preview){
									if(key == "dna" || key == "serum" || key == "plasma"){
										if(patients[p][key] == false){
											i2b2.SCILHSRequestHandler.model.csv += ",No";
										} else {
											i2b2.SCILHSRequestHandler.model.csv += ",Yes";
										}
									} else {
										i2b2.SCILHSRequestHandler.model.csv += "," + patients[p][key];
									}
								}
							}
							if(key == "race"){
								if(i2b2.SCILHSRequestHandler.viewResultsTableOption || preview)
									cell.style.fontSize = "10px";
							}
							cellCount++;
						}
					}	
				}

				// Process each cell for each column:
				
				if(requiredfound)
					i2b2.SCILHSRequestHandler.model.csv += ",";
				
			    //i2b2.SCILHSRequestHandler.model.csv += patients[p].subject_id + "," + patients[p].id + "," + patients[p].gender + "," + patients[p].age + "," + patients[p].race + "," + patients[p].dna + "," + patients[p].plasma + "," + patients[p].serum;
			    for (var i = 0; i < i2b2.SCILHSRequestHandler.model.concepts.length; i++)
			    {

					if(i2b2.SCILHSRequestHandler.viewResultsTableOption || preview)
						var newCell = newRow.insertCell(cellCount + i);
					if(i2b2.SCILHSRequestHandler.model.concepts[i].dataOption === i2b2.SCILHSRequestHandler.cellDataOption.COUNT){
						if(patients[p].conceptCounts[i] == false){
							if(i2b2.SCILHSRequestHandler.viewResultsTableOption || preview)
								newCell.innerHTML = 0;
							if(!preview)
								i2b2.SCILHSRequestHandler.model.csv += "0,";
						} else {
							if(i2b2.SCILHSRequestHandler.viewResultsTableOption || preview)
								newCell.innerHTML = patients[p].conceptCounts[i];
							if(!preview)
								i2b2.SCILHSRequestHandler.model.csv += patients[p].conceptCounts[i]+",";
						}
					} else if ((i2b2.SCILHSRequestHandler.model.concepts[i].dataOption === i2b2.SCILHSRequestHandler.cellDataOption.FIRST) || (i2b2.SCILHSRequestHandler.model.concepts[i].dataOption === i2b2.SCILHSRequestHandler.cellDataOption.LAST)) {
						if(patients[p].conceptCounts[i] == false){
							if(i2b2.SCILHSRequestHandler.viewResultsTableOption || preview)
								newCell.innerHTML = "";
							if(!preview)
								i2b2.SCILHSRequestHandler.model.csv += ",";
						} else {
							var formattedDate = patients[p].conceptCounts[i]._d;
							formattedDate = moment(formattedDate).format("YYYY-MM-DD HH:mm:ss");
							if(formattedDate){
								if(i2b2.SCILHSRequestHandler.viewResultsTableOption || preview)
									newCell.innerHTML = formattedDate;
								if(!preview)
									i2b2.SCILHSRequestHandler.model.csv += formattedDate+",";
							}
							else{
								if(i2b2.SCILHSRequestHandler.viewResultsTableOption || preview)
									newCell.innerHTML = patients[p].conceptCounts[i]._d;
								if(!preview)
									i2b2.SCILHSRequestHandler.model.csv += patients[p].conceptCounts[i]._d+",";
							}
						}
					} else if(i2b2.SCILHSRequestHandler.model.concepts[i].dataOption === i2b2.SCILHSRequestHandler.cellDataOption.DEFAULT){
						if(patients[p].conceptCounts[i] == false){
							if(i2b2.SCILHSRequestHandler.viewResultsTableOption || preview)
								newCell.innerHTML = "No";
							if(!preview)
								i2b2.SCILHSRequestHandler.model.csv += "No,";
						} else {
							if(i2b2.SCILHSRequestHandler.viewResultsTableOption || preview)
								newCell.innerHTML = "Yes";
							if(!preview)
								i2b2.SCILHSRequestHandler.model.csv += "Yes,";
						}
					} else if ((i2b2.SCILHSRequestHandler.model.concepts[i].dataOption === i2b2.SCILHSRequestHandler.cellDataOption.MIN) || (i2b2.SCILHSRequestHandler.model.concepts[i].dataOption === i2b2.SCILHSRequestHandler.cellDataOption.MAX)) {
						if(patients[p].conceptCounts[i] == false){
							if(patients[p].conceptCounts[i].toString() == "0"){
								if(i2b2.SCILHSRequestHandler.viewResultsTableOption || preview)
									newCell.innerHTML = "0";
								if(!preview)
									i2b2.SCILHSRequestHandler.model.csv += "0,";
							} else {
								if(i2b2.SCILHSRequestHandler.viewResultsTableOption || preview)
									newCell.innerHTML = "";
								if(!preview)
									i2b2.SCILHSRequestHandler.model.csv += ",";
							}
						} else {
							if(i2b2.SCILHSRequestHandler.viewResultsTableOption || preview)
								newCell.innerHTML = patients[p].conceptCounts[i];
							if(!preview)
								i2b2.SCILHSRequestHandler.model.csv += patients[p].conceptCounts[i]+",";
						}

					} else {
						if(i2b2.SCILHSRequestHandler.viewResultsTableOption || preview)
							newCell.innerHTML = patients[p].conceptCounts[i];
						if(!preview)
							i2b2.SCILHSRequestHandler.model.csv += patients[p].conceptCounts[i]+",";
					}
					
					/*
			        if (patients[p].conceptCounts[i] == 1)
			        {
				        newCell.innerHTML = '<img src="js-i2b2/cells/plugins/community/SCILHSRequestHandler/assets/check.png"/> Yes';
				        newCell.style.fontWeight = "bold";
				        i2b2.SCILHSRequestHandler.model.csv += ",Yes";
			        }
			        else
			        {
				        newCell.innerHTML = 'No';
				        i2b2.SCILHSRequestHandler.model.csv += ",No";
			        }
					*/
			        //  i2b2.SCILHSRequestHandler.model.csv += "," + patients[p].conceptCounts[i];
			    }
				
			    if(!preview){
					i2b2.SCILHSRequestHandler.model.csv = i2b2.SCILHSRequestHandler.model.csv.substring(0, i2b2.SCILHSRequestHandler.model.csv.length - 1);  // trim last comma
					i2b2.SCILHSRequestHandler.model.csv += "\n";

				}
	        }
			
		    // update dataView and redraw table

		    // update status bar
			//i2b2.SCILHSRequestHandler.model.active.progress = i2b2.SCILHSRequestHandler.model.active.progress + pData.length;
			//document.getElementById("fetchedNumerator").innerHTML = i2b2.SCILHSRequestHandler.model.active.progress;
			var patientSetSize = i2b2.SCILHSRequestHandler.active.size;
			
			if(preview){
				var currentdate = new Date();
				var datetime = (currentdate.getMonth() + 1) + "/"
			                                                + currentdate.getDate() + "/"
			                                                + currentdate.getFullYear() + " @ "
			                                                + currentdate.getHours() + ":"
			                                                + currentdate.getMinutes() + ":"
			                                                + currentdate.getSeconds();
				var processTime = document.getElementById('SCILHSRequestHandler-ProcessTime');
				var previewText = document.getElementById('SCILHSRequestHandler-PreviewText');
				processTime.innerHTML = processTime.innerHTML + " | Finished: " + datetime;
				previewText.innerHTML = "";
				var prevRecText = (patientSetSize>5)? ("5 out of " + patientSetSize) : (patientSetSize + " out of " + patientSetSize);
				previewText.innerHTML = "Below is a preview of " + prevRecText + " records from the requested data.  Click on <strong>Proceed to Download</strong> to download the entire file.";
				var statusText = document.getElementById('SCILHSRequestHandler-Status');
				statusText.innerHTML = "<a href='javascript:i2b2.SCILHSRequestHandler.viewResults()'>Proceed to Download</a>";
			} else {
				if (maxValue > patientSetSize)
				{ // this is the last page
					var processTime = document.getElementById('SCILHSRequestHandler-ProcessTime');
					var previewText = document.getElementById('SCILHSRequestHandler-PreviewText');
					var currentdate = new Date();
					var datetime = (currentdate.getMonth() + 1) + "/"
																+ currentdate.getDate() + "/"
																+ currentdate.getFullYear() + " @ "
																+ currentdate.getHours() + ":"
																+ currentdate.getMinutes() + ":"
																+ currentdate.getSeconds();
					processTime.innerHTML = processTime.innerHTML + " | Finished: " + datetime;
					// var prevRecText = (patientSetSize>5)? "5 out of " + patientSetSize : patientSetSize + " out of " + patientSetSize;
					// previewText.innerHTML = "Below is a preview of " + prevRecText + " records from requested data";
					var statusText = document.getElementById('SCILHSRequestHandler-StatusView');
					statusText.innerHTML = "Finished processing "+ patientSetSize +" patients. Your data file is ready to be downloaded.";
					jQuery("#iframeHolder").show();
					// i2b2.SCILHSRequestHandler.downloadFileReady();
					// i2b2.SCILHSRequestHandler.downloadPtFileReady();
					i2b2.SCILHSRequestHandler.model.dirtyResultsData = false; // finished all pages, mark results up-to-date
				}
				else
				{

					i2b2.SCILHSRequestHandler.model.processed += i2b2.SCILHSRequestHandler.model.pageSize;
					var processedText = document.getElementById('SCILHSRequestHandler-Processed');
					processedText.innerHTML = i2b2.SCILHSRequestHandler.model.processed;
					// we are done with the current page of patients, now fetch the next one.
					i2b2.SCILHSRequestHandler.getResults(minValue + i2b2.SCILHSRequestHandler.model.pageSize, maxValue + i2b2.SCILHSRequestHandler.model.pageSize, false);
				}
			/*
				if (i2b2.SCILHSRequestHandler.model.pageStartingIndex + i2b2.SCILHSRequestHandler.model.active.progress - 1 === i2b2.SCILHSRequestHandler.model.pageEndingIndex ||
					minValue + pData.length - 1 === i2b2.SCILHSRequestHandler.model.active.size)                                 // finished the last page
				{
					i2b2.SCILHSRequestHandler.model.dirtyResultsData = false; // optimization - only requery when the input data is changed
					jQuery("#fetchedPatients").css("display", "none");
					jQuery("#selectedPatients").css("display", "inline");
					//update page info and prev/next divs
					jQuery("#pageInfo").text("Showing Patients " + i2b2.SCILHSRequestHandler.model.pageStartingIndex + " to " + Math.min(i2b2.SCILHSRequestHandler.model.pageEndingIndex, i2b2.SCILHSRequestHandler.model.active.size) + " of total " + i2b2.SCILHSRequestHandler.model.active.size);
					i2b2.SCILHSRequestHandler.autoUpdateNavigatorUI(); // update the getNextPage and getPreviousPage divs appropriately
				}
				else // not yet done with the current page, get more patients until pageEndingIndex is reached
				{			    
					i2b2.SCILHSRequestHandler.getResults(i2b2.SCILHSRequestHandler.model.pageStartingIndex + i2b2.SCILHSRequestHandler.model.active.progress, i2b2.SCILHSRequestHandler.model.pageEndingIndex, false);
				}*/
			
			}
			
			
			
			
    	}
        // prior to making PDO call, clear logs every 3 PDO calls to curb memory usage:
        // bugbug: don't clear the logs while we are debugging.
		if ( i2b2.SCILHSRequestHandler.msgCounter % 3 == 2 )
		    i2b2.hive.MsgSniffer.signalMessageDB = [];
		i2b2.SCILHSRequestHandler.msgCounter++;

        // AJAX CALL USING THE EXISTING CRC CELL COMMUNICATOR
		var operationType = preview?"PR":"DL";
		var msgEvntType = "Download_" + i2b2.SCILHSRequestHandler.downloadID + "_" + operationType + "_" + i2b2.SCILHSRequestHandler.active.size + "_" + i2b2.SCILHSRequestHandler.queryMasterId + "_";
		i2b2.CRC.ajax.getPDO_fromInputList("Plugin:SCILHSRequestHandler", { msg_event_type: msgEvntType ,PDO_Request: msg_filter }, scopedCallback);
    }
};


i2b2.SCILHSRequestHandler.setShowMetadataDialog = function(sdxData) {
	i2b2.SCILHSRequestHandler.model.showMetadataDialog = sdxData;
};

i2b2.SCILHSRequestHandler.Unload = function() {
	// purge old data
	i2b2.SCILHSRequestHandler.model = {};
	i2b2.SCILHSRequestHandler.model.prsRecord = false;
	i2b2.SCILHSRequestHandler.model.conceptRecord = false;
	i2b2.SCILHSRequestHandler.model.dirtyResultsData = true;
	try { i2b2.SCILHSRequestHandler.yuiPanel.destroy(); } catch(e) {}
	return true;
};

i2b2.SCILHSRequestHandler.queryConceptDropped = function(sdxData) {
    sdxData = sdxData[0];
	
	$("SCILHSRequestHandler-CONCPTDROP").style.background = "#DEEBEF";
    $("SCILHSRequestHandler-CONCPTDROP").innerHTML = '<div class="concptItem"><img src="js-i2b2/cells/plugins/community/SCILHSRequestHandler/assets/spinning.gif" align="absmiddle" style="margin-left:5px;"/> Loading Concepts from Previous Query ...</div>';

	i2b2.SCILHSRequestHandler.loadQueryConcepts(sdxData.sdxInfo.sdxKeyValue);
	
}

i2b2.SCILHSRequestHandler.queryDropped = function(sdxData) {
    sdxData = sdxData[0];
	
	$("SCILHSRequestHandler-PRSDROP").style.background = "#DEEBEF";
    $("SCILHSRequestHandler-PRSDROP").innerHTML = '<img src="js-i2b2/cells/plugins/community/SCILHSRequestHandler/assets/spinning.gif" align="absmiddle" style="margin-left:5px;"/> Loading Previous Query ...';

    // The sdxInfo being loaded/dropped is of sdxType 'QM' (Query Master)
    // Take QM ID and find 1) patient count 2) patient set 3) breakdowns
    i2b2.SCILHSRequestHandler.active.query = sdxData;
    i2b2.SCILHSRequestHandler.loadQueryInfo(sdxData.sdxInfo.sdxKeyValue);
	if(document.getElementById('SCILHSRequestHandler-LoadConcepts').checked){
		if(i2b2.SCILHSRequestHandler.model.concepts.length > 0){
			var clobberConcepts = confirm("You have chosen to automatically 'Include concepts from the Previous Query' which will replace your current list of specified concepts. Click OK to confirm.");
			if (clobberConcepts) {
				i2b2.SCILHSRequestHandler.loadQueryConcepts(sdxData.sdxInfo.sdxKeyValue);
			} else {
				i2b2.SCILHSRequestHandler.conceptsRender();
			}
		} else {
			i2b2.SCILHSRequestHandler.loadQueryConcepts(sdxData.sdxInfo.sdxKeyValue);
		}
	} else {
		i2b2.SCILHSRequestHandler.conceptsRender();
	}

    //    $("SCILHSRequestHandler-patientset").value = i2b2.h.Escape(sdxData.sdxInfo.sdxDisplayName);
	//BG
	i2b2.SCILHSRequestHandler.model.csv = '';
	i2b2.SCILHSRequestHandler.previewRequested = false;
	i2b2.SCILHSRequestHandler.dataRequested = false;
	//End BG
};

i2b2.SCILHSRequestHandler.queryAutoDropped = function(qm_id) {

	
    i2b2.SCILHSRequestHandler.loadQueryInfo(qm_id);
	i2b2.SCILHSRequestHandler.loadQueryConcepts(qm_id);
    $("SCILHSRequestHandler-PRSDROP").style.background = "#DEEBEF";
    $("SCILHSRequestHandler-PRSDROP").innerHTML = '<img src="js-i2b2/cells/plugins/community/SCILHSRequestHandler/assets/spinning.gif" align="absmiddle" style="margin-left:5px;"/> Loading Previous Query ...';
    //    $("SCILHSRequestHandler-patientset").value = i2b2.h.Escape(sdxData.sdxInfo.sdxDisplayName);
};

i2b2.SCILHSRequestHandler.prsUnload = function() {
    i2b2.SCILHSRequestHandler.model.prsRecord = false;
    $("SCILHSRequestHandler-PRSDROP").style.background = "#DEEBEF";
    $("SCILHSRequestHandler-PRSDROP").innerHTML = '<img src="js-i2b2/cells/plugins/community/SCILHSRequestHandler/assets/pointer.png" align="absbottom" style="margin-left:5px;" /> Drag &amp; Drop a <em>Previous Query</em> with a Patient Set here';
    i2b2.SCILHSRequestHandler.active = {};
	//BG
	for (var i = 0; i < i2b2.SCILHSRequestHandler.model.concepts.length; i++)
    {
       i2b2.SCILHSRequestHandler.conceptDelete(i);
    }
	i2b2.SCILHSRequestHandler.model.csv = '';
	i2b2.SCILHSRequestHandler.previewRequested = false;
	i2b2.SCILHSRequestHandler.dataRequested = false;
	//End BG
};

i2b2.SCILHSRequestHandler.loadQueryInfo = function(query_master_id){

	i2b2.SCILHSRequestHandler.queryMasterId = query_master_id;
	i2b2.SCILHSRequestHandler.readyToPreview = true;
	i2b2.SCILHSRequestHandler.model.firstVisit = false;

	var scopedCallback = new i2b2_scopedCallback();
    scopedCallback.scope = this;
    scopedCallback.callback = function(results) 
    {
        // THIS function is used to process the AJAX results of the getChild call
        //results data object contains the following attributes:
        //refXML: xmlDomObject <--- for data processing
        //msgRequest: xml (string)
        //msgResponse: xml (string)
        //error: boolean
        //errorStatus: string [only with error=true]
        //errorMsg: string [only with error=true]

        // did we get a valid query definition back?
        var qd = i2b2.h.XPath(results.refXML, 'descendant::query_name/..');
        if (qd.length != 0) 
        {
            i2b2.SCILHSRequestHandler.model.activeQueryName = i2b2.h.getXNodeVal(results.refXML, 'name');
		}


    var scopedCallbackQI = new i2b2_scopedCallback();
    scopedCallbackQI.scope = i2b2.SCILHSRequestHandler.active.query;
    scopedCallbackQI.callback = function(results) {

	var qi = results.refXML.getElementsByTagName('query_instance');
	i2b2.SCILHSRequestHandler.active.query_instance_id = i2b2.h.getXNodeVal(qi[0],'query_instance_id');

	var scopedCallbackQRS = new i2b2_scopedCallback();
	scopedCallbackQRS.scope = i2b2.SCILHSRequestHandler.active.query;
	scopedCallbackQRS.callback = function(results) {
	    var found_patient_set = false;
	    i2b2.SCILHSRequestHandler.active.QRS = [];
	    var results_list = results.refXML.getElementsByTagName('query_result_instance');
	    var l = results_list.length;
	    for (var i=0; i<l; i++) {
		try {
		    var qi = results_list[i];
		    var temp = new Object();
		    temp.size = i2b2.h.getXNodeVal(qi, 'set_size');
		    temp.QI_ID = i2b2.h.getXNodeVal(qi, 'query_instance_id');
		    temp.QRS_ID = i2b2.h.getXNodeVal(qi, 'result_instance_id');
		    temp.QRS_Type = i2b2.h.XPath(qi, 'descendant-or-self::query_result_type/name')[0].firstChild.nodeValue;
		    temp.QRS_DisplayType = i2b2.h.XPath(qi, 'descendant-or-self::query_result_type/display_type')[0].firstChild.nodeValue;
		    temp.QRS_TypeID = i2b2.h.XPath(qi, 'descendant-or-self::query_result_type/result_type_id')[0].firstChild.nodeValue;
		    temp.QRS_Status = i2b2.h.XPath(qi, 'descendant-or-self::query_status_type/name')[0].firstChild.nodeValue;
		    temp.QRS_Status_ID = i2b2.h.XPath(qi, 'descendant-or-self::query_status_type/status_type_id')[0].firstChild.nodeValue;
		    // set the proper title if it was not already set
		    if (!temp.title) {
			temp.title = i2b2.CRC.ctrlr.QueryStatus._GetTitle(temp.QRS_Type, temp, qi);
		    }
			if(temp.QRS_Status_ID!=3)
			{
				$("SCILHSRequestHandler-PRSDROP").innerHTML = 'There was a problem loading this query. Please try a different query.';
				$("SCILHSRequestHandler-PRSDROP").style.background = "#F6CCDA";
				alert("The selected query is unfinished! Please select a finished query to make a request.");
				break;
			}
		    i2b2.SCILHSRequestHandler.active.QRS.push(temp);
		} catch(e) {}
	    }

	    // Start loop through Query Result Set
	    for (var i=0; i<i2b2.SCILHSRequestHandler.active.QRS.length; i++) {
			var query_result = i2b2.SCILHSRequestHandler.active.QRS[i];
			switch (query_result.QRS_DisplayType) {
			case "LIST": // Check to see if query has a Patient Set
				if(query_result.QRS_Type == "PATIENTSET"){
				//alert("Patient Set has been found");
				found_patient_set = true;
				var sdxTemp = {sdxInfo: { sdxControlCell: "CRC", sdxDisplayName: query_result.title,
							  sdxKeyName: "result_instance_id", sdxKeyValue: query_result.QRS_ID, sdxType: "PRS" }};
				i2b2.SCILHSRequestHandler.model.prsRecord = sdxTemp;
				i2b2.SCILHSRequestHandler.model.dirtyResultsData = true;
				i2b2.SCILHSRequestHandler.active.size = query_result.size;
				
				}
				break;
			}
	    } // End loop through Query Result Set

	    if(found_patient_set){

			$("SCILHSRequestHandler-PRSDROP").innerHTML = '<img src="js-i2b2/cells/CRC/assets/sdx_CRC_PRS.jpg" align="absbottom" style="margin-left:5px;"/> ' + i2b2.h.Escape(i2b2.SCILHSRequestHandler.model.activeQueryName) + '&nbsp;<strong>[Patient Count: '+i2b2.SCILHSRequestHandler.active.size+']</strong>&nbsp;<a href="#" onclick="javascript:i2b2.SCILHSRequestHandler.prsUnload();return false;"><img src="js-i2b2/cells/plugins/community/SCILHSRequestHandler/assets/delete.png" title="Clear Selection" align="absbottom" border="0"/></a>';
			$("SCILHSRequestHandler-PRSDROP").style.background = "#CFB";
			i2b2.SCILHSRequestHandler.model.readyToPreview = true;
			i2b2.SCILHSRequestHandler.model.firstVisit = false;
	    }
	    else {
			$("SCILHSRequestHandler-PRSDROP").innerHTML = '<img src="js-i2b2/cells/plugins/community/SCILHSRequestHandler/assets/warning.png" align="absbottom" style="margin-left:5px;"> A patient set was not found for this query. Please try a different query.';
			$("SCILHSRequestHandler-PRSDROP").style.background = "#F6CCDA";
			i2b2.SCILHSRequestHandler.model.readyToPreview = false;
	    }
	}
	i2b2.CRC.ajax.getQueryResultInstanceList_fromQueryInstanceId("Plugin:SCILHSRequestHandler", {qi_key_value: i2b2.SCILHSRequestHandler.active.query_instance_id}, scopedCallbackQRS);
    }
    i2b2.CRC.ajax.getQueryInstanceList_fromQueryMasterId("Plugin:SCILHSRequestHandler", {qm_key_value: query_master_id}, scopedCallbackQI);
	
	
	}
	i2b2.CRC.ajax.getRequestXml_fromQueryMasterId("Plugin:SCILHSRequestHandler", { qm_key_value: query_master_id }, scopedCallback);
};


i2b2.SCILHSRequestHandler.prsDropped = function(sdxData) {
	sdxData = sdxData[0];	// only interested in first record
	// save the info to our local data model
	i2b2.SCILHSRequestHandler.model.prsRecord = sdxData;
	// let the user know that the drop was successful by displaying the name of the patient set
	$("SCILHSRequestHandler-PRSDROP").innerHTML = i2b2.h.Escape(sdxData.sdxInfo.sdxDisplayName);
	// temporarly change background color to give GUI feedback of a successful drop occuring
	$("SCILHSRequestHandler-PRSDROP").style.background = "#CFB";
	setTimeout("$('SCILHSRequestHandler-PRSDROP').style.background='#DEEBEF'", 250);
	// optimization to prevent requerying the hive for new results if the input dataset has not changed
	i2b2.SCILHSRequestHandler.model.dirtyResultsData = true;
	/*
					var sdxTemp = {sdxInfo: { sdxControlCell: "CRC", sdxDisplayName: query_result.title,
							  sdxKeyName: "result_instance_id", sdxKeyValue: query_result.QRS_ID, sdxType: "PRS" }};
				i2b2.SCILHSRequestHandler.model.prsRecord = sdxTemp;
				i2b2.SCILHSRequestHandler.model.dirtyResultsData = true;
				i2b2.SCILHSRequestHandler.active.size = query_result.size;*/
};


i2b2.SCILHSRequestHandler.loadQueryConcepts = function(qm_id)
{
    //for (var i = 0; i < i2b2.SCILHSRequestHandler.model.concepts.length; i++)
    //{
    //    i2b2.SCILHSRequestHandler.conceptDelete(i);
    //}
    // if(!document.getElementById('SCILHSRequestHandler-AppendConcepts').checked){
		// i2b2.SCILHSRequestHandler.model.concepts = []
    // }
	i2b2.SCILHSRequestHandler.conceptsRender();
	////
    // callback processor
    var scopedCallback = new i2b2_scopedCallback();
    scopedCallback.scope = this;
    scopedCallback.callback = function(results) 
    {
        var cl_queryMasterId = qm_id;
        // THIS function is used to process the AJAX results of the getChild call
        //results data object contains the following attributes:
        //refXML: xmlDomObject <--- for data processing
        //msgRequest: xml (string)
        //msgResponse: xml (string)
        //error: boolean
        //errorStatus: string [only with error=true]
        //errorMsg: string [only with error=true]

        // did we get a valid query definition back?
        var qd = i2b2.h.XPath(results.refXML, 'descendant::query_name/..');
        if (qd.length != 0) 
        {
            var dObj = {};
            dObj.name = i2b2.h.getXNodeVal(results.refXML, 'name');
            dObj.timing = i2b2.h.XPath(qd[0], 'descendant-or-self::query_timing/text()');
            dObj.timing = dObj.timing[0].nodeValue;
            dObj.specificity = i2b2.h.getXNodeVal(qd[0], 'specificity_scale');
            var sqc = i2b2.h.XPath(qd[0], 'subquery_constraint');
            for (var j = 0; j < qd.length; j++) 
            {
                dObj.panels = [];
                if (j == 0)
                    var qp = i2b2.h.XPath(qd[j], 'panel');
                else
                    var qp = i2b2.h.XPath(qd[j], 'descendant::panel');
                var total_panels = qp.length;
                for (var i1 = 0; i1 < total_panels; i1++) 
                {
                    // extract the data for each panel
                    var po = {};
                    po.panel_num = i2b2.h.getXNodeVal(qp[i1], 'panel_number');
                    var t = i2b2.h.getXNodeVal(qp[i1], 'invert');
                    po.exclude = (t == "1");
                    po.timing = i2b2.h.getXNodeVal(qp[i1], 'panel_timing') || 'ANY';
                    var t = i2b2.h.getXNodeVal(qp[i1], 'total_item_occurrences');
                    po.occurs = (1 * t) - 1;
                    var t = i2b2.h.getXNodeVal(qp[i1], 'panel_accuracy_scale');
                    po.relevance = t;
                   
                    po.items = [];
                    var pi = i2b2.h.XPath(qp[i1], 'descendant::item[item_key]');
                    for (i2 = 0; i2 < pi.length; i2++) 
                    {
                        var item = {};
                        // get the item's details from the ONT Cell
                        var ckey = i2b2.h.getXNodeVal(pi[i2], 'item_key');
                        // Determine what item this is
                        if (ckey.startsWith("query_master_id")) 
                        {
                            var o = new Object;
                            o.name = i2b2.h.getXNodeVal(pi[i2], 'item_name');
                            o.id = ckey.substring(16);
                            o.result_instance_id = o.PRS_id;
                            var sdxDataNode = i2b2.sdx.Master.EncapsulateData('QM', o);
                            po.items.push(sdxDataNode);
                        } 
                        else if (ckey.startsWith("masterid")) 
                        {
                            var o = new Object;
                            o.name = i2b2.h.getXNodeVal(pi[i2], 'item_name');
                            o.id = ckey;
                            o.result_instance_id = o.PRS_id;
                            var sdxDataNode = i2b2.sdx.Master.EncapsulateData('QM', o);
                            po.items.push(sdxDataNode);
                        } 
                        else if (ckey.startsWith("patient_set_coll_id")) 
                        {
                            var o = new Object;
                            o.titleCRC = i2b2.h.getXNodeVal(pi[i2], 'item_name');
                            o.PRS_id = ckey.substring(20);
                            o.result_instance_id = o.PRS_id;
                            var sdxDataNode = i2b2.sdx.Master.EncapsulateData('PRS', o);
                            po.items.push(sdxDataNode);
                        } 
                        else if (ckey.startsWith("patient_set_enc_id")) 
                        {
                            var o = new Object;
                            o.titleCRC = i2b2.h.getXNodeVal(pi[i2], 'item_name');
                            o.PRS_id = ckey.substring(19);
                            o.result_instance_id = o.PRS_id;
                            var sdxDataNode = i2b2.sdx.Master.EncapsulateData('ENS', o);
                            po.items.push(sdxDataNode);
                        } 
                        else 
                        {
                            // WE MUST QUERY THE ONT CELL TO BE ABLE TO DISPLAY THE TREE STRUCTURE CORRECTLY
                            var o = new Object;
                            o.level = i2b2.h.getXNodeVal(pi[i2], 'hlevel');
                            o.name = i2b2.h.getXNodeVal(pi[i2], 'item_name');
                            o.tooltip = i2b2.h.getXNodeVal(pi[i2], 'tooltip');
                            // nw096 - If string starts with path \\, lookup path in Ontology cell
                            if (o.name.slice(0, 2) == '\\\\') 
                            {
                                var results = i2b2.ONT.ajax.GetTermInfo("ONT", { ont_max_records: 'max="1"', ont_synonym_records: 'false', ont_hidden_records: 'false', concept_key_value: o.name }).parse();
                                if (results.model.length > 0) 
                                {
                                    o.name = results.model[0].origData.name;
                                    o.tooltip = results.model[0].origData.tooltip;
									o.tablename = results.model[0].origData.tablename;
                                }
                            }
                            o.key = i2b2.h.getXNodeVal(pi[i2], 'item_key');
                            o.synonym_cd = i2b2.h.getXNodeVal(pi[i2], 'item_is_synonym');
                            o.hasChildren = i2b2.h.getXNodeVal(pi[i2], 'item_icon');
							
							
							// Lab Values processing
							var lvd = i2b2.h.XPath(pi[i2], 'descendant::constrain_by_value');
							if ((lvd.length > 0) /*&& (i2b2.h.XPath(pi[i2], 'descendant::constrain_by_modifier').length == 0)*/) 
							{
								lvd = lvd[0];
								//Get term info for genotype data to populate labvalues well
								o.LabValues = i2b2.CRC.view.modLabvaluesCtlr.processLabValuesForQryLoad(lvd);
							}
                            // sdx encapsulate
                            var sdxDataNode = i2b2.sdx.Master.EncapsulateData('CONCPT', o);
                            
							// Date processing - 2.0 (handle constrain_by_date)
							var cbd = i2b2.h.XPath(pi[i2], 'descendant::constrain_by_date');
							if (cbd.length > 0){
								cbd = cbd[0];
								var df = i2b2.h.getXNodeVal(cbd, "date_from");
								if(df){
									sdxDataNode.dateFrom = {};
									sdxDataNode.dateFrom.Year = df.substring(0, 4); //t[0];
									sdxDataNode.dateFrom.Month = df.substring(5, 7); //t[1];
									sdxDataNode.dateFrom.Day = df.substring(8, 10); //t[2];
								}
								else {
									sdxDataNode.dateFrom = false;
								}
								var dt = i2b2.h.getXNodeVal(cbd, "date_to");
								if(dt){
									sdxDataNode.dateTo = {};
									sdxDataNode.dateTo.Year = dt.substring(0, 4); //t[0];
									sdxDataNode.dateTo.Month = dt.substring(5, 7); //t[1];
									sdxDataNode.dateTo.Day = dt.substring(8, 10); //t[2];
								}
								else {
									sdxDataNode.dateTo = false;
								}
							}
							else {
								sdxDataNode.dateFrom = false;
								sdxDataNode.dateTo = false;
							}

							// nw096 - handle file icons
                            switch (o.hasChildren) 
                            {
                                case "FA":
                                    sdxDataNode.renderData = { icon: 'js-i2b2/cells/ONT/assets/sdx_ONT_CONCPT_branch.gif' };
                                    break;
                                case "LA":
                                    sdxDataNode.renderData = { icon: 'js-i2b2/cells/ONT/assets/sdx_ONT_CONCPT_leaf.gif' };
                                    break;
                                case "FAE":
                                    sdxDataNode.renderData = { icon: 'js-i2b2/cells/ONT/assets/sdx_ONT_CONCPT_branch-exp.gif' };
                                    break;
                                default:
                                    sdxDataNode.renderData = { icon: 'js-i2b2/cells/ONT/assets/sdx_ONT_CONCPT_leaf.gif' };
                            }

							if (o.LabValues) {
								// We do want 2 copies of the Lab Values: one is original from server while the other one is for user manipulation
								sdxDataNode.LabValues = o.LabValues;
							}
							//			    o.xmlOrig = c;
							if (i2b2.h.XPath(pi[i2], 'descendant::constrain_by_modifier').length > 0) 
							{
								//if (i2b2.h.getXNodeVal(pi[i2],'constrain_by_modifier') != null) {
								sdxDataNode.origData.parent = {};
								sdxDataNode.origData.parent.key = o.key;
								//sdxDataNode.origData.parent.LabValues = o.LabValues;
								sdxDataNode.origData.parent.hasChildren = o.hasChildren;
								sdxDataNode.origData.parent.level = o.level;
								sdxDataNode.origData.parent.name = o.name;
								sdxDataNode.origData.key = i2b2.h.getXNodeVal(pi[i2], 'constrain_by_modifier/modifier_key');
								sdxDataNode.origData.applied_path = i2b2.h.getXNodeVal(pi[i2], 'constrain_by_modifier/applied_path');
								sdxDataNode.origData.name = i2b2.h.getXNodeVal(pi[i2], 'constrain_by_modifier/modifier_name');
								sdxDataNode.origData.isModifier = true;
								this.hasModifier = true;

								// Lab Values processing
								var lvd = i2b2.h.XPath(pi[i2], 'descendant::constrain_by_modifier/constrain_by_value');
								if (lvd.length > 0) 
								{
									lvd = lvd[0];
									o.ModValues = i2b2.CRC.view.modLabvaluesCtlr.processModValuesForQryLoad(lvd);
								}
								if (o.ModValues) {
									// We do want 2 copies of the Lab Values: one is original from server while the other one is for user manipulation
									sdxDataNode.ModValues = o.ModValues;
								}
							}
                            //			    po.items.push(sdxDataNode);

                            //			    i2b2.SCILHSRequestHandler.nich = sdxDataNode;

                            /*			    i2b2.SCILHSRequestHandler.model.concepts.push(sdxDataNode);
                            var cdetails = i2b2.ONT.ajax.GetTermInfo("CRC:QueryTool", {concept_key_value:sdxDataNode.origData.key, ont_synonym_records: true, ont_hidden_records: true} );
                            var c = i2b2.h.XPath(cdetails.refXML, 'descendant::concept');
                            if (c.length > 0)
                            { sdxDataNode.origData.xmlOrig = c[0]; }
            
                            i2b2.SCILHSRequestHandler.conceptsRender();
                            i2b2.SCILHSRequestHandler.model.dirtyResultsData = true;
                            */
                            i2b2.SCILHSRequestHandler.conceptAutoDropped(sdxDataNode);
                            //			    i2b2.SCILHSRequestHandler.conceptDropped(sdxDataNode);
                            // PUSH CONCEPTS HERE
                            //} else {
                            //console.error("CRC's ONT Handler could not get term details about '"+ckey+"'!");
                            //}
                        }
                    }
                    //		    dObj.panels[po.panel_num] = po;
                }
                // reindex the panels index (panel [1,3,5] should be [0,1,2])
                //		dObj.panels = dObj.panels.compact();
                //i2b2.CRC.model.queryCurrent.panels[j] = dObj.panels;
            }
        }
    }
    // AJAX CALL
    i2b2.CRC.ajax.getRequestXml_fromQueryMasterId("Plugin:SCILHSRequestHandler", { qm_key_value: qm_id }, scopedCallback);
};


i2b2.SCILHSRequestHandler.conceptAutoDropped = function(sdxData)
{
    if (sdxData.origData.isModifier) 
    {
        alert("Modifier item being dropped is not yet supported.");
        return false;
    }
    var conceptObj = {};
    conceptObj.sdxData = sdxData;
	
	
	
    conceptObj.valueRestriction = sdxData.LabValues;              // save Lab Value
	conceptObj.dateFrom = sdxData.dateFrom;
	conceptObj.dateTo = sdxData.dateTo;
	
    // Default value for data option is EXISTENCE. Attach dataOption and formatter to the newly added concept
    conceptObj.dataOption = i2b2.SCILHSRequestHandler.cellDataOption.DEFAULT;
    //conceptObj.formatter = i2b2.SCILHSRequestHandler.cellFormatter.defaultFormatter;

    
    var cdetails = i2b2.ONT.ajax.GetTermInfo("CRC:DownloaderPlugin", { concept_key_value: sdxData.origData.key, ont_synonym_records: true, ont_hidden_records: true });
    var c = i2b2.h.XPath(cdetails.refXML, 'descendant::concept');
    if (c.length > 0)
    { sdxData.origData.xmlOrig = c[0]; }

    cdetails.parse();
    if (cdetails.model.length > 0) 
    {
        //	i2b2.SCILHSRequestHandler.nich3 = cdetails.model[0];
        sdxData.origData.basecode = cdetails.model[0].origData.basecode;
        sdxData.origData.fact_table_column = cdetails.model[0].origData.fact_table_column;
        sdxData.origData.table_name = cdetails.model[0].origData.table_name;
        sdxData.origData.column_name = cdetails.model[0].origData.column_name;
        sdxData.origData.operator = cdetails.model[0].origData.operator;
        sdxData.origData.dim_code = cdetails.model[0].origData.dim_code;
    }
	
	//BG changes for new value chooser
	if(sdxData.LabValues)
		conceptObj.LabValues = sdxData.LabValues;
		
	//Parse the concept more if possible
	try
	{
		var dataType = i2b2.h.getXNodeVal(sdxData.origData.xmlOrig, 'DataType');
		var valueType = i2b2.CRC.view.modLabvaluesCtlr.getValueType(dataType);
		if(dataType && valueType)  //Handle Genotype concept
		{
			var updatedLabValues = i2b2.CRC.view[valueType].parseLabValues(conceptObj.LabValues,dataType);
			if(updatedLabValues)
				conceptObj.LabValues = updatedLabValues;
		}
	}
	catch(e)
	{
		console.error(e);
	}
		
	// save the info to our local data model
    i2b2.SCILHSRequestHandler.model.concepts.push(conceptObj);
	//End BG changes

    var sdxDataNode = i2b2.sdx.Master.EncapsulateData('CONCPT', sdxData.origData);

    // sort and display the concept list
    i2b2.SCILHSRequestHandler.conceptsRender();
    // optimization to prevent requerying the hive for new results if the input dataset has not changed
	
	// $("SCILHSRequestHandler-CONCPTDROP").innerHTML = '<div class="concptItem"><img src="js-i2b2/cells/plugins/community/SCILHSRequestHandler/assets/pointer.png" align="absbottom" style="margin-left:5px;" /> Drag &amp; Drop additional concepts here from <em>Navigate Terms</em> or a <em>Previous Query</em></div>';
	
    i2b2.SCILHSRequestHandler.model.dirtyResultsData = true;
    i2b2.SCILHSRequestHandler.switchToConceptsTable();
};

i2b2.SCILHSRequestHandler.conceptDropped = function(sdxData, showDialog) {

	sdxData = sdxData[0];	// only interested in first record
	try{
		var conceptKey = sdxData.sdxInfo.sdxKeyValue;
		if(conceptKey && conceptKey.indexOf("\\\\i2b2metadata\\i2b2metadata\\Demographics\\Zip codes-trunc\\") >= 0 )
			{
				alert("Download of city, state or zipcode is not supported at this time.");
				return;
			}
	}
	catch(e)
	{
		console(e);
	}
	if ( sdxData.origData.isModifier )
	{
	    var cdetails = i2b2.ONT.ajax.GetModifierInfo("CRC:QueryTool", {modifier_applied_path:sdxData.origData.applied_path, modifier_key_value:sdxData.origData.key, ont_synonym_records: true, ont_hidden_records: true} );
	    // this is what comes out of the old AJAX call
	    var c = i2b2.h.XPath(cdetails.refXML, 'descendant::modifier');
	    if (c.length > 0) 
	        sdxData.origData.xmlOrig = c[0];
	    var modParent = sdxData.origData.parent;
	    var level = sdxData.origData.level;
	    var key = sdxData.origData.parent.key;
	    var name = (sdxData.origData.parent.name != null ? i2b2.h.Escape(sdxData.origData.parent.name) : i2b2.h.Escape(sdxData.origData.name));
	    var tooltip = sdxData.origData.tooltip;
	    var itemicon = sdxData.origData.hasChildren;
	    while (modParent != null) // find the first ancestor that is not a modifer
	    {
	        if (modParent.isModifier)
	            modParent = modParent.parent;
	        else {
	            level = modParent.level;
	            key = modParent.key;
	            name = modParent.name;
	            tooltip = modParent.tooltip;
	            itemicon = modParent.hasChildren;
	            break;
	        }
	    }
	    sdxData.renderData.icon = "js-i2b2/cells/ONT/assets/sdx_ONT_CONCPT_branch.gif"; // display every modifier as its containing parent (a folder)
        sdxData.sdxInfo.sdxDisplayName = modParent.name;
	}
    else // fetch normal concept data
    {
		if(sdxData.origData.table_name.toLowerCase() == "visit_dimension"){
			alert('Visit Dimension Concepts are not supported at this time.');
			return false;
		}
	    var cdetails = i2b2.ONT.ajax.GetTermInfo("CRC:DownloaderPlugin", { concept_key_value: sdxData.origData.key, ont_synonym_records: true, ont_hidden_records: true });
	    var c = i2b2.h.XPath(cdetails.refXML, 'descendant::concept');
	    if (c.length > 0)
	        sdxData.origData.xmlOrig = c[0];
    }

    // Create a concept 'object' to contain the sdxData and concept options.
	var conceptObj = {};
	conceptObj.sdxData = sdxData;
    // Default value for data option is EXISTENCE. Attach dataOption and formatter to the newly added concept
	conceptObj.dataOption = i2b2.SCILHSRequestHandler.cellDataOption.DEFAULT;
	//conceptObj.formatter  = i2b2.SCILHSRequestHandler.cellFormatter.defaultFormatter;
    // save the concept object to our local data model
	i2b2.SCILHSRequestHandler.model.concepts.push(conceptObj);
    
	i2b2.SCILHSRequestHandler.lastDroppedTerm = conceptObj;     // remember the last Concept that is dropped
	
    // check to see if the new concept usese value retrictions (whether as a normal concept or a modifier)
	var lvMetaDatas1 = i2b2.h.XPath(sdxData.origData.xmlOrig, 'metadataxml/ValueMetadata[string-length(Version)>0]');
	//var lvMetaDatau1 = i2b2.h.XPath(sdxData.origData.xmlOrig, 'metadataxml/ValueMetadata/UnitValues/NormalUnits/text()');
	
	//if ((lvMetaDatas1.length > 0) && (i2b2.SCILHSRequestHandler.model.showMetadataDialog) && (lvMetaDatau1.length > 0))
	if ((lvMetaDatas1.length > 0) && (i2b2.SCILHSRequestHandler.model.showMetadataDialog))
	{
		//bring up popup for concepts with value restrictions
	    //Change for new value chooser architecture by BG
		// i2b2.SCILHSRequestHandler.view.modalLabValues.show(this, sdxData.origData.key, conceptObj, sdxData.origData.isModifier);
		i2b2.SCILHSRequestHandler.currentTerm = conceptObj;     // remember the last Concept that is dropped
		i2b2.CRC.view.modLabvaluesCtlr.selectValueBox(0, null, sdxData.origData.key, sdxData, false,i2b2.SCILHSRequestHandler);
	}
	else {
    // sort and display the concept list
	i2b2.SCILHSRequestHandler.conceptsRender();
	
	}
	// optimization to prevent requerying the hive for new results if the input dataset has not changed
	i2b2.SCILHSRequestHandler.model.dirtyResultsData = true;
	i2b2.SCILHSRequestHandler.model.readyToPreview = true;
};

i2b2.SCILHSRequestHandler.conceptDelete = function(concptIndex) {
	// remove the selected concept
	i2b2.SCILHSRequestHandler.model.concepts.splice(concptIndex,1);
	// sort and display the concept list
	i2b2.SCILHSRequestHandler.conceptsRender();
	// optimization to prevent requerying the hive for new results if the input dataset has not changed
	i2b2.SCILHSRequestHandler.model.dirtyResultsData = true;
};

i2b2.SCILHSRequestHandler.Resize = function() {
    //var h = parseInt( $('anaPluginViewFrame').style.height ) - 61 - 17;
	//$$("DIV#SCILHSRequestHandler-mainDiv DIV#SCILHSRequestHandler-TABS DIV.results-timelineBox")[0].style.height = h + 'px';
    z = $('anaPluginViewFrame').getHeight() - 40; //- 34;  //BG vertical scrollbar display issues
	//BG tabs being out of sight issue
	var viewportOffset1 = $('anaPluginViewFrame').getBoundingClientRect();
	var viewportOffset2 = $('SCILHSRequestHandler-mainDiv').getBoundingClientRect();
	if((viewportOffset1 && viewportOffset2) && (viewportOffset1.top > viewportOffset2.top))
	{
		var parentDiv = jQuery('#anaPluginViewFrame');
		var childDiv = jQuery('#SCILHSRequestHandler-mainDiv');
		parentDiv.scrollTop(parentDiv.scrollTop() + childDiv.position().top - 5);
	}
	//End BG tabs being out of sight issue
	if( i2b2.PM.model.userRoles.indexOf("DATA_LDS") > -1 ){
		$$('DIV#SCILHSRequestHandler-TABS DIV.SCILHSRequestHandler-MainContent')[0].style.height = z;
		$$('DIV#SCILHSRequestHandler-TABS DIV.SCILHSRequestHandler-MainContent')[1].style.height = z;
	}
    //$$('DIV#SCILHSRequestHandler-TABS DIV.SCILHSRequestHandler-MainContent')[2].style.height = z;
    //$$('DIV#SCILHSRequestHandler-TABS DIV.SCILHSRequestHandler-MainContent')[3].style.height = z;
    //$$('DIV#SCILHSRequestHandler-TABS DIV.SCILHSRequestHandler-MainContent')[4].style.height = z;
    //$$('DIV#SCILHSRequestHandler-TABS DIV.SCILHSRequestHandler-MainContent')[5].style.height = z;


    //	try { i2b2.SCILHSRequestHandler.yuiPanel.destroy(); } catch(e) {}
};

i2b2.SCILHSRequestHandler.wasHidden = function() {
	try { i2b2.SCILHSRequestHandler.yuiPanel.destroy(); } catch(e) {}
};



i2b2.SCILHSRequestHandler.removeRequired = function(req_key){
	i2b2.SCILHSRequestHandler.model.dirtyResultsData = true;
	i2b2.SCILHSRequestHandler.model.readyToPreview = true;
	if(document.getElementById("chk_"+req_key).checked){
		i2b2.SCILHSRequestHandler.model.required[req_key].display = true;
	} else {
		i2b2.SCILHSRequestHandler.model.required[req_key].display = false;
	}

};

i2b2.SCILHSRequestHandler.editConcept = function(conceptIndex)
{    
    //Change for new value chooser architecture by BG
	// i2b2.SCILHSRequestHandler.view.modalLabValues.show(this, i2b2.SCILHSRequestHandler.model.concepts[conceptIndex].sdxData.origData.key,
                                                         // i2b2.SCILHSRequestHandler.model.concepts[conceptIndex],
                                                         // i2b2.SCILHSRequestHandler.model.concepts[conceptIndex].sdxData.origData.isModifier);
	var conceptObj = i2b2.SCILHSRequestHandler.model.concepts[conceptIndex];
	i2b2.SCILHSRequestHandler.currentTerm = conceptObj;     // remember the last Concept that is dropped
	i2b2.CRC.view.modLabvaluesCtlr.selectValueBox(0, null, i2b2.SCILHSRequestHandler.model.concepts[conceptIndex].sdxData.origData.key,
														i2b2.SCILHSRequestHandler.model.concepts[conceptIndex].sdxData, false,i2b2.SCILHSRequestHandler);
};

i2b2.SCILHSRequestHandler.getValueType = function( xmlOrig )
{
    var returnValues = {};
    returnValues.valueMetadataNodes = i2b2.h.XPath(xmlOrig, 'metadataxml/ValueMetadata[string-length(Version)>0]');
    if (returnValues.valueMetadataNodes.length > 0)
    {
        // check to see if the dropped concept uses numeric, enum, or blob values.
        var dataTypeArray = i2b2.h.XPath(returnValues.valueMetadataNodes[0], 'DataType');
        if (dataTypeArray.length > 0) 
        {
            var dataType = jQuery(dataTypeArray[0]).text().toLowerCase();
            if ((dataType == "posinteger") || (dataType == "integer") || (dataType == "posfloat") || (dataType == "float"))
                returnValues.valueType = i2b2.SCILHSRequestHandler.valueType.NUMERIC;
            else if (dataType == "enum")
                returnValues.valueType = i2b2.SCILHSRequestHandler.valueType.ENUM;
            else if (dataType == "largestring")
                returnValues.valueType = i2b2.SCILHSRequestHandler.valueType.BLOB;
            else
                returnValues.valueType = i2b2.SCILHSRequestHandler.valueType.UNKNOWN; // no known type, it's a bug if UNKNOWN is returned.
            return returnValues;
        }
    }
    return null; // No Value Metadata 
};

i2b2.SCILHSRequestHandler.spanifyInactiveValueConstraint = function()
{
    return "<span class=\"valueConstraint_Inactive\">[Set Value Constraint]</span>"; // uses no value constraint
};

i2b2.SCILHSRequestHandler.spanifyValueConstraint = function(name, conceptIndex)
{
    return "[<a class =\"valueConstraint\" href=\"JavaScript:i2b2.SCILHSRequestHandler.editConcept(" + conceptIndex + ");\">" + name + "</a>]";
};


/* pass in a values object and this function returns text representation */
i2b2.SCILHSRequestHandler.makeValueText = function( values ){
    var tt = "";
    if (undefined != values){
        switch (values.MatchBy){
            case "FLAG":
                tt = ' = ' + i2b2.h.Escape(values.ValueFlag);
                break;
            case "VALUE":
                if (values.GeneralValueType == "ENUM"){
                    var sEnum = [];
                    for (var i2 = 0; i2 < values.ValueEnum.length; i2++)
                        sEnum.push(i2b2.h.Escape(values.ValueEnum[i2]));
                    sEnum = sEnum.join("\", \"");
                    sEnum = ' =  ("' + sEnum + '")';
                    tt = sEnum;
                }
                else if ((values.GeneralValueType== "LARGESTRING") || (values.GeneralValueType=="TEXT")) {
                    tt = 'contains "' + i2b2.h.Escape(values.ValueString) + '"';
				}
                else if (values.GeneralValueType == "STRING"){
                    if (values.StringOp == undefined)
                        var stringOp = "";
                    else{
                        switch (values.StringOp){
                            case "LIKE[exact]":
                                var stringOp = "Exact: ";
                                break;
                            case "LIKE[begin]":
                                var stringOp = "Starts With: ";
                                break;
                            case "LIKE[end]":
                                var stringOp = "Ends With: ";
                                break;
                            case "LIKE[contains]":
                                var stringOp = "Contains: ";
                                break;
                            default:
                                var stringOp = "";
                                break;
                        }
                    }
                    tt = ' [' + stringOp + i2b2.h.Escape(values.ValueString) + "]";
                }
                else if (values.GeneralValueType == "GENOTYPE") {
					if(values.searchByRsId){
						var containsText = values.ValueString + ((values.Zygosity && values.Zygosity != '')?(" AND "+values.Zygosity):"") + ((values.Allele && values.Allele != '')?(" AND "+values.Allele):"") + ((values.Consequence && values.Consequence != '')?(" AND "+values.Consequence):"");
					}
					if(values.searchByGeneName){
						var containsText = values.ValueString + ((values.Zygosity && values.Zygosity != '')?(" AND "+values.Zygosity):"") + ((values.Consequence && values.Consequence != '')?(" AND "+values.Consequence):"") ;
					}
					tt = 'contains "' + containsText +'"';
				}
                else { // numeric value
                    var unit = "";
                    if (!Object.isUndefined(values.UnitsCtrl))
                        unit = values.UnitsCtrl;
                    if (values.NumericOp == 'BETWEEN')
                        tt = i2b2.h.Escape(values.ValueLow) + ' - ' + i2b2.h.Escape(values.ValueHigh);
                    else{
                        switch (values.NumericOp){
                            case "LT":
                                var numericOp = "< ";
                                break;
                            case "LE":
                                var numericOp = "<= ";
                                break;
                            case "EQ":
                                var numericOp = "= ";
                                break;
                            case "GT":
                                var numericOp = "> ";
                                break;
                            case "GE":
                                var numericOp = ">= ";
                                break;
                            case "":
                                break;
                        }
                        tt = numericOp + i2b2.h.Escape(values.Value);
                    }
                    tt = tt + "" + unit;
                }
                break;
            case "":
                break;
        }
    }
    return tt;
}

/* pass in a values object and this function returns an innerHTML suitable for display */
i2b2.SCILHSRequestHandler.makeValueConstraintInnerHTML = function(valueInfo, values, conceptIndex)
{
    var valueText = "";
    if (!valueInfo)
        return '';
    valueText = i2b2.SCILHSRequestHandler.makeValueText(values);
    if (valueText ==="")
        valueText = "Set Value"; // empty constraint
		
	valueHTML = "<img align=\"absbottom\" style=\"margin-left:10px;\" src=\"js-i2b2/cells/plugins/community/SCILHSRequestHandler/assets/value.png\" border=\"0\"/> [<a data-tooltip=\"This concept can be constrained by a specific value\" class=\"valueConstraint\" href=\"JavaScript:i2b2.SCILHSRequestHandler.editConcept(" + conceptIndex + ");\">" + valueText + "</a>]";
    return valueHTML;
};

i2b2.SCILHSRequestHandler.makeValueConstraintText = function(valueInfo, values)
{
    var valueText = "";
    if (!valueInfo)
        return "";
	valueText = i2b2.SCILHSRequestHandler.makeValueText(values);
    if (valueText ==="")
		return "";
		
    valueText = " [" + valueText + "]";
    return valueText;
};

i2b2.SCILHSRequestHandler.sanitizeConcepts = function() {  //works for genotype and ppv concepts
	for (var i1 = 0; i1 < i2b2.SCILHSRequestHandler.model.concepts.length; i1++){
		// Check if GENOTYPE value has constraint. If not, remove it
		// if(i2b2.SCILHSRequestHandler.model.concepts[i1].sdxData.origData.key.indexOf('Biobank Genomics\\Gene\\') > -1 || i2b2.SCILHSRequestHandler.model.concepts[i1].sdxData.origData.key.indexOf('Biobank Genomics\\dbSNP rs Identifier\\') > -1){
			if(!i2b2.SCILHSRequestHandler.model.concepts[i1].hasOwnProperty('valueRestriction')){
				i2b2.SCILHSRequestHandler.conceptDelete(i1);
			}
		// }
	}
};

i2b2.SCILHSRequestHandler.modifyConceptList = function() {
	i2b2.SCILHSRequestHandler.sanitizeConcepts();
};

i2b2.SCILHSRequestHandler.conceptsRenderFromValueBox = function() {
	i2b2.SCILHSRequestHandler.currentTerm.valueRestriction = i2b2.SCILHSRequestHandler.currentTerm.LabValues;
	i2b2.SCILHSRequestHandler.model.dirtyResultsData = true;
	// update the panel/query tool GUI
	i2b2.SCILHSRequestHandler.conceptsRender(); //update GUI
};

i2b2.SCILHSRequestHandler.conceptsRender = function() {
	var s = '<table style="width:98%;margin-top:15px;"><tr><td style="font-size:14px;padding:10px;background:#5FA9BE;color:#FFF;font-weight:bold;text-shadow:none;">Concept</td><td style="font-size:14px;padding:10px;background:#5FA9BE;color:#FFF;font-weight:bold;text-shadow:none;">Constraints</td><td style="font-size:14px;padding:10px;background:#5FA9BE;color:#FFF;font-weight:bold;text-shadow:none;">Aggregation Option</td><td style="font-size:14px;padding:10px;background:#5FA9BE;color:#FFF;font-weight:bold;text-shadow:none;">Include In File</td></tr>'; // innerHTML for concept list
    var t = ''; // innerHTML for concpet config
	// are there any concepts in the list
	
	for (var key in i2b2.SCILHSRequestHandler.model.required) {
		if (i2b2.SCILHSRequestHandler.model.required.hasOwnProperty(key)) {
			s += "<tr><td><img align=\"absbottom\" style=\"margin-left:5px;\" src=\"js-i2b2/cells/plugins/community/SCILHSRequestHandler/assets/demographic.png\" border=\"0\"> "+ i2b2.SCILHSRequestHandler.model.required[key].name +"</td><td></td><td>";
			s += "<select class=\"conceptConfigSelect\"> <option value=\"value\">Value</option></select> <a href='#' onclick='return false;' data-tooltip='Value of Default Column'><img style='margin-bottom:-3px;' src='js-i2b2/cells/plugins/community/SCILHSRequestHandler/assets/tooltip.png'/></a>";
			s += "</td><td><input type=\"checkbox\" id=\"chk_"+key+"\"";
			if(i2b2.SCILHSRequestHandler.model.required[key].display){
				s += " checked=\"checked\"";
			}
			s += " onchange=\"javascript:i2b2.SCILHSRequestHandler.removeRequired('"+key+"');\"></td></tr>";
		}	
	}
	
	
	if (i2b2.SCILHSRequestHandler.model.concepts.length > 0)
	{
	    jQuery("#SCILHSRequestHandler-CONCPTCONFIG").show();      // display concept configuration table
	    i2b2.SCILHSRequestHandler.model.concepts.sort(function () // sort the concepts in alphabetical order
	    {
	        return arguments[0].sdxData.sdxInfo.sdxDisplayName > arguments[1].sdxData.sdxInfo.sdxDisplayName
	    });
		// draw the list of concepts
	    for (var i1 = 0; i1 < i2b2.SCILHSRequestHandler.model.concepts.length; i1++){

			if (i1 > 0) 
            { 
			    s += '<div class="concptDiv"></div>'; // create horizontal divider between concepts, starting with the 1st concept
			    t += '<div class="concptDiv"></div>';
            }	
			valueHTML = "";
			valueText = "";
			tt = i2b2.SCILHSRequestHandler.spanifyInactiveValueConstraint('[Set Value Constraint]');
			// get an appropriate path for the ontology term's icon
			var conceptIconPath = undefined;
			if (i2b2.SCILHSRequestHandler.model.concepts[i1].sdxData.renderData) // this is a concept from ONTOLOGY
				conceptIconPath = i2b2.SCILHSRequestHandler.model.concepts[i1].sdxData.renderData.icon;
			else                                                                        // this is a concept from WORKPLACE
				conceptIconPath = i2b2.SCILHSRequestHandler.model.concepts[i1].sdxData.iconExp;
			var modInfo = null;
			var modValues = null;
			var valueInfo = null;
			var values = null;
			if (i2b2.SCILHSRequestHandler.model.concepts[i1].sdxData.origData.isModifier)
			{
				//modInfo = i2b2.SCILHSRequestHandler.getValueType(i2b2.SCILHSRequestHandler.model.concepts[i1].sdxData.origData.xmlOrig); // this gets the modifier's value metadata
				//modValues = i2b2.SCILHSRequestHandler.retrieveValueConstraint(i0, i1);
			}
			else 
			{
				// gather value metadata information: valueInfo.valueType (NUMERIC, ENUM, BLOB) and valueInfo.valueMetadataNodes (actual XML nodes)
				valueInfo = i2b2.SCILHSRequestHandler.getValueType(i2b2.SCILHSRequestHandler.model.concepts[i1].sdxData.origData.xmlOrig);
				// now we obtain the actual Value Constraint (if any) associated with the concept
				values = i2b2.SCILHSRequestHandler.retrieveValueConstraint(i1);
				
				
				// create HTML for the value constraint
				valueHTML = i2b2.SCILHSRequestHandler.makeValueConstraintInnerHTML(valueInfo, values, i1);
				valueText = i2b2.SCILHSRequestHandler.makeValueConstraintText(valueInfo, values);
			}
		
			//	values = i2b2.SCILHSRequestHandler.model.concepts[i1].sdxData.LabValues;

			var textDisplay = i2b2.h.Escape(i2b2.SCILHSRequestHandler.model.concepts[i1].sdxData.sdxInfo.sdxDisplayName);
			if ( i2b2.SCILHSRequestHandler.model.concepts[i1].sdxData.origData.isModifier )
                if (valueHTML === "")
                    textDisplay = i2b2.h.Escape(i2b2.SCILHSRequestHandler.model.concepts[i1].sdxData.sdxInfo.sdxDisplayName) + " [" + i2b2.h.Escape(i2b2.SCILHSRequestHandler.model.concepts[i1].sdxData.origData.name) + "]";
                else
                    textDisplay = i2b2.h.Escape(i2b2.SCILHSRequestHandler.model.concepts[i1].sdxData.sdxInfo.sdxDisplayName) + " [" + i2b2.h.Escape(i2b2.SCILHSRequestHandler.model.concepts[i1].sdxData.origData.name) + tt + "]";
            else
			    textDisplay = i2b2.h.Escape(i2b2.SCILHSRequestHandler.model.concepts[i1].sdxData.sdxInfo.sdxDisplayName);
			i2b2.SCILHSRequestHandler.model.concepts[i1].textDisplay = textDisplay.replace(/,/g,"-") + valueText; // save the text display back to the conceptObj data structure so the table can display it correctly
			i2b2.SCILHSRequestHandler.model.concepts[i1].panel = i1;
			
			var dateText = i2b2.SCILHSRequestHandler.makeDateRangeConstraintInnerHTML(i1);
			s += "<tr><td><img align=\"absbottom\" style=\"margin-left:5px;\" src=\"" + conceptIconPath + "\" border=\"0\"> " + textDisplay + "</td><td style=\"color:#575757\">" + dateText + valueHTML + "</td><td>";
			
			// if a [patient_dimension] concept, only allow EXISTENCE and COUNT (to-do)
			if (i2b2.SCILHSRequestHandler.model.concepts[i1].sdxData.origData.table_name.toLowerCase() === 'patient_dimension'){
				s += "<select onchange=\"i2b2.SCILHSRequestHandler.setTooltip("+i1+");\" id=\"" + i2b2.SCILHSRequestHandler.columnDisplaySelectID + i1 + "\" class=\"conceptConfigSelect\">\n" +
						"<option value=\"" + i2b2.SCILHSRequestHandler.cellDataOption.DEFAULT + "\">" + i2b2.SCILHSRequestHandler.cellDataOption.DEFAULT + "</option>\n" +
						"<option value=\"" + i2b2.SCILHSRequestHandler.cellDataOption.ALLVALUES + "\">Value</option>\n" +
					 "</select> <a id='tooltip"+i1+"' href='#' onclick='return false;' data-tooltip='Any existence of the observation will show Yes'><img style='margin-bottom:-3px;' src='js-i2b2/cells/plugins/community/SCILHSRequestHandler/assets/tooltip.png'/></a>";
				//s += "<select id=\"" + i2b2.SCILHSRequestHandler.columnDisplaySelectID + i1 + "\" class=\"conceptConfigSelect\"> <option value=\"" + i2b2.SCILHSRequestHandler.cellDataOption.DEFAULT + "\">Yes/No</option></select>";
			}
			else { // [concept_dimension] or [modifier_dimension]
			
				if ((i2b2.SCILHSRequestHandler.model.concepts[i1].sdxData.origData.table_name.toLowerCase() === 'concept_dimension') &&
				(valueInfo && (valueInfo.valueType !== i2b2.SCILHSRequestHandler.valueType.MIXED))){
					if (valueInfo.valueType === i2b2.SCILHSRequestHandler.valueType.NUMERIC){
						s += "<select onchange=\"i2b2.SCILHSRequestHandler.setTooltip("+i1+");\" id=\"" + i2b2.SCILHSRequestHandler.columnDisplaySelectID + i1 + "\" class=\"conceptConfigSelect\">\n" +
								"<option value=\"" + i2b2.SCILHSRequestHandler.cellDataOption.DEFAULT + "\">" + i2b2.SCILHSRequestHandler.cellDataOption.DEFAULT + "</option>\n" +
								"<option value=\"" + i2b2.SCILHSRequestHandler.cellDataOption.ALLVALUES + "\">"+i2b2.SCILHSRequestHandler.cellDataOption.ALLVALUES+"</option>\n" +
								"<option value=\"" + i2b2.SCILHSRequestHandler.cellDataOption.MODE + "\">"+i2b2.SCILHSRequestHandler.cellDataOption.MODE+"</option>\n" +
								"<option value=\"" + i2b2.SCILHSRequestHandler.cellDataOption.MIN + "\">"+i2b2.SCILHSRequestHandler.cellDataOption.MIN+"</option>\n" +
								"<option value=\"" + i2b2.SCILHSRequestHandler.cellDataOption.MAX + "\">"+i2b2.SCILHSRequestHandler.cellDataOption.MAX+"</option>\n" +
								"<option value=\"" + i2b2.SCILHSRequestHandler.cellDataOption.AVERAGE + "\">"+i2b2.SCILHSRequestHandler.cellDataOption.AVERAGE+"</option>\n" +
								"<option value=\"" + i2b2.SCILHSRequestHandler.cellDataOption.MEDIAN + "\">"+i2b2.SCILHSRequestHandler.cellDataOption.MEDIAN+"</option>\n" +
								"<option value=\"" + i2b2.SCILHSRequestHandler.cellDataOption.FIRST + "\">"+i2b2.SCILHSRequestHandler.cellDataOption.FIRST+"</option>\n" +
								"<option value=\"" + i2b2.SCILHSRequestHandler.cellDataOption.LAST + "\">"+i2b2.SCILHSRequestHandler.cellDataOption.LAST+"</option>\n" +
								"<option value=\"" + i2b2.SCILHSRequestHandler.cellDataOption.COUNT + "\">"+i2b2.SCILHSRequestHandler.cellDataOption.COUNT+"</option>\n" +
								"<option value=\"" + i2b2.SCILHSRequestHandler.cellDataOption.ALLCONCEPTTEXT + "\">"+i2b2.SCILHSRequestHandler.cellDataOption.ALLCONCEPTTEXT+"</option>\n" +
								"<option value=\"" + i2b2.SCILHSRequestHandler.cellDataOption.MODECONCEPTTEXT + "\">"+i2b2.SCILHSRequestHandler.cellDataOption.MODECONCEPTTEXT+"</option>n" +
								"<option value=\"" + i2b2.SCILHSRequestHandler.cellDataOption.ALLCONCEPTCODE + "\">"+i2b2.SCILHSRequestHandler.cellDataOption.ALLCONCEPTCODE+"</option>\n" +
								"<option value=\"" + i2b2.SCILHSRequestHandler.cellDataOption.MODECONCEPTCODE + "\">"+i2b2.SCILHSRequestHandler.cellDataOption.MODECONCEPTCODE+"</option>\n" +
							  "</select> <a id='tooltip"+i1+"' href='#' onclick='return false;' data-tooltip='Any existence of the observation'><img style='margin-bottom:-3px;' src='js-i2b2/cells/plugins/community/SCILHSRequestHandler/assets/tooltip.png'/></a>";
					} else {
						s += "<select onchange=\"i2b2.SCILHSRequestHandler.setTooltip("+i1+");\" id=\"" + i2b2.SCILHSRequestHandler.columnDisplaySelectID + i1 + "\" class=\"conceptConfigSelect\">\n" +
								"<option value=\"" + i2b2.SCILHSRequestHandler.cellDataOption.DEFAULT + "\">" + i2b2.SCILHSRequestHandler.cellDataOption.DEFAULT + "</option>\n" +
								"<option value=\"" + i2b2.SCILHSRequestHandler.cellDataOption.ALLVALUES + "\">"+i2b2.SCILHSRequestHandler.cellDataOption.ALLVALUES+"</option>\n" +
								"<option value=\"" + i2b2.SCILHSRequestHandler.cellDataOption.MODE + "\">"+i2b2.SCILHSRequestHandler.cellDataOption.MODE+"</option>\n" +
								"<option value=\"" + i2b2.SCILHSRequestHandler.cellDataOption.FIRST + "\">"+i2b2.SCILHSRequestHandler.cellDataOption.FIRST+"</option>\n" +
								"<option value=\"" + i2b2.SCILHSRequestHandler.cellDataOption.LAST + "\">"+i2b2.SCILHSRequestHandler.cellDataOption.LAST+"</option>\n" +
								"<option value=\"" + i2b2.SCILHSRequestHandler.cellDataOption.COUNT + "\">"+i2b2.SCILHSRequestHandler.cellDataOption.COUNT+"</option>\n" +
								"<option value=\"" + i2b2.SCILHSRequestHandler.cellDataOption.ALLCONCEPTTEXT + "\">"+i2b2.SCILHSRequestHandler.cellDataOption.ALLCONCEPTTEXT+"</option>\n" +
								"<option value=\"" + i2b2.SCILHSRequestHandler.cellDataOption.MODECONCEPTTEXT + "\">"+i2b2.SCILHSRequestHandler.cellDataOption.MODECONCEPTTEXT+"</option>n" +
								"<option value=\"" + i2b2.SCILHSRequestHandler.cellDataOption.ALLCONCEPTCODE + "\">"+i2b2.SCILHSRequestHandler.cellDataOption.ALLCONCEPTCODE+"</option>\n" +
								"<option value=\"" + i2b2.SCILHSRequestHandler.cellDataOption.MODECONCEPTCODE + "\">"+i2b2.SCILHSRequestHandler.cellDataOption.MODECONCEPTCODE+"</option>\n" +
							  "</select> <a id='tooltip"+i1+"' href='#' onclick='return false;' data-tooltip='Any existence of the observation'><img style='margin-bottom:-3px;' src='js-i2b2/cells/plugins/community/SCILHSRequestHandler/assets/tooltip.png'/></a>";
					}
				}	
				else { // no values
					s += "<select onchange=\"i2b2.SCILHSRequestHandler.setTooltip("+i1+");\" id=\"" + i2b2.SCILHSRequestHandler.columnDisplaySelectID + i1 + "\" class=\"conceptConfigSelect\">\n" +
							"<option value=\"" + i2b2.SCILHSRequestHandler.cellDataOption.DEFAULT + "\">" + i2b2.SCILHSRequestHandler.cellDataOption.DEFAULT + "</option>\n" +
							"<option value=\"" + i2b2.SCILHSRequestHandler.cellDataOption.FIRST + "\">"+i2b2.SCILHSRequestHandler.cellDataOption.FIRST+"</option>\n" +
							"<option value=\"" + i2b2.SCILHSRequestHandler.cellDataOption.LAST + "\">"+i2b2.SCILHSRequestHandler.cellDataOption.LAST+"</option>\n" +
							"<option value=\"" + i2b2.SCILHSRequestHandler.cellDataOption.COUNT + "\">"+i2b2.SCILHSRequestHandler.cellDataOption.COUNT+"</option>\n" +
							"<option value=\"" + i2b2.SCILHSRequestHandler.cellDataOption.ALLCONCEPTTEXT + "\">"+i2b2.SCILHSRequestHandler.cellDataOption.ALLCONCEPTTEXT+"</option>\n" +
							"<option value=\"" + i2b2.SCILHSRequestHandler.cellDataOption.MODECONCEPTTEXT + "\">"+i2b2.SCILHSRequestHandler.cellDataOption.MODECONCEPTTEXT+"</option>n" +
							"<option value=\"" + i2b2.SCILHSRequestHandler.cellDataOption.ALLCONCEPTCODE + "\">"+i2b2.SCILHSRequestHandler.cellDataOption.ALLCONCEPTCODE+"</option>\n" +
							"<option value=\"" + i2b2.SCILHSRequestHandler.cellDataOption.MODECONCEPTCODE + "\">"+i2b2.SCILHSRequestHandler.cellDataOption.MODECONCEPTCODE+"</option>\n" +
						  "</select> <a id='tooltip"+i1+"' href='#' onclick='return false;' data-tooltip='Any existence of the observation'><img style='margin-bottom:-3px;' src='js-i2b2/cells/plugins/community/SCILHSRequestHandler/assets/tooltip.png'/></a>";
				}
			}
			s += "</td><td><a href=\"JavaScript:i2b2.SCILHSRequestHandler.conceptDelete(" + i1 + ");\"><img src=\"js-i2b2/cells/plugins/community/SCILHSRequestHandler/assets/delete.png\" title=\"Remove this Concept\" align=\"absbottom\" border=\"0\"/></a></td></tr>";
        }
	   // $("SCILHSRequestHandler-CONCPTDROP").style.padding = "0px 0px";     // remove extra vertical padding
	   // $("SCILHSRequestHandler-CONCPTCONFIG").style.padding = "0px 0px";   // remove extra vertical padding
	}
	else // no concepts selected yet
	{
	    //s = "<img src=\"js-i2b2/cells/plugins/community/SCILHSRequestHandler/assets/pointer.png\" align=\"absbottom\" style=\"margin-left:5px;\" /> Drag &amp; Drop one or more <em>Ontology Terms</em> here";
		//s = "";
		//$("SCILHSRequestHandler-CONCPTDROP").style.padding = "5px 0px";
		//jQuery("#SCILHSRequestHandler-CONCPTCONFIG").hide(); // hide concept config table
    }
	s += "</table>";
	
	$("SCILHSRequestHandler-CONCEPTS").innerHTML = s;
	//$("SCILHSRequestHandler-CONCPTDROP").innerHTML   = s;                     // update html
	//$("SCILHSRequestHandler-CONCPTCONFIG").innerHTML = t;

    // add default values to select elements and bind a handler to listen for change events
	for (var j = 0; j < i2b2.SCILHSRequestHandler.model.concepts.length; j++)
    {
	    var select = jQuery("#" + i2b2.SCILHSRequestHandler.columnDisplaySelectID+j);
	    if (i2b2.SCILHSRequestHandler.model.concepts[j].dataOption){
	        select.val(i2b2.SCILHSRequestHandler.model.concepts[j].dataOption );
			i2b2.SCILHSRequestHandler.setTooltip(j);
			i2b2.SCILHSRequestHandler.setDateTooltip(j);
		}
	    select.on("change", null, {index:j, value:select.val()} , i2b2.SCILHSRequestHandler.handleConceptConfigItemSelectionChange ); // attach listener to handle selection change
    }
};

i2b2.SCILHSRequestHandler.showDateRangeConstraintDialog = function(conceptIndex)
{
    i2b2.SCILHSRequestHandler.UI.DateConstraint.showDates(conceptIndex);
};

// construct the innerHTML for the concptItem div to include
i2b2.SCILHSRequestHandler.makeDateRangeConstraintInnerHTML = function(conceptIndex)
{   // date constraints do not make sense for patient dimension concepts
    if (i2b2.SCILHSRequestHandler.model.concepts[conceptIndex].sdxData.origData.table_name.toLowerCase() === 'patient_dimension')
        return "";

    var dateText = "";

    if (!i2b2.SCILHSRequestHandler.model.concepts[conceptIndex].dateFrom && !i2b2.SCILHSRequestHandler.model.concepts[conceptIndex].dateTo){
        dateText = "Set Date";
	}	
    else if (i2b2.SCILHSRequestHandler.model.concepts[conceptIndex].dateFrom && !i2b2.SCILHSRequestHandler.model.concepts[conceptIndex].dateTo){
        dateText = "&ge;" + padNumber(i2b2.SCILHSRequestHandler.model.concepts[conceptIndex].dateFrom.Month, 2) + "/" + padNumber(i2b2.SCILHSRequestHandler.model.concepts[conceptIndex].dateFrom.Day, 2) + "/" + i2b2.SCILHSRequestHandler.model.concepts[conceptIndex].dateFrom.Year;
	}
    else if (!i2b2.SCILHSRequestHandler.model.concepts[conceptIndex].dateFrom && i2b2.SCILHSRequestHandler.model.concepts[conceptIndex].dateTo){
        dateText = "&le;" + padNumber(i2b2.SCILHSRequestHandler.model.concepts[conceptIndex].dateTo.Month, 2) + "/" + padNumber(i2b2.SCILHSRequestHandler.model.concepts[conceptIndex].dateTo.Day, 2) + "/" + i2b2.SCILHSRequestHandler.model.concepts[conceptIndex].dateTo.Year;
	}
    else{
        dateText = padNumber(i2b2.SCILHSRequestHandler.model.concepts[conceptIndex].dateFrom.Month, 2) + "/" + padNumber(i2b2.SCILHSRequestHandler.model.concepts[conceptIndex].dateFrom.Day, 2) + "/" + i2b2.SCILHSRequestHandler.model.concepts[conceptIndex].dateFrom.Year + " to " + padNumber(i2b2.SCILHSRequestHandler.model.concepts[conceptIndex].dateTo.Month, 2) + "/" + padNumber(i2b2.SCILHSRequestHandler.model.concepts[conceptIndex].dateTo.Day, 2) + "/" + i2b2.SCILHSRequestHandler.model.concepts[conceptIndex].dateTo.Year;
	}
    return "<img align=\"absbottom\" style=\"margin-left:5px;\" src=\"js-i2b2/cells/plugins/community/SCILHSRequestHandler/assets/calendar.gif\" border=\"0\"><span> [<a id=\"dateTooltip"+conceptIndex+"\" data-tooltip=\"\" class=\"dateRangeConstraint\" href=\"JavaScript:i2b2.SCILHSRequestHandler.showDateRangeConstraintDialog(" + conceptIndex + ");\">" + dateText + "</a>]</span>";
};

i2b2.SCILHSRequestHandler.makeDateRangeConstraintText = function(conceptIndex)
{   // date constraints do not make sense for patient dimension concepts
    if (i2b2.SCILHSRequestHandler.model.concepts[conceptIndex].sdxData.origData.table_name.toLowerCase() === 'patient_dimension')
        return "";

    var dateText = "";
	var concept = i2b2.SCILHSRequestHandler.model.concepts[conceptIndex];
	var dateFrom = concept.hasOwnProperty('dateFrom');
	var dateTo = concept.hasOwnProperty('dateTo');
	
	if(dateFrom){
		if(concept.dateFrom == false){
			dateFrom = false;
		}
	}
	if(dateTo){
		if(concept.dateTo == false){
			dateTo = false;
		}
	}
	if (!dateFrom && !dateTo){
		return "";
	}
	
    if (dateFrom && !dateTo){
        dateText = "From " + padNumber(i2b2.SCILHSRequestHandler.model.concepts[conceptIndex].dateFrom.Month, 2) + "/" + padNumber(i2b2.SCILHSRequestHandler.model.concepts[conceptIndex].dateFrom.Day, 2) + "/" + i2b2.SCILHSRequestHandler.model.concepts[conceptIndex].dateFrom.Year;
	}
	else if (!dateFrom && dateTo){
        dateText = "To " + padNumber(i2b2.SCILHSRequestHandler.model.concepts[conceptIndex].dateTo.Month, 2) + "/" + padNumber(i2b2.SCILHSRequestHandler.model.concepts[conceptIndex].dateTo.Day, 2) + "/" + i2b2.SCILHSRequestHandler.model.concepts[conceptIndex].dateTo.Year;
	}
	else {
        dateText = padNumber(i2b2.SCILHSRequestHandler.model.concepts[conceptIndex].dateFrom.Month, 2) + "/" + padNumber(i2b2.SCILHSRequestHandler.model.concepts[conceptIndex].dateFrom.Day, 2) + "/" + i2b2.SCILHSRequestHandler.model.concepts[conceptIndex].dateFrom.Year + " to " + padNumber(i2b2.SCILHSRequestHandler.model.concepts[conceptIndex].dateTo.Month, 2) + "/" + padNumber(i2b2.SCILHSRequestHandler.model.concepts[conceptIndex].dateTo.Day, 2) + "/" + i2b2.SCILHSRequestHandler.model.concepts[conceptIndex].dateTo.Year;
	}
    return "<br/>[" + dateText + "]";
};


i2b2.SCILHSRequestHandler.setDateTooltip = function(conceptIndex){
	var dateTooltip = "";

    if (!i2b2.SCILHSRequestHandler.model.concepts[conceptIndex].dateFrom && !i2b2.SCILHSRequestHandler.model.concepts[conceptIndex].dateTo){
		dateTooltip = "Optional Date Range Constraint is not set";
	}	
    else if (i2b2.SCILHSRequestHandler.model.concepts[conceptIndex].dateFrom && !i2b2.SCILHSRequestHandler.model.concepts[conceptIndex].dateTo){
        dateText = padNumber(i2b2.SCILHSRequestHandler.model.concepts[conceptIndex].dateFrom.Month, 2) + "/" + padNumber(i2b2.SCILHSRequestHandler.model.concepts[conceptIndex].dateFrom.Day, 2) + "/" + i2b2.SCILHSRequestHandler.model.concepts[conceptIndex].dateFrom.Year;
		dateTooltip = "Only find this concept starting from "+dateText;
	}
    else if (!i2b2.SCILHSRequestHandler.model.concepts[conceptIndex].dateFrom && i2b2.SCILHSRequestHandler.model.concepts[conceptIndex].dateTo){
        dateText = padNumber(i2b2.SCILHSRequestHandler.model.concepts[conceptIndex].dateTo.Month, 2) + "/" + padNumber(i2b2.SCILHSRequestHandler.model.concepts[conceptIndex].dateTo.Day, 2) + "/" + i2b2.SCILHSRequestHandler.model.concepts[conceptIndex].dateTo.Year;
		dateTooltip = "Only find this concept until "+dateText;
	}
    else{
        dateText = padNumber(i2b2.SCILHSRequestHandler.model.concepts[conceptIndex].dateFrom.Month, 2) + "/" + padNumber(i2b2.SCILHSRequestHandler.model.concepts[conceptIndex].dateFrom.Day, 2) + "/" + i2b2.SCILHSRequestHandler.model.concepts[conceptIndex].dateFrom.Year + " to " + padNumber(i2b2.SCILHSRequestHandler.model.concepts[conceptIndex].dateTo.Month, 2) + "/" + padNumber(i2b2.SCILHSRequestHandler.model.concepts[conceptIndex].dateTo.Day, 2) + "/" + i2b2.SCILHSRequestHandler.model.concepts[conceptIndex].dateTo.Year;
		dateTooltip = "Only find this concept from "+dateText;
	}
	jQuery('#dateTooltip'+conceptIndex).attr('data-tooltip', dateTooltip);
};

i2b2.SCILHSRequestHandler.setTooltip = function(index){
	var select = jQuery("#" + i2b2.SCILHSRequestHandler.columnDisplaySelectID+index).val();
	switch(select){
		case i2b2.SCILHSRequestHandler.cellDataOption.DEFAULT:
			var tooltip = "Any existence of the observation";
			break;
		case i2b2.SCILHSRequestHandler.cellDataOption.MIN:
			var tooltip = "Minimum value of all numerical values observations";
			break;
		case i2b2.SCILHSRequestHandler.cellDataOption.MAX:
			var tooltip = "Maximum value of all numerical values observations";
			break;
		case i2b2.SCILHSRequestHandler.cellDataOption.FIRST:
			var tooltip = "Date of earliest observation";
			break;
		case i2b2.SCILHSRequestHandler.cellDataOption.LAST:
			var tooltip = "Date of the most recent observation";
			break;
		case i2b2.SCILHSRequestHandler.cellDataOption.ALLCONCEPTTEXT:
			var tooltip = "All concept names are listed";
			break;
		case i2b2.SCILHSRequestHandler.cellDataOption.MODECONCEPTTEXT:
			var tooltip = "Most frequent concept name(s) are listed";
			break;
		case i2b2.SCILHSRequestHandler.cellDataOption.ALLCONCEPTCODE:
			var tooltip = "All concept codes are listed";
			break;
		case i2b2.SCILHSRequestHandler.cellDataOption.MODECONCEPTCODE:
			var tooltip = "Most frequent concept code(s) are listed";
			break;
		case i2b2.SCILHSRequestHandler.cellDataOption.COUNT:
			var tooltip = "Total number of observations";
			break;
		case i2b2.SCILHSRequestHandler.cellDataOption.AVERAGE:
			var tooltip = "Average Value";
			break;
		case i2b2.SCILHSRequestHandler.cellDataOption.MEDIAN:
			var tooltip = "Median Value";
			break;
		case i2b2.SCILHSRequestHandler.cellDataOption.ALLVALUES:
			var tooltip = "List of All Value(s)";
			break;
		case i2b2.SCILHSRequestHandler.cellDataOption.MODE:
			var tooltip = "Mode (Most Frequent Value)";
			break;
	}
	jQuery('#tooltip'+index).attr('data-tooltip', tooltip);


};

i2b2.SCILHSRequestHandler.handleConceptConfigItemSelectionChange = function( event )
{
	i2b2.SCILHSRequestHandler.model.dirtyResultsData = true;
	
	i2b2.SCILHSRequestHandler.model.readyToPreview = true;
	
	//var newVal = jQuery("#" + i2b2.SCILHSRequestHandler.columnDisplaySelectID + event.data.index).children("option").filter(":selected").text();
	var newVal = jQuery("#" + i2b2.SCILHSRequestHandler.columnDisplaySelectID + event.data.index).children("option").filter(":selected").val();
	i2b2.SCILHSRequestHandler.model.concepts[event.data.index].dataOption = newVal;
	/*
    var newVal = jQuery("#" + i2b2.SCILHSRequestHandler.columnDisplaySelectID + event.data.index).children("option").filter(":selected").text();
    //alert("Selection " + event.data.index + " has changed value to " + newVal + " index = " + document.getElementById(i2b2.SCILHSRequestHandler.columnDisplaySelectID + event.data.index ).selectedIndex);
    i2b2.SCILHSRequestHandler.model.concepts[event.data.index].dataOption = newVal;
    if (i2b2.SCILHSRequestHandler.model.concepts[event.data.index].dataOption === i2b2.SCILHSRequestHandler.cellDataOption.DEFAULT )
        i2b2.SCILHSRequestHandler.model.concepts[event.data.index].formatter = i2b2.SCILHSRequestHandler.cellFormatter.defaultFormatter;
    else if (i2b2.SCILHSRequestHandler.model.concepts[event.data.index].dataOption === i2b2.SCILHSRequestHandler.cellDataOption.FIRST ||
             i2b2.SCILHSRequestHandler.model.concepts[event.data.index].dataOption === i2b2.SCILHSRequestHandler.cellDataOption.LAST )
        i2b2.SCILHSRequestHandler.model.concepts[event.data.index].formatter = i2b2.SCILHSRequestHandler.cellFormatter.dateFormatter;
    else if (i2b2.SCILHSRequestHandler.model.concepts[event.data.index].dataOption === i2b2.SCILHSRequestHandler.cellDataOption.MIN ||
             i2b2.SCILHSRequestHandler.model.concepts[event.data.index].dataOption === i2b2.SCILHSRequestHandler.cellDataOption.MAX )
        i2b2.SCILHSRequestHandler.model.concepts[event.data.index].formatter = i2b2.SCILHSRequestHandler.cellFormatter.numberFormatter;
    else if ( i2b2.SCILHSRequestHandler.model.concepts[event.data.index].dataOption === i2b2.SCILHSRequestHandler.cellDataOption.COUNT )
        i2b2.SCILHSRequestHandler.model.concepts[event.data.index].formatter = i2b2.SCILHSRequestHandler.cellFormatter.integerFormatter;
		*/
};




i2b2.SCILHSRequestHandler.pgGo = function(dir) {
	var formStart = parseInt($('SCILHSRequestHandler-pgstart').value);
	var formSize = parseInt($('SCILHSRequestHandler-pgsize').value);
	if (!formStart) {formStart = 1;}
	if (!formSize) {formSize = 10;}
	if (formSize<1) {formSize = 1;}
	formStart = formStart + formSize * dir;
	if (formStart<1) {formStart = 1;}
	i2b2.SCILHSRequestHandler.model.pgstart = formStart;
	i2b2.SCILHSRequestHandler.model.pgsize = formSize;
	$('SCILHSRequestHandler-pgstart').value = formStart;
	$('SCILHSRequestHandler-pgsize').value = formSize;
	i2b2.SCILHSRequestHandler.model.dirtyResultsData = true;
	//remove old results
	$$("DIV#SCILHSRequestHandler-mainDiv DIV#SCILHSRequestHandler-TABS DIV.results-directions")[0].hide();
	$('SCILHSRequestHandler-results-scaleLbl1').innerHTML = '';
	$('SCILHSRequestHandler-results-scaleLbl2').innerHTML = '';
	$('SCILHSRequestHandler-results-scaleLbl3').innerHTML = '';
	$$("DIV#SCILHSRequestHandler-mainDiv DIV#SCILHSRequestHandler-TABS DIV.results-timeline")[0].innerHTML = '<div class="results-progress">Please wait while the timeline is being drawn...</div><div class="results-progressIcon"></div>';
	$$("DIV#SCILHSRequestHandler-mainDiv DIV#SCILHSRequestHandler-TABS DIV.results-finished")[0].show();
	//reset zoom key
	$$("DIV#SCILHSRequestHandler-mainDiv DIV#SCILHSRequestHandler-TABS DIV.zoomKeyRange")[0].style.width = '90px';
	$$("DIV#SCILHSRequestHandler-mainDiv DIV#SCILHSRequestHandler-TABS DIV.zoomKeyRange")[0].style.left = '0px';
	// give a brief pause for the GUI to catch up
	setTimeout('i2b2.SCILHSRequestHandler.getResults();', 50);
};

i2b2.SCILHSRequestHandler.updateZoomScaleLabels = function() {
	var z = i2b2.SCILHSRequestHandler.model.zoomScale*1.0;
	var p = i2b2.SCILHSRequestHandler.model.zoomPan*1.0;
	// update zoom key
	$$("DIV#SCILHSRequestHandler-mainDiv DIV#SCILHSRequestHandler-TABS DIV.zoomKeyRange")[0].style.width = (90/z) + 'px';
	$$("DIV#SCILHSRequestHandler-mainDiv DIV#SCILHSRequestHandler-TABS DIV.zoomKeyRange")[0].style.left = ((p*90)-(90/z)) + 'px';
	// calculate date labels
	var first_time = i2b2.SCILHSRequestHandler.model.first_time;
	var last_time = i2b2.SCILHSRequestHandler.model.last_time;
	var lf = last_time - first_time;
	var t3 = first_time + lf*p;
	var t1 = t3 - lf/z;
	var t2 = (t1+t3)/2;
	var d1 = new Date(t1);
	var d2 = new Date(t2);
	var d3 = new Date(t3);
	// update labels
	$('SCILHSRequestHandler-results-scaleLbl1').innerHTML = (d1.getMonth()+1) + '/' + d1.getDate() + '/' + d1.getFullYear();
	$('SCILHSRequestHandler-results-scaleLbl2').innerHTML = (d2.getMonth()+1) + '/' + d2.getDate() + '/' + d2.getFullYear();
	$('SCILHSRequestHandler-results-scaleLbl3').innerHTML = (d3.getMonth()+1) + '/' + d3.getDate() + '/' + d3.getFullYear();
}

i2b2.SCILHSRequestHandler.zoom = function(op) {
	if (op == '+') {
		i2b2.SCILHSRequestHandler.model.zoomScale *= 2.0;
	}
	if (op == '-') {
		i2b2.SCILHSRequestHandler.model.zoomScale *= 0.5;
	}
	if (op == '<') {
		i2b2.SCILHSRequestHandler.model.zoomPan -= 0.25/(i2b2.SCILHSRequestHandler.model.zoomScale*1.0);
	}
	if (op == '>') {
		i2b2.SCILHSRequestHandler.model.zoomPan += 0.25/(i2b2.SCILHSRequestHandler.model.zoomScale*1.0);
	}
	if (i2b2.SCILHSRequestHandler.model.zoomScale < 1) {
		i2b2.SCILHSRequestHandler.model.zoomScale = 1.0;
	}
	if (i2b2.SCILHSRequestHandler.model.zoomPan > 1) {
		i2b2.SCILHSRequestHandler.model.zoomPan = 1.0;
	}
	if (i2b2.SCILHSRequestHandler.model.zoomPan < 1/(i2b2.SCILHSRequestHandler.model.zoomScale*1.0)) {
		i2b2.SCILHSRequestHandler.model.zoomPan = 1/(i2b2.SCILHSRequestHandler.model.zoomScale*1.0);
	}
	i2b2.SCILHSRequestHandler.updateZoomScaleLabels();
	var z = i2b2.SCILHSRequestHandler.model.zoomScale*1.0;
	var p = i2b2.SCILHSRequestHandler.model.zoomPan*1.0;
	p = 100.0 * (1 - z*p);
	z = 100.0 * z;
	var o = $$("DIV#SCILHSRequestHandler-mainDiv DIV#SCILHSRequestHandler-TABS DIV.results-finished DIV.ptObsZoom");
	for (var i=0; i<o.length; i++) {
		o[i].style.width = z + '%';
		o[i].style.left = p + '%';
	}
};


i2b2.SCILHSRequestHandler.getValuesOld = function(lvd) {  //This method is not being used any more. It has been replaced by i2b2.CRC.view.modLabvaluesCtlr.getModLabValuesForXML method.
							var s = '\t\t\t<constrain_by_value>\n';
							//var lvd = sdxData.LabValues;
							switch(lvd.MatchBy) {
								case "FLAG":
									s += '\t\t\t\t<value_type>FLAG</value_type>\n';
									s += '\t\t\t\t<value_operator>EQ</value_operator>\n';
									s += '\t\t\t\t<value_constraint>'+i2b2.h.Escape(lvd.ValueFlag)+'</value_constraint>\n';
									break;
								case "VALUE":
									if (lvd.GeneralValueType=="ENUM") {
										var sEnum = [];
										for (var i2=0;i2<lvd.ValueEnum.length;i2++) {
											sEnum.push(i2b2.h.Escape(lvd.ValueEnum[i2]));
										}
										//sEnum = sEnum.join("\", \"");
										sEnum = sEnum.join("\',\'");
										sEnum = '(\''+sEnum+'\')';
										s += '\t\t\t\t<value_type>TEXT</value_type>\n';
										s += '\t\t\t\t<value_constraint>'+sEnum+'</value_constraint>\n';
										s += '\t\t\t\t<value_operator>IN</value_operator>\n';								
									} else if (lvd.GeneralValueType=="STRING") {
										s += '\t\t\t\t<value_type>TEXT</value_type>\n';
										s += '\t\t\t\t<value_operator>'+lvd.StringOp+'</value_operator>\n';
										s += '\t\t\t\t<value_constraint><![CDATA['+i2b2.h.Escape(lvd.ValueString)+']]></value_constraint>\n';
									} else if (lvd.GeneralValueType=="LARGESTRING") {
										if (lvd.DbOp) {
											s += '\t\t\t\t<value_operator>CONTAINS[database]</value_operator>\n';
										} else {
											s += '\t\t\t\t<value_operator>CONTAINS</value_operator>\n';											
										}
										s += '\t\t\t\t<value_type>LARGETEXT</value_type>\n';
										s += '\t\t\t\t<value_constraint><![CDATA['+i2b2.h.Escape(lvd.ValueString)+']]></value_constraint>\n';
									} else {
										s += '\t\t\t\t<value_type>'+lvd.GeneralValueType+'</value_type>\n';
										s += '\t\t\t\t<value_unit_of_measure>'+lvd.UnitsCtrl+'</value_unit_of_measure>\n';
										s += '\t\t\t\t<value_operator>'+lvd.NumericOp+'</value_operator>\n';
										if (lvd.NumericOp == 'BETWEEN') {
											s += '\t\t\t\t<value_constraint>'+i2b2.h.Escape(lvd.ValueLow)+' and '+i2b2.h.Escape(lvd.ValueHigh)+'</value_constraint>\n';
										} else {
											s += '\t\t\t\t<value_constraint>'+i2b2.h.Escape(lvd.Value)+'</value_constraint>\n';
										}
									}
									break;
								case "":
									break;
							}
							s += '\t\t\t</constrain_by_value>\n';
		return s;
}

i2b2.SCILHSRequestHandler.setLocalUniqueNumber = function() {
	var date = new Date();
	
	var components = [
		date.getFullYear(),
		date.getMonth() + 1,
		date.getDate(),
		date.getHours(),
		date.getMinutes(),
		date.getSeconds(),
		date.getMilliseconds()
	];

	var id = components.join("");
	
	i2b2.SCILHSRequestHandler.downloadID = id;
}

// convert to concepts and then render
i2b2.SCILHSRequestHandler.loadTableDefinition = function(){
    // TODO validate local ontology root
    var localOntRoot = document.getElementById("SCILHSRequestHandler-prefixText").value;
//	var localOntRoot = "\\\\" + document.getElementById("SCILHSRequestHandler-prefixText").value + "\\\\";
	// validate format
	// var ontPattern = new RegExp("^\\{4}(\w+\s*){1,}\\{2}(\w+\s*)\\{2}$")
    var ontPattern = /^\\{2}(\w+\s*){1,}\\{2}$/;	// e.g. PCORI
	var testpat = "\\\\" + localOntRoot + "\\\\";
    if (!ontPattern.test(testpat)) {
		alert("The supplied ontology root is invalid.  Please specify a valid format (e.g. 'PCORI, i2b2, etc.)'");
		return;
	}
    var definition = document.getElementById("SCILHSRequestHandler-tableDefinitionText").value;
    try{
    	// replace SHRINE ont root with local one
		// TODO need an automatic way to do this using SHRINE mappings - badly needs to be refactored
        var regex = new RegExp('\\\\' + i2b2.SCILHSRequestHandler.ontology.shrinePrefix + '\\\\', "gi");
        var convertedDef = definition.replace(regex, "\\" + localOntRoot + "\\");
        // regex = new RegExp('\\{2}' + i2b2.SCILHSRequestHandler.ontology.shrinePrefix + '\\{2}', "gi");
        // definition = definition.replace(regex, "\\\\" + localOntRoot + "\\\\");
//		definition = definition.replace(regex, localOntRoot);

        i2b2.SCILHSRequestHandler.tableDefinition = JSON.parse(convertedDef);
        alert('Table definition successfully loaded.');

        // convert format to concepts and render
		i2b2.SCILHSRequestHandler.convertDefinitionToConcepts();
        // Render
        i2b2.SCILHSRequestHandler.conceptsRender();
        i2b2.SCILHSRequestHandler.switchToConceptsTable();
    } catch(e){
        alert('The supplied table definition is improperly formatted. Please try again.');
    }

};

i2b2.SCILHSRequestHandler.switchToTableDefinition = function() {
	i2b2.SCILHSRequestHandler.display = 'definition';
    i2b2.SCILHSRequestHandler.toggleDisplay();
};
i2b2.SCILHSRequestHandler.switchToConceptsTable = function() {
    i2b2.SCILHSRequestHandler.display = 'concepts';
    i2b2.SCILHSRequestHandler.toggleDisplay();
};

i2b2.SCILHSRequestHandler.toggleDisplay = function() {
	if (i2b2.SCILHSRequestHandler.display == 'concepts') {
        jQuery('#SCILHSRequestHandler-tableDefinition').hide();
		jQuery('#SCILHSRequestHandler-conceptTableArea').show();
	} else if (i2b2.SCILHSRequestHandler.display == 'definition') {
        jQuery('#SCILHSRequestHandler-tableDefinition').show();
        jQuery('#SCILHSRequestHandler-conceptTableArea').hide();
	}
};

// TODO finish this
i2b2.SCILHSRequestHandler.convertDefinitionToConcepts = function() {
	var def = i2b2.SCILHSRequestHandler.tableDefinition;
	i2b2.SCILHSRequestHandler.model.concepts = [];

	if (def.concepts) {
        i2b2.SCILHSRequestHandler.model.concepts = def.concepts.slice();
	}
	// TODO also convert to standard format


    // var concepts = i2b2.CRC.model.dataSet.model.concepts;
    // var robj = {};
    // if (concepts) {
    //     robj.column_list = {};
    //     for (i = 0; i < concepts.length; i++) {
    //         var c = concepts[i];
    //         var col = robj.column_list.column = {};
    //         col.aggregation = c.dataOption;
    //         col._name = c.textDisplay;
    //         col._abbreviation = c.textDisplay;
    //         // TODO conform to established 'constrain_by_date' standard
    //         var consDate = col.constrain_by_date = {};
    //         if (c.dateFrom) {
    //             consDate.dateFrom = c.dateFrom;
    //         }
    //         if (c.dateTo) {
    //             consDate.dateTo = c.dateTo;
    //         }
    //         if (c.sdxData) {
    //             var item = col.item = {};
    //             item.item_name = c.sdxData.origData.name;
    //             item.item_key = c.sdxData.origData.key;
    //         }
    //     }
    // }
    // return robj;
};


	

