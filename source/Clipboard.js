enyo.kind({
	name:"Ubiquity.Clipboard",
	kind:"VFlexBox",
	style:"background-color:#D8D8D8",
	items: [],
	SHOW_COPY_DIALOG:false,
	components:[
		{name:"scroller", kind:enyo.FadeScroller, horizontal:false, autoHorizontal:false, flex:1, components:[
			{name:"repeater", kind:enyo.VirtualRepeater, onSetupRow:"setupRow", components:[
				{kind:enyo.SwipeableItem, tapHighlight:true, onclick:"copy", onConfirm:"deleteItem", layoutKind:enyo.HFlexLayout, components:[
					{name:"content", kind:"HtmlContent", onLinkClick:"linkClick", allowHTML:true, content:"Content", flex:1},
				]},
			]},
		]},
		{kind:enyo.Toolbar, components:[
			{kind:enyo.ToolInput, name:"input", hint:$L("Type here"), flex:1},
			{name:"pasteButton", kind:enyo.ActivityButton, onclick:"paste", caption:$L("Paste"), disabled:true},
		]},
	],
	create:function()
	{
		this.inherited(arguments);
		//determine whether we're on a webos device or a browser.
		if(typeof enyo.fetchDeviceInfo() == "undefined")
			this.SHOW_COPY_DIALOG = true;
	},
	load:function() // render
	{
		villo.storage.get({privacy:true,title:"clipboard",callback:this.gotClipboard});
	},
	notify:function()
	{
		this.$.pasteButton.setActive(true);
		Main.notify();
	},
	deleteItem:function(event,row) //notify -> load -> render
	{
		this.items.splice(row,1);
		this.save();
		this.notify();
	},
	gotClipboard:function(cb)
	{
		var newItems = cb.storage.replace(/\\\\/g,"\\").replace(/\\\"/g,"\"");
		Main.$.Clipboard.items = enyo.json.parse(newItems);
		Main.$.Clipboard.$.pasteButton.setActive(false);
		Main.$.Clipboard.$.pasteButton.setDisabled(false);
		Main.$.Clipboard.render();
	},
	setupRow:function(sender,index)
	{
		if(index < this.items.length)
		{
			var value = this.items[index];
			if(typeof PalmSystem != "undefined")
				value = enyo.string.runTextIndexer(value,{phoneNumber:true,emailAddress:true,webLink:true,schemalessWebLink:true,emoticon:false});
			this.$.content.setContent(value);
			return true;
		}
	},
	copy:function()
	{
		enyo.dom.setClipboard(this.$.content.getContent());
	},
	paste:function() //notify -> load -> render
	{

		if(this.$.input.getValue() != "")
		{
			this.items.unshift(this.$.input.getValue());
			this.save();
			this.notify();
		}
		this.$.input.setValue("");
	},
	save:function()
	{
		var sanitizedItems = [];
		for(var i = 0; i < this.items.length; i++)
			sanitizedItems[i] = this.items[i];
		villo.storage.set({privacy:true,title:"clipboard",data:enyo.json.stringify(sanitizedItems)});
	},
	revealBottom:function(noAnimate)
	{
		var boundaries = this.$.scroller.getBoundaries();
		this.$.scroller.scrollTo(boundaries.bottom,0);
	},
	linkClick:function(sender, inURL, event)
	{
		Main.$.AppManService.call({target:inURL});
	},
});
