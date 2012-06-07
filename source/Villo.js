enyo.kind({
	name:"Ubiquity.Villo",
	kind:"VFlexBox",
	style:"background-color:#D8D8D8",
	events:{
		onLoginSuccess:"",
		onLoginFailure:""
	},
	components:[
		{kind:enyo.Pane, components:[
			{name:"Login", kind:"Ubiquity.VilloLogin",onLoginSuccess:"doLoginSuccess"},
		]},
	],
	create:function()
	{
		this.inherited(arguments);
		this.initVillo();
	},
	initVillo:function()
	{
		var appInfo = enyo.fetchAppInfo();
		villo.load({id:appInfo.id,version:appInfo.version,developer:appInfo.vendor,type:"mobile",title:appInfo.title,push:true});
	},
});
enyo.kind({
	name:"Ubiquity.VilloLogin",
	kind:enyo.Control,
	style:"max-width:480px; margin-left:auto; margin-right:auto;",
	events:{
		onLoginSuccess:"",
		onLoginFailure:"",
	},
	components:[
		{name:"pane", kind:enyo.Pane,transitionKind:"Ubiquity.transitions.Flip", components:[
			{name:"login", kind:enyo.VFlexBox, components:[
				{kind:enyo.RowGroup, caption:$L("Log in to Villo"), className:"villoBackground", components:[
					{name:"username", kind:enyo.Input, hint:$L("Username")},
					{name:"password", kind:enyo.PasswordInput, hint:$L("Password")},
					{components:[
						{kind:enyo.Button, caption:$L("Log in"), onclick:"login", className:"enyo-button-dark"},
						{kind:enyo.Button, caption:$L("Register"), onclick:"showRegistration"},
					]},
				]},
			]},
			{name:"register", kind:enyo.VFlexBox,components:[
				{kind:enyo.RowGroup, caption:$L("Register with Villo"),className:"villoBackground", components:[
					{name:"rUsername", kind:enyo.Input, hint:$L("Username"), onchange:"checkValid"},
					{name:"rPassword", kind:enyo.PasswordInput, hint:$L("Password"), onchange:"checkValid"},
					{name:"rConfirm", kind:enyo.PasswordInput, hint:$L("Confirm password"), onchange:"checkValid"},
					{name:"rEmail", kind:enyo.Input, hint:$L("Email address"), onchange:"checkValid"},
					{components:[
						{name:"doRegisterButton",disabled:true, kind:enyo.Button, caption:$L("Register"), onclick:"register", className:"enyo-button-affirmative"},
						{kind:enyo.Button, caption:$L("I have an account"), onclick:"showLogin"},
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
		villo.user.login({username:this.$.username.getValue(),password:this.$.password.getValue()},this.loginCallback.bind(this));
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
			callback:this.registerCallback.bind(this),
		});
	},
	registerCallback:function(params)
	{
		if(params === true)
		{
			this.$.Login.showLogin();
			this.$.Login.$.username.setValue(this.$.Login.$.rUsername.getValue());
			this.$.Login.$.password.setValue(this.$.Login.$.rPassword.getValue());
		}
		else
		{
			params = {user:{username:false,email:false}};
			if(params && params.user)
			{
				if(params.user.username === false)
					this.$.Login.$.rUsername.addClass("invalid");
				if(params.user.password === false)
					this.$.Login.$.rpassword.addClass("invalid");
				if(params.user.email === false)
					this.$.Login.$.rEmail.addClass("invalid");
				this.$.Login.showError("Try again","Registration error");
			}
			else
				this.$.Login.showError("A generic error occurred","Registration error");
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
		villo.user.register({username:this.$.username.getValue(),password:this.$.password.getValue(),password_confirm:this.$.password.getValue(),email:this.$.email.getValue(),callback:this.loginCallback.bind(this)});
	},
	loginCallback:function(response)
	{
		THIS=this;
		if(response === true)
		{
			if(villo.user.isLoggedIn())
				this.doLoginSuccess()
		}
		else
			this.showError("Check username and password");
	},
	showError:function(message, title)
	{
		this.$.popup.caption = $L(title);
		this.$.popup.openAtCenter();
		this.$.text.setContent($L(message));
	},
	hidePopup:function()
	{
		this.$.popup.close();
	},
	launchSuccess:function(){},
	launchFail:function(){},
});
