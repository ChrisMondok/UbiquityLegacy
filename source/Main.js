enyo.kind({
	name: "Ubiquity.Main",
	kind: enyo.VFlexBox,
	clipboardComponents:[],
	components:[
		{name:"pane", flex:1, kind:enyo.Pane, components:[
			{name:"Clipboard", kind:"Ubiquity.Clipboard"},
			{name:"VilloLogin", kind:"Ubiquity.Villo", callback:this.loggedInCallback},
		]},
		{name:"appMenu", kind:enyo.AppMenu, components:[
			{caption:"Preferencs"},
			{caption:"Help"},
		]},
	],
	rendered:function()
	{
		this.inherited(arguments);
		this.clipboardComponents = [];
		if(!villo.user.isLoggedIn())
		{
			this.$.pane.selectViewByName("VilloLogin");
		}
		else(this.loggedInCallback());
	},
	loggedInCallback:function()
	{
		this.$.pane.selectViewByName("Clipboard");
		if(!villo.chat.isSubscribed(villo.user.token))
		{
			if(villo.chat.join({room:villo.user.token,callback:this.gotMessage,presence: {enabled:false}}))
				villo.chat.history({room:villo.user.token,callback:this.gotHistory,limit:50});

		}
	},
	gotHistory:function(messages)
	{
		for(var i = 0; i < messages.length; i++)
			Main.clipboardComponents.push(messages[i].message);
		Main.$.Clipboard.$.repeater.render();
		Main.$.Clipboard.revealBottom();
	},
	gotMessage:function(message)
	{
		Main.clipboardComponents.push(message.message);
		Main.$.Clipboard.$.repeater.render();
		Main.$.Clipboard.revealBottom();
	},
	sendMessage:function(string)
	{
		villo.chat.send({room:villo.user.token,message:string});
	},
	openAppMenuHandler:function()
	{
		this.$.appMenu.open();
	},
	closeAppMenuHandler:function()
	{
		this.$.appMenu.close();
	},

});
