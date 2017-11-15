/**
 * @projectDescription	Produces data file based on previous query
 * @inherits	i2b2
 * @namespace	i2b2.CRC.ctrlr.dataSet
 * @author	Nich Wattanasin
 * @version 	2.0
 * ----------------------------------------------------------------------------------------
 * updated 05-06-15: 	Bhaswati Ghosh
 * 2.0 : 03-03-16:		Nich Wattanasin
 */

// smb added this because couldn't find initializer //
i2b2.CRC.ctrlr.dataSet = new DataSetController();


function DataSetController() {
    i2b2.CRC.model.dataSet = {};
// values used for table data select
    i2b2.CRC.model.dataSet.cellDataOption = {};
    i2b2.CRC.model.dataSet.cellDataOption.DEFAULT = "Existence (Yes/No)";
    i2b2.CRC.model.dataSet.cellDataOption.MIN = "Minimum Value";  // To-do
    i2b2.CRC.model.dataSet.cellDataOption.MAX = "Maximum Value";  // To-do
    i2b2.CRC.model.dataSet.cellDataOption.AVERAGE = "Average Value";  // To-do
    i2b2.CRC.model.dataSet.cellDataOption.MEDIAN = "Median Value";  // To-do
    i2b2.CRC.model.dataSet.cellDataOption.FIRST = "Date (First)";
    i2b2.CRC.model.dataSet.cellDataOption.LAST = "Date (Most Recent)";
    i2b2.CRC.model.dataSet.cellDataOption.COUNT = "Count";
    i2b2.CRC.model.dataSet.cellDataOption.ALLVALUES = "List of All Values";  // To-do
    i2b2.CRC.model.dataSet.cellDataOption.MODE = "Mode (Most Frequent Value)"; // To-do
    i2b2.CRC.model.dataSet.cellDataOption.ALLCONCEPTTEXT = "All Concepts (Names/Text)";
    i2b2.CRC.model.dataSet.cellDataOption.MODECONCEPTTEXT = "Most Frequent Concept (Names/Text)";
    i2b2.CRC.model.dataSet.cellDataOption.ALLCONCEPTCODE = "All Concepts (Codes)";
    i2b2.CRC.model.dataSet.cellDataOption.MODECONCEPTCODE = "Most Frequent Concept (Codes)";

    this.previewRequested = false;
    this.dataRequested = false;
    this.queryMasterId = "";
    this.downloadID = "";
    this.lastDroppedTerm = null;

    // TODO smb - added initializer for model - why wasn't it here?
    i2b2.CRC.model.dataSet.model = {};
    i2b2.CRC.model.dataSet.active = {};

    this.UI = {};

    this.user = {};

    this.viewResultsTableOption = false;


// Value types gathered from value metadata in concepts and modifiers. Used to differentiate different types of value restrictions. Combines posInteger, Integer, PosFloat, and Float as NUMERIC Data
    this.valueType = {};
    this.valueType.NUMERIC = {id: 1, text: "numeric"};       // NUMERIC_DATA: PosInteger, Integer, PosFloat, Float
    this.valueType.ENUM = {id: 2, text: "enumerated"};    // ENUM
    this.valueType.BLOB = {id: 3, text: "blob"};          // LARGESTRING (BLOB)
    this.valueType.MIXED = {id: 4, text: "mixed"};         // This is used to describe a Group containing concepts of mixed value types
    this.valueType.UNKNOWN = {id: 0, text: "unknown"};       // Unknown (sanity check)

    var zygosityValues = ["Heterozygous", "Homozygous", "missing_zygosity"];
    var consequenceValues = ["3'UTR", "5'UTR", "downstream", "exon", "Frameshift", "In-frame", "intron", "missense", "nonsense", "start_loss", "stop_loss", "synonymous", "upstream", "missing_consequence"];
    var alleleValues = ["A_to_C", "A_to_G", "A_to_T", "C_to_A", "C_to_G", "C_to_T", "G_to_A", "G_to_C", "G_to_T", "T_to_A", "T_to_C", "T_to_G", "._."];

//Change BG for new value box architecture
    this.currentTerm = null;

    this.preloadQueryTags = function() {
// grab any preloaded tags from query string
        var rdsTags = document.URL.toQueryParams().rdsTags;
        if (rdsTags) {
            i2b2.CRC.model.dataSet.model.tags = JSON.parse(rdsTags);
        }
    };

    this.Init = function (loadedDiv) {

        // 1. check DATA_LDS role
        // 2. if no DATA_LDS role, show form + populate drop down with faculty sponsors
        // 3. if yes DATA_LDS role, continue as is

        // register DIV as valid DragDrop target for Patient Record Sets (PRS) objects
        var op_trgt = {dropTarget: true};
        i2b2.sdx.Master.AttachType("RequestDataSet-CONCPTDROP", "CONCPT", op_trgt);
        i2b2.sdx.Master.AttachType("RequestDataSet-CONCPTDROP", "QM", op_trgt);
        i2b2.sdx.Master.AttachType("RequestDataSet-PRSDROP", "PRS", op_trgt);
        i2b2.sdx.Master.AttachType("RequestDataSet-PRSDROP", "QM", op_trgt);

        // drop event handlers used by this plugin
        i2b2.sdx.Master.setHandlerCustom("RequestDataSet-CONCPTDROP", "CONCPT", "DropHandler", this.conceptDropped);
        i2b2.sdx.Master.setHandlerCustom("RequestDataSet-CONCPTDROP", "QM", "DropHandler", this.queryConceptDropped);
        i2b2.sdx.Master.setHandlerCustom("RequestDataSet-PRSDROP", "PRS", "DropHandler", this.prsDropped);
        i2b2.sdx.Master.setHandlerCustom("RequestDataSet-PRSDROP", "QM", "DropHandler", this.queryDropped);


        this.debug.useReviewWindow = false;             // enable/disable live debug message output to external window

        // i2b2.CRC.model.dataSet.active = new Object();
        i2b2.CRC.model.dataSet.active = new Object();

        i2b2.CRC.model.dataSet.model.prsRecord = false;
        i2b2.CRC.model.dataSet.model.conceptRecord = false;
        i2b2.CRC.model.dataSet.model.dirtyResultsData = true;

        this.columnDisplaySelectID = "columnDisplaySelectID";
        i2b2.CRC.model.dataSet.model.pageSize = 50;
        i2b2.CRC.model.dataSet.model.processed = 0;
        this.msgCounter = 0;
        // array to store concepts
        i2b2.CRC.model.dataSet.model.concepts = [];

        // set initial pagination values
        i2b2.CRC.model.dataSet.model.pgstart = 1;
        i2b2.CRC.model.dataSet.model.pgsize = 10;
        // set initial zoom values
        i2b2.CRC.model.dataSet.model.zoomScale = 1.0;
        i2b2.CRC.model.dataSet.model.zoomPan = 1.0;

        i2b2.CRC.model.dataSet.model.required = {
            'id': {
                'name': 'Patient Number',
                'display': false
            },
            'gender': {
                'name': 'Gender',
                'display': true
            },
            'age': {
                'name': 'Age',
                'display': true
            },
            'race': {
                'name': 'Race',
                'display': true
            }
        };

        i2b2.CRC.model.dataSet.model.showMetadataDialog = true;

        i2b2.CRC.model.dataSet.model.csv = '';

        i2b2.CRC.model.dataSet.model.firstVisit = true;
        i2b2.CRC.model.dataSet.model.readyToPreview = false;
        i2b2.CRC.model.dataSet.model.readyToProcess = false;
        i2b2.CRC.model.dataSet.model.processLocked = false;


        z = $('anaPluginViewFrame').getHeight() - 40;//- 34;  //BG vertical scrollbar display issues
       this.preloadQueryTags();


        i2b2.CRC.ctrlr.dataSet.conceptsRender();
    };

// 2.0: Date Constraints
    this.constructDateRangeConstraintXML = function (conceptIndex) {
        var fromMoment = null;
        var toMoment = null;
        if (i2b2.CRC.model.dataSet.model.concepts[conceptIndex].dateFrom)
            fromMoment = new moment(i2b2.CRC.model.dataSet.model.concepts[conceptIndex].dateFrom.Year + "-" + padNumber(i2b2.CRC.model.dataSet.model.concepts[conceptIndex].dateFrom.Month, 2) + "-" + padNumber(i2b2.CRC.model.dataSet.model.concepts[conceptIndex].dateFrom.Day, 2));
        if (i2b2.CRC.model.dataSet.model.concepts[conceptIndex].dateTo)
            var toMoment = new moment(i2b2.CRC.model.dataSet.model.concepts[conceptIndex].dateTo.Year + "-" + padNumber(i2b2.CRC.model.dataSet.model.concepts[conceptIndex].dateTo.Month, 2) + "-" + padNumber(i2b2.CRC.model.dataSet.model.concepts[conceptIndex].dateTo.Day, 2));

        var xml = '';
        if (!i2b2.CRC.model.dataSet.model.concepts[conceptIndex].dateFrom && !i2b2.CRC.model.dataSet.model.concepts[conceptIndex].dateTo)
            return '';
        else if (i2b2.CRC.model.dataSet.model.concepts[conceptIndex].dateFrom && !i2b2.CRC.model.dataSet.model.concepts[conceptIndex].dateTo)
            xml = '\t\t\t<constrain_by_date>\n' +
                '\t\t\t\t<date_from time="start_date" inclusive= "yes">' + fromMoment.format() + '</date_from>\n' +
                '\t\t\t</constrain_by_date>\n';
        else if (!i2b2.CRC.model.dataSet.model.concepts[conceptIndex].dateFrom && i2b2.CRC.model.dataSet.model.concepts[conceptIndex].dateTo)
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
    this.retrieveValueConstraint = function (conceptIndex) {
        var values = undefined;
        // if the current concept is the last dropped concept and if its sdx comes with lab values (as in the case where the concept is part of a prev query), use it.
        /*if (this.lastDroppedTerm &&
         (Object.is(this.lastDroppedTerm, i2b2.CRC.model.dataSet.model.concepts[conceptIndex])) &&
         i2b2.CRC.model.dataSet.model.concepts[conceptIndex].sdxData.LabValues) */
        if (this.lastDroppedTerm &&
            this.lastDroppedTerm === i2b2.CRC.model.dataSet.model.concepts[conceptIndex] &&
            i2b2.CRC.model.dataSet.model.concepts[conceptIndex].sdxData.LabValues) {
            values = i2b2.CRC.model.dataSet.model.concepts[conceptIndex].sdxData.LabValues;
            delete i2b2.CRC.model.dataSet.model.concepts[conceptIndex].sdxData.LabValues;  // delete LabValues because we have saved it
        }
        else
            values = i2b2.CRC.model.dataSet.model.concepts[conceptIndex].valueRestriction; // read from the constraint saved in the concept object
        return values;
    };

// 2.0: Internal function to get PDO filter list
    this._getPDOFilterList = function () {

        var filterList = '';
        for (var i1 = 0; i1 < i2b2.CRC.model.dataSet.model.concepts.length; i1++) {
            var sdxData = i2b2.CRC.model.dataSet.model.concepts[i1].sdxData;
            if (sdxData.origData.isModifier) { // deal with modifiers
                var modParent = sdxData.origData.parent;
                var level = sdxData.origData.level;
                var key = sdxData.origData.parent.key;
                var name = (sdxData.origData.parent.name != null ? i2b2.h.Escape(sdxData.origData.parent.name) : i2b2.h.Escape(sdxData.origData.name));
                var tooltip = sdxData.origData.tooltip;
                var itemicon = sdxData.origData.hasChildren;
                while (modParent != null) { // find the first ancestor that is not a modifer
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
                var modifierConstraints = (i2b2.CRC.model.dataSet.model.concepts[i1].valueRestriction != null) ? i2b2.CRC.view.modLabvaluesCtlr.getModLabValuesForXML(i2b2.CRC.model.dataSet.model.concepts[i1].valueRestriction) : "";
                filterList +=
                    '	<panel name="' + i2b2.CRC.model.dataSet.model.concepts[i1].panel + '">\n' +
                    '		<panel_number>0</panel_number>\n' +
                    '		<panel_accuracy_scale>0</panel_accuracy_scale>\n' +
                    '		<invert>0</invert>\n' +
                    '		<item>\n' +
                    '			<hlevel>1</hlevel>\n' +
                    '           <item_key>' + key + '</item_key>\n' +
                    '           <item_name>' + name + '</item_name>\n' +
                    '           <tooltip>' + tooltip + '</tooltip>\n' +
                    '           <item_icon>' + itemicon + '</item_icon>\n' +
                    '           <class>ENC</class>\n' +
                    '           <item_is_synonym>false</item_is_synonym>\n' +

                    '           <constrain_by_modifier>\n' +
                    '              <modifier_name>' + sdxData.origData.name + '</modifier_name>\n' +
                    '              <applied_path>' + sdxData.origData.applied_path + '</applied_path>\n' +
                    '              <modifier_key>' + sdxData.origData.key + '</modifier_key>\n' +
                    modifierConstraints +
                    '           </constrain_by_modifier>\n';
                filterList += '		</item>\n' + '	</panel>\n';
            }
            else { // deal with normal concepts
                // get XML representation of the concept's value restrictions
                var valueConstraints = (i2b2.CRC.model.dataSet.model.concepts[i1].valueRestriction != null) ? i2b2.CRC.view.modLabvaluesCtlr.getModLabValuesForXML(i2b2.CRC.model.dataSet.model.concepts[i1].valueRestriction) : "";
                var dateConstraints = this.constructDateRangeConstraintXML(i1);
                var t = sdxData.origData.xmlOrig;
                var cdata = {};
                cdata.level = i2b2.h.getXNodeVal(t, "level");
                cdata.key = i2b2.h.getXNodeVal(t, "key");
                cdata.tablename = i2b2.h.getXNodeVal(t, "tablename");
                cdata.dimcode = i2b2.h.getXNodeVal(t, "dimcode");
                cdata.synonym = i2b2.h.getXNodeVal(t, "synonym_cd");
                filterList +=
                    '	<panel name="' + i2b2.CRC.model.dataSet.model.concepts[i1].panel + '">\n' +
                    '		<panel_number>' + i1 + '</panel_number>\n' +
                    '		<panel_accuracy_scale>0</panel_accuracy_scale>\n' +
                    '		<invert>0</invert>\n' +
                    '		<item>\n' +
                    '			<hlevel>' + cdata.level + '</hlevel>\n' +
                    '			<item_key>' + cdata.key + '</item_key>\n' +
                    '			<dim_tablename>' + cdata.tablename + '</dim_tablename>\n' +
                    '			<dim_dimcode>' + cdata.dimcode + '</dim_dimcode>\n' +
                    '			<item_is_synonym>' + cdata.synonym + '</item_is_synonym>\n' +
                    '          ' + valueConstraints + '\n' +
                    '          ' + dateConstraints;
                filterList += '		</item>\n' + '	</panel>\n';
            }
        }

        return filterList;

    };



    /* ==================================================================================================================
     * Debug methods to output debug message to external window. Can be disabled by setting this.debug to false.
     * ================================================================================================================== */
    var reviewWindow = undefined;           // external window used for debugging
    this.debug = {};               // declare the debug namespaces;
    this.debug.externalWindow = {};
    this.debug.externalWindow.startViewResults = function () {
        var cd = new Date();
        var dt = (cd.getMonth() + 1) + "/"
            + cd.getDate() + "/"
            + cd.getFullYear() + " @ "
            + cd.getHours() + ":"
            + cd.getMinutes() + ":"
            + cd.getSeconds();
        reviewWindow.document.write("<p>[START GETTING NEW PATIENTS(" + i2b2.CRC.model.dataSet.active.size + ")] (" + dt + ")</p>\n");
    };

    this.debug.externalWindow.startGetResults = function (minValue, maxValue) {
        var cd = new Date();
        var dt = (cd.getMonth() + 1) + "/"
            + cd.getDate() + "/"
            + cd.getFullYear() + " @ "
            + cd.getHours() + ":"
            + cd.getMinutes() + ":"
            + cd.getSeconds();
        reviewWindow.document.write("<p>[Sending for " + minValue + "-" + maxValue + "] (" + dt + ")</p>\n");
    };

    this.debug.externalWindow.endGetResults = function (minValue, maxValue) {
        var cd2 = new Date();
        var dt2 = (cd2.getMonth() + 1) + "/"
            + cd2.getDate() + "/"
            + cd2.getFullYear() + " @ "
            + cd2.getHours() + ":"
            + cd2.getMinutes() + ":"
            + cd2.getSeconds();
        reviewWindow.document.write("<p>[Received " + minValue + "-" + maxValue + "] (" + dt2 + ")</p>\n");
    };

    this.debug.externalWindow.out = function (message) {
        reviewWindow.document.write(message);
    };
    /* end of Debug methods to output debug message to external window. */

    this.setShowMetadataDialog = function (sdxData) {
        i2b2.CRC.model.dataSet.model.showMetadataDialog = sdxData;
    };

    this.Unload = function () {
        // purge old data
        i2b2.CRC.model.dataSet.model = {};
        i2b2.CRC.model.dataSet.model.prsRecord = false;
        i2b2.CRC.model.dataSet.model.conceptRecord = false;
        i2b2.CRC.model.dataSet.model.dirtyResultsData = true;
        try {
            this.yuiPanel.destroy();
        } catch (e) {
        }
        return true;
    };

    this.queryConceptDropped = function (sdxData) {
        sdxData = sdxData[0];

        $("RequestDataSet-CONCPTDROP").style.background = "#DEEBEF";
        $("RequestDataSet-CONCPTDROP").innerHTML = '<div class="concptItem"><img src="js-i2b2/cells/CRC/assets/rds_spinning.gif" align="absmiddle" style="margin-left:5px;"/> Loading Concepts from Previous Query ...</div>';

        i2b2.CRC.ctrlr.dataSet.loadQueryConcepts(sdxData.sdxInfo.sdxKeyValue);

    }

    this.queryDropped = function (sdxData) {
        sdxData = sdxData[0];

        $("RequestDataSet-PRSDROP").style.background = "#DEEBEF";
        $("RequestDataSet-PRSDROP").innerHTML = '<img src="js-i2b2/cells/CRC/assets/rds_spinning.gif" align="absmiddle" style="margin-left:5px;"/> Loading Previous Query ...';

        // The sdxInfo being loaded/dropped is of sdxType 'QM' (Query Master)
        // Take QM ID and find 1) patient count 2) patient set 3) breakdowns
        i2b2.CRC.model.dataSet.active.query = sdxData;
        i2b2.CRC.ctrlr.dataSet.loadQueryInfo(sdxData.sdxInfo.sdxKeyValue);
        if (document.getElementById('RequestDataSet-LoadConcepts').checked) {
            if (i2b2.CRC.model.dataSet.model.concepts.length > 0) {
                var clobberConcepts = confirm("You have chosen to automatically 'Include concepts from the Previous Query' which will replace your current list of specified concepts. Click OK to confirm.");
                if (clobberConcepts) {
                    i2b2.CRC.ctrlr.dataSet.loadQueryConcepts(sdxData.sdxInfo.sdxKeyValue);
                } else {
                    i2b2.CRC.ctrlr.dataSet.conceptsRender();
                }
            } else {
                i2b2.CRC.ctrlr.dataSet.loadQueryConcepts(sdxData.sdxInfo.sdxKeyValue);
            }
        } else {
            i2b2.CRC.ctrlr.dataSet.conceptsRender();
        }

        //BG
        i2b2.CRC.model.dataSet.model.csv = '';
        this.previewRequested = false;
        this.dataRequested = false;
        //End BG
    };

    this.queryAutoDropped = function (qm_id) {


        i2b2.CRC.ctrlr.dataSet.loadQueryInfo(qm_id);
        i2b2.CRC.ctrlr.dataSet.loadQueryConcepts(qm_id);
        $("RequestDataSet-PRSDROP").style.background = "#DEEBEF";
        $("RequestDataSet-PRSDROP").innerHTML = '<img src="js-i2b2/cells/CRC/assets/rds_spinning.gif" align="absmiddle" style="margin-left:5px;"/> Loading Previous Query ...';
    };

    this.prsUnload = function () {
        i2b2.CRC.model.dataSet.model.prsRecord = false;
        $("RequestDataSet-PRSDROP").style.background = "#DEEBEF";
        $("RequestDataSet-PRSDROP").innerHTML = '<img src="js-i2b2/cells/CRC/assets/rds_pointer.png" align="absbottom" style="margin-left:5px;" /> Drag &amp; Drop a <em>Previous Query</em> with a Patient Set here';
        i2b2.CRC.model.dataSet.active = {};
        //BG
        for (var i = 0; i < i2b2.CRC.model.dataSet.model.concepts.length; i++) {
            i2b2.CRC.ctrlr.dataSet.conceptDelete(i);
        }
        i2b2.CRC.model.dataSet.model.csv = '';
        this.previewRequested = false;
        this.dataRequested = false;
        //End BG
    };

    this.loadQueryInfo = function (query_master_id) {

        this.queryMasterId = query_master_id;
        this.readyToPreview = true;
        i2b2.CRC.model.dataSet.model.firstVisit = false;

        var scopedCallback = new i2b2_scopedCallback();
        scopedCallback.scope = this;
        scopedCallback.callback = function (results) {
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
            if (qd.length != 0) {
                i2b2.CRC.model.dataSet.model.activeQueryName = i2b2.h.getXNodeVal(results.refXML, 'name');
            }


            var scopedCallbackQI = new i2b2_scopedCallback();
            scopedCallbackQI.scope = i2b2.CRC.model.dataSet.active.query;
            scopedCallbackQI.callback = function (results) {

                var qi = results.refXML.getElementsByTagName('query_instance');
                i2b2.CRC.model.dataSet.active.query_instance_id = i2b2.h.getXNodeVal(qi[0], 'query_instance_id');

                var scopedCallbackQRS = new i2b2_scopedCallback();
                scopedCallbackQRS.scope = i2b2.CRC.model.dataSet.active.query;
                scopedCallbackQRS.callback = function (results) {
                    var found_patient_set = false;
                    i2b2.CRC.model.dataSet.active.QRS = [];
                    var results_list = results.refXML.getElementsByTagName('query_result_instance');
                    var l = results_list.length;
                    for (var i = 0; i < l; i++) {
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
                            // if (!temp.title) {
                            //     temp.title = i2b2.CRC.ctrlr.QueryStatus._GetTitle(temp.QRS_Type, temp, qi);
                            // }
                            if (temp.QRS_Status_ID != 3) {
                                $("RequestDataSet-PRSDROP").innerHTML = 'There was a problem loading this query. Please try a different query.';
                                $("RequestDataSet-PRSDROP").style.background = "#F6CCDA";
                                alert("The selected query is unfinished! Please select a finished query to make a request.");
                                break;
                            }
                            i2b2.CRC.model.dataSet.active.QRS.push(temp);
                        } catch (e) {
                        }
                    }

                    // Start loop through Query Result Set
                    for (var i = 0; i < i2b2.CRC.model.dataSet.active.QRS.length; i++) {
                        var query_result = i2b2.CRC.model.dataSet.active.QRS[i];
//                        switch (query_result.QRS_DisplayType) {
//                            case "LIST": // Check to see if query has a Patient Set
                                // if (query_result.QRS_Type == "PATIENTSET") {
                                //     //alert("Patient Set has been found");
                                //     found_patient_set = true;
                                    var sdxTemp = {
                                        sdxInfo: {
                                            sdxControlCell: "CRC",
                                            sdxDisplayName: "RequestDS-TEST",
                                            // sdxDisplayName: query_result.title,
                                            sdxKeyName: "result_instance_id",
                                            sdxKeyValue: query_result.QRS_ID,
                                            sdxType: "PRS"
                                        }
                                    };
                                    i2b2.CRC.model.dataSet.model.prsRecord = sdxTemp;
                                    i2b2.CRC.model.dataSet.model.dirtyResultsData = true;
                                    i2b2.CRC.model.dataSet.active.size = query_result.size;

                    } // End loop through Query Result Set
                        $("RequestDataSet-PRSDROP").innerHTML = '<img src="js-i2b2/cells/CRC/assets/sdx_CRC_PRS.jpg" align="absbottom" style="margin-left:5px;"/> ' + i2b2.h.Escape(i2b2.CRC.model.dataSet.model.activeQueryName) + '&nbsp;<strong>[Patient Count: ' + i2b2.CRC.model.dataSet.active.size + ']</strong>&nbsp;<a href="#" onclick="javascript:i2b2.CRC.ctrlr.dataSet.prsUnload();return false;"><img src="js-i2b2/cells/CRC/assets/rds_delete.png" title="Clear Selection" align="absbottom" border="0"/></a>';
                        $("RequestDataSet-PRSDROP").style.background = "#CFB";
                        // i2b2.CRC.model.dataSet.model.readyToPreview = true;
                        // i2b2.CRC.model.dataSet.model.firstVisit = false;
                }
                i2b2.CRC.ajax.getQueryResultInstanceList_fromQueryInstanceId("Plugin:RequestDataSet", {qi_key_value: i2b2.CRC.model.dataSet.active.query_instance_id}, scopedCallbackQRS);
            }
            i2b2.CRC.ajax.getQueryInstanceList_fromQueryMasterId("Plugin:RequestDataSet", {qm_key_value: query_master_id}, scopedCallbackQI);


        }
        i2b2.CRC.ajax.getRequestXml_fromQueryMasterId("Plugin:RequestDataSet", {qm_key_value: query_master_id}, scopedCallback);
    };


    this.prsDropped = function (sdxData) {
        sdxData = sdxData[0];	// only interested in first record
        // save the info to our local data model
        i2b2.CRC.model.dataSet.model.prsRecord = sdxData;
        // let the user know that the drop was successful by displaying the name of the patient set
        $("RequestDataSet-PRSDROP").innerHTML = i2b2.h.Escape(sdxData.sdxInfo.sdxDisplayName);
        // temporarly change background color to give GUI feedback of a successful drop occuring
        $("RequestDataSet-PRSDROP").style.background = "#CFB";
        setTimeout("$('RequestDataSet-PRSDROP').style.background='#DEEBEF'", 250);
        // optimization to prevent requerying the hive for new results if the input dataset has not changed
        i2b2.CRC.model.dataSet.model.dirtyResultsData = true;
    };


    this.loadQueryConcepts = function (qm_id) {
        //for (var i = 0; i < i2b2.CRC.model.dataSet.model.concepts.length; i++)
        //{
        //    this.conceptDelete(i);
        //}
        if (!document.getElementById('RequestDataSet-AppendConcepts').checked) {
            i2b2.CRC.model.dataSet.model.concepts = []
        }
        i2b2.CRC.ctrlr.dataSet.conceptsRender();
        ////
        // callback processor
        var scopedCallback = new i2b2_scopedCallback();
        scopedCallback.scope = this;
        scopedCallback.callback = function (results) {
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
            if (qd.length != 0) {
                var dObj = {};
                dObj.name = i2b2.h.getXNodeVal(results.refXML, 'name');
                dObj.timing = i2b2.h.XPath(qd[0], 'descendant-or-self::query_timing/text()');
                dObj.timing = dObj.timing[0].nodeValue;
                dObj.specificity = i2b2.h.getXNodeVal(qd[0], 'specificity_scale');
                var sqc = i2b2.h.XPath(qd[0], 'subquery_constraint');
                for (var j = 0; j < qd.length; j++) {
                    dObj.panels = [];
                    if (j == 0)
                        var qp = i2b2.h.XPath(qd[j], 'panel');
                    else
                        var qp = i2b2.h.XPath(qd[j], 'descendant::panel');
                    var total_panels = qp.length;
                    for (var i1 = 0; i1 < total_panels; i1++) {
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
                        for (i2 = 0; i2 < pi.length; i2++) {
                            var item = {};
                            // get the item's details from the ONT Cell
                            var ckey = i2b2.h.getXNodeVal(pi[i2], 'item_key');
                            // Determine what item this is
                            if (ckey.startsWith("query_master_id")) {
                                var o = new Object;
                                o.name = i2b2.h.getXNodeVal(pi[i2], 'item_name');
                                o.id = ckey.substring(16);
                                o.result_instance_id = o.PRS_id;
                                var sdxDataNode = i2b2.sdx.Master.EncapsulateData('QM', o);
                                po.items.push(sdxDataNode);
                            }
                            else if (ckey.startsWith("masterid")) {
                                var o = new Object;
                                o.name = i2b2.h.getXNodeVal(pi[i2], 'item_name');
                                o.id = ckey;
                                o.result_instance_id = o.PRS_id;
                                var sdxDataNode = i2b2.sdx.Master.EncapsulateData('QM', o);
                                po.items.push(sdxDataNode);
                            }
                            else if (ckey.startsWith("patient_set_coll_id")) {
                                var o = new Object;
                                o.titleCRC = i2b2.h.getXNodeVal(pi[i2], 'item_name');
                                o.PRS_id = ckey.substring(20);
                                o.result_instance_id = o.PRS_id;
                                var sdxDataNode = i2b2.sdx.Master.EncapsulateData('PRS', o);
                                po.items.push(sdxDataNode);
                            }
                            else if (ckey.startsWith("patient_set_enc_id")) {
                                var o = new Object;
                                o.titleCRC = i2b2.h.getXNodeVal(pi[i2], 'item_name');
                                o.PRS_id = ckey.substring(19);
                                o.result_instance_id = o.PRS_id;
                                var sdxDataNode = i2b2.sdx.Master.EncapsulateData('ENS', o);
                                po.items.push(sdxDataNode);
                            }
                            else {
                                // WE MUST QUERY THE ONT CELL TO BE ABLE TO DISPLAY THE TREE STRUCTURE CORRECTLY
                                var o = new Object;
                                o.level = i2b2.h.getXNodeVal(pi[i2], 'hlevel');
                                o.name = i2b2.h.getXNodeVal(pi[i2], 'item_name');
                                o.tooltip = i2b2.h.getXNodeVal(pi[i2], 'tooltip');
                                // nw096 - If string starts with path \\, lookup path in Ontology cell
                                if (o.name.slice(0, 2) == '\\\\') {
                                    var results = i2b2.ONT.ajax.GetTermInfo("ONT", {
                                        ont_max_records: 'max="1"',
                                        ont_synonym_records: 'false',
                                        ont_hidden_records: 'false',
                                        concept_key_value: o.name
                                    }).parse();
                                    if (results.model.length > 0) {
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
                                if ((lvd.length > 0) /*&& (i2b2.h.XPath(pi[i2], 'descendant::constrain_by_modifier').length == 0)*/) {
                                    lvd = lvd[0];
                                    //Get term info for genotype data to populate labvalues well
                                    o.LabValues = i2b2.CRC.view.modLabvaluesCtlr.processLabValuesForQryLoad(lvd);
                                }
                                // sdx encapsulate
                                var sdxDataNode = i2b2.sdx.Master.EncapsulateData('CONCPT', o);

                                // Date processing - 2.0 (handle constrain_by_date)
                                var cbd = i2b2.h.XPath(pi[i2], 'descendant::constrain_by_date');
                                if (cbd.length > 0) {
                                    cbd = cbd[0];
                                    var df = i2b2.h.getXNodeVal(cbd, "date_from");
                                    if (df) {
                                        sdxDataNode.dateFrom = {};
                                        sdxDataNode.dateFrom.Year = df.substring(0, 4); //t[0];
                                        sdxDataNode.dateFrom.Month = df.substring(5, 7); //t[1];
                                        sdxDataNode.dateFrom.Day = df.substring(8, 10); //t[2];
                                    }
                                    else {
                                        sdxDataNode.dateFrom = false;
                                    }
                                    var dt = i2b2.h.getXNodeVal(cbd, "date_to");
                                    if (dt) {
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
                                switch (o.hasChildren) {
                                    case "FA":
                                        sdxDataNode.renderData = {icon: 'js-i2b2/cells/ONT/assets/sdx_ONT_CONCPT_branch.gif'};
                                        break;
                                    case "LA":
                                        sdxDataNode.renderData = {icon: 'js-i2b2/cells/ONT/assets/sdx_ONT_CONCPT_leaf.gif'};
                                        break;
                                    case "FAE":
                                        sdxDataNode.renderData = {icon: 'js-i2b2/cells/ONT/assets/sdx_ONT_CONCPT_branch-exp.gif'};
                                        break;
                                    default:
                                        sdxDataNode.renderData = {icon: 'js-i2b2/cells/ONT/assets/sdx_ONT_CONCPT_leaf.gif'};
                                }

                                if (o.LabValues) {
                                    // We do want 2 copies of the Lab Values: one is original from server while the other one is for user manipulation
                                    sdxDataNode.LabValues = o.LabValues;
                                }
                                //			    o.xmlOrig = c;
                                if (i2b2.h.XPath(pi[i2], 'descendant::constrain_by_modifier').length > 0) {
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
                                    if (lvd.length > 0) {
                                        lvd = lvd[0];
                                        o.ModValues = i2b2.CRC.view.modLabvaluesCtlr.processModValuesForQryLoad(lvd);
                                    }
                                    if (o.ModValues) {
                                        // We do want 2 copies of the Lab Values: one is original from server while the other one is for user manipulation
                                        sdxDataNode.ModValues = o.ModValues;
                                    }
                                }
                                //			    po.items.push(sdxDataNode);

                                //			    this.nich = sdxDataNode;

                                /*			    i2b2.CRC.model.dataSet.model.concepts.push(sdxDataNode);
                                 var cdetails = i2b2.ONT.ajax.GetTermInfo("CRC:QueryTool", {concept_key_value:sdxDataNode.origData.key, ont_synonym_records: true, ont_hidden_records: true} );
                                 var c = i2b2.h.XPath(cdetails.refXML, 'descendant::concept');
                                 if (c.length > 0)
                                 { sdxDataNode.origData.xmlOrig = c[0]; }

                                 i2b2.CRC.ctrlr.dataSet.conceptsRender();
                                 i2b2.CRC.model.dataSet.model.dirtyResultsData = true;
                                 */
                                this.conceptAutoDropped(sdxDataNode);
                                //			    this.conceptDropped(sdxDataNode);
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
        i2b2.CRC.ajax.getRequestXml_fromQueryMasterId("Plugin:RequestDataSet", {qm_key_value: qm_id}, scopedCallback);
    };


    this.conceptAutoDropped = function (sdxData) {
        if (sdxData.origData.isModifier) {
            alert("Modifier item being dropped is not yet supported.");
            return false;
        }
        var conceptObj = {};
        conceptObj.sdxData = sdxData;


        conceptObj.valueRestriction = sdxData.LabValues;              // save Lab Value
        conceptObj.dateFrom = sdxData.dateFrom;
        conceptObj.dateTo = sdxData.dateTo;

        // Default value for data option is EXISTENCE. Attach dataOption and formatter to the newly added concept
        conceptObj.dataOption = i2b2.CRC.model.dataSet.cellDataOption.DEFAULT;
        //conceptObj.formatter = this.cellFormatter.defaultFormatter;


        var cdetails = i2b2.ONT.ajax.GetTermInfo("CRC:DownloaderPlugin", {
            concept_key_value: sdxData.origData.key,
            ont_synonym_records: true,
            ont_hidden_records: true
        });
        var c = i2b2.h.XPath(cdetails.refXML, 'descendant::concept');
        if (c.length > 0) {
            sdxData.origData.xmlOrig = c[0];
        }

        cdetails.parse();
        if (cdetails.model.length > 0) {
            //	this.nich3 = cdetails.model[0];
            sdxData.origData.basecode = cdetails.model[0].origData.basecode;
            sdxData.origData.fact_table_column = cdetails.model[0].origData.fact_table_column;
            sdxData.origData.table_name = cdetails.model[0].origData.table_name;
            sdxData.origData.column_name = cdetails.model[0].origData.column_name;
            sdxData.origData.operator = cdetails.model[0].origData.operator;
            sdxData.origData.dim_code = cdetails.model[0].origData.dim_code;
        }

        //BG changes for new value chooser
        if (sdxData.LabValues)
            conceptObj.LabValues = sdxData.LabValues;

        //Parse the concept more if possible
        try {
            var dataType = i2b2.h.getXNodeVal(sdxData.origData.xmlOrig, 'DataType');
            var valueType = i2b2.CRC.view.modLabvaluesCtlr.getValueType(dataType);
            if (dataType && valueType)  //Handle Genotype concept
            {
                var updatedLabValues = i2b2.CRC.view[valueType].parseLabValues(conceptObj.LabValues, dataType);
                if (updatedLabValues)
                    conceptObj.LabValues = updatedLabValues;
            }
        }
        catch (e) {
            console.error(e);
        }

        // save the info to our local data model
        i2b2.CRC.model.dataSet.model.concepts.push(conceptObj);
        //End BG changes

        var sdxDataNode = i2b2.sdx.Master.EncapsulateData('CONCPT', sdxData.origData);

        // sort and display the concept list
        i2b2.CRC.ctrlr.dataSet.conceptsRender();
        // optimization to prevent requerying the hive for new results if the input dataset has not changed

        $("RequestDataSet-CONCPTDROP").innerHTML = '<div class="concptItem"><img src="js-i2b2/cells/CRC/assets/rds_pointer.png" align="absbottom" style="margin-left:5px;" /> Drag &amp; Drop additional concepts here from <em>Navigate Terms</em> or a <em>Previous Query</em></div>';

        i2b2.CRC.model.dataSet.model.dirtyResultsData = true;
    };

    this.conceptDropped = function (sdxData, showDialog) {

        sdxData = sdxData[0];	// only interested in first record
        try {
            var conceptKey = sdxData.sdxInfo.sdxKeyValue;
            if (conceptKey && conceptKey.indexOf("\\\\i2b2metadata\\i2b2metadata\\Demographics\\Zip codes-trunc\\") >= 0) {
                alert("Download of city, state or zipcode is not supported at this time.");
                return;
            }
        }
        catch (e) {
            console(e);
        }
        if (sdxData.origData.isModifier) {
            var cdetails = i2b2.ONT.ajax.GetModifierInfo("CRC:QueryTool", {
                modifier_applied_path: sdxData.origData.applied_path,
                modifier_key_value: sdxData.origData.key,
                ont_synonym_records: true,
                ont_hidden_records: true
            });
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
            if (sdxData.origData.table_name.toLowerCase() == "visit_dimension") {
                alert('Visit Dimension Concepts are not supported at this time.');
                return false;
            }
            var cdetails = i2b2.ONT.ajax.GetTermInfo("CRC:DownloaderPlugin", {
                concept_key_value: sdxData.origData.key,
                ont_synonym_records: true,
                ont_hidden_records: true
            });
            var c = i2b2.h.XPath(cdetails.refXML, 'descendant::concept');
            if (c.length > 0)
                sdxData.origData.xmlOrig = c[0];
        }

        // Create a concept 'object' to contain the sdxData and concept options.
        var conceptObj = {};
        conceptObj.sdxData = sdxData;
        // Default value for data option is EXISTENCE. Attach dataOption and formatter to the newly added concept
        conceptObj.dataOption = i2b2.CRC.model.dataSet.cellDataOption.DEFAULT;
        //conceptObj.formatter  = this.cellFormatter.defaultFormatter;
        // save the concept object to our local data model
        i2b2.CRC.model.dataSet.model.concepts.push(conceptObj);

        this.lastDroppedTerm = conceptObj;     // remember the last Concept that is dropped

        // check to see if the new concept usese value retrictions (whether as a normal concept or a modifier)
        var lvMetaDatas1 = i2b2.h.XPath(sdxData.origData.xmlOrig, 'metadataxml/ValueMetadata[string-length(Version)>0]');
        //var lvMetaDatau1 = i2b2.h.XPath(sdxData.origData.xmlOrig, 'metadataxml/ValueMetadata/UnitValues/NormalUnits/text()');

        //if ((lvMetaDatas1.length > 0) && (i2b2.CRC.model.dataSet.model.showMetadataDialog) && (lvMetaDatau1.length > 0))
        if ((lvMetaDatas1.length > 0) && (i2b2.CRC.model.dataSet.model.showMetadataDialog)) {
            //bring up popup for concepts with value restrictions
            //Change for new value chooser architecture by BG
            // this.view.modalLabValues.show(this, sdxData.origData.key, conceptObj, sdxData.origData.isModifier);
            this.currentTerm = conceptObj;     // remember the last Concept that is dropped
            i2b2.CRC.view.modLabvaluesCtlr.selectValueBox(0, null, sdxData.origData.key, sdxData, false, i2b2.CRC.ctrlr.dataSet);
        }
        else {
            // sort and display the concept list
            i2b2.CRC.ctrlr.dataSet.conceptsRender();

        }
        // optimization to prevent requerying the hive for new results if the input dataset has not changed
        i2b2.CRC.model.dataSet.model.dirtyResultsData = true;
        i2b2.CRC.model.dataSet.model.readyToPreview = true;
    };

    this.conceptDelete = function (concptIndex) {
        // remove the selected concept
        i2b2.CRC.model.dataSet.model.concepts.splice(concptIndex, 1);
        // sort and display the concept list
        i2b2.CRC.ctrlr.dataSet.conceptsRender();
        // optimization to prevent requerying the hive for new results if the input dataset has not changed
        i2b2.CRC.model.dataSet.model.dirtyResultsData = true;
    };

    this.Resize = function () {
        z = $('anaPluginViewFrame').getHeight() - 40; //- 34;  //BG vertical scrollbar display issues
        //BG tabs being out of sight issue
        var viewportOffset1 = $('anaPluginViewFrame').getBoundingClientRect();
        var viewportOffset2 = $('RequestDataSet-mainDiv').getBoundingClientRect();
        if ((viewportOffset1 && viewportOffset2) && (viewportOffset1.top > viewportOffset2.top)) {
            var parentDiv = jQuery('#anaPluginViewFrame');
            var childDiv = jQuery('#RequestDataSet-mainDiv');
            parentDiv.scrollTop(parentDiv.scrollTop() + childDiv.position().top - 5);
        }
        //End BG tabs being out of sight issue
        //	try { this.yuiPanel.destroy(); } catch(e) {}
    };

    this.wasHidden = function () {
        try {
            this.yuiPanel.destroy();
        } catch (e) {
        }
    };


    this.removeRequired = function (req_key) {
        i2b2.CRC.model.dataSet.model.dirtyResultsData = true;
        i2b2.CRC.model.dataSet.model.readyToPreview = true;
        if (document.getElementById("chk_" + req_key).checked) {
            i2b2.CRC.model.dataSet.model.required[req_key].display = true;
        } else {
            i2b2.CRC.model.dataSet.model.required[req_key].display = false;
        }

    };

    this.editConcept = function (conceptIndex) {
        //Change for new value chooser architecture by BG
        // this.view.modalLabValues.show(this, i2b2.CRC.model.dataSet.model.concepts[conceptIndex].sdxData.origData.key,
        // i2b2.CRC.model.dataSet.model.concepts[conceptIndex],
        // i2b2.CRC.model.dataSet.model.concepts[conceptIndex].sdxData.origData.isModifier);
        var conceptObj = i2b2.CRC.model.dataSet.model.concepts[conceptIndex];
        this.currentTerm = conceptObj;     // remember the last Concept that is dropped
        i2b2.CRC.view.modLabvaluesCtlr.selectValueBox(0, null, i2b2.CRC.model.dataSet.model.concepts[conceptIndex].sdxData.origData.key,
            i2b2.CRC.model.dataSet.model.concepts[conceptIndex].sdxData, false, i2b2.CRC.ctrlr.dataSet);
    };

    this.getValueType = function (xmlOrig) {
        var returnValues = {};
        returnValues.valueMetadataNodes = i2b2.h.XPath(xmlOrig, 'metadataxml/ValueMetadata[string-length(Version)>0]');
        if (returnValues.valueMetadataNodes.length > 0) {
            // check to see if the dropped concept uses numeric, enum, or blob values.
            var dataTypeArray = i2b2.h.XPath(returnValues.valueMetadataNodes[0], 'DataType');
            if (dataTypeArray.length > 0) {
                var dataType = jQuery(dataTypeArray[0]).text().toLowerCase();
                if ((dataType == "posinteger") || (dataType == "integer") || (dataType == "posfloat") || (dataType == "float"))
                    returnValues.valueType = this.valueType.NUMERIC;
                else if (dataType == "enum")
                    returnValues.valueType = this.valueType.ENUM;
                else if (dataType == "largestring")
                    returnValues.valueType = this.valueType.BLOB;
                else
                    returnValues.valueType = this.valueType.UNKNOWN; // no known type, it's a bug if UNKNOWN is returned.
                return returnValues;
            }
        }
        return null; // No Value Metadata
    };

    this.spanifyInactiveValueConstraint = function () {
        return "<span class=\"valueConstraint_Inactive\">[Set Value Constraint]</span>"; // uses no value constraint
    };

    this.spanifyValueConstraint = function (name, conceptIndex) {
        return "[<a class =\"valueConstraint\" href=\"JavaScript:this.editConcept(" + conceptIndex + ");\">" + name + "</a>]";
    };


    /* pass in a values object and this function returns text representation */
    this.makeValueText = function (values) {
        var tt = "";
        if (undefined != values) {
            switch (values.MatchBy) {
                case "FLAG":
                    tt = ' = ' + i2b2.h.Escape(values.ValueFlag);
                    break;
                case "VALUE":
                    if (values.GeneralValueType == "ENUM") {
                        var sEnum = [];
                        for (var i2 = 0; i2 < values.ValueEnum.length; i2++)
                            sEnum.push(i2b2.h.Escape(values.ValueEnum[i2]));
                        sEnum = sEnum.join("\", \"");
                        sEnum = ' =  ("' + sEnum + '")';
                        tt = sEnum;
                    }
                    else if ((values.GeneralValueType == "LARGESTRING") || (values.GeneralValueType == "TEXT")) {
                        tt = 'contains "' + i2b2.h.Escape(values.ValueString) + '"';
                    }
                    else if (values.GeneralValueType == "STRING") {
                        if (values.StringOp == undefined)
                            var stringOp = "";
                        else {
                            switch (values.StringOp) {
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
                        if (values.searchByRsId) {
                            var containsText = values.ValueString + ((values.Zygosity && values.Zygosity != '') ? (" AND " + values.Zygosity) : "") + ((values.Allele && values.Allele != '') ? (" AND " + values.Allele) : "") + ((values.Consequence && values.Consequence != '') ? (" AND " + values.Consequence) : "");
                        }
                        if (values.searchByGeneName) {
                            var containsText = values.ValueString + ((values.Zygosity && values.Zygosity != '') ? (" AND " + values.Zygosity) : "") + ((values.Consequence && values.Consequence != '') ? (" AND " + values.Consequence) : "");
                        }
                        tt = 'contains "' + containsText + '"';
                    }
                    else { // numeric value
                        var unit = "";
                        if (!Object.isUndefined(values.UnitsCtrl))
                            unit = values.UnitsCtrl;
                        if (values.NumericOp == 'BETWEEN')
                            tt = i2b2.h.Escape(values.ValueLow) + ' - ' + i2b2.h.Escape(values.ValueHigh);
                        else {
                            switch (values.NumericOp) {
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
    this.makeValueConstraintInnerHTML = function (valueInfo, values, conceptIndex) {
        var valueText = "";
        if (!valueInfo)
            return '';
        valueText = this.makeValueText(values);
        if (valueText === "")
            valueText = "Set Value"; // empty constraint

        valueHTML = "<img align=\"absbottom\" style=\"margin-left:10px;\" src=\"js-i2b2/cells/CRC/assets/rds_value.png\" border=\"0\"/> [<a data-tooltip=\"This concept can be constrained by a specific value\" class=\"valueConstraint\" href=\"JavaScript:this.editConcept(" + conceptIndex + ");\">" + valueText + "</a>]";
        return valueHTML;
    };

    this.makeValueConstraintText = function (valueInfo, values) {
        var valueText = "";
        if (!valueInfo)
            return "";
        valueText = this.makeValueText(values);
        if (valueText === "")
            return "";

        valueText = " [" + valueText + "]";
        return valueText;
    };

    this.sanitizeConcepts = function () {  //works for genotype and ppv concepts
        for (var i1 = 0; i1 < i2b2.CRC.model.dataSet.model.concepts.length; i1++) {
            // Check if GENOTYPE value has constraint. If not, remove it
            // if(i2b2.CRC.model.dataSet.model.concepts[i1].sdxData.origData.key.indexOf('Biobank Genomics\\Gene\\') > -1 || i2b2.CRC.model.dataSet.model.concepts[i1].sdxData.origData.key.indexOf('Biobank Genomics\\dbSNP rs Identifier\\') > -1){
            if (!i2b2.CRC.model.dataSet.model.concepts[i1].hasOwnProperty('valueRestriction')) {
                i2b2.CRC.ctrlr.dataSet.conceptDelete(i1);
            }
            // }
        }
    };

    this.modifyConceptList = function () {
        this.sanitizeConcepts();
    };

    this.conceptsRenderFromValueBox = function () {
        this.currentTerm.valueRestriction = this.currentTerm.LabValues;
        i2b2.CRC.model.dataSet.model.dirtyResultsData = true;
        // update the panel/query tool GUI
        i2b2.CRC.ctrlr.dataSet.conceptsRender(); //update GUI
    };

    this.conceptsRender = function () {
        var s = '<table style="width:98%;margin-top:15px;"><tr><td style="font-size:14px;padding:10px;background:#5FA9BE;color:#FFF;font-weight:bold;text-shadow:none;">Concept</td><td style="font-size:14px;padding:10px;background:#5FA9BE;color:#FFF;font-weight:bold;text-shadow:none;">Constraints</td><td style="font-size:14px;padding:10px;background:#5FA9BE;color:#FFF;font-weight:bold;text-shadow:none;">Aggregation Option</td><td style="font-size:14px;padding:10px;background:#5FA9BE;color:#FFF;font-weight:bold;text-shadow:none;">Include In Request</td></tr>'; // innerHTML for concept list
        var t = ''; // innerHTML for concpet config
        // are there any concepts in the list

        for (var key in i2b2.CRC.model.dataSet.model.required) {
            if (i2b2.CRC.model.dataSet.model.required.hasOwnProperty(key)) {
                s += "<tr><td><img align=\"absbottom\" style=\"margin-left:5px;\" src=\"js-i2b2/cells/CRC/assets/rds_demographic.png\" border=\"0\"> " + i2b2.CRC.model.dataSet.model.required[key].name + "</td><td></td><td>";
                s += "<select class=\"conceptConfigSelect\"> <option value=\"value\">Value</option></select> <a href='#' onclick='return false;' data-tooltip='Value of Default Column'><img style='margin-bottom:-3px;' src='js-i2b2/cells/CRC/assets/rds_tooltip.png'/></a>";
                s += "</td><td><input type=\"checkbox\" id=\"chk_" + key + "\"";
                if (i2b2.CRC.model.dataSet.model.required[key].display) {
                    s += " checked=\"checked\"";
                }
                s += " onchange=\"javascript:this.removeRequired('" + key + "');\"></td></tr>";
            }
        }


        if (i2b2.CRC.model.dataSet.model.concepts.length > 0) {
            jQuery("#RequestDataSet-CONCPTCONFIG").show();      // display concept configuration table
            i2b2.CRC.model.dataSet.model.concepts.sort(function () // sort the concepts in alphabetical order
            {
                return arguments[0].sdxData.sdxInfo.sdxDisplayName > arguments[1].sdxData.sdxInfo.sdxDisplayName
            });
            // draw the list of concepts
            for (var i1 = 0; i1 < i2b2.CRC.model.dataSet.model.concepts.length; i1++) {

                if (i1 > 0) {
                    s += '<div class="concptDiv"></div>'; // create horizontal divider between concepts, starting with the 1st concept
                    t += '<div class="concptDiv"></div>';
                }
                valueHTML = "";
                valueText = "";
                tt = this.spanifyInactiveValueConstraint('[Set Value Constraint]');
                // get an appropriate path for the ontology term's icon
                var conceptIconPath = undefined;
                if (i2b2.CRC.model.dataSet.model.concepts[i1].sdxData.renderData) // this is a concept from ONTOLOGY
                    conceptIconPath = i2b2.CRC.model.dataSet.model.concepts[i1].sdxData.renderData.icon;
                else                                                                        // this is a concept from WORKPLACE
                    conceptIconPath = i2b2.CRC.model.dataSet.model.concepts[i1].sdxData.iconExp;
                var modInfo = null;
                var modValues = null;
                var valueInfo = null;
                var values = null;
                if (i2b2.CRC.model.dataSet.model.concepts[i1].sdxData.origData.isModifier) {
                    //modInfo = this.getValueType(i2b2.CRC.model.dataSet.model.concepts[i1].sdxData.origData.xmlOrig); // this gets the modifier's value metadata
                    //modValues = this.retrieveValueConstraint(i0, i1);
                }
                else {
                    // gather value metadata information: valueInfo.valueType (NUMERIC, ENUM, BLOB) and valueInfo.valueMetadataNodes (actual XML nodes)
                    valueInfo = this.getValueType(i2b2.CRC.model.dataSet.model.concepts[i1].sdxData.origData.xmlOrig);
                    // now we obtain the actual Value Constraint (if any) associated with the concept
                    values = this.retrieveValueConstraint(i1);


                    // create HTML for the value constraint
                    valueHTML = this.makeValueConstraintInnerHTML(valueInfo, values, i1);
                    valueText = this.makeValueConstraintText(valueInfo, values);
                }

                //	values = i2b2.CRC.model.dataSet.model.concepts[i1].sdxData.LabValues;

                var textDisplay = i2b2.h.Escape(i2b2.CRC.model.dataSet.model.concepts[i1].sdxData.sdxInfo.sdxDisplayName);
                if (i2b2.CRC.model.dataSet.model.concepts[i1].sdxData.origData.isModifier)
                    if (valueHTML === "")
                        textDisplay = i2b2.h.Escape(i2b2.CRC.model.dataSet.model.concepts[i1].sdxData.sdxInfo.sdxDisplayName) + " [" + i2b2.h.Escape(i2b2.CRC.model.dataSet.model.concepts[i1].sdxData.origData.name) + "]";
                    else
                        textDisplay = i2b2.h.Escape(i2b2.CRC.model.dataSet.model.concepts[i1].sdxData.sdxInfo.sdxDisplayName) + " [" + i2b2.h.Escape(i2b2.CRC.model.dataSet.model.concepts[i1].sdxData.origData.name) + tt + "]";
                else
                    textDisplay = i2b2.h.Escape(i2b2.CRC.model.dataSet.model.concepts[i1].sdxData.sdxInfo.sdxDisplayName);
                i2b2.CRC.model.dataSet.model.concepts[i1].textDisplay = textDisplay.replace(/,/g, "-") + valueText; // save the text display back to the conceptObj data structure so the table can display it correctly
                i2b2.CRC.model.dataSet.model.concepts[i1].panel = i1;

                var dateText = this.makeDateRangeConstraintInnerHTML(i1);
                s += "<tr><td><img align=\"absbottom\" style=\"margin-left:5px;\" src=\"" + conceptIconPath + "\" border=\"0\"> " + textDisplay + "</td><td style=\"color:#575757\">" + dateText + valueHTML + "</td><td>";

                // if a [patient_dimension] concept, only allow EXISTENCE and COUNT (to-do)
                if (i2b2.CRC.model.dataSet.model.concepts[i1].sdxData.origData.table_name.toLowerCase() === 'patient_dimension') {
                    s += "<select onchange=\"i2b2.CRC.ctrlr.dataSet.setTooltip(" + i1 + ");\" id=\"" + this.columnDisplaySelectID + i1 + "\" class=\"conceptConfigSelect\">\n" +
                        "<option value=\"" + i2b2.CRC.model.dataSet.cellDataOption.DEFAULT + "\">" + i2b2.CRC.model.dataSet.cellDataOption.DEFAULT + "</option>\n" +
                        "<option value=\"" + i2b2.CRC.model.dataSet.cellDataOption.ALLVALUES + "\">Value</option>\n" +
                        "</select> <a id='tooltip" + i1 + "' href='#' onclick='return false;' data-tooltip='Any existence of the observation will show Yes'><img style='margin-bottom:-3px;' src='js-i2b2/cells/CRC/assets/rds_tooltip.png'/></a>";
                    //s += "<select id=\"" + this.columnDisplaySelectID + i1 + "\" class=\"conceptConfigSelect\"> <option value=\"" + i2b2.CRC.model.dataSet.cellDataOption.DEFAULT + "\">Yes/No</option></select>";
                }
                else { // [concept_dimension] or [modifier_dimension]

                    if ((i2b2.CRC.model.dataSet.model.concepts[i1].sdxData.origData.table_name.toLowerCase() === 'concept_dimension') &&
                        (valueInfo && (valueInfo.valueType !== this.valueType.MIXED))) {
                        if (valueInfo.valueType === this.valueType.NUMERIC) {
                            s += "<select onchange=\"i2b2.CRC.ctrlr.dataSet.setTooltip(" + i1 + ");\" id=\"" + this.columnDisplaySelectID + i1 + "\" class=\"conceptConfigSelect\">\n" +
                                "<option value=\"" + i2b2.CRC.model.dataSet.cellDataOption.DEFAULT + "\">" + i2b2.CRC.model.dataSet.cellDataOption.DEFAULT + "</option>\n" +
                                "<option value=\"" + i2b2.CRC.model.dataSet.cellDataOption.ALLVALUES + "\">" + i2b2.CRC.model.dataSet.cellDataOption.ALLVALUES + "</option>\n" +
                                "<option value=\"" + i2b2.CRC.model.dataSet.cellDataOption.MODE + "\">" + i2b2.CRC.model.dataSet.cellDataOption.MODE + "</option>\n" +
                                "<option value=\"" + i2b2.CRC.model.dataSet.cellDataOption.MIN + "\">" + i2b2.CRC.model.dataSet.cellDataOption.MIN + "</option>\n" +
                                "<option value=\"" + i2b2.CRC.model.dataSet.cellDataOption.MAX + "\">" + i2b2.CRC.model.dataSet.cellDataOption.MAX + "</option>\n" +
                                "<option value=\"" + i2b2.CRC.model.dataSet.cellDataOption.AVERAGE + "\">" + i2b2.CRC.model.dataSet.cellDataOption.AVERAGE + "</option>\n" +
                                "<option value=\"" + i2b2.CRC.model.dataSet.cellDataOption.MEDIAN + "\">" + i2b2.CRC.model.dataSet.cellDataOption.MEDIAN + "</option>\n" +
                                "<option value=\"" + i2b2.CRC.model.dataSet.cellDataOption.FIRST + "\">" + i2b2.CRC.model.dataSet.cellDataOption.FIRST + "</option>\n" +
                                "<option value=\"" + i2b2.CRC.model.dataSet.cellDataOption.LAST + "\">" + i2b2.CRC.model.dataSet.cellDataOption.LAST + "</option>\n" +
                                "<option value=\"" + i2b2.CRC.model.dataSet.cellDataOption.COUNT + "\">" + i2b2.CRC.model.dataSet.cellDataOption.COUNT + "</option>\n" +
                                "<option value=\"" + i2b2.CRC.model.dataSet.cellDataOption.ALLCONCEPTTEXT + "\">" + i2b2.CRC.model.dataSet.cellDataOption.ALLCONCEPTTEXT + "</option>\n" +
                                "<option value=\"" + i2b2.CRC.model.dataSet.cellDataOption.MODECONCEPTTEXT + "\">" + i2b2.CRC.model.dataSet.cellDataOption.MODECONCEPTTEXT + "</option>n" +
                                "<option value=\"" + i2b2.CRC.model.dataSet.cellDataOption.ALLCONCEPTCODE + "\">" + i2b2.CRC.model.dataSet.cellDataOption.ALLCONCEPTCODE + "</option>\n" +
                                "<option value=\"" + i2b2.CRC.model.dataSet.cellDataOption.MODECONCEPTCODE + "\">" + i2b2.CRC.model.dataSet.cellDataOption.MODECONCEPTCODE + "</option>\n" +
                                "</select> <a id='tooltip" + i1 + "' href='#' onclick='return false;' data-tooltip='Any existence of the observation'><img style='margin-bottom:-3px;' src='js-i2b2/cells/CRC/assets/rds_tooltip.png'/></a>";
                        } else {
                            s += "<select onchange=\"i2b2.CRC.ctrlr.dataSet.setTooltip(" + i1 + ");\" id=\"" + this.columnDisplaySelectID + i1 + "\" class=\"conceptConfigSelect\">\n" +
                                "<option value=\"" + i2b2.CRC.model.dataSet.cellDataOption.DEFAULT + "\">" + i2b2.CRC.model.dataSet.cellDataOption.DEFAULT + "</option>\n" +
                                "<option value=\"" + i2b2.CRC.model.dataSet.cellDataOption.ALLVALUES + "\">" + i2b2.CRC.model.dataSet.cellDataOption.ALLVALUES + "</option>\n" +
                                "<option value=\"" + i2b2.CRC.model.dataSet.cellDataOption.MODE + "\">" + i2b2.CRC.model.dataSet.cellDataOption.MODE + "</option>\n" +
                                "<option value=\"" + i2b2.CRC.model.dataSet.cellDataOption.FIRST + "\">" + i2b2.CRC.model.dataSet.cellDataOption.FIRST + "</option>\n" +
                                "<option value=\"" + i2b2.CRC.model.dataSet.cellDataOption.LAST + "\">" + i2b2.CRC.model.dataSet.cellDataOption.LAST + "</option>\n" +
                                "<option value=\"" + i2b2.CRC.model.dataSet.cellDataOption.COUNT + "\">" + i2b2.CRC.model.dataSet.cellDataOption.COUNT + "</option>\n" +
                                "<option value=\"" + i2b2.CRC.model.dataSet.cellDataOption.ALLCONCEPTTEXT + "\">" + i2b2.CRC.model.dataSet.cellDataOption.ALLCONCEPTTEXT + "</option>\n" +
                                "<option value=\"" + i2b2.CRC.model.dataSet.cellDataOption.MODECONCEPTTEXT + "\">" + i2b2.CRC.model.dataSet.cellDataOption.MODECONCEPTTEXT + "</option>n" +
                                "<option value=\"" + i2b2.CRC.model.dataSet.cellDataOption.ALLCONCEPTCODE + "\">" + i2b2.CRC.model.dataSet.cellDataOption.ALLCONCEPTCODE + "</option>\n" +
                                "<option value=\"" + i2b2.CRC.model.dataSet.cellDataOption.MODECONCEPTCODE + "\">" + i2b2.CRC.model.dataSet.cellDataOption.MODECONCEPTCODE + "</option>\n" +
                                "</select> <a id='tooltip" + i1 + "' href='#' onclick='return false;' data-tooltip='Any existence of the observation'><img style='margin-bottom:-3px;' src='js-i2b2/cells/CRC/assets/rds_tooltip.png'/></a>";
                        }
                    }
                    else { // no values
                        s += "<select onchange=\"i2b2.CRC.ctrlr.dataSet.setTooltip(" + i1 + ");\" id=\"" + this.columnDisplaySelectID + i1 + "\" class=\"conceptConfigSelect\">\n" +
                            "<option value=\"" + i2b2.CRC.model.dataSet.cellDataOption.DEFAULT + "\">" + i2b2.CRC.model.dataSet.cellDataOption.DEFAULT + "</option>\n" +
                            "<option value=\"" + i2b2.CRC.model.dataSet.cellDataOption.FIRST + "\">" + i2b2.CRC.model.dataSet.cellDataOption.FIRST + "</option>\n" +
                            "<option value=\"" + i2b2.CRC.model.dataSet.cellDataOption.LAST + "\">" + i2b2.CRC.model.dataSet.cellDataOption.LAST + "</option>\n" +
                            "<option value=\"" + i2b2.CRC.model.dataSet.cellDataOption.COUNT + "\">" + i2b2.CRC.model.dataSet.cellDataOption.COUNT + "</option>\n" +
                            "<option value=\"" + i2b2.CRC.model.dataSet.cellDataOption.ALLCONCEPTTEXT + "\">" + i2b2.CRC.model.dataSet.cellDataOption.ALLCONCEPTTEXT + "</option>\n" +
                            "<option value=\"" + i2b2.CRC.model.dataSet.cellDataOption.MODECONCEPTTEXT + "\">" + i2b2.CRC.model.dataSet.cellDataOption.MODECONCEPTTEXT + "</option>n" +
                            "<option value=\"" + i2b2.CRC.model.dataSet.cellDataOption.ALLCONCEPTCODE + "\">" + i2b2.CRC.model.dataSet.cellDataOption.ALLCONCEPTCODE + "</option>\n" +
                            "<option value=\"" + i2b2.CRC.model.dataSet.cellDataOption.MODECONCEPTCODE + "\">" + i2b2.CRC.model.dataSet.cellDataOption.MODECONCEPTCODE + "</option>\n" +
                            "</select> <a id='tooltip" + i1 + "' href='#' onclick='return false;' data-tooltip='Any existence of the observation'><img style='margin-bottom:-3px;' src='js-i2b2/cells/CRC/assets/rds_tooltip.png'/></a>";
                    }
                }
                s += "</td><td><a href=\"JavaScript:i2b2.CRC.ctrlr.dataSet.conceptDelete(" + i1 + ");\"><img src=\"js-i2b2/cells/CRC/assets/rds_delete.png\" title=\"Remove this Concept\" align=\"absbottom\" border=\"0\"/></a></td></tr>";
            }
            $("RequestDataSet-CONCPTDROP").style.padding = "0px 0px";     // remove extra vertical padding
            $("RequestDataSet-CONCPTCONFIG").style.padding = "0px 0px";   // remove extra vertical padding
        }
        else // no concepts selected yet
        {
            //s = "<img src=\"js-i2b2/cells/plugins/community/PatientSetDownloader/assets/pointer.png\" align=\"absbottom\" style=\"margin-left:5px;\" /> Drag &amp; Drop one or more <em>Ontology Terms</em> here";
            //s = "";
            //$("PatientSetDownloader-CONCPTDROP").style.padding = "5px 0px";
            //jQuery("#PatientSetDownloader-CONCPTCONFIG").hide(); // hide concept config table
        }
        s += "</table>";

        $("RequestDataSet-CONCEPTS").innerHTML = s;

        // add default values to select elements and bind a handler to listen for change events
        for (var j = 0; j < i2b2.CRC.model.dataSet.model.concepts.length; j++) {
            var select = jQuery("#" + i2b2.CRC.ctrlr.dataSet.columnDisplaySelectID + j);
            if (i2b2.CRC.model.dataSet.model.concepts[j].dataOption) {
                select.val(i2b2.CRC.model.dataSet.model.concepts[j].dataOption);
                this.setTooltip(j);
                this.setDateTooltip(j);
            }
            select.on("change", null, {
                index: j,
                value: select.val()
            }, this.handleConceptConfigItemSelectionChange); // attach listener to handle selection change
        }
    };

    this.showDateRangeConstraintDialog = function (conceptIndex) {
        this.UI.DateConstraint.showDates(conceptIndex);
    };

// construct the innerHTML for the concptItem div to include
    this.makeDateRangeConstraintInnerHTML = function (conceptIndex) {   // date constraints do not make sense for patient dimension concepts
        if (i2b2.CRC.model.dataSet.model.concepts[conceptIndex].sdxData.origData.table_name.toLowerCase() === 'patient_dimension')
            return "";

        var dateText = "";

        if (!i2b2.CRC.model.dataSet.model.concepts[conceptIndex].dateFrom && !i2b2.CRC.model.dataSet.model.concepts[conceptIndex].dateTo) {
            dateText = "Set Date";
        }
        else if (i2b2.CRC.model.dataSet.model.concepts[conceptIndex].dateFrom && !i2b2.CRC.model.dataSet.model.concepts[conceptIndex].dateTo) {
            dateText = "&ge;" + padNumber(i2b2.CRC.model.dataSet.model.concepts[conceptIndex].dateFrom.Month, 2) + "/" + padNumber(i2b2.CRC.model.dataSet.model.concepts[conceptIndex].dateFrom.Day, 2) + "/" + i2b2.CRC.model.dataSet.model.concepts[conceptIndex].dateFrom.Year;
        }
        else if (!i2b2.CRC.model.dataSet.model.concepts[conceptIndex].dateFrom && i2b2.CRC.model.dataSet.model.concepts[conceptIndex].dateTo) {
            dateText = "&le;" + padNumber(i2b2.CRC.model.dataSet.model.concepts[conceptIndex].dateTo.Month, 2) + "/" + padNumber(i2b2.CRC.model.dataSet.model.concepts[conceptIndex].dateTo.Day, 2) + "/" + i2b2.CRC.model.dataSet.model.concepts[conceptIndex].dateTo.Year;
        }
        else {
            dateText = padNumber(i2b2.CRC.model.dataSet.model.concepts[conceptIndex].dateFrom.Month, 2) + "/" + padNumber(i2b2.CRC.model.dataSet.model.concepts[conceptIndex].dateFrom.Day, 2) + "/" + i2b2.CRC.model.dataSet.model.concepts[conceptIndex].dateFrom.Year + " to " + padNumber(i2b2.CRC.model.dataSet.model.concepts[conceptIndex].dateTo.Month, 2) + "/" + padNumber(i2b2.CRC.model.dataSet.model.concepts[conceptIndex].dateTo.Day, 2) + "/" + i2b2.CRC.model.dataSet.model.concepts[conceptIndex].dateTo.Year;
        }
        return "<img align=\"absbottom\" style=\"margin-left:5px;\" src=\"js-i2b2/cells/CRC/assets/rds_calendar.gif\" border=\"0\"><span> [<a id=\"dateTooltip" + conceptIndex + "\" data-tooltip=\"\" class=\"dateRangeConstraint\" href=\"JavaScript:i2b2.CRC.ctrlr.dataSet.showDateRangeConstraintDialog(" + conceptIndex + ");\">" + dateText + "</a>]</span>";
    };

    this.makeDateRangeConstraintText = function (conceptIndex) {   // date constraints do not make sense for patient dimension concepts
        if (i2b2.CRC.model.dataSet.model.concepts[conceptIndex].sdxData.origData.table_name.toLowerCase() === 'patient_dimension')
            return "";

        var dateText = "";
        var concept = i2b2.CRC.model.dataSet.model.concepts[conceptIndex];
        var dateFrom = concept.hasOwnProperty('dateFrom');
        var dateTo = concept.hasOwnProperty('dateTo');

        if (dateFrom) {
            if (concept.dateFrom == false) {
                dateFrom = false;
            }
        }
        if (dateTo) {
            if (concept.dateTo == false) {
                dateTo = false;
            }
        }
        if (!dateFrom && !dateTo) {
            return "";
        }

        if (dateFrom && !dateTo) {
            dateText = "From " + padNumber(i2b2.CRC.model.dataSet.model.concepts[conceptIndex].dateFrom.Month, 2) + "/" + padNumber(i2b2.CRC.model.dataSet.model.concepts[conceptIndex].dateFrom.Day, 2) + "/" + i2b2.CRC.model.dataSet.model.concepts[conceptIndex].dateFrom.Year;
        }
        else if (!dateFrom && dateTo) {
            dateText = "To " + padNumber(i2b2.CRC.model.dataSet.model.concepts[conceptIndex].dateTo.Month, 2) + "/" + padNumber(i2b2.CRC.model.dataSet.model.concepts[conceptIndex].dateTo.Day, 2) + "/" + i2b2.CRC.model.dataSet.model.concepts[conceptIndex].dateTo.Year;
        }
        else {
            dateText = padNumber(i2b2.CRC.model.dataSet.model.concepts[conceptIndex].dateFrom.Month, 2) + "/" + padNumber(i2b2.CRC.model.dataSet.model.concepts[conceptIndex].dateFrom.Day, 2) + "/" + i2b2.CRC.model.dataSet.model.concepts[conceptIndex].dateFrom.Year + " to " + padNumber(i2b2.CRC.model.dataSet.model.concepts[conceptIndex].dateTo.Month, 2) + "/" + padNumber(i2b2.CRC.model.dataSet.model.concepts[conceptIndex].dateTo.Day, 2) + "/" + i2b2.CRC.model.dataSet.model.concepts[conceptIndex].dateTo.Year;
        }
        return "<br/>[" + dateText + "]";
    };


    this.setDateTooltip = function (conceptIndex) {
        var dateTooltip = "";

        if (!i2b2.CRC.model.dataSet.model.concepts[conceptIndex].dateFrom && !i2b2.CRC.model.dataSet.model.concepts[conceptIndex].dateTo) {
            dateTooltip = "Optional Date Range Constraint is not set";
        }
        else if (i2b2.CRC.model.dataSet.model.concepts[conceptIndex].dateFrom && !i2b2.CRC.model.dataSet.model.concepts[conceptIndex].dateTo) {
            dateText = padNumber(i2b2.CRC.model.dataSet.model.concepts[conceptIndex].dateFrom.Month, 2) + "/" + padNumber(i2b2.CRC.model.dataSet.model.concepts[conceptIndex].dateFrom.Day, 2) + "/" + i2b2.CRC.model.dataSet.model.concepts[conceptIndex].dateFrom.Year;
            dateTooltip = "Only find this concept starting from " + dateText;
        }
        else if (!i2b2.CRC.model.dataSet.model.concepts[conceptIndex].dateFrom && i2b2.CRC.model.dataSet.model.concepts[conceptIndex].dateTo) {
            dateText = padNumber(i2b2.CRC.model.dataSet.model.concepts[conceptIndex].dateTo.Month, 2) + "/" + padNumber(i2b2.CRC.model.dataSet.model.concepts[conceptIndex].dateTo.Day, 2) + "/" + i2b2.CRC.model.dataSet.model.concepts[conceptIndex].dateTo.Year;
            dateTooltip = "Only find this concept until " + dateText;
        }
        else {
            dateText = padNumber(i2b2.CRC.model.dataSet.model.concepts[conceptIndex].dateFrom.Month, 2) + "/" + padNumber(i2b2.CRC.model.dataSet.model.concepts[conceptIndex].dateFrom.Day, 2) + "/" + i2b2.CRC.model.dataSet.model.concepts[conceptIndex].dateFrom.Year + " to " + padNumber(i2b2.CRC.model.dataSet.model.concepts[conceptIndex].dateTo.Month, 2) + "/" + padNumber(i2b2.CRC.model.dataSet.model.concepts[conceptIndex].dateTo.Day, 2) + "/" + i2b2.CRC.model.dataSet.model.concepts[conceptIndex].dateTo.Year;
            dateTooltip = "Only find this concept from " + dateText;
        }
        jQuery('#dateTooltip' + conceptIndex).attr('data-tooltip', dateTooltip);
    };

    this.setTooltip = function (index) {
        var select = jQuery("#" + i2b2.CRC.ctrlr.dataSet.columnDisplaySelectID + index).val();
        switch (select) {
            case i2b2.CRC.model.dataSet.cellDataOption.DEFAULT:
                var tooltip = "Any existence of the observation";
                break;
            case i2b2.CRC.model.dataSet.cellDataOption.MIN:
                var tooltip = "Minimum value of all numerical values observations";
                break;
            case i2b2.CRC.model.dataSet.cellDataOption.MAX:
                var tooltip = "Maximum value of all numerical values observations";
                break;
            case i2b2.CRC.model.dataSet.cellDataOption.FIRST:
                var tooltip = "Date of earliest observation";
                break;
            case i2b2.CRC.model.dataSet.cellDataOption.LAST:
                var tooltip = "Date of the most recent observation";
                break;
            case i2b2.CRC.model.dataSet.cellDataOption.ALLCONCEPTTEXT:
                var tooltip = "All concept names are listed";
                break;
            case i2b2.CRC.model.dataSet.cellDataOption.MODECONCEPTTEXT:
                var tooltip = "Most frequent concept name(s) are listed";
                break;
            case i2b2.CRC.model.dataSet.cellDataOption.ALLCONCEPTCODE:
                var tooltip = "All concept codes are listed";
                break;
            case i2b2.CRC.model.dataSet.cellDataOption.MODECONCEPTCODE:
                var tooltip = "Most frequent concept code(s) are listed";
                break;
            case i2b2.CRC.model.dataSet.cellDataOption.COUNT:
                var tooltip = "Total number of observations";
                break;
            case i2b2.CRC.model.dataSet.cellDataOption.AVERAGE:
                var tooltip = "Average Value";
                break;
            case i2b2.CRC.model.dataSet.cellDataOption.MEDIAN:
                var tooltip = "Median Value";
                break;
            case i2b2.CRC.model.dataSet.cellDataOption.ALLVALUES:
                var tooltip = "List of All Value(s)";
                break;
            case i2b2.CRC.model.dataSet.cellDataOption.MODE:
                var tooltip = "Mode (Most Frequent Value)";
                break;
        }
        jQuery('#tooltip' + index).attr('data-tooltip', tooltip);


    };

    this.handleConceptConfigItemSelectionChange = function (event) {
        i2b2.CRC.model.dataSet.model.dirtyResultsData = true;

        i2b2.CRC.model.dataSet.model.readyToPreview = true;

        //var newVal = jQuery("#" + this.columnDisplaySelectID + event.data.index).children("option").filter(":selected").text();
        var newVal = jQuery("#" + i2b2.CRC.ctrlr.dataSet.columnDisplaySelectID + event.data.index).children("option").filter(":selected").val();
        i2b2.CRC.model.dataSet.model.concepts[event.data.index].dataOption = newVal;
    };

    this.updateZoomScaleLabels = function () {
        var z = i2b2.CRC.model.dataSet.model.zoomScale * 1.0;
        var p = i2b2.CRC.model.dataSet.model.zoomPan * 1.0;
        // update zoom key
        $$("DIV#RequestDataSet-mainDiv DIV.zoomKeyRange")[0].style.width = (90 / z) + 'px';
        $$("DIV#RequestDataSet-mainDiv DIV.zoomKeyRange")[0].style.left = ((p * 90) - (90 / z)) + 'px';
        // calculate date labels
        var first_time = i2b2.CRC.model.dataSet.model.first_time;
        var last_time = i2b2.CRC.model.dataSet.model.last_time;
        var lf = last_time - first_time;
        var t3 = first_time + lf * p;
        var t1 = t3 - lf / z;
        var t2 = (t1 + t3) / 2;
        var d1 = new Date(t1);
        var d2 = new Date(t2);
        var d3 = new Date(t3);
        // update labels
        $('RequestDataSet-results-scaleLbl1').innerHTML = (d1.getMonth() + 1) + '/' + d1.getDate() + '/' + d1.getFullYear();
        $('RequestDataSet-results-scaleLbl2').innerHTML = (d2.getMonth() + 1) + '/' + d2.getDate() + '/' + d2.getFullYear();
        $('RequestDataSet-results-scaleLbl3').innerHTML = (d3.getMonth() + 1) + '/' + d3.getDate() + '/' + d3.getFullYear();
    }

    this.zoom = function (op) {
        if (op == '+') {
            i2b2.CRC.model.dataSet.model.zoomScale *= 2.0;
        }
        if (op == '-') {
            i2b2.CRC.model.dataSet.model.zoomScale *= 0.5;
        }
        if (op == '<') {
            i2b2.CRC.model.dataSet.model.zoomPan -= 0.25 / (i2b2.CRC.model.dataSet.model.zoomScale * 1.0);
        }
        if (op == '>') {
            i2b2.CRC.model.dataSet.model.zoomPan += 0.25 / (i2b2.CRC.model.dataSet.model.zoomScale * 1.0);
        }
        if (i2b2.CRC.model.dataSet.model.zoomScale < 1) {
            i2b2.CRC.model.dataSet.model.zoomScale = 1.0;
        }
        if (i2b2.CRC.model.dataSet.model.zoomPan > 1) {
            i2b2.CRC.model.dataSet.model.zoomPan = 1.0;
        }
        if (i2b2.CRC.model.dataSet.model.zoomPan < 1 / (i2b2.CRC.model.dataSet.model.zoomScale * 1.0)) {
            i2b2.CRC.model.dataSet.model.zoomPan = 1 / (i2b2.CRC.model.dataSet.model.zoomScale * 1.0);
        }
        this.updateZoomScaleLabels();
        var z = i2b2.CRC.model.dataSet.model.zoomScale * 1.0;
        var p = i2b2.CRC.model.dataSet.model.zoomPan * 1.0;
        p = 100.0 * (1 - z * p);
        z = 100.0 * z;
        var o = $$("DIV#RequestDataSet-mainDiv DIV.results-finished DIV.ptObsZoom");
        for (var i = 0; i < o.length; i++) {
            o[i].style.width = z + '%';
            o[i].style.left = p + '%';
        }
    };


    this.getValuesOld = function (lvd) {  //This method is not being used any more. It has been replaced by i2b2.CRC.view.modLabvaluesCtlr.getModLabValuesForXML method.
        var s = '\t\t\t<constrain_by_value>\n';
        //var lvd = sdxData.LabValues;
        switch (lvd.MatchBy) {
            case "FLAG":
                s += '\t\t\t\t<value_type>FLAG</value_type>\n';
                s += '\t\t\t\t<value_operator>EQ</value_operator>\n';
                s += '\t\t\t\t<value_constraint>' + i2b2.h.Escape(lvd.ValueFlag) + '</value_constraint>\n';
                break;
            case "VALUE":
                if (lvd.GeneralValueType == "ENUM") {
                    var sEnum = [];
                    for (var i2 = 0; i2 < lvd.ValueEnum.length; i2++) {
                        sEnum.push(i2b2.h.Escape(lvd.ValueEnum[i2]));
                    }
                    //sEnum = sEnum.join("\", \"");
                    sEnum = sEnum.join("\',\'");
                    sEnum = '(\'' + sEnum + '\')';
                    s += '\t\t\t\t<value_type>TEXT</value_type>\n';
                    s += '\t\t\t\t<value_constraint>' + sEnum + '</value_constraint>\n';
                    s += '\t\t\t\t<value_operator>IN</value_operator>\n';
                } else if (lvd.GeneralValueType == "STRING") {
                    s += '\t\t\t\t<value_type>TEXT</value_type>\n';
                    s += '\t\t\t\t<value_operator>' + lvd.StringOp + '</value_operator>\n';
                    s += '\t\t\t\t<value_constraint><![CDATA[' + i2b2.h.Escape(lvd.ValueString) + ']]></value_constraint>\n';
                } else if (lvd.GeneralValueType == "LARGESTRING") {
                    if (lvd.DbOp) {
                        s += '\t\t\t\t<value_operator>CONTAINS[database]</value_operator>\n';
                    } else {
                        s += '\t\t\t\t<value_operator>CONTAINS</value_operator>\n';
                    }
                    s += '\t\t\t\t<value_type>LARGETEXT</value_type>\n';
                    s += '\t\t\t\t<value_constraint><![CDATA[' + i2b2.h.Escape(lvd.ValueString) + ']]></value_constraint>\n';
                } else {
                    s += '\t\t\t\t<value_type>' + lvd.GeneralValueType + '</value_type>\n';
                    s += '\t\t\t\t<value_unit_of_measure>' + lvd.UnitsCtrl + '</value_unit_of_measure>\n';
                    s += '\t\t\t\t<value_operator>' + lvd.NumericOp + '</value_operator>\n';
                    if (lvd.NumericOp == 'BETWEEN') {
                        s += '\t\t\t\t<value_constraint>' + i2b2.h.Escape(lvd.ValueLow) + ' and ' + i2b2.h.Escape(lvd.ValueHigh) + '</value_constraint>\n';
                    } else {
                        s += '\t\t\t\t<value_constraint>' + i2b2.h.Escape(lvd.Value) + '</value_constraint>\n';
                    }
                }
                break;
            case "":
                break;
        }
        s += '\t\t\t</constrain_by_value>\n';
        return s;
    }

    this.setLocalUniqueNumber = function () {
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

        this.downloadID = id;
    }
}

/**
 * @projectDescription	The Date Range Constraint controller (GUI-only controller).
 * @inherits 	i2b2.CRC.ctrlr
 * @namespace	i2b2.CRC.ctrlr.dateConstraint
 * @author		Nick Benik, Griffin Weber MD PhD
 * @version 	1.3
 * ----------------------------------------------------------------------------------------
 * updated 9-15-08: RC4 launch [Nick Benik]
 */

//console.group('Load & Execute component file: CRC > ctrlr > Dates');
//console.time('execute time');

// ================================================================================================== //
i2b2.CRC.ctrlr.dataSet.UI.DateConstraint = {
    defaultStartDate: '12/01/1979',
    defaultEndDate: '12/31/2006',
    conceptObj: false,
    conceptIndex: -1,

// ================================================================================================== //
    showDates: function( conceptListIndex )
    {
        this.conceptObj     = i2b2.CRC.model.dataSet.model.concepts[conceptListIndex]; // remember our concept object
        this.conceptIndex   = conceptListIndex;

        // only build the dialog box once
        if (!i2b2.CRC.ctrlr.dataSet.UI.ModalDates)
        {
            var handleSubmit = function()
            {
                var closure_pi = i2b2.CRC.ctrlr.dataSet.UI.DateConstraint.conceptObj;
                // save the dates
                if (i2b2.CRC.ctrlr.dataSet.UI.DateConstraint.doProcessDates(closure_pi))
                    if (this.submit()) // saved and validated, close modal form
                    {
                        i2b2.CRC.model.dataSet.model.dirtyResultsData = true; // table is now stale, get a new one
                        i2b2.CRC.ctrlr.dataSet.conceptsRender(); //update GUI
                    }
            };
            var handleCancel = function()
            {
                this.cancel();
            }
            i2b2.CRC.ctrlr.dataSet.UI.ModalDates = new YAHOO.widget.SimpleDialog("dateConstraintDialog",
                {
                    width: "400px",
                    fixedcenter: true,
                    constraintoviewport: true,
                    modal: true,
                    zindex: 700,
                    buttons: [{
                        text: "OK",
                        isDefault: true,
                        handler: handleSubmit
                    },
                        {
                            text: "Cancel",
                            handler: handleCancel
                        }]
                });
            $('dateConstraintDialog').show();
            i2b2.CRC.ctrlr.dataSet.UI.ModalDates.render(document.body);
        }
        i2b2.CRC.ctrlr.dataSet.UI.ModalDates.show();
        // load our panel data
        var DateRecord = new Object;
        if (this.conceptObj.dateFrom)
            DateRecord.Start = padNumber(this.conceptObj.dateFrom.Month, 2) + '/' + padNumber(this.conceptObj.dateFrom.Day, 2) + '/' + this.conceptObj.dateFrom.Year;
        else
            DateRecord.Start = this.defaultStartDate;
        $('PSV_ConstraintDateStart').value = DateRecord.Start;
        if (this.conceptObj.dateTo)
            DateRecord.End = padNumber(this.conceptObj.dateTo.Month, 2) + '/' + padNumber(this.conceptObj.dateTo.Day, 2) + '/' + this.conceptObj.dateTo.Year;
        else
        {
            var curdate = new Date();
            DateRecord.End = padNumber(curdate.getMonth()+1,2)+'/'+padNumber(curdate.getDate(),2)+'/'+curdate.getFullYear();
        }
        $('PSV_ConstraintDateEnd').value = DateRecord.End;
        if (this.conceptObj.dateFrom)
        {
            $('PSV_CheckboxDateStart').checked = true;
            $('PSV_ConstraintDateStart').disabled = false;
        }
        else
        {
            $('PSV_CheckboxDateStart').checked = false;
            $('PSV_ConstraintDateStart').disabled = true;
        }
        if (this.conceptObj.dateTo)
        {
            $('PSV_CheckboxDateEnd').checked = true;
            $('PSV_ConstraintDateEnd').disabled = false;
        }
        else
        {
            $('PSV_CheckboxDateEnd').checked = false;
            $('PSV_ConstraintDateEnd').disabled = true;
        }
    },

// ================================================================================================== //
    toggleDate: function() {
        if ($('PSV_CheckboxDateStart').checked) {
            $('PSV_ConstraintDateStart').disabled = false;
            setTimeout("$('PSV_ConstraintDateStart').select()", 150);
        } else {
            $('PSV_ConstraintDateStart').disabled = true;
        }
        if ($('PSV_CheckboxDateEnd').checked) {
            $('PSV_ConstraintDateEnd').disabled = false;
            setTimeout("$('PSV_ConstraintDateEnd').select()", 150);
        } else {
            $('PSV_ConstraintDateEnd').disabled = true;
        }
    },

// ================================================================================================== //
    doShowCalendar: function(whichDate) {
        // create calendar if not already initialized
        if (!this.DateConstrainCal) {
            this.DateConstrainCal = new YAHOO.widget.Calendar("DateContstrainCal","calendarDiv");
            this.DateConstrainCal.selectEvent.subscribe(this.dateSelected, this.DateConstrainCal,true);
        }
        this.DateConstrainCal.clear();
        // process click
        if (whichDate=='S') {
            if ($('PSV_CheckboxDateStart').checked == false) { return; }
            var apos = Position.cumulativeOffset($('PSV_DropDateStart'));
            // tdw9: reuse calendarDiv from default.html
            var cx = apos[0] - $("calendarDiv").getWidth() + $('PSV_DropDateStart').width + 3;
            var cy = apos[1] + $('PSV_DropDateStart').height + 3;
            $("calendarDiv").style.top = cy+'px';
            $("calendarDiv").style.left = cx+'px';
            $("PSV_ConstraintDateStart").select();
            var sDateValue = $('PSV_ConstraintDateStart').value;
        } else {
            if ($('PSV_CheckboxDateEnd').checked == false) { return; }
            var apos = Position.cumulativeOffset($('PSV_DropDateEnd'));
            var cx = apos[0] - $("calendarDiv").getWidth() + $('PSV_DropDateEnd').width + 3;
            var cy = apos[1] + $('PSV_DropDateEnd').height + 3;
            $("calendarDiv").style.top = cy+'px';
            $("calendarDiv").style.left = cx+'px';
            $("PSV_ConstraintDateEnd").select();
            var sDateValue = $('PSV_ConstraintDateEnd').value;
        }
        var rxDate = /^\d{1,2}(\-|\/|\.)\d{1,2}\1\d{4}$/
        if (rxDate.test(sDateValue)) {
            var aDate = sDateValue.split(/\//);
            this.DateConstrainCal.setMonth(aDate[0]-1);
            this.DateConstrainCal.setYear(aDate[2]);
        } else {
            alert("Invalid Date Format, please use mm/dd/yyyy or select a date using the calendar.");
        }
        // save our date type on the calendar object for later use
        this.whichDate = whichDate;
        // display everything
        $("calendarDiv").show();
        var viewdim = document.viewport.getDimensions();
        $("calendarDivMask").style.top = "0px"; // reuse calendarDivMask
        $("calendarDivMask").style.left = "0px";
        $("calendarDivMask").style.width = (viewdim.width - 10) + "px";
        $("calendarDivMask").style.height = (viewdim.height - 10) + "px";
        $("calendarDivMask").show();
        this.DateConstrainCal.render(document.body);
    },

// ================================================================================================== //
    dateSelected: function(eventName, selectedDate) {
        // function is event callback fired by YUI Calendar control
        // (this function looses it's class scope)
        var cScope = i2b2.CRC.ctrlr.dataSet.UI.DateConstraint;
        if (cScope.whichDate=='S')
            var tn = $('PSV_ConstraintDateStart');
        else
            var tn = $('PSV_ConstraintDateEnd');
        var selectDate = selectedDate[0][0];
        tn.value = selectDate[1]+'/'+selectDate[2]+'/'+selectDate[0];
        cScope.hideCalendar.call(cScope);
    },

// ================================================================================================== //
    hideCalendar: function() {
        $("calendarDiv").hide();
        $("calendarDivMask").hide();
    },

// ================================================================================================== //
    doProcessDates: function(conceptObj)
    {
        // push the dates into the data model
        var sDate = new String;
        var sDateError = false;
        var rxDate = /^\d{1,2}(\-|\/|\.)\d{1,2}\1\d{4}$/
        var DateRecord = {};
        this.conceptObj = conceptObj;
        // parse start date and store in DateRecord
        if ($('PSV_CheckboxDateStart').checked)
        {
            DateRecord.Start = {};
            sDate = $('PSV_ConstraintDateStart').value;
            if (rxDate.test(sDate))
            {
                var aDate = sDate.split(/\//);
                DateRecord.Start.Month = padNumber(aDate[0],2);
                DateRecord.Start.Day = padNumber(aDate[1],2);
                DateRecord.Start.Year = aDate[2];
            }
            else
                sDateError = "Invalid Start Date\n";
        }
        // end date
        if ($('PSV_CheckboxDateEnd').checked)
        {
            DateRecord.End = {};
            sDate = $('PSV_ConstraintDateEnd').value;
            if (rxDate.test(sDate))
            {
                var aDate = sDate.split(/\//);
                DateRecord.End.Month = padNumber(aDate[0]);
                DateRecord.End.Day = padNumber(aDate[1]);
                DateRecord.End.Year = aDate[2];
            } else
                sDateError = "Invalid End Date\n";
        }
        // check for processing errors
        if (sDateError)
        {
            sDateError += "\nPlease use the following format: mm/dd/yyyy";
            alert(sDateError);
            return false; // return failure (for setting date range)
        }
        else
        {
            // attach the data to our Concept Object data
            if (DateRecord.Start)
                conceptObj.dateFrom = DateRecord.Start;
            else
                delete conceptObj.dateFrom;
            if (DateRecord.End)
                conceptObj.dateTo = DateRecord.End;
            else
                delete conceptObj.dateTo;
        }
        return true; // return success (for setting date range)
    }
};


