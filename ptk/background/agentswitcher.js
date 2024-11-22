/* Author: Kwok Wing Hong */

import { ptk_logger, ptk_utils, ptk_storage } from "./utils.js"

const worker = self
let activeAgent = ""

export class ptk_agentswitcher {
    constructor() {
        this.enableAgentSwitcher = false
        this.agentPreset = "Your custom agent"
        this.agentCustom = ""

        this.storageKey = "ptk_agentswitcher"
        this.storage = ptk_storage.getItem(this.storageKey)
        this.addMessageListiners()
    }

    addMessageListiners() {
        this.onMessage = this.onMessage.bind(this)
        browser.runtime.onMessage.addListener(this.onMessage)
    }

    onMessage(message, sender, sendResponse) {
        if (!ptk_utils.isTrustedOrigin(sender))
            return Promise.reject({ success: false, error: 'Error origin value' })

        if (message.channel == "ptk_popup2background_agentswitcher") {
            if (this["msg_" + message.type]) {
                return this["msg_" + message.type](message)
            }
            return Promise.resolve()
        }
    }

    async msg_init(message) {
        return Promise.resolve(Object.assign({"enableAgentSwitcher": this.enableAgentSwitcher, "agentPreset": this.agentPreset, "agentCustom": this.agentCustom}, worker.ptk_app.proxy.activeTab))
    }

    msg_update_agentPreset(message){
        if (message.content == "Your custom agent") {
            activeAgent = this.agentCustom 
        } else {
            activeAgent = message.content
        }
        this.agentPreset = message.content
        return Promise.resolve()
    }

    msg_update_agentCustom(message){
        if (this.agentCustom  == "Your custom agent") {
            activeAgent = message.content 
        } 
        this.agentCustom = message.content
        //browser.runtime.sendMessage({ channel: "ptk_background2popup_agentswitcher", type: "agentCustom_updated"})
        return Promise.resolve()
    }

    modifyUserAgent(e) {
        e.requestHeaders.forEach(header => {
            if (header.name.toLowerCase() === "user-agent") {
                header.value = activeAgent;
            }
        });
        return { requestHeaders: e.requestHeaders };
    }

    async msg_toggle_agentSwitcher(message) {
        if (this.enableAgentSwitcher == false) {
            this.enableAgentSwitcher = true
            console.log('agent switcher enabled')
            browser.webRequest.onBeforeSendHeaders.addListener(
                this.modifyUserAgent,
                { urls: ["<all_urls>"] },
                ["blocking", "requestHeaders"]
            );
        } else {
            this.enableAgentSwitcher = false
            browser.webRequest.onBeforeRequest.removeListener(this.modifyUserAgent);
            console.log('agent switcher disabled')
        }

        return Promise.resolve()
    }
}