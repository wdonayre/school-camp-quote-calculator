/*
    Author: William Donayre Jr.
    Github: https://github.com/wdonayre
    E-Mail: wdonayredroid@gmail.com
    Date: 08/11/2017
*/
var SCC_Calculator = /** @class */ (function () {
    function SCC_Calculator(_mainWrapper) {
        this._mainWrapper = _mainWrapper;
        this._fieldsArray = [];
        this._total = 0.00;
        this._endpoint = '';
        $ = jQuery;
        this._fields = {};
        this._formSteps = [{}];
        this._breakdown = [];
        this._totalDetails = {
            adults: 0,
            child: 0
        };
    }
    SCC_Calculator.prototype.registerEndpointURL = function (url) {
        this._endpoint = url;
    };
    SCC_Calculator.prototype.registerPriceList = function (pl) {
        this._priceList = {};
        this._priceList['mealArray'] = pl;
        for (var key in pl) {
            this._priceList[key] = {};
            if (key === 'accommodation') {
                this._priceList[key] = pl[key];
            }
            else {
                if (pl.hasOwnProperty(key)) {
                    for (var i = 0; i < pl[key].length; i++) {
                        this._priceList[key][pl[key][i]['name']] = pl[key][i];
                        this._priceList[key][pl[key][i]['name']]['index'] = i;
                    }
                }
            }
        }
        console.log(this._priceList);
    };
    SCC_Calculator.prototype.registerFieldArray = function (data) {
        this._fieldsArray.push(data);
    };
    SCC_Calculator.prototype.initializeHeight = function () {
        var windowHeight = $(window).outerHeight();
        $(this._mainWrapper).find('.scc-modal-inner').each(function (index, element) {
            var tmpHeight = $(element).outerHeight();
            $(element).addClass('tmpShow'); //add this class to be able to measure the height
            if ((windowHeight - 80) < $(element).outerHeight()) {
                var newHeight = windowHeight - $(element).find('.scc-modal-header').outerHeight() - $(element).find('.scc-modal-footer').outerHeight() - 80 /* margin top and bottom */;
                $(element).addClass('scc-modal-content-scroll').find('.scc-modal-body').height(newHeight);
            }
            $(element).removeClass('tmpShow'); //remove class to be able to back to initial setup
        });
    };
    SCC_Calculator.prototype.init = function () {
        var obj = this;
        var innerHeight = 0;
        var tallestView = null;
        //let windowHeight:number = $(window).outerHeight();
        /*-------------------------------
          Initialize height and position
        --------------------------------*/
        this.initializeHeight();
        //Initialize button click events || NEXT ||
        $(this._mainWrapper).find('.scc-modal-content .scc-modal-inner').each(function (index, element) {
            // Init Next Button
            $(element).find('.scc-next').on('click', function (e) {
                e.preventDefault();
                //e.preventPropagation();
                //refresh activities fields
                if ($(this).closest('.scc-modal-inner').attr('data-breakdown') === 'activities') {
                    obj._fields.activities = [];
                }
                var valid = obj.validateFields($(element).closest('.scc-modal-inner').find('.form-group input'));
                if (valid && ($(element).closest('.scc-modal-inner').attr('data-view') !== 'breakdown')) {
                    $(element).closest('.scc-modal-inner').hide().removeClass('active');
                    $($(element).closest('.scc-modal-inner').parent().find('.scc-modal-inner')[index + 1]).fadeIn().addClass('active');
                    //process breakdown
                    obj.updateBreakdown($(element).closest('.scc-modal-inner'));
                    //check if current view is now activities
                    if ($($(element).closest('.scc-modal-inner').parent().find('.scc-modal-inner')[index + 1]).attr('data-breakdown') === 'activities') {
                        var activitiesArray = '';
                        for (var activityKey in obj._priceList['activities']) {
                            //console.log(activityKey);
                            if (typeof activityKey !== 'undefined') {
                                var tmpActivity = obj._priceList['activities'][activityKey];
                                var ageGroup = {
                                    'junior': {
                                        min: 3,
                                        max: 7
                                    },
                                    'middle-school': {
                                        min: 8,
                                        max: 9
                                    },
                                    'adults': {
                                        min: 10,
                                        max: 999
                                    }
                                };
                                var allowed = false;
                                var currentAgeGroup = ageGroup[obj._fields.ageGroup];
                                if (tmpActivity.ageGroup.min == null && tmpActivity.ageGroup.max == null) {
                                    allowed = true;
                                }
                                else if (tmpActivity.ageGroup.min == null && (tmpActivity.ageGroup.max >= currentAgeGroup.max)) {
                                    allowed = true;
                                }
                                else if (((tmpActivity.ageGroup.min <= currentAgeGroup.min)) && tmpActivity.ageGroup.max == null) {
                                    allowed = true;
                                }
                                else if (tmpActivity.ageGroup.min <= currentAgeGroup.min && tmpActivity.ageGroup.max >= currentAgeGroup.max) {
                                    allowed = true;
                                }
                                var tmpPrice = (typeof tmpActivity.price.default === 'undefined') ? tmpActivity.price.adults : tmpActivity.price.default;
                                if (allowed) {
                                    activitiesArray += '<div class="col-g-4">' +
                                        '<div class="activity-item form-group" style="background-image:url(' + tmpActivity.image + ')">' +
                                        '<label class="activity-item-title">' + tmpActivity.text + '</label>' +
                                        '<span class="activity-item-price">$ ' + tmpPrice + '</span>' +
                                        '<input class="disabled" type="hidden" name="activities" value="' + tmpActivity.name + '" />' +
                                        '</div>' +
                                        '</div>';
                                }
                            }
                        }
                        $($(element).closest('.scc-modal-inner').parent().find('.scc-modal-inner')[index + 1]).find('.activity-selector-wrapper').html(activitiesArray);
                        obj.initializeHeight();
                        obj.reinitializeActivities();
                    }
                    // else if($($(element).closest('.scc-modal-inner').parent().find('.scc-modal-inner')[index+1]).attr('data-view') === 'thankyou'){
                    //     obj.initializeHeight();
                    // }
                    $(element).closest('.scc-modal-content').find('.total-price').each(function (index, element) {
                        $(element).find('span').text('$' + obj.getTotal());
                    });
                    //this.getTotal()
                    obj.initializeHeight();
                }
                // {
                //     obj.submitFields();    
                // }
                console.log(obj._fields); //TEMPORARY
                this._total = obj.getTotal();
                console.log(this._total);
            });
            $(element).find('.scc-submit').on('click', function (e) {
                e.preventDefault();
                $(this).attr('disabled', 'disabled');
                obj.submitFields();
            });
            //Init Back Button || BACK ||
            $(element).find('.scc-back').on('click', function (e) {
                e.preventDefault();
                if (index > 0) {
                    $(element).closest('.scc-modal-inner').hide().removeClass('active');
                    $($(element).closest('.scc-modal-inner').parent().find('.scc-modal-inner')[index - 1]).fadeIn().addClass('active');
                }
            });
        });
    };
    /* ---------------------------------- */
    //COMPONENT CLICK EVENT :: Activities //
    /* ---------------------------------- */
    SCC_Calculator.prototype.reinitializeActivities = function () {
        var obj = this;
        $(this._mainWrapper).find('.activity-item').on('click', function (e) {
            e.preventDefault();
            $(this).toggleClass('selected');
            if ($(this).hasClass('selected')) {
                $(this).find('input').removeClass('disabled');
            }
            else {
                $(this).find('input').addClass('disabled');
            }
            if (typeof obj._breakdown['activities'].items !== 'undefined') {
                obj._breakdown['activities'].items = [];
                obj._fields.activities = [];
            }
            var valid = obj.validateFields($(this).closest('.scc-modal-inner').find('.form-group input'));
            if (valid) {
                obj.updateBreakdown($(this).closest('.scc-modal-inner'));
                $(this).closest('.scc-modal-wrapper').find('.total-price span').text('$' + obj.getTotal());
            }
        });
    };
    SCC_Calculator.prototype.updateBreakdown = function (wrapper) {
        var key = $(wrapper).attr('data-breakdown');
        if (key != undefined && key !== 'end-meal') {
            if (typeof this._breakdown[key] === 'undefined') {
                this._breakdown[key] = {};
            }
        }
        var arrival = new Date(this._fields['arrival-date'].split('/')[2], this._fields['arrival-date'].split('/')[1] - 1, this._fields['arrival-date'].split('/')[0]);
        var departure = new Date(this._fields['departure-date'].split('/')[2], this._fields['departure-date'].split('/')[1] - 1, this._fields['departure-date'].split('/')[0]);
        var diff = Math.ceil(Math.abs(departure.getTime() - arrival.getTime()) / (1000 * 3600 * 24)); //days/nights stay
        var numAdults = parseInt(this._fields['number-of-adults']);
        var numChild = parseInt(this._fields['number-of-child']);
        if (key === 'accommodation') {
            this._breakdown[key] =
                {
                    text: key,
                    items: [
                        {
                            text: 'Adults',
                            quantity: diff,
                            amount: this._priceList.accommodation.adults * diff * numAdults
                        },
                        {
                            text: 'Child',
                            quantity: diff,
                            amount: this._priceList.accommodation.others * diff * numChild
                        }
                    ]
                };
        }
        else if (key === 'end-meal') {
            var endMealIndex = this._priceList['meals'][this._fields['end-meal']].index;
            //console.log("Meal Index: " + endMealIndex);
            var mealKey = 'meals';
            var startMealIndex = this._priceList[mealKey][this._fields.meal].index;
            var mealCount = [];
            var mealItems = [];
            for (var d = 0; d <= diff; d++) {
                for (var m = startMealIndex; m < this._priceList['mealArray'][mealKey].length; m++) {
                    startMealIndex = 0; //back to first meal index
                    var endMealFlag = false;
                    if ((d == (diff)) && (m > endMealIndex)) {
                        endMealFlag = true;
                    }
                    if (endMealFlag == false) {
                        if (typeof mealItems[m] === 'undefined') {
                            mealItems[m] = { text: this._priceList['mealArray'][mealKey][m]['text'], items: [{ text: 'Adults', quantity: 0, amount: 0 }, { text: 'Child', quantity: 0, amount: 0 }] };
                        }
                        //Adults
                        mealItems[m]['items'][0]['quantity'] += 1;
                        mealItems[m]['items'][0]['text'] = 'Adults @ ' + numAdults + 'pax/' + mealItems[m]['items'][0]['quantity'] + 'meal(s)';
                        mealItems[m]['items'][0]['amount'] = mealItems[m]['items'][0]['quantity'] * numAdults * this._priceList[mealKey][this._priceList['mealArray']['meals'][m]['name']]['price']['adults'];
                        //Child
                        mealItems[m]['items'][1]['quantity'] += 1;
                        mealItems[m]['items'][1]['text'] = 'Child @ ' + numChild + 'pax/' + mealItems[m]['items'][1]['quantity'] + 'meal(s)';
                        mealItems[m]['items'][1]['amount'] = mealItems[m]['items'][1]['quantity'] * numChild * this._priceList[mealKey][this._priceList['mealArray']['meals'][m]['name']]['price']['others'];
                    }
                }
            }
            mealItems = this.arrayClean(undefined, mealItems);
            this._breakdown[mealKey] = {
                text: mealKey,
                items: mealItems
            };
        }
        else if (key === 'mealsxxxxxxx') {
            var startMealIndex = this._priceList[key][this._fields.meal].index;
            var mealCount = [];
            var mealItems = [];
            for (var d = 0; d < diff; d++) {
                for (var m = startMealIndex; m < this._priceList['mealArray']['meals'].length; m++) {
                    startMealIndex = 0; //back to first meal index
                    if (typeof mealItems[m] === 'undefined') {
                        mealItems[m] = { text: this._priceList['mealArray']['meals'][m]['text'], items: [{ text: 'Adults', quantity: 0, amount: 0 }, { text: 'Child', quantity: 0, amount: 0 }] };
                    }
                    //Adults
                    mealItems[m]['items'][0]['quantity'] += 1;
                    mealItems[m]['items'][0]['text'] = 'Adults @ ' + numAdults + 'pax/' + mealItems[m]['items'][0]['quantity'] + 'days';
                    mealItems[m]['items'][0]['amount'] = mealItems[m]['items'][0]['quantity'] * numAdults * this._priceList[key][this._priceList['mealArray']['meals'][m]['name']]['price']['adults'];
                    //Child
                    mealItems[m]['items'][1]['quantity'] += 1;
                    mealItems[m]['items'][1]['text'] = 'Child @ ' + numChild + 'pax/' + mealItems[m]['items'][1]['quantity'] + 'days';
                    mealItems[m]['items'][1]['amount'] = mealItems[m]['items'][1]['quantity'] * numChild * this._priceList[key][this._priceList['mealArray']['meals'][m]['name']]['price']['others'];
                }
                mealItems = this.arrayClean(undefined, mealItems);
            }
            this._breakdown[key] = {
                text: key,
                items: mealItems
            };
        }
        else if (key === 'activities') {
            var activityItems = [];
            for (var a = 0; a < this._fields.activities.length; a++) {
                var tmpPrice = (typeof this._priceList['activities'][this._fields.activities[a]]['price']['default'] === 'undefined') ?
                    this._priceList['activities'][this._fields.activities[a]]['price']['adults'] :
                    this._priceList['activities'][this._fields.activities[a]]['price']['default'];
                var totalPax = parseInt(this._fields['number-of-child']) /*)*/;
                activityItems[a] = { text: this._priceList['activities'][this._fields.activities[a]]['text'] /*+' @ '+totalPax+'pax'*/, amount: tmpPrice * totalPax, price: tmpPrice };
            }
            this._breakdown[key] = {
                text: key,
                items: activityItems
            };
        }
        console.log('breakdown:::');
        console.log(this._breakdown);
        this.getTotal();
        this.renderBreakdownView();
    };
    //utility functions
    /*======================================
    
    ======================================*/
    SCC_Calculator.prototype.arrayClean = function (deleteValue, data) {
        for (var i = 0; i < data.length; i++) {
            if (data[i] == deleteValue) {
                data.splice(i, 1);
                i--;
            }
        }
        return data;
    };
    SCC_Calculator.prototype.updateValues = function (field) {
        var key = field.getAttribute('name');
        //check if we registered this field name to be an array or not
        if (this._fieldsArray.indexOf(key) < 0) {
            this._fields[key] = field.value;
        }
        else {
            //make sure .push method for array will work, so we make sure the array is defined.
            if (typeof this._fields[key] === 'undefined') {
                this._fields[key] = [];
            }
            //dont add if the input box is disabled
            if (!($(field).hasClass('disabled'))) {
                this._fields[key].push(field.value);
            }
        }
        //if (!field.hasOwnProperty(key)) {
        // }
        //console.log(this._fields);
    };
    /*======================================
    
    ======================================*/
    SCC_Calculator.prototype.validateFields = function (fields) {
        var ret = true;
        var prevKey = '';
        var inGroupFlag;
        inGroupFlag = false;
        for (var _i = 0, fields_1 = fields; _i < fields_1.length; _i++) {
            var field = fields_1[_i];
            if ($(field).val().length < 1 && $(field).hasClass('req')) {
                if ($(field).closest('.form-group').find('label.overhead-error').length < 1) {
                    $(field).parent().addClass('form-group-error');
                    $(field).closest('.form-group').append('<label class="overhead-error">Required missing field</label>');
                }
                ret = false;
            }
            else {
                $(field).parent().removeClass('form-group-error');
                $(field).closest('.form-group').find('label.overhead-error').remove();
                //update field values
                if ($(fields).closest('.group-req').length > 0) {
                    //inGroupFlag = true;
                    if (!$(field).is(':checked')) {
                        //check if field is in a group to avoid true -> to -> false group answer
                        if (inGroupFlag == false) {
                            $(fields).closest('.group-req').addClass('group-error');
                            ret = false;
                            inGroupFlag = true;
                        }
                    }
                    else {
                        ret = true;
                        $(fields).closest('.group-req').removeClass('group-error');
                        inGroupFlag = true;
                    }
                }
                else {
                    inGroupFlag = false;
                }
            }
            //check email field type
            if (field.getAttribute('type') === 'email') {
                if (!(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(field.value))) {
                    if ($(field).closest('.form-group').find('label.overhead-error').length < 1) {
                        $(field).parent().addClass('form-group-error');
                        $(field).closest('.form-group').append('<label class="overhead-error">Invalid Email Address</label>');
                    }
                    ret = false;
                }
            }
            //if radio or checkbox
            var currentKey = field.getAttribute('name');
            if ((field.getAttribute('type') === 'radio')) {
                //
                var tmpField = $(field).closest('.scc-modal-inner').find('input[type="' + field.getAttribute('type') + '"]:checked');
                if ((prevKey !== currentKey) && (tmpField.length > 0)) {
                    this.updateValues(tmpField[0]);
                    prevKey = currentKey;
                }
            }
            else {
                this.updateValues(field);
            }
        }
        return ret;
    };
    /*------------------------
        Compute Total
    ------------------------*/
    SCC_Calculator.prototype.getTotal = function () {
        var ret = 0;
        this._totalDetails.adults = 0;
        this._totalDetails.child = 0;
        for (var key in this._breakdown) {
            if (key != undefined) {
                for (var i = 0; i < this._breakdown[key].items.length; i++) {
                    if (key === 'accommodation') {
                        ret += this._breakdown[key].items[i].amount;
                        if (this._breakdown[key].items[i].text === 'Adults') {
                            this._totalDetails.adults += this._breakdown[key].items[i].amount;
                        }
                        else if (this._breakdown[key].items[i].text === 'Child') {
                            this._totalDetails.child += this._breakdown[key].items[i].amount;
                        }
                    }
                    else if (key === 'meals') {
                        ret += this._breakdown[key].items[i].items[0].amount + this._breakdown[key].items[i].items[1].amount;
                        this._totalDetails.adults += this._breakdown[key].items[i].items[0].amount;
                        this._totalDetails.child += this._breakdown[key].items[i].items[1].amount;
                    }
                    else if (key === 'activities') {
                        ret += this._breakdown[key].items[i].amount;
                    }
                }
            }
        }
        if (this._fields['activities']) {
            for (var a = 0; a < this._fields.activities.length; a++) {
                var tmpPrice = (typeof this._priceList['activities'][this._fields.activities[a]]['price']['default'] === 'undefined') ?
                    this._priceList['activities'][this._fields.activities[a]]['price']['adults'] :
                    this._priceList['activities'][this._fields.activities[a]]['price']['default'];
                this._totalDetails.adults += this._fields['number-of-adults'] * tmpPrice;
                this._totalDetails.child += this._fields['number-of-child'] * tmpPrice;
            }
        }
        console.log('TOTAL DETAILS: ');
        console.log(this._totalDetails);
        this._total = ret;
        return parseFloat(ret + '').toFixed(2);
    };
    /*------------------------
        Render BreakDown
    ------------------------*/
    SCC_Calculator.prototype.renderBreakdownView = function () {
        var breakdownView = $(this._mainWrapper).find('.scc-modal-inner[data-view="breakdown"] .scc-modal-body .grid');
        this._breakdownSummary = {
            'activities': {},
            'meals': {},
            'accommodation': {}
        };
        //clear contents
        $(breakdownView).html('');
        //NAME
        $(breakdownView).append('<div class="col-50p m-b-10 info-wrapper"><div class="info-group"><label>Name</label><span>' + this._fields.name + '</span></div></div>');
        //EMAIL
        $(breakdownView).append('<div class="col-50p m-b-10 info-wrapper"><div class="info-group"><label>Email</label><span>' + this._fields.email + '</span></div></div>');
        //LABEL --> Breakdown
        $(breakdownView).append('<div class="col-100p m-b-10"><label>BREAKDOWN</label></div><br>');
        var tmpTables = '';
        //ACCOMMODATION
        ////tmpTables += '<table class="scc-table">'+'<thead>'+'<tr>'+'<th colspan="2">Accommodation</th>'+'</tr>'+'</thead>'+'<tbody>'+'<tr>'+'<td>'+this._breakdown['accommodation']['items'][0].text+'@'+this._fields['number-of-adults']+'pax/'+this._breakdown['accommodation']['items'][0].quantity+'days'+'</td>'+'<td class="text-right">$'+parseFloat(this._breakdown['accommodation']['items'][0].amount).toFixed(2)+'</td>'+'</tr>'+'<tr>'+'<td>'+this._breakdown['accommodation']['items'][1].text+'@'+this._fields['number-of-child']+'pax/'+this._breakdown['accommodation']['items'][1].quantity+'days'+'</td>'+'<td class="text-right">$'+parseFloat(this._breakdown['accommodation']['items'][1].amount).toFixed(2)+'</td>'+'</tr>'+'<tr><td colspan="2" class="subtotal">Subtotal: <span>$'+ parseFloat((this._breakdown['accommodation']['items'][0].amount + this._breakdown['accommodation']['items'][1].amount)+'').toFixed(2) +'</span></td></tr></tbody>'+'</table>';
        //Update breakdown summary
        this._breakdownSummary.accommodation = this._breakdown['accommodation']['items'];
        //MEALS
        var _tbl = '';
        if (typeof this._breakdown['meals'] === 'undefined') {
            this._breakdown['meals'] = { items: [] };
        }
        var mealAdultTotal = 0;
        var mealChildTotal = 0;
        var mealQtyAdults = 0;
        var mealQtyChild = 0;
        for (var m = 0; m < this._breakdown['meals'].items.length; m++) {
            //_tbl+='<tr><td colspan="2"><strong>'+this._breakdown['meals'].items[m]['text']+'</strong></td></tr>'
            //_tbl+='<tr><td>'+this._breakdown['meals'].items[m].items[0]['text']+'</td><td class="text-right">$'+parseFloat(this._breakdown['meals'].items[m].items[0]['amount']).toFixed(2)+'</td></tr>'
            //_tbl+='<tr><td>'+this._breakdown['meals'].items[m].items[1]['text']+'</td><td class="text-right">$'+parseFloat(this._breakdown['meals'].items[m].items[1]['amount']).toFixed(2)+'</td></tr>'
            mealAdultTotal += this._breakdown['meals'].items[m].items[0]['amount'];
            mealQtyAdults += this._breakdown['meals'].items[m].items[0].quantity;
            mealChildTotal += this._breakdown['meals'].items[m].items[1]['amount'];
            mealQtyChild += this._breakdown['meals'].items[m].items[1].quantity;
        }
        this._breakdownSummary.meals = {
            adults: { quantity: mealQtyAdults, amount: mealAdultTotal },
            child: { quantity: mealQtyChild, amount: mealChildTotal }
        };
        _tbl += '<tr><td>Adults @ ' + mealQtyAdults + ' meal(s)</td><td class="text-right">$' + parseFloat(mealAdultTotal + '').toFixed(2) + '</td></tr>';
        _tbl += '<tr><td>Child @ ' + mealQtyChild + ' meal(s)</td><td class="text-right">$' + parseFloat(mealChildTotal + '').toFixed(2) + '</td></tr>';
        _tbl += '<tr><td colspan="2" class="subtotal">Subtotal: <span>$' + parseFloat((mealAdultTotal + mealChildTotal) + '').toFixed(2) + '</span></td></tr>';
        ////tmpTables += '<table class="scc-table">'+'<thead>'+'<tr>'+'<th colspan="2">Meals</th>'+'</tr>'+'</thead>'+'<tbody>'+_tbl+'</tbody>'+'</table>';
        //ADULTS
        var pricePerAdults = parseFloat(this._breakdown['accommodation']['items'][0].amount) + parseFloat(mealAdultTotal + '');
        tmpTables += '<table class="scc-table">' +
            '<thead><th colspan="2">Adults</th></thead>' +
            '<tbody>' +
            '<tr>' +
            '<td>Accomodation x ' + this._breakdown['accommodation']['items'][0].quantity + ' day(s)</td>' +
            '<td>$' + parseFloat(this._breakdown['accommodation']['items'][0].amount).toFixed(2) + '</td>' +
            '</tr>' +
            '<tr>' +
            '<td>Meals x ' + mealQtyAdults + ' meal(s)</td>' +
            '<td>$' + parseFloat(mealAdultTotal + '').toFixed(2) + '</td>' +
            '</tr>' +
            '<tr><td><strong>Price per adult</strong></td> <td><strong>$' + parseFloat(pricePerAdults + '').toFixed(2) + '</strong></td></tr>';
        '</tbody>' +
            '</table>';
        //ACTIVITIES
        _tbl = '';
        if (typeof this._breakdown['activities'] === 'undefined') {
            this._breakdown['activities'] = { items: [] };
        }
        var activityTotalAmount = 0;
        this._breakdownSummary.activities = [];
        for (var m = 0; m < this._breakdown['activities'].items.length; m++) {
            _tbl += '<tr>' +
                '<td>' + this._breakdown['activities'].items[m]['text'] + '</td>' +
                '<td class="text-right">$' + parseFloat(this._breakdown['activities'].items[m]['amount']).toFixed(2) + '</td>' +
                '</tr>';
            this._breakdownSummary.activities.push({ activity: this._breakdown['activities'].items[m]['text'], amount: this._breakdown['activities'].items[m]['amount'], price: this._breakdown['activities'].items[m]['price'] });
            activityTotalAmount += this._breakdown['activities'].items[m]['price'];
        }
        _tbl += '<tr><td colspan="2" class="subtotal">Subtotal: <span>$' + parseFloat(activityTotalAmount + '').toFixed(2) + '</span></td></tr>';
        ////tmpTables += '<table class="scc-table">'+'<thead>'+'<tr>'+'<th colspan="2">Activities</th>'+'</tr>'+'</thead>'+'<tbody>'+_tbl+'</tbody>'+'</table>';
        ////console.log("BREAKDOWN");
        ////console.log(this._breakdown);
        //console.log(this._breakdownSummary);
        //CHILDREN
        var pricePerChild = parseFloat(this._breakdown['accommodation']['items'][1].amount) + parseFloat(mealChildTotal + '') + parseFloat(activityTotalAmount + '');
        tmpTables += '<table class="scc-table">' +
            '<thead><th colspan="2">Children</th></thead>' +
            '<tbody>' +
            '<tr>' +
            '<td>Accomodation x ' + this._breakdown['accommodation']['items'][1].quantity + ' day(s)</td>' +
            '<td>$' + parseFloat(this._breakdown['accommodation']['items'][1].amount).toFixed(2) + '</td>' +
            '</tr>' +
            '<tr>' +
            '<td>Meals x ' + mealQtyChild + ' meal(s)</td>' +
            '<td>$' + parseFloat(mealChildTotal + '').toFixed(2) + '</td>' +
            '</tr>' +
            '<tr>' +
            '<td>Activities</td>' +
            '<td>$' + parseFloat(activityTotalAmount + '').toFixed(2) + '</td>' +
            '</tr>' +
            '<tr><td><strong>Price Per Child</strong></td> <td><strong>$' + parseFloat(pricePerChild + '').toFixed(2) + '</strong></td></tr>';
        '</tbody>' +
            '</table>';
        $(breakdownView).append('<div class="col-100p">' + tmpTables + '</div>');
        //$(breakdownView).append('<div class="main-price-total">ADULTS TOTAL: <span style="color:#343434;">$'+parseFloat(this._totalDetails.adults+'').toFixed(2)+'</span> <br> CHILDREN TOTAL: <span style="color:#343434;">$'+parseFloat(this._totalDetails.child+'').toFixed(2)+'</span> <br> <strong>TOTAL CAMP PRICE:</strong> <span>$'+parseFloat(this._total+'').toFixed(2)+'</span></div><br>')
        var TotalAdult = (pricePerAdults * parseInt(this._fields['number-of-adults']));
        var TotalChild = (pricePerChild * parseInt(this._fields['number-of-child']));
        $(breakdownView).append('<table>' +
            '   <tbody>' +
            '       <tr>' +
            '           <td></td>' +
            '           <td></td>' +
            '           <td>Pax</td>' +
            '           <td></td>' +
            '       </tr>' +
            '       <tr>' +
            '           <th>Adults Total</th>' +
            '           <td>' + pricePerAdults + '</td>' +
            '           <td>' + parseInt(this._fields['number-of-adults']) + '</td>' +
            '           <td>$' + TotalAdult + '</td>' +
            '       </tr>' +
            '       <tr>' +
            '           <th>Children Total</th>' +
            '           <td>' + pricePerChild + '</td>' +
            '           <td>' + parseInt(this._fields['number-of-child']) + '</td>' +
            '           <td>$' + TotalChild + '</td>' +
            '       </tr>' +
            '       <tr>' +
            '           <th>TOTAL CAMP PRICE</th>' +
            '           <td></td>' +
            '           <td></td>' +
            '           <td>$' + (TotalAdult + TotalChild) + '</td>' +
            '       </tr>' +
            '   </tbody>' +
            '</table>');
    };
    /*------------------------
        Submit Fields
    ------------------------*/
    SCC_Calculator.prototype.submitFields = function () {
        var tmpData = {
            info: this._fields,
            items: this._breakdownSummary
        };
        $.ajax({
            url: this._endpoint,
            type: "post",
            data: tmpData,
            complete: function () {
                $('.scc-modal-wrapper .scc-modal-inner').hide();
                $('.scc-modal-wrapper .scc-modal-inner[data-view="thankyou"]').fadeIn();
            }
        });
    };
    return SCC_Calculator;
}());
jQuery(document).ready(function ($) {
    //temporary
    var priceList = {
        accommodation: {
            adults: 22.00,
            others: 22.00
        },
        meals: [
            {
                text: 'Breakfast',
                name: 'breakfast',
                price: {
                    adults: 17.25,
                    others: 14.50
                }
            },
            // {
            //     text:'A/Tea',
            //     name:'atea',
            //     price:{
            //         adults:3.50,
            //         others:3.50
            //     }
            // },
            {
                text: 'Lunch',
                name: 'lunch',
                price: {
                    adults: 17.25,
                    others: 14.50
                }
            },
            // {
            //     text:'Snacks',
            //     name:'snacks',
            //     price:{
            //         adults:3.50,
            //         others:3.50
            //     }
            // },
            {
                text: 'Dinner',
                name: 'dinner',
                price: {
                    adults: 17.25,
                    others: 14.50
                }
            },
        ],
        activities: [
            {
                text: 'Camp Out & Cook Out',
                name: 'camp-out-cook-out',
                category: 'leadership',
                image: 'http://koojarewon.stagingbox.xyz/wp-content/uploads/2017/12/camp-out.jpg',
                ageGroup: {
                    min: 5,
                    max: null
                },
                price: {
                    default: 55
                },
            },
            {
                text: 'Trust Initiatives',
                name: 'trust-initiatives',
                category: 'leadership',
                image: 'http://koojarewon.stagingbox.xyz/wp-content/uploads/2017/12/blank_image.jpg',
                ageGroup: {
                    min: 6,
                    max: null
                },
                price: {
                    default: 16
                }
            },
            {
                text: 'Hoop Pine Climb',
                name: 'hoop-pint-climb',
                category: 'high-adventure',
                image: 'http://koojarewon.stagingbox.xyz/wp-content/uploads/2017/12/hoop-pine-climb.jpg',
                ageGroup: {
                    min: 6,
                    max: null
                },
                price: {
                    default: 35
                }
            },
            {
                text: 'Survivor!!!',
                name: 'survivor',
                image: 'http://koojarewon.stagingbox.xyz/wp-content/uploads/2017/12/survivor.jpg',
                category: 'ground-adventure',
                ageGroup: {
                    min: 5,
                    max: null
                },
                price: {
                    default: 16
                }
            },
            {
                text: 'The Great Escape',
                name: 'the-great-escape',
                category: 'ground-adventure',
                image: 'http://koojarewon.stagingbox.xyz/wp-content/uploads/2017/12/The-Great-Escape.jpg',
                ageGroup: {
                    min: 4,
                    max: null
                },
                price: {
                    default: 18
                }
            },
            {
                text: 'The Island',
                name: 'the-island',
                category: 'ground-adventure',
                image: 'http://koojarewon.stagingbox.xyz/wp-content/uploads/2017/12/The-Island.jpg',
                ageGroup: {
                    min: 3,
                    max: 9
                },
                price: {
                    default: 16
                }
            },
            {
                text: 'Jungle Fever',
                name: 'jungle-fever',
                category: 'ground-adventure',
                image: 'http://koojarewon.stagingbox.xyz/wp-content/uploads/2017/12/Jungle-Fever.jpg',
                ageGroup: {
                    min: null,
                    max: 6
                },
                price: {
                    default: 16
                }
            },
            {
                text: 'Team Challenge',
                name: 'team-challenge',
                category: 'team-initiative-activities',
                image: 'http://koojarewon.stagingbox.xyz/wp-content/uploads/2017/12/blank_image.jpg',
                ageGroup: {
                    min: null,
                    max: null
                },
                price: {
                    default: 16
                }
            },
            {
                text: 'Team Building',
                name: 'team-building',
                image: 'http://koojarewon.stagingbox.xyz/wp-content/uploads/2017/12/blank_image.jpg',
                category: 'team-initiative-activities',
                ageGroup: {
                    min: null,
                    max: null
                },
                price: {
                    default: 16
                }
            },
            {
                text: 'Wilderness Skills',
                name: 'wilderness-skills',
                image: 'http://koojarewon.stagingbox.xyz/wp-content/uploads/2017/12/blank_image.jpg',
                category: 'team-initiative-activities',
                ageGroup: {
                    min: 5,
                    max: null
                },
                price: {
                    default: 16
                }
            },
            {
                text: 'Scavenger Hunt',
                name: 'scavenger-hunt',
                category: 'exploration',
                image: 'http://koojarewon.stagingbox.xyz/wp-content/uploads/2017/12/Scavenger-Hunt.jpg',
                ageGroup: {
                    min: 3,
                    max: 7
                },
                price: {
                    default: 13
                }
            },
            {
                text: 'Nature Walk',
                name: 'nature-walk',
                category: 'exploration',
                image: 'http://koojarewon.stagingbox.xyz/wp-content/uploads/2017/12/Nature-Walk.jpg',
                ageGroup: {
                    min: null,
                    max: null
                },
                price: {
                    default: 13
                }
            }
        ]
    };
    var questions = {
        meals: {
            headline: null,
            subheadline: null,
            question: 'Please choose your first meal',
            priceList: priceList.meals
        },
        ageGroup: {
            headline: null,
            subheadline: null,
            question: 'Choice of age groups',
        },
        activities: {
            headline: null,
            subheadline: null,
            question: 'Select activities',
            priceList: priceList.activities
        }
    };
    var scc = new SCC_Calculator($('.scc-modal-wrapper'));
    scc.registerFieldArray('activities'); //register field activities to support multiple answers
    scc.registerPriceList(priceList);
    scc.registerEndpointURL('/scc/v1');
    scc.init();
    // $('.scc-modal-wrapper .scc-modal-inner').each(function(index,element){
    // };
    var dateToday = new Date();
    $("input.scc-date").datepicker({
        inline: true,
        minDate: dateToday,
        dateFormat: 'dd/mm/yy'
    });
    $("button.scc-modal-trigger").on('click', function (e) {
        e.preventDefault();
        $(this).next().fadeIn();
        scc.initializeHeight();
        $('body').addClass('scc-modal-fixed');
    });
    $('.scc-modal-close').on('click', function (e) {
        e.preventDefault();
        $(this).closest('.scc-modal-wrapper').fadeOut();
        $('body').removeClass('scc-modal-fixed');
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NjLXNjcmlwdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInNjYy1zY3JpcHQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7O0VBS0U7QUFNRjtJQVdJLHdCQUFvQixZQUFnQjtRQUFoQixpQkFBWSxHQUFaLFlBQVksQ0FBSTtRQVI1QixpQkFBWSxHQUFhLEVBQUUsQ0FBQztRQUc1QixXQUFNLEdBQVUsSUFBSSxDQUFDO1FBQ3JCLGNBQVMsR0FBRyxFQUFFLENBQUM7UUFLbkIsQ0FBQyxHQUFDLE1BQU0sQ0FBQztRQUVULElBQUksQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO1FBQ2xCLElBQUksQ0FBQyxVQUFVLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUN2QixJQUFJLENBQUMsVUFBVSxHQUFHLEVBQUUsQ0FBQztRQUVyQixJQUFJLENBQUMsYUFBYSxHQUFHO1lBQ2pCLE1BQU0sRUFBQyxDQUFDO1lBQ1IsS0FBSyxFQUFDLENBQUM7U0FDVixDQUFDO0lBQ04sQ0FBQztJQUNNLDRDQUFtQixHQUExQixVQUEyQixHQUFVO1FBQ2pDLElBQUksQ0FBQyxTQUFTLEdBQUcsR0FBRyxDQUFDO0lBQ3pCLENBQUM7SUFFTSwwQ0FBaUIsR0FBeEIsVUFBeUIsRUFBRTtRQUN2QixJQUFJLENBQUMsVUFBVSxHQUFHLEVBQUUsQ0FBQztRQUNyQixJQUFJLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUVsQyxHQUFHLENBQUEsQ0FBQyxJQUFJLEdBQUcsSUFBSSxFQUFFLENBQUMsQ0FBQSxDQUFDO1lBRWYsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUM7WUFFMUIsRUFBRSxDQUFBLENBQUMsR0FBRyxLQUFLLGVBQWUsQ0FBQyxDQUMzQixDQUFDO2dCQUNHLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ25DLENB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RSxDQUFBLENBQUMsV0FBVyxJQUFJLEtBQUssQ0FBQyxDQUFBLENBQUM7d0JBQ3JCLEVBQUUsQ0FBQSxDQUFDLE9BQU8sU0FBUyxDQUFDLENBQUMsQ0FBQyxLQUFLLFdBQVcsQ0FBQyxDQUFBLENBQUM7NEJBQ3BDLFNBQVMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFDLElBQUksRUFBQyxJQUFJLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxFQUFDLEtBQUssRUFBQyxDQUFHLEVBQUMsSUFBSSxFQUFDLFFBQVEsRUFBQyxRQUFRLEVBQUMsQ0FBQyxFQUFDLE1BQU0sRUFBQyxDQUFDLEVBQUMsRUFBRSxFQUFDLElBQUksRUFBQyxPQUFPLEVBQUMsUUFBUSxFQUFDLENBQUMsRUFBQyxNQUFNLEVBQUMsQ0FBQyxFQUFDLENBQUcsRUFBQyxDQUFDO3dCQUMvSixDQUFDO3dCQUNELFFBQVE7d0JBQ1IsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQzt3QkFDMUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxHQUFHLFdBQVcsR0FBQyxTQUFTLEdBQUcsTUFBTSxHQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsR0FBQyxTQUFTLENBQUM7d0JBQ2xILFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLEdBQUcsU0FBUyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxD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QyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBQzFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsR0FBRyxXQUFXLEdBQUMsU0FBUyxHQUFHLE1BQU0sR0FBRSxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLEdBQUMsTUFBTSxDQUFDO29CQUMvRyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxHQUFHLFNBQVMsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQztvQkFDbEwsT0FBTztvQkFDUCxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUMxQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLEdBQUcsVUFBVSxHQUFDLFFBQVEsR0FBRyxNQUFNLEdBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxHQUFDLE1BQU0sQ0FBQztvQkFDN0csU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFB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