*Description*

This module is designed for the Loopback framework. It provides extensive support for Audit Trails in your LoopBack based application.

It consists of a group of functionalities:

Timestamps of updates/creates.
Registration of the user that created/updated/deleted (thanks to the work of loopback-component-remote-ctx).
History logging in a separate table.
Each of these main functionalities can be turned off individually.

*Install*

   npm install --save loopback-component-remote-ctx 
	
*Server Config*

Add the mixins property to your server/model-config.json:

  {"_meta": {
    "sources": [
      "loopback/common/models",
      "loopback/server/models",
      "../common/models",
      "./models"
    ],
	 "mixins": [
      "loopback/common/mixins",
      "loopback/server/mixins",
      "../common/mixins",
      "./mixins"
    ]
  }
	}
	
Make sure you enable authentication by putting the following in a boot script (ie server/boot/authentication.js):
'use strict';
module.exports = function enableAuthentication(server) {
  // enable authentication
  server.enableAuth();
};

Enable the loopback-component-remote-ctx by adding the following in your server/component-config.json:
  "loopback-component-remote-ctx": {
    "enabled": true,
    "argName": "remoteCtx",
    "blackList": ["User"]
  }
	
And finally use the loopback token middleware by adding the following line to your server/server.js:
app.use(loopback.token());

*Configure*
To use with your Models add the mixins attribute to the definition object of your model config.

  {
    "name": "ContactInfo",
    "properties": {
      "name": {
        "type": "string",
      },
    },
    "mixins": {
      "DataAudit" : true,
    },
  },
	
*Usage with MongoDB*
In case you use MongoDB with this module, and also use the 'revisions' table option, you need to configure the idType as a 'String'. Otherwise this module will attempt to store the non-numeric id in the row_id property of the revisions model, which is a Number by default.
