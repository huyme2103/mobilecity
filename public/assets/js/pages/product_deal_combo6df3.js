// Tính tổng giá deal
function calculate_deal_price(){
    let div_main_price = $('.deal-box .deal-product-main .deal-product-price');
    let total_price = Number(div_main_price.attr('data-price'));
    let origin_price = total_price;
    // let total_old_price = Number(div_main_price.attr('data-old-price'));
    let checked_product = $('.deal-box .deal-product-extra .checkbox-choose-variant:checked');
    let extra_product_prices = checked_product.closest('.deal-product-extra').find('.deal-product-price');
    extra_product_prices.each(function(index, product_price){
        origin_price += Number($(product_price).attr('data-old-price'));
        total_price += Number($(product_price).attr('data-price'));
    });
    // Write price
    $('.deal-box #deal-origin-price').text(format_price(origin_price, true));
    $('.deal-box #deal-total-price').text(format_price(total_price, true));
    $('.deal-box #deal-sale-off-price').text(format_price(origin_price - total_price, true));
    //
    $('.deal-box .btn-buy').attr('disabled', checked_product.length == 0);
}

// thêm input hidden cho checkbox
function add_hidden_checkbox_select(checkbox){
    let name_checkbox = $(checkbox).attr('name');
    if($(checkbox).is(':checked')){
        $(checkbox).closest('.product-choose-variant').find(`input[type="hidden"][name="${name_checkbox}"]`).remove();
    }else{
        $(checkbox).closest('.product-choose-variant').append(`<input type="hidden" name="${name_checkbox}" value="0">`);
    }
}

// Khởi tạo
function init(){
    calculate_deal_price();
    // $('input[type="checkbox"].checkbox-choose-variant').iCheck({
    //     checkboxClass: 'icheckbox_flat-green',
    // });
    $('.deal-box .deal-product-extra .checkbox-choose-variant').each(function(index, checkbox){
        add_hidden_checkbox_select(checkbox);
    });
}

