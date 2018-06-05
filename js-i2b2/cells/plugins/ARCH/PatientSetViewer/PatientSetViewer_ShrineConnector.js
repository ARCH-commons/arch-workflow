/**
 * @projectDescription	Produces data file based on previous query
 * @inherits	i2b2
 * @namespace	i2b2.PatientSetViewer.ShrineConnector
 * @author	Nich Wattanasin
 * @version 	1.0
 * ----------------------------------------------------------------------------------------
 * updated 03-10-15: 	Initial Launch [Nich Wattanasin]
 * updated Winter 2016-17: JayT
 * TODO:  remove filter button and sites code if not needed anymore
 */

i2b2.PatientSetViewer.ShrineConnector.demoMode = false;

i2b2.PatientSetViewer.ShrineConnector.UI = {};
i2b2.PatientSetViewer.ShrineConnector.UI.flashId = '';
i2b2.PatientSetViewer.ShrineConnector.UI.orginalBackgroundColor = '';
i2b2.PatientSetViewer.ShrineConnector.UI.orginalColor = '';
i2b2.PatientSetViewer.ShrineConnector.UI.IE8Mode = document.documentMode;
i2b2.PatientSetViewer.ShrineConnector.UI.buttonStyle = "margin:3px; border-radius:8px; color:black; background-color:snow; font-family:helvetica;border-color:lightsteelblue; outline:none;";
i2b2.PatientSetViewer.ShrineConnector.UI.showBckBtn = false;
i2b2.PatientSetViewer.ShrineConnector.UI.working = false;
i2b2.PatientSetViewer.ShrineConnector.ready = false;
i2b2.PatientSetViewer.ShrineConnector.model = {};
i2b2.PatientSetViewer.ShrineConnector.model.sites = {};
i2b2.PatientSetViewer.ShrineConnector.WorkPlaceFolderName = "ARCHSHRINEConnectorQueryNetworkIds";
i2b2.PatientSetViewer.ShrineConnector.shrineQueryNetworkId = "";
i2b2.PatientSetViewer.ShrineConnector.tableKey = "";
i2b2.PatientSetViewer.ShrineConnector.reRunButtonText = "Rerun";
i2b2.PatientSetViewer.ShrineConnector.OrginalRunButtonText = "";

i2b2.PatientSetViewer.ShrineConnector.psDelimiter = "_::_";
i2b2.PatientSetViewer.ShrineConnector.model.shrineToPSQueryMapping = {};

i2b2.PatientSetViewer.ShrineConnector.Init = function (loadedDiv) {
    /*
     jQuery.getJSON("js-i2b2/cells/plugins/ACT/ShrineConnector/portal.php?api=mysite", function(data){
     if(data.hasOwnProperty('shortName')){
     i2b2.PatientSetViewer.ShrineConnector.model.mysite = data;
     i2b2.PatientSetViewer.ShrineConnector.ready = true;
     jQuery('#ShrineConnector-siteid').val(data.uuid);
     }
     });
     
     jQuery.getJSON("js-i2b2/cells/plugins/ACT/ShrineConnector/portal.php?api=site", function(data){
     for(var i=0;i<data.length;i++){
     if(data[i].hasOwnProperty('code')){
     i2b2.PatientSetViewer.ShrineConnector.model.sites[data[i].code] = data[i];
     }
     }
     });
     */

    if (i2b2.PatientSetViewer.ShrineConnector.UI.IE8Mode && i2b2.PatientSetViewer.ShrineConnector.UI.IE8Mode === 8)
        i2b2.PatientSetViewer.ShrineConnector.UI.IE8Mode = true;
    else
        i2b2.PatientSetViewer.ShrineConnector.UI.IE8Mode = false;

    i2b2.PatientSetViewer.ShrineConnector.setWorkplaceRootIndex(i2b2.PM.model.login_username);

    BuildBackToPlugInButton();

    // 2.0 static variables
    i2b2.PatientSetViewer.ShrineConnector.active = new Object();
    i2b2.PatientSetViewer.ShrineConnector.model.prsRecord = false;
    i2b2.PatientSetViewer.ShrineConnector.model.conceptRecord = false;
    i2b2.PatientSetViewer.ShrineConnector.model.dirtyResultsData = true;
    i2b2.PatientSetViewer.ShrineConnector.model.concepts = [];


    i2b2.PatientSetViewer.ShrineConnector.model.firstVisit = true;
    i2b2.PatientSetViewer.ShrineConnector.model.readyToPreview = false;
    i2b2.PatientSetViewer.ShrineConnector.model.readyToProcess = false;
    i2b2.PatientSetViewer.ShrineConnector.model.processLocked = false;

    // manage YUI tabs
    // this.yuiTabs = new YAHOO.widget.TabView("ShrineConnector-TABS", { activeIndex: 0 });
    // this.yuiTabs.on('activeTabChange', function (ev) {
    //     if (ev.newValue.get('id') == "ShrineConnector-TAB0") {
    //         // user switched to Shrine tab
    //
    //         jQuery('#srcBtn').prop('disabled', false);
    //         jQuery('#srcBtn').prop('value', 'Search');
    //         i2b2.PatientSetViewer.ShrineConnector.ShrineSearch();
    //     }
    // });
    //
    // z = $('anaPluginViewFrame').getHeight() - 34;
    // $$('DIV#ShrineConnector-TABS DIV.ShrineConnector-MainContent')[0].style.height = z;
    // $$('DIV#ShrineConnector-TABS DIV.ShrineConnector-MainContent')[1].style.height = z;



    jQuery('<div id="crcAlert" style="position: absolute;width: 375px;height: 50px;z-index: 1000;right:' +
        ' 0px;margin-right: -375px;margin-top: 25px;text-align: center;display: none;border: 2px solid #5398fb;background:' +
        ' white;border-radius: 10px;"><img src="js-i2b2/cells/plugins/ARCH/PatientSetViewer/assets/left.jpg" style="float: left;" />' +
        '<span id="crcAlertSpan" style="position: relative;top: 10px;"></span></div>').prependTo('#crcHistoryBox');


    jQuery('#srcBtn').prop('disabled', false);
    jQuery('#srcBtn').prop('value', 'Search');



    jQuery('#ShrineAdmin-matchStr').on('keypress', function (event) {
        i2b2.PatientSetViewer.ShrineConnector.TriggerClick(event);
    });
    jQuery('#ShrineAdmin-userId').on('keypress', function (event) {
        i2b2.PatientSetViewer.ShrineConnector.TriggerClick(event);
    });


    i2b2.PatientSetViewer.ShrineConnector.ShrineSearch();

};



i2b2.PatientSetViewer.ShrineConnector.ShrineSearch = function () {

    jQuery('#SiteTxt').val('');
    jQuery('#srcBtn').prop('disabled', true);
    jQuery('#srcBtn').prop('value', 'Loading...');

    var max_records = document.getElementById('ShrineAdmin-maxRecords').value;
    var match_str = jQuery.trim(document.getElementById('ShrineAdmin-matchStr').value);
    var user_id = jQuery.trim(document.getElementById('ShrineAdmin-userId').value);
    var search_category = 'top';

    if (document.getElementById('ShrineAdmin-onlyflagged').checked) {
        search_category = 'flagged';
    }

    if (user_id == '') {
        user_id = '@';
    }

    i2b2.PatientSetViewer.ShrineConnector.shrineGetResults(max_records, match_str, user_id, search_category);

};


i2b2.PatientSetViewer.ShrineConnector.Filter = function () {

    var siteFilter = jQuery.trim(jQuery('#SiteTxt').val().toUpperCase());
    var filterCount = 0;

    if (siteFilter)
        jQuery(".resultsTable tr:not(." + siteFilter + ", .header)").hide();
    else
        jQuery(".resultsTable tr").show();

    filterCount = jQuery('#ShrineConnector-ShrineResults tr:visible').length - 1;

};

i2b2.PatientSetViewer.ShrineConnector.ResetForm = function () {

    jQuery('#SiteTxt').val('');
    jQuery('#ShrineAdmin-maxRecords').val('25');
    jQuery('#ShrineAdmin-matchStr').val('');
    jQuery('#ShrineAdmin-userId').val('');
    jQuery('#ShrineAdmin-onlyflagged').prop("checked", true);

    i2b2.PatientSetViewer.ShrineConnector.ShrineSearch();


};

i2b2.PatientSetViewer.ShrineConnector.TriggerClick = function (e) {

    //var e=event || window.event;
    var code = e.charCode || e.keyCode;

    if (code === 13) {
        switch (e.target.id) {
            case 'SiteTxt':
                i2b2.PatientSetViewer.ShrineConnector.Filter();
                break;
            case 'ShrineAdmin-userId':
            case 'ShrineAdmin-matchStr':
                i2b2.PatientSetViewer.ShrineConnector.ShrineSearch();
                break;
            default:
                break;
        }
    }

};

