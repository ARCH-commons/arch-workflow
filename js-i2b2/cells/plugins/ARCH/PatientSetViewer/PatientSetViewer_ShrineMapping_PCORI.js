i2b2.PatientSetViewer.ShrineMapping.PCORI = {};

// SHRINE to PCORI ontology prefix mappings
i2b2.PatientSetViewer.ShrineMapping.PCORI.ontologyPrefixMap = new Map(
    ["\\\\SHRINE\\SHRINE\\ENCOUNTER", "\\\\PCORI_VISIT\\PCORI\\ENCOUNTER"],
    ["\\\\SHRINE\\SHRINE\\ENROLLMENT", "\\\\PCORI_ENROLL\\PCORI\\ENROLLMENT"],
    ["\\\\SHRINE\\SHRINE_MOD\\CHART", "\\\\PCORI_ENROLL\\PCORI_MOD\\CHART"],
    ["\\\\SHRINE\\SHRINE\\VITAL", "\\\\PCORI_VITAL\\PCORI\\VITAL"],
    ["\\\\SHRINE\\SHRINE_MOD\\VITAL_SOURCE", "\\\\PCORI_VITAL\\PCORI_MOD\\VITAL_SOURCE"]
    ["\\\\SHRINE\\SHRINE\\DEMOGRAPHIC", "\\\\PCORI_DEMO\\PCORI\\DEMOGRAPHIC"],
    ["\\\\SHRINE\\SHRINE\\DIAGNOSIS","\\\\PCORI_DIAG\\PCORI\\DIAGNOSIS"],
    ["\\\\SHRINE\\SHRINE_MOD\\CONDITION_OR_DX", "\\\\PCORI_DIAG\\PCORI_MOD\\CONDITION_OR_DX"],
    ["\\\\SHRINE\\SHRINE_MOD\\ORIGDX", "\\\\PCORI_DIAG\\PCORI_MOD\\ORIGDX"],
    ["\\\\SHRINE\\SHRINE_MOD\\PDX", "\\\\PCORI_DIAG\\PCORI_MOD\\PDX"],
    ["\\\\SHRINE\\SHRINE\\LAB_RESULT_CM", "\\\\PCORI_LAB\\PCORI\\LAB_RESULT_CM"],
    ["\\\\SHRINE\\SHRINE_MOD\\PRIORITY", "\\\\PCORI_LAB\\PCORI_MOD\\PRIORITY"],
    ["\\\\SHRINE\\SHRINE_MOD\\RESULT_LOC", "\\\\PCORI_LAB\\PCORI_MOD\\RESULT_LOC"],
    ["\\\\SHRINE\\SHRINE\\PROCEDURE", "\\\\PCORI_PROC\\PCORI\\PROCEDURE"],
    ["\\\\SHRINE\\SHRINE_MOD\\(1021435) Modifiers", "\\\\PCORI_PROC\\PCORI_MOD\\(1021435) Modifiers"],
    ["\\\\SHRINE\\SHRINE_MOD\\ORIGPX", "\\\\PCORI_PROC\\PCORI_MOD\\ORIGPX"],
    ["\\\\SHRINE\\SHRINE_MOD\\PX_SOURCE", "\\\\PCORI_PROC\\PCORI_MOD\\PX_SOURCE"],
    ["\\\\SHRINE\\SHRINE\\MEDICATION", "\\\\PCORI_MED\\PCORI\\MEDICATION"],
    ["\\\\SHRINE\\SHRINE_MOD\\RX_BASIS", "\\\\PCORI_MED\\PCORI_MOD\\RX_BASIS"],
    ["\\\\SHRINE\\SHRINE_MOD\\RX_DAYS_SUPPLY", "\\\\PCORI_MED\\PCORI_MOD\\RX_DAYS_SUPPLY"]
    ["\\\\SHRINE\\SHRINE_MOD\\RX_FREQUENCY", "\\\\PCORI_MED\\PCORI_MOD\\RX_FREQUENCY"],
    ["\\\\SHRINE\\SHRINE_MOD\\RX_QUANTITY", "\\\\PCORI_MED\\PCORI_MOD\\RX_QUANTITY"]
    ["\\\\SHRINE\\SHRINE_MOD\\RX_REFILLS", "\\\\PCORI_MED\\PCORI_MOD\\RX_REFILLS"]
);


i2b2.PatientSetViewer.ShrineMapping.PCORI.getLocalMapping = function(shrineMapping) {
        if (shrineMapping) {
            for (var [key, val] of i2b2.PatientSetViewer.ShrineMapping.PCORI.ontologyPrefixMap) {
                if (shrineMapping.toUpperCase().startsWith(key))
                    return shrineMapping.replace(key, val);
            }
            return null;
        } else
            return null;
}


//     i2b2.PatientSetViewer.ShrineMapping.mappingType = "prefix";  // use 'prefix' to do simple substitution transformation, or 'api' to use SHRINE API
// i2b2.PatientSetViewer.ShrineMapping.prefixTypes = {
//     "pcori": {
//         "\\\\SHRINE\\SHRINE\\ENCOUNTER": "\\\\PCORI_VISIT\\PCORI\\ENCOUNTER",
//         "\\\\SHRINE\\SHRINE\\ENROLLMENT": "\\\\PCORI_VISIT\\PCORI\\ENROLLMENT",
//         "\\\\SHRINE\\SHRINE\\ENCOUNTER": "\\\\PCORI_VISIT\\PCORI\\ENCOUNTER",
//         "\\\\SHRINE\\SHRINE\\ENCOUNTER": "\\\\PCORI_VISIT\\PCORI\\ENCOUNTER",
//         "\\\\SHRINE\\SHRINE\\ENCOUNTER": "\\\\PCORI_VISIT\\PCORI\\ENCOUNTER",
//         "\\\\SHRINE\\SHRINE\\ENCOUNTER": "\\\\PCORI_VISIT\\PCORI\\ENCOUNTER",
//         "\\\\SHRINE\\SHRINE\\ENCOUNTER": "\\\\PCORI_VISIT\\PCORI\\ENCOUNTER",
//         "\\\\SHRINE\\SHRINE\\ENCOUNTER": "\\\\PCORI_VISIT\\PCORI\\ENCOUNTER",
//
//     },
//     "demo": {
//         "\\\\SHRINE\\SHRINE\\Demographics": "\\\\i2b2_DEMO\\i2b2\\Demographics",
//         "\\\\SHRINE\\SHRINE\\Diagnoses": "\\\\i2b2_DIAG\\i2b2\\Diagnoses",
//         // "\\\\SHRINE\\SHRINE\\Labs": "\\\\i2b2_LABS\\i2b2\\Labtests",
//     }
};