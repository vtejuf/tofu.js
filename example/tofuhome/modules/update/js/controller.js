Tofu.ready('update',['/modules/update/css/style.css'],function(){
    this.container.style.display = 'none';
    this.container.innerHTML = this.template;
    $(this.container).fadeIn()
});