// i2b2.PatientSetViewer.ShrineConnector.shrineLoadResults = function () {
//
//     jQuery('#srcBtn').prop('disabled', false);
//     jQuery('#srcBtn').prop('value', 'Search');
//
//     var filterButton = '<input type="text" style="width:50px;" id="SiteTxt" value="" />' +
//         '<button type="button" onclick="javascript:i2b2.PatientSetViewer.ShrineConnector.Filter();return false;" title="Site Filter" ' +
//         'style="' + i2b2.PatientSetViewer.ShrineConnector.UI.buttonStyle + '">Filter</button>';
//
//
//
//     var resultCounter = 0;
//     var resultsHtml = "<table id='ShrineConnector-ShrineResults' class='resultsTable' cellspacing='0' style='table-layout:fixed;' >";
//
//
//     resultsHtml += "<tr class='header'>" +
//         "<th style='width:15px;border-top-style:none;padding:0px;'><img src=\"js-i2b2/cells/plugins/ACT/ShrineConnector/assets/flagged.png\" alt=\"Flagged\" title=\"Flagged\" /></th>" +
//         "<th style='width:60px;border-top-style:none;'>Created</th>" +
//         "<th style='width:200px;border-top-style:none; text-align:left;'>Name</th>" +
//         "<th style='width:40px;border-top-style:none;'>View</th>" +
//         "<th style='width:45px;border-top-style:none;'>Run</th>" +
//         "<th style='width:40px;border-top-style:none;'>User ID</th>" +
//         "<th style='width:55px;border-top-style:none;'>Group ID</th>" +
//         "<th style='width:250px;border-top-style:none;text-align:left;min-width:250px;'>Flag Comment</th>" +
//         "<th style='width:108px;border-top-style:none;'>Admin Note</th>" +
//         "</tr>";
//
//     for (var resultId in i2b2.PatientSetViewer.ShrineConnector.model.previousQueries) {
//         var query = i2b2.PatientSetViewer.ShrineConnector.model.previousQueries[resultId];
//
//         var dscrp = "";
//         var sites = "";
//         var trClass = "";
//
//
//         var queryCreated = formatDateTime(query.created);
//         //var queryName = formatQueryName(query.name);  //name formatting not needed at this time
//
//
//         var viewIcon = "<a href='#' title=\"View Query in Query Tool\" onclick=\"javascript:i2b2.PatientSetViewer.ShrineConnector.shrineGetQuery('" + query.id + "');return false;\">" +
//             "<img src='js-i2b2/cells/ONT/assets/sdx_ONT_CONCPT_leaf.gif' alt='View Query in Query Tool' style='border:0;margin-left:8px;margin-right:2px;vertical-align:middle';></a>";
//         var runIcon = '<img src="js-i2b2/cells/CRC/assets/sdx_CRC_QM.gif" style="border:0;">';
//
//         var editTextButton = "<button class='" + resultCounter + "edtTxtBtn' style='float:right;" + i2b2.PatientSetViewer.ShrineConnector.UI.buttonStyle + "' title='add or edit comment'" +
//             " onclick='i2b2.PatientSetViewer.ShrineConnector.editFlagCommentText(" + resultCounter + ",\"" + query.networkid + "\");' >+</button>";
//
//         var flag = "";
//         var FlagCheckBoxChecked = '<input id="' + resultCounter + 'ShrineAdmin-onlyflagged" type="checkbox" disabled="disabled" checked="checked" title="Flagged Query" onclick="i2b2.PatientSetViewer.ShrineConnector.flagCheckboxClicked(' + resultCounter + ');"/>';
//         var FlagCheckBoxUnChecked = '<input id="' + resultCounter + 'ShrineAdmin-onlyflagged" type="checkbox" disabled="disabled"  title="Unflagged Query" onclick="i2b2.PatientSetViewer.ShrineConnector.flagCheckboxClicked(' + resultCounter + ');"/>';
//         var flagIcon = "<img src=\"js-i2b2/cells/plugins/ACT/ShrineConnector/assets/flagged.png\" alt=\"Flagged for Acton Needed\" title=\"Flagged for Acton Needed\"/>";
//
//         var showQuery = "javascript:i2b2.PatientSetViewer.ShrineConnector.shrineGetQuery('" + query.id + "');return false;";
//         var runQuery = "javascript:i2b2.PatientSetViewer.ShrineConnector.shrineRunQuery('" + resultCounter + "','" + query.id + "','" + query.name + "','" + query.networkid + "')";
//
//         // A checkbox to control tracking of a completed local query is not needed at this time.
//         var completedCheckBox = '<input id="isComplete' + query.networkid + '" type="checkbox" title="Was this query ran locally" onclick="i2b2.PatientSetViewer.ShrineConnector.IsCompletedChecked(\'' + query.networkid + '\');"/>';
//
//         var runButton = '<button id="isCompleteBtn' + query.networkid + '"  type="button" onclick="' + runQuery + '" title="Run SHRINE query locally" ' +
//             'style="' + i2b2.PatientSetViewer.ShrineConnector.UI.buttonStyle + '">Run</button>';
//
//         var ViewButton = '<button id="VwBtn' + query.networkid + '"  type="button" onclick="' + showQuery + '" title="View SHRINE query locally" ' +
//             'style="' + i2b2.PatientSetViewer.ShrineConnector.UI.buttonStyle + '">View</button>';
//
//
//
//
//         if (query.flagged.toLowerCase() == "true")
//             flag = FlagCheckBoxChecked;
//         else
//             flag = FlagCheckBoxUnChecked;
//
//
//
//         var desc = "";
//         if (query.flagmessage)
//             desc = query.flagmessage;
//
//         desc = "<div style='width:100%;height:100%;margin:0;padding:0;overflow-x:hidden;overflow-y:auto;'>" + desc + "</div>";
//
//
//         resultsHtml += "<tr id='resultsRow" + query.networkid + "' style='height:40px;' class='" + trClass + "'>" +
//             "<td style='background-color:white;padding:0px;'>" + flag + "</td>" +
//             "<td style='background-color:white;'>" + queryCreated + "</td>" +
//             "<td style='text-align:left;background-color:white;white-space:normal;'>" + query.name + "</td>" +
//             "<td style='background-color:white;padding-left:0px;'>" + ViewButton + "</td>" +
//             "<td style='background-color:white;padding:0px;'>" + runButton + "</td>" +
//             "<td style='background-color:white;word-wrap:break-word;' >" + query.userid + "</td>" +
//             "<td style='background-color:white;word-wrap:break-word;'>" + query.group + "</td>" +
//             "<td style='text-align:left;background-color:white;height:40px;min-width: 250px;'>" + desc + "</td>" +
//             "<td style='text-align:right;background-color:white;'><span id='" + resultCounter + "EditTextSpan' class='" + query.networkid + "'></span>" + editTextButton + "</td>" +
//             "</tr>";
//
//
//         resultCounter++;
//
//     }
//     resultsHtml += "</table>";
//
//     $('ShrineAdmin-results').innerHTML = resultsHtml;
//
//     i2b2.PatientSetViewer.ShrineConnector.loadCompletedQueries();
//
//     jQuery('#resultsSpan').html(resultCounter);
//
//     jQuery('#SiteTxt').on('keypress', function (event) {
//         i2b2.PatientSetViewer.ShrineConnector.TriggerClick(event);
//     });
//
//
//
//
// };
i2b2.PatientSetViewer.ShrineConnector.shrineLoadResults = function () {

    jQuery('#srcBtn').prop('disabled', false);
    jQuery('#srcBtn').prop('value', 'Search');

    var filterButton = '<input type="text" style="width:50px;" id="SiteTxt" value="" />' +
        '<button type="button" onclick="javascript:i2b2.PatientSetViewer.ShrineConnector.Filter();return false;" title="Site Filter" ' +
        'style="' + i2b2.PatientSetViewer.ShrineConnector.UI.buttonStyle + '">Filter</button>';



    var resultCounter = 0;
    var resultsHtml = "<table id='ARCHRequestHandler-ShrineResults' class='resultsTable' cellspacing='0' style='table-layout:fixed;' >";


    resultsHtml += "<tr class='header'>" +
        "<th style='width:15px;border-top-style:none;padding:0px;'><img src=\"js-i2b2/cells/plugins/ARCH/PatientSetViewer/assets/flagged.png\" alt=\"Flagged\" title=\"Flagged\" /></th>" +
        "<th style='width:45px;border-top-style:none;'>Select</th>" +
        "<th style='width:60px;border-top-style:none;'>Created</th>" +
        "<th style='width:150px;border-top-style:none;'>Name</th>" +
        "<th style='width:40px;border-top-style:none;'>View</th>" +
        "<th style='width:45px;border-top-style:none;'>Run</th>" +
//        "<th style='width:150px;border-top-style:none;'>Patient Set</th>" +
        "<th style='width:40px;border-top-style:none;'>User ID</th>" +
        "<th style='width:55px;border-top-style:none;'>Group ID</th>" +
        "<th style='width:200px;border-top-style:none;min-width:250px;'>Flag Note</th>" +
        "<th style='width:108px;border-top-style:none;'>Admin Note</th>" +
        "</tr>";

    // for (var resultId in i2b2.ARCHRequestHandler.model.previousQueries) {
    //     var query = i2b2.ARCHRequestHandler.model.previousQueries[resultId];
    // for (var resultId = 0; resultId < i2b2.ARCHRequestHandler.model.previousQueries.length; resultId++) {
    for (var resultId in i2b2.PatientSetViewer.ShrineConnector.model.previousQueries) {
        if (i2b2.PatientSetViewer.ShrineConnector.model.previousQueries.hasOwnProperty(resultId)) {
            var query = i2b2.PatientSetViewer.ShrineConnector.model.previousQueries[resultId];

            var dscrp = "";
            var sites = "";
            var trClass = "";


            var queryCreated = formatDateTime(query.created);
            //var queryName = formatQueryName(query.name);  //name formatting not needed at this time


            var viewIcon = "<a href='#' title=\"View Query in Query Tool\" onclick=\"javascript:i2b2.PatientSetViewer.ShrineConnector.shrineGetQuery('" + query.id + "');return false;\">" +
                "<img src='js-i2b2/cells/ONT/assets/sdx_ONT_CONCPT_leaf.gif' alt='View Query in Query Tool' style='border:0;margin-left:8px;margin-right:2px;vertical-align:middle';></a>";
            var runIcon = '<img src="js-i2b2/cells/CRC/assets/sdx_CRC_QM.gif" style="border:0;">';

            var editTextButton = "<button class='" + resultCounter + "edtTxtBtn' style='float:right;" + i2b2.PatientSetViewer.ShrineConnector.UI.buttonStyle + "' title='add or edit comment'" +
                " onclick='i2b2.PatientSetViewer.ShrineConnector.editFlagCommentText(" + resultCounter + ",\"" + query.networkid + "\");' >+</button>";

            var flag = "";
            var FlagCheckBoxChecked = '<input id="' + resultCounter + 'ArchShrineAdmin-onlyflagged" type="checkbox" disabled="disabled" checked="checked" title="Flagged Query" onclick="i2b2.PatientSetViewer.ShrineConnector.flagCheckboxClicked(' + resultCounter + ');"/>';
            var FlagCheckBoxUnChecked = '<input id="' + resultCounter + 'ArchShrineAdmin-onlyflagged" type="checkbox" disabled="disabled"  title="Unflagged Query" onclick="i2b2.PatientSetViewer.ShrineConnector.flagCheckboxClicked(' + resultCounter + ');"/>';
            var flagIcon = "<img src=\"js-i2b2/cells/plugins/ARCH/PatientSetViewer/assets/flagged.png\" alt=\"Flagged for Acton Needed\" title=\"Flagged for Acton Needed\"/>";

            var showQuery = "javascript:i2b2.PatientSetViewer.ShrineConnector.shrineGetQuery('" + query.id + "');return false;";
            var runQuery = "javascript:i2b2.PatientSetViewer.ShrineConnector.shrineRunQuery('" + resultCounter + "','" + query.id + "','" + query.name + "','" + query.networkid + "')";
            //var runQuery = "javascript:i2b2.PatientSetViewer.ShrineConnector.shrineRunQuery('" + resultCounter + "','" + resultId + "')";

            // A checkbox to control tracking of a completed local query is not needed at this time.
            var completedCheckBox = '<input id="isComplete' + query.networkid + '" type="checkbox" title="Was this query ran locally" onclick="i2b2.PatientSetViewer.ShrineConnector.IsCompletedChecked(\'' + query.networkid + '\');"/>';

            var runButton = '<button id="isCompleteBtn' + query.networkid + '"  type="button" onclick="' + runQuery + '" title="Run SHRINE query locally" ' +
                'style="' + i2b2.PatientSetViewer.ShrineConnector.UI.buttonStyle + '">Run</button>';
           var patientSetQueryNameDiv = '<div id="psqnDiv' + query.networkid + '"></div>';
//            var selectRadioOption = '<input type="radio" id="selectQueryForTemplateOption' + query.networkid + '" name="selectedTemplateQueryId" disabled value=""/>';
            var selectButtonOption = '<input type="button" id="selectQueryForTemplateOption' + query.networkid +
                '" disabled value="N/A" onclick="i2b2.PatientSetViewer.selectDSQuery('+ resultId +');" style="color:#5e5588; background-color:#f1a899; font-weight:bold; ' +
                'font-family:arial,helvetica; font-size:12px;"/>';

            var ViewButton = '<button id="VwBtn' + query.networkid + '"  type="button" onclick="' + showQuery + '" title="View SHRINE query locally" ' +
                'style="' + i2b2.PatientSetViewer.ShrineConnector.UI.buttonStyle + '">View</button>';


            if (query.flagged.toLowerCase() == "true")
                flag = FlagCheckBoxChecked;
            else
                flag = FlagCheckBoxUnChecked;


            var desc = "";
            // Parse into JSON
            var flagObject = JSON.parse(query.flagmessage);
            // if (query.flagmessage)
            if (flagObject) {
                i2b2.PatientSetViewer.ShrineConnector.model.previousQueries[resultId].flagObject = flagObject;
                // TODO check to see if this is actually an ARCH message?
                // desc = query.flagmessage;
                desc = flagObject.message;
            } else {
                desc = "(Not a data set request)";
            }

            // desc = "<div style='width:100%;height:100%;margin:0;padding:0;overflow-x:hidden;overflow-y:auto;'>" + desc + "</div>";


            resultsHtml += "<tr id='resultsRow" + query.networkid + "' style='height:40px;' class='" + trClass + "'>" +
                "<td style='background-color:white;padding:0px;'>" + flag + "</td>" +
                "<td style='background-color:white;text-align:center;'>" + selectButtonOption + "</td>" +
                "<td style='background-color:white;'>" + queryCreated + "</td>" +
                "<td style='text-align:left;background-color:white;white-space:normal;'>" + query.name + "</td>" +
                "<td style='background-color:white;padding-left:0px;'>" + ViewButton + "</td>" +
                "<td style='background-color:white;padding:0px;'>" + runButton + "</td>" +
//               "<td style='background-color:white;padding:0px;'>" + patientSetQueryNameDiv + "</td>" +
                "<td style='background-color:white;word-wrap:break-word;' >" + query.userid + "</td>" +
                "<td style='background-color:white;word-wrap:break-word;'>" + query.group + "</td>" +
                "<td style='text-align:center;background-color:white;word-wrap:break-word;'>" + desc + "</td>" +
                "<td style='text-align:right;background-color:white;'><span id='" + resultCounter + "EditTextSpan' class='" + query.networkid + "'></span>" + editTextButton + "</td>" +
                "</tr>";


            resultCounter++;
        }
    }
    resultsHtml += "</table>";

    $('ShrineAdmin-results').innerHTML = resultsHtml;

    i2b2.PatientSetViewer.ShrineConnector.loadCompletedQueries();

    jQuery('#resultsSpan').html(resultCounter);

    jQuery('#SiteTxt').on('keypress', function (event) {
        i2b2.PatientSetViewer.ShrineConnector.TriggerClick(event);
    });




};


