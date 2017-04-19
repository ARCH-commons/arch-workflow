// this file contains a list of all files that need to be loaded dynamically for this i2b2 Cell
// every file in this list will be loaded after the cell's Init function is called
{
  files: [
    "SHRINE_ctrl.js",
    "i2b2_msgs.js"
  ],
  css: [],
  config: {
    // additional configuration variables that are set by the system
    name: "SHRINE Cell",
    description: "The SHRINE cell...",
    category: ["core","cell","shrine"],
    newTopicURL: "https://shrine.scilhs.org/steward/client/index.html",
    readApprovedURL:"http://shrine.scilhs.org:6060/shrine-pcori/rest/i2b2/request" 
  }
}
