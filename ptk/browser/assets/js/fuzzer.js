/* Author: Kwok Wing Hong */

import { ptk_controller_fuzzer } from "../../../controller/fuzzer.js"

const controller = new ptk_controller_fuzzer()

jQuery(function () {

    controller.dt = []

    controller.init().then(function (result) {
        if (result.allowedTypes[0] == true) {
            $('#allow_upper').prop('checked', true);
        }
        if (result.allowedTypes[1] == true) {
            $('#allow_lower').prop('checked', true);
        }
        if (result.allowedTypes[2] == true) {
            $('#allow_number').prop('checked', true);
        }
        if (result.allowedTypes[3] == true) {
            $('#allow_symbol').prop('checked', true);
        }
        if (result.allowedTypes[4] == true) {
            $('#allow_greek').prop('checked', true);
        }
        if (result.allowedTypes[5] == true) {
            $('#allow_notprintable').prop('checked', true);
        }
        bindInfo(result)
    }).catch(e => console.log(e))

    $(document).on('click', "#start_fuzz", function (e) {
        fuzz()
    })

    $(document).on('change', '#allow_upper', function (e) { 
        controller.toggle_allow(0).then(function (result) {
        })
    })
    $(document).on('change', '#allow_lower', function (e) { 
        controller.toggle_allow(1).then(function (result) {
        })
    })
    $(document).on('change', '#allow_number', function (e) { 
        controller.toggle_allow(2).then(function (result) {
        })
    })
    $(document).on('change', '#allow_symbol', function (e) { 
        controller.toggle_allow(3).then(function (result) {
        })
    })
    $(document).on('change', '#allow_greek', function (e) { 
        controller.toggle_allow(4).then(function (result) {
        })
    })
    $(document).on('change', '#allow_notprintable', function (e) { 
        controller.toggle_allow(5).then(function (result) {
        })
    })
})

async function bindInfo(result) {
    if (controller.url) {
        $('#dashboard_message_text').text(controller.url)
    } else {
        browser.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            let activeTab = tabs[0];
            $('#dashboard_message_text').text(activeTab.url)
        });
    }
}

function fuzz() {
    let allow_upper = false
    let allow_lower = false
    let allow_number = false
    let allow_symbol = false
    let allow_greek = false
    let allow_notprintable = false

    let letterList = ""
    if (document.getElementById('allow_upper').checked == true) {
        allow_upper = true
    }
    if (document.getElementById('allow_lower').checked == true) {
        allow_lower = true
    }
    if (document.getElementById('allow_number').checked == true) {
        allow_number = true
    }
    if (document.getElementById('allow_symbol').checked == true) {
        allow_symbol = true
    }
    if (document.getElementById('allow_greek').checked == true) {
        allow_greek = true
    }
    if (document.getElementById('allow_notprintable').checked == true) {
        allow_notprintable = true
    }
    
    const code = `
    function makeLetterList(allow_upper, allow_lower, allow_number, allow_symbol, allow_greek, allow_notprintable) {
        let letterList = ""
        if (allow_upper == true) {
            letterList = letterList + "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
        }
        if (allow_lower == true) {
            letterList = letterList + "abcdefghijklmnopqrstuvwxyz"
        }
        if (allow_number == true) {
            letterList = letterList + "0123456789"
        }
        if (allow_symbol == true) {
            letterList = letterList + "=~!@#$%^&*()_-+=[]{}\\';:'<>?,./" + '"'
        }
        if (allow_greek == true) {
            letterList = letterList + "ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ"
        }
        if (allow_notprintable == true) {
            letterList = letterList + "\u0000\u0001\u0002\u0003\u0004\u0005\u0006\u0007\u0008\u0009\u0010\u0011\u0012\u0013\u0014\u0015\u0016\u0017\u0018\u0019"
        }

        return letterList;
    }

    function randomString(length, letterList) {
        let result = '';
        for (let i = 0; i < length; i++) {
            result += letterList.charAt(Math.floor(Math.random() * letterList.length));
        }
        return result;
    }

    function randomNumber(length) {
        let result = '';
        for (let i = 0; i < length; i++) {
            result += Math.floor(Math.random() * 10).toString();
        }
        return result;
    }

    function fuzzForm(allow_upper, allow_lower, allow_number, allow_symbol, allow_greek, allow_notprintable) {

        const letterList = makeLetterList(allow_upper, allow_lower, allow_number, allow_symbol, allow_greek, allow_notprintable);
        const inputs = document.querySelectorAll('input');
        inputs.forEach(input => {
            if (input.type === 'text') {
                input.value = randomString(15, letterList);
            } else if (input.type === 'number') {
                input.value = randomNumber(5);
            } else if (input.type === 'email') {
                if (allow_symbol == true) {
                    input.value = randomString(8, letterList) + "@" + "example.com";
                } else {
                    input.value = randomString(20, letterList);
                }
            } else if (input.type === 'password') {
                input.value = randomString(15, letterList);
            }
        });
        const textareas = document.querySelectorAll('textarea');
        textareas.forEach(textarea => {
            textarea.value = randomString(50, letterList);
        });

        const selects = document.querySelectorAll('select');
            selects.forEach(select => {
                const options = select.options;
                    if (options.length > 0) {
                    select.selectedIndex = Math.floor(Math.random() * options.length);
                }
            });
        }

        fuzzForm(${allow_upper}, ${allow_lower}, ${allow_number}, ${allow_symbol}, ${allow_greek}, ${allow_notprintable});
      `;

    browser.tabs.executeScript({ code: code });
}