i2b2.PatientSetViewer.ShrineConnector.flagCheckboxClicked = function (ui_row_id) {

    jQuery.alert({
        title: 'Alert',
        boxWidth: '300px',
        useBootstrap: false,
        content: 'Not Implemented',
    });

}

//Method to handle the click of the add/edit text button for a given row in the results table
i2b2.PatientSetViewer.ShrineConnector.editFlagCommentText = function (ui_row_id, shrineQueryNetworkId) {

    var orginalText = jQuery("#" + ui_row_id + "EditTextSpan").text();
    var textBoxHTML = "<input id='" + ui_row_id + "edtTxt' class='" + ui_row_id + "commentElement' style='width:108px; type='text' value='" + orginalText + "' />";
    // staring to use multiline var textBoxHTML = "<textarea id='" + ui_row_id + "edtTxt' class='" + ui_row_id + "commentElement' type='text' value='" + orginalText + "' cols='40' rows='5' maxlengh='275' ></textarea>";
    var okBtnHTML = "<button class='" + ui_row_id + "commentElement' style='" + i2b2.PatientSetViewer.ShrineConnector.UI.buttonStyle + "' title='Save Comments' onclick='i2b2.PatientSetViewer.ShrineConnector.flagCommentOkClicked(" + ui_row_id + ",\"" + shrineQueryNetworkId + "\");' >Ok</button>";
    var cancelBtnHTML = "<button class='" + ui_row_id + "commentElement' style='" + i2b2.PatientSetViewer.ShrineConnector.UI.buttonStyle + "' title='Cancel Changes' onclick='i2b2.PatientSetViewer.ShrineConnector.flagCommentCancelClicked(" + ui_row_id + ");' >Cancel</button>";

    jQuery("#" + ui_row_id + "EditTextSpan").data("orginalValue", orginalText);

    var insertHTML = textBoxHTML + "</br>" + okBtnHTML + cancelBtnHTML;

    jQuery("." + ui_row_id + "edtTxtBtn").hide(500);

    jQuery("#" + ui_row_id + "EditTextSpan").html(insertHTML);



};


