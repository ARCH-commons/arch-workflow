/**
 * @projectDescription	Messages used by the SHRINE cell communicator object
 * @inherits 	i2b2.SHRINE.cfg
 * @namespace	i2b2.SHRINE.cfg.msgs
 * @author		Nick Benik, Griffin Weber MD PhD
 * @version 	1.0
 * ----------------------------------------------------------------------------------------
 */

// create the communicator Object
i2b2.SHRINE.ajax = i2b2.hive.communicatorFactory("SHRINE");

// create namespaces to hold all the communicator messages and parsing routines
i2b2.SHRINE.cfg.msgs = {};
i2b2.SHRINE.cfg.parsers = {};

// ================================================================================================== //
i2b2.SHRINE.cfg.msgs.readApprovedEntries = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'+
'	<ns2:request xmlns:ns2="http://www.i2b2.org/xsd/hive/msg/1.1/" xmlns:ns7="http://sheriff.shrine.net/">\n'+
'	<message_header>\n'+
'		{{{proxy_info}}}\n'+
'		<i2b2_version_compatible>1.1</i2b2_version_compatible>\n'+
'		<hl7_version_compatible>2.4</hl7_version_compatible>\n'+
'		<sending_application>\n'+
'			<application_name>SHRINE Sheriff</application_name>\n'+
'			<application_version>1.1</application_version>\n'+
'		</sending_application>\n'+
'		<sending_facility>\n'+
'			<facility_name>i2b2 Hive</facility_name>\n'+
'		</sending_facility>\n'+
'		<receiving_application>\n'+
'			<application_name>SHRINE Sheriff Cell</application_name>\n'+
'			<application_version>1.4</application_version>\n'+
'		</receiving_application>\n'+
'		<receiving_facility>\n'+
'			<facility_name>SHRINE</facility_name>\n'+
'		</receiving_facility>\n'+
'		<datetime_of_message>2007-04-09T15:19:18.906-04:00</datetime_of_message>\n'+
'		<security>\n'+
'			<domain>{{{sec_domain}}}</domain>\n'+
'			<username>{{{sec_user}}}</username>\n'+
'			{{{sec_pass_node}}}\n'+
'		</security>\n'+
'		<message_control_id>\n'+
'			<message_num>{{{header_msg_id}}}</message_num>\n'+
'			<instance_num>0</instance_num>\n'+
'		</message_control_id>\n'+
'		<processing_id>\n'+
'			<processing_id>P</processing_id>\n'+
'			<processing_mode>I</processing_mode>\n'+
'		</processing_id>\n'+
'		<accept_acknowledgement_type>AL</accept_acknowledgement_type>\n'+
'		<application_acknowledgement_type>AL</application_acknowledgement_type>\n'+
'		<country_code>US</country_code>\n'+
'		<project_id>{{{sec_project}}}</project_id>\n'+
'	</message_header>\n'+
'	<request_header>\n'+
'		<result_waittime_ms>{{{result_wait_time}}}000</result_waittime_ms>\n'+
'	</request_header>\n'+
'	<message_body>\n'+
//JIRA|SHRINE-435:Charles McGow
'	<ns7:sheriff_header xsi:type="ns7:sheriffHeaderType" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/> \n'+
' 	<ns7:sheriff_request xsi:type="ns7:sheriffRequestType" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/> \n'+
//Old version 1.6.** - Start
//'		<request_type>SHERIFF_QRY_readApprovedEntries</request_type>\n'+
//Old version 1.6.** - End
//JIRA|SHRINE-435:Charles McGow
'	</message_body>\n'+
'</ns2:request>';

