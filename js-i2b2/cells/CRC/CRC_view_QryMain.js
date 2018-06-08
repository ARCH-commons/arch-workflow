/**
 * @projectDescription	View controller for CRC Query Tool window.
 * @inherits 	i2b2.CRC.view
 * @namespace	i2b2.CRC.view.QM
 * @author		Nick Benik, Griffin Weber MD PhD
 * @version 	1.3
 * ----------------------------------------------------------------------------------------
 * updated 9-15-08: RC4 launch [Nick Benik]
 */
console.group('Load & Execute component file: CRC > view > Main');
console.time('execute time');


// create and save the screen objects
i2b2.CRC.view['QM'] = new i2b2Base_cellViewController(i2b2.CRC, 'QM');

///// show and display functions /////
i2b2.CRC.view.QM.visible = false;

i2b2.CRC.view.QM.TAB_CODE_QT = 'query';
i2b2.CRC.view.QM.TAB_CODE_RDS = 'requestDataSet';

// i2b2.CRC.view.QM.hideDisplay = function() {
//     $('crcQueryToolBox').hide();
// }
// i2b2.CRC.view.QM.showDisplay = function() {
//     var targs = $('crcQueryToolBox.bodyBox').parentNode.parentNode.select('DIV.tabBox.active');
//     // remove all active tabs
//     targs.each(function(el) { el.removeClassName('active'); });
//     // set us as active
//     $('crcQueryToolBox.bodyBox').parentNode.parentNode.select('DIV.tabBox.tabQueryTool')[0].addClassName('active');
//     $('crcQueryToolBox.bodyBox').show();
//     //BG
//     $('crcQueryToolBox.dataSetBox').hide();
// }



// tab select
i2b2.CRC.view.QM.selectTab = function(tabCode) {
    // toggle between the Navigate and Find Terms tabs
    switch (tabCode) {
        case i2b2.CRC.view.QM.TAB_CODE_QT:
            this.currentTab = i2b2.CRC.view.QM.TAB_CODE_QT;
            this.cellRoot.view['QT'].showDisplay();
            this.cellRoot.view['dataSet'].hideDisplay();
            break;
        case i2b2.CRC.view.QM.TAB_CODE_RDS:
            this.currentTab = i2b2.CRC.view.QM.TAB_CODE_RDS;
            this.cellRoot.view['dataSet'].showDisplay();
            this.cellRoot.view['QT'].hideDisplay();
            break;
    }
}


// define the option functions
// ================================================================================================== //
i2b2.CRC.view.QM.showOptions = function(subscreen) {
    // route the call to the correct screen
    if (i2b2.CRC.view[this.currentTab]) {
        i2b2.CRC.view[this.currentTab].showOptions(subscreen);
    }
}



// ================================================================================================== //
i2b2.CRC.view.QM.ZoomView = function () {
    i2b2.hive.MasterView.toggleZoomWindow("QM");
}

// ================================================================================================== //
i2b2.CRC.view.QM.Resize = function (e) {
    var w = window.innerWidth || (window.document.documentElement.clientWidth || window.document.body.clientWidth);
    var h = window.innerHeight || (window.document.documentElement.clientHeight || window.document.body.clientHeight);


    if (w < i2b2.hive.cfg.ui.topWidth) {w = i2b2.hive.cfg.ui.topWidth;}
    if (h < i2b2.hive.cfg.ui.topHeight) {h = i2b2.hive.cfg.ui.topHeight;}

    // resize our visual components
    //var queryToolWidth = ds.width * 0.6;
    //$('crcQueryToolBox').style.left = w-queryToolWidth;
    //debugOnScreen("crcQueryToolBox.width = " + queryToolWidth );

    $('crcQueryToolBox').style.left = w - 550;
    if (i2b2.WORK && i2b2.WORK.isLoaded) {
        var z = h - 400; //392 + 44 - 17 - 25;
        // if (i2b2.CRC.view.QM.isZoomed) { z += 196 - 44; }
        if (i2b2.CRC.view.QM.isZoomed) { z += i2b2.hive.cfg.ui.bottomSpacer - 44; }
    } else {
        var z = h - 392 - 17 - 25;
        if (i2b2.CRC.view.QM.isZoomed) { z += i2b2.hive.cfg.ui.bottomSpacer; }
    }
}
//YAHOO.util.Event.addListener(window, "resize", i2b2.CRC.view.QT.Resize, i2b2.CRC.view.QT); // tdw9


