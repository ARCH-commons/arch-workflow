/**
 * @projectDescription	View controller for the request data set window (which is a GUI-only component of the CRC module).
 * @inherits 	i2b2.CRC.view
 * @namespace	i2b2.CRC.view.DataSet
 * @author 		Bhaswati Ghosh
 * @version 	1.7.05
 * ----------------------------------------------------------------------------------------
 * updated 9-15-08: RC4 launch [Nick Benik]
 */
 
 // Query Report BG
console.group('Load & Execute component file: CRC > view > DataSet');
console.time('execute time');

// create and save the screen objects
i2b2.CRC.view.dataSet = new i2b2Base_cellViewController(i2b2.CRC, 'dataSet');
i2b2.CRC.view.dataSet.visible = false;
i2b2.CRC.model.dataSet.model.tags = {};

// Alert levels
i2b2.CRC.view.dataSet.ALERT_INFO = 0;
i2b2.CRC.view.dataSet.ALERT_ERROR = -1;
i2b2.CRC.view.dataSet.ALERT_WARN = 1;


// i2b2.CRC.view.dataSet.show = function() {
// 	i2b2.CRC.view.dataSet.visible = true;
// 	$('crcDataSetBox').show();
// }
// i2b2.CRC.view.dataSet.hide = function() {
// 	i2b2.CRC.view.dataSet.visible = false;
// 	$('crcDataSetBox').hide();
// }

function rdsAlert(msg, level) {
    //YAHOO.widget.alert.dlg.setBody(msg);
    // default level is ALERT_INFO
    var levelIcon = YAHOO.widget.SimpleDialog.ICON_INFO;
    if (level == i2b2.CRC.view.dataSet.ALERT_WARN)
        levelIcon = YAHOO.widget.SimpleDialog.ICON_WARN;
    else if (level == i2b2.CRC.view.dataSet.ALERT_ERROR)
        levelIcon = YAHOO.widget.SimpleDialog.ICON_ALARM;

    var dlg = new YAHOO.widget.SimpleDialog("dialogDSAlert", {
        width: "450px",
        text: msg,
        fixedcenter: true,
        constraintoviewport: true,
        icon: levelIcon,
        modal: true,
        zindex: 700,
        buttons: [{
            text: "OK",
            handler: function(){
                this.cancel();
            },
            isDefault: true
        }]
    });
    dlg.render(document.body);
    dlg.center();
    dlg.show();

};


i2b2.CRC.view.dataSet.hideDisplay = function() {
	$('crcQueryToolBox.dataSetBox').hide();
}
i2b2.CRC.view.dataSet.showDisplay = function() {
	var targs = $('crcQueryToolBox.dataSetBox').parentNode.parentNode.select('DIV.tabBox.active');
	// remove all active tabs
	targs.each(function(el) { el.removeClassName('active'); });
	// set us as active
	$('crcQueryToolBox.dataSetBox').parentNode.parentNode.select('DIV.tabBox.tabRequestDataSet')[0].addClassName('active');
	
	$('crcQueryToolBox.bodyBox').hide();
	$('crcQueryToolBox.dataSetBox').show();
//	i2b2.CRC.ctrlr.QT.createDataSet("",false);
}
// ================================================================================================== //