i2b2.SHRINE.cfg.parsers.readApprovedEntries = function() {
	if (!this.error) {
		this.model = [];
		var qm = this.refXML.getElementsByTagName('sheriffEntry');
		for(var i=0; i<1*qm.length; i++) {
			var o = new Object;
			o.xmlOrig = qm[i];
			o.approval = i2b2.h.getXNodeVal(qm[i],'approval');
			o.TopicID = i2b2.h.getXNodeVal(qm[i],'queryTopicID');
			o.Name = i2b2.h.getXNodeVal(qm[i],'queryName');
			//o.Intent = i2b2.h.getXNodeVal(qm[i],'queryIntent');
			//o.Note = i2b2.h.getXNodeVal(qm[i],'note');
			//JIRA|SHRINE-435: Charles McGow
			//Added XML latest XML structure to data-model
			//o.approvalTimestamp = i2b2.h.getXNodeVal(qm[i],'approvalTimestamp');
			//o.ECommonsID 		= i2b2.h.getXNodeVal(qm[i],'ECommonsID');
			//o.email 			= i2b2.h.getXNodeVal(qm[i],'email');
			//o.followUp 			= i2b2.h.getXNodeVal(qm[i],'followUp');
			//o.hasNonShrineCollaborator  = i2b2.h.getXNodeVal(qm[i],'hasNonShrineCollaborator');
			//o.nonShrineCollaboratorInfo = i2b2.h.getXNodeVal(qm[i],'nonShrineCollaboratorInfo');
			//o.protocolNumber 	= i2b2.h.getXNodeVal(qm[i],'protocolNumber');
			//o.queryReason 		= i2b2.h.getXNodeVal(qm[i],'queryReason');
			//o.queryReasonOther	= i2b2.h.getXNodeVal(qm[i],'queryReasonOther');
			//o.requestedTimestamp = i2b2.h.getXNodeVal(qm[i],'requestedTimestamp');
			//o.role				= i2b2.h.getXNodeVal(qm[i],'role');
			//JIRA|SHRINE-435: Charles McGow
			
			// encapsulate into an SDX package
			this.model.push(o);
		}
	} else {
		this.model = false;
		console.error("[readApprovedEntries] Could not parse() data!");
	}
	return this;
}
i2b2.SHRINE.ajax._addFunctionCall("readApprovedEntries",
				// Change this value in the config file [\i2b2\cells\SHRINE\cell_config_data.js]
                i2b2.SHRINE.cfg.config.readApprovedURL,
				i2b2.SHRINE.cfg.msgs.readApprovedEntries,
				null,
				i2b2.SHRINE.cfg.parsers.readApprovedEntries);


// SHRINE-Admin: Nich Wattanasin 01-29-15