i2b2.PatientSetViewer.ShrineConnector.flagCommentOkClicked = function (ui_row_id, shrineQueryNetworkId) {

    var adminNote = jQuery("#" + ui_row_id + "edtTxt").val();

    jQuery("#" + ui_row_id + "EditTextSpan").text(adminNote);
    jQuery("." + ui_row_id + "edtTxtBtn").show(500);
    jQuery("." + ui_row_id + "commentElement").remove();

    i2b2.PatientSetViewer.ShrineConnector.saveNote(shrineQueryNetworkId, adminNote);

};

i2b2.PatientSetViewer.ShrineConnector.flagCommentCancelClicked = function (ui_row_id) {

    jQuery("#" + ui_row_id + "EditTextSpan").text(jQuery("#" + ui_row_id + "EditTextSpan").data("orginalValue"));
    jQuery("." + ui_row_id + "edtTxtBtn").show(500);
    jQuery("." + ui_row_id + "commentElement").remove();


};




// function to create a Patient Set given a Previous Query's Query Master ID. 
// Reminder: query_master_id (local) = i2b2.PatientSetViewer.model.active.query.sdxInfo.sdxKeyValue (global)
i2b2.PatientSetViewer.ShrineConnector.shrineRunQuery = function (ui_row_id, query_master_id, shrine_query_name, shrineQueryNetworkId) {


    if (i2b2.PatientSetViewer.ShrineConnector.demoMode) {
        document.getElementById(ui_row_id + 'EditTextSpan').innerHTML = '<img src="js-i2b2/cells/plugins/ARCH/PatientSetViewer/assets/ajaxicon.gif" align="absmiddle"/> Processing';
        setTimeout(function () {
            document.getElementById(ui_row_id + 'EditTextSpan').innerHTML = "Query Created<br/><strong><a href=\"#\" onclick=\"$('ShrineConnector-TAB2').click();\">Proceed with this query &gt;</a></strong>";
        }, 5000);

    } else {

        if (i2b2.PatientSetViewer.ShrineConnector.UI.working) {
            jQuery.alert({
                title: 'Working...',
                boxWidth: '300px',
                useBootstrap: false,
                content: 'Please wait, a query is running.',
            });


        }
        else {

            i2b2.PatientSetViewer.ShrineConnector.UI.working = true;
            i2b2.PatientSetViewer.ShrineConnector.shrineLoadQuery(query_master_id, shrine_query_name, ui_row_id, shrineQueryNetworkId);


        }

    }

};


function CreatePatientSetAJAXCall(params, ui_row_id) {
    var self = i2b2.CRC.ctrlr.currentQueryStatus;
    self = {};
    self.QM = {};
    self.QRS = {};
    self.QI = {};

    self.QM.name = "Create Patient Set Query";
    this.callbackQueryDef = new i2b2_scopedCallback();
    this.callbackQueryDef.scope = this;
    this.callbackQueryDef.callback = function (results) {
        // debug
        //jQuery("#PatientSetID").text("Create-Patient-Set query returned."); // the result_instance_id points to the patient set
        //jQuery("#PatientSetID").show();
        // end debug

        i2b2.PatientSetViewer.ShrineConnector.UI.working = false;

        var queryName = "";

        var xml = jQuery.parseXML(results.msgResponse),
            $xml = jQuery(xml),
            $qn = $xml.find('query_master>name');

        self.psName = queryName = $qn.text();

        var tabDiv = document.getElementById('crctabNavigate').children[0];


        if (results.error) // Check to see if there is a LOCKEDOUT message
        {
            var temp = results.refXML.getElementsByTagName('response_header')[0];
            if (undefined != temp) {
                results.errorMsg = i2b2.h.XPath(temp, 'descendant-or-self::result_status/status')[0].firstChild.nodeValue;
                if (results.errorMsg.substring(0, 9) == "LOCKEDOUT")
                    results.errorMsg = 'As an "obfuscated user" you have exceeded the allowed query repeat and are now LOCKED OUT, please notify your system administrator.';
            }
            jQuery.alert({
                title: 'Error',
                boxWidth: '300px',
                useBootstrap: false,
                content: 'For ' + queryName + ': ' + results.errorMsg,
            });
            ShowACTAlert('Lockout');
            jQuery('#isCompleteBtn' + ui_row_id).html('Run');
            return;
        } else {
            // Check to see if there is an error
            var condition = results.refXML.getElementsByTagName('condition')[0];
            if (condition.getAttribute("type") == "ERROR") {
                results.errorMsg = 'ERROR: ' + condition.firstChild.nodeValue;
                jQuery.alert({
                    title: 'Error',
                    boxWidth: '300px',
                    useBootstrap: false,
                    content: results.errorMsg,
                });

                ShowACTAlert('Error');
                jQuery('#isCompleteBtn' + ui_row_id).html('Run');
                return;
            }
            var temp = results.refXML.getElementsByTagName('query_master')[0];
            self.QM.id = i2b2.h.getXNodeVal(temp, 'query_master_id');
            self.QM.name = i2b2.h.XPath(temp, 'descendant-or-self::name')[0].firstChild.nodeValue;
            // save the query instance
            var temp = results.refXML.getElementsByTagName('query_instance')[0];
            self.QI.id = i2b2.h.XPath(temp, 'descendant-or-self::query_instance_id')[0].firstChild.nodeValue;
            self.QI.status = i2b2.h.XPath(temp, 'descendant-or-self::query_status_type/name')[0].firstChild.nodeValue;
            self.QI.statusID = i2b2.h.XPath(temp, 'descendant-or-self::query_status_type/status_type_id')[0].firstChild.nodeValue;
            if (self.QI.status === "INCOMPLETE") // query is incomplete, placed on server queue. We poll to find out when it finishes.
            {
                ShowACTAlert('Patient Set Queued');
                jQuery.alert({
                    title: 'Queued',
                    boxWidth: '300px',
                    useBootstrap: false,
                    content: queryName + ' has timed out and has been rescheduled to run in the background.  \nThe results will appear in "Previous Queries".',
                });
                jQuery('#isCompleteBtn' + ui_row_id).html('Queued');
                SetQueryAsComplete();
                CRCAlert(tabDiv, 15, 500, 'A query has been queued for:<br/>' + queryName);
				i2b2.CRC.ctrlr.history.Refresh();

                //jQuery("#PatientSetID").text("Create-Patient-Set Query is Queued. Wait until polling starts..."); // the result_instance_id points to the patient set
                //jQuery("#PatientSetID").show();
                // check it once every 3 minutes = 180000 ms
                //i2b2.PatientSetViewer.pollForCreatePatientSetQueryCompletionHandler = setInterval(
                //                    function() { i2b2.PatientSetViewer.checkPatientSetQueryByID(self); }, 180000);
            } else {    // query is finished, we find the query instance and get the ID of the newly created Patient Set
                //alert('query is done!');
                SetQueryAsComplete(self);
                CRCAlert(tabDiv, 15, 500, 'A query has been created for:<br/>' + queryName);
				i2b2.CRC.ctrlr.history.Refresh();
            }
        }
    };

    function SetQueryAsComplete(localPSQueryInfo) {

        i2b2.PatientSetViewer.ShrineConnector.saveQuery(i2b2.PatientSetViewer.ShrineConnector.shrineQueryNetworkId, localPSQueryInfo);

        // set this network's local query info
        if (localPSQueryInfo) {
            i2b2.PatientSetViewer.ShrineConnector.model.shrineToPSQueryMapping[i2b2.PatientSetViewer.ShrineConnector.shrineQueryNetworkId] = {
                localID: localPSQueryInfo.QM.id,
                localName: localPSQueryInfo.QM.name
            };
        }

        jQuery('#isCompleteBtn' + i2b2.PatientSetViewer.ShrineConnector.shrineQueryNetworkId).html(i2b2.PatientSetViewer.ShrineConnector.reRunButtonText);

    }


    // AJAX call to create patient set
    i2b2.CRC.ajax.runQueryInstance_fromQueryDefinition("Plugin:ShrineConnector", params, this.callbackQueryDef);

}


