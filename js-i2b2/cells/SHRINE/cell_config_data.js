// This SHRINE configuration file is for local i2b2 installations only
// to be used in conjunction with the SCILHS/ACT workflow plugin
{
        files: [
                "i2b2_msgs.js"
        ],
        css: [],
        config: {
	//    name: "SHRINE Cell",
	    //                description: "The SHRINE cell...",
            //    category: ["core","cell","shrine"],
            //     adminURL: "http://shrine-hub:6060/shrine/rest/i2b2/admin/request"
                adminURL: "http://adapter1:6060/shrine/rest/i2b2/admin/request"
        }
}
