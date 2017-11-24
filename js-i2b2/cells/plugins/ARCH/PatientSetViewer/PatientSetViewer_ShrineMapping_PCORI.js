i2b2.PatientSetViewer.ShrineMapping.mappingType = "prefix";  // use 'prefix' to do simple substitution transformation, or 'api' to use SHRINE API
i2b2.PatientSetViewer.ShrineMapping.prefixTypes = {
    "pcori": {
        "\\\\SHRINE\\SHRINE\\ENCOUNTER": "\\\\PCORI_VISIT\\PCORI\\ENCOUNTER",
        "\\\\SHRINE\\SHRINE\\ENROLLMENT": "\\\\PCORI_VISIT\\PCORI\\ENROLLMENT",
        "\\\\SHRINE\\SHRINE\\ENCOUNTER": "\\\\PCORI_VISIT\\PCORI\\ENCOUNTER",
        "\\\\SHRINE\\SHRINE\\ENCOUNTER": "\\\\PCORI_VISIT\\PCORI\\ENCOUNTER",
        "\\\\SHRINE\\SHRINE\\ENCOUNTER": "\\\\PCORI_VISIT\\PCORI\\ENCOUNTER",
        "\\\\SHRINE\\SHRINE\\ENCOUNTER": "\\\\PCORI_VISIT\\PCORI\\ENCOUNTER",
        "\\\\SHRINE\\SHRINE\\ENCOUNTER": "\\\\PCORI_VISIT\\PCORI\\ENCOUNTER",
        "\\\\SHRINE\\SHRINE\\ENCOUNTER": "\\\\PCORI_VISIT\\PCORI\\ENCOUNTER",

    },
    "demo": {
        "\\\\SHRINE\\SHRINE\\Demographics": "\\\\i2b2_DEMO\\i2b2\\Demographics",
        "\\\\SHRINE\\SHRINE\\Diagnoses": "\\\\i2b2_DIAG\\i2b2\\Diagnoses",
        // "\\\\SHRINE\\SHRINE\\Labs": "\\\\i2b2_LABS\\i2b2\\Labtests",
    }
};