function UpdateCreatePatientSetCell(elementId, message) {
    document.getElementById(elementId).innerHTML = message;
    i2b2.CRC.ctrlr.history.Refresh();
}

function ShowACTAlert(message) {
    jQuery.alert({
        title: 'ARCH Alert',
        boxWidth: '300px',
        useBootstrap: false,
        content: message,
    });
    i2b2.CRC.ctrlr.history.Refresh();
}



i2b2.PatientSetViewer.ShrineConnector.shrineLoadQuery = function (query_master_id, shrine_query_name, ui_row_id, shrineQueryNetworkId) {
    //Need to load query to get the query items list so we can recreate the correct concepts etc.
    i2b2.PatientSetViewer.ShrineConnector.shrineQueryNetworkId = shrineQueryNetworkId;
    var scopedCallback = new i2b2_scopedCallback();
    scopedCallback.scope = this;
    scopedCallback.callback = function (results) {
        var response = results.msgResponse;

        var queryDef = "";

        //This will take the XML query_def... results from our first AJAX call and be added to the PARMS for the second AJAX call that creates the Patient Set
        queryDef = response.substring(response.indexOf("<request_xml>") + 13, response.lastIndexOf("</request_xml>"));
        queryDef = "<query_definition>" + queryDef.substring(queryDef.indexOf("<query_name>"), queryDef.lastIndexOf("</panel>")) + "</panel></query_definition>";


        // now parameters parameters for the query.
        //var prevQueryName = i2b2.h.XPath(i2b2.PatientSetViewer.model.active.query.origData.xmlOrig, 'name')[0].innerHTML;
        var prevQueryName = shrine_query_name;
        //var prevQueryName = formatQueryName(shrine_query_name);
        var queryName = "Default Query Name";
        var indexOfAt = prevQueryName.indexOf("@");
        if (indexOfAt > -1) // '@' is found. crop off the first section of it
        {
            queryName = prevQueryName.substring(0, indexOfAt);
        }
        var d = new Date();
        queryName = "(Shrine&gt;Local)" + queryName + "@" + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();

        i2b2.PatientSetViewer.ShrineConnector.OrginalRunButtonText = jQuery('#isCompleteBtn' + shrineQueryNetworkId).html();

        jQuery.confirm({
            title: 'Local Query Name',
            boxWidth: '400px',
            useBootstrap: false,
            draggable: true,
            content: '' +
            '<form action="" class="formName" >' +
            '<div  class="form-group">' +
            '<label>Query Name</label>' +
            '<input type="text" value="' + queryName + '" style="width:300px;" class="name form-control" required />' +
            '</div>' +
            '</form>',
            buttons: {
                formSubmit: {
                    text: 'Submit',
                    btnClass: 'btn-blue',
                    action: function () {
                        var name = this.$content.find('.name').val();
                        if (!name) {
                            jQuery.alert({
                                title: 'Error',
                                boxWidth: '300px',
                                useBootstrap: false,
                                content: 'Please provide a valid query Name.',
                            });

                            return false;
                        }
                        queryName = name;
                        if (!queryName) {
                            i2b2.PatientSetViewer.ShrineConnector.UI.working = false;
                            document.getElementById(ui_row_id + 'EditTextSpan').innerHTML = '';
                            return false;
                        }

                        //replace query name with our query name
                        var oldQueryName = queryDef.substring(queryDef.indexOf("<query_name>") + 12, queryDef.indexOf("</query_name>"));
                        queryDef = queryDef.replace("<query_name>" + oldQueryName, "<query_name>" + queryName);

                        // configure params to create XML for a query that contains only a previous query
                        var params = {};
                        params.psm_query_definition = queryDef;
                        params.psm_result_output = "<result_output_list>\n" +
                            "\t<result_output priority_index=\"12\" name=\"patient_count_xml\"/>\n" +
                            "<result_output priority_index=\"13\" name=\"patientset\"/>" +
                            "</result_output_list>";
                        params.result_wait_time = 180;

                        jQuery('#isCompleteBtn' + shrineQueryNetworkId).html('Running');
                        CreatePatientSetAJAXCall(params, ui_row_id);
                    }
                },
                cancel: function () {
                    //close
                    jQuery('#isCompleteBtn' + shrineQueryNetworkId).html(i2b2.PatientSetViewer.ShrineConnector.OrginalRunButtonText);
                    i2b2.PatientSetViewer.ShrineConnector.UI.working = false;
                },
            },
            onContentReady: function () {
                // bind to events
                var jc = this;
                this.$content.find('form').on('submit', function (e) {
                    // if the user submits the form by pressing enter in the field.
                    e.preventDefault();
                    jc.$$formSubmit.trigger('click'); // reference the button and click it
                });
            }

        });





    };

    i2b2.CRC.ajax.getRequestXml_fromQueryMasterId("CRC:QueryTool", { qm_key_value: query_master_id }, scopedCallback);

};



i2b2.PatientSetViewer.ShrineConnector.shrineGetQuery = function (qm_id) {

    if (i2b2.PatientSetViewer.ShrineConnector.UI.IE8Mode)
        i2b2.PatientSetViewer.ShrineConnector.UI.showBckBtn = true;

    jQuery('#bckBtn').show();
    i2b2.hive.MasterView.setViewMode('Patients');
    i2b2.CRC.ctrlr.QT.doQueryLoad(qm_id);
};


i2b2.PatientSetViewer.ShrineConnector.createPatientSet = function (query_master_id) {
    jQuery.alert({
        title: 'Alert',
        boxWidth: '300px',
        useBootstrap: false,
        content: query_master_id,
    });
};




function BackToPlugInWrapper() {
    i2b2.hive.MasterView.setViewMode('Analysis');
    jQuery('#bckBtn').hide();
}

function BuildBackToPlugInButton() {
    if (!jQuery('#bckBtn').length) {
        jQuery('#viewMode-Project').append('<button id="bckBtn" type="button"   title="Return to ARCH Plugin" onclick="BackToPlugInWrapper();" ' +
            'style="margin:8px; float:right;border-radius:8px; color:#5e5588; background-color:#99ee99; font-weight:bold; ' +
            'font-family:arial,helvetica; font-size:12px; border-color:lightsteelblue; display:none;">Back to Plug-In</button>');

    }
}


i2b2.PatientSetViewer.ShrineConnector.shrineGetResults = function (max_records, match_str, user_id, shrine_category, type) {

    var scopedCallback = new i2b2_scopedCallback();
    scopedCallback.scope = this;
    scopedCallback.callback = function (results) {
        // THIS function is used to process the AJAX results of the getChild call
        //              results data object contains the following attributes:
        //                      refXML: xmlDomObject <--- for data processing
        //                      msgRequest: xml (string)
        //                      msgResponse: xml (string)
        //                      error: boolean
        //                      errorStatus: string [only with error=true]
        //                      errorMsg: string [only with error=true]

        // check for errors
        if (results.error) {

            jQuery.alert({
                title: 'Error',
                boxWidth: '300px',
                useBootstrap: false,
                content: 'The results from the server could not be understood from Shrine.  Press F12 for more information.',
            });
            return false;
        }

        results.parse();

        i2b2.PatientSetViewer.ShrineConnector.model.previousQueries = {};
        var l = results.model.length;
        for (var i = 0; i < l; i++) {
            var query = results.model[i];
            if (query.id != undefined) {
                i2b2.PatientSetViewer.ShrineConnector.model.previousQueries[i] = query;
            }
        }

        i2b2.PatientSetViewer.ShrineConnector.shrineLoadResults(type);
    }

    if (!i2b2.PatientSetViewer.ShrineConnector.demoMode) {
        i2b2.SHRINE.ajax.getNameInfo("Plugin:ShrineConnector", { shrine_category: shrine_category, shrine_max_records: max_records, shrine_match_str: match_str, shrine_user_id: user_id }, scopedCallback);
    } else {
        i2b2.PatientSetViewer.ShrineConnector.model.previousQueries = i2b2.PatientSetViewer.ShrineConnector.demoPreviousQueries;
        i2b2.PatientSetViewer.ShrineConnector.shrineLoadResults(type);
    }

};

