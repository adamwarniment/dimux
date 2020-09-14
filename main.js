var items = document.querySelectorAll('.store-cell');
var i=1;
items.forEach( (item) => {
    if(i%4==2 || i%4==1) {
        item.style.display = 'none';
    }
    if(i%4==0){
        item.style.width = '700px';
    }
i++;
})