// ================================================================================================== //
i2b2.CRC.view.dataSet.Resize = function (e) {
    var w = window.innerWidth || (window.document.documentElement.clientWidth || window.document.body.clientWidth);
    var h = window.innerHeight || (window.document.documentElement.clientHeight || window.document.body.clientHeight);
    var ve = $('crcQueryToolBox.dataSetBox');
    ve = ve.style;

    if (w < 840) { w = 840; }
    if (h < 517) { h = 517; }

    // resize our visual components
    //var queryToolWidth = ds.width * 0.6;
    //$('crcQueryToolBox').style.left = w-queryToolWidth;
    //debugOnScreen("crcQueryToolBox.width = " + queryToolWidth );

    // $('crcQueryToolBox').style.left = w - 550;
    // if (i2b2.WORK && i2b2.WORK.isLoaded) {
    //     var z = h - 400; //392 + 44 - 17 - 25;
    //     if (i2b2.CRC.view.dataSet.isZoomed) { z += 196 - 44; }
    // } else {
    //     var z = h - 392 - 17 - 25;
    //     if (i2b2.CRC.view.dataSet.isZoomed) { z += 196; }
    // }

    // TODO there has to be a better way
    if (i2b2.WORK && i2b2.WORK.isLoaded) {
        var z = parseInt((h - 321)/2) + 16;
        ve.height = z;
    } else {
        ve.height = h-289;
    }
    // elStatus = $('crcStatusBox');
    // var btm = (parseInt(elStatus.style.top)) - 10;
    // $('dataSetContent').style.height = (h - btm) + 'px';
}


i2b2.CRC.view.dataSet.splitterDragged = function () {
    var w = window.innerWidth || (window.document.documentElement.clientWidth || window.document.body.clientWidth);

    var splitter = $(i2b2.hive.mySplitter.name);
    var CRCQTBodyBox = $("crcQueryToolBox.dataSetBox");

    var basicWidth = parseInt(w) - parseInt(splitter.style.left) - parseInt(splitter.offsetWidth);

	/* Title, buttons, and panels */
    CRCQTBodyBox.style.width = Math.max(basicWidth - 41, 0) + "px";

    var panelWidth = (basicWidth - 36) / 3 - 4;

}

//================================================================================================== //
i2b2.CRC.view.dataSet.ResizeHeight = function () {
    var h = window.innerHeight || (window.document.documentElement.clientHeight || window.document.body.clientHeight);
    var ve = $('crcQueryToolBox.dataSetBox');
    ve = ve.style;

    if (h < 517) { h = 517; }
    // resize our visual components
    if (i2b2.WORK && i2b2.WORK.isLoaded) {
        var z = parseInt((h - 321)/2) + 16;
        ve.height = z;
    } else {
        ve.height = h-289;
    }

    // if (i2b2.WORK && i2b2.WORK.isLoaded) {
    //     var z = h - 400;
    //     if (i2b2.CRC.view.dataSet.isZoomed) { z += 196 - 44; }
    // } else {
    //     var z = h - 434;
    //     if (i2b2.CRC.view.dataSet.isZoomed) { z += 196; }
    // }
    // // TODO there has to be a better way
    // elStatus = $('crcStatusBox');
    // var btm = (parseInt(elStatus.style.top)) - 10;
    // $('dataSetContent').style.height = (h - btm) + 'px';


}

i2b2.CRC.view.dataSet.selectSubTab = function(tabCode) {
    // toggle between the Navigate and Find Terms tabs
    switch (tabCode) {
        case "specify":
            this.currentTab = 'specify';
            $('dataSetBox.tabSpecify').blur();
            $('dataSetBox.tabSpecify').className = 'findSubTabSelected';
            $('dataSetBox.tabPreview').className = 'findSubTab';
            $('dataSetBox.bodySpecify').show();
            $('dataSetBox.bodyPreview').hide();
            // $('ontSearchNamesResults').show();
            // $('ontSearchCodesResults').hide();
            break;
        case "preview":
            this.currentTab = 'codes';
            $('dataSetBox.tabPreview').blur();
            $('dataSetBox.tabPreview').className = 'findSubTabSelected';
            $('dataSetBox.tabSpecify').className = 'findSubTab';
            $('dataSetBox.bodyPreview').show();
            $('dataSetBox.bodySpecify').hide();
            // $('ontSearchNamesResults').hide();
            // $('ontSearchCodesResults').show();
            break;
    }
}

/**
 * Method for flagging a data request.
 */
