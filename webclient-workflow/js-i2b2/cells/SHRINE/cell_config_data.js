// This SHRINE configuration file is for local i2b2 installations only
// to be used in conjunction with the ARCH workflow plugin
{
    files: [
        "i2b2_msgs.js"
    ],
    css: [],
    config: {
        adminURL: "http://adapter1:6060/shrine/rest/i2b2/admin/request",
        ontologyMappingType: "Demo" // NOTE: Set to 'PCORI' when using PCORI's ontology
    }
}