$(document).ready(function () {
    var variants = [];
    // Khởi tạo
    init();
    // Get current variant
    function get_current_variant(popup){
        let color_selected_id = popup.find('#select-color .selected').attr('data-id');
        let storage_selected_id = popup.find('#select-storage').val();
        let aspect_selected_id = popup.find('#select-aspect').val();
        let origin_selected_id = popup.find('#select-origin').val();

        if(!color_selected_id) color_selected_id = 0;
        if(!storage_selected_id) storage_selected_id = 0;
        if(!aspect_selected_id) aspect_selected_id = 0;
        if(!origin_selected_id) origin_selected_id = 0;

        let current_variant = variants.find(function(variant){
            if(variant.color == color_selected_id && variant.origin == origin_selected_id && variant.aspect == aspect_selected_id && variant.storage == storage_selected_id)
                return variant;
        });
        return current_variant;
    }
    // update Button Submit
    function updateButtonSubmit(popup){
        let btn_submit = popup.find('#btn-submit');
        if(typeof get_current_variant(popup) === 'undefined'){
            btn_submit.attr('disabled', true);
            btn_submit.text('Hết hàng');
        }else{
            btn_submit.attr('disabled', false);
            btn_submit.text('Xác nhận');
        }
    }

    // tính lại giá của deal khi chọn sản phẩm
    $('body').on('change', '.deal-box .checkbox-choose-variant', function(e){
        calculate_deal_price();
        add_hidden_checkbox_select($(this));
    });

    // Process popup-v2 show variant
    var variants = [];

    $('body').on('click', '.deal-box [data-toggle="popup"]', function(event){
        event.preventDefault();
        let _this = $(this);
        let popup = $(_this.data('target'));
        variants = [];
        deal_box = _this.closest('.deal-box');
        let phone_id = _this.data('phone_id');
        let location_id = deal_box.find('input[name="location_id"]').val();
        let deal_id = deal_box.find('input[name="deal_id"]').val();
        let btn_submit = popup.find('#btn-submit');
        btn_submit.attr('disabled', true);

        // Clear old data
        popup.find('#group-color, #group-storage, #group-aspect, #group-origin, #group-warranty').hide();
        let select_color = popup.find('#select-color');
        select_color.html('');
        let select_storage = popup.find('#select-storage');
        select_storage.empty();
        let select_origin = popup.find('#select-origin');
        select_origin.empty();
        let select_aspect = popup.find('#select-aspect');
        select_aspect.empty();
        let select_warranty = popup.find('#select-warranty');
        select_warranty.empty();
        // Get variant, attributes
        loadAjax('/ajax/get-phone-variants-by-deal', {
            'deal_id': deal_id, 'phone_id': phone_id, 'location_id': location_id
        },{
            beforeSend:function(){
                $("#loading_box").css({visibility:"visible", opacity: 0.0}).animate({opacity: 1.0},200);
            },
            success: function(result) {
                $("#loading_box").animate({opacity: 0.0}, 200, function(){
                    $("#loading_box").css("visibility","hidden");
                });

                if(!result.success){
                    alertMessage(result.message);
                    return;
                }
                // variant
                variants = result.data.variants;

                // get current variant
                let div_product_item = _this.closest('.deal-product-item');
                current_variant_id = div_product_item.find('input[name*="product_id"]').val() ?? 0;
                current_service_product_id = div_product_item.find('input[name*="service_product_id"]').val() ?? 0

                let current_variant = variants.find(function(variant){
                    if(variant.id == current_variant_id){
                        return variant;
                    }
                });

                if(typeof current_variant === 'undefined'){
                    current_variant = variants[0];
                }
                // attributes
                let attributes = result.data.attributes;
                let colors = attributes['color'];
                let origins = attributes['origin'];
                let aspects = attributes['aspect'];
                let storages = attributes['storage'];
                let warranties = attributes['warranty'];

                if(colors.length != 0){
                    $.each(colors, function(key, item){
                        select_color.append(`
                            <div class="color-item ${current_variant.color == item.id ? 'selected' : ''}" data-id = '${item.id}'
                                    style="background-color: ${item.detail}"></div>
                        `);
                    });
                    popup.find('#group-color').show();
                }
                if(storages.length != 0){
                    $.each(storages, function(key, item){
                        select_storage.append(`
                            <option value="${item.id}" ${current_variant.storage == item.id ? 'selected' : ''}>${item.value}</option>
                        `);
                    });
                    popup.find('#group-storage').show();
                }
                if(origins.length != 0){
                    $.each(origins, function(key, item){
                        select_origin.append(`
                            <option value="${item.id}" ${current_variant.origin == item.id ? 'selected' : ''}>${item.value}</option>
                        `);
                    });
                    popup.find('#group-origin').show();
                }
                if(aspects.length != 0){
                    $.each(aspects, function(key, item){
                        select_aspect.append(`
                            <option value="${item.id}" ${current_variant.aspect == item.id ? 'selected' : ''}>${item.value}</option>
                        `);
                    });
                    popup.find('#group-aspect').show();
                }
                if(warranties.length != 0){
                    select_warranty.append('<option data-price="0" value="0">Mặc định</option>');
                    $.each(warranties, function(key, item){
                        select_warranty.append(`
                            <option value="${item.soft_id}" data-price="${item.price}" ${current_service_product_id == item.soft_id ? 'selected' : '' }>
                                ${item.name}
                            </option>
                        `);
                    });
                    popup.find('#group-warranty').show();
                }

                // show popup
                popup.bPopup({
                    speed: 450,
                    transition: 'slideDown',
                    zIndex:99999,
                    onOpen: function() {
                        popup.css('visibility', "visible");
                    },
                    onClose: function() {
                        popup.css('visibility', "hidden");
                    }
                });
                btn_submit.attr('disabled', false);
            },
            error: function() {
                $("#loading_box").animate({opacity: 0.0}, 200, function(){
                    $("#loading_box").css("visibility","hidden");
                });
                alertMessage('Đã có lỗi xảy ra, vui lòng thử lại!');
            }
        });
    });

    $('body').on('click', '#popup-variant #btn-submit', function(){
        let popup = $('#popup-variant');
        let current_variant = get_current_variant(popup);
        if(typeof current_variant === 'undefined'){
            alertMessage('Sản phẩm đã hết hàng!');
            return;
        }

        let warranty_selected_id = popup.find('#select-warranty').val();
        let warranty_selected_name = popup.find('#select-warranty option:selected').text();
        let warranty_selected_price = Number(popup.find('#select-warranty option:selected').attr('data-price'));
        if(!warranty_selected_id) warranty_selected_id = 0;

        let div_product_item = $('.deal-box .deal-product-item').find(`.deal-choose-variant[data-phone_id="${current_variant.phone_id}"]`).closest('.deal-product-item');
        div_product_item.find('.product-current-variant').text(current_variant.variant_text);
        div_product_item.find('.product-current-warranty').text(warranty_selected_name);
        div_product_item.find('.deal-product-price').attr('data-price', current_variant.price + warranty_selected_price);
        div_product_item.find('.deal-product-price .deal-price').text(format_price(current_variant.price + warranty_selected_price));
        div_product_item.find('input[name*="product_id"]').val(current_variant.soft_id);
        div_product_item.find('input[name*="service_product_id"]').val(warranty_selected_id);

        calculate_deal_price();
    });

    // Event select variant
    $('body').on('click', '#popup-variant .color-item',function(e){
        let popup = $(this).closest('#popup-variant');
        updateButtonSubmit(popup);
    });

    $('body').on('change', '#popup-variant select',function(e){
        let popup = $(this).closest('#popup-variant');
        updateButtonSubmit(popup);
    });

    // Handle buy deal
    $('form#form-buy-deal').submit(function(e){
        if($(this).find('.deal-product-extra .checkbox-choose-variant:checked').length == 0){
            e.preventDefault();
            alertMessage('Bạn phải chọn ít nhất một sản phẩm kèm theo!');
        }else{
            $("#loading_box").css({visibility:"visible", opacity: 0.0}).animate({opacity: 1.0},200);
            $(this).find('[type="submit"]').attr('disabled', true);
        }
    });

    $('body').on('change', '.product-content-box .price_location select#location, .product-store-list select#location-message', function(){
        let deal_box = $('.deal-box');
        let combo_box = $('.combo-box');
        let location_id = $(this).val();

        try {
            if(deal_box.length){
                let deal_id = deal_box.find('input[name="deal_id"]').val();
                if(!deal_id) return;

                // let link_deal_read_more = deal_box.find('a.deal-read-more');
                // href_deal_read_more = link_deal_read_more.attr('href');
                // link_deal_read_more.attr('href', href_deal_read_more.split('?')[0] + '?setlocation=' + location_id);

                deal_box.find('input[name="location_id"]').val(location_id);
                let product_id = deal_box.find('input[name="main_product_id"]').val();
                let product_type = deal_box.find('input[name="main_product_type"]').val();
                let div_deal_product = deal_box.find('.deal-product');

                loadAjax(`/ajax/get-deal-products`,{
                    'location_id': location_id,
                    'product_id': product_id,
                    'deal_id': deal_id,
                    'product_type': product_type
                }, {
                    beforeSend: function(){
                        div_deal_product.html('<div id="loading_image" style="height:100px"></div>');
                        deal_box.find('.deal-box-price .price').text('');
                    },
                    success: function(result){
                        if(result.success){
                            div_deal_product.html(result.data);
                            init();
                            div_deal_product.find("img.lazy").lazyload({
                                effect : "fadeIn",
                                failure_limit: 10,
                            });
                            responsiveDeal();
                            deal_box.show();
                            $('.attribute-list.deal-combo-box').show();
                        }else{
                            alertMessage(result.message);
                            $('.attribute-list.deal-combo-box').hide();
                            deal_box.hide();
                            // deal_box.append(`
                            //     <input name="main_product_id" type="hidden" value="${product_id}">
                            //     <input name="main_product_type" type="hidden" value="${product_type}">`
                            // );
                        }
                    },
                    error: function(error){
                        alertMessage('Tải chương trình deal sốc đã xảy ra lỗi!');
                    }
                });
            }
            // if(combo_box.length){
            //     let link_combo_read_more = combo_box.find('a.combo-read-more');
            //     href_combo_read_more = link_combo_read_more.attr('href');
            //     link_combo_read_more.attr('href', href_combo_read_more.split('?')[0] + '?setlocation=' + location_id)
            // }
        } catch (error) {
            alertMessage('Tải chương trình deal sốc đã xảy ra lỗi!');
        }
    });
});

