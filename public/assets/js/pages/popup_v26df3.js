$(document).ready(function () {

    $('body').on('click', '.popup-v2', function(e){
        let modal = $(this);
		modal.bPopup().close();
    });

    $('body').on('click', '.popup-v2 .popup-content', function(e){
        e.stopPropagation();
    });

    $('body').on('click', '[data-dismiss="popup"]', function (e) {
        e.preventDefault();
        let modal = $(this).closest('.popup-v2');
		modal.bPopup().close();
    });

    $('body').on('click', '.popup-v2 .popup-content .select-color-variant .color-item', function (e) {
        $(this).parent().find('.color-item').removeClass('selected');
        $(this).addClass('selected');
    });
});