//================================================================================================== //
i2b2.CRC.view.QM.splitterDragged = function () {
    var w = window.innerWidth || (window.document.documentElement.clientWidth || window.document.body.clientWidth);

    var splitter = $(i2b2.hive.mySplitter.name);
    var CRCQT = $("crcQueryToolBox");

    var basicWidth = parseInt(w) - parseInt(splitter.style.left) - parseInt(splitter.offsetWidth);

    /* Main box */
    CRCQT.style.left = parseInt(splitter.offsetWidth) + parseInt(splitter.style.left) + 3 + "px";
    CRCQT.style.width = Math.max(basicWidth - 24, 0) + "px";
}

//================================================================================================== //
i2b2.CRC.view.QM.ResizeHeight = function () {
    //var ds = document.viewport.getDimensions();
    //var h = ds.height;
    //var h = window.document.documentElement.clientHeight;
    var h = window.innerHeight || (window.document.documentElement.clientHeight || window.document.body.clientHeight);

    if (h < 517) { h = 517; }
    // resize our visual components
    if (i2b2.WORK && i2b2.WORK.isLoaded) {
        // var z = h - 400;
        // if (i2b2.CRC.view.QM.isZoomed) { z += 196 - 44; }
        var z = h - i2b2.hive.cfg.ui.minEverythingHeight + 34;
        if (i2b2.CRC.view.QM.isZoomed) { z += i2b2.hive.cfg.ui.bottomSpacer - 44; }
    } else {
        var z = h - 434;
        if (i2b2.CRC.view.QM.isZoomed) { z += 196; }
    }

    // display the topic selector bar if we are in SHRINE-mode
    // if (i2b2.h.isSHRINE() && $('queryTopicPanel')) {
    //     $('queryTopicPanel').show();
    //     z = z - 28;
    // }
    //$('crcQueryToolBox').style.height = z;

    // if ($('defineTemporalBar').style.display === '')
    //     z = z - 20;
    // $('QPD1').style.height = z;
    // $('QPD2').style.height = z;
    // $('QPD3').style.height = z;
    // $('temporalbuilders').style.height = z + 50;

}


// This is done once the entire cell has been loaded
console.info("SUBSCRIBED TO i2b2.events.afterCellInit");
i2b2.events.afterCellInit.subscribe(
    (function(en,co) {
        if (co[0].cellCode=='CRC') {
// -------------------------------------------------------
            console.info("EVENT RECEIVED i2b2.events.afterCellInit; Data:",en,co);
            // perform visual actions
            i2b2.CRC.view.QM.currentTab = i2b2.CRC.view.QM.TAB_CODE_QT;  	// define the initial view (AKA "tab") is visible
            i2b2.CRC.view.QM.Resize();
            i2b2.CRC.view.QM.ResizeHeight();

            $('crcQueryToolBox').show();

// -------------------------------------------------------
        }
    })
);

//================================================================================================== //
i2b2.events.initView.subscribe((function (eventTypeName, newMode) {
    // -------------------------------------------------------
    this.visible = true;
    $('crcQueryToolBox').show();
    this.Resize();

    // // initialize the dropdown menu for query timing
    // var temporalConstraintBar = $("temporalConstraintBar");
    // var temporalConstraintLabel = $("temporalConstraintLabel");
    // var queryTimingButton = $("queryTiming-button");
    // temporalConstraintDiv.style.width = Math.max(parseInt(temporalConstraintBar.style.width) - parseInt(temporalConstraintLabel.style.width) - 2, 0) + "px";
    // queryTimingButton.style.width = Math.max(parseInt(temporalConstraintBar.style.width) - parseInt(temporalConstraintLabel.style.width) - 6, 0) + "px";

    // -------------------------------------------------------
}), '', i2b2.CRC.view.QM);


// ================================================================================================== //
i2b2.events.changedViewMode.subscribe((function (eventTypeName, newMode) {
    // -------------------------------------------------------
    newMode = newMode[0];
    this.viewMode = newMode;
    switch (newMode) {
        case "Patients":
            this.visible = true;
            $('crcQueryToolBox').show();
            i2b2.CRC.view.QM.splitterDragged();
            //this.Resize();
            break;
        default:
            this.visible = false;
            $('crcQueryToolBox').hide();
            break;
    }
    // -------------------------------------------------------
}), '', i2b2.CRC.view.QM);


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
}), '', i2b2.CRC.view.QM);


console.timeEnd('execute time');
console.groupEnd();