i2b2.CRC.view.dataSet.startDataRequestFlagPrompt = function() {
    // TODO validate that there is a PRS query to attach flag to
    var flagBody = {};
    flagBody.dataRequest = {};
    // bring any pre-existing tags into this DR
    flagBody.dataRequest.tags = i2b2.CRC.model.dataSet.model.tags;
    flagBody.dataRequest.concepts = i2b2.CRC.model.dataSet.model.concepts;
    flagBody.dataRequest.template = i2b2.CRC.view.dataSet.transformRequestConcepts();
    var dialogue = new YAHOO.widget.SimpleDialog("dialogDataRequest", {
        width: "450px",
        fixedcenter: true,
        constraintoviewport: true,
        modal: true,
        zindex: 700,
        buttons: [{
            text: "OK",
            handler: function(){
                flagBody.message = document.getElementById('rdsQueryFlagMessage').value;
                // var queryId = i2b2.CRC.model.dataSet.model.prsRecord.sdxInfo.sdxKeyValue;
                var queryId = i2b2.CRC.model.dataSet.active.query.sdxInfo.sdxKeyValue;

                // make a call to the controller flag method.
                try {
                    i2b2.CRC.ctrlr.history.Flag({
                       queryId: queryId,
                       message: JSON.stringify(flagBody)
                    });
                } catch(e) {
                    rdsAlert("An error occurred attempting to flag the request.  Please check with administrator.", i2b2.CRC.view.dataSet.ALERT_ERROR);
                    document.getElementById('rdsQueryFlagMessage').value = "";
                    this.cancel();
                }
                document.getElementById('rdsQueryFlagMessage').value = "";
                this.cancel();
                rdsAlert("Your data request was sent successfully.");
            },
            isDefault: true
        }, {
            text: "Cancel",
            handler: function(){
                this.cancel();
                document.getElementById('rdsQueryFlagMessage').value = "";
            }
        }, {
            text: "Show Request Code",
            handler: function() {
                i2b2.CRC.view.dataSet.displayRawDataRequest(flagBody);
            }
        }]
    });
    i2b2.CRC.view.dataSet.tagsRender();
    $('dialogDataRequest').show();
    dialogue.render(document.body);
    dialogue.center();
    dialogue.show();
};

i2b2.CRC.view.dataSet.transformRequestConcepts = function() {
    var concepts = i2b2.CRC.model.dataSet.model.concepts;
    var robj = {};
    if (concepts) {
        robj.column_list = {};
        for (i = 0; i < concepts.length; i++) {
            var c = concepts[i];
            var col = robj.column_list.column = {};
            col.aggregation = c.dataOption;
            col._name = c.textDisplay;
            col._abbreviation = c.textDisplay;
            // TODO conform to established 'constrain_by_date' standard
            var consDate = col.constrain_by_date = {};
            if (c.dateFrom) {
                consDate.dateFrom = c.dateFrom;
            }
            if (c.dateTo) {
                consDate.dateTo = c.dateTo;
            }
            if (c.sdxData) {
                var item = col.item = {};
                item.item_name = c.sdxData.origData.name;
                item.item_key = c.sdxData.origData.key;
            }
        }
    }
    return robj;
};


i2b2.CRC.view.dataSet.tagsRender = function () {
    var s = '<table style="width:98%;margin-top:15px;"><tr><th>Tag</th><th>Value</th><th></th></tr>';
    var t = ''; // innerHTML for concpet config
    // are there any concepts in the list
    var tags = i2b2.CRC.model.dataSet.model.tags;
    var tagcount = 0;
    for (var key in tags) {
        if (tags.hasOwnProperty(key)) {
            s += "<tr><td>" + key + "</td><td>" + tags[key] + "</td><td><a href='Javascript:i2b2.CRC.view.dataSet.deleteTag(\"" + key + "\");'><img src='js-i2b2/cells/CRC/assets/rds_delete.png' title='Remove this Concept' align='absbottom' border='0'/></a></td></tr>";
            tagcount++;
        }
    }
    if (tagcount == 0) {
        s += '<tr><td colspan="2"><em>No tags specified</em></td></tr>';
    }
    s += "</table>";
    $("rdsTagTableDiv").innerHTML = s;

};