i2b2.SHRINE.cfg.msgs.getNameInfo = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'+
'<ns6:request xmlns:ns4="http://www.i2b2.org/xsd/cell/crc/psm/1.1/" xmlns:ns7="http://www.i2b2.org/xsd/cell/crc/psm/querydefinition/1.1/" xmlns:ns3="http://www.i2b2.org/xsd/cell/crc/pdo/1.1/" xmlns:ns5="http://www.i2b2.org/xsd/hive/plugin/" xmlns:ns2="http://www.i2b2.org/xsd/hive/pdo/1.1/" xmlns:ns6="http://www.i2b2.org/xsd/hive/msg/1.1/">\n'+
'	<message_header>\n'+
'               {{{proxy_info}}}\n'+
'		<sending_application>\n'+
'			<application_name>i2b2_QueryTool</application_name>\n'+
'			<application_version>1.6</application_version>\n'+
'		</sending_application>\n'+
'		<sending_facility>\n'+
'			<facility_name>PHS</facility_name>\n'+
'		</sending_facility>\n'+
'		<receiving_application>\n'+
'			<application_name>i2b2_DataRepositoryCell</application_name>\n'+
'			<application_version>1.6</application_version>\n'+
'		</receiving_application>\n'+
'		<receiving_facility>\n'+
'			<facility_name>PHS</facility_name>\n'+
'		</receiving_facility>\n'+
'		<security>\n'+
'                       <domain>{{{sec_domain}}}</domain>\n'+
'                       <username>{{{sec_user}}}</username>\n'+
'                       {{{sec_pass_node}}}\n'+
'		</security>\n'+
'		<message_type>\n'+
'			<message_code>Q04</message_code>\n'+
'			<event_type>EQQ</event_type>\n'+
'		</message_type>\n'+
'		<message_control_id>\n'+
'			<message_num>{{{header_msg_id}}}</message_num>\n'+
'			<instance_num>0</instance_num>\n'+
'		</message_control_id>\n'+
'		<processing_id>\n'+
'			<processing_id>P</processing_id>\n'+
'			<processing_mode>I</processing_mode>\n'+
'		</processing_id>\n'+
'		<accept_acknowledgement_type>AL</accept_acknowledgement_type>\n'+
'		<project_id>{{{sec_project}}}</project_id>\n'+
'		<country_code>US</country_code>\n'+
'	</message_header>\n'+
'	<request_header>\n'+
'		<result_waittime_ms>{{{result_wait_time}}}000</result_waittime_ms>\n'+
'	</request_header>\n'+
'	<message_body>\n'+
'		<ns4:psmheader>\n'+
'                       <user login="{{{sec_user}}}">{{{sec_user}}}</user>\n'+
'                       <patient_set_limit>0</patient_set_limit>\n'+
'                       <estimated_time>0</estimated_time>\n'+
'               </ns4:psmheader>\n'+
'               <ns4:get_name_info category="{{{shrine_category}}}" max="{{{shrine_max_records}}}">\n'+
'                       <match_str strategy="contains">{{{shrine_match_str}}}</match_str>\n'+
'                       <user_id>{{{shrine_user_id}}}</user_id>\n'+
'                       <ascending>false</ascending>\n'+
'                </ns4:get_name_info>\n'+
'	</message_body>\n'+
'</ns6:request>';

i2b2.SHRINE.cfg.parsers.getNameInfo = function() {
        if (!this.error) {
                this.model = [];
                var qm = this.refXML.getElementsByTagName('query_master');
                for(var i=0; i<1*qm.length; i++) {
                        var o = new Object;
                        o.xmlOrig = qm[i];
                        o.id = i2b2.h.getXNodeVal(qm[i],'query_master_id');
                        o.networkid = i2b2.h.getXNodeVal(qm[i],'network_query_id');
                        o.name = i2b2.h.getXNodeVal(qm[i],'name');
                        o.userid = i2b2.h.getXNodeVal(qm[i],'user_id');
                        o.group = i2b2.h.getXNodeVal(qm[i],'group_id');
                        o.created = i2b2.h.getXNodeVal(qm[i],'create_date');
                        o.held = i2b2.h.getXNodeVal(qm[i],'held');
                        o.flagged = i2b2.h.getXNodeVal(qm[i],'flagged');
			o.flagmessage = i2b2.h.getXNodeVal(qm[i],'flagMessage');
                        var dStr = '';
                        var d = o.created.match(/^[0-9\-]*/).toString();
                        if (d) {
                                d = d.replace(/-/g,'/');
                                d = new Date(Date.parse(d));
                                if (d) {
                                        dStr = ' [' + (d.getMonth()+1) + '-' + d.getDate() + '-' + d.getFullYear().toString() + ']';
                                }
                        }
                        o.name += dStr + ' ['+o.userid+']';
                        // encapsulate into an SDX package
//                        var sdxDataPack = i2b2.sdx.Master.EncapsulateData('QM',o);
//                        this.model.push(sdxDataPack);
                        this.model.push(o);
                }
        } else {
                this.model = false;
                console.error("[getQueryMasterList_fromUserId] Could not parse() data!");
        }
        return this;
}


i2b2.SHRINE.ajax._addFunctionCall("getNameInfo", i2b2.SHRINE.cfg.config.adminURL, i2b2.SHRINE.cfg.msgs.getNameInfo, null, i2b2.SHRINE.cfg.parsers.getNameInfo);