// Click chọn ảnh trong deal để chọn
$('body').on('click', '.deal-box .deal-product-extra .deal-product-image', function(){
    let div_extra_item = $(this).closest('.deal-product-extra');
    let selected_checkbox = div_extra_item.find('.checkbox-choose-variant');
    // .is(':checked');
    if(selected_checkbox.is(':checked')){
        div_extra_item.removeClass('selected');
        selected_checkbox.attr('checked', false);
    }else{
        div_extra_item.addClass('selected');
        selected_checkbox.attr('checked', true);
    }
    selected_checkbox.trigger('change');
});

// click link xuong deal box
$('body').on('click', '.deal-item', function(){
    let div_deal_box = $('.deal-box');
    if(!div_deal_box.length) return;
    $('html, body').animate({
        scrollTop: div_deal_box.offset().top - 20
    }, 300);
})

/** Responsive Combo */
function responsiveCombo(){
    width  = $(window).width();
    let div_combo_box =  $('.combo-box');
    if(div_combo_box.length == 0) return;
    let div_product_list = div_combo_box.find('.combo-product-list');
    // console.log('respon', div_product_list);
    if(width > 510){
        div_product_list.owlCarousel({
            loop:false,
            margin: 5,
            nav:true,
            items:3,
            autoplay: false,
            nav: true,
            dots: false,
            // autoWidth: true,
            // smartSpeed: 500,
            mouseDrag: true,
            pullDrag: true,
            touchDrag: true,
            onInitialized: function(event){
                div_combo_box.show();
            }
        });
    }else{
        product_list = div_product_list.find('.combo-product-item');
        div_product_list.empty();
        $.each(product_list, function(index, item){
            if(index % 2 == 0 ){
                group = `<div class="combo-product-group">`;
            }
            group = group + `<div class="combo-product-item">${$(item).html()}</div>`;

            if(index % 2 > 0 || index == product_list.length - 1 ){
                group += '</div>';
                div_product_list.append(group);
            }
        });
        div_product_list.owlCarousel({
            //  $('.deal-product-extra-list').owlCarousel({
            loop:false,
            margin: 5,
            nav:true,
            items:1,
            autoplay: false,
            nav: true,
            dots: false,
            // smartSpeed: 500,
            mouseDrag: true,
            pullDrag: true,
            touchDrag: true,
            onInitialized: function(event){
                div_combo_box.show();
            }
        });
    }
}