i2b2.CRC.view.dataSet.addOrReplaceTag = function() {
    var key = document.getElementById('rdsAddTagKeyInput').value;
    var val = document.getElementById('rdsAddTagValueInput').value;
    if (key && val) {
        i2b2.CRC.model.dataSet.model.tags[key] = val;
        i2b2.CRC.view.dataSet.tagsRender();
    }
    document.getElementById('rdsAddTagKeyInput').value = '';
    document.getElementById('rdsAddTagValueInput').value = '';
};

i2b2.CRC.view.dataSet.deleteTag = function(key) {
    if (key && i2b2.CRC.model.dataSet.model.tags[key]) {
        delete i2b2.CRC.model.dataSet.model.tags[key];
        i2b2.CRC.view.dataSet.tagsRender();
    }
}

i2b2.CRC.view.dataSet.toggleRawDataRequestDisplay = function() {
    $('rawDataRequestBody').toggle($('showRawDataRequestOption').checked);
};

i2b2.CRC.view.dataSet.displayRawDataRequest = function(rbody) {
    var prettyJson = JSON.stringify(rbody.dataRequest);
    var dlg = new YAHOO.widget.SimpleDialog("rawDataRequest", {
        width: "650px",
        text: prettyJson,
        fixedcenter: true,
        constraintoviewport: true,
        modal: true,
        zindex: 999,
        buttons: [{
            text: "OK",
            handler: function(){
                this.cancel();
            },
            isDefault: true
        }]
    });
    dlg.render(document.body);
    dlg.center();
    dlg.show();



    // var t = '<h3>Raw Data Request Output</h3>';
    // if (rbody) {
    //     t += '<pre>' + JSON.stringify(rbody.dataRequest, undefined, 2) + '</pre>';
    // } else {
    //     t += '<strong>Error.  You should not see this message.</strong>';
    // }
    // $('rawDataRequestBody').innerHTML = t;
    // i2b2.CRC.view.dataSet.selectSubTab('preview');

};
// This is done once the entire cell has been loaded
console.info("SUBSCRIBED TO i2b2.events.afterCellInit");
i2b2.events.afterCellInit.subscribe(
    (function (en, co) {
        if (co[0].cellCode == 'CRC') {
            // ================================================================================================== //
            console.debug('[EVENT CAPTURED i2b2.events.afterCellInit]');
            // call initialization function from controller
			i2b2.CRC.ctrlr.dataSet.Init();

            i2b2.CRC.view.dataSet.splitterDragged();					// initialize query tool's elements
            i2b2.CRC.view.dataSet.ResizeHeight();
            // ================================================================================================== //
        }
    })
);

//================================================================================================== //
i2b2.events.initView.subscribe((function (eventTypeName, newMode) {
    // -------------------------------------------------------
    this.visible = true;
    $('crcQueryToolBox').show();
    this.Resize();

    // -------------------------------------------------------
}), '', i2b2.CRC.view.dataSet);

// ================================================================================================== //
i2b2.events.changedZoomWindows.subscribe((function (eventTypeName, zoomMsg) {
    newMode = zoomMsg[0];
    if (!newMode.action) { return; }
    if (newMode.action == "ADD") {
        switch (newMode.window) {
            case "QT":
                this.isZoomed = true;
                this.visible = true;
                break;
        }
    } else {
        switch (newMode.window) {
            case "QT":
                this.isZoomed = false;
                this.visible = true;
        }
    }
    this.ResizeHeight();
}), '', i2b2.CRC.view.dataSet);

console.timeEnd('execute time');
console.groupEnd();

// End Query Report BG