i2b2.PatientSetViewer.ShrineConnector.Unload = function () {
    // purge old data
    i2b2.PatientSetViewer.ShrineConnector.model = {};
    i2b2.PatientSetViewer.ShrineConnector.model.prsRecord = false;
    i2b2.PatientSetViewer.ShrineConnector.model.conceptRecord = false;
    i2b2.PatientSetViewer.ShrineConnector.model.dirtyResultsData = true;
    try {
        i2b2.PatientSetViewer.ShrineConnector.yuiPanel.destroy();
    } catch (e) {
    }
    return true;
};



i2b2.PatientSetViewer.ShrineConnector.Resize = function () {
    //var h = parseInt( $('anaPluginViewFrame').style.height ) - 61 - 17;
    //$$("DIV#ShrineConnector-mainDiv DIV#ShrineConnector-TABS DIV.results-timelineBox")[0].style.height = h + 'px';
    z = $('anaPluginViewFrame').getHeight() - 34;
    $$('DIV#ShrineConnector-TABS DIV.ShrineConnector-MainContent')[0].style.height = z;
    $$('DIV#ShrineConnector-TABS DIV.ShrineConnector-MainContent')[1].style.height = z;

    if ((!i2b2.PatientSetViewer.ShrineConnector.UI.showBckBtn && i2b2.PatientSetViewer.ShrineConnector.UI.IE8Mode) || !i2b2.PatientSetViewer.ShrineConnector.UI.IE8Mode) //the main web client runs in Enterprise mode, and this mode caused invoking of Resize on leaving of plugin
    {
        jQuery('#bckBtn').hide();
    }
    if (i2b2.PatientSetViewer.ShrineConnector.UI.showBckBtn)
        i2b2.PatientSetViewer.ShrineConnector.UI.showBckBtn = false;

};

i2b2.PatientSetViewer.ShrineConnector.wasHidden = function () {
    try {
        i2b2.PatientSetViewer.ShrineConnector.yuiPanel.destroy();
    } catch (e) {
    }
}

function formatDateTime(inTimestamp) {
    var ret = inTimestamp;

    try {
        var parts = inTimestamp.split('T');
        var dateparts = parts[0].split('-');

        ret = dateparts[1] + '/' + dateparts[2] + '/' + dateparts[0] + '</br>' + parts[1].substring(0, 5);
        return ret;
    } catch (e) {
        return ret;
    }
}

function formatQueryName(inQueryName) {
    var ret = inQueryName;

    try {
        var parts = inQueryName.split('@');
        ret = parts[0];
        return ret;
    } catch (e) {
        return ret;
    }
}

function CRCAlert(blinkElement, cycles, rate, message) {
    jQuery('#crcAlertSpan').html(message);
    jQuery('#crcAlert').show(500);
    flashElement(blinkElement, '#crcAlert', cycles, rate);
}

function flashElement(blinkElement, alertElement, cycles, rate) {

    //if plugin view is 'full screen' covring the previous query pannel
    if ((jQuery(window).width() - jQuery('#anaPluginViewBox').width()) < 40) {
        i2b2.PLUGINMGR.ctrlr.main.ZoomView();
    }

    //if previous histroy is not open, then open it, and share it's space

    if (!jQuery('#crcHistoryBox').is(':visible')) {
        i2b2.hive.MasterView.toggleZoomWindow("HISTORY");
        i2b2.hive.MasterView.toggleZoomWindow("HISTORY");

    }


    if (i2b2.PatientSetViewer.ShrineConnector.UI.flashId)
        clearInterval(i2b2.PatientSetViewer.ShrineConnector.UI.flashId);
    else {
        i2b2.PatientSetViewer.ShrineConnector.UI.orginalBackgroundColor = blinkElement.style.backgroundColor;
        i2b2.PatientSetViewer.ShrineConnector.UI.orginalColor = blinkElement.style.color;
    }
    i2b2.PatientSetViewer.ShrineConnector.UI.flashId = setInterval(flash, rate);

    var i = 0;


    function flash() {

        if (i > (cycles - 1)) {
            blinkElement.style.backgroundColor = i2b2.PatientSetViewer.ShrineConnector.UI.orginalBackgroundColor;
            blinkElement.style.color = i2b2.PatientSetViewer.ShrineConnector.UI.orginalColor;
            clearInterval(i2b2.PatientSetViewer.ShrineConnector.UI.flashId);
            jQuery(alertElement).hide(500);
        } else {
            i++;
            if (blinkElement.style.backgroundColor == 'yellow') {
                blinkElement.style.backgroundColor = i2b2.PatientSetViewer.ShrineConnector.UI.orginalBackgroundColor;
                blinkElement.style.color = i2b2.PatientSetViewer.ShrineConnector.UI.orginalColor;
            } else {
                blinkElement.style.backgroundColor = 'yellow';
                blinkElement.style.color = 'black';
            }
        }

    }


}

//These Methods below are here to handle the checking/adding of SHRINE Local Queries Folder in the users Workspace 
//This includes tracking of 'completed' local Queries and any admin comments.

i2b2.PatientSetViewer.ShrineConnector.setWorkplaceRootIndex = function (user_id) {
    var scopedCallback = new i2b2_scopedCallback();
    scopedCallback.scope = i2b2.WORK;
    scopedCallback.callback = function (results) {
        var nlst = i2b2.h.XPath(results.refXML, "//folder[name and share_id and index and visual_attributes]");
        for (var i = 0; i < nlst.length; i++) {
            var s = nlst[i];
            var folder_user_id = i2b2.h.getXNodeVal(s, "user_id");
            var folder_index = i2b2.h.getXNodeVal(s, "index");
            if (folder_user_id == user_id) {
                i2b2.PatientSetViewer.ShrineConnector.workplaceRootIndex = folder_index;

                var getSetParentACTWPFolder = new i2b2_scopedCallback();
                getSetParentACTWPFolder.scope = i2b2.WORK;
                getSetParentACTWPFolder.callback = function (results) {
                    var cartFound = false;
                    var nlst = i2b2.h.XPath(results.refXML, "//folder[name and share_id and index and visual_attributes]");
                    for (var i = 0; i < nlst.length; i++) {
                        var s = nlst[i];

                        //get table key
                        if (i === 0) {
                            var idx = i2b2.h.getXNodeVal(s, "index");
                            i2b2.PatientSetViewer.ShrineConnector.tableKey = idx.split("\\")[2];
                        }


                        var folder_name = i2b2.h.getXNodeVal(s, "name");
                        var folder_index = i2b2.h.getXNodeVal(s, "index");
                        if (folder_name == i2b2.PatientSetViewer.ShrineConnector.WorkPlaceFolderName) {
                            cartFound = true;
                            i2b2.PatientSetViewer.ShrineConnector.workplaceCartIndex = folder_index;
                            break;
                        }
                    }
                    if (!cartFound) {
                        // ask to create folder ?
                        var newChildKey = i2b2.h.GenerateAlphaNumId(20);
                        var varInput = {
                            child_name: i2b2.PatientSetViewer.ShrineConnector.WorkPlaceFolderName,
                            share_id: 'N',
                            child_index: newChildKey,
                            parent_key_value: i2b2.PatientSetViewer.ShrineConnector.workplaceRootIndex,
                            child_visual_attributes: "FA",
                            child_annotation: "FOLDER:" + i2b2.PatientSetViewer.ShrineConnector.WorkPlaceFolderName,
                            child_work_type: "FOLDER",
                            result_wait_time: 180
                        };
                        i2b2.WORK.ajax.addChild("WORK:Workplace", varInput);

                    }

                    i2b2.PatientSetViewer.ShrineConnector.ShrineSearch();


                };

                var varInput = {
                    parent_key_value: i2b2.PatientSetViewer.ShrineConnector.workplaceRootIndex,
                    result_wait_time: 180
                };
                i2b2.WORK.ajax.getChildren("WORK:Workplace", varInput, getSetParentACTWPFolder);

            }
        }
    };

    if (i2b2.PM.model.userRoles.indexOf("MANAGER") == -1) {
        i2b2.WORK.ajax.getFoldersByUserId("WORK:Workplace", {}, scopedCallback);
    } else {
        i2b2.WORK.ajax.getFoldersByProject("WORK:Workplace", {}, scopedCallback);
    }

};


function EncodePSInfo(localPSQueryInfo) {
    return localPSQueryInfo.QM.id + i2b2.PatientSetViewer.ShrineConnector.psDelimiter + localPSQueryInfo.psName;
}

i2b2.PatientSetViewer.ShrineConnector.saveQuery = function (queryId, localPSQueryInfo) {
    i2b2.PatientSetViewer.ShrineConnector.setWorkplaceRootIndex(i2b2.PM.model.login_username);
    if (!i2b2.PatientSetViewer.ShrineConnector.workplaceCartIndex) {
        return;
    }

    if (!jQuery('#resultsRow' + i2b2.PatientSetViewer.ShrineConnector.shrineQueryNetworkId).data("queryRan") && !jQuery('#resultsRow' + i2b2.PatientSetViewer.ShrineConnector.shrineQueryNetworkId).data("adminNote")) {  /* avoid duplicate folders in the workplace */

        var encapXML = "";
        var encapWorkType = "";
        var encapValues = {};
        var encapTitle = "";
        var encapNoEscape = [];

        encapXML = i2b2.WORK.cfg.msgs.encapsulateQM;
        encapWorkType = "PREV_QUERY";
        encapValues.qm_id = queryId;
        encapValues.qm_name = queryId;
        if (localPSQueryInfo) {

            encapValues.ps_local_info = EncodePSInfo(localPSQueryInfo);
        }
        encapTitle = encapValues.qm_name;

        // package the work_xml snippet
        i2b2.h.EscapeTemplateVars(encapValues, encapNoEscape);
        var syntax = /(^|.|\r|\n)(\{{{\s*(\w+)\s*}}})/;
        var t = new Template(encapXML, syntax);
        var encapMsg = t.evaluate(encapValues);

        // gather primary message info
        var newChildKey = i2b2.h.GenerateAlphaNumId(20);
        var childAnnotation = newChildKey + "¿1¿¿" + EncodePSInfo(localPSQueryInfo); /*TODO:  Find current adminNote and keep that one */
        var varInput = {
            child_name: encapTitle,
            child_index: newChildKey,
            parent_key_value: i2b2.PatientSetViewer.ShrineConnector.workplaceCartIndex,
            share_id: 'N',
            child_visual_attributes: "ZA",
            child_annotation: childAnnotation, /*TODO:  Find current adminNote and keep that one */
//            child_annotation: newChildKey + "¿1¿",
            child_work_type: encapWorkType,
            child_work_xml: encapMsg,
            result_wait_time: 180
        };
        var scopedCallback = new i2b2_scopedCallback();
        scopedCallback.scope = i2b2.WORK;
        scopedCallback.callback = function (results) {
            if (results.error) {
                jQuery("." + queryId).html("Error");
                jQuery.alert({
                    title: 'Error',
                    boxWidth: '300px',
                    useBootstrap: false,
                    content: 'Error' + results.error,
                });

            }
            else {
                jQuery('#resultsRow' + queryId).data("queryRan", true);
               
                jQuery('#resultsRow' + queryId).data("folderIndex", newChildKey);
            }
        }
        i2b2.WORK.ajax.addChild("WORK:Workplace", varInput, scopedCallback);

    }

    else {
        var annotateCallBack = new i2b2_scopedCallback();
        annotateCallBack.scope = i2b2.WORK;
        annotateCallBack.callback = function (results) {
            if (results.error) {
                jQuery.alert({
                    title: 'Error',
                    boxWidth: '300px',
                    useBootstrap: false,
                    content: 'Error' + results.error,
                });
            }
            else {

                jQuery('#resultsRow' + queryId).data("queryRan", true);

            }
        }

        var annTxt = "";
        if (jQuery('#resultsRow' + queryId).data("adminNote")) {
            annTxt = jQuery('#resultsRow' + queryId).data("folderIndex") + "¿1¿"
                + jQuery("." + queryId).html() + "¿" + EncodePSInfo(localPSQueryInfo);

        }
        else {
            annTxt = jQuery('#resultsRow' + queryId).data("folderIndex") + "¿1¿¿" + EncodePSInfo(localPSQueryInfo);
        }

        var varInput = {
            annotation_text: annTxt,
            annotation_target_id: "\\\\" + i2b2.PatientSetViewer.ShrineConnector.tableKey + "\\" + jQuery('#resultsRow' + queryId).data("folderIndex"),
            result_wait_time: 180
        };

        i2b2.WORK.ajax.annotateChild("WORK:Workplace", varInput, annotateCallBack);

    }
};


i2b2.PatientSetViewer.ShrineConnector.saveNote = function (queryId, adminNote) {
    i2b2.PatientSetViewer.ShrineConnector.setWorkplaceRootIndex(i2b2.PM.model.login_username);
    if (!i2b2.PatientSetViewer.ShrineConnector.workplaceCartIndex) {
        return;
    }


    if (!jQuery('#resultsRow' + queryId).data("folderIndex"))  /*if there not already a folder then added it, otherwise annoatte it. */ {
        var encapXML = "";
        var encapWorkType = "";
        var encapValues = {};
        var encapTitle = "";
        var encapNoEscape = [];

        encapXML = i2b2.WORK.cfg.msgs.encapsulateQM;
        encapWorkType = "PREV_QUERY";
        encapValues.qm_id = queryId;
        encapValues.qm_name = queryId;
        encapTitle = encapValues.qm_name;

        // package the work_xml snippet
        i2b2.h.EscapeTemplateVars(encapValues, encapNoEscape);
        var syntax = /(^|.|\r|\n)(\{{{\s*(\w+)\s*}}})/;
        var t = new Template(encapXML, syntax);
        var encapMsg = t.evaluate(encapValues);

        // gather primary message info
        var newChildKey = i2b2.h.GenerateAlphaNumId(20);
        var varInput = {
            child_name: encapTitle,
            child_index: newChildKey,
            parent_key_value: i2b2.PatientSetViewer.ShrineConnector.workplaceCartIndex,
            share_id: 'N',
            child_visual_attributes: "ZA",
            child_annotation: newChildKey + "¿¿" + adminNote,   /*TODO:  Find current status of queryRan and keep that one */
            child_work_type: encapWorkType,
            child_work_xml: encapMsg,
            result_wait_time: 180
        };
        var scopedCallback = new i2b2_scopedCallback();
        scopedCallback.scope = i2b2.WORK;
        scopedCallback.callback = function (results) {
            if (results.error) {
                jQuery("." + queryId).html("Error");
                jQuery.alert({
                    title: 'Alert',
                    boxWidth: '300px',
                    useBootstrap: false,
                    content: 'Error' + results.error,
                });

            }
            else {

                jQuery('#resultsRow' + queryId).data("adminNote", true);
                jQuery('#resultsRow' + queryId).data("folderIndex", newChildKey);

            }
        }
        i2b2.WORK.ajax.addChild("WORK:Workplace", varInput, scopedCallback);

    }
    else {
        var annotateCallBack = new i2b2_scopedCallback();
        annotateCallBack.scope = i2b2.WORK;
        annotateCallBack.callback = function (results) {
            if (results.error) {
                jQuery.alert({
                    title: 'Error',
                    boxWidth: '300px',
                    useBootstrap: false,
                    content: 'Error' + results.error,
                });
            }
            else {
                jQuery('#resultsRow' + queryId).data("adminNote", true);
            }
        }

        var annTxt = "";
        if (jQuery('#resultsRow' + queryId).data("queryRan")) {
            annTxt = jQuery('#resultsRow' + queryId).data("folderIndex") + "¿1¿" + adminNote

        }
        else {
            annTxt = jQuery('#resultsRow' + queryId).data("folderIndex") + "¿¿" + adminNote
        }



        var varInput = {
            annotation_text: annTxt,
            annotation_target_id: "\\\\" + i2b2.PatientSetViewer.ShrineConnector.tableKey + "\\" + jQuery('#resultsRow' + queryId).data("folderIndex"),
            result_wait_time: 180
        };

        i2b2.WORK.ajax.annotateChild("WORK:Workplace", varInput, annotateCallBack);



    }
};





