/**
 * @projectDescription    Produces data file based on previous query
 * @inherits    i2b2
 * @namespace    i2b2.ARCHRequestHandler
 * @author    Nich Wattanasin
 * @version    2.0
 * ----------------------------------------------------------------------------------------
 * updated 05-06-15:    Bhaswati Ghosh
 * 2.0 : 03-03-16:        Nich Wattanasin
 */
// values used for table data select
i2b2.ARCHRequestHandler.Downloader = {

    cellDataOption: {
        DEFAULT: "Existence (Yes/No)",
        MIN: "Minimum Value",  // To-do
        MAX: "Maximum Value",  // To-do
        AVERAGE: "Average Value",  // To-do
        MEDIAN: "Median Value",  // To-do
        FIRST: "Date (First)",
        LAST: "Date (Most Recent)",
        COUNT: "Count",
        ALLVALUES: "List of All Values",  // To-do
        MODE: "Mode (Most Frequent Value)", // To-do
        ALLCONCEPTTEXT: "All Concepts (Names/Text)",
        MODECONCEPTTEXT: "Most Frequent Concept (Names/Text)",
        ALLCONCEPTCODE: "All Concepts (Codes)",
        MODECONCEPTCODE: "Most Frequent Concept (Codes)",
    },

    previewRequested: false,
    dataRequested: false,
    queryMasterId: "",
    downloadID: "",
    lastDroppedTerm: null,

    UI: {},

    user: {},

    viewResultsTableOption: false,


// Value types gathered from value metadata in concepts and modifiers. Used to differentiate different types of value restrictions. Combines posInteger, Integer, PosFloat, and Float as NUMERIC Data
    valueType: {
        NUMERIC: {id: 1, text: "numeric"},       // NUMERIC_DATA: PosInteger, Integer, PosFloat, Float
        ENUM: {id: 2, text: "enumerated"},    // ENUM
        BLOB: {id: 3, text: "blob"},          // LARGESTRING (BLOB)
        MIXED: {id: 4, text: "mixed"},         // This is used to describe a Group containing concepts of mixed value types
        UNKNOWN: {id: 0, text: "unknown"}       // Unknown (sanity check)

    },

    zygosityValues: ["Heterozygous", "Homozygous", "missing_zygosity"],
    consequenceValues: ["3'UTR", "5'UTR", "downstream", "exon", "Frameshift", "In-frame", "intron", "missense", "nonsense", "start_loss", "stop_loss", "synonymous", "upstream", "missing_consequence"],
    alleleValues: ["A_to_C", "A_to_G", "A_to_T", "C_to_A", "C_to_G", "C_to_T", "G_to_A", "G_to_C", "G_to_T", "T_to_A", "T_to_C", "T_to_G", "._."],

//Change BG for new value box architecture
    currentTerm: null,

    Init: function (loadedDiv) {

        // 1. check DATA_LDS role
        // 2. if no DATA_LDS role, show form + populate drop down with faculty sponsors
        // 3. if yes DATA_LDS role, continue as is


        // register DIV as valid DragDrop target for Patient Record Sets (PRS) objects
        var op_trgt = {dropTarget: true};
        i2b2.sdx.Master.AttachType("ARCHRequestHandler-CONCPTDROP", "CONCPT", op_trgt);
        i2b2.sdx.Master.AttachType("ARCHRequestHandler-CONCPTDROP", "QM", op_trgt);
        i2b2.sdx.Master.AttachType("ARCHRequestHandler-PRSDROP", "PRS", op_trgt);
        i2b2.sdx.Master.AttachType("ARCHRequestHandler-PRSDROP", "QM", op_trgt);

        // drop event handlers used by this plugin
        i2b2.sdx.Master.setHandlerCustom("ARCHRequestHandler-CONCPTDROP", "CONCPT", "DropHandler", this.conceptDropped);
        i2b2.sdx.Master.setHandlerCustom("ARCHRequestHandler-CONCPTDROP", "QM", "DropHandler", this.queryConceptDropped);
        i2b2.sdx.Master.setHandlerCustom("ARCHRequestHandler-PRSDROP", "PRS", "DropHandler", this.prsDropped);
        i2b2.sdx.Master.setHandlerCustom("ARCHRequestHandler-PRSDROP", "QM", "DropHandler", this.queryDropped);

        this.debug.useReviewWindow = false;             // enable/disable live debug message output to external window

        this.active = new Object();

        this.model.prsRecord = false;
        this.model.conceptRecord = false;
        this.model.dirtyResultsData = true;

        this.columnDisplaySelectID = "columnDisplaySelectID";
        this.model.pageSize = 50;
        this.model.processed = 0;
        this.msgCounter = 0;
        // array to store concepts
        this.model.concepts = [];

        // set initial pagination values
        this.model.pgstart = 1;
        this.model.pgsize = 10;
        // set initial zoom values
        this.model.zoomScale = 1.0;
        this.model.zoomPan = 1.0;

        this.model.required = {
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

        this.model.showMetadataDialog = true;

        this.model.csv = '';

        this.model.firstVisit = true;
        this.model.readyToPreview = false;
        this.model.readyToProcess = false;
        this.model.processLocked = false;
        // YUI tabs got moved to main controller
        // // manage YUI tabs
        // this.yuiTabs = new YAHOO.widget.TabView("ARCHRequestHandler-TABS");
        //
        // this.yuiTabs.on('activeTabChange', function (ev) {
        //     //Tabs have changed
        //     if (ev.newValue.get('id') == "ARCHRequestHandler-TAB2") { // Preview Tab
        //         i2b2.ARCHRequestHandler.processJob(1);
        // 	/*if(this.model.firstVisit){
        // 	 jQuery('#no-results-section-prev').show();
        // 	 jQuery('#results-section').hide();
        // 	 }
        // 	 else{
        // 	 jQuery('#no-results-section-prev').hide();
        // 	 jQuery('#results-section').show();
        //
        // 	 //if(this.model.readyToPreview){
        // 	 i2b2.ARCHRequestHandler.processJob(1);
        // 	 //						i2b2.ARCHRequestHandler.newResults();
        // 	 //}
        // 	 }*/
        //     }
        //     if (ev.newValue.get('id') == "ARCHRequestHandler-TAB3") { // Download Tab
        //         if (this.model.firstVisit) {
        //             jQuery('#no-results-section-file').show();
        //             jQuery('#results-section-file').hide();
        //         }
        //         else {
        //             jQuery('#no-results-section-file').hide();
        //             jQuery('#results-section-file').show();
        //         }
        //         i2b2.ARCHRequestHandler.processJob(0);
        // 	/*
        // 	 if(this.model.readyToProcess && !this.model.readyToPreview){
        // 	 i2b2.ARCHRequestHandler.viewResults();
        // 	 } else if(this.model.readyToPreview){
        // 	 jQuery('#no-results-section-file').show();
        // 	 jQuery('#results-section-file').hide();
        // 	 }
        // 	 }
        // 	 */
        //     }
        //     if (ev.newValue.get('id') == "ARCHRequestHandler-TAB4") { // History Tab
        //         i2b2.ARCHRequestHandler.getHistory();
        //     }
        // });
        z = $('anaPluginViewFrame').getHeight() - 40;//- 34;  //BG vertical scrollbar display issues
        $$('DIV#ARCHRequestHandler-TABS DIV.ARCHRequestHandler-MainContent')[0].style.height = z;
        $$('DIV#ARCHRequestHandler-TABS DIV.ARCHRequestHandler-MainContent')[1].style.height = z;

        if (i2b2.PM.model.userRoles.indexOf("DATA_LDS") == -1) {  // user does not have DATA_LDS role
            content = "<div id='ARCHRequestHandler-TABS' class='yui-navset'>\n";
            content += "<ul class='yui-nav'>\n";
            content += "<li id='ARCHRequestHandler-TAB1' class='selected'><a href='#ARCHRequestHandler-TAB1'><em>Notice</em></a></li>\n";
            content += "</ul>\n";
            content += "<div class='yui-content' id='ARCHRequestHandler-CONTENT'>\n";
            content += "<div class='tab-body'>\n";
            content += "<div class='ARCHRequestHandler-MainContent' style='color:#000;font-size:14px;'>\n";
            content += "<h1 style='padding-bottom:10px;'><img src='js-i2b2/cells/plugins/community/ARCHRequestHandler/assets/csv_icon.png' align='absbottom'/> Biobank Portal Download Data</h1>\n";
            content += "<div style='padding: 10px; border-radius: 10px; border: 1px solid rgb(86, 158, 231); color: rgb(86, 158, 231); background: rgb(236, 251, 255);'><img style='margin-top:2px;margin-bottom:2px;' src='js-i2b2/cells/ONT/assets/info_icon.png' align='absmiddle'> Note: In order to download data from the Biobank Portal, you must either be a faculty sponsor in the RPDR, or you must be in the RPDR workgroup of a faculty sponsor.</div><br/>\n";
            content += "All downloads are audited closely. If you are not a faculty sponsor, your faculty sponsor will be notified and must approve your request for access. The faculty sponsor will also be notified of all download requests that you make.<br/><br/><br/>\n";
            content += "<strong>Please select your RPDR faculty sponsor:&nbsp;</strong>\n";
            content += "<select id='ARCHRequestHandler-faculty'>\n";
            content += "</select><br/><br/><br/>\n";
            content += "If you do not see your faculty sponsor in the dropdown above, or have any other questions, please <a href='mailto:sduey@partners.org' target='_blank'>contact us</a>.<br/><br/><br/>\n";
            content += "<span id='ARCHRequestHandler-facultysubmitted'><input style='font-size:16px;' type='button' value='Request Access Now' onclick='javascript:i2b2.ARCHRequestHandler.submitRequest();return false;'/></a>\n";
            content += "</div></div></div></div>";

            jQuery('#ARCHRequestHandler-mainDiv').html(content);
            jQuery('#ARCHRequestHandler-MainContent').css("height", z + 40);

            var url = "/CheckRpdrUserProxy.php?id=" + i2b2.PM.model.login_username;
            var rpdrUserCallback = {
                success: function (o) {
                    var rpdrUser = JSON.parse(o.responseText);
                    i2b2.ARCHRequestHandler.user = rpdrUser;
                    for (var i = 0; i < rpdrUser.sponsors.length; i++) {
                        jQuery('#ARCHRequestHandler-faculty').append(jQuery("<option></option>").attr("value", rpdrUser.sponsors[i].surrogatename + " (" + rpdrUser.sponsors[i].surrogateid + ")").text(rpdrUser.sponsors[i].surrogatename));
                    }
                },
                failure: function (o) {
                    alert('Unable to retrieve your list of faculty sponsors.');
                }
            };
            var transaction = YAHOO.util.Connect.asyncRequest('GET', url, rpdrUserCallback);

        }

        i2b2.ARCHRequestHandler.conceptsRender();
    },

    submitRequest: function () {
        var url = "js-i2b2/cells/plugins/community/ARCHRequestHandler/ARCHRequestHandlerRequestProcess.php";
        var rpdrUserCallback = {
            success: function (o) {
                if (o.responseText == "Done") {
                    //$("GenomicsRequest-mainContent").style.display = "none";
                    //$("GenomicsRequest-successContent").style.display = "block";
                    jQuery('#ARCHRequestHandler-facultysubmitted').html('Thank you, your access request has been submitted. You will receive an e-mail when your access has been approved.');
                } else if (o.responseText == "Pending") {
                    jQuery('#ARCHRequestHandler-facultysubmitted').html('There is another access request already pending for you. You will receive an e-mail when your access has been approved.');
                }
            },
            failure: function (o) {
                alert('There was an error with submitting the request.');
            }
        };
        var postData = 'projectid=' + i2b2.PM.model.login_project + '&ARCHRequestHandler-faculty=' + $("ARCHRequestHandler-faculty").value + '&ARCHRequestHandler-fullname=' + i2b2.ARCHRequestHandler.user.fullname + '&ARCHRequestHandler-email=' + i2b2.ARCHRequestHandler.user.email + '&ARCHRequestHandler-id=' + i2b2.ARCHRequestHandler.user.id;
        var transaction = YAHOO.util.Connect.asyncRequest('POST', url, rpdrUserCallback, postData);

    },

// 2.0: Download CSV for job_id
    downloadJob: function (job_id) {

        jQuery('#downloadForm [name="user_id"]').val(i2b2.PM.model.login_username);
        jQuery('#downloadForm [name="session"]').val(i2b2.PM.model.login_password);
        jQuery('#downloadForm [name="job_id"]').val(job_id);
        jQuery('#downloadForm [name="domain"]').val(i2b2.PM.model.login_domain);
        jQuery('#downloadForm [name="pm_uri"]').val(i2b2.PM.model.url);
        jQuery('#downloadForm').submit();

    },

    // 2.0: User has selected previous query (patients) and concepts (aggregations)
    processJob: function (preview) {
        var job = {};
        if (preview) {
            if (this.model.dirtyResultsData && !this.model.previewLocked) {
                if (this.model.prsRecord) {
                    this.setLocalUniqueNumber();
                    job = {
                        event_type_id: this.downloadID,
                        query_master_id: this.queryMasterId,
                        model: this.model,
                        filterlist: this._getPDOFilterList(),
                        patient_set_size: parseInt(this.active.size),
                        patient_set_coll_id: this.model.prsRecord.sdxInfo.sdxKeyValue,
                        userid: i2b2.PM.model.login_username,
                        project: i2b2.PM.model.login_project,
                        login_password: i2b2.PM.model.login_password,
                        status: "NEW",
                        payload: "New Job"
                    };

                    jQuery.post('js-i2b2/cells/plugins/community/ARCHRequestHandler/helper.php', {
                        job: JSON.stringify(job),
                        preview: 1
                    })
                        .success(function (job_id) {
                            this.activeJobID = job_id;
                            this.newResults(job_id);
                            this.model.readyToProcess = false;
                        })
                        .error(function () {
                            alert('Preview Error');
                        });
                } else {
                    alert('In order to continue, you must first select a valid patient set.');
                }
            } else {
                $('ARCHRequestHandler-TAB3').click();
            }
        } else {
            if (this.model.readyToProcess) {
                if (!this.model.processLocked) {
                    job = {
                        id: this.activeJobID
                    };
                    jQuery.post('js-i2b2/cells/plugins/community/ARCHRequestHandler/helper.php', {
                        job: JSON.stringify(job),
                        preview: 0
                    })
                        .success(function (job_id) {
                            this.downloadResults(job_id);
                        })
                        .error(function () {
                            alert('Download Error');
                        });
                } else {
                    $('ARCHRequestHandler-TAB4').click();
                }
            } else {
                alert('In order to continue, you must first preview your data file.');

            }
        }

    },

// 2.0: Get History

// i2b2.ARCHRequestHandler.getHistory = function () {
//     $('ARCHRequestHandler-HistoryProject').innerHTML = 'for ' + i2b2.PM.model.login_projectname;
//     $('ARCHRequestHandler-History').innerHTML = 'Loading...';
//     jQuery.ajax({
//         type: 'POST',
//         url: "js-i2b2/cells/plugins/community/ARCHRequestHandler/history.php",
//         data: {
//             pm_uri: i2b2.PM.model.url,
//             domain: i2b2.PM.model.login_domain,
//             user_id: i2b2.PM.model.login_username,
//             session: i2b2.PM.model.login_password,
//             project: i2b2.PM.model.login_project
//         },
//         success: function (history) {
//             $('ARCHRequestHandler-History').innerHTML = history;
//         },
//         error: function (history) {
//             $('ARCHRequestHandler-History').innerHTML = 'Unable to fetch history at this time. Please try again later.';
//         }
//     });
//     return false;
// };

// 2.0: Cancel job
    cancelJob: function (job_id) {

        if (!job_id) {
            job_id = this.activeJobID;
        }

        jQuery.post('js-i2b2/cells/plugins/community/ARCHRequestHandler/cancel.php', {
            job_id: job_id
        })
            .success(function (result) {
                alert(result);
                this.getHistory();
                // get job id
                // show results
            })
            .error(function () {
                alert('The cancelling of this job has failed.');
            });

    },

// 2.0: Re-run job
    rerunJob: function (job_id) {

        jQuery.post('js-i2b2/cells/plugins/community/ARCHRequestHandler/rerun.php', {
            job_id: job_id,
            user_id: i2b2.PM.model.login_username,
            session: i2b2.PM.model.login_password
        })
            .success(function (result) {
                alert(result);
                this.getHistory();
                // get job id
                // show results
            })
            .error(function () {
                alert('The re-running of this job has failed.');
            });

    },


// 2.0: Date Constraints
    constructDateRangeConstraintXML: function (conceptIndex) {
        var fromMoment = null;
        var toMoment = null;
        if (this.model.concepts[conceptIndex].dateFrom)
            fromMoment = new moment(this.model.concepts[conceptIndex].dateFrom.Year + "-" + padNumber(this.model.concepts[conceptIndex].dateFrom.Month, 2) + "-" + padNumber(this.model.concepts[conceptIndex].dateFrom.Day, 2));
        if (this.model.concepts[conceptIndex].dateTo)
            var toMoment = new moment(this.model.concepts[conceptIndex].dateTo.Year + "-" + padNumber(this.model.concepts[conceptIndex].dateTo.Month, 2) + "-" + padNumber(this.model.concepts[conceptIndex].dateTo.Day, 2));

        var xml = '';
        if (!this.model.concepts[conceptIndex].dateFrom && !this.model.concepts[conceptIndex].dateTo)
            return '';
        else if (this.model.concepts[conceptIndex].dateFrom && !this.model.concepts[conceptIndex].dateTo)
            xml = '\t\t\t<constrain_by_date>\n' +
                '\t\t\t\t<date_from time="start_date" inclusive= "yes">' + fromMoment.format() + '</date_from>\n' +
                '\t\t\t</constrain_by_date>\n';
        else if (!this.model.concepts[conceptIndex].dateFrom && this.model.concepts[conceptIndex].dateTo)
            xml = '\t\t\t<constrain_by_date>\n' +
                '\t\t\t\t<date_to time="start_date" inclusive= "yes">' + toMoment.format() + '</date_to>\n' +
                '\t\t\t</constrain_by_date>\n';
        else
            xml = '\t\t\t<constrain_by_date>\n' +
                '\t\t\t\t<date_from time="start_date" inclusive= "yes">' + fromMoment.format() + '</date_from>\n' +
                '\t\t\t\t<date_to time="start_date" inclusive= "yes">' + toMoment.format() + '</date_to>\n' +
                '\t\t\t</constrain_by_date>\n';
        return xml;
    },

// 2.0: Value Constraints

    /* returns the XML ValueMetaData*/
    retrieveValueConstraint: function (conceptIndex) {
        var values = undefined;
        // if the current concept is the last dropped concept and if its sdx comes with lab values (as in the case where the concept is part of a prev query), use it.
        /*if (i2b2.ARCHRequestHandler.lastDroppedTerm &&
         (Object.is(i2b2.ARCHRequestHandler.lastDroppedTerm, this.model.concepts[conceptIndex])) &&
         this.model.concepts[conceptIndex].sdxData.LabValues) */
        if (i2b2.ARCHRequestHandler.lastDroppedTerm &&
            i2b2.ARCHRequestHandler.lastDroppedTerm === this.model.concepts[conceptIndex] &&
            this.model.concepts[conceptIndex].sdxData.LabValues) {
            values = this.model.concepts[conceptIndex].sdxData.LabValues;
            delete this.model.concepts[conceptIndex].sdxData.LabValues;  // delete LabValues because we have saved it
        }
        else
            values = this.model.concepts[conceptIndex].valueRestriction; // read from the constraint saved in the concept object
        return values;
    },

// 2.0: Internal function to get PDO filter list
    _getPDOFilterList: function () {

        var filterList = '';
        for (var i1 = 0; i1 < this.model.concepts.length; i1++) {
            var sdxData = this.model.concepts[i1].sdxData;
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
                var modifierConstraints = (this.model.concepts[i1].valueRestriction != null) ? i2b2.CRC.view.modLabvaluesCtlr.getModLabValuesForXML(this.model.concepts[i1].valueRestriction) : "";
                filterList +=
                    '	<panel name="' + this.model.concepts[i1].panel + '">\n' +
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
                var valueConstraints = (this.model.concepts[i1].valueRestriction != null) ? i2b2.CRC.view.modLabvaluesCtlr.getModLabValuesForXML(this.model.concepts[i1].valueRestriction) : "";
                var dateConstraints = this.constructDateRangeConstraintXML(i1);
                var t = sdxData.origData.xmlOrig;
                var cdata = {};
                cdata.level = i2b2.h.getXNodeVal(t, "level");
                cdata.key = i2b2.h.getXNodeVal(t, "key");
                cdata.tablename = i2b2.h.getXNodeVal(t, "tablename");
                cdata.dimcode = i2b2.h.getXNodeVal(t, "dimcode");
                cdata.synonym = i2b2.h.getXNodeVal(t, "synonym_cd");
                filterList +=
                    '	<panel name="' + this.model.concepts[i1].panel + '">\n' +
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

    },

// 2.0
    _getJobStatus: function (job_id) {
        jQuery.ajax({
            type: 'GET',
            url: "js-i2b2/cells/plugins/community/ARCHRequestHandler/status.php",
            data: {job_id: job_id},
            dataType: 'json',
            cache: false,
            success: function (job) {
                if (job.status == 'NEW') {
                    this.model.readyToProcess = false;
                    setTimeout(function () {
                        this._getJobStatus(job_id);
                    }, 2000);
                }
                else if (job.status == 'PREVIEW') {
                    jQuery('#ARCHRequestHandler-PreviewResults tr:gt(1)').remove();
                    jQuery('#ARCHRequestHandler-PreviewResults tr:last').after(job.payload);
                    var currentdate = new Date();
                    var datetime = (currentdate.getMonth() + 1) + "/"
                        + currentdate.getDate() + "/"
                        + currentdate.getFullYear() + " @ "
                        + currentdate.getHours() + ":"
                        + currentdate.getMinutes() + ":"
                        + currentdate.getSeconds();
                    var processTime = document.getElementById('ARCHRequestHandler-ProcessTime');
                    var previewText = document.getElementById('ARCHRequestHandler-PreviewText');
                    $('ARCHRequestHandler-Status').hide();
                    //processTime.innerHTML = processTime.innerHTML + " | Finished: " + datetime;
                    var previewNumber = 5;
                    if (parseInt(this.active.size) < 5) {
                        previewNumber = parseInt(this.active.size);
                    }
                    previewText.innerHTML = "Below is a preview of the first " + previewNumber + " out of " + this.active.size + " records from the requested data. If you are satisfied, click on <strong>Proceed to Download</strong> to start processing the entire file.";
                    processTime.innerHTML = "<img src='js-i2b2/cells/plugins/community/ARCHRequestHandler/assets/file.png' align='absbottom'/> Your data file will contain <span style='font-size: 19px;color: #399ae7;'>" + this.active.size + "</span> rows, one row per patient (plus a header row) and <span style='font-size: 19px;color: #399ae7;'>" + this.model.columns + "</span> columns as specified, delimited by commas.";
                    //var statusText = document.getElementById('ARCHRequestHandler-Status');
                    //statusText.innerHTML = "<a href='javascript:this.processJob(0)'>Proceed to Download</a>";
                    $('ARCHRequestHandler-PreviewButton').innerHTML = '<input onclick="this.processJob(1);" type="button" class="ARCHRequestHandler-button" value="Next ( Preview Data File )" /><br/><br/><br/>';
                    $('ARCHRequestHandler-ProceedButton').show();
                    this.model.processLocked = false;
                    this.model.previewLocked = false;
                    this.model.dirtyResultsData = false;
                    this.model.readyToProcess = true;
                }
                else if (job.status == 'PROCESSING') {
                    this.model.processLocked = true;
                    $('ARCHRequestHandler-Processed').innerHTML = job.payload;

                    setTimeout(function () {
                        this._getJobStatus(job_id);
                    }, 2000);

                }
                else if (job.status == 'CANCELLED') {
                    this.model.processLocked = true;
                    $('ARCHRequestHandler-StatusView').innerHTML = job.payload;
                }
                else if (job.status == 'FINISHED') {
                    this.model.processLocked = true;
                    $('ARCHRequestHandler-StatusView').innerHTML = "<a class=\"ARCHRequestHandler-button\" style=\"text-decoration:none;font-size:15px;\" href=\"#\" onclick=\"javascript:this.downloadJob('" + job_id + "');return false;\">Download Data File</a>";
                }


            },
            error: function (job) {
                this.model.previewLocked = false;
                alert('There was an error processing your request.');
            }
        });
    },


//This method generates and displays the patient dataset from previous query
    newResults: function (job_id) {

        //if ((this.model.concepts.length > 0) && this.model.prsRecord)
        if (this.model.prsRecord) {
            this.setLocalUniqueNumber(); //Set the uniqueid for the download operation
            this.previewRequested = true;
            this.previewResults(job_id);
            $('ARCHRequestHandler-TAB4').click();
        }
    },

// 2.0: Download Results

    downloadResults: function (job_id) {
        try {
            $('ARCHRequestHandler-TAB4').click();
        }
        catch (e) {
            //console.log(e);
        }
        jQuery('#ARCHRequestHandler-Status').hide();

        $('ARCHRequestHandler-StatusView').innerHTML = '<img src="js-i2b2/cells/plugins/community/ARCHRequestHandler/assets/ajax.gif" align="absmiddle"/> Processed <span id="ARCHRequestHandler-Processed" style="font-weight:bold;"></span> [<a href="#" onclick="javascript:i2b2.ARCHRequestHandler.Downloader.cancelJob();return false;">Cancel</a>]';
        $('ARCHRequestHandler-StatusView').show();

        this.model.processed = 0;

        $('ARCHRequestHandler-Processed').innerHTML = '0 of ' + this.active.size + ' patients';
        var currentdate = new Date();
        var datetime = (currentdate.getMonth() + 1) + "-"
            + currentdate.getDate() + "-"
            + currentdate.getFullYear() + " @ "
            + currentdate.getHours() + ":"
            + currentdate.getMinutes() + ":"
            + currentdate.getSeconds();

        //$('ARCHRequestHandler-DownloadLink').hide();
        $('ARCHRequestHandler-ProcessTime').innerHTML = "Process Started: " + datetime;

        setTimeout(function () {
            this._getJobStatus(job_id);
        }, 2000);

    },

//This method starts creating the result table and the headers.
    previewResults: function (job_id) {

        this.model.previewLocked = true;
        $('ARCHRequestHandler-ProcessTime').innerHTML = '';
        $('no-results-section-prev').hide();

        // While preview is going on, hide the "Preview" and "Proceed to Download" buttons
        $('ARCHRequestHandler-PreviewButton').innerHTML = '<img src="js-i2b2/cells/plugins/community/ARCHRequestHandler/assets/ajax.gif" align="absmiddle"/> Generating Preview...<br/><br/><br/>';
        $('ARCHRequestHandler-ProceedButton').hide();

        $('results-section').show();
        $('ARCHRequestHandler-Status').show(); // AJAX icon
        var previewNumber = 5;
        if (parseInt(this.active.size) < 5) {
            previewNumber = parseInt(this.active.size);
        }
        $('ARCHRequestHandler-PreviewText').innerHTML = 'Generating a preview of the first ' + previewNumber + ' out of ' + this.active.size + ' records...';

        this.model.processed = 0;
        this.model.columns = 0;
        var viewResults = $('ARCHRequestHandler-PreResults');
        var patientSetSize = this.active.size;
        var processTime = $('ARCHRequestHandler-ProcessTime');
        var currentdate = new Date();
        var datetime = (currentdate.getMonth() + 1) + "-"
            + currentdate.getDate() + "-"
            + currentdate.getFullYear() + " @ "
            + currentdate.getHours() + ":"
            + currentdate.getMinutes() + ":"
            + currentdate.getSeconds();

        //processTime.innerHTML = "Process Started: " + datetime;

        var tableHTML = "<table id='ARCHRequestHandler-PreviewResults' cellspacing='0'><tr><th style='width:20px;'> </th>\n";
        var columnKeys = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'AA', 'AB', 'AC', 'AD', 'AE', 'AF', 'AG', 'AH', 'AI', 'AJ', 'AK', 'AL', 'AM', 'AN', 'AO', 'AP', 'AQ', 'AR', 'AS', 'AT', 'AU', 'AV', 'AW', 'AX', 'AY', 'AZ'];
        var headerHTML = "<tr><td style='background: #ebebeb;'>1</td>\n";

        for (var key in this.model.required) {
            if (this.model.required.hasOwnProperty(key)) {
                if (this.model.required[key].display) {
                    tableHTML += "<th>" + columnKeys[this.model.columns] + "</th>";
                    headerHTML += "<td style='border-bottom: 1px solid #e0e0e0;'>" + this.model.required[key].name + "</td>";
                    this.model.columns++;
                }
            }
        }

        for (var j = 0; j < this.model.concepts.length; j++) {
            tableHTML += "<th>" + columnKeys[this.model.columns] + "</th>";
            headerHTML += "<td style='border-bottom: 1px solid #e0e0e0;'>" + this.model.concepts[j].textDisplay + "<br/>[" + this.model.concepts[j].dataOption + "]" + this.makeDateRangeConstraintText(j) + "</td>";
            this.model.columns++;
        }

        tableHTML += headerHTML;
        tableHTML += "</tr></table>";
        viewResults.innerHTML = tableHTML;

        setTimeout(function () {
            this._getJobStatus(job_id);
        }, 2000);

        this.model.readyToPreview = false;
        //this.model.readyToProcess = true;
    },

//This method starts creating the result table and the headers.
    viewResults: function () {
        this.model.readyToProcess = false;
        this.dataRequested = true;
        try {
            $('ARCHRequestHandler-TAB3').click();
        }
        catch (e) {
            //console.log(e);
        }
        jQuery('#ARCHRequestHandler-Status').hide();

        $('ARCHRequestHandler-StatusView').innerHTML = '<img src="js-i2b2/cells/plugins/community/ARCHRequestHandler/assets/ajax.gif" align="absmiddle"/> Processed <span id="ARCHRequestHandler-Processed" style="font-weight:bold;">0</span> of <span id="ARCHRequestHandler-PatientSetSize" style="font-weight:bold;">0</span> patients...';
        $('ARCHRequestHandler-StatusView').show();

        this.model.processed = 0;

        var viewResults = $('ARCHRequestHandler-ViewResults');
        var processedText = $('ARCHRequestHandler-Processed');
        var patientSetSizeText = document.getElementById('ARCHRequestHandler-PatientSetSize');
        var patientSetSize = this.active.size;
        var processTime = $('ARCHRequestHandler-ProcessTime');
        var currentdate = new Date();
        var datetime = (currentdate.getMonth() + 1) + "-"
            + currentdate.getDate() + "-"
            + currentdate.getFullYear() + " @ "
            + currentdate.getHours() + ":"
            + currentdate.getMinutes() + ":"
            + currentdate.getSeconds();

        //$('ARCHRequestHandler-DownloadLink').hide();
        processTime.innerHTML = "Process Started: " + datetime;
        //processedText.innerHTML = 0;
        patientSetSizeText.innerHTML = patientSetSize;

        if (this.viewResultsTableOption)
            var tableHTML = "<table id='ARCHRequestHandler-Results' cellspacing='0'><tr>\n";
        this.model.csv = '';
        var requiredfound = false;
        for (var key in this.model.required) {
            if (this.model.required.hasOwnProperty(key)) {
                if (this.model.required[key].display) {
                    requiredfound = true;
                    this.model.csv += this.model.required[key].name + ",";
                    if (this.viewResultsTableOption)
                        tableHTML += "<th>" + this.model.required[key].name + "</th>";
                }
            }
        }

        //tableHTML += "<tr><th>Subject ID</th><th>i2b2 Number</th><th>Gender</th><th>Age</th><th>Race</th><th>DNA</th><th>Plasma</th><th>Serum</th>";
        //this.model.csv = "subject_id,i2b2_patient_num,gender,age,race,dna,plasma,serum";

        for (var j = 0; j < this.model.concepts.length; j++) {
            //tableHTML += "<th>" + this.model.concepts[j].sdxData.origData.name + " ("+this.model.concepts[j].sdxData.origData.basecode+")</th>";
            //tableHTML += "<th>" + this.model.concepts[j].sdxData.origData.name + "</th>";
            if (this.viewResultsTableOption)
                tableHTML += "<th>" + this.model.concepts[j].textDisplay + "<br/>[" + this.model.concepts[j].dataOption + "]" + this.makeDateRangeConstraintText(j) + "</th>";

            this.model.csv += this.model.concepts[j].textDisplay + " (" + this.model.concepts[j].dataOption + ")";
            this.model.csv += ",";
            this.model.csv = this.model.csv.replace('&lt;', '<');
            this.model.csv = this.model.csv.replace('&gt;', '>');
            this.model.csv = this.model.csv.replace('&le;', '<=');
            this.model.csv = this.model.csv.replace('&ge;', '>=');
        }
        if (this.viewResultsTableOption)
            tableHTML += "</tr></table>";
        this.model.csv = this.model.csv.substring(0, this.model.csv.length - 1);  // trim last comma
        this.model.csv += "\n";
        if (this.viewResultsTableOption)
            viewResults.innerHTML = tableHTML;

        this.getResults(1, this.model.pageSize, false);
    },


    /* ==================================================================================================================
     * Debug methods to output debug message to external window. Can be disabled by setting i2b2.ARCHRequestHandler.debug to false.
     * ================================================================================================================== */
    reviewWindow: undefined,           // external window used for debugging
    debug: {
        externalWindow: {
            startViewResults: function () {
                var cd = new Date();
                var dt = (cd.getMonth() + 1) + "/"
                    + cd.getDate() + "/"
                    + cd.getFullYear() + " @ "
                    + cd.getHours() + ":"
                    + cd.getMinutes() + ":"
                    + cd.getSeconds();
                this.reviewWindow.document.write("<p>[START GETTING NEW PATIENTS(" + this.active.size + ")] (" + dt + ")</p>\n");
            },
            startGetResults: function (minValue, maxValue) {
                var cd = new Date();
                var dt = (cd.getMonth() + 1) + "/"
                    + cd.getDate() + "/"
                    + cd.getFullYear() + " @ "
                    + cd.getHours() + ":"
                    + cd.getMinutes() + ":"
                    + cd.getSeconds();
                this.reviewWindow.document.write("<p>[Sending for " + minValue + "-" + maxValue + "] (" + dt + ")</p>\n");
            },
            endGetResults: function (minValue, maxValue) {
                var cd2 = new Date();
                var dt2 = (cd2.getMonth() + 1) + "/"
                    + cd2.getDate() + "/"
                    + cd2.getFullYear() + " @ "
                    + cd2.getHours() + ":"
                    + cd2.getMinutes() + ":"
                    + cd2.getSeconds();
                this.reviewWindow.document.write("<p>[Received " + minValue + "-" + maxValue + "] (" + dt2 + ")</p>\n");
            },
            out: function (message) {
                reviewWindow.document.write(message);
            }
        }
    },
    /* end of Debug methods to output debug message to external window. */
//},               // declare the debug namespaces;

    getResults: function (minValue, maxValue, preview) {
        if (this.model.dirtyResultsData) {
            jQuery("#iframeHolder").hide()
            // translate the concept XML for injection as PDO item XML
            var filterList = '';
            for (var i1 = 0; i1 < this.model.concepts.length; i1++) {
                var sdxData = this.model.concepts[i1].sdxData;
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
                    var modifierConstraints = (this.model.concepts[i1].valueRestriction != null) ? i2b2.CRC.view.modLabvaluesCtlr.getModLabValuesForXML(this.model.concepts[i1].valueRestriction) : "";
                    filterList +=
                        '	<panel name="' + sdxData.origData.key + '">\n' +
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
                else // deal with normal concepts
                {
                    // get XML representation of the concept's value restrictions
                    var valueConstraints = (this.model.concepts[i1].valueRestriction != null) ? i2b2.CRC.view.modLabvaluesCtlr.getModLabValuesForXML(this.model.concepts[i1].valueRestriction) : "";

                    var t = sdxData.origData.xmlOrig;
                    var cdata = {};
                    cdata.level = i2b2.h.getXNodeVal(t, "level");
                    cdata.key = i2b2.h.getXNodeVal(t, "key");
                    cdata.tablename = i2b2.h.getXNodeVal(t, "tablename");
                    cdata.dimcode = i2b2.h.getXNodeVal(t, "dimcode");
                    cdata.synonym = i2b2.h.getXNodeVal(t, "synonym_cd");
                    filterList +=
                        '	<panel name="' + cdata.key + '">\n' +
                        '		<panel_number>' + i1 + '</panel_number>\n' +
                        '		<panel_accuracy_scale>0</panel_accuracy_scale>\n' +
                        '		<invert>0</invert>\n' +
                        '		<item>\n' +
                        '			<hlevel>' + cdata.level + '</hlevel>\n' +
                        '			<item_key>' + cdata.key + '</item_key>\n' +
                        '			<dim_tablename>' + cdata.tablename + '</dim_tablename>\n' +
                        '			<dim_dimcode>' + cdata.dimcode + '</dim_dimcode>\n' +
                        '			<item_is_synonym>' + cdata.synonym + '</item_is_synonym>\n' +
                        '          ' + valueConstraints;
                    filterList += '		</item>\n' + '	</panel>\n';
                }


            }

            var pgstart = this.model.pgstart;
            var pgend = pgstart + this.model.pgsize - 1;
            var msg_filter = '<input_list>\n' +
                '	<patient_list max="' + maxValue + '" min="' + minValue + '">\n' +
                '		<patient_set_coll_id>' + this.model.prsRecord.sdxInfo.sdxKeyValue + '</patient_set_coll_id>\n' +
                '	</patient_list>\n' +
                '</input_list>\n' +
                '<filter_list>\n' +
                filterList +
                '</filter_list>\n' +
                '<output_option names="asattributes">\n' +
                '	<observation_set blob="false" onlykeys="false"/>\n' +
                /*'	<observation_set selectionFilter="first_value" blob="false" onlykeys="false"/>\n'+ */
                '	<patient_set select="using_input_list" onlykeys="false"/>\n' +
                '</output_option>\n';


            // callback processor
            var scopedCallback = new i2b2_scopedCallback();
            scopedCallback.scope = this;
            scopedCallback.callback = function (results) {
                // THIS function is used to process the AJAX results of the getChild call
                //		results data object contains the following attributes:
                //			refXML: xmlDomObject <--- for data processing
                //			msgRequest: xml (string)
                //			msgResponse: xml (string)
                //			error: boolean
                //			errorStatus: string [only with error=true]
                //			errorMsg: string [only with error=true]
                // check for errors
                if (results.error) {
                    //Retry the call
                    //console.log('Error during getResults for minValue: ' + minValue + ', maxValue: ' + maxValue + '. Retrying...');
                    if (this.debug.useReviewWindow)
                        this.debug.externalWindow.out("<p>[Failed " + minValue + "-" + maxValue + ". Retry.] </p>");
                    this.getResults(minValue, maxValue, false);
                    return false;
                }
                var s = '';
                var patients = {};
                // get all the patient records
                var pData = i2b2.h.XPath(results.refXML, '//patient');
                for (var i = 0; i < pData.length; i++) {
                    var patientID = i2b2.h.getXNodeVal(pData[i], "patient_id");
                    var subjectID = i2b2.h.XPath(pData[i], 'descendant-or-self::param[@column="subject_id"]/text()');
                    var subject = "";
                    if (subjectID.length)
                        subject = subjectID[0].nodeValue;
                    var sex_cd = i2b2.h.XPath(pData[i], 'descendant-or-self::param[@column="sex_cd"]/text()');
                    var gender = "";
                    if (sex_cd.length) {
                        var sex_cd_val = sex_cd[0].nodeValue;
                        if (sex_cd_val == 'M') {
                            gender = 'Male';
                        }
                        if (sex_cd_val == 'F') {
                            gender = 'Female';
                        }
                        if (sex_cd_val == 'U') {
                            gender = 'Unknown';
                        }
                    }
                    var age_in_years = i2b2.h.XPath(pData[i], 'descendant-or-self::param[@column="age_in_years_num"]/text()');
                    var age = "";
                    if (age_in_years.length)
                        age = age_in_years[0].nodeValue;
                    var race_cd = i2b2.h.XPath(pData[i], 'descendant-or-self::param[@column="race_cd"]/text()');
                    var race = "";
                    if (race_cd.length)
                        race = race_cd[0].nodeValue;//.substring(0,1).toUpperCase() + race_cd[0].nodeValue.substring(1);
                    patients[patientID] = {};
                    patients[patientID].id = patientID;    // id is a required unique value for each row in slickgrid (like a primary key)
                    patients[patientID].subject_id = subject;
                    patients[patientID].gender = gender;
                    patients[patientID].age = age;
                    patients[patientID].race = race;
                    patients[patientID].conceptCounts = [];

                }

                // initialize concept counts for all patients
                for (var p in patients) {
                    for (var k = 0; k < this.model.concepts.length; k++) {
                        patients[p].conceptCounts[k] = false;
                    }
                }

                // get all the observations (Observation (oData) are guaranteed to be orderd (in osData) in the same order as ARCHRequestHandler.model.concepts. The following code relies on that assumption.)
                var osData = i2b2.h.XPath(results.refXML, '//*[local-name() = "observation_set"]');
                var osCurIndex = 0;
                for (var i = 0; i < this.model.concepts.length; i++) {
                    if (this.model.concepts[i].sdxData.origData.table_name.toLowerCase() == 'concept_dimension' ||     // handle normal concepts
                        this.model.concepts[i].sdxData.origData.table_name.toLowerCase() == "modifier_dimension")     // handle modifers
                    {
                        var oData = i2b2.h.XPath(osData[osCurIndex], 'descendant::observation');
                        for (var j = 0; j < oData.length; j++) {
                            if (j < oData.length) { // there are still more observations
                                if ((i2b2.h.getXNodeVal(oData[j], "event_id") == i2b2.h.getXNodeVal(oData[j + 1], "event_id")) &&
                                    (i2b2.h.getXNodeVal(oData[j], "patient_id") == i2b2.h.getXNodeVal(oData[j + 1], "patient_id")) &&
                                    (i2b2.h.getXNodeVal(oData[j], "concept_cd") == i2b2.h.getXNodeVal(oData[j + 1], "concept_cd")) &&
                                    (i2b2.h.getXNodeVal(oData[j], "observer_cd") == i2b2.h.getXNodeVal(oData[j + 1], "observer_cd")) &&
                                    (i2b2.h.getXNodeVal(oData[j], "start_date") == i2b2.h.getXNodeVal(oData[j + 1], "start_date")) &&
                                    (i2b2.h.getXNodeVal(oData[j], "modifier_cd") == i2b2.h.getXNodeVal(oData[j + 1], "modifier_cd")) &&
                                    (i2b2.h.getXNodeVal(oData[j], "instance_num") == i2b2.h.getXNodeVal(oData[j + 1], "instance_num"))) {
                                    continue;
                                }
                            }

                            var patientID = i2b2.h.getXNodeVal(oData[j], "patient_id");

                            // depending on each column's cellDataOption, we filter for First, Last, Min, Max, or compute for Count
                            if (this.model.concepts[i].dataOption === this.cellDataOption.DEFAULT) // Existence: whether a patient has an observation of this type
                            {
                                if (patients[patientID].conceptCounts[i] == false)
                                    patients[patientID].conceptCounts[i] = true;
                            }
                            else if (this.model.concepts[i].dataOption === this.cellDataOption.FIRST) // Date: the FIRST time a patient has an observation of this type
                            {
                                var newMoment = new moment(i2b2.h.getXNodeVal(oData[j], "start_date")); // parse the date/time String to build a moment object
                                if (!patients[patientID].conceptCounts[i]) { // no existing value, use newMoment directly
                                    patients[patientID].conceptCounts[i] = newMoment; //Original
                                    // patients[patientID].conceptCounts[i] = moment(i2b2.h.getXNodeVal(oData[j], "start_date")).format("YYYY-MM-DD HH:mm:ss");
                                }
                                else {
                                    if (newMoment.isBefore(patients[patientID].conceptCounts[i])) { // compare existing moment with the new one and use the minimum (first)
                                        patients[patientID].conceptCounts[i] = newMoment;
                                    }
                                }
                            }
                            else if (this.model.concepts[i].dataOption === this.cellDataOption.LAST) // Date: the LAST time a patient has an observation of this type
                            {
                                var newMoment = new moment(i2b2.h.getXNodeVal(oData[j], "start_date")); // parse the date/time String to build a moment object
                                if (!patients[patientID].conceptCounts[i]) // no existing value, use newMoment directly
                                    patients[patientID].conceptCounts[i] = newMoment;
                                else {
                                    if (newMoment.isAfter(patients[patientID].conceptCounts[i])) // compare existing moment with the new one and use the maximum (last)
                                        patients[patientID].conceptCounts[i] = newMoment;
                                }
                            }
                            else if (this.model.concepts[i].dataOption === this.cellDataOption.MIN) // Minimum Value: the MIN value (if applicable) of all observations of this type
                            {
                                var val = parseFloat(i2b2.h.getXNodeVal(oData[j], "nval_num"));
                                if (!patients[patientID].conceptCounts[i] || patients[patientID].conceptCounts[i] > val)
                                    patients[patientID].conceptCounts[i] = val;
                            }
                            else if (this.model.concepts[i].dataOption === this.cellDataOption.MAX) // Maximum Value: the MAX value (if applicable) of all observations of this type
                            {
                                var val = parseFloat(i2b2.h.getXNodeVal(oData[j], "nval_num"));
                                if (!patients[patientID].conceptCounts[i] || patients[patientID].conceptCounts[i] < val)
                                    patients[patientID].conceptCounts[i] = val;
                            }
                            else if (this.model.concepts[i].dataOption === this.cellDataOption.COUNT) // Number of times of the observation of this type the patient has.
                            {
                                if (patients[patientID].conceptCounts[i] == false) {
                                    patients[patientID].conceptCounts[i] = 0;
                                }
                                if (!patients[patientID].conceptCounts[i]) // no existing value, so the count should now be 1
                                    patients[patientID].conceptCounts[i] = 1;
                                else
                                    patients[patientID].conceptCounts[i] = patients[patientID].conceptCounts[i] + 1; // increment count by 1
                            }
                        }
                        osCurIndex++;
                    }
                    else if (this.model.concepts[i].sdxData.origData.table_name.toLowerCase() == 'patient_dimension') // handle concepts from Demographics (e.g. Age, Gender, Race, etc.)
                    {
                        var colName = this.model.concepts[i].sdxData.origData.column_name.toLowerCase();
                        var dimCode = this.model.concepts[i].sdxData.origData.dim_code;
                        var operator = this.model.concepts[i].sdxData.origData.operator;
                        for (var p in patients) {
                            var value = i2b2.h.XPath(results.refXML, '//patient[patient_id=' + p + ']/descendant-or-self::param[@column="' + colName + '"]/text()');
                            var type = i2b2.h.XPath(results.refXML, '//patient[patient_id=' + p + ']/descendant-or-self::param[@column="' + colName + '"]/@type');
                            if (operator == "IN" || operator == "=") {
                                if ((dimCode.indexOf("'" + value[0].nodeValue + "'") >= 0) || (dimCode == value[0].nodeValue) || (dimCode.indexOf(value[0].nodeValue) >= 0)) {
                                    if (this.model.concepts[i].dataOption === this.cellDataOption.DEFAULT) // Existence: whether a patient has an observation of this type
                                    {
                                        if (patients[p].conceptCounts[i] == false)
                                            patients[p].conceptCounts[i] = true;
                                    }
                                    else if (this.model.concepts[i].dataOption === this.cellDataOption.FIRST) // Date: the FIRST time a patient has an observation of this type
                                    {
                                        var newMoment = new moment(i2b2.h.getXNodeVal(oData[j], "start_date")); // parse the date/time String to build a moment object
                                        if (!patients[p].conceptCounts[i]) // no existing value, use newMoment directly
                                            patients[p].conceptCounts[i] = newMoment;
                                        else {
                                            if (newMoment.isBefore(patients[p].conceptCounts[i])) // compare existing moment with the new one and use the minimum (first)
                                                patients[p].conceptCounts[i] = newMoment;
                                        }
                                    }
                                    else if (this.model.concepts[i].dataOption === this.cellDataOption.LAST) // Date: the LAST time a patient has an observation of this type
                                    {
                                        var newMoment = new moment(i2b2.h.getXNodeVal(oData[j], "start_date")); // parse the date/time String to build a moment object
                                        if (!patients[p].conceptCounts[i]) // no existing value, use newMoment directly
                                            patients[p].conceptCounts[i] = newMoment;
                                        else {
                                            if (newMoment.isAfter(patients[p].conceptCounts[i])) // compare existing moment with the new one and use the maximum (last)
                                                patients[p].conceptCounts[i] = newMoment;
                                        }
                                    }
                                    else if (this.model.concepts[i].dataOption === this.cellDataOption.MIN) // Minimum Value: the MIN value (if applicable) of all observations of this type
                                    {
                                        var val = parseFloat(i2b2.h.getXNodeVal(oData[j], "nval_num"));
                                        if (!patients[p].conceptCounts[i] || patients[p].conceptCounts[i] > val)
                                            patients[p].conceptCounts[i] = val;
                                    }
                                    else if (this.model.concepts[i].dataOption === this.cellDataOption.MAX) // Maximum Value: the MAX value (if applicable) of all observations of this type
                                    {
                                        var val = parseFloat(i2b2.h.getXNodeVal(oData[j], "nval_num"));
                                        if (!patients[p].conceptCounts[i] || patients[p].conceptCounts[i] < val)
                                            patients[p].conceptCounts[i] = val;
                                    }
                                    else if (this.model.concepts[i].dataOption === this.cellDataOption.COUNT) // Number of times of the observation of this type the patient has.
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


                    if (i == this.model.concepts.length - 1) { // last concept
                        var oData = i2b2.h.XPath(osData[osCurIndex], 'descendant::observation');
                        for (var j = 0; j < oData.length; j++) {
                            var patientID = i2b2.h.getXNodeVal(oData[j], "patient_id");

                        }
                        var oData = i2b2.h.XPath(osData[osCurIndex + 1], 'descendant::observation');
                        for (var j = 0; j < oData.length; j++) {
                            var patientID = i2b2.h.getXNodeVal(oData[j], "patient_id");

                            if (patients[patientID].plasma == false)
                                patients[patientID].plasma = true;
                        }
                        var oData = i2b2.h.XPath(osData[osCurIndex + 2], 'descendant::observation');
                        for (var j = 0; j < oData.length; j++) {
                            var patientID = i2b2.h.getXNodeVal(oData[j], "patient_id");

                            if (patients[patientID].serum == false)
                                patients[patientID].serum = true;
                        }

                    }
                }

                var tableResults = document.getElementById('ARCHRequestHandler-Results');
                if (preview) {
                    tableResults = document.getElementById('ARCHRequestHandler-PreviewResults');
                }
                for (var p in patients) {
                    if (this.viewResultsTableOption || preview)
                        var newRow = tableResults.insertRow(-1);
                    var cellCount = 0;
                    var requiredfound = false;
                    for (var key in this.model.required) {
                        if (this.model.required.hasOwnProperty(key)) {
                            if (this.model.required[key].display) {
                                requiredfound = true;
                                if (this.viewResultsTableOption || preview)
                                    var cell = newRow.insertCell(cellCount);
                                if (key == "dna" || key == "serum" || key == "plasma") {
                                    if (patients[p][key] == false) {
                                        if (this.viewResultsTableOption || preview)
                                            cell.innerHTML = "No";
                                    } else {
                                        if (this.viewResultsTableOption || preview)
                                            cell.innerHTML = "Yes";
                                    }
                                } else {
                                    if (this.viewResultsTableOption || preview)
                                        cell.innerHTML = patients[p][key];
                                }

                                if (cellCount == 0) {
                                    if (!preview) {
                                        if (key == "dna" || key == "serum" || key == "plasma") {
                                            if (patients[p][key] == false) {
                                                this.model.csv += "No";
                                            } else {
                                                this.model.csv += "Yes";
                                            }
                                        } else {
                                            this.model.csv += patients[p][key];
                                        }
                                    }
                                } else {
                                    if (!preview) {
                                        if (key == "dna" || key == "serum" || key == "plasma") {
                                            if (patients[p][key] == false) {
                                                this.model.csv += ",No";
                                            } else {
                                                this.model.csv += ",Yes";
                                            }
                                        } else {
                                            this.model.csv += "," + patients[p][key];
                                        }
                                    }
                                }
                                if (key == "race") {
                                    if (this.viewResultsTableOption || preview)
                                        cell.style.fontSize = "10px";
                                }
                                cellCount++;
                            }
                        }
                    }

                    // Process each cell for each column:

                    if (requiredfound)
                        this.model.csv += ",";

                    //this.model.csv += patients[p].subject_id + "," + patients[p].id + "," + patients[p].gender + "," + patients[p].age + "," + patients[p].race + "," + patients[p].dna + "," + patients[p].plasma + "," + patients[p].serum;
                    for (var i = 0; i < this.model.concepts.length; i++) {

                        if (this.viewResultsTableOption || preview)
                            var newCell = newRow.insertCell(cellCount + i);
                        if (this.model.concepts[i].dataOption === this.cellDataOption.COUNT) {
                            if (patients[p].conceptCounts[i] == false) {
                                if (this.viewResultsTableOption || preview)
                                    newCell.innerHTML = 0;
                                if (!preview)
                                    this.model.csv += "0,";
                            } else {
                                if (this.viewResultsTableOption || preview)
                                    newCell.innerHTML = patients[p].conceptCounts[i];
                                if (!preview)
                                    this.model.csv += patients[p].conceptCounts[i] + ",";
                            }
                        } else if ((this.model.concepts[i].dataOption === this.cellDataOption.FIRST) || (this.model.concepts[i].dataOption === this.cellDataOption.LAST)) {
                            if (patients[p].conceptCounts[i] == false) {
                                if (this.viewResultsTableOption || preview)
                                    newCell.innerHTML = "";
                                if (!preview)
                                    this.model.csv += ",";
                            } else {
                                var formattedDate = patients[p].conceptCounts[i]._d;
                                formattedDate = moment(formattedDate).format("YYYY-MM-DD HH:mm:ss");
                                if (formattedDate) {
                                    if (this.viewResultsTableOption || preview)
                                        newCell.innerHTML = formattedDate;
                                    if (!preview)
                                        this.model.csv += formattedDate + ",";
                                }
                                else {
                                    if (this.viewResultsTableOption || preview)
                                        newCell.innerHTML = patients[p].conceptCounts[i]._d;
                                    if (!preview)
                                        this.model.csv += patients[p].conceptCounts[i]._d + ",";
                                }
                            }
                        } else if (this.model.concepts[i].dataOption === this.cellDataOption.DEFAULT) {
                            if (patients[p].conceptCounts[i] == false) {
                                if (this.viewResultsTableOption || preview)
                                    newCell.innerHTML = "No";
                                if (!preview)
                                    this.model.csv += "No,";
                            } else {
                                if (this.viewResultsTableOption || preview)
                                    newCell.innerHTML = "Yes";
                                if (!preview)
                                    this.model.csv += "Yes,";
                            }
                        } else if ((this.model.concepts[i].dataOption === this.cellDataOption.MIN) || (this.model.concepts[i].dataOption === this.cellDataOption.MAX)) {
                            if (patients[p].conceptCounts[i] == false) {
                                if (patients[p].conceptCounts[i].toString() == "0") {
                                    if (this.viewResultsTableOption || preview)
                                        newCell.innerHTML = "0";
                                    if (!preview)
                                        this.model.csv += "0,";
                                } else {
                                    if (this.viewResultsTableOption || preview)
                                        newCell.innerHTML = "";
                                    if (!preview)
                                        this.model.csv += ",";
                                }
                            } else {
                                if (this.viewResultsTableOption || preview)
                                    newCell.innerHTML = patients[p].conceptCounts[i];
                                if (!preview)
                                    this.model.csv += patients[p].conceptCounts[i] + ",";
                            }

                        } else {
                            if (this.viewResultsTableOption || preview)
                                newCell.innerHTML = patients[p].conceptCounts[i];
                            if (!preview)
                                this.model.csv += patients[p].conceptCounts[i] + ",";
                        }

                        /*
                         if (patients[p].conceptCounts[i] == 1)
                         {
                         newCell.innerHTML = '<img src="js-i2b2/cells/plugins/community/ARCHRequestHandler/assets/check.png"/> Yes';
                         newCell.style.fontWeight = "bold";
                         this.model.csv += ",Yes";
                         }
                         else
                         {
                         newCell.innerHTML = 'No';
                         this.model.csv += ",No";
                         }
                         */
                        //  this.model.csv += "," + patients[p].conceptCounts[i];
                    }

                    if (!preview) {
                        this.model.csv = this.model.csv.substring(0, this.model.csv.length - 1);  // trim last comma
                        this.model.csv += "\n";

                    }
                }

                // update dataView and redraw table

                // update status bar
                //this.model.active.progress = this.model.active.progress + pData.length;
                //document.getElementById("fetchedNumerator").innerHTML = this.model.active.progress;
                var patientSetSize = this.active.size;

                if (preview) {
                    var currentdate = new Date();
                    var datetime = (currentdate.getMonth() + 1) + "/"
                        + currentdate.getDate() + "/"
                        + currentdate.getFullYear() + " @ "
                        + currentdate.getHours() + ":"
                        + currentdate.getMinutes() + ":"
                        + currentdate.getSeconds();
                    var processTime = document.getElementById('ARCHRequestHandler-ProcessTime');
                    var previewText = document.getElementById('ARCHRequestHandler-PreviewText');
                    processTime.innerHTML = processTime.innerHTML + " | Finished: " + datetime;
                    previewText.innerHTML = "";
                    var prevRecText = (patientSetSize > 5) ? ("5 out of " + patientSetSize) : (patientSetSize + " out of " + patientSetSize);
                    previewText.innerHTML = "Below is a preview of " + prevRecText + " records from the requested data.  Click on <strong>Proceed to Download</strong> to download the entire file.";
                    var statusText = document.getElementById('ARCHRequestHandler-Status');
                    statusText.innerHTML = "<a href='javascript:this.viewResults()'>Proceed to Download</a>";
                } else {
                    if (maxValue > patientSetSize) { // this is the last page
                        var processTime = document.getElementById('ARCHRequestHandler-ProcessTime');
                        var previewText = document.getElementById('ARCHRequestHandler-PreviewText');
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
                        var statusText = document.getElementById('ARCHRequestHandler-StatusView');
                        statusText.innerHTML = "Finished processing " + patientSetSize + " patients. Your data file is ready to be downloaded.";
                        jQuery("#iframeHolder").show();
                        // this.downloadFileReady();
                        // this.downloadPtFileReady();
                        this.model.dirtyResultsData = false; // finished all pages, mark results up-to-date
                    }
                    else {

                        this.model.processed += this.model.pageSize;
                        var processedText = document.getElementById('ARCHRequestHandler-Processed');
                        processedText.innerHTML = this.model.processed;
                        // we are done with the current page of patients, now fetch the next one.
                        this.getResults(minValue + this.model.pageSize, maxValue + this.model.pageSize, false);
                    }
                    /*
                     if (this.model.pageStartingIndex + this.model.active.progress - 1 === this.model.pageEndingIndex ||
                     minValue + pData.length - 1 === this.model.active.size)                                 // finished the last page
                     {
                     this.model.dirtyResultsData = false; // optimization - only requery when the input data is changed
                     jQuery("#fetchedPatients").css("display", "none");
                     jQuery("#selectedPatients").css("display", "inline");
                     //update page info and prev/next divs
                     jQuery("#pageInfo").text("Showing Patients " + this.model.pageStartingIndex + " to " + Math.min(this.model.pageEndingIndex, this.model.active.size) + " of total " + this.model.active.size);
                     this.autoUpdateNavigatorUI(); // update the getNextPage and getPreviousPage divs appropriately
                     }
                     else // not yet done with the current page, get more patients until pageEndingIndex is reached
                     {
                     this.getResults(this.model.pageStartingIndex + this.model.active.progress, this.model.pageEndingIndex, false);
                     }*/

                }


            }
            // prior to making PDO call, clear logs every 3 PDO calls to curb memory usage:
            // bugbug: don't clear the logs while we are debugging.
            if (this.msgCounter % 3 == 2)
                i2b2.hive.MsgSniffer.signalMessageDB = [];
            this.msgCounter++;

            // AJAX CALL USING THE EXISTING CRC CELL COMMUNICATOR
            var operationType = preview ? "PR" : "DL";
            var msgEvntType = "Download_" + this.downloadID + "_" + operationType + "_" + this.active.size + "_" + this.queryMasterId + "_";
            i2b2.CRC.ajax.getPDO_fromInputList("Plugin:ARCHRequestHandler", {
                msg_event_type: msgEvntType,
                PDO_Request: msg_filter
            }, scopedCallback);
        }
    },


    setShowMetadataDialog: function (sdxData) {
        this.model.showMetadataDialog = sdxData;
    },

    Unload: function () {
        // purge old data
        this.model = {};
        this.model.prsRecord = false;
        this.model.conceptRecord = false;
        this.model.dirtyResultsData = true;
        try {
            this.yuiPanel.destroy();
        } catch (e) {
        }
        return true;
    },

    queryConceptDropped: function (sdxData) {
        sdxData = sdxData[0];

        $("ARCHRequestHandler-CONCPTDROP").style.background = "#DEEBEF";
        $("ARCHRequestHandler-CONCPTDROP").innerHTML = '<div class="concptItem"><img src="js-i2b2/cells/plugins/community/ARCHRequestHandler/assets/spinning.gif" align="absmiddle" style="margin-left:5px;"/> Loading Concepts from Previous Query ...</div>';

        this.loadQueryConcepts(sdxData.sdxInfo.sdxKeyValue);

    },

    queryDropped: function (sdxData) {
        sdxData = sdxData[0];

        $("ARCHRequestHandler-PRSDROP").style.background = "#DEEBEF";
        $("ARCHRequestHandler-PRSDROP").innerHTML = '<img src="js-i2b2/cells/plugins/community/ARCHRequestHandler/assets/spinning.gif" align="absmiddle" style="margin-left:5px;"/> Loading Previous Query ...';

        // The sdxInfo being loaded/dropped is of sdxType 'QM' (Query Master)
        // Take QM ID and find 1) patient count 2) patient set 3) breakdowns
        this.active.query = sdxData;
        this.loadQueryInfo(sdxData.sdxInfo.sdxKeyValue);
        if (document.getElementById('ARCHRequestHandler-LoadConcepts').checked) {
            if (this.model.concepts.length > 0) {
                var clobberConcepts = confirm("You have chosen to automatically 'Include concepts from the Previous Query' which will replace your current list of specified concepts. Click OK to confirm.");
                if (clobberConcepts) {
                    this.loadQueryConcepts(sdxData.sdxInfo.sdxKeyValue);
                } else {
                    this.conceptsRender();
                }
            } else {
                this.loadQueryConcepts(sdxData.sdxInfo.sdxKeyValue);
            }
        } else {
            this.conceptsRender();
        }

        //    $("ARCHRequestHandler-patientset").value = i2b2.h.Escape(sdxData.sdxInfo.sdxDisplayName);
        //BG
        this.model.csv = '';
        this.previewRequested = false;
        this.dataRequested = false;
        //End BG
    },

    queryAutoDropped: function (qm_id) {
        this.loadQueryInfo(qm_id);
        this.loadQueryConcepts(qm_id);
        $("ARCHRequestHandler-PRSDROP").style.background = "#DEEBEF";
        $("ARCHRequestHandler-PRSDROP").innerHTML = '<img src="js-i2b2/cells/plugins/community/ARCHRequestHandler/assets/spinning.gif" align="absmiddle" style="margin-left:5px;"/> Loading Previous Query ...';
        //    $("ARCHRequestHandler-patientset").value = i2b2.h.Escape(sdxData.sdxInfo.sdxDisplayName);
    },

    prsUnload: function () {
        this.model.prsRecord = false;
        $("ARCHRequestHandler-PRSDROP").style.background = "#DEEBEF";
        $("ARCHRequestHandler-PRSDROP").innerHTML = '<img src="js-i2b2/cells/plugins/community/ARCHRequestHandler/assets/pointer.png" align="absbottom" style="margin-left:5px;" /> Drag &amp; Drop a <em>Previous Query</em> with a Patient Set here';
        this.active = {};
        //BG
        for (var i = 0; i < this.model.concepts.length; i++) {
            this.conceptDelete(i);
        }
        this.model.csv = '';
        this.previewRequested = false;
        this.dataRequested = false;
        //End BG
    },

    loadQueryInfo: function (query_master_id) {

        this.queryMasterId = query_master_id;
        this.readyToPreview = true;
        this.model.firstVisit = false;

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
                this.model.activeQueryName = i2b2.h.getXNodeVal(results.refXML, 'name');
            }


            var scopedCallbackQI = new i2b2_scopedCallback();
            scopedCallbackQI.scope = this.active.query;
            scopedCallbackQI.callback = function (results) {

                var qi = results.refXML.getElementsByTagName('query_instance');
                this.active.query_instance_id = i2b2.h.getXNodeVal(qi[0], 'query_instance_id');

                var scopedCallbackQRS = new i2b2_scopedCallback();
                scopedCallbackQRS.scope = this.active.query;
                scopedCallbackQRS.callback = function (results) {
                    var found_patient_set = false;
                    this.active.QRS = [];
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
                            if (!temp.title) {
                                temp.title = i2b2.CRC.ctrlr.QueryStatus._GetTitle(temp.QRS_Type, temp, qi);
                            }
                            if (temp.QRS_Status_ID != 3) {
                                $("ARCHRequestHandler-PRSDROP").innerHTML = 'There was a problem loading this query. Please try a different query.';
                                $("ARCHRequestHandler-PRSDROP").style.background = "#F6CCDA";
                                alert("The selected query is unfinished! Please select a finished query to make a request.");
                                break;
                            }
                            this.active.QRS.push(temp);
                        } catch (e) {
                        }
                    }

                    // Start loop through Query Result Set
                    for (var i = 0; i < this.active.QRS.length; i++) {
                        var query_result = this.active.QRS[i];
                        switch (query_result.QRS_DisplayType) {
                            case "LIST": // Check to see if query has a Patient Set
                                if (query_result.QRS_Type == "PATIENTSET") {
                                    //alert("Patient Set has been found");
                                    found_patient_set = true;
                                    var sdxTemp = {
                                        sdxInfo: {
                                            sdxControlCell: "CRC",
                                            sdxDisplayName: query_result.title,
                                            sdxKeyName: "result_instance_id",
                                            sdxKeyValue: query_result.QRS_ID,
                                            sdxType: "PRS"
                                        }
                                    };
                                    this.model.prsRecord = sdxTemp;
                                    this.model.dirtyResultsData = true;
                                    this.active.size = query_result.size;

                                }
                                break;
                        }
                    } // End loop through Query Result Set

                    if (found_patient_set) {

                        $("ARCHRequestHandler-PRSDROP").innerHTML = '<img src="js-i2b2/cells/CRC/assets/sdx_CRC_PRS.jpg" align="absbottom" style="margin-left:5px;"/> ' + i2b2.h.Escape(this.model.activeQueryName) + '&nbsp;<strong>[Patient Count: ' + this.active.size + ']</strong>&nbsp;<a href="#" onclick="javascript:i2b2.ARCHRequestHandler.Downloader.prsUnload();return false;"><img src="js-i2b2/cells/plugins/community/ARCHRequestHandler/assets/delete.png" title="Clear Selection" align="absbottom" border="0"/></a>';
                        $("ARCHRequestHandler-PRSDROP").style.background = "#CFB";
                        this.model.readyToPreview = true;
                        this.model.firstVisit = false;
                    }
                    else {
                        $("ARCHRequestHandler-PRSDROP").innerHTML = '<img src="js-i2b2/cells/plugins/community/ARCHRequestHandler/assets/warning.png" align="absbottom" style="margin-left:5px;"> A patient set was not found for this query. Please try a different query.';
                        $("ARCHRequestHandler-PRSDROP").style.background = "#F6CCDA";
                        this.model.readyToPreview = false;
                    }
                }
                i2b2.CRC.ajax.getQueryResultInstanceList_fromQueryInstanceId("Plugin:ARCHRequestHandler", {qi_key_value: this.active.query_instance_id}, scopedCallbackQRS);
            }
            i2b2.CRC.ajax.getQueryInstanceList_fromQueryMasterId("Plugin:ARCHRequestHandler", {qm_key_value: query_master_id}, scopedCallbackQI);


        }
        i2b2.CRC.ajax.getRequestXml_fromQueryMasterId("Plugin:ARCHRequestHandler", {qm_key_value: query_master_id}, scopedCallback);
    },


    prsDropped: function (sdxData) {
        sdxData = sdxData[0];	// only interested in first record
        // save the info to our local data model
        this.model.prsRecord = sdxData;
        // let the user know that the drop was successful by displaying the name of the patient set
        $("ARCHRequestHandler-PRSDROP").innerHTML = i2b2.h.Escape(sdxData.sdxInfo.sdxDisplayName);
        // temporarly change background color to give GUI feedback of a successful drop occuring
        $("ARCHRequestHandler-PRSDROP").style.background = "#CFB";
        setTimeout("$('ARCHRequestHandler-PRSDROP').style.background='#DEEBEF'", 250);
        // optimization to prevent requerying the hive for new results if the input dataset has not changed
        this.model.dirtyResultsData = true;
        /*
         var sdxTemp = {sdxInfo: { sdxControlCell: "CRC", sdxDisplayName: query_result.title,
         sdxKeyName: "result_instance_id", sdxKeyValue: query_result.QRS_ID, sdxType: "PRS" }};
         this.model.prsRecord = sdxTemp;
         this.model.dirtyResultsData = true;
         this.active.size = query_result.size;*/
    },


    loadQueryConcepts: function (qm_id) {
        //for (var i = 0; i < this.model.concepts.length; i++)
        //{
        //    i2b2.ARCHRequestHandler.conceptDelete(i);
        //}
        if (!document.getElementById('ARCHRequestHandler-AppendConcepts').checked) {
            this.model.concepts = []
        }
        this.conceptsRender();
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

                                //			    i2b2.ARCHRequestHandler.nich = sdxDataNode;

                                /*			    this.model.concepts.push(sdxDataNode);
                                 var cdetails = i2b2.ONT.ajax.GetTermInfo("CRC:QueryTool", {concept_key_value:sdxDataNode.origData.key, ont_synonym_records: true, ont_hidden_records: true} );
                                 var c = i2b2.h.XPath(cdetails.refXML, 'descendant::concept');
                                 if (c.length > 0)
                                 { sdxDataNode.origData.xmlOrig = c[0]; }

                                 this.conceptsRender();
                                 this.model.dirtyResultsData = true;
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
        i2b2.CRC.ajax.getRequestXml_fromQueryMasterId("Plugin:ARCHRequestHandler", {qm_key_value: qm_id}, scopedCallback);
    },


    conceptAutoDropped: function (sdxData) {
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
        conceptObj.dataOption = this.cellDataOption.DEFAULT;
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
            //	i2b2.ARCHRequestHandler.nich3 = cdetails.model[0];
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
        this.model.concepts.push(conceptObj);
        //End BG changes

        var sdxDataNode = i2b2.sdx.Master.EncapsulateData('CONCPT', sdxData.origData);

        // sort and display the concept list
        this.conceptsRender();
        // optimization to prevent requerying the hive for new results if the input dataset has not changed

        $("ARCHRequestHandler-CONCPTDROP").innerHTML = '<div class="concptItem"><img src="js-i2b2/cells/plugins/community/ARCHRequestHandler/assets/pointer.png" align="absbottom" style="margin-left:5px;" /> Drag &amp; Drop additional concepts here from <em>Navigate Terms</em> or a <em>Previous Query</em></div>';

        this.model.dirtyResultsData = true;
    },

    conceptDropped: function (sdxData, showDialog) {

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
        conceptObj.dataOption = this.cellDataOption.DEFAULT;
        //conceptObj.formatter  = this.cellFormatter.defaultFormatter;
        // save the concept object to our local data model
        this.model.concepts.push(conceptObj);

        this.lastDroppedTerm = conceptObj;     // remember the last Concept that is dropped

        // check to see if the new concept usese value retrictions (whether as a normal concept or a modifier)
        var lvMetaDatas1 = i2b2.h.XPath(sdxData.origData.xmlOrig, 'metadataxml/ValueMetadata[string-length(Version)>0]');
        //var lvMetaDatau1 = i2b2.h.XPath(sdxData.origData.xmlOrig, 'metadataxml/ValueMetadata/UnitValues/NormalUnits/text()');

        //if ((lvMetaDatas1.length > 0) && (this.model.showMetadataDialog) && (lvMetaDatau1.length > 0))
        if ((lvMetaDatas1.length > 0) && (this.model.showMetadataDialog)) {
            //bring up popup for concepts with value restrictions
            //Change for new value chooser architecture by BG
            // i2b2.ARCHRequestHandler.view.modalLabValues.show(this, sdxData.origData.key, conceptObj, sdxData.origData.isModifier);
            this.currentTerm = conceptObj;     // remember the last Concept that is dropped
            i2b2.CRC.view.modLabvaluesCtlr.selectValueBox(0, null, sdxData.origData.key, sdxData, false, i2b2.ARCHRequestHandler);
        }
        else {
            // sort and display the concept list
            this.conceptsRender();

        }
        // optimization to prevent requerying the hive for new results if the input dataset has not changed
        this.model.dirtyResultsData = true;
        this.model.readyToPreview = true;
    },

    conceptDelete: function (concptIndex) {
        // remove the selected concept
        this.model.concepts.splice(concptIndex, 1);
        // sort and display the concept list
        this.conceptsRender();
        // optimization to prevent requerying the hive for new results if the input dataset has not changed
        this.model.dirtyResultsData = true;
    },
// TODO determine if Resize code needs to be brought up to parent
// i2b2.ARCHRequestHandler.Resize = function () {
//     //var h = parseInt( $('anaPluginViewFrame').style.height ) - 61 - 17;
//     //$$("DIV#ARCHRequestHandler-mainDiv DIV#ARCHRequestHandler-TABS DIV.results-timelineBox")[0].style.height = h + 'px';
//     z = $('anaPluginViewFrame').getHeight() - 40; //- 34;  //BG vertical scrollbar display issues
//     //BG tabs being out of sight issue
//     var viewportOffset1 = $('anaPluginViewFrame').getBoundingClientRect();
//     var viewportOffset2 = $('ARCHRequestHandler-mainDiv').getBoundingClientRect();
//     if ((viewportOffset1 && viewportOffset2) && (viewportOffset1.top > viewportOffset2.top)) {
//         var parentDiv = jQuery('#anaPluginViewFrame');
//         var childDiv = jQuery('#ARCHRequestHandler-mainDiv');
//         parentDiv.scrollTop(parentDiv.scrollTop() + childDiv.position().top - 5);
//     }
//     //End BG tabs being out of sight issue
//     if (i2b2.PM.model.userRoles.indexOf("DATA_LDS") > -1) {
//         $$('DIV#ARCHRequestHandler-TABS DIV.ARCHRequestHandler-MainContent')[0].style.height = z;
//         $$('DIV#ARCHRequestHandler-TABS DIV.ARCHRequestHandler-MainContent')[1].style.height = z;
//     }
// };

    wasHidden: function () {
        try {
            this.yuiPanel.destroy();
        } catch (e) {
        }
    },


    removeRequired: function (req_key) {
        this.model.dirtyResultsData = true;
        this.model.readyToPreview = true;
        if (document.getElementById("chk_" + req_key).checked) {
            this.model.required[req_key].display = true;
        } else {
            this.model.required[req_key].display = false;
        }

    },

    editConcept: function (conceptIndex) {
        var conceptObj = this.model.concepts[conceptIndex];
        this.currentTerm = conceptObj;     // remember the last Concept that is dropped
        i2b2.CRC.view.modLabvaluesCtlr.selectValueBox(0, null, this.model.concepts[conceptIndex].sdxData.origData.key,
            this.model.concepts[conceptIndex].sdxData, false, i2b2.ARCHRequestHandler);
    },

    getValueType: function (xmlOrig) {
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
    },

    spanifyInactiveValueConstraint: function () {
        return "<span class=\"valueConstraint_Inactive\">[Set Value Constraint]</span>"; // uses no value constraint
    },

    spanifyValueConstraint: function (name, conceptIndex) {
        return "[<a class =\"valueConstraint\" href=\"JavaScript:i2b2.ARCHRequestHandler.Downloader.editConcept(" + conceptIndex + ");\">" + name + "</a>]";
    },


    /* pass in a values object and this function returns text representation */
    makeValueText: function (values) {
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
    },

    /* pass in a values object and this function returns an innerHTML suitable for display */
    makeValueConstraintInnerHTML: function (valueInfo, values, conceptIndex) {
        var valueText = "";
        if (!valueInfo)
            return '';
        valueText = this.makeValueText(values);
        if (valueText === "")
            valueText = "Set Value"; // empty constraint

        valueHTML = "<img align=\"absbottom\" style=\"margin-left:10px;\" src=\"js-i2b2/cells/plugins/community/ARCHRequestHandler/assets/value.png\" border=\"0\"/> [<a data-tooltip=\"This concept can be constrained by a specific value\" class=\"valueConstraint\" href=\"JavaScript:i2b2.ARCHRequestHandler.Downloader.editConcept(" + conceptIndex + ");\">" + valueText + "</a>]";
        return valueHTML;
    },

    makeValueConstraintText: function (valueInfo, values) {
        var valueText = "";
        if (!valueInfo)
            return "";
        valueText = this.makeValueText(values);
        if (valueText === "")
            return "";

        valueText = " [" + valueText + "]";
        return valueText;
    },

    sanitizeConcepts: function () {  //works for genotype and ppv concepts
        for (var i1 = 0; i1 < this.model.concepts.length; i1++) {
            // Check if GENOTYPE value has constraint. If not, remove it
            // if(this.model.concepts[i1].sdxData.origData.key.indexOf('Biobank Genomics\\Gene\\') > -1 || this.model.concepts[i1].sdxData.origData.key.indexOf('Biobank Genomics\\dbSNP rs Identifier\\') > -1){
            if (!this.model.concepts[i1].hasOwnProperty('valueRestriction')) {
                this.conceptDelete(i1);
            }
            // }
        }
    },

    modifyConceptList: function () {
        this.sanitizeConcepts();
    },

    conceptsRenderFromValueBox: function () {
        this.currentTerm.valueRestriction = this.currentTerm.LabValues;
        this.model.dirtyResultsData = true;
        // update the panel/query tool GUI
        this.conceptsRender(); //update GUI
    },

    conceptsRender: function () {
        var s = '<table style="width:98%;margin-top:15px;"><tr><td style="font-size:14px;padding:10px;background:#5FA9BE;color:#FFF;font-weight:bold;text-shadow:none;">Concept</td><td style="font-size:14px;padding:10px;background:#5FA9BE;color:#FFF;font-weight:bold;text-shadow:none;">Constraints</td><td style="font-size:14px;padding:10px;background:#5FA9BE;color:#FFF;font-weight:bold;text-shadow:none;">Aggregation Option</td><td style="font-size:14px;padding:10px;background:#5FA9BE;color:#FFF;font-weight:bold;text-shadow:none;">Include In File</td></tr>'; // innerHTML for concept list
        var t = ''; // innerHTML for concpet config
        // are there any concepts in the list

        for (var key in this.model.required) {
            if (this.model.required.hasOwnProperty(key)) {
                s += "<tr><td><img align=\"absbottom\" style=\"margin-left:5px;\" src=\"js-i2b2/cells/plugins/community/ARCHRequestHandler/assets/demographic.png\" border=\"0\"> " + this.model.required[key].name + "</td><td></td><td>";
                s += "<select class=\"conceptConfigSelect\"> <option value=\"value\">Value</option></select> <a href='#' onclick='return false;' data-tooltip='Value of Default Column'><img style='margin-bottom:-3px;' src='js-i2b2/cells/plugins/community/ARCHRequestHandler/assets/tooltip.png'/></a>";
                s += "</td><td><input type=\"checkbox\" id=\"chk_" + key + "\"";
                if (this.model.required[key].display) {
                    s += " checked=\"checked\"";
                }
                s += " onchange=\"javascript:this.removeRequired('" + key + "');\"></td></tr>";
            }
        }


        if (this.model.concepts.length > 0) {
            jQuery("#ARCHRequestHandler-CONCPTCONFIG").show();      // display concept configuration table
            this.model.concepts.sort(function () // sort the concepts in alphabetical order
            {
                return arguments[0].sdxData.sdxInfo.sdxDisplayName > arguments[1].sdxData.sdxInfo.sdxDisplayName
            });
            // draw the list of concepts
            for (var i1 = 0; i1 < this.model.concepts.length; i1++) {

                if (i1 > 0) {
                    s += '<div class="concptDiv"></div>'; // create horizontal divider between concepts, starting with the 1st concept
                    t += '<div class="concptDiv"></div>';
                }
                valueHTML = "";
                valueText = "";
                tt = this.spanifyInactiveValueConstraint('[Set Value Constraint]');
                // get an appropriate path for the ontology term's icon
                var conceptIconPath = undefined;
                if (this.model.concepts[i1].sdxData.renderData) // this is a concept from ONTOLOGY
                    conceptIconPath = this.model.concepts[i1].sdxData.renderData.icon;
                else                                                                        // this is a concept from WORKPLACE
                    conceptIconPath = this.model.concepts[i1].sdxData.iconExp;
                var modInfo = null;
                var modValues = null;
                var valueInfo = null;
                var values = null;
                if (this.model.concepts[i1].sdxData.origData.isModifier) {
                    //modInfo = this.getValueType(this.model.concepts[i1].sdxData.origData.xmlOrig); // this gets the modifier's value metadata
                    //modValues = this.retrieveValueConstraint(i0, i1);
                }
                else {
                    // gather value metadata information: valueInfo.valueType (NUMERIC, ENUM, BLOB) and valueInfo.valueMetadataNodes (actual XML nodes)
                    valueInfo = this.getValueType(this.model.concepts[i1].sdxData.origData.xmlOrig);
                    // now we obtain the actual Value Constraint (if any) associated with the concept
                    values = this.retrieveValueConstraint(i1);


                    // create HTML for the value constraint
                    valueHTML = this.makeValueConstraintInnerHTML(valueInfo, values, i1);
                    valueText = this.makeValueConstraintText(valueInfo, values);
                }

                //	values = this.model.concepts[i1].sdxData.LabValues;

                var textDisplay = i2b2.h.Escape(this.model.concepts[i1].sdxData.sdxInfo.sdxDisplayName);
                if (this.model.concepts[i1].sdxData.origData.isModifier)
                    if (valueHTML === "")
                        textDisplay = i2b2.h.Escape(this.model.concepts[i1].sdxData.sdxInfo.sdxDisplayName) + " [" + i2b2.h.Escape(this.model.concepts[i1].sdxData.origData.name) + "]";
                    else
                        textDisplay = i2b2.h.Escape(this.model.concepts[i1].sdxData.sdxInfo.sdxDisplayName) + " [" + i2b2.h.Escape(this.model.concepts[i1].sdxData.origData.name) + tt + "]";
                else
                    textDisplay = i2b2.h.Escape(this.model.concepts[i1].sdxData.sdxInfo.sdxDisplayName);
                this.model.concepts[i1].textDisplay = textDisplay.replace(/,/g, "-") + valueText; // save the text display back to the conceptObj data structure so the table can display it correctly
                this.model.concepts[i1].panel = i1;

                var dateText = this.makeDateRangeConstraintInnerHTML(i1);
                s += "<tr><td><img align=\"absbottom\" style=\"margin-left:5px;\" src=\"" + conceptIconPath + "\" border=\"0\"> " + textDisplay + "</td><td style=\"color:#575757\">" + dateText + valueHTML + "</td><td>";

                // if a [patient_dimension] concept, only allow EXISTENCE and COUNT (to-do)
                if (this.model.concepts[i1].sdxData.origData.table_name.toLowerCase() === 'patient_dimension') {
                    s += "<select onchange=\"this.setTooltip(" + i1 + ");\" id=\"" + this.columnDisplaySelectID + i1 + "\" class=\"conceptConfigSelect\">\n" +
                        "<option value=\"" + this.cellDataOption.DEFAULT + "\">" + this.cellDataOption.DEFAULT + "</option>\n" +
                        "<option value=\"" + this.cellDataOption.ALLVALUES + "\">Value</option>\n" +
                        "</select> <a id='tooltip" + i1 + "' href='#' onclick='return false;' data-tooltip='Any existence of the observation will show Yes'><img style='margin-bottom:-3px;' src='js-i2b2/cells/plugins/community/ARCHRequestHandler/assets/tooltip.png'/></a>";
                    //s += "<select id=\"" + this.columnDisplaySelectID + i1 + "\" class=\"conceptConfigSelect\"> <option value=\"" + this.cellDataOption.DEFAULT + "\">Yes/No</option></select>";
                }
                else { // [concept_dimension] or [modifier_dimension]

                    if ((this.model.concepts[i1].sdxData.origData.table_name.toLowerCase() === 'concept_dimension') &&
                        (valueInfo && (valueInfo.valueType !== this.valueType.MIXED))) {
                        if (valueInfo.valueType === this.valueType.NUMERIC) {
                            s += "<select onchange=\"this.setTooltip(" + i1 + ");\" id=\"" + this.columnDisplaySelectID + i1 + "\" class=\"conceptConfigSelect\">\n" +
                                "<option value=\"" + this.cellDataOption.DEFAULT + "\">" + this.cellDataOption.DEFAULT + "</option>\n" +
                                "<option value=\"" + this.cellDataOption.ALLVALUES + "\">" + this.cellDataOption.ALLVALUES + "</option>\n" +
                                "<option value=\"" + this.cellDataOption.MODE + "\">" + this.cellDataOption.MODE + "</option>\n" +
                                "<option value=\"" + this.cellDataOption.MIN + "\">" + this.cellDataOption.MIN + "</option>\n" +
                                "<option value=\"" + this.cellDataOption.MAX + "\">" + this.cellDataOption.MAX + "</option>\n" +
                                "<option value=\"" + this.cellDataOption.AVERAGE + "\">" + this.cellDataOption.AVERAGE + "</option>\n" +
                                "<option value=\"" + this.cellDataOption.MEDIAN + "\">" + this.cellDataOption.MEDIAN + "</option>\n" +
                                "<option value=\"" + this.cellDataOption.FIRST + "\">" + this.cellDataOption.FIRST + "</option>\n" +
                                "<option value=\"" + this.cellDataOption.LAST + "\">" + this.cellDataOption.LAST + "</option>\n" +
                                "<option value=\"" + this.cellDataOption.COUNT + "\">" + this.cellDataOption.COUNT + "</option>\n" +
                                "<option value=\"" + this.cellDataOption.ALLCONCEPTTEXT + "\">" + this.cellDataOption.ALLCONCEPTTEXT + "</option>\n" +
                                "<option value=\"" + this.cellDataOption.MODECONCEPTTEXT + "\">" + this.cellDataOption.MODECONCEPTTEXT + "</option>n" +
                                "<option value=\"" + this.cellDataOption.ALLCONCEPTCODE + "\">" + this.cellDataOption.ALLCONCEPTCODE + "</option>\n" +
                                "<option value=\"" + this.cellDataOption.MODECONCEPTCODE + "\">" + this.cellDataOption.MODECONCEPTCODE + "</option>\n" +
                                "</select> <a id='tooltip" + i1 + "' href='#' onclick='return false;' data-tooltip='Any existence of the observation'><img style='margin-bottom:-3px;' src='js-i2b2/cells/plugins/community/ARCHRequestHandler/assets/tooltip.png'/></a>";
                        } else {
                            s += "<select onchange=\"this.setTooltip(" + i1 + ");\" id=\"" + this.columnDisplaySelectID + i1 + "\" class=\"conceptConfigSelect\">\n" +
                                "<option value=\"" + this.cellDataOption.DEFAULT + "\">" + this.cellDataOption.DEFAULT + "</option>\n" +
                                "<option value=\"" + this.cellDataOption.ALLVALUES + "\">" + this.cellDataOption.ALLVALUES + "</option>\n" +
                                "<option value=\"" + this.cellDataOption.MODE + "\">" + this.cellDataOption.MODE + "</option>\n" +
                                "<option value=\"" + this.cellDataOption.FIRST + "\">" + this.cellDataOption.FIRST + "</option>\n" +
                                "<option value=\"" + this.cellDataOption.LAST + "\">" + this.cellDataOption.LAST + "</option>\n" +
                                "<option value=\"" + this.cellDataOption.COUNT + "\">" + this.cellDataOption.COUNT + "</option>\n" +
                                "<option value=\"" + this.cellDataOption.ALLCONCEPTTEXT + "\">" + this.cellDataOption.ALLCONCEPTTEXT + "</option>\n" +
                                "<option value=\"" + this.cellDataOption.MODECONCEPTTEXT + "\">" + this.cellDataOption.MODECONCEPTTEXT + "</option>n" +
                                "<option value=\"" + this.cellDataOption.ALLCONCEPTCODE + "\">" + this.cellDataOption.ALLCONCEPTCODE + "</option>\n" +
                                "<option value=\"" + this.cellDataOption.MODECONCEPTCODE + "\">" + this.cellDataOption.MODECONCEPTCODE + "</option>\n" +
                                "</select> <a id='tooltip" + i1 + "' href='#' onclick='return false;' data-tooltip='Any existence of the observation'><img style='margin-bottom:-3px;' src='js-i2b2/cells/plugins/community/ARCHRequestHandler/assets/tooltip.png'/></a>";
                        }
                    }
                    else { // no values
                        s += "<select onchange=\"this.setTooltip(" + i1 + ");\" id=\"" + this.columnDisplaySelectID + i1 + "\" class=\"conceptConfigSelect\">\n" +
                            "<option value=\"" + this.cellDataOption.DEFAULT + "\">" + this.cellDataOption.DEFAULT + "</option>\n" +
                            "<option value=\"" + this.cellDataOption.FIRST + "\">" + this.cellDataOption.FIRST + "</option>\n" +
                            "<option value=\"" + this.cellDataOption.LAST + "\">" + this.cellDataOption.LAST + "</option>\n" +
                            "<option value=\"" + this.cellDataOption.COUNT + "\">" + this.cellDataOption.COUNT + "</option>\n" +
                            "<option value=\"" + this.cellDataOption.ALLCONCEPTTEXT + "\">" + this.cellDataOption.ALLCONCEPTTEXT + "</option>\n" +
                            "<option value=\"" + this.cellDataOption.MODECONCEPTTEXT + "\">" + this.cellDataOption.MODECONCEPTTEXT + "</option>n" +
                            "<option value=\"" + this.cellDataOption.ALLCONCEPTCODE + "\">" + this.cellDataOption.ALLCONCEPTCODE + "</option>\n" +
                            "<option value=\"" + this.cellDataOption.MODECONCEPTCODE + "\">" + this.cellDataOption.MODECONCEPTCODE + "</option>\n" +
                            "</select> <a id='tooltip" + i1 + "' href='#' onclick='return false;' data-tooltip='Any existence of the observation'><img style='margin-bottom:-3px;' src='js-i2b2/cells/plugins/community/ARCHRequestHandler/assets/tooltip.png'/></a>";
                    }
                }
                s += "</td><td><a href=\"JavaScript:this.conceptDelete(" + i1 + ");\"><img src=\"js-i2b2/cells/plugins/community/ARCHRequestHandler/assets/delete.png\" title=\"Remove this Concept\" align=\"absbottom\" border=\"0\"/></a></td></tr>";
            }
            $("ARCHRequestHandler-CONCPTDROP").style.padding = "0px 0px";     // remove extra vertical padding
            $("ARCHRequestHandler-CONCPTCONFIG").style.padding = "0px 0px";   // remove extra vertical padding
        }
        else // no concepts selected yet
        {
            //s = "<img src=\"js-i2b2/cells/plugins/community/ARCHRequestHandler/assets/pointer.png\" align=\"absbottom\" style=\"margin-left:5px;\" /> Drag &amp; Drop one or more <em>Ontology Terms</em> here";
            //s = "";
            //$("ARCHRequestHandler-CONCPTDROP").style.padding = "5px 0px";
            //jQuery("#ARCHRequestHandler-CONCPTCONFIG").hide(); // hide concept config table
        }
        s += "</table>";

        $("ARCHRequestHandler-CONCEPTS").innerHTML = s;
        //$("ARCHRequestHandler-CONCPTDROP").innerHTML   = s;                     // update html
        //$("ARCHRequestHandler-CONCPTCONFIG").innerHTML = t;

        // add default values to select elements and bind a handler to listen for change events
        for (var j = 0; j < this.model.concepts.length; j++) {
            var select = jQuery("#" + this.columnDisplaySelectID + j);
            if (this.model.concepts[j].dataOption) {
                select.val(this.model.concepts[j].dataOption);
                this.setTooltip(j);
                this.setDateTooltip(j);
            }
            select.on("change", null, {
                index: j,
                value: select.val()
            }, this.handleConceptConfigItemSelectionChange); // attach listener to handle selection change
        }
    },

    showDateRangeConstraintDialog: function (conceptIndex) {
        this.UI.DateConstraint.showDates(conceptIndex);
    },

// construct the innerHTML for the concptItem div to include
    makeDateRangeConstraintInnerHTML: function (conceptIndex) {   // date constraints do not make sense for patient dimension concepts
        if (this.model.concepts[conceptIndex].sdxData.origData.table_name.toLowerCase() === 'patient_dimension')
            return "";

        var dateText = "";

        if (!this.model.concepts[conceptIndex].dateFrom && !this.model.concepts[conceptIndex].dateTo) {
            dateText = "Set Date";
        }
        else if (this.model.concepts[conceptIndex].dateFrom && !this.model.concepts[conceptIndex].dateTo) {
            dateText = "&ge;" + padNumber(this.model.concepts[conceptIndex].dateFrom.Month, 2) + "/" + padNumber(this.model.concepts[conceptIndex].dateFrom.Day, 2) + "/" + this.model.concepts[conceptIndex].dateFrom.Year;
        }
        else if (!this.model.concepts[conceptIndex].dateFrom && this.model.concepts[conceptIndex].dateTo) {
            dateText = "&le;" + padNumber(this.model.concepts[conceptIndex].dateTo.Month, 2) + "/" + padNumber(this.model.concepts[conceptIndex].dateTo.Day, 2) + "/" + this.model.concepts[conceptIndex].dateTo.Year;
        }
        else {
            dateText = padNumber(this.model.concepts[conceptIndex].dateFrom.Month, 2) + "/" + padNumber(this.model.concepts[conceptIndex].dateFrom.Day, 2) + "/" + this.model.concepts[conceptIndex].dateFrom.Year + " to " + padNumber(this.model.concepts[conceptIndex].dateTo.Month, 2) + "/" + padNumber(this.model.concepts[conceptIndex].dateTo.Day, 2) + "/" + this.model.concepts[conceptIndex].dateTo.Year;
        }
        return "<img align=\"absbottom\" style=\"margin-left:5px;\" src=\"js-i2b2/cells/plugins/community/ARCHRequestHandler/assets/calendar.gif\" border=\"0\"><span> [<a id=\"dateTooltip" + conceptIndex + "\" data-tooltip=\"\" class=\"dateRangeConstraint\" href=\"JavaScript:i2b2.ARCHRequestHandler.Downloader.showDateRangeConstraintDialog(" + conceptIndex + ");\">" + dateText + "</a>]</span>";
    },

    makeDateRangeConstraintText: function (conceptIndex) {   // date constraints do not make sense for patient dimension concepts
        if (this.model.concepts[conceptIndex].sdxData.origData.table_name.toLowerCase() === 'patient_dimension')
            return "";

        var dateText = "";
        var concept = this.model.concepts[conceptIndex];
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
            dateText = "From " + padNumber(this.model.concepts[conceptIndex].dateFrom.Month, 2) + "/" + padNumber(this.model.concepts[conceptIndex].dateFrom.Day, 2) + "/" + this.model.concepts[conceptIndex].dateFrom.Year;
        }
        else if (!dateFrom && dateTo) {
            dateText = "To " + padNumber(this.model.concepts[conceptIndex].dateTo.Month, 2) + "/" + padNumber(this.model.concepts[conceptIndex].dateTo.Day, 2) + "/" + this.model.concepts[conceptIndex].dateTo.Year;
        }
        else {
            dateText = padNumber(this.model.concepts[conceptIndex].dateFrom.Month, 2) + "/" + padNumber(this.model.concepts[conceptIndex].dateFrom.Day, 2) + "/" + this.model.concepts[conceptIndex].dateFrom.Year + " to " + padNumber(this.model.concepts[conceptIndex].dateTo.Month, 2) + "/" + padNumber(this.model.concepts[conceptIndex].dateTo.Day, 2) + "/" + this.model.concepts[conceptIndex].dateTo.Year;
        }
        return "<br/>[" + dateText + "]";
    },


    setDateTooltip: function (conceptIndex) {
        var dateTooltip = "";

        if (!this.model.concepts[conceptIndex].dateFrom && !this.model.concepts[conceptIndex].dateTo) {
            dateTooltip = "Optional Date Range Constraint is not set";
        }
        else if (this.model.concepts[conceptIndex].dateFrom && !this.model.concepts[conceptIndex].dateTo) {
            dateText = padNumber(this.model.concepts[conceptIndex].dateFrom.Month, 2) + "/" + padNumber(this.model.concepts[conceptIndex].dateFrom.Day, 2) + "/" + this.model.concepts[conceptIndex].dateFrom.Year;
            dateTooltip = "Only find this concept starting from " + dateText;
        }
        else if (!this.model.concepts[conceptIndex].dateFrom && this.model.concepts[conceptIndex].dateTo) {
            dateText = padNumber(this.model.concepts[conceptIndex].dateTo.Month, 2) + "/" + padNumber(this.model.concepts[conceptIndex].dateTo.Day, 2) + "/" + this.model.concepts[conceptIndex].dateTo.Year;
            dateTooltip = "Only find this concept until " + dateText;
        }
        else {
            dateText = padNumber(this.model.concepts[conceptIndex].dateFrom.Month, 2) + "/" + padNumber(this.model.concepts[conceptIndex].dateFrom.Day, 2) + "/" + this.model.concepts[conceptIndex].dateFrom.Year + " to " + padNumber(this.model.concepts[conceptIndex].dateTo.Month, 2) + "/" + padNumber(this.model.concepts[conceptIndex].dateTo.Day, 2) + "/" + this.model.concepts[conceptIndex].dateTo.Year;
            dateTooltip = "Only find this concept from " + dateText;
        }
        jQuery('#dateTooltip' + conceptIndex).attr('data-tooltip', dateTooltip);
    },

    setTooltip: function (index) {
        var select = jQuery("#" + this.columnDisplaySelectID + index).val();
        switch (select) {
            case this.cellDataOption.DEFAULT:
                var tooltip = "Any existence of the observation";
                break;
            case this.cellDataOption.MIN:
                var tooltip = "Minimum value of all numerical values observations";
                break;
            case this.cellDataOption.MAX:
                var tooltip = "Maximum value of all numerical values observations";
                break;
            case this.cellDataOption.FIRST:
                var tooltip = "Date of earliest observation";
                break;
            case this.cellDataOption.LAST:
                var tooltip = "Date of the most recent observation";
                break;
            case this.cellDataOption.ALLCONCEPTTEXT:
                var tooltip = "All concept names are listed";
                break;
            case this.cellDataOption.MODECONCEPTTEXT:
                var tooltip = "Most frequent concept name(s) are listed";
                break;
            case this.cellDataOption.ALLCONCEPTCODE:
                var tooltip = "All concept codes are listed";
                break;
            case this.cellDataOption.MODECONCEPTCODE:
                var tooltip = "Most frequent concept code(s) are listed";
                break;
            case this.cellDataOption.COUNT:
                var tooltip = "Total number of observations";
                break;
            case this.cellDataOption.AVERAGE:
                var tooltip = "Average Value";
                break;
            case this.cellDataOption.MEDIAN:
                var tooltip = "Median Value";
                break;
            case this.cellDataOption.ALLVALUES:
                var tooltip = "List of All Value(s)";
                break;
            case this.cellDataOption.MODE:
                var tooltip = "Mode (Most Frequent Value)";
                break;
        }
        jQuery('#tooltip' + index).attr('data-tooltip', tooltip);


    },

    handleConceptConfigItemSelectionChange: function (event) {
        this.model.dirtyResultsData = true;
        this.model.readyToPreview = true;
        var newVal = jQuery("#" + this.columnDisplaySelectID + event.data.index).children("option").filter(":selected").val();
        this.model.concepts[event.data.index].dataOption = newVal;
    },


    pgGo: function (dir) {
        var formStart = parseInt($('ARCHRequestHandler-pgstart').value);
        var formSize = parseInt($('ARCHRequestHandler-pgsize').value);
        if (!formStart) {
            formStart = 1;
        }
        if (!formSize) {
            formSize = 10;
        }
        if (formSize < 1) {
            formSize = 1;
        }
        formStart = formStart + formSize * dir;
        if (formStart < 1) {
            formStart = 1;
        }
        this.model.pgstart = formStart;
        this.model.pgsize = formSize;
        $('ARCHRequestHandler-pgstart').value = formStart;
        $('ARCHRequestHandler-pgsize').value = formSize;
        this.model.dirtyResultsData = true;
        //remove old results
        $$("DIV#ARCHRequestHandler-mainDiv DIV#ARCHRequestHandler-TABS DIV.results-directions")[0].hide();
        $('ARCHRequestHandler-results-scaleLbl1').innerHTML = '';
        $('ARCHRequestHandler-results-scaleLbl2').innerHTML = '';
        $('ARCHRequestHandler-results-scaleLbl3').innerHTML = '';
        $$("DIV#ARCHRequestHandler-mainDiv DIV#ARCHRequestHandler-TABS DIV.results-timeline")[0].innerHTML = '<div class="results-progress">Please wait while the timeline is being drawn...</div><div class="results-progressIcon"></div>';
        $$("DIV#ARCHRequestHandler-mainDiv DIV#ARCHRequestHandler-TABS DIV.results-finished")[0].show();
        //reset zoom key
        $$("DIV#ARCHRequestHandler-mainDiv DIV#ARCHRequestHandler-TABS DIV.zoomKeyRange")[0].style.width = '90px';
        $$("DIV#ARCHRequestHandler-mainDiv DIV#ARCHRequestHandler-TABS DIV.zoomKeyRange")[0].style.left = '0px';
        // give a brief pause for the GUI to catch up
        setTimeout('this.getResults();', 50);
    },

    updateZoomScaleLabels: function () {
        var z = this.model.zoomScale * 1.0;
        var p = this.model.zoomPan * 1.0;
        // update zoom key
        $$("DIV#ARCHRequestHandler-mainDiv DIV#ARCHRequestHandler-TABS DIV.zoomKeyRange")[0].style.width = (90 / z) + 'px';
        $$("DIV#ARCHRequestHandler-mainDiv DIV#ARCHRequestHandler-TABS DIV.zoomKeyRange")[0].style.left = ((p * 90) - (90 / z)) + 'px';
        // calculate date labels
        var first_time = this.model.first_time;
        var last_time = this.model.last_time;
        var lf = last_time - first_time;
        var t3 = first_time + lf * p;
        var t1 = t3 - lf / z;
        var t2 = (t1 + t3) / 2;
        var d1 = new Date(t1);
        var d2 = new Date(t2);
        var d3 = new Date(t3);
        // update labels
        $('ARCHRequestHandler-results-scaleLbl1').innerHTML = (d1.getMonth() + 1) + '/' + d1.getDate() + '/' + d1.getFullYear();
        $('ARCHRequestHandler-results-scaleLbl2').innerHTML = (d2.getMonth() + 1) + '/' + d2.getDate() + '/' + d2.getFullYear();
        $('ARCHRequestHandler-results-scaleLbl3').innerHTML = (d3.getMonth() + 1) + '/' + d3.getDate() + '/' + d3.getFullYear();
    },

    zoom: function (op) {
        if (op == '+') {
            this.model.zoomScale *= 2.0;
        }
        if (op == '-') {
            this.model.zoomScale *= 0.5;
        }
        if (op == '<') {
            this.model.zoomPan -= 0.25 / (this.model.zoomScale * 1.0);
        }
        if (op == '>') {
            this.model.zoomPan += 0.25 / (this.model.zoomScale * 1.0);
        }
        if (this.model.zoomScale < 1) {
            this.model.zoomScale = 1.0;
        }
        if (this.model.zoomPan > 1) {
            this.model.zoomPan = 1.0;
        }
        if (this.model.zoomPan < 1 / (this.model.zoomScale * 1.0)) {
            this.model.zoomPan = 1 / (this.model.zoomScale * 1.0);
        }
        this.updateZoomScaleLabels();
        var z = this.model.zoomScale * 1.0;
        var p = this.model.zoomPan * 1.0;
        p = 100.0 * (1 - z * p);
        z = 100.0 * z;
        var o = $$("DIV#ARCHRequestHandler-mainDiv DIV#ARCHRequestHandler-TABS DIV.results-finished DIV.ptObsZoom");
        for (var i = 0; i < o.length; i++) {
            o[i].style.width = z + '%';
            o[i].style.left = p + '%';
        }
    },


    setLocalUniqueNumber: function () {
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
};
	