function responsiveDeal(){
    width  = $(window).width();
    let div_deal_box =  $('.deal-box');
    if(div_deal_box.length == 0) return;
    div_extra_list = $('.deal-product-extra-list');
    if(width > 510){
        div_extra_list.addClass('owl-carousel');
        div_extra_list.owlCarousel({
        // $('.deal-product-extra-list .owl-carousel').owlCarousel({
            loop:false,
            margin:20 ,
            nav:true,
            items:4,
            autoplay: false,
            autoWidth: false,
            nav: true,
            dots: false,
            // smartSpeed: 500,
            // mouseDrag: true,
            pullDrag: true,
            touchDrag: true,
            onInitialized: function(event){
                div_deal_box.show();
            }
        });
    }else{
        let div_deal_product = div_deal_box.find('.deal-product');
        div_deal_product.append(div_extra_list.html());
        div_extra_list.remove();
        div_deal_product.addClass('owl-carousel');
        div_deal_product.owlCarousel({
            loop:false,
            margin:10 ,
            nav:true,
            items:2,
            autoplay: false,
            autoWidth: false,
            nav: true,
            dots: false,
            // smartSpeed: 500,
            // mouseDrag: true,
            pullDrag: true,
            touchDrag: true,
            onInitialized: function(event){
                div_deal_box.find('.owl-item:has(.deal-product-plus)').addClass('deal-product-plus');
                div_deal_box.show();
            }
        });
    }
}

responsiveCombo();
responsiveDeal();