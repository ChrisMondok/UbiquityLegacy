enyo.kind({
	name:"Ubiquity.Villo",
	kind:"VFlexBox",
	style:"background-color:#D8D8D8",
	components:[
		{kind:enyo.Pane, components:[
			{name:"Login", kind:"Ubiquity.VilloLogin"},
		]},
	],
	create:function()
	{
		this.inherited(arguments);
		this.initVillo();
	},
	initVillo:function()
	{
		villo.load({id:"com.chrismondok.ubiquity",version:"0.0.1",developer:"Chris Mondok",type:"mobile",title:"Ubiquity",api:"40fc3a6308d6804da0f06dc73b0e58e1",push:true});
	},
});
enyo.kind({
	name:"Ubiquity.VilloLogin",
	kind:enyo.Control,
	style:"max-width:480px; margin-left:auto; margin-right:auto;",
	components:[
		{name:"pane", kind:enyo.Pane,transitionKind:"Ubiquity.transitions.Flip", components:[
			{name:"login", kind:enyo.VFlexBox, components:[
				{kind:enyo.RowGroup, caption:"Log in to Villo", className:"villoBackground", components:[
					{name:"username", kind:enyo.Input, hint:"Username"},
					{name:"password", kind:enyo.PasswordInput, hint:"Password"},
					{components:[
						{kind:enyo.Button, caption:"Log in", onclick:"login", className:"enyo-button-dark"},
						{kind:enyo.Button, caption:"Register", onclick:"showRegistration"},
					]},
				]},
			]},
			{name:"register", kind:enyo.VFlexBox,components:[
				{kind:enyo.RowGroup, caption:"Register with Villo",className:"villoBackground", components:[
					{name:"rUsername", kind:enyo.Input, hint:"Username", onchange:"checkValid"},
					{name:"rPassword", kind:enyo.PasswordInput, hint:"Password", onchange:"checkValid"},
					{name:"rConfirm", kind:enyo.PasswordInput, hint:"Confirm Password", onchange:"checkValid"},
					{name:"rEmail", kind:enyo.Input, hint:"Email address", onchange:"checkValid"},
					{components:[
						{name:"doRegisterButton",disabled:true, kind:enyo.Button, caption:"Register", onclick:"register", className:"enyo-button-affirmative"},
						{kind:enyo.Button, caption:"Cancel", onclick:"showLogin"},
					]},
				]},

			]},
		]},
		{name:"popup", kind:enyo.ModalDialog, onclick:"hidePopup", dismissWithClick:true, dismissWithEscape:true, caption:"caption", components:[
			{name:"text", content:"content"},	
		]},
	],
	login:function()
	{
		villo.user.login({username:this.$.username.getValue(),password:this.$.password.getValue()},this.loginCallback);
	},
	showRegistration:function()
	{
		this.$.pane.selectViewByName("register");
	},
	showLogin:function()
	{
		this.$.pane.selectViewByName("login");
	},
	register:function()
	{
		villo.user.register(
		{
			username:this.$.rUsername.getValue(),
			password:this.$.rPassword.getValue(),
			password_confirm:this.$.rConfirm.getValue(),
			email:this.$.rEmail.getValue(),
			fourvalue:true,
			callback:this.registerCallback,
		});
	},
	registerCallback:function(params)
	{
		if(params === true)
		{
			Main.$.VilloLogin.$.Login.showLogin();
			Main.$.VilloLogin.$.Login.$.username.setValue(Main.$.VilloLogin.$.Login.$.rUsername.getValue());
			Main.$.VilloLogin.$.Login.$.password.setValue(Main.$.VilloLogin.$.Login.$.rPassword.getValue());
		}
		else
		{
			params = {user:{username:false,email:false}};
			if(params && params.user)
			{
				if(params.user.username === false)
					Main.$.VilloLogin.$.Login.$.rUsername.addClass("invalid");
				if(params.user.password === false)
					Main.$.VilloLogin.$.Login.$.rpassword.addClass("invalid");
				if(params.user.email === false)
					Main.$.VilloLogin.$.Login.$.rEmail.addClass("invalid");
				Main.$.VilloLogin.$.Login.showError("Try again","Registration error");
			}
			else
				Main.$.VilloLogin.$.Login.showError("A generic error occurred","Registration error");
		}
	},
	checkValid:function(sender)
	{
		this.$.doRegisterButton.setDisabled(true);

		sender.removeClass("invalid");
		
		//See if passwords match
		if(this.$.rPassword.getValue() == this.$.rConfirm.getValue())
		{
			this.$.rConfirm.removeClass("invalid");
			this.$.rConfirm.addClass("valid");
		}
		else
		{
			this.$.rConfirm.addClass("invalid");
			this.$.rConfirm.removeClass("valid");
			return;
		}
		
		//Make sure no fields are blank
		if(this.$.rUsername.getValue().length == 0)
			return;
		if(this.$.rPassword.getValue().length == 0)
			return;
		if(this.$.rConfirm.getValue().length == 0)
			return;
		if(this.$.rEmail.getValue().length == 0)
			return;


		this.$.doRegisterButton.setDisabled(false);
	},
	createAccount:function()
	{
		villo.user.register({username:this.$.username.getValue(),password:this.$.password.getValue(),password_confirm:this.$.password.getValue(),email:this.$.email.getValue(),callback:this.loginCallback});
	},
	loginCallback:function(response)
	{
		if(response === true)
		{
			if(villo.user.isLoggedIn())
				Main.loggedInCallback();
		}
		else
			Main.$.VilloLogin.$.Login.showError("Check username and password");
	},
	showError:function(message, title)
	{
		this.$.popup.caption = title;
		this.$.popup.openAtCenter();
		this.$.text.setContent(message);
	},
	hidePopup:function()
	{
		this.$.popup.close();
	},
	launchSuccess:function(){},
	launchFail:function(){},
});
