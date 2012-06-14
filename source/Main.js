enyo.kind({
	name: "Ubiquity.Main",
	kind: enyo.VFlexBox,
	clipboardComponents:[],
	ID:Math.random(),
	useBanners:true,
	published:{
		launchParams:null,
	},
	components:[
		{kind:enyo.ApplicationEvents, onWindowDeactivated:"enableBanners", onWindowActivated:"disableBanners", onApplicationRelaunch: "relaunchHandler"},
		{name:"pane", flex:1, kind:enyo.Pane, components:[
			{name:"Clipboard", kind:"Ubiquity.Clipboard", onNotify:"notify", onNotLoggedInError:"showNotLoggedInError", onLinkClick:"linkClick"},
			{name:"VilloLogin", kind:"Ubiquity.Villo", onLoginSuccess:"loginSuccessful"},
		]},
		//{kind: enyo.ApplicationEvents, onOpenAppMenu:"appMenuOpened"},
		{name:"appMenu", kind:enyo.AppMenu, onOpen:"appMenuOpened", components:[
			{kind:enyo.EditMenu},
			{name:"logOutMenuItem", caption:$L("Log out"), onclick:"logout"},
			{name:"clearMenuItem",caption:$L("Clear all"), onclick:"showClearDialog"},
			{kind:enyo.HelpMenu, target:"http://web.njit.edu/~cmm35/palm/help/ubiquity/"},
			{name:"donateMenuItem", caption:$L("Donate"), onclick:"donate"},
		]},
		{name:"clearDialog", kind:enyo.DialogPrompt, title:"Clear clipboard", message:"Delete all items in the clipboard?", onAccept:"clearClipboard"},
		{
			name:"AppManService",
			kind:"PalmService",
			service:"palm://com.palm.applicationManager/",
			method:"open",
		},
		{name:"notLoggedInError", kind:enyo.Popup, dismissWithClick:true, dismissWithEscape:true, autoClose:true, components:[
			{content:"You must be logged in to do that."},
		]},
		{name:"about", kind:enyo.Popup, dismissWithEscape:true, autoClose:false, components:[
			{kind:enyo.Header, content:"About Ubiquity"},
			{content:"Some information goes here"},
			{kind:enyo.HtmlContent, srcId:"donateButton"},
		]},
	],
	showClearDialog:function()
	{
		this.$.clearDialog.open();
	},
	clearClipboard:function()
	{
		this.$.Clipboard.items = [];
		this.$.Clipboard.save();
		this.$.Clipboard.$.repeater.render();
		this.notify();
	},
	rendered:function()
	{
		this.inherited(arguments);
		this.clipboardComponents = [];
		if(!villo.user.isLoggedIn())
		{
			this.$.pane.selectViewByName("VilloLogin");
		}
		else(this.loginSuccessful());
	},
	loginSuccessful:function()
	{
		this.$.pane.selectViewByName("Clipboard");
		if(!villo.chat.isSubscribed(villo.user.username))
		{
			villo.chat.join({room:villo.user.username,callback:this.gotMessage.bind(this),presence: {enabled:false}})
		}
		this.$.Clipboard.load();
	},
	showNotLoggedInError:function()
	{
		this.$.notLoggedInError.openAtCenter();
		this.$.pane.selectViewByName("VilloLogin");
	},
	gotMessage:function(message)
	{
		console.log("Got message");
		if(message.message != this.ID)
		{
			setTimeout(this.$.Clipboard.load.bind(this.$.Clipboard),500);
			if(this.useBanners)
				enyo.windows.addBannerMessage("Clipboard updated","{}");
		}
	},
	goBack:function()
	{
		this.$.pane.back();
	},
	notify:function()
	{
		villo.chat.send({room:villo.user.username,message:this.ID});
	},
	appMenuOpened:function()
	{
		this.$.logOutMenuItem.setDisabled(!villo.user.isLoggedIn());
		this.$.clearMenuItem.setDisabled(!villo.user.isLoggedIn());
	},
	logout:function()
	{
		villo.user.logout();
		this.$.pane.selectViewByName("VilloLogin");
	},
	launchParamsChanged:function()
	{
		if(this.launchParams && this.launchParams.newMessage)
			Main.$.Clipboard.$.input.setValue(this.launchParams.newMessage);
	},
	relaunchHandler:function()
	{
		if(enyo.windowParams && enyo.windowParams.newMessage)
			Main.$.Clipboard.$.input.setValue(enyo.windowParams.newMessage);
	},
	enableBanners:function()
	{
		Main.useBanners = true;
	},
	disableBanners:function()
	{
		Main.useBanners = false;
	},
	linkClick:function(inURL)
	{
		this.$.AppManService.call({target:inURL});
	},
	donate:function()
	{
		this.$.AppManService.call({target:"https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=UFDJZXK5KKCHL&lc=US&item_name=Ubiquity&currency_code=USD&bn=PP%2dDonationsBF%3abtn_donateCC_LG%2egif%3aNonHosted"});
	}
});
