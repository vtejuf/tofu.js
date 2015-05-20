Tofu.ready('one',function(){
	this.container.innerHTML = this.template;

	window.addtwo.addEventListener('click',function(){
		var domtow = document.createElement('div');
		domtow.setAttribute('data-tofu-module','two');
		document.body.appendChild(domtow);
		Tofu('two');
	});
});