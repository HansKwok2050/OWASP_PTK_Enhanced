/* Author: Kwok Wing Hong */

import { ptk_controller_agentswitcher } from "../../../controller/agentswitcher.js"

const controller = new ptk_controller_agentswitcher()

jQuery(function () {

    controller.dt = []

    controller.init().then(function (result) {
        if (result.enableAgentSwitcher == true) {
            $('#enable_agentSwitcher').prop('checked', true);
        }
        bindInfo(result)
    })

    $(document).on('change', '#enable_agentSwitcher', function (e) { 
        if ($("#enable_agentSwitcher").is(':checked') == true) {// enable
            controller.toggle_agentSwitcher().then(function (result) {
            })
        } else {// disable
            controller.toggle_agentSwitcher().then(function (result) {
            })
        }
    })

    document.getElementById('agentPreset').addEventListener('change', (event) => {
        controller.update_agentPreset(event.target.value).then(function (result) {
        })
    });

    document.getElementById('agentCustom').addEventListener("input", function () {
        controller.update_agentCustom(document.getElementById('agentCustom').value).then(function (result) {
        })
    });
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

    document.getElementById('agentPreset').value = result.agentPreset;
    document.getElementById('agentCustom').value = result.agentCustom;
}

//browser.runtime.onMessage.addListener(function (message, sender, sendResponse) {
//    if (message.channel == "ptk_background2popup_agentswitcher") {
//        if (message.type == "agentCustom_updated") { 
//            document.getElementById('agentPreset').value = "Your custom agent"
//        } 
//    }
//})
