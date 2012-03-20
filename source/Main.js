enyo.kind({
	name: "Ubiquity.Main",
	kind: enyo.VFlexBox,
	clipboardComponents:[],
	components:[
		{name:"pane", flex:1, kind:enyo.Pane, components:[
			{name:"Clipboard", kind:"Ubiquity.Clipboard"},
			{name:"VilloLogin", kind:"Ubiquity.Villo", callback:this.loggedInCallback},
		]},
		//{kind: enyo.ApplicationEvents, onOpenAppMenu:"appMenuOpened"},
		{name:"appMenu", kind:enyo.AppMenu, onOpen:"appMenuOpened", components:[
			{kind:enyo.EditMenu},
			{name:"logOutMenuItem", caption:$L("Log out"), onclick:"logout"},
			{name:"clearMenuItem",caption:$L("Clear all"), onclick:"showClearDialog"},
			{caption:$L("Help"), disabled:true},
		]},
		{name:"clearDialog", kind:enyo.DialogPrompt, title:"Clear clipboard", message:"Delete all items in the clipboard?", onAccept:"clearClipboard"},
		{
			name:"AppManService",
			kind:"PalmService",
			service:"palm://com.palm.applicationManager/",
			method:"open",
		},
	],
	showClearDialog:function()
	{
		this.$.clearDialog.open();
	},
	clearClipboard:function()
	{
		this.$.Clipboard.items = [];
		this.$.Clipboard.save();
		this.$.Clipboard.notify();
	},
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
			villo.chat.join({room:villo.user.token,callback:this.gotMessage,presence: {enabled:false}})
		}
		this.$.Clipboard.load();
	},
	gotMessage:function(message)
	{
		Main.$.Clipboard.load();
	},
	notify:function()
	{
		villo.chat.send({room:villo.user.token,message:"update"});
	},
	appMenuOpened:function()
	{
		Main.$.logOutMenuItem.setDisabled(!villo.user.isLoggedIn());
		Main.$.clearMenuItem.setDisabled(!villo.user.isLoggedIn());
	},
	logout:function()
	{
		villo.user.logout();
		Main.$.pane.selectViewByName("VilloLogin");
	},
});
