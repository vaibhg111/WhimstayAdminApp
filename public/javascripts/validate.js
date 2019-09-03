$(function () {

    var baseUrl = globalUrl;

    $('#signin').click(function () {

        // var Pagel = document.getElementById("Pagel");
        // Pagel.innerHTML = "SignIn";
        //using code and api to check present in table or not


        // For mobile number field
        var mob = document.getElementById("mobile").value;
        if (mob == "") {
            document.getElementById("num").innerHTML = 'Please enter your mobile number';
            document.getElementById("mobile").focus();
            return false;
        }
        else {
            document.getElementById("num").innerHTML = "";
        }
        var r = 0;
        for (y = 0; y < mob.length; y++) {
            if ((mob.charCodeAt(y) >= 32 && mob.charCodeAt(y) <= 47) || (mob.charCodeAt(y) >= 58 && mob.charCodeAt(y) <= 255) || (mob.charCodeAt(y) >= 338 && mob.charCodeAt(y) <= 402) || (mob.charCodeAt(y) >= 8211 && mob.charCodeAt(y) <= 8482)) {
                r++;
            }
        }
        // if (r != 0) {
        //     document.getElementById("num").innerHTML = 'Please enter only numeric values in Mobile Number.';
        //     document.getElementById("mobile").focus();
        //     return false;
        // }

        // else {
        //     document.getElementById("num").innerHTML = "";
        // }

        if (mob.length > 12 || mob.length < 12) {
            document.getElementById("num").innerHTML = 'Mobile number should be of 10 digits';
            document.getElementById("mobile").focus();
            return false;
        }

        // var newurl = globalUrl;
        var mobile = mob.replace(/\D+/g, '');
        $('#msgVerify').empty();
        $('#mobileVerify').val('');

        $.ajax({
            type: 'GET',
            dataType: 'json',
            headers: {
                Authorization: localStorage.getItem('token') || '',
            },
            url: baseUrl + 'user/mobile/' + mobile,
            success: function (result) {
                console.log(result)
                document.getElementById("message-body").innerHTML = 'Account does not exists with this mobile : ' + mobile + '.<br>Please sign up!';
                $('#myModal-Verify').modal('hide');
                $('#gen-popup').modal('show');
                return false;
            },
            error: function (error) {
                console.log(error)
                $.ajax({
                    type: 'GET',
                    dataType: 'json',
                    headers: {
                        Authorization: localStorage.getItem('token') || '',
                    },
                    url: baseUrl + 'user/login/mobile/' + mobile + '/otp',
                    success: function (result) {
                        //console.log("OTP has sent your Mobile Number");
                    },
                    error: function (error) {

                        jsonValue = jQuery.parseJSON(error.responseText);
                        //console.log("error" + error.responseText);
                    }
                });
                $('#myModal-Verify').modal({ backdrop: 'static', keyboard: false }, 'show');
                // console.log("error" + error.responseText);
            }
        });
    });


    $('#otpVerify').click(function () {
        var otpCodeVerify = document.getElementById("mobileVerify").value;
        if (otpCodeVerify == "") {
            document.getElementById("msgVerify").innerHTML = 'Please enter the Whimstay verification code.';
            document.getElementById("mobileVerify").focus();
            return false;
        }
        else {
            document.getElementById("msgVerify").innerHTML = "";
        }


        var mobileno = document.getElementById("mobileNumber").value;
        var otpCode = document.getElementById("mobileVerify").value;

        var otpData = {
            'mobileno': mobileno,
            'otpCode': otpCode,
            'userType': 1
        }
        console.log(JSON.stringify(otpData));
        $.ajax({
            type: "POST",
            dataType: "json",
            headers: {
                app: 'admin',
                Authorization: localStorage.getItem('token') || '',
            },
            contentType: "application/json",
            data: JSON.stringify(otpData),
            url: baseUrl + "user/login/mobile/verify",
            success: function (result) {
                // alert(JSON.stringify(result));
                //sessionStorage.setItem('otpcode', otpCode);
                localStorage.setItem('token', result.token);
                document.getElementById('form_id').submit();
            },
            error: function (error) {
                console.log(error);
                document.getElementById("msgVerify").innerHTML = "Incorrect verification code entered.";
            }
        });
    });
});