/**
 * $.czCombobox
 * @extends jquery.1.4.2
 * @fileOverview Replace a select drop down box with a stylable unordered list
 * @author Lancer
 * @email lancer.he@gmail.com
 * @site crackedzone.com
 * @version 1.3.1
 * @date 2012-07-10
 * Copyright (c) 2011-2012 Lancer
 * @example
 *    $("#country-list").czCombobox();
 */

(function($) {

    //Name Space
    var czUI = czUI || {}

    $.fn.czCombobox = function( options ){

        var PNAME   = 'czCombobox';
        var objData = $(this).data(PNAME);

        //get instance object
        if (typeof options == 'string' && options == 'instance') {
            return objData;
        }

        //Extend options
        var options = $.extend( {}, czUI.czCombobox.defaults, options || {} );

        //Autoinstantiating object for factory model
        return $(this).each(function (){
            var PCOUNT     = $(document).data( PNAME ) || 0;
            PCOUNT++;
            $(document).data( PNAME, PCOUNT );

            var czCombobox = new czUI.czCombobox( options, PCOUNT );
            czCombobox.$element = $(this);
            czCombobox._init();
            $(this).data( PNAME, czCombobox );
        });
    }

    czUI.czCombobox = function( options, index ) {
        this.currentIndex = -1;
        this.NAME         = 'czCombobox';
        this.VERSION      = '1.3';
        this.maxZindex    = this.NAME + '-max-zIndex';
        this.pluginId     = this.NAME + '-' + index;
        this.options      = options;
        this.keys         = [];
        this.prevKey      = false;
        this.focus        = false;  
    }

    czUI.czCombobox.defaults = {
        className    : '',
        zIndex       : 99,
        dropSpeed    : 0,            //set speed of combo box list
        listMargin   : 0,            //set list margin to select box
        maxHeight    : 200,          //set css max-height value of combo box list
        dropUp       : true,         //if true, the options list will be placed above text input
        hideSelected : false,        //if true, hide selected option in combo box list
        initCallback : null,         //Call back after initialization
        blurCallback : null,         //Call back when combo box blur
        focusCallback: null,         //Call back when combo box focus
        changeCallback: null,        //Call back when combo box has change
        showListCallback: null,      //Call back after combo box list show
        hideListCallback: null       //Call back after combo box list hide
    }

    czUI.czCombobox.prototype = {

        _init: function() {

            $(document).data(this.maxZindex) || $(document).data(this.maxZindex, this.options.zIndex);

            var self = this;

            //Create a wrap And Combobox List.
            this._create();

            //initialization combo list: set MaxHeight, And Set list up or down, run function on browser window resize
            this._initList();
            $(window).resize(function(){
                self._initList();
            });

            $(window).scroll(function(){
                self._initList();
            });

            //select default options.
            this._selectIndex(true);

            //bind events for new combo list.
            this._bindEvent();

        },

        debug : function( $message ) {

            if ( typeof $message == 'undefined') $message = this;

            if (window.console && window.console.log)
                window.console.log($message);
            else
                alert($message);

        },

        _create: function() {

            var self = this;

            this.$wrap = $('<div />').addClass("czCombobox");
            this.$input= $('<input type="text" />').addClass('combobox_txt').attr('readonly', true);
            this.$ul   = $('<ul />').addClass('combobox_list');
            this.$icon = $('<div />').addClass('combobox_icon');

            this.$wrap.attr('id', this.pluginId )
                        .addClass( this.options.className )
                            .css({
                                'position': 'relative',
                                'zIndex'  : this.options.zIndex
                                });
            this.$ul.css({
                'position': 'absolute'
            });

            //Set tabindex for new combox and remove selector tabindex.
            if (typeof this.$element.attr('tabindex') != 'underfine') {
                this.$input.attr( 'tabindex', this.$element.attr('tabindex') );
                this.$element.removeAttr('tabindex');
            } else {
                this.$input.attr( 'tabindex', 0 );
            }

            //build new list
            this.$wrap.insertAfter(this.$element);
            this.$input.prependTo(this.$wrap);
            this.$icon.prependTo(this.$wrap);
            this.$ul.appendTo(this.$wrap);

            var comboboxListHTML = '';

            if (this.$element.children('optgroup').length == 0) { //No options group in this selector
                this.$element.children().each(function(i){
                    comboboxListHTML += self._setOptionHTML( $(this), i );
                });
            } else { //have optgroup in this selector;
                var itemIndex = -1;

                this.$element.children().each(function(i){
                    ++itemIndex;
                    if ( $(this)[0].tagName.toUpperCase() == 'OPTION') {
                        comboboxListHTML += self._setOptionHTML( $(this), itemIndex );
                    } else {
                        comboboxListHTML += '<li class="optgroup">'+ $(this).attr('label') + '<ul>';

                        $(this).children().each(function(){
                            comboboxListHTML += self._setOptionHTML( $(this), itemIndex );
                        });
                        comboboxListHTML += '</ul></li>';
                    }
                });
            }

            //add new list items to ul
            this.$ul.show()
            this.$ul.html(comboboxListHTML);
            this.$li = this.$ul.find('li:not(.optgroup)');

            //Get heights of new elements for use later
            if ( this.$element.is(':visible') == false ) {
                var $temp = $("<div />").css({'position':'absolute', 'left':'-9999px'}).appendTo('body');
                this.$wrap.clone().appendTo($temp);
                this.ulHeight   = $temp.find('.combobox_list').height();
                this.wrapHeight = $temp.find('.czCombobox').height();
                $temp.remove();
            } else {
                this.ulHeight   = this.$ul.height();
                this.wrapHeight = this.$wrap.height();
            }
            this.liCounts   = this.$li.length;
            this.$element.hide();

        },

        _initList: function (){
            var containerPosY = this.$wrap.offset().top;
            var docHeight = $(window).height();
            var scrollTop = $(window).scrollTop();

            //if height of list is greater then max height, set list height to max height value
            if (this.ulHeight > parseInt(this.options.maxHeight)) {
                this.ulHeight = parseInt(this.options.maxHeight);
                this.$ul.css('overflow', 'auto');
            }

            this.onTop = false;
            this.$ul.css({top: this.wrapHeight+this.options.listMargin+'px', height: this.ulHeight});

            if (this.options.dropUp != false) {
                containerPosY = containerPosY - scrollTop - this.options.listMargin;
                if (containerPosY + this.ulHeight >= docHeight && containerPosY > this.ulHeight) {
                    this.onTop = true;
                    this.$ul.css({top: '-'+(this.ulHeight+this.options.listMargin)+'px', height: this.ulHeight});
                }
            }
        },

        _bindEvent: function () {
            var self = this;
            this.$li.bind({
                'mouseenter': function (e){
                    if (e.target.nodeName == 'LI')
                        var $li = $(e.target);
                    else
                        var $li = $(e.target).parentsUntil('ul');
                    $li.addClass('li_hover');
                },
                'mouseleave': function (e){
                    if (e.target.nodeName == 'LI')
                        var $li = $(e.target);
                    else
                        var $li = $(e.target).parentsUntil('ul');
                    $li.removeClass('li_hover');
                }
            });

            this.$wrap.bind({
                'mouseenter': function() {self.$input.addClass('box_hover');},
                'mouseleave': function() {self.$input.removeClass('box_hover');},
                'click'     : function() {
                    self.$input.trigger('czfocus');
                    if (self.$ul.is( ':visible' )){
                        self.hideComboList();
                    } else {
                        self.showComboList();
                        self.$ul.scrollTop(self.liOffsetTop);
                    }
                }

            });

            this.$input.bind('czfocus', function() {
                if ( self.focus == true ) return ;
                self.focus = true;
                self.$input.addClass('box_focus');
                self.keyPress();
                self._callback('focus');
            }).bind('czblur', function() {
                if ( self.focus == false ) return ;
                self.focus = false;
                self.$input.removeClass('box_focus');
                self.$wrap.unbind('keydown');
                self.hideComboList();
                self._callback('blur');
            });

            $(document).bind("mousedown", function(e) {
                var hasInLi = self.$ul.has( $(e.target) ).attr('class');

                if ( typeof hasInLi != 'undefined' ) {
                    if (e.target.nodeName == 'LI')
                        var $li = $(e.target);
                    else
                        var $li = $(e.target).parentsUntil('ul');

                    self.currentIndex = self.$li.index( $li );
                    self._selectIndex();
                    self.hideComboList();
                    return;
                } else {
                    var hasIn   = self.$wrap.has( $(e.target) ).attr('id');
                    if ( typeof hasIn == 'undefined')
                        self.$input.trigger('czblur');
                }
            });
        },

        _setOptionHTML : function($option, itemIndex) {
            var option = $option.text();
            var optionHTML = '<li>' + option + '</li>';

            this.keys.push( option.charAt(0).toLowerCase() );

            if ( $option.attr('selected') != 'undefined' ){
                this.currentIndex = itemIndex;
                if ( this.options.hideSelected != false )
                    optionHTML = '<li style="display:none">' + option + '</li>';
            }
            return optionHTML;
        },

        _selectIndex: function( init ) {

            if (init == true)
                this.$ul.css('visibility', 'hidden');

            //get offsets
            var wrapOffsetTop = this.$wrap.offset().top + this.options.listMargin,
            liOffsetTop = this.$li.eq(this.currentIndex).offset().top,
            ulScrollTop = this.$ul.scrollTop();

            //get distance of current li from top of list
            if (this.onTop == true){
                //if list is above select box, add max height value
                this.liOffsetTop = (((liOffsetTop-wrapOffsetTop)-this.wrapHeight)+ulScrollTop)+parseInt(this.options.maxHeight);
            } else {
                this.liOffsetTop = ((liOffsetTop-wrapOffsetTop)-this.wrapHeight)+ulScrollTop;
            }

            //scroll list to focus on current item
            this.$ul.scrollTop(this.liOffsetTop);

            //check if hide selected option
            if ( this.options.hideSelected != false ) {
                this.$li.show().eq(this.currentIndex).hide();
            } else {
                this.$li.removeClass('li_selected')
                        .eq(this.currentIndex)
                        .addClass('li_selected');
            }

            var text = this.$li.eq(this.currentIndex).text();
            //page load
            if (init == true) {
                this.$input.val(text);
                this.$ul.css('visibility', '').hide();

                this._callback('init');
                return false;
            }

            if (this.$element[0].selectedIndex != this.currentIndex) {
                this.$element[0].selectedIndex = this.currentIndex;
                this.$input.val(text);
                this._callback('change');
            }
        },

        _getKey : function (current, start) {
            for (var i = (start || 0); i < this.keys.length; i++) {
                if (this.keys[i] == current) return i;
            }
            return -1;
        },

        _callback: function(evt) {
            if( typeof this.options[evt + 'Callback'] != 'function')
                return;

            this.options[evt + 'Callback'].call(this);
        },

        showComboList: function() {
            $(document).data(this.maxZindex, $(document).data(this.maxZindex) + 1);
            this.$wrap.css('zIndex', $(document).data(this.maxZindex) );
            this.$ul.slideDown(this.options.dropSpeed);
            this._callback('showList');
        },


        hideComboList: function() {
            this.$ul.hide();
            this._callback('hideList');
        },


        keyPress : function() {
            //when keys are pressed
            var self = this;

            this.$wrap.keydown(function(e){
                if (e == null) { //ie
                    var keycode = event.keyCode;
                } else { //everything else
                    var keycode = e.which;
                }

                switch(keycode) {
                    case 40: //down
                    case 39: //right
                        self.gotoNext();
                        return false;
                        break;
                    case 38: //up
                    case 37: //left
                        self.gotoPrev();
                        return false;
                        break;
                    case 33: //page up
                    case 36: //home
                        self.gotoFirst();
                        return false;
                        break;
                    case 34: //page down
                    case 35: //end
                        self.gotoLast();
                        return false;
                        break;
                    case 13:
                    case 27:
                        self.hideComboList();
                        return false;
                        break;
                }

                //check for keyboard shortcuts, just like a-z
                var keyPressed      = String.fromCharCode(keycode).toLowerCase();
                var currentKeyIndex = self._getKey(keyPressed);

                if ( currentKeyIndex != -1 ) { //if key code found in array
                    ++self.currentIndex;

                    //search array from current index
                    self.currentIndex = self._getKey(keyPressed, self.currentIndex);

                    //if no entry was found or new key pressed search from start of array
                    if (self.currentIndex == -1 || self.currentIndex == null || self.prevKey != keyPressed)
                        self.currentIndex = self._getKey(keyPressed);

                    self._selectIndex();
                    //store last key pressed
                    self.prevKey = keyPressed;
                    return false;
                }
            });
        },


        gotoNext: function(){
            if (this.currentIndex < (this.liCounts - 1)) {
                ++this.currentIndex;
                this._selectIndex();
            }
        },


        gotoPrev : function(){
            if (this.currentIndex > 0) {
                --this.currentIndex;
                this._selectIndex();
            }
        },

        gotoFirst : function(){
            this.currentIndex = 0;
            this._selectIndex();
        },


        gotoLast : function(){
            this.currentIndex = this.liCounts - 1;
            this._selectIndex();
        },


        getText : function() {
            return this.$li.eq(this.currentIndex).text();
        },


        getValue: function() {
            return this.$element.val();
        },


        setFocus: function() {
            return this.$input.trigger('czfocus');
        },

        reload: function() {
            this.currentIndex = 0;
            this._selectIndex(true);
        },
        
        rebuild:function() {
            this.$wrap.remove();
            this._init();
        },
        
        setOption: function(optionValue) {
            var self = this;

            if (typeof optionValue == 'undefined') {
                self.currentIndex = 0;
                self._selectIndex();
                return;
            }

            this.$element.find('option').each(function(i) {
                try {
                    if ( $(this).val() == optionValue ){
                        throw i;
                    }
                } catch (i) {
                    self.currentIndex = i;
                    self._selectIndex();
                    return;
                }
            });
        }
    }
})(jQuery);
