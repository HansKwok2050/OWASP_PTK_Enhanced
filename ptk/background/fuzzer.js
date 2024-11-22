/* Author: Kwok Wing Hong */

import { ptk_logger, ptk_utils, ptk_storage } from "./utils.js"

const worker = self

export class ptk_fuzzer {
    constructor() {
        this.allowedTypes = [true, true, true, false, false, false]

        this.storageKey = "ptk_fuzzer"
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

        if (message.channel == "ptk_popup2background_fuzzer") {
            if (this["msg_" + message.type]) {
                return this["msg_" + message.type](message)
            }
            return Promise.resolve()
        }
    }

    async msg_init(message) {
        return Promise.resolve(Object.assign({"allowedTypes": this.allowedTypes}, worker.ptk_app.proxy.activeTab))
    }

    async msg_toggle_allow(message) {
        this.allowedTypes[message.content] = !this.allowedTypes[message.content]
        return Promise.resolve()
    }
}