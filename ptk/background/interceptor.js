/* Author: Kwok Wing Hong */

import { ptk_logger, ptk_utils, ptk_storage } from "./utils.js"

const worker = self
let storedDetails = null
let blackList = []
let allowOther = false
let resourceList = ["main_frame", "sub_frame", "stylesheet", "script", "image", "font", "object", "xmlhttprequest", "ping", "csp_report", "media", "websocket"]

export class ptk_interceptor {

    constructor(settings) {
        this.allow_main_frame = settings.allow_main_frame
        this.allow_sub_frame = settings.allow_sub_frame
        this.allow_stylesheet = settings.allow_stylesheet
        this.allow_script = settings.allow_script
        this.allow_image = settings.allow_image
        this.allow_font = settings.allow_font
        this.allow_object = settings.allow_object
        this.allow_xmlhttprequest = settings.allow_xmlhttprequest
        this.allow_ping = settings.allow_ping
        this.allow_csp_report = settings.allow_csp_report
        this.allow_media = settings.allow_media
        this.allow_websocket = settings.allow_websocket
        this.allow_other = settings.allow_other

        this.enableInterceptor = false
        this.enableListener = false
        this.record = []
        this.listener = null
        this.storageKey = "ptk_interceptor"
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

        if (message.channel == "ptk_popup2background_interceptor") {
            if (this["msg_" + message.type]) {
                return this["msg_" + message.type](message)
            }
            return Promise.resolve()
        }
    }

    async msg_init(message) {
        blackList = []
        this.makeBlackList()
        return Promise.resolve(Object.assign({"interceptorEnabled": this.enableInterceptor, "record": this.record}, worker.ptk_app.proxy.activeTab))
    }

    msg_request_record(message){
        return Promise.resolve({"record" : this.record[message.content]})
    }

    msg_clear_all(message) {
        this.record = []
        browser.runtime.sendMessage({ channel: "ptk_background2popup_interceptor", type: "record_cleared"})
        return Promise.resolve({})
    }

    msg_export_result(message){
        return Promise.resolve({"record" : this.record})
    }

    async msg_toggle_listener(message){
        if (this.enableListener == false) {
            this.enableListener = true
            this.listener = setInterval(() => {
                if (storedDetails != null) {
                    this.record.push(storedDetails)
                    try {
                        browser.runtime.sendMessage({ channel: "ptk_background2popup_interceptor", type: "record_added", content: storedDetails, index: this.record.length - 1})
                    } catch (e) {
                    }
                    storedDetails = null
                }
            }, 1);
        } else {
            this.enableListener = false
            clearInterval(this.listener);
            storedDetails = null
        }
    }

    makeBlackList() {
        if (this.allow_main_frame == false) {
            blackList.push("main_frame")
        }
        if (this.allow_sub_frame == false) {
            blackList.push("sub_frame")
        }
        if (this.allow_stylesheet == false) {
            blackList.push("stylesheet")
        }
        if (this.allow_script == false) {
            blackList.push("script")
        }
        if (this.allow_image == false) {
            blackList.push("image")
        }
        if (this.allow_font == false) {
            blackList.push("font")
        }
        if (this.allow_object == false) {
            blackList.push("object")
        }
        if (this.allow_xmlhttprequest == false) {
            blackList.push("xmlhttprequest")
        }
        if (this.allow_ping == false) {
            blackList.push("ping")
        }
        if (this.allow_csp_report == false) {
            blackList.push("csp_report")
        }
        if (this.allow_media == false) {
            blackList.push("media")
        }
        if (this.allow_websocket == false) {
            blackList.push("websocket")
        }
        if (this.allow_allow_other == false) {
            allowOther = false
        }

        return
    }

    blockRequests(requestDetails) {
        if (resourceList.includes(requestDetails.type)) {
            if (blackList.includes(requestDetails.type)) {
                storedDetails = requestDetails;
                return { cancel: true };
            } else {
                return { cancel: false };
            }
        } else if (allowOther == false) {
            storedDetails = requestDetails;
            return { cancel: true };
        } else {
            return { cancel: false };
        }
    }

    async msg_toggle_interceptor(message) {
        blackList = []
        this.makeBlackList()

        if (this.enableInterceptor == false) {
            this.enableInterceptor = true
            browser.webRequest.onBeforeRequest.addListener(
                this.blockRequests,
                { urls: ["<all_urls>"] },
                ["blocking"]
            );
            console.log('interceptor enabled')
            browser.runtime.sendMessage({ channel: "ptk_background2popup_interceptor", type: "enable_interceptor"})
        } else {
            this.enableInterceptor = false
            browser.webRequest.onBeforeRequest.removeListener(this.blockRequests);
            browser.runtime.sendMessage({ channel: "ptk_background2popup_interceptor", type: "disable_interceptor"})
            console.log('interceptor disabled')
        }
        return Promise.resolve()
    }
}