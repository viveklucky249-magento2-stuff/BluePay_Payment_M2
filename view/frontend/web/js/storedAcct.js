require(["jquery"], function($){
    $(document).ready(function() {
    	showHidePaymentFields();
    	var paymentType = '';

    	$('#payment_type').change(function() {
    		showHidePaymentFields();
    	});

    	$('#stored_acct').change(function() {
    		if ($(this).val() == '') {
                if ($('#expiration_month').get(0)) $('#expiration_month').get(0).selectedIndex = 0;
                if ($('#expiration_year').get(0)) $('#expiration_year').get(0).selectedIndex = 0;
                if ($('#cc_number')) $('#cc_number').val('');
                if ($('#echeck_acct_type').get(0)) $('#echeck_acct_type').get(0).selectedIndex = 0;
                if ($('#echeck_acct_number')) $('#echeck_acct_number').val('');
                if ($('#echeck_routing_number')) $('#echeck_routing_number').val('');
                if ($('#payment_type')) $('#payment_type').prop("disabled", false);
                return;
            }
            $('#payment_type').prop("disabled", true);
            $('#stored_acct_cb').prop("disabled", true);
            if (!$(this).find("option:selected").text().split('-')[1].match("eCheck")) {
                $("#payment_type").val('CC');
                $("#cc_number").val($(this).find("option:selected").text().substring(0, $(this).find("option:selected").text().indexOf('-')));
                $("#expiration_month").val($(this).find("option:selected").text().split('[')[1].split('/')[0]);
                $("#expiration_year").val($(this).find("option:selected").text().split('[')[1].split('/')[1].split([']'])[0]);
              	if ($('#echeck_acct_type').get(0)) $('#echeck_acct_type').get(0).selectedIndex = 0;
               	if ($('#echeck_acct_number')) $('#echeck_acct_number').val('');
                if ($('#echeck_routing_number')) $('#echeck_routing_number').val('');
            } else {
            	$("#payment_type").val('ACH');
                $("#echeck_acct_type").val($(this).find("option:selected").text().split(':')[0]);
                $("#echeck_acct_number").val($(this).find("option:selected").text().split('-')[0].split(':')[2]);
                $("#echeck_routing_number").val($(this).find("option:selected").text().split(':')[1]);
                $("#cc_number").val('');
               	if ($('#expiration_month').get(0)) $('#expiration_month').get(0).selectedIndex = 0;
                if ($('#expiration_year').get(0)) $('#expiration_year').get(0).selectedIndex = 0;
                if ($('#cc_number')) $('#cc_number').val('');
            }
            showHidePaymentFields();
    	});

    	$('#submitBtn').click(function() {
    		if ($('#payment_type') && $('#payment_type').prop("disabled", true)) $('#payment_type').prop("disabled", false);
			$.ajax({ 
        		url: $('#storeUrl').val() + 'payment/customer/request',
        		data: $('#form').serialize(),
        		//contentType: "application/json",
        		dataType: "json",
        		type: 'POST',
        		success: function (result) { 
        			console.log((result));
        			window.location.href = [location.protocol, '//', location.host, location.pathname].join('') + "?result=" + result["result"] + "&message=" + result["message"];
        		},
                error: function (error, errorThrown) {
                	console.log(error.responseText);  
                },
                done: function(data) {
                	console.log(data);
                }
    		});
    		if ($('#payment_type')) $('#payment_type').prop("disabled", false);
    		return false;
		});

		function showHidePaymentFields() {
    		if ($("#payment_type").val() == 'ACH') {
        		$("#cc").hide();
        		$("#echeck").show();
    		} else {
    			$("#echeck").hide();
        		$("#cc").show();
    	}
}
	});
});