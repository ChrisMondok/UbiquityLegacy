enyo.kind({
	name: "Ubiquity.transitions.Flip",
	kind: enyo.transitions.Simple,
	duration: 1000,
	begin: function()
	{
		var axis = "0,1,0";
		var from = this.pane.transitioneeForView(this.fromView);
		if (from && from.hasNode())
		{
			var style0 = from.node.style;
			style0.webkitTransform = "rotate3d("+axis+",0deg)";
			style0.display = "";
		}
		var to = this.pane.transitioneeForView(this.toView);
		if (to && to.hasNode())
		{
			var style1 = to.node.style;
			style1.webkitTransform = "rotate3d("+axis+",-180)";
			style1.display = "";
		}

		if (style0 && style1)
		{
			var scaleDifference = to.children[0].getBounds().height / from.children[0].getBounds().height;
			style1.display = "none";
			this.flip(this.duration, style0, style1, axis, scaleDifference);
		}
		else
		{
			this.done();
		}
	},
	flip: function(inDuration, inStyle0, inStyle1, axis, scaleDifference)
	{
		var t0 = -1;
		var oldEased = 0;
		var fn = function()
		{
			if (t0 == -1)
			{
				t0 = new Date().getTime();
			}
			var eased = enyo.easedLerp(t0, inDuration, enyo.easing.cubicOut);
			var scale;
			if(eased > 0.5)
			{
				inStyle0.display = "none";
				inStyle1.display = "";
				scale = (1/scaleDifference) * (1-eased) + eased;
				inStyle1.webkitTransform = "rotate3d("+axis+","+180*(eased-1)+"deg) scale(1,"+scale+")";
			}
			else
			{
				inStyle0.display = "";
				inStyle1.display = "none";
				scale = scaleDifference * (eased) + (1-eased);
				inStyle0.webkitTransform = "rotate3d("+axis+","+180*eased+"deg) scale(1,"+scale+")";
			}
			if (eased < 1)
			{
				this.handle = setTimeout(fn.bind(this), 1);
			}
			else
			{
				if (inStyle0)
				{
					inStyle0.display = "none";
				}
				this.done();
			}
		};
		this.handle = setTimeout(fn.bind(this),10);
	},
	done: function()
	{
		clearTimeout(this.handle);
		var c = this.pane.transitioneeForView(this.toView);
		if (c && c.hasNode())
		{
			c.node.style.webkitTransform = null;
		}
		this.inherited(arguments);
	}
});
