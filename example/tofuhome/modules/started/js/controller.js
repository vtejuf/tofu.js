Tofu.ready('started',function(){
    this.container.style.display = 'none';
    this.container.innerHTML = this.template;
    $(this.container).fadeIn()
});