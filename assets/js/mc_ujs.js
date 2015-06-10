/* 
  mc_ujs.js 
  Jquery loaded in head
  This file is loaded at the bottom of the landing page
  Solution Javascript goes here
*/

$(function() {
	var MCProduct = {

		// List of product names
		loadList: [
	        "Slaughterhouse Crate",
	        "Everest Grill Crate",
	        "Exotic Meats Crate",
	        "Premium Jerky Ammo Can",
	        "Cow-pocalypse Crate",
	        "Outdoor Survival Crate",
	        "Exotic Meats Jerkygram",
	        "The Bacon Crate",
	        "Spicy Jerkygram",
	        "Bacon Jerkygram",
	        "Teriyaki Jerkygram",
	        "Hickory Grilling Crate",
	        "Outdoor Survival Ammo Can",
	        "Grill Master Crate"
	    ],

		// helper functions for template
		options: {
			// ignore cache and reload template
			overwriteCache: false,
			// callback function to call on complete. Always called regardless of success or failure.
			complete: null,
			// callback function to call on success.
			success: null,
			// callback function to call on error. defaults to outputting error to template container
			error: null,
			// error message for the default error callback
			errorMessage: "There was an error loading the template.",
			// flag to indicate whether arrays should be paged.
			paged: false,
			// page to display if data is being paged
			pageNo: 1,
			// number of elements per page if data is being paged
			elemPerPage: 10,
			// template to be appended to element rather than replacing content
			append: true,
			// template to be prepended to element rather than replacing content
			prepend: false,
			// callback to call before inserting template into document
			beforeInsert: null,
			// callback to call after inserting template into document
			afterInsert: null
		},

		getProducts: function(callback){

			// if products is empty, initialise
			if(this.isEmpty(LiveProducts.products)){
				// load products by name
				for(var i = 0; i < this.loadList.length; i++){
					// load xml products into json array
					LiveProducts.loadByName(this.loadList[i]);
					this.drawProduct(this.loadList[i]);
				}
			}
			callback();
		},

		drawProduct: function(product, callback){

			// append product template to CategoryProducts container
			$("#CategoryProducts").loadTemplate("templates/product.html", 
				LiveProducts.products[product], 
				this.options
			);
		},

		// clear products container ready for redraw
		clearProducts: function(){

			$("#CategoryProducts").html("");
		},

		sortAsc: function(a, b){

			// skip currency symbol
			var symbol = /[$£]/;
			if(symbol.test(a.price[0]))
				return parseFloat(a.price.slice(1,a.price.length)) - parseFloat(b.price.slice(1,b.price.length));
			else // no currency symbol
				return parseFloat(a.price) - parseFloat(b.price);
		},

		sortDesc: function(a, b){

			var symbol = /[$£]/;
			if(symbol.test(a.price[0]))
				// skip currency symbol
				return parseFloat(b.price.slice(1,b.price.length)) - parseFloat(a.price.slice(1,a.price.length));
			else // no currency symbol
				return parseFloat(b.price) - parseFloat(a.price);
		},

		sortByPrice: function(arr, func){

			arr.sort(func);
		},

		doSort: function(method){

			var products = LiveProducts.products;
			var productArray = [];
			for(var product in products){
				// skip products indexed by id
				if(Number.parseFloat(product)) continue;
				else productArray.push(products[product]);
			}
			if(method == "desc")
				this.sortByPrice(productArray, this.sortAsc);
			else
				this.sortByPrice(productArray, this.sortDesc);

			for(var i = 0; i < productArray.length; i++){
				this.drawProduct(productArray[i].name);
			}
		},

		// speed up calls
		hasOwnProperty: Object.prototype.hasOwnProperty,

		isEmpty: function(obj){

			// check null and undefined
			if(obj == null) return true;

			// check length
			if(obj.length > 0) return false;
			if(obj.length === 0) return true;

			// check own properties
			for(var key in obj){
				if(this.hasOwnProperty.call(obj, key)) return false;
			}

			return true;
		},

		getLength: function(obj){

    	return Object.keys(obj).length;
		},

		bindUIElements: function(){

			var obj = this;
			
			$("#sortFilter").on('change', function(e){
				obj.clearProducts(); // clear the container ready for redraw
				obj.doSort($(e.srcElement).val()); // pass selected method
			});
		},

		bindProductEffects: function(){
			$('.CategoryProduct').each(function(){
				var thisEl = $(this);
				var addToCart = thisEl.find('.ProductAddToCart');
					
				addToCart.click(function(){
					// add to cart functionality
				});
			});
		},

		init: function(){

			this.getProducts(this.bindProductEffects);
			this.bindUIElements();
		}
	};

	// add MCProduct.init() as LiveProducts callback
	LiveProducts.onLoad(function(){

		MCProduct.init();
	});
});