i2b2.PatientSetViewer.ShrineConnector.removeQuery = function (queryId) {
    return;  /* Not Implemented */
    if (!i2b2.PatientSetViewer.ShrineConnector.workplaceCartIndex) {
        jQuery('#isComplete' + folder_name).prop('checked', true);
        return;
    }
    var scopedCallbackCart = new i2b2_scopedCallback();
    scopedCallbackCart.scope = i2b2.WORK;
    scopedCallbackCart.callback = function (results) {
        var cartFound = false;
        var nlst = i2b2.h.XPath(results.refXML, "//folder[name and share_id and index and visual_attributes]");
        for (var i = 0; i < nlst.length; i++) {
            var s = nlst[i];
            var folder_name = i2b2.h.getXNodeVal(s, "name");
            //Workaround The getXNodeVal is repeating the name twice.
            if (folder_name.length / 2 > 1) {
                folder_name = folder_name.substring(0, folder_name.length / 2);
            }
            var folder_index = i2b2.h.getXNodeVal(s, "index");
            var folder_type = i2b2.h.getXNodeVal(s, "work_xml_i2b2_type");
            if (folder_name == queryId && folder_type == 'PREV_QUERY') {
                // delete child
                var scopedCallbackDelete = new i2b2_scopedCallback();
                scopedCallbackDelete.scope = i2b2.WORK;
                scopedCallbackDelete.callback = function (results) {
                    if (results.error) {
                        jQuery('#isComplete' + folder_name).prop('checked', true);
                        jQuery("." + folder_name).html("Error");
                        jQuery.alert({
                            title: 'Alert',
                            boxWidth: '300px',
                            useBootstrap: false,
                            content: 'Error' + results.error,
                        });
                    }
                    else {
                        jQuery("." + folder_name).html("Ready");
                    }

                };
                var varInput = {
                    delete_target_id: folder_index,
                    result_wait_time: 180
                };
                i2b2.WORK.ajax.deleteChild("WORK:Workplace", varInput, scopedCallbackDelete);

                break;
            }
        }
    };

    var varInput = {
        parent_key_value: i2b2.PatientSetViewer.ShrineConnector.workplaceCartIndex,
        result_wait_time: 180
    };

    i2b2.WORK.ajax.getChildren("WORK:Workplace", varInput, scopedCallbackCart);

};

i2b2.PatientSetViewer.ShrineConnector.loadCompletedQueries = function () {
    var scopedCallbackCart = new i2b2_scopedCallback();
    scopedCallbackCart.scope = i2b2.WORK;
    scopedCallbackCart.callback = function (results) {
        var cartFound = false;
        var nlst = i2b2.h.XPath(results.refXML, "//folder[name and share_id and index and visual_attributes]");
        for (var i = 0; i < nlst.length; i++) {
            var s = nlst[i];
            var folder_name = i2b2.h.getXNodeVal(s, "name");
            //Workaround The getXNodeVal is repeating the name twice.
            if (folder_name.length / 2 > 1) {
                folder_name = folder_name.substring(0, folder_name.length / 2);
            }
            var folder_type = i2b2.h.getXNodeVal(s, "work_xml_i2b2_type");
            // if (folder_type == 'PREV_QUERY') {
            //     var tt = i2b2.h.getXNodeVal(s, "tooltip");
            //     var ant = tt.split("\n")[1];
            //     var ACTInfo = ant.split("¿");
            //     if (ACTInfo[1]) //has query been ran flag
            //     {
            //         jQuery('#isCompleteBtn' + folder_name).html(i2b2.PatientSetViewer.ShrineConnector.reRunButtonText);
            //         jQuery('#resultsRow' + folder_name).data("queryRan", true);
            //         jQuery('#resultsRow' + folder_name).data("folderIndex", ACTInfo[0]);
            //     }
            //     else
            //         jQuery('#resultsRow' + folder_name).data("queryRan", false);
            //
            //     if (ACTInfo[2]) //are there admin notes
            //     {
            //         jQuery("." + folder_name).html(ACTInfo[2]);
            //         jQuery('#resultsRow' + folder_name).data("adminNote", true);
            //         jQuery('#resultsRow' + folder_name).data("folderIndex", ACTInfo[0]);
            //     }
            //     else
            //         jQuery('#resultsRow' + folder_name).data("adminNote", false);
            // }
            if (folder_type == 'PREV_QUERY') {
                var tt = i2b2.h.getXNodeVal(s, "tooltip");
                var ant = tt.split("\n")[1];
                var ARCHInfo = ant.split("¿");
                if (ARCHInfo[1]) //has query been ran flag
                {
                    jQuery('#isCompleteBtn' + folder_name).html(i2b2.PatientSetViewer.ShrineConnector.reRunButtonText);
                    SetQueryAsAvailable(folder_name);
                    jQuery('#resultsRow' + folder_name).data("queryRan", true);
                    jQuery('#resultsRow' + folder_name).data("folderIndex", ARCHInfo[0]);
                }
                else
                    jQuery('#resultsRow' + folder_name).data("queryRan", false);

                if (ARCHInfo[2]) //are there admin notes
                {
                    jQuery("." + folder_name).html(ARCHInfo[2]);
                    jQuery('#resultsRow' + folder_name).data("adminNote", true);
                    jQuery('#resultsRow' + folder_name).data("folderIndex", ARCHInfo[0]);
                }
                else
                    jQuery('#resultsRow' + folder_name).data("adminNote", false);

                if (ARCHInfo[3]) //is there local patient set info
                {
                    var localInfo = ARCHInfo[3].split(i2b2.PatientSetViewer.ShrineConnector.psDelimiter);
                    if (localInfo) {
                        jQuery('#resultsRow' + folder_name).data("local_qm_id", localInfo[0]);
                        // assign local patient set query info if exists
                        i2b2.PatientSetViewer.ShrineConnector.model.shrineToPSQueryMapping[folder_name] = {
                            localId: localInfo[0],
                            localName: localInfo[1]
                        }
                        jQuery('#psqnDiv' + folder_name).html(localInfo[1]);
                    } else {
                        i2b2.PatientSetViewer.ShrineConnector.model.shrineToPSQueryMapping[folder_name] = null;
                        jQuery('#resultsRow' + folder_name).data("local_qm_id", false);
                        jQuery('#psqnDiv' + folder_name).html("");
                    // if (ARCHInfo[5]) {  //is there a local patient set query info
                    }
                } else {
                    i2b2.PatientSetViewer.ShrineConnector.model.shrineToPSQueryMapping[folder_name] = null;
                    jQuery('#resultsRow' + folder_name).data("local_qm_id", false);
                    jQuery('#psqnDiv' + folder_name).html("");
                }
                // if (ARCHInfo[4]) //is there a local shrine qm_name
                // {
                // }
                // else
                //     jQuery('#psqnDiv' + folder_name).html("");
            }
        }
    };

    var varInput = {
        parent_key_value: i2b2.PatientSetViewer.ShrineConnector.workplaceCartIndex,
        result_wait_time: 180
    };
    i2b2.WORK.ajax.getChildren("WORK:Workplace", varInput, scopedCallbackCart);
};

function SetQueryAsAvailable (networkId) {
    jQuery('#selectQueryForTemplateOption' + networkId)
        .attr("style", "color:#5e5588; background-color:#99ee99; font-weight:bold;")
        .val("Select")
        .removeAttr("disabled");
};

i2b2.PatientSetViewer.ShrineConnector.IsCompletedChecked = function (shrineQueryNetworkId) {

    return;  /* Not Implemented */

    if (jQuery('#isComplete' + shrineQueryNetworkId).prop('checked')) {
        i2b2.PatientSetViewer.ShrineConnector.saveQuery(shrineQueryNetworkId);
    }
    else {
        i2b2.PatientSetViewer.ShrineConnector.removeQuery(shrineQueryNetworkId);

    }


};

//Deletes all save queries from the workplace  not tied to the UI at this time. Will run from console
i2b2.PatientSetViewer.ShrineConnector.resetWorkplaceFolder = function () {

    var scopedCallbackCart = new i2b2_scopedCallback();
    scopedCallbackCart.scope = i2b2.WORK;
    scopedCallbackCart.callback = function (results) {
        var cartFound = false;
        var nlst = i2b2.h.XPath(results.refXML, "//folder[name and share_id and index and visual_attributes]");
        for (var i = 0; i < nlst.length; i++) {
            var s = nlst[i];
            var folder_name = i2b2.h.getXNodeVal(s, "name");

            var folder_index = i2b2.h.getXNodeVal(s, "index");
            var folder_type = i2b2.h.getXNodeVal(s, "work_xml_i2b2_type");
            if (folder_name == i2b2.PatientSetViewer.ShrineConnector.WorkPlaceFolderName && folder_type == 'FOLDER') {
                // delete child
                var scopedCallbackDelete = new i2b2_scopedCallback();
                scopedCallbackDelete.scope = i2b2.WORK;
                scopedCallbackDelete.callback = function (results) {
                    if (results.error) {
                        jQuery.alert({
                            title: 'Alert',
                            boxWidth: '300px',
                            useBootstrap: false,
                            content: 'Error' + results.error,
                        });
                    }

                };
                var varInput = {
                    delete_target_id: folder_index,
                    result_wait_time: 180
                };
                i2b2.WORK.ajax.deleteChild("WORK:Workplace", varInput, scopedCallbackDelete);

                break;
            }
        }
    };

    var varInput = {
        parent_key_value: i2b2.PatientSetViewer.ShrineConnector.workplaceRootIndex,
        result_wait_time: 180
    };
    i2b2.WORK.ajax.getChildren("WORK:Workplace", varInput, scopedCallbackCart);

};













