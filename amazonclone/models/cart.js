//gets oldCart and start from 0
module.exports = function Cart(oldCart) {
    this.items = oldCart.items || {};
    this.totalQty = oldCart.totalQty || 0;
    this.totalPrice = oldCart.totalPrice || 0;

//add new item to Cart
    this.add = function(item, id) {
        var storedItem = this.items[id]; //access exiting item, if present
        if (!storedItem) {
            storedItem = this.items[id] = {item: item, qty: 0, price: 0}; // add item if item id is not found
        }
        storedItem.qty++;
        storedItem.price = storedItem.item.price * storedItem.qty;
        this.totalQty++;
        this.totalPrice += storedItem.item.price;
    };

//remove item in Cart
    this.reduceByOne = function(id) {
        this.items[id].qty--;
        this.items[id].price -= this.items[id].item.price;
        this.totalQty--;
        this.totalPrice -= this.items[id].item.price;

//deleting items that have been reduced to 0
        if (this.items[id].qty <= 0){
          delete this.items[id];
        }
    };

//deleting items that have been removed all
    this.removeItem = function(id) {
      this.totalQty -= this.items[id].qty; //remove all qty of item
      this.totalPrice -= this.items[id].price;
      delete this.items[id];
    }

//put item objects in an array
    this.generateArray = function() {
        var arr = [];
        for (var id in this.items) {
            arr.push(this.items[id]);
        }
        return arr;
    };
};
