enyo.kind({
	name:"Ubiquity.Clipboard",
	kind:"VFlexBox",
	style:"background-color:#D8D8D8",
	//urlPattern: /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi,
	urlPattern: /https?\:\/\/[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,3}/,
	components:[
		{name:"scroller", kind:enyo.FadeScroller, horizontal:false, autoHorizontal:false, flex:1, components:[
			{name:"repeater", kind:enyo.VirtualRepeater, onSetupRow:"setupRow", components:[
				{kind:enyo.Item, tapHighlight:true, onclick:"copy", layoutKind:enyo.HFlexLayout, components:[
					{name:"content", content:"Content", flex:1},
					{name:"goto", kind:enyo.Button, onclick:"gotoUrl", caption:"Go to URL"},
				]},
			]},
		]},
		{kind:enyo.Toolbar, components:[
			{kind:enyo.ToolInput, name:"input", hint:"Type message here", flex:1},
			{kind:enyo.ToolButton, onclick:"paste", caption:"Paste"},
			{kind:enyo.ToolButton, onclick:"logOut", caption:"Log Out"},
		]},
		{
			name:"launchBrowserCall",
			kind:"PalmService",
			service:"palm://com.palm.applicationManager/",
			method:"launch",
			onSuccess:"launchFinished",
			onFailure:"launchFail",
			onResponse:"gotResponse",
			subscribe:true
		},
		{
			kind:enyo.DialogPrompt,
			name:"logoutDialog",
			message:"Are you sure you wish to log out?",
			onAccept:"doLogOut",
		},
	],
	setupRow:function(sender,index)
	{
		if(index < Main.clipboardComponents.length)
		{
			this.$.content.setContent(Main.clipboardComponents[index]);
			this.$.goto.setShowing(this.testURL(Main.clipboardComponents[index]));
			return true;
		}
	},
	testURL:function(string)
	{
		if(!(this.urlRegex))
			this.urlRegex = new RegExp(this.urlPattern);

		if(this.urlRegex.test(string))
			return true;
	},
	copy:function()
	{
		enyo.dom.setClipboard(this.$.content.getContent());
	},
	paste:function()
	{
		if(this.$.input.getValue != "");
		Main.sendMessage(this.$.input.getValue());
		this.$.input.setValue("");
	},
	revealBottom:function(noAnimate)
	{
		var boundaries = this.$.scroller.getBoundaries();
		this.$.scroller.scrollTo(boundaries.bottom,0);
	},
	logOut:function()
	{
		this.$.logoutDialog.open();
	},
	doLogOut:function()
	{
		villo.user.logout();
		Main.$.pane.selectViewByName("VilloLogin");
	},
	launchFinished:function(sender,response){},
	launchFail:function(sender,response){},
	gotoUrl:function(sender)
	{
		this.$.launchBrowserCall.call({"id":"com.palm.app.browser","params":{"target":this.$.content.getContent()}});
	}
});
