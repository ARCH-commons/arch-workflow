//i2b2.PatientSetViewer.ShrineMapping.mappingType = "prefix";  // use 'prefix' to do simple substitution transformation, or 'api' to use SHRINE API
i2b2.PatientSetViewer.ShrineMapping["Demo"] = {
    // the Demo mappings are *not* simply prefix transformations, so have to have a couple of SHRINE-to-local transformations for local consumption
    localMap: {
        // 493
        "\\\\SHRINE\\SHRINE\\Diagnoses\\Diseases of the respiratory system (460-519.99)\\Chronic obstructive pulmonary disease and allied conditions (490-496.99)\\Asthma (493)\\":
        [
            "\\\\i2b2_DIAG\\i2b2\\Diagnoses\\Respiratory system (460-519)\\Chronic obstructive diseases (490-496)\\(493) Asthma\\(493-0) Extrinsic asthma\\(493-00) Extrinsic asthma without~\\",
            "\\\\i2b2_DIAG\\i2b2\\Diagnoses\\Respiratory system (460-519)\\Chronic obstructive diseases (490-496)\\(493) Asthma\\(493-0) Extrinsic asthma\\(493-01) Extrinsic asthma with st~\\",
            "\\\\i2b2_DIAG\\i2b2\\Diagnoses\\Respiratory system (460-519)\\Chronic obstructive diseases (490-496)\\(493) Asthma\\(493-0) Extrinsic asthma\\(493-02) Extrinsic asthma with acu~\\",
            "\\\\i2b2_DIAG\\i2b2\\Diagnoses\\Respiratory system (460-519)\\Chronic obstructive diseases (490-496)\\(493) Asthma\\(493-1) Intrinsic asthma\\(493-10) Intrinsic asthma without~\\",
            "\\\\i2b2_DIAG\\i2b2\\Diagnoses\\Respiratory system (460-519)\\Chronic obstructive diseases (490-496)\\(493) Asthma\\(493-1) Intrinsic asthma\\(493-11) Intrinsic asthma with st~\\",
            "\\\\i2b2_DIAG\\i2b2\\Diagnoses\\Respiratory system (460-519)\\Chronic obstructive diseases (490-496)\\(493) Asthma\\(493-1) Intrinsic asthma\\(493-12) Intrinsic asthma with a~\\",
            "\\\\i2b2_DIAG\\i2b2\\Diagnoses\\Respiratory system (460-519)\\Chronic obstructive diseases (490-496)\\(493) Asthma\\(493-2) Chronic obstructive asthma\\(493-20) Chronic obstructive asth~\\",
            "\\\\i2b2_DIAG\\i2b2\\Diagnoses\\Respiratory system (460-519)\\Chronic obstructive diseases (490-496)\\(493) Asthma\\(493-2) Chronic obstructive asthma\\(493-21) Chronic obstructive asth~\\",
            "\\\\i2b2_DIAG\\i2b2\\Diagnoses\\Respiratory system (460-519)\\Chronic obstructive diseases (490-496)\\(493) Asthma\\(493-2) Chronic obstructive asthma\\(493-22) Chronic obstructive asth~\\",
            "\\\\i2b2_DIAG\\i2b2\\Diagnoses\\Respiratory system (460-519)\\Chronic obstructive diseases (490-496)\\(493) Asthma\\(493-81) Exercise induced bronchospasm\\",
            "\\\\i2b2_DIAG\\i2b2\\Diagnoses\\Respiratory system (460-519)\\Chronic obstructive diseases (490-496)\\(493) Asthma\\(493-8) Other forms of asthma\\(493-82) Cough variant asthma\\",
            "\\\\i2b2_DIAG\\i2b2\\Diagnoses\\Respiratory system (460-519)\\Chronic obstructive diseases (490-496)\\(493) Asthma\\(493-9) Asthma, unspecified\\(493-90) Asthma, unspecified type~\\",
            "\\\\i2b2_DIAG\\i2b2\\Diagnoses\\Respiratory system (460-519)\\Chronic obstructive diseases (490-496)\\(493) Asthma\\(493-9) Asthma, unspecified\\(493-91) Asthma, unspecified type~\\",
            "\\\\i2b2_DIAG\\i2b2\\Diagnoses\\Respiratory system (460-519)\\Chronic obstructive diseases (490-496)\\(493) Asthma\\(493-9) Asthma, unspecified\\(493-92) Asthma, unspecified type~\\"
        ],
        // 493.02
        "\\\\SHRINE\\SHRINE\\Diagnoses\\Diseases of the respiratory system (460-519.99)\\Chronic obstructive pulmonary disease and allied conditions (490-496.99)\\Asthma (493)\\Extrinsic asthma (493.0)\\(493.02) Extrinsic asthma with (acute) exacerbation\\":
            [
                "\\\\i2b2_DIAG\\i2b2\\Diagnoses\\Respiratory system (460-519)\\Chronic obstructive diseases (490-496)\\(493) Asthma\\(493-0) Extrinsic asthma\\(493-02) Extrinsic asthma with acu~\\"
            ],
        // 493.90
        "\\\\SHRINE\\SHRINE\\Diagnoses\\Diseases of the respiratory system (460-519.99)\\Chronic obstructive pulmonary disease and allied conditions (490-496.99)\\Asthma (493)\\Asthma, unspecified (493.9)\\(493.90) Asthma, unspecified type, unspecified\\":
            [
                "\\\\i2b2_DIAG\\i2b2\\Diagnoses\\Respiratory system (460-519)\\Chronic obstructive diseases (490-496)\\(493) Asthma\\(493-9) Asthma, unspecified\\(493-90) Asthma, unspecified type~"
            ],
        // 642.00
        "\\\\SHRINE\\SHRINE\\Diagnoses\\Complications of pregnancy, childbirth, and the puerperium (630-679.99)\\Complications mainly related to pregnancy (640-649.99)\\Hypertension complicating pregnancy, childbirth, and the puerperium (642)\\Benign essential hypertension complicating pregnancy, childbirth, and the puerperium (642.0)\\(642.00) Benign essential hypertension complicating pregnancy, childbirth, and the puerperium, unspecified as to episode of care or not applicable\\":
        [
            "\\\\i2b2_DIAG\\i2b2\\Diagnoses\\Events of pregnancy (630-677)\\(642) Hypertension complicating p~\\(642-0) Benign essential hyperten~\\(642-00) Benign essential hyperte~\\"
        ]
    },

    getLocalMapping: function(shrineMapping) {
        if (shrineMapping) {
            if (this.localMap[shrineMapping])
                return this.localMap[shrineMapping];
            else
                return null;
        } else
            